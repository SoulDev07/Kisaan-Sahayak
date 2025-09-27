# Speech to Text Feature

## Overview
The Speech to Text feature provides audio transcription capabilities for the application. It converts audio files into text format using Google Cloud Speech-to-Text V2 API with the Chirp 2 model, which provides superior language detection and transcription for Indian languages.

## Components

### Router: `speech_to_text.py`
Handles HTTP endpoints for direct speech-to-text transcription:
- **POST `/speech-to-text/`**: Accepts audio files and returns transcribed text along with detected language.

### Service: `speech_to_text.py`
Core functionality for audio transcription:
- **transcribe_audio()**: Transcribes audio files to text using Google Cloud Speech-to-Text V2 API with Chirp 2 model.
- **transcribe_audio_v2()**: Implementation of the V2 API with language detection.
- **create_or_get_recognizer()**: Creates or retrieves a Speech-to-Text recognizer for the project.

## API Response Format
The API returns a JSON object with the following fields:
```json
{
  "transcript": "The transcribed text from the audio file",
  "language": "The detected language code (e.g., 'hi-IN', 'en-IN')"
}
```

## Technical Details
- Uses Google Cloud Speech-to-Text V2 API with Chirp 2 model
- Supports automatic audio format detection
- Automatic language detection for Indian languages
- Maps base language codes (e.g., "hi") to regional variants (e.g., "hi-IN")
- Configurable language hints for improved accuracy

## Language Support
The system supports the following Indian languages:
- Hindi (hi-IN)
- English (en-IN)
- Marathi (mr-IN)
- Punjabi (pa-IN)
- Tamil (ta-IN)
- Telugu (te-IN)
- Bengali (bn-IN)
- Gujarati (gu-IN)
- Kannada (kn-IN)
- Malayalam (ml-IN)
- Oriya (or-IN)
- Sanskrit (sa-IN)
- Urdu (ur-IN)

## Integration Points
This service is integrated with:
1. Voice Command feature - for processing voice inputs
2. Any other features requiring speech transcription

## Usage Example
```python
# Direct service usage example
from services.speech_to_text import transcribe_audio

audio_file_path = "recording.wav"
transcribed_text, detected_language = transcribe_audio(audio_file_path)
print(f"Transcription: {transcribed_text}")
print(f"Detected Language: {detected_language}")
```

## API Usage Example
```python
import requests

url = "https://api.kisankiawaaz.com/speech-to-text/"
files = {"file": open("voice_input.wav", "rb")}
response = requests.post(url, files=files)
result = response.json()

print(f"Transcript: {result['transcript']}")
print(f"Detected Language: {result['language']}")
``` 