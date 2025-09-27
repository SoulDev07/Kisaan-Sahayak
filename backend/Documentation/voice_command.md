# Voice Command Feature

## Overview
The Voice Command feature allows users to interact with the system using voice inputs in multiple Indian languages. It accepts an audio file, transcribes it to text using Google Cloud Speech-to-Text V2 API with Chirp 2 model, processes the text to provide appropriate responses and actions, and converts the response back to speech for a complete voice-based interaction.

## Components

### Router: `voice_command.py`
Handles HTTP endpoints for voice command processing:
- **POST `/voice-command/`**: Accepts audio file uploads, processes them, and returns appropriate responses with audio.

### Service Dependencies
- **Speech to Text Service**: Transcribes audio files to text using Google Cloud Speech-to-Text V2 API with Chirp 2 model, which provides superior language detection and transcription for Indian languages.
- **RAG Service**: Processes the transcribed text to generate contextual responses and determine actions.
- **Text to Speech Service**: Converts text responses back to speech using Google Cloud Text-to-Speech API with appropriate voice selection based on detected language.

## Detailed Route to Response Flow

1. **API Endpoint**: The `/voice-command/` endpoint accepts POST requests with an audio file uploaded as a form file.

2. **Request Validation**:
   - Verifies that the uploaded file has an audio MIME type (starts with "audio/").
   - Returns a 400 error if the file type is invalid.

3. **File Handling**:
   - Saves the uploaded audio file to a temporary location (`temp_{filename}`).
   - Uses a context manager to properly handle the file stream.

4. **Speech-to-Text Processing**:
   - Sets the Google Cloud credentials environment variable.
   - Calls `transcribe_audio()` from the speech_to_text service.
   - Receives both the transcribed text and detected language code.
   - If transcription fails (empty text), returns a 500 error.

5. **RAG Processing**:
   - Passes the transcribed text to `generate_rag_response()` function.
   - Uses a persistent `ConversationBufferMemory` to maintain context across requests.
   - Retrieves the response text and action from the RAG service.

6. **Language Detection**:
   - Calls `detect_language()` to identify the language of the response text.
   - This ensures the text-to-speech uses the appropriate voice.

7. **Text-to-Speech Conversion**:
   - Passes the response text and detected language to `text_to_speech()`.
   - Receives a base64-encoded audio string.

8. **Response Construction**:
   - Creates a `VoiceCommandResponse` object with:
     - `action`: The action determined by the RAG service (e.g., "weather", "soil_moisture").
     - `summary`: The text response to the user's query.
     - `transcribed_text`: The original voice command converted to text.
     - `audioSummary`: Base64-encoded audio of the response.

9. **Error Handling**:
   - Catches and re-raises HTTP exceptions.
   - Catches other exceptions, logs detailed error information, and returns a 500 error.

10. **Cleanup**:
    - Removes the temporary audio file in a finally block to ensure cleanup happens even if errors occur.

## Response Format
The endpoint returns a JSON object with the following fields:
- **action**: The determined action to take (e.g., "weather", "soil_moisture", etc.)
- **summary**: The text response to the user's query
- **transcribed_text**: The original voice command converted to text
- **audioSummary**: Base64-encoded audio of the response that can be played back to the user

## Technical Details
- Uses Google Cloud Speech-to-Text V2 API with Chirp 2 model for voice transcription
  - Provides superior language detection and transcription quality
  - Supports automatic language detection for Indian languages
  - Returns both transcribed text and detected language code
- Uses Google Cloud Text-to-Speech API for audio response generation
  - Supports multiple Indian languages including Hindi, English, Marathi, Punjabi, Tamil, Telugu, Bengali, Gujarati, Kannada, and Malayalam
  - Automatically selects appropriate voice based on detected language
  - Maps base language codes (e.g., "hi") to regional variants (e.g., "hi-IN") as needed
- Returns audio in MP3 format encoded as base64
- Maintains conversation context using ConversationBufferMemory

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

## Usage Example
```python
# Example of using the voice command API
import requests
import base64
import IPython.display as ipd

url = "https://api.kisankiawaaz.com/voice-command/"
files = {"file": open("voice_input.wav", "rb")}
response = requests.post(url, files=files)
result = response.json()

print(f"Action: {result['action']}")
print(f"Response: {result['summary']}")
print(f"Transcribed Text: {result['transcribed_text']}")

# Play the audio response
audio_data = base64.b64decode(result['audioSummary'])
with open("response.mp3", "wb") as f:
    f.write(audio_data)
    
# For Jupyter notebook, you can play the audio directly
ipd.Audio("response.mp3")
``` 