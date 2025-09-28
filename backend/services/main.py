import os
import sys
from dotenv import load_dotenv
import uvicorn
import asyncio
from fastapi import FastAPI, Form, HTTPException, Response
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

# --- Ensure we can import the ADK agent package (gcp_agents_off_backend/adk_agents) ---
# We adjust sys.path so that 'adk_agents' resolves to the implementation in gcp_agents_off_backend
try:
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))  # .../backend/services
    BACKEND_DIR = os.path.dirname(CURRENT_DIR)                # .../backend
    REPO_ROOT = os.path.dirname(BACKEND_DIR)                  # .../google-agentic-ai
    ADK_ROOT = os.path.join(REPO_ROOT, "gcp_agents_off_backend")
    # Put ADK_ROOT at the front so its 'services' package is preferred over backend/services
    if ADK_ROOT not in sys.path:
        sys.path.insert(0, ADK_ROOT)
    if REPO_ROOT not in sys.path:
        sys.path.insert(0, REPO_ROOT)
except Exception:
    # Non-fatal; we'll handle ImportError later when we try to import the agent
    pass

# --- Load Environment Variables ---
# Make sure you have a .env file with your credentials
load_dotenv()

# --- Configuration ---
# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER") # Your Twilio WhatsApp number

# --- Import ADK Agent and minimal runner utilities ---
ADK_AVAILABLE = True
try:
    # Core agent and runner APIs
    from adk_agents.multi_tool_agent.agent import root_agent
    from google.adk.sessions import DatabaseSessionService
    from google.adk import Runner
    from google.genai import types
except Exception as e:
    ADK_AVAILABLE = False
    print("WARNING: ADK agent imports failed. Falling back to static response if invoked.")
    print(f"Details: {e}")

async def run_adk_agent(user_prompt: str, user_id: str, session_id: str, metadata: dict | None = None) -> str:
    """Run the ADK agent and return the final response text.

    This mirrors the lightweight logic used in gcp_agents_off_backend while avoiding heavy imports.
    """
    if not ADK_AVAILABLE:
        # Provide a clear fallback if ADK isn't available
        return "ADK agent is not available on this server. Please check dependencies and configuration."

    # Initialize a simple session DB (mirrors gcp_agents_off_backend default)
    database_url = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    ss = DatabaseSessionService(database_url)

    # Create or get the session
    session = await ss.get_session(app_name="agri_agent", user_id=user_id, session_id=session_id)
    if not session:
        session = await ss.create_session(app_name="agri_agent", user_id=user_id, session_id=session_id)

    # Build runner
    runner = Runner(agent=root_agent, app_name="agri_agent", session_service=ss)

    # Prepare prompt payload (the agent expects the dict stringified like in the other app)
    payload = metadata.copy() if metadata else {}
    payload["user_prompt"] = user_prompt
    content = types.Content(role="user", parts=[types.Part(text=str(payload))])

    # Stream events and capture the final response text
    final_text = ""
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        if event.is_final_response():
            final_text = "".join(part.text for part in event.content.parts)
            break

    return final_text or "Sorry, I couldn't generate a response right now. Please try again."

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Kisan WhatsApp Agent",
    description="Receives WhatsApp messages via Twilio, routes them to the in-app ADK Agent, and replies.",
    version="1.0.0"
)

# --- Twilio Client Initialization ---
def get_twilio_client():
    """Initialize and return the Twilio client, raising an exception if credentials are missing."""
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
        raise Exception("Twilio credentials are not fully configured in the .env file.")
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# --- API Endpoints ---

@app.get("/", tags=["Status"])
async def root():
    """Root endpoint to check if the server is online."""
    return {"status": "online", "message": "Kisan WhatsApp Agent is running."}

@app.post("/whatsapp", tags=["Webhook"])
async def whatsapp_webhook(
    Body: str = Form(...),  # The text content of the incoming message
    From: str = Form(...)   # The sender's WhatsApp number (e.g., "whatsapp:+14155238886")
):
    """
    Twilio WhatsApp webhook: routes the incoming text to our in-app ADK Agent
    and replies with the agent's response.
    """
    print(f"Received message from {From}: '{Body}'")

    # Derive simple identifiers from the WhatsApp number
    user_id = From.replace("whatsapp:", "")
    session_id = f"whatsapp-{user_id}"

    # Provide fixed metadata consistent with the agent's expectations
    metadata = {
        "lat": 37.526194,
        "lon": -77.330009,
        "units": "metric",
        "farmer_id": "f001",
        "source": "whatsapp",
    }

    try:
        # 1) Immediately acknowledge the user so they know we're processing
        ack_text = "please wait while we get your response"
        twilio_client = get_twilio_client()
        twilio_client.messages.create(
            from_=f"whatsapp:{TWILIO_PHONE_NUMBER}",
            body=ack_text,
            to=From
        )

        # 2) Process and reply in the background to keep webhook fast
        asyncio.create_task(_process_and_send_agent_reply(
            user_text=Body,
            from_number=From,
            user_id=user_id,
            session_id=session_id,
            metadata=metadata
        ))

    except TwilioException as e:
        print(f"Twilio Error when sending ack: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Twilio service error: {str(e)}")
    except Exception as e:
        print(f"An unexpected error occurred during ack or scheduling: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

    # Twilio requires a response to its webhook request. Return promptly.
    return Response(status_code=204)


# --- Helper utilities for chunked sends and async processing ---
def _chunk_text(text: str, limit: int = 1600) -> list[str]:
    """Split text into chunks not exceeding 'limit' characters.
    Prefers splitting at double newlines, newlines, sentence ends, or spaces.
    """
    if not text:
        return [""]
    chunks = []
    remaining = text.strip()
    while len(remaining) > limit:
        cut = remaining[:limit]
        # Try nicer split points, in order
        split_points = [
            cut.rfind("\n\n"),
            cut.rfind("\n"),
            cut.rfind(". "),
            cut.rfind(" "),
        ]
        idx = max(p for p in split_points if p != -1)
        if idx <= 0:
            idx = limit  # hard cut
        chunk = remaining[:idx].rstrip()
        chunks.append(chunk)
        remaining = remaining[idx:].lstrip()
    if remaining:
        chunks.append(remaining)
    return chunks


def _send_chunked_message(client: Client, from_number: str, to_number: str, body: str, limit: int = 1600) -> None:
    """Send 'body' split into <= limit char chunks via Twilio WhatsApp."""
    for part in _chunk_text(body, limit=limit):
        client.messages.create(
            from_=from_number,
            body=part,
            to=to_number
        )


async def _process_and_send_agent_reply(user_text: str, from_number: str, user_id: str, session_id: str, metadata: dict) -> None:
    """Run the ADK agent and send the (possibly long) response in chunked messages."""
    try:
        reply_text = await run_adk_agent(user_prompt=user_text, user_id=user_id, session_id=session_id, metadata=metadata)
        if not reply_text:
            reply_text = "Sorry, I couldn't generate a response right now. Please try again."

        client = get_twilio_client()
        _send_chunked_message(
            client=client,
            from_number=f"whatsapp:{TWILIO_PHONE_NUMBER}",
            to_number=from_number,
            body=reply_text,
            limit=1600,
        )
        print(f"Successfully sent agent reply to {from_number}")
    except Exception as e:
        print(f"Error in background processing/sending: {e}")


# --- Run the Server ---
if __name__ == "__main__":
    print("Starting Kisan WhatsApp Agent server on http://0.0.0.0:3000")
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)