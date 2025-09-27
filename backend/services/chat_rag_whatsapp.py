import os
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
from services.chat_rag import generate_rag_response
import json
import requests
import base64
from typing import Optional, Dict, Any

# Twilio configuration
TWILIO_CONFIG = {
    "ACCOUNT_SID": os.environ.get("TWILIO_ACCOUNT_SID", "SKc238ea683f4666363e1074a602cb8165"),
    "AUTH_TOKEN": os.environ.get("TWILIO_AUTH_TOKEN", "SirkljLxEBhmKxF6RoIsudavpr9OEofL"),
    "PHONE_NUMBER": os.environ.get("TWILIO_PHONE_NUMBER", "whatsapp:+14155238886"),  # With WhatsApp: prefix
    "API_KEY": os.environ.get("TWILIO_API_KEY", "SKc238ea683f4666363e1074a602cb8165"),
    "API_SECRET": os.environ.get("TWILIO_API_SECRET", "SirkljLxEBhmKxF6RoIsudavpr9OEofL")
}

# Initialize Twilio client
client = Client(TWILIO_CONFIG["ACCOUNT_SID"], TWILIO_CONFIG["AUTH_TOKEN"])

# Chat history storage (in-memory for now, could be moved to database)
chat_histories = {}

def get_chat_history(phone_number: str) -> str:
    """
    Get chat history for a specific phone number.
    Returns JSON string of chat history.
    """
    if phone_number not in chat_histories:
        chat_histories[phone_number] = []
    
    # Return last 5 messages to limit context size
    return json.dumps(chat_histories[phone_number][-5:])

def update_chat_history(phone_number: str, user_message: str, bot_response: str) -> None:
    """
    Update chat history with new messages.
    """
    if phone_number not in chat_histories:
        chat_histories[phone_number] = []
    
    chat_histories[phone_number].append({"sender": "user", "content": user_message})
    chat_histories[phone_number].append({"sender": "bot", "content": bot_response})
    
    # Limit history size
    if len(chat_histories[phone_number]) > 10:
        chat_histories[phone_number] = chat_histories[phone_number][-10:]

def download_media(media_url: str, auth: tuple) -> Dict[str, Any]:
    """
    Download media from Twilio URL and prepare it for RAG processing.
    """
    try:
        response = requests.get(media_url, auth=auth)
        response.raise_for_status()
        
        content_type = response.headers.get('Content-Type', '')
        
        # Format as expected by chat_rag's image parameter
        image_data = {
            'uri': f"data:{content_type};base64,{base64.b64encode(response.content).decode('utf-8')}"
        }
        return image_data
    except Exception as e:
        print(f"Error downloading media: {e}")
        return None

def process_whatsapp_message(
    from_number: str,
    message_body: str,
    profile_name: Optional[str] = None,
    wa_id: Optional[str] = None,
    num_media: str = "0",
    media_url: Optional[str] = None,
    media_content_type: Optional[str] = None
) -> str:
    """
    Process a WhatsApp message using the RAG system and return a TwiML response.
    """
    # Prepare response
    resp = MessagingResponse()
    
    try:
        # Get chat history for this user
        chat_history = get_chat_history(from_number)
        
        # Handle media if present
        image = None
        if num_media and int(num_media) > 0 and media_url:
            # Download and process the media
            auth = (TWILIO_CONFIG["ACCOUNT_SID"], TWILIO_CONFIG["AUTH_TOKEN"])
            image = download_media(media_url, auth)
        
        # Generate response using existing chat RAG
        result = generate_rag_response(
            user_query=message_body,
            chat_history=chat_history,
            section="crops",  # Default section
            top_k=3,
            image=image
        )
        
        # Extract response content
        bot_response = result.get("response", "Sorry, I couldn't process your request.")
        
        # Update chat history
        update_chat_history(from_number, message_body, bot_response)
        
        # Add response to TwiML
        resp.message(bot_response)
        
    except Exception as e:
        # Handle errors gracefully
        error_msg = f"Sorry, an error occurred: {str(e)}"
        resp.message(error_msg)
    
    # Return TwiML as string
    return str(resp)

def send_whatsapp_message(to_number: str, message: str) -> None:
    """
    Send a WhatsApp message using Twilio API directly.
    This can be used for notifications or scheduled messages.
    """
    try:
        message = client.messages.create(
            body=message,
            from_=TWILIO_CONFIG["PHONE_NUMBER"],
            to=to_number
        )
        print(f"Message sent with SID: {message.sid}")
        return message.sid
    except Exception as e:
        print(f"Error sending WhatsApp message: {e}")
        return None 