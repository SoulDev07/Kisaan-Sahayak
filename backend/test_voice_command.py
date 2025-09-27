#!/usr/bin/env python3
"""
Quick test script for Voice Command API
Run this script to test the voice command endpoint with sample audio files
"""

import requests
import os
import json
import base64
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
VOICE_COMMAND_ENDPOINT = f"{BASE_URL}/voice-command/"
TRANSCRIBE_ENDPOINT = f"{BASE_URL}/speech-to-text/"
RAG_ENDPOINT = f"{BASE_URL}/chat/rag"

def find_sample_audio():
    """Find available sample audio files in the project"""
    current_dir = Path(__file__).parent
    possible_paths = [
        current_dir / "sample.wav",
        current_dir / "uploaded.wav",
        current_dir / "routers" / "sample.wav",
        current_dir / "routers" / "uploaded.wav",
        current_dir / ".." / "vinayak" / "sample.wav",
        current_dir / ".." / "vinayak" / "uploaded.wav",
        current_dir / ".." / "vinayak" / "speech-to-text" / "test_audio.wav",
    ]
    
    for path in possible_paths:
        if path.exists():
            return str(path)
    
    print("❌ No sample audio files found!")
    print("Please ensure you have sample.wav or uploaded.wav in one of these locations:")
    for path in possible_paths:
        print(f"  - {path}")
    return None

def test_voice_command(audio_file_path):
    """Test the voice command endpoint"""
    print(f"🎤 Testing Voice Command with: {audio_file_path}")
    
    try:
        with open(audio_file_path, 'rb') as f:
            files = {'file': ('audio.wav', f, 'audio/wav')}
            response = requests.post(VOICE_COMMAND_ENDPOINT, files=files, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"Action: {data.get('action', 'N/A')}")
            print(f"Summary: {data.get('summary', 'N/A')}")
            print(f"Transcribed Text: {data.get('transcribed_text', 'N/A')}")
            
            # Check if audio summary is present and valid
            audio_summary = data.get('audioSummary', '')
            if audio_summary:
                audio_size = len(audio_summary)
                print(f"Audio Summary: {audio_size} bytes")
                
                # Save audio to file for testing
                try:
                    audio_data = base64.b64decode(audio_summary)
                    with open("test_response_audio.mp3", "wb") as f:
                        f.write(audio_data)
                    print("✅ Saved audio response to test_response_audio.mp3")
                except Exception as e:
                    print(f"❌ Error saving audio: {e}")
            else:
                print("❌ No audio summary returned")
                
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_transcribe_only(audio_file_path):
    """Test just the transcription endpoint"""
    print(f"📝 Testing Transcription with: {audio_file_path}")
    
    try:
        with open(audio_file_path, 'rb') as f:
            files = {'file': ('audio.wav', f, 'audio/wav')}
            response = requests.post(TRANSCRIBE_ENDPOINT, files=files, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Transcription Success!")
            
            # Handle both old and new API response formats
            transcript = data.get('transcript', data.get('transcription', 'N/A'))
            language = data.get('language', 'N/A')
            
            print(f"Transcript: {transcript}")
            print(f"Detected Language: {language}")
            return transcript
        else:
            print(f"❌ Transcription Error: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def test_rag_with_text(text_query):
    """Test the RAG endpoint with text input"""
    print(f"🤖 Testing RAG with text: '{text_query}'")
    
    try:
        payload = {
            "user_query": text_query,
            "chat_history": "",
            "section": "crops",
            "top_k": 3
        }
        
        response = requests.post(
            RAG_ENDPOINT, 
            json=payload, 
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ RAG Success!")
            print(f"Action: {data.get('action', 'N/A')}")
            print(f"Response: {data.get('response', 'N/A')}")
            return True
        else:
            print(f"❌ RAG Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_server_health():
    """Test if the server is running"""
    print("🏥 Testing server health...")
    
    try:
        response = requests.get(BASE_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Server is running!")
            return True
        else:
            print(f"❌ Server responded with status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to server: {e}")
        print(f"Make sure the FastAPI server is running on {BASE_URL}")
        return False

def test_language_detection_flow():
    """Test the complete language detection flow"""
    print("\n" + "-" * 60)
    print("🌐 Testing Language Detection Flow")
    print("-" * 60)
    
    # Test with Hindi text
    hindi_text = "मुझे मेरी फसलों के बारे में बताओ"
    print(f"Testing Hindi text: '{hindi_text}'")
    test_rag_with_text(hindi_text)
    
    # Test with Marathi text
    marathi_text = "माझ्या पिकांबद्दल मला सांगा"
    print(f"\nTesting Marathi text: '{marathi_text}'")
    test_rag_with_text(marathi_text)
    
    # Test with English text
    english_text = "Tell me about my crops"
    print(f"\nTesting English text: '{english_text}'")
    test_rag_with_text(english_text)

def main():
    """Main test function"""
    print("=" * 60)
    print("🔬 Voice Command API Test Suite")
    print("=" * 60)
    
    # Test server health first
    if not test_server_health():
        print("\n❌ Server is not available. Please start the FastAPI server first.")
        return
    
    print("\n" + "-" * 60)
    
    # Find sample audio file
    audio_file = find_sample_audio()
    if not audio_file:
        print("\n⚠️  No audio file found. Testing with text queries only.")
        
        # Test RAG with sample text queries
        sample_queries = [
            "What's the weather like today?",
            "How are my crops doing?",
            "Tell me about my livestock",
            "Show me my farm profile"
        ]
        
        for query in sample_queries:
            print("\n" + "-" * 40)
            test_rag_with_text(query)
        
        # Test language detection flow
        test_language_detection_flow()
        
        return
    
    print(f"\n📁 Found audio file: {audio_file}")
    
    # Test transcription only
    print("\n" + "-" * 40)
    transcribed_text = test_transcribe_only(audio_file)
    
    # Test full voice command
    print("\n" + "-" * 40)
    voice_success = test_voice_command(audio_file)
    
    # If we got transcribed text, test RAG with it
    if transcribed_text:
        print("\n" + "-" * 40)
        test_rag_with_text(transcribed_text)
    
    # Test with sample text queries
    sample_queries = [
        "What's the weather like today?",
        "How are my crops doing?",
        "Tell me about my livestock"
    ]
    
    for query in sample_queries:
        print("\n" + "-" * 40)
        test_rag_with_text(query)
    
    # Test language detection flow
    test_language_detection_flow()
    
    print("\n" + "=" * 60)
    print("🏁 Testing Complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
