import requests

# Test both endpoints
def test_send_text_json():
    """Test the JSON-based /send-text endpoint"""
    url = "http://localhost:3000/send-text"
    
    payload = {
        "phone_number": "+917020744317",  # Replace with your test number
        "message": "Hello! This is a test message from JSON endpoint."
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"JSON Endpoint - Status Code: {response.status_code}")
        print(f"JSON Endpoint - Response: {response.json()}")
        
    except Exception as e:
        print(f"JSON Endpoint Error: {e}")
        if 'response' in locals():
            print(f"Response text: {response.text}")

def test_send_text_form():
    """Test the form-based /send-text-form endpoint"""
    url = "http://localhost:3000/send-text-form"
    
    data = {
        "phone_number": "+917020744317",  # Replace with your test number
        "message": "Hello! This is a test message from form endpoint."
    }
    
    try:
        response = requests.post(url, data=data)
        print(f"Form Endpoint - Status Code: {response.status_code}")
        print(f"Form Endpoint - Response: {response.json()}")
        
    except Exception as e:
        print(f"Form Endpoint Error: {e}")
        if 'response' in locals():
            print(f"Response text: {response.text}")

if __name__ == "__main__":
    print("Testing JSON endpoint:")
    test_send_text_json()
    print("\n" + "="*50 + "\n")
    print("Testing Form endpoint:")
    test_send_text_form()