#!/usr/bin/env python3
"""
Test script to verify backend endpoints are working
"""
import requests
import json
import base64

# Test configuration
BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_agent():
    """Test agent endpoint"""
    try:
        payload = {
            "user_prompt": "Hello, how are you?",
            "metadata": {"farmer_id": "f001"},
            "user_id": "f001",
            "session_id": "test_session"
        }
        response = requests.post(f"{BASE_URL}/agent", json=payload)
        print(f"✅ Agent endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Agent endpoint failed: {e}")
        return False

def test_audio_agent():
    """Test audio agent endpoint with a simple audio file"""
    try:
        # Create a simple test audio file (base64 encoded)
        test_audio_base64 = "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
        
        # Create form data
        files = {
            'audio_file': ('test.wav', base64.b64decode(test_audio_base64), 'audio/wav')
        }
        data = {
            'user_id': 'f001',
            'session_id': 'test_session',
            'metadata': json.dumps({"farmer_id": "f001"})
        }
        
        response = requests.post(f"{BASE_URL}/audio_agent", files=files, data=data)
        print(f"✅ Audio agent endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Audio agent endpoint failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing KisanKiAwaaz Backend...")
    print("=" * 50)
    
    # Test health endpoint
    if not test_health():
        print("❌ Backend is not running or not accessible")
        exit(1)
    
    # Test agent endpoint
    test_agent()
    
    # Test audio agent endpoint
    test_audio_agent()
    
    print("=" * 50)
    print("✅ Testing completed!") 