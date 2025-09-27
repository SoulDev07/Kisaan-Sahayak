#!/usr/bin/env python3
"""
Test script to verify audio integration with the V2 backend.
This script tests the text-to-speech functionality and the audio agent endpoint.
"""

import asyncio
import json
from services.text_to_speech import text_to_speech, detect_language
from services.speech_to_text import transcribe_audio

def test_text_to_speech():
    """Test the text-to-speech functionality."""
    print("🧪 Testing Text-to-Speech functionality...")
    
    # Test with English text
    english_text = "Hello, this is a test of the text-to-speech functionality."
    print(f"Testing with English text: {english_text}")
    
    audio_base64 = text_to_speech(english_text, "en")
    if audio_base64:
        print(f"✅ English TTS successful. Audio length: {len(audio_base64)} characters")
    else:
        print("❌ English TTS failed")
    
    # Test with Hindi text
    hindi_text = "नमस्ते, यह टेक्स्ट-टू-स्पीच फंक्शनैलिटी का टेस्ट है।"
    print(f"Testing with Hindi text: {hindi_text}")
    
    audio_base64_hindi = text_to_speech(hindi_text, "hi")
    if audio_base64_hindi:
        print(f"✅ Hindi TTS successful. Audio length: {len(audio_base64_hindi)} characters")
    else:
        print("❌ Hindi TTS failed")
    
    # Test language detection
    print("\n🧪 Testing language detection...")
    detected_en = detect_language(english_text)
    detected_hi = detect_language(hindi_text)
    
    print(f"English text detected as: {detected_en}")
    print(f"Hindi text detected as: {detected_hi}")

def test_agent_response():
    """Test the agent response generation with audio."""
    print("\n🧪 Testing agent response generation...")
    
    # Import the agent function
    from adk_agents.multi_tool_agent.agent import generate_response_with_audio
    
    # Test with a simple query
    test_query = "What is the weather like today?"
    print(f"Testing with query: {test_query}")
    
    try:
        result = generate_response_with_audio(test_query)
        print(f"✅ Agent response successful")
        print(f"Text response length: {len(result.get('response', ''))}")
        print(f"Audio response length: {len(result.get('audio', ''))}")
        print(f"Response preview: {result.get('response', '')[:100]}...")
    except Exception as e:
        print(f"❌ Agent response failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Audio Integration Tests...\n")
    
    # Test text-to-speech
    test_text_to_speech()
    
    # Test agent response
    test_agent_response()
    
    print("\n✅ Audio integration tests completed!") 