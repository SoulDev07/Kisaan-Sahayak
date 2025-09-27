# Audio Integration for V2 Backend

This document describes the integration of text-to-speech functionality into the V2 backend to provide both text and audio responses.

## Overview

The V2 backend now supports:
- **Text-to-Speech**: Converts AI responses to audio using Google Cloud Text-to-Speech API
- **Multi-language Support**: Supports English, Hindi, and other Indian languages
- **Audio Agent Endpoint**: New `/audio_agent` endpoint that returns both text and audio responses

## New Files Added

### 1. `services/text_to_speech.py`
- Text-to-speech conversion using Google Cloud TTS API
- Language detection and voice configuration
- Support for multiple Indian languages
- Audio cleaning for better speech quality

### 2. `test_audio_integration.py`
- Test script to verify audio functionality
- Tests text-to-speech and agent response generation

## Modified Files

### 1. `adk_agents/multi_tool_agent/agent.py`
- Added `generate_response_with_audio()` function
- Integrated text-to-speech service
- Added new tool to agent tools list

### 2. `main.py`
- Added `/audio_agent` endpoint
- Added `agent_endpoint_with_audio()` function
- Enhanced response handling to include audio data

### 3. `requirements.txt`
- Added `google-cloud-texttospeech` dependency

### 4. `google-agentic-ai/MyApp/screens/LiveVoiceScreen.jsx`
- Updated to use new `/audio_agent` endpoint
- Updated response field mapping
- Enhanced audio playback functionality

## API Endpoints

### `/audio_agent` (POST)
**Request:**
- `audio_file`: Audio file (multipart/form-data)
- `user_id`: User identifier
- `session_id`: Session identifier
- `metadata`: Optional metadata (JSON string)

**Response:**
```json
{
  "invoked_tool": "tool_name",
  "tool_result": "tool_result",
  "response_text": "AI response text",
  "audio": "base64_encoded_audio",
  "transcribed_text": "original_audio_transcription",
  "detected_language": "language_code"
}
```

### `/agent_with_audio` (POST)
**Request:**
```json
{
  "user_prompt": "user question",
  "metadata": {},
  "user_id": "user_id",
  "session_id": "session_id"
}
```

**Response:**
```json
{
  "invoked_tool": "tool_name",
  "tool_result": "tool_result",
  "response_text": "AI response text",
  "audio": "base64_encoded_audio"
}
```

## Supported Languages

The text-to-speech service supports:
- **English (en-IN)**: Indian English with male voice
- **Hindi (hi-IN)**: Hindi with female voice
- **Marathi (mr-IN)**: Marathi with female voice
- **Punjabi (pa-IN)**: Punjabi with female voice
- **Tamil (ta-IN)**: Tamil with female voice
- **Telugu (te-IN)**: Telugu with female voice
- **Bengali (bn-IN)**: Bengali with female voice
- **Gujarati (gu-IN)**: Gujarati with female voice
- **Kannada (kn-IN)**: Kannada with female voice
- **Malayalam (ml-IN)**: Malayalam with female voice

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Google Cloud Setup:**
   - Ensure Google Cloud credentials are properly configured
   - Enable Text-to-Speech API in Google Cloud Console
   - Set up service account with appropriate permissions

3. **Environment Variables:**
   - Set `GOOGLE_APPLICATION_CREDENTIALS` to your service account key file path

4. **Test the Integration:**
   ```bash
   python test_audio_integration.py
   ```

## Frontend Integration

The React Native app (`LiveVoiceScreen.jsx`) has been updated to:
- Use the new `/audio_agent` endpoint
- Handle both text and audio responses
- Provide audio playback controls
- Support mute/unmute functionality
- Display conversation history with audio replay

## Key Features

1. **Automatic Language Detection**: Detects the language of AI responses and uses appropriate voice
2. **Audio Cleaning**: Removes markdown formatting and special characters for better speech quality
3. **Fallback Audio Generation**: If tools don't provide audio, generates it from text response
4. **Multi-language Support**: Supports all major Indian languages
5. **Error Handling**: Graceful handling of TTS failures

## Troubleshooting

### Common Issues:

1. **Audio Not Playing:**
   - Check if audio base64 data is received
   - Verify audio format (MP3)
   - Check device audio settings

2. **TTS Service Errors:**
   - Verify Google Cloud credentials
   - Check Text-to-Speech API is enabled
   - Ensure service account has proper permissions

3. **Language Detection Issues:**
   - Check if text contains mixed languages
   - Verify language codes are supported

### Testing:

Run the test script to verify functionality:
```bash
python test_audio_integration.py
```

## Future Enhancements

1. **Voice Selection**: Allow users to choose preferred voice
2. **Audio Quality**: Support for different audio qualities
3. **Caching**: Cache generated audio for better performance
4. **Streaming**: Real-time audio streaming for long responses
5. **Custom Voices**: Support for custom voice models 
 
## Rate-limit handling (2025-09-25)

The backend now detects quota/rate-limit errors (RESOURCE_EXHAUSTED / HTTP 429) coming from the Gemini/Generative API and will:

- Retry the agent run a few times using the model's suggested retry delay when provided (e.g. "Please retry in 27s").
- Use exponential backoff when no retry delay is available.
- If retries are exhausted, the backend returns HTTP 429 with a JSON detail object containing `retry_after_seconds` when known. Frontends should inspect the status code and the `detail` object and either show a user-friendly "service busy" message or retry after the suggested delay.

Frontend changes in the app implement polite client-side retry and user messaging for 429 responses. Adjust `max_attempts` and backoff strategy in `gcp_agents_off_backend/main.py` if you want different behavior.