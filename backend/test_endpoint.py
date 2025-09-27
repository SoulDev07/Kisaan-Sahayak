#!/usr/bin/env python3
"""
Test script to verify the document generation endpoint
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_endpoint():
    """Test the document generation endpoint"""
    
    # Test data
    test_data = {
        "farmer_id": "f001",
        "scheme_name": "PM-KISAN",
        "phone_number": "+917020744317",
        "farmer_data": {
            "name": "Vinayak Bhatia",
            "father_name": "Suresh Sharma",
            "phoneNumber": "+91 98765 43210",
            "village": "Shirur, Maharashtra",
            "district": "Pune",
            "state": "Maharashtra",
            "pincode": "411046",
            "farmSize": "5 acres",
            "aadhaar_number": "1234-5678-9012",
            "bank_account": "SBI12345678901",
            "ifsc_code": "SBIN0001234",
            "crop_type": "Wheat",
            "sowing_date": "15/11/2024"
        }
    }
    
    # Test URLs
    test_urls = [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://10.123.4.245:8000"
    ]
    
    for base_url in test_urls:
        print(f"\n🧪 Testing endpoint: {base_url}")
        
        try:
            # Test health endpoint first
            health_url = f"{base_url}/document/health"
            print(f"Testing health endpoint: {health_url}")
            
            health_response = requests.get(health_url, timeout=10)
            if health_response.status_code == 200:
                print(f"✅ Health check passed: {health_response.json()}")
            else:
                print(f"❌ Health check failed: {health_response.status_code}")
                continue
            
            # Test document generation endpoint
            doc_url = f"{base_url}/document/generate-pdf"
            print(f"Testing document generation: {doc_url}")
            
            response = requests.post(
                doc_url,
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success: {result}")
                return True
            else:
                print(f"❌ Error: {response.status_code}")
                try:
                    error_text = response.text
                    print(f"Error details: {error_text}")
                except:
                    print("Could not read error details")
                    
        except requests.exceptions.ConnectionError:
            print(f"❌ Connection failed to {base_url}")
        except requests.exceptions.Timeout:
            print(f"❌ Timeout for {base_url}")
        except Exception as e:
            print(f"❌ Error testing {base_url}: {e}")
    
    return False

def test_backend_running():
    """Test if the backend is running"""
    print("🚀 Testing if backend is running...")
    
    test_urls = [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://10.123.4.245:8000"
    ]
    
    for url in test_urls:
        try:
            response = requests.get(f"{url}/", timeout=5)
            if response.status_code == 200:
                print(f"✅ Backend is running at: {url}")
                return url
        except:
            print(f"❌ Backend not accessible at: {url}")
    
    return None

if __name__ == "__main__":
    print("🔍 Document Generation Endpoint Test")
    print("=" * 50)
    
    # Check if backend is running
    backend_url = test_backend_running()
    
    if backend_url:
        print(f"\n🎯 Backend found at: {backend_url}")
        
        # Test the endpoint
        success = test_endpoint()
        
        if success:
            print("\n🎉 All tests passed!")
        else:
            print("\n❌ Endpoint test failed!")
    else:
        print("\n❌ Backend is not running!")
        print("Please start the backend server first:")
        print("cd KisanKiAwaaz-Backend/backend")
        print("uvicorn main:app --host 0.0.0.0 --port 8000") 