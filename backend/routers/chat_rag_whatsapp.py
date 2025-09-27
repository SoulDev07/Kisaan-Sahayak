from fastapi import APIRouter, HTTPException, Request, Response
from services.chat_rag_whatsapp import process_whatsapp_message
from services.speech_to_text import transcribe_audio
import requests
import os
from pydantic import BaseModel
from typing import Optional
from twilio.twiml.messaging_response import MessagingResponse

router = APIRouter()

class WhatsAppMessage(BaseModel):
    From: str
    Body: str
    ProfileName: Optional[str] = None
    WaId: Optional[str] = None
    SmsMessageSid: Optional[str] = None
    NumMedia: Optional[str] = "0"
    MediaUrl0: Optional[str] = None
    MediaContentType0: Optional[str] = None

@router.post("/chat/rag/whatsapp")
async def whatsapp_webhook(request: Request):
    SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'vinayak', 'creds_gcp.json')

    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(SERVICE_ACCOUNT_PATH)

    try:
        print(request)
        # Twilio sends form data, not JSON
        form_data = await request.form()
        form_dict = dict(form_data)
        
        message_body = form_dict.get("Body", "")
        media_url = form_dict.get("MediaUrl0")

        if media_url:
            # Download the media file
            media_response = requests.get(media_url, headers={"Authorization": f"Basic U0thNWE5NGU4NzFkZTg4MTBkODE3MDg1MzViNGIwY2Y0MzpNTzBMcngzbm1QUkhhNFZMSUJEbnRuSTZJYzVMdGF6cg=="})
            media_response.raise_for_status()
            
            # Save the media file temporarily
            temp_file_path = "temp_audio.ogg"
            with open(temp_file_path, "wb") as f:
                f.write(media_response.content)
            
            # Transcribe the audio file
            transcript, _ = transcribe_audio(temp_file_path)
            
            # Clean up the temporary file
            os.remove(temp_file_path)

            print(transcript)
            
            if transcript:
                message_body = transcript

        # Process the WhatsApp message
        response = process_whatsapp_message(
            from_number=form_dict.get("From", ""),
            message_body=message_body,
            profile_name=form_dict.get("ProfileName", ""),
            wa_id=form_dict.get("WaId", ""),
            num_media=form_dict.get("NumMedia", "0"),
            media_url=media_url,
            media_content_type=form_dict.get("MediaContentType0", None)
        )
        
        # Return TwiML response
        return Response(content=response, media_type="application/xml")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
