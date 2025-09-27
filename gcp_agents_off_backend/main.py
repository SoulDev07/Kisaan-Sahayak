from google.adk.cli.fast_api import get_fast_api_app
from adk_agents.multi_tool_agent.agent import root_agent
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
from google.adk.sessions import DatabaseSessionService
from google.cloud import aiplatform
from google.adk.agents import Agent
from google.adk import Runner
from google.genai import types
from typing import Optional, Any, Dict
import re
import asyncio
from dotenv import load_dotenv
import os
import shutil
from services.speech_to_text import transcribe_audio
from config.setting import settings

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", settings.DATABASE_URL) or "sqlite:///./sql_app.db"

# Create FastAPI app
app = FastAPI(title="KisanKiAwaaz Backend", version="1.0.0")

# Add CORS middleware
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentRequest(BaseModel):
    user_prompt: str
    metadata: Optional[Dict[str, Any]] = None
    user_id: str
    session_id: str

@app.get("/")
async def root():
    return {"message": "KisanKiAwaaz Backend is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database_url": DATABASE_URL}

@app.post("/generate_audio")
async def generate_audio_endpoint(request: dict):
    """Simple endpoint to generate audio for any text"""
    try:
        text = request.get("text", "")
        language = request.get("language", None)
        
        if not text:
            return {"error": "Text is required"}
        
        print(f"🎵 Generating audio for text: {text[:100]}...")
        
        from services.text_to_speech import text_to_speech, detect_language
        
        if not language:
            language = detect_language(text)
        
        audio_base64 = text_to_speech(text, language)
        
        if audio_base64:
            return {
                "success": True,
                "audio": audio_base64,
                "language": language,
                "text_length": len(text)
            }
        else:
            return {
                "success": False,
                "error": "Failed to generate audio"
            }
            
    except Exception as e:
        print(f"❌ Error in generate_audio_endpoint: {e}")
        return {"error": f"Processing error: {str(e)}"}

@app.post("/audio_agent")
async def audio_agent_endpoint(
    audio_file: UploadFile = File(...),
    user_id: str = Form(...),
    session_id: str = Form(...),
    metadata: Optional[str] = Form(None)
):
    try:
        print(f"🎤 Received audio file: {audio_file.filename}")
        
        # Save the uploaded audio file temporarily
        temp_audio_path = f"temp_{audio_file.filename}"
        with open(temp_audio_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)

        print(f"📁 Saved audio to: {temp_audio_path}")

        # Transcribe the audio file to text
        transcribed_text, detected_language = transcribe_audio(temp_audio_path)
        
        print(f"🎵 Transcription result: {transcribed_text}")

        # Clean up the temporary file
        os.remove(temp_audio_path)

        if not transcribed_text:
            return {"error": "Could not transcribe audio"}

        # Prepare metadata with fixed location and temperature settings
        try:
            parsed_metadata = eval(metadata) if metadata else {}
        except:
            parsed_metadata = {}
            
        parsed_metadata.update({
            'lat': 37.526194,  # Fixed latitude
            'lon': -77.330009,  # Fixed longitude
            'units': 'metric',  # Always use Celsius for temperature
            'farmer_id': parsed_metadata.get('farmer_id', 'f001'),  # Default farmer_id if not provided
        })

        # Prepare the request for the existing agent endpoint
        agent_request = AgentRequest(
            user_prompt=transcribed_text,
            metadata=parsed_metadata,
            user_id=user_id,
            session_id=session_id
        )

        print(agent_request)

        # Call the existing agent endpoint with audio support (with retries for quota errors)
        result = await agent_endpoint_with_audio(agent_request)
        
        # Add the transcribed text to the result
        result["transcribed_text"] = transcribed_text
        result["detected_language"] = detected_language
        
        print(f"✅ Audio agent response: {result}")
        return result
        
    except Exception as e:
        print(f"❌ Error in audio_agent_endpoint: {e}")
        return {"error": f"Processing error: {str(e)}"}


@app.post("/agent")
async def agent_endpoint(request: AgentRequest):
    try:
        # Initialize or reuse session service
        ss = DatabaseSessionService(DATABASE_URL)
        prompt = request.metadata or {}
        prompt['user_prompt'] = request.user_prompt
        # Get or create session
        session = await ss.get_session(
            app_name="agri_agent",
            user_id=request.user_id,
            session_id=request.session_id
        )
        if not session:
            session = await ss.create_session(
                app_name="agri_agent",
                user_id=request.user_id,
                session_id=request.session_id
            )
        # Build runner
        runner = Runner(
            agent=root_agent,
            app_name="agri_agent",
            session_service=ss
        )

        print(f"Running agent with prompt: {prompt}")

        # Prepare user message
        content = types.Content(role="user", parts=[types.Part(text=str(prompt))])

        invoked_tool: Optional[str] = None
        tool_result: Any = None
        response_text: str = ""

        # Stream through events with retry handling for quota errors
        result_obj = await run_agent_with_retries(
            runner=runner,
            user_id=request.user_id,
            session_id=request.session_id,
            content=content,
        )
        invoked_tool = result_obj.get('invoked_tool')
        tool_result = result_obj.get('tool_result')
        response_text = result_obj.get('response_text', '')
        return {
            "invoked_tool": invoked_tool,
            "tool_result": tool_result,
            "response_text": response_text,
        }
    except Exception as e:
        print(f"❌ Error in agent_endpoint: {e}")
        return {"error": f"Processing error: {str(e)}"}

@app.post("/agent_with_audio")
async def agent_endpoint_with_audio(request: AgentRequest):
    try:
        # Initialize or reuse session service
        ss = DatabaseSessionService(DATABASE_URL)
        prompt = request.metadata or {}
        prompt['user_prompt'] = request.user_prompt
        # Get or create session
        session = await ss.get_session(
            app_name="agri_agent",
            user_id=request.user_id,
            session_id=request.session_id
        )
        if not session:
            session = await ss.create_session(
                app_name="agri_agent",
                user_id=request.user_id,
                session_id=request.session_id
            )
        # Build runner
        runner = Runner(
            agent=root_agent,
            app_name="agri_agent",
            session_service=ss
        )

        print(f"Running agent with prompt: {prompt}")

        # Prepare user message
        content = types.Content(role="user", parts=[types.Part(text=str(prompt))])

        invoked_tool: Optional[str] = None
        tool_result: Any = None
        response_text: str = ""
        audio_base64: str = ""

        # Stream through events with retry handling for quota errors
        result_obj = await run_agent_with_retries(
            runner=runner,
            user_id=request.user_id,
            session_id=request.session_id,
            content=content,
        )
        invoked_tool = result_obj.get('invoked_tool')
        tool_result = result_obj.get('tool_result')
        response_text = result_obj.get('response_text', '')
        audio_base64 = result_obj.get('audio_base64', '')
        
        # If no audio was generated by the tool, generate it from the response text
        if not audio_base64 and response_text:
            print(f"🎵 Generating audio for response text: {response_text[:100]}...")
            try:
                from services.text_to_speech import text_to_speech, detect_language
                detected_language = detect_language(response_text)
                print(f"🎵 Detected language: {detected_language}")
                audio_base64 = text_to_speech(response_text, detected_language)
                print(f"🎵 Generated audio length: {len(audio_base64) if audio_base64 else 0}")
            except Exception as e:
                print(f"❌ Error generating audio: {e}")
                audio_base64 = ""
        else:
            print(f"🎵 Audio from tool: {len(audio_base64) if audio_base64 else 0}")
        
        print(f"🎵 Final audio length: {len(audio_base64) if audio_base64 else 0}")
        
        return {
            "invoked_tool": invoked_tool,
            "tool_result": tool_result,
            "response_text": response_text,
            "audio": audio_base64,
        }
    except Exception as e:
        # If the helper raised an HTTPException, re-raise so FastAPI returns the proper status
        if isinstance(e, HTTPException):
            raise
        print(f"❌ Error in agent_endpoint_with_audio: {e}")
        return {"error": f"Processing error: {str(e)}"}


async def run_agent_with_retries(runner: Runner, user_id: str, session_id: str, content: Any, max_attempts: int = 3, base_backoff: float = 1.5):
    """Run the ADK runner and collect invoked tool, tool_result and response_text.
    Implements retry for RESOURCE_EXHAUSTED / quota errors using suggested retry delay when available.

    Returns a dict: {invoked_tool, tool_result, response_text, audio_base64}
    Raises HTTPException(status_code=429) when retries exhausted.
    """
    attempt = 0
    while attempt < max_attempts:
        attempt += 1
        try:
            invoked_tool = None
            tool_result = None
            response_text = ""
            audio_base64 = ""
            async for event in runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=content
            ):
                # Record tool invocation
                if getattr(event.content.parts[0], 'function_call', None):
                    invoked_tool = event.content.parts[0].function_call.name
                    continue
                # Capture tool response
                if getattr(event.content.parts[0], 'function_response', None):
                    tool_result = event.content.parts[0].function_response.response
                    if isinstance(tool_result, dict) and 'audio' in tool_result:
                        audio_base64 = tool_result.get('audio', '')
                # Capture final LLM response
                if event.is_final_response():
                    response_text = "".join(part.text for part in event.content.parts)
                    break
            return {
                'invoked_tool': invoked_tool,
                'tool_result': tool_result,
                'response_text': response_text,
                'audio_base64': audio_base64,
            }
        except Exception as e:
            msg = str(e)
            print(f"⚠️ Runner attempt {attempt} failed: {msg}")
            # Detect quota / resource exhausted errors
            if 'RESOURCE_EXHAUSTED' in msg or 'quota' in msg.lower() or 'QuotaFailure' in msg:
                # Try to extract suggested retry seconds from message
                m = re.search(r'Please retry in (\d+(?:\.\d+)?)s', msg)
                if not m:
                    # Try other formats like 'retryDelay': '27s' or 'RetryInfo.*(\d+)s'
                    m = re.search(r'retryDelay\W*\'?(\d+)s', msg)
                if m:
                    try:
                        wait_seconds = float(m.group(1))
                    except:
                        wait_seconds = base_backoff * (2 ** (attempt - 1))
                else:
                    wait_seconds = base_backoff * (2 ** (attempt - 1))

                # If we have attempts left, wait and retry
                if attempt < max_attempts:
                    print(f"⏳ Quota exhausted - waiting {wait_seconds:.1f}s before retry (attempt {attempt}/{max_attempts})")
                    await asyncio.sleep(wait_seconds)
                    continue
                else:
                    # No attempts left - raise HTTP 429 with Retry-After header via HTTPException
                    detail = {
                        'error': 'Quota exceeded for generative model requests',
                        'message': msg,
                        'retry_after_seconds': wait_seconds,
                    }
                    print(f"❌ Quota exhausted and retries exhausted. Failing with 429. Detail: {detail}")
                    raise HTTPException(status_code=429, detail=detail, headers={"Retry-After": str(wait_seconds)})
            # Non-quota error: if not last attempt, backoff and retry, else raise
            if attempt < max_attempts:
                backoff = base_backoff * (2 ** (attempt - 1))
                print(f"⏳ Non-quota error - backing off {backoff:.1f}s and retrying (attempt {attempt}/{max_attempts})")
                await asyncio.sleep(backoff)
                continue
            else:
                print(f"❌ Runner failed after {attempt} attempts: {msg}")
                raise
