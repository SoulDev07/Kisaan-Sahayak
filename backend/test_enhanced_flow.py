#!/usr/bin/env python3
"""
Test script for enhanced document generation flow with user input
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_enhanced_document_generation():
    """Test document generation with user input fields"""
    
    # Test data with user input fields
    test_data = {
        "farmer_id": "f001",
        "scheme_name": "PM-KISAN",
        "phone_number": "+917020744317",
        "farmer_data": {
            # Auto-filled from profile
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
            
            # User input fields (required)
            "crop_type": "Wheat",
            "sowing_date": "15/11/2024"
        }
    }
    
    print("🧪 Testing Enhanced Document Generation Flow")
    print("=" * 50)
    
    # Test URLs
    test_urls = [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://10.123.4.245:8000"
    ]
    
    for base_url in test_urls:
        print(f"\n🎯 Testing: {base_url}")
        
        try:
            # Test health endpoint
            health_url = f"{base_url}/document/health"
            health_response = requests.get(health_url, timeout=10)
            
            if health_response.status_code != 200:
                print(f"❌ Health check failed: {health_response.status_code}")
                continue
                
            print("✅ Health check passed")
            
            # Test document generation with user input
            doc_url = f"{base_url}/document/generate-pdf"
            print(f"📄 Testing document generation with user input...")
            
            response = requests.post(
                doc_url,
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=60  # Longer timeout for AI processing
            )
            
            print(f"📊 Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Document generation successful!")
                print(f"📋 Result: {result}")
                
                # Check if PDF was created
                if 'pdf_path' in result:
                    print(f"📁 PDF saved at: {result['pdf_path']}")
                    
                    # Check if file exists
                    if os.path.exists(result['pdf_path']):
                        file_size = os.path.getsize(result['pdf_path'])
                        print(f"📏 File size: {file_size} bytes")
                    else:
                        print("⚠️  PDF file not found at specified path")
                
                return True
                
            else:
                print(f"❌ Error: {response.status_code}")
                try:
                    error_text = response.text
                    print(f"📝 Error details: {error_text}")
                except:
                    print("Could not read error details")
                    
        except requests.exceptions.ConnectionError:
            print(f"❌ Connection failed to {base_url}")
        except requests.exceptions.Timeout:
            print(f"❌ Timeout for {base_url}")
        except Exception as e:
            print(f"❌ Error testing {base_url}: {e}")
    
    return False

def test_missing_user_input():
    """Test validation of required user input fields"""
    
    # Test data without user input fields
    test_data_missing = {
        "farmer_id": "f001",
        "scheme_name": "PM-KISAN",
        "phone_number": "+917020744317",
        "farmer_data": {
            # Auto-filled from profile only
            "name": "Vinayak Bhatia",
            "phoneNumber": "+91 98765 43210",
            "village": "Shirur, Maharashtra",
            "farmSize": "5 acres",
            # Missing: crop_type, sowing_date
        }
    }
    
    print("\n🧪 Testing Missing User Input Validation")
    print("=" * 40)
    
    base_url = "http://localhost:8000"
    
    try:
        doc_url = f"{base_url}/document/generate-pdf"
        print(f"📄 Testing with missing user input...")
        
        response = requests.post(
            doc_url,
            json=test_data_missing,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 422:  # Validation error
            print("✅ Validation working correctly - rejected missing fields")
            return True
        elif response.status_code == 200:
            print("⚠️  Document generated without required fields")
            return False
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing validation: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Enhanced Document Generation Flow Test")
    print("=" * 60)
    
    # Test the enhanced flow
    success = test_enhanced_document_generation()
    
    if success:
        print("\n🎉 Enhanced flow test passed!")
        
        # Test validation
        validation_success = test_missing_user_input()
        
        if validation_success:
            print("✅ Validation test passed!")
        else:
            print("⚠️  Validation test needs attention")
    else:
        print("\n❌ Enhanced flow test failed!")
        print("Please check:")
        print("1. Backend server is running")
        print("2. Environment variables are set")
        print("3. Dependencies are installed") 