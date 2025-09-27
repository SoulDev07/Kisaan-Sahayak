#!/usr/bin/env python3
"""
Test script for suicide prevention router
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"  # Update with your actual backend URL

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/suicide-prevention/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_helplines():
    """Test the get helplines endpoint"""
    print("\nTesting get helplines endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/suicide-prevention/helplines")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        return response.status_code == 200 and data.get("success")
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_emergency_call():
    """Test the emergency call endpoint with Bland.ai"""
    print("\nTesting emergency call endpoint with Bland.ai...")
    try:
        # Test with your working configuration
        payload = {
            "phone_number": "+917020744317",  # Your working phone number
            "recipient_name": "Emergency Services",
            "message": "Test emergency call"
        }
        response = requests.post(
            f"{BASE_URL}/suicide-prevention/emergency-call",
            json=payload
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=== Suicide Prevention Router Tests ===\n")
    
    tests = [
        ("Health Check", test_health_check),
        ("Get Helplines", test_get_helplines),
        ("Emergency Call", test_emergency_call),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"Running {test_name}...")
        result = test_func()
        results.append((test_name, result))
        print(f"{test_name}: {'✅ PASS' if result else '❌ FAIL'}\n")
    
    # Summary
    print("=== Test Summary ===")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed. Check the output above.")

if __name__ == "__main__":
    main() 