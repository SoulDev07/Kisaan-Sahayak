# Suicide Prevention Integration

This document describes the integration of suicide prevention functionality with Bland.ai for emergency calls.

## Overview

The suicide prevention feature provides:
- Emergency call initiation through Bland.ai
- Helpline information and direct calling
- Backend API endpoints for integration
- Frontend service for React Native app

## Backend Implementation

### Router: `routers/suicide_prevention.py`

**Endpoints:**
- `POST /suicide-prevention/emergency-call` - Initiate emergency call via Bland.ai
- `GET /suicide-prevention/helplines` - Get list of helpline numbers
- `GET /suicide-prevention/health` - Health check endpoint

### Configuration

The router uses environment variables for Bland.ai configuration (see `BLAND_AI_SETUP.md` for setup instructions):

- **Bland.ai API URL**: `https://api.bland.ai/v1/calls`
- **Bland.ai API Key**: Set via `BLAND_API_KEY` environment variable
- **Phone Number**: Set via `BLAND_PHONE_NUMBER` environment variable
- **Pathway ID**: Set via `BLAND_PATHWAY_ID` environment variable

**Default values** (fallback if environment variables not set):
- API Key: `org_c2f0830f6ad5370f7564f9ea31aaf486b207e8d6d94eab7f0e3962b3e6955a8e18c7e3b0c596201778ef69`
- Phone Number: `+917020744317`
- Pathway ID: `889ab039-29c9-4270-971c-e49fb1c27334`

### Request Format

```json
{
  "phone_number": "+917020744317",  // Fixed working phone number
  "recipient_name": "Optional Name",
  "message": "Optional custom message"
}
```

**Note:** The backend uses a fixed phone number and pathway ID that are known to work with Bland.ai.

### Response Format

```json
{
  "success": true,
  "message": "Emergency call initiated successfully",
  "call_id": "vapi_call_id_here",
  "error": null
}
```

## Frontend Implementation

### Service: `services/SuicidePreventionService.js`

**Key Methods:**
- `initiateEmergencyCall(phoneNumber, recipientName, message)` - Make API call to backend
- `getHelplines()` - Fetch helpline data from backend
- `healthCheck()` - Check service connectivity
- `handleEmergencyCall(phoneNumber, recipientName)` - Complete call flow with UI feedback

### Screen: `screens/SuicidePrevention.jsx`

**Features:**
- Black and greenish theme
- Service status indicator
- Loading states for API calls
- Fallback to direct calling if backend fails
- Emergency call button integration

## Network Configuration

The service uses `NetworkConfig` for:
- Dynamic IP address management
- Fallback URL support
- Connection testing
- Error handling

**Default URLs:**
- Primary: `http://10.215.221.37:8000`
- Fallbacks: Multiple IP addresses for redundancy

## Testing

### Backend Testing

Run the test script:
```bash
cd backend/backend
python test_suicide_prevention.py
```

### Frontend Testing

1. Start the backend server
2. Update IP address in `NetworkConfig.js` if needed
3. Test the emergency call button in the app
4. Check service status indicator

## Integration Steps

1. **Backend Setup:**
   - Ensure the router is included in `main.py`
   - Verify VAPI credentials are correct
   - Test endpoints with the test script

2. **Frontend Setup:**
   - Import the service in the screen
   - Update NetworkConfig with correct IP
   - Test emergency call functionality

3. **Network Configuration:**
   - Update `NetworkConfig.js` with your backend IP
   - Test connectivity with multiple fallback URLs
   - Ensure CORS is properly configured

## Error Handling

The integration includes comprehensive error handling:
- Network timeouts
- API failures
- Fallback to direct calling
- User-friendly error messages
- Loading states and indicators

## Security Considerations

- **Environment Variables**: Bland.ai credentials are stored in environment variables (not hardcoded)
- **API Key Protection**: API keys are loaded from `.env` files (not committed to version control)
- **Phone Number Validation**: Phone numbers are validated before API calls
- **Response Sanitization**: API responses are sanitized to prevent information leakage
- **Error Handling**: Error messages don't expose sensitive information
- **Configuration Management**: See `BLAND_AI_SETUP.md` for proper configuration setup

## Troubleshooting

### Common Issues

1. **Connection Failed:**
   - Check backend server is running
   - Verify IP address in NetworkConfig
   - Test with fallback URLs

2. **VAPI Call Fails:**
   - Verify API credentials
   - Check phone number format (E.164)
   - Review VAPI logs

3. **Frontend Not Responding:**
   - Check service status indicator
   - Verify NetworkConfig settings
   - Test with direct calling fallback

### Debug Steps

1. Run backend test script
2. Check NetworkConfig connectivity
3. Test individual API endpoints
4. Verify frontend service integration
5. Check console logs for errors

## Future Enhancements

- Add call history tracking
- Implement call scheduling
- Add multiple language support
- Integrate with emergency services APIs
- Add call analytics and reporting 