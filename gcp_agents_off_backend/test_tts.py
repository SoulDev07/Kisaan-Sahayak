#!/usr/bin/env python3
"""
Test script to verify text-to-speech service is working
"""
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.text_to_speech import text_to_speech, detect_language

def test_text_to_speech():
    """Test text-to-speech functionality"""
    print("🧪 Testing Text-to-Speech Service...")
    print("=" * 50)
    
    # Test text
    test_text = "Hello, this is a test of the text-to-speech service."
    
    print(f"📝 Test text: {test_text}")
    
    # Test language detection
    detected_lang = detect_language(test_text)
    print(f"🌍 Detected language: {detected_lang}")
    
    # Test text-to-speech
    try:
        audio_base64 = text_to_speech(test_text, detected_lang)
        if audio_base64:
            print(f"✅ Text-to-speech successful!")
            print(f"🎵 Audio length: {len(audio_base64)} characters")
            print(f"🎵 Audio preview: {audio_base64[:50]}...")
        else:
            print("❌ Text-to-speech failed - no audio generated")
    except Exception as e:
        print(f"❌ Text-to-speech error: {e}")
    
    print("=" * 50)
    print("✅ Testing completed!")

if __name__ == "__main__":
    test_text_to_speech() 