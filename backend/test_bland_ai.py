#!/usr/bin/env python3
"""
Test script for Bland.ai integration
"""

import requests
from config import BLAND_API_URL, BLAND_API_KEY, BLAND_PATHWAY_ID, BLAND_PHONE_NUMBER

def start_bland_call(phone_number: str, pathway_id: str):
    if not phone_number or not pathway_id:
        return {"error": "Missing phone_number or pathway_id"}

    payload = {
        "phone_number": phone_number,
        "pathway_id": pathway_id
    }

    headers = {
        "authorization": BLAND_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(BLAND_API_URL, json=payload, headers=headers)
        return {
            "status_code": response.status_code,
            "response": response.json()
        }
    except Exception as e:
        return {"error": str(e)}

def main():
    """Test Bland.ai integration"""
    print("=== Testing Bland.ai Integration ===\n")
    
    # Use environment variables
    phone = BLAND_PHONE_NUMBER
    pathway = BLAND_PATHWAY_ID
    
    print(f"Phone Number: {phone}")
    print(f"Pathway ID: {pathway}")
    print(f"API Key: {BLAND_API_KEY[:20]}...")
    print("\nMaking call...")
    
    result = start_bland_call(phone, pathway)
    
    print(f"\nResult: {result}")
    
    if "error" in result:
        print("❌ Error occurred")
    elif result["status_code"] in [200, 201]:
        print("✅ Call initiated successfully!")
    else:
        print(f"⚠️ Unexpected status code: {result['status_code']}")

if __name__ == "__main__":
    main() 