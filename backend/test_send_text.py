import requests
import json

# Test the send-text endpoint
def test_send_text():
    url = "http://localhost:3000/send-text"
    
    # Correct JSON payload format
    payload = {
        "phone_number": "+917020744317",  # Replace with your test number
        "message": "Hello! This is a test message from the Kisan WhatsApp Service."
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
    except Exception as e:
        print(f"Error: {e}")
        if 'response' in locals():
            print(f"Response text: {response.text}")

if __name__ == "__main__":
    test_send_text()