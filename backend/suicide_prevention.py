import requests
import json

# Vapi API endpoint for creating a call
url = "https://api.vapi.ai/call"

# Your Vapi API key
api_key = "fbe500a6-1d83-44b9-abd7-0f0cc32dc758"

# Request headers
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# Request body
payload = {
    "assistantId": "8e15c2e7-28e9-4c81-bf15-d129133aca1e",
    "customer": {
        "number": "‪+917020744317‬"  # Recipient's phone number in E.164 format (India)
    },
    "type": "outboundPhoneCall",
    "phoneNumber": {
        "twilioAccountSid": "AC305040fc3d3c6813dc9745239b324e4f",  # Replace with your Twilio Account SID
        "twilioAuthToken": "54b07181d8e516b4a2177488a2e973dc",  # Replace with your Twilio Auth Token
        "twilioPhoneNumber": "‪+19862022348‬"  # Replace with your Twilio number (e.g., +1234567890)
    }
}

try:
    # Make the POST request to Vapi API
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    # Check if the request was successful
    if response.status_code == 201:
        print("Call initiated successfully!")
        print("Response:", response.json())
    else:
        print(f"Failed to initiate call. Status code: {response.status_code}")
        print("Error:", response.text)

except Exception as e:
    print(f"An error occurred: {str(e)}")
