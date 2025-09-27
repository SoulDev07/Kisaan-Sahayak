from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
from services.speech_to_text import transcribe_audio
from pydantic import BaseModel

class TranscriptionResponse(BaseModel):
    transcript: str
    language: str = None

router = APIRouter(prefix="/speech-to-text", tags=["speech-to-text"])

@router.post("/", response_model=TranscriptionResponse)
async def speech_to_text(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")

    temp_file_path = f"temp_{file.filename}"
    
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Google Speech-to-Text API can handle .3gp files directly
        transcript, detected_language = transcribe_audio(temp_file_path)
        if not transcript:
            raise HTTPException(status_code=500, detail="Could not transcribe audio.")
        return TranscriptionResponse(transcript=transcript, language=detected_language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"🗑️ Cleaned up temp file: {temp_file_path}")
