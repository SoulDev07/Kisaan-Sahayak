# Voice Command API Testing Guide

## Overview
The Voice Command API endpoint (`/voice-command/`) processes audio files containing voice commands and returns structured responses with actions and summaries.

## Endpoint Details
- **URL**: `POST /voice-command/`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Uses Google Cloud credentials (`creds_gcp.json`)

## Request Format
```http
POST /voice-command/
Content-Type: multipart/form-data

file: [audio file]
```

## Response Format
```json
{
  "action": "string",
  "summary": "string"
}
```

### Possible Actions
- `capture_image` - When user wants to take/analyze images
- `soil_moisture` - For soil moisture related queries
- `weather` - For weather-related questions
- `profile` - For farmer profile information
- `cattle_management` - For livestock/cattle queries
- `chat` - For general conversation
- `do_nothing` - Default/fallback action

## Testing with Postman

### 1. Import the Collection
- Import the `FarmerApp.postman_collection.json` file
- The collection includes the "Voice Command" folder with pre-configured tests

### 2. Prepare Audio Files
Use the existing sample audio files in the project:
- `sample.wav` - Located in multiple directories
- `uploaded.wav` - Also available in various locations

### 3. Test Scenarios

#### Basic Voice Command Test
1. Open the "Process Voice Command" request
2. In the Body tab, select the `file` field
3. Upload a `.wav` file with speech content
4. Send the request
5. Verify the response contains `action` and `summary` fields

#### Example Voice Commands to Test
Record or use audio files with these phrases:

**Weather Queries:**
- "What's the weather like today?"
- "Will it rain tomorrow?"
- "Show me the weather forecast"

**Crop Management:**
- "How are my crops doing?"
- "Tell me about my wheat crop"
- "What should I plant next?"

**Livestock Queries:**
- "How is my cattle?"
- "Show me my livestock information"
- "Any issues with my animals?"

**General Farm Questions:**
- "Show me my farm profile"
- "What tasks do I have today?"
- "Check my market listings"

## Testing Flow

### 1. Prerequisites
- Ensure the FastAPI server is running on `http://192.168.0.111:8000`
- Verify Google Cloud credentials are properly configured
- Have sample audio files ready

### 2. Expected Responses

#### Success Response (200)
```json
{
  "action": "weather",
  "summary": "The weather today is sunny with a temperature of 25°C. Perfect conditions for farming activities."
}
```

#### Error Responses

**Invalid File Type (400)**
```json
{
  "detail": "Invalid file type. Please upload an audio file."
}
```

**Transcription Failed (500)**
```json
{
  "detail": "Could not transcribe audio."
}
```

### 3. Automated Tests
The Postman collection includes automated tests that verify:
- Status code is 200
- Response has required fields (`action`, `summary`)
- Action is one of the valid actions
- Summary is not empty

## Troubleshooting

### Common Issues

1. **File Upload Errors**
   - Ensure the audio file has proper MIME type (`audio/*`)
   - Check file size limitations
   - Verify file is not corrupted

2. **Transcription Failures**
   - Verify Google Cloud credentials are valid
   - Check audio quality and clarity
   - Ensure the audio contains speech in supported language (English)

3. **RAG Response Issues**
   - Check if the AI service is responding
   - Verify context data is available
   - Review any API key configurations

### Debug Steps

1. **Check Server Logs**
   ```bash
   # Look for transcription output and errors
   # The endpoint prints: "Transcribed text: {transcribed_text}"
   ```

2. **Test Speech-to-Text Separately**
   - Use the `/transcribe/` endpoint to test audio transcription only
   - This helps isolate if the issue is with transcription or RAG processing

3. **Test RAG Separately**
   - Use the `/generate-rag-response/` endpoint with text input
   - This tests the AI response generation without audio processing

## Integration with Other Endpoints

The voice command processing involves these services:
1. **Speech-to-Text** (`/transcribe/`) - Converts audio to text
2. **RAG Chat** (`/generate-rag-response/`) - Processes text and generates intelligent responses
3. **Context Services** - Farmer data, weather, market information

## Performance Considerations

- Audio file processing can take 2-10 seconds depending on file size
- Large audio files may timeout - keep recordings under 1 minute
- The RAG processing adds 1-3 seconds for context retrieval and AI generation

## Security Notes

- Audio files are temporarily stored and then deleted after processing
- Google Cloud credentials should be properly secured
- Consider rate limiting for production use

## Sample cURL Commands

```bash
# Test voice command
curl -X POST "http://192.168.0.111:8000/voice-command/" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample.wav"

# Test transcription only
curl -X POST "http://192.168.0.111:8000/transcribe/" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample.wav"
```

## Expected Workflow

1. **Audio Upload** → Voice command endpoint receives audio file
2. **Transcription** → Google Speech-to-Text converts audio to text
3. **Context Retrieval** → RAG system searches farmer database for relevant context
4. **AI Processing** → Gemini AI generates response with appropriate action
5. **Response** → Client receives structured action and summary

This comprehensive testing approach ensures the voice command functionality works correctly end-to-end.
