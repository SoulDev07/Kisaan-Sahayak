# WhatsApp Integration for Chat RAG System

## Overview
This document outlines the WhatsApp integration with our Chat RAG (Retrieval-Augmented Generation) system, allowing farmers to interact with our AI assistant directly through WhatsApp messaging.

## Components

### Router: `chat_rag_whatsapp.py`
Handles HTTP endpoints for WhatsApp webhook integration:
- **POST `/chat/rag/whatsapp`**: Accepts incoming WhatsApp messages from Twilio, processes them using the RAG system, and returns TwiML responses.

### Service: `chat_rag_whatsapp.py`
Implements the WhatsApp-specific processing functionality:
- **process_whatsapp_message()**: Main function that processes incoming WhatsApp messages and returns TwiML responses.
- **download_media()**: Handles image attachments from WhatsApp messages.
- **get_chat_history()**: Retrieves chat history for a specific phone number.
- **update_chat_history()**: Updates chat history with new messages.
- **send_whatsapp_message()**: Utility function for sending direct WhatsApp messages.

## Technical Details
- Leverages existing chat RAG system for message processing
- Uses Twilio WhatsApp API for messaging
- Supports both text and image messages
- Maintains conversation history per user
- Returns TwiML responses for Twilio

## Configuration

### Environment Variables
Add these variables to your `.env` file:
```
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=whatsapp:+1234567890
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
```

### Required Dependencies
- `twilio`: For WhatsApp messaging capabilities
- All dependencies of the base chat RAG system

## Setup Instructions

### 1. Twilio Account Setup
1. Create a Twilio account at [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Navigate to the Twilio Console Dashboard
3. Note your Account SID and Auth Token (found on the dashboard)
4. For API Key and Secret:
   - Go to "Account > API keys & tokens"
   - Create a new API key
   - Save the API Key and Secret

### 2. WhatsApp Sandbox Setup
1. In Twilio Console, go to "Messaging > Try it out > Send a WhatsApp message"
2. Follow the instructions to join your sandbox:
   - Send the given code to the Twilio number (+1 415 523 8886)
   - Once connected, you can test the sandbox

### 3. Webhook Configuration
1. In Twilio Console, go to "Messaging > Settings > WhatsApp Sandbox Settings"
2. Set the "WHEN A MESSAGE COMES IN" webhook URL to your API endpoint:
   ```
   https://your-domain.com/chat/rag/whatsapp
   ```
3. Ensure HTTP POST is selected as the method

### 4. Making Your API Publicly Accessible

#### Option 1: Production Deployment
1. Deploy your FastAPI app to a cloud provider (AWS, Azure, GCP, etc.)
2. Configure your domain and HTTPS
3. Use the production URL for your Twilio webhook

#### Option 2: Local Development with Ngrok
1. Install ngrok: `pip install pyngrok` or download from [ngrok.com](https://ngrok.com)
2. Run your FastAPI server: `uvicorn main:app --reload`
3. In another terminal, run: `ngrok http 8000`
4. Copy the HTTPS URL provided by ngrok
5. Use this URL plus your endpoint path for your Twilio webhook:
   ```
   https://your-ngrok-url.ngrok.io/chat/rag/whatsapp
   ```

### 5. WhatsApp Business API (Production)
For production use with higher message volumes:
1. Apply for WhatsApp Business API through Twilio
2. Follow Twilio's approval process
3. Update configuration to use your approved WhatsApp Business number

## Usage Examples

### Sending a Message Programmatically
```python
from services.chat_rag_whatsapp import send_whatsapp_message

# Send a notification to a farmer
send_whatsapp_message(
    to_number="whatsapp:+919876543210",
    message="Your crops might need water today based on soil moisture data."
)
```

### Handling Incoming Messages
The system automatically processes incoming messages through the webhook.

## Testing
1. Send a text message to your Twilio WhatsApp sandbox number
2. The message will be processed by your `/chat/rag/whatsapp` endpoint
3. The RAG system will generate a response
4. The response will be sent back to your WhatsApp

## Troubleshooting

### Common Issues
1. **Message not being delivered**:
   - Verify Twilio credentials
   - Check webhook URL configuration
   - Ensure user has opted in to your sandbox

2. **Error responses**:
   - Check FastAPI logs for errors
   - Verify the format of TwiML responses
   - Check for rate limiting issues with Twilio

3. **Media handling issues**:
   - Ensure proper authentication for media downloads
   - Check media URL access permissions
   - Verify content type handling

### Debugging Tools
- Use Twilio Console logs to check message delivery status
- Monitor FastAPI logs for request processing
- Test endpoint directly using Postman or curl

## Limitations
- WhatsApp sandbox has messaging limitations (24-hour session windows)
- Image quality may be reduced during transmission
- Business API approval required for production use
- Audio and document attachments not currently supported

## Future Enhancements
1. Support for audio message processing
2. Document attachment handling
3. Integration with scheduled notifications
4. WhatsApp template messages for important alerts
5. Multi-language automatic detection and response
6. Integration with farmer profile management 