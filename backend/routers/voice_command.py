from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import shutil
import os
from services.chat_rag import generate_rag_response
from services.speech_to_text import transcribe_audio
from services.text_to_speech import text_to_speech, detect_language

router = APIRouter()

SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'vinayak', 'creds_gcp.json')

# Global memory instance to persist conversation across requests
from langchain.memory import ConversationBufferMemory
VOICE_MEMORY = ConversationBufferMemory(return_messages=True)

class VoiceCommandResponse(BaseModel):
    action: str
    summary: str
    transcribed_text: str = ""
    audioSummary: str = ""  # Added audioSummary field

@router.post("/voice-command/", response_model=VoiceCommandResponse)
async def handle_voice_command(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}, content_type: {file.content_type}, size: {file.size}")
    
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(SERVICE_ACCOUNT_PATH)
    if not file.content_type.startswith("audio/"):
        print(f"❌ Invalid content type: {file.content_type}")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")

    temp_file_path = f"temp_{file.filename}"
    
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        print(f"� Starting transcription for: {temp_file_path}")
        # Google Speech-to-Text API can handle .3gp files directly
        transcribed_text, detected_language_code = transcribe_audio(temp_file_path)
        if not transcribed_text:
            print("⚠️ Transcription returned empty text - user might not have spoken")
            # Instead of throwing an error, return a helpful message
            helpful_message = "I didn't hear anything. Please try speaking again or check if your microphone is working properly."
            
            # Convert the helpful message to speech
            audio_base64 = text_to_speech(helpful_message, "en")
            
            return VoiceCommandResponse(
                action="do_nothing",
                summary=helpful_message,
                transcribed_text="",
                audioSummary=audio_base64
            )
        
        print(f"✅ Transcribed text: {transcribed_text}")
        print(f"✅ Detected language: {detected_language_code}")
        
        print(f"🤖 Starting RAG response generation with persistent memory...")
        rag_response = generate_rag_response(
            user_query=transcribed_text,
            memory=VOICE_MEMORY  # Use persistent memory across requests
        )
        print(f"✅ RAG response: {rag_response}")
        
        # Get the text response
        response_text = rag_response.get("response", "")
        
        # Detect language from the response text
        detected_language = detect_language(response_text)
        print(f"🔍 Detected language: {detected_language}")
        
        # Convert response to speech
        print(f"🔊 Converting response to speech...")
        audio_base64 = text_to_speech(response_text, detected_language)
        print(f"✅ Speech conversion complete. Audio size: {len(audio_base64)} bytes")
        
        return VoiceCommandResponse(
            action=rag_response.get("action", "do_nothing"),
            summary=response_text,
            transcribed_text=transcribed_text,
            audioSummary=audio_base64  # Base64 encoded audio
        )
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"❌ Unexpected error in voice command processing: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        # Clean up temporary files
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"🗑️ Cleaned up temp file: {temp_file_path}")
