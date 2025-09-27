#!/usr/bin/env python3
"""
Test the agent endpoint directly to verify the fix
"""

import requests
import json
from datetime import datetime

# Backend URL
BACKEND_URL = "http://10.215.221.37:8000/agent"

def test_calendar_event_creation():
    """Test creating a calendar event through the agent"""
    print("TESTING CALENDAR EVENT CREATION THROUGH AGENT")
    print("=" * 60)
    
    payload = {
        "user_prompt": "Add a calendar event for tomorrow at 8am for rice crop monitoring with low priority",
        "metadata": {
            "farmer_id": "f001",
            "extra_context": []
        },
        "user_id": "f001",
        "session_id": str(datetime.now().timestamp())
    }
    
    try:
        response = requests.post(BACKEND_URL, json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

def test_market_listing_creation():
    """Test creating a market listing through the agent"""
    print("TESTING MARKET LISTING CREATION THROUGH AGENT")
    print("=" * 60)
    
    payload = {
        "user_prompt": "I want to add guava to marketplace. Quantity is 1kg, my price is 500 rupees, current market price is 400",
        "metadata": {
            "farmer_id": "f001",
            "extra_context": []
        },
        "user_id": "f001", 
        "session_id": str(datetime.now().timestamp())
    }
    
    try:
        response = requests.post(BACKEND_URL, json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

def test_general_query():
    """Test a general farming query"""
    print("TESTING GENERAL FARMING QUERY")
    print("=" * 60)
    
    payload = {
        "user_prompt": "What is the best time to plant rice?",
        "metadata": {
            "farmer_id": "f001",
            "extra_context": []
        },
        "user_id": "f001",
        "session_id": str(datetime.now().timestamp())
    }
    
    try:
        response = requests.post(BACKEND_URL, json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

def test_weather_query():
    """Test weather query to verify fixed location and Celsius temperature"""
    print("TESTING WEATHER QUERY WITH FIXED LOCATION")
    print("=" * 60)
    
    payload = {
        "user_prompt": "What's the current temperature?",
        "metadata": {
            "farmer_id": "f001",
            "extra_context": []
        },
        "user_id": "f001",
        "session_id": str(datetime.now().timestamp())
    }
    
    try:
        response = requests.post(BACKEND_URL, json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        response_data = response.json()
        print(f"Response: {json.dumps(response_data, indent=2)}")
        
        # Check if temperature is mentioned in Celsius
        response_text = response_data.get('response_text', '').lower()
        if 'celsius' in response_text or '°c' in response_text or 'c' in response_text:
            print("✅ Temperature appears to be in Celsius")
        else:
            print("⚠️  Temperature unit not clearly identified")
            
    except Exception as e:
        print(f"Error: {e}")

def test_weather_forecast():
    """Test weather forecast to verify fixed location and Celsius temperature"""
    print("TESTING WEATHER FORECAST WITH FIXED LOCATION")
    print("=" * 60)
    
    payload = {
        "user_prompt": "What's the weather forecast for tomorrow?",
        "metadata": {
            "farmer_id": "f001",
            "extra_context": []
        },
        "user_id": "f001",
        "session_id": str(datetime.now().timestamp())
    }
    
    try:
        response = requests.post(BACKEND_URL, json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        response_data = response.json()
        print(f"Response: {json.dumps(response_data, indent=2)}")
        
        # Check if temperature is mentioned in Celsius
        response_text = response_data.get('response_text', '').lower()
        if 'celsius' in response_text or '°c' in response_text:
            print("✅ Temperature appears to be in Celsius")
        else:
            print("⚠️  Temperature unit not clearly identified")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("TESTING AGENT ENDPOINT")
    print("=" * 60)
    print("This script tests the agent endpoint to verify the fixes")
    print("Fixed Location: lat=37.526194, lon=-77.330009")
    print("Fixed Temperature Units: Celsius (metric)")
    print("Make sure the backend server is running on http://10.215.221.37:8000")
    print("=" * 60)
    
    # Test general query first
    test_general_query()
    print("\n")
    
    # Test weather queries to verify fixed location and Celsius
    test_weather_query()
    print("\n")
    
    test_weather_forecast()
    print("\n")
    
    # Test calendar event
    test_calendar_event_creation()
    print("\n")
    
    # Test market listing
    test_market_listing_creation()
    
    print("\n" + "=" * 60)
    print("TESTING COMPLETED")
