#!/usr/bin/env python3
"""
Test script for Text-to-Speech functionality
This script tests the text_to_speech service to ensure it's working properly
"""

import sys
import os
import base64

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Google credentials
SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), '..', 'vinayak', 'creds_gcp.json')
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(SERVICE_ACCOUNT_PATH)

from services.text_to_speech import text_to_speech, detect_language, get_audio_url

def test_text_to_speech():
    """Test text-to-speech functionality with different languages"""
    
    test_cases = [
        {
            "text": "Hello, this is a test message in English. The weather today is sunny.",
            "language": "en",
            "description": "English text"
        },
        {
            "text": "नमस्ते, आज का मौसम बहुत अच्छा है। आपकी फसल कैसी है?",
            "language": "hi",
            "description": "Hindi text"
        },
        {
            "text": "Good morning! Your crop intelligence report shows excellent growth.",
            "language": None,  # Test auto-detection
            "description": "Auto-detect language"
        }
    ]
    
    print("🔊 Testing Text-to-Speech Service\n")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test_case['description']}")
        print(f"Text: {test_case['text'][:50]}...")
        print(f"Language: {test_case['language'] or 'Auto-detect'}")
        
        try:
            # Test language detection if no language specified
            if test_case['language'] is None:
                detected_lang = detect_language(test_case['text'])
                print(f"🔍 Detected language: {detected_lang}")
                language_to_use = detected_lang
            else:
                language_to_use = test_case['language']
            
            # Test text-to-speech conversion
            audio_base64 = text_to_speech(test_case['text'], language_to_use)
            
            if audio_base64:
                print(f"✅ Success! Audio generated ({len(audio_base64)} bytes)")
                
                # Save the audio file for manual testing
                audio_filename = f"test_audio_{i}_{language_to_use}.mp3"
                try:
                    audio_data = base64.b64decode(audio_base64)
                    with open(audio_filename, "wb") as f:
                        f.write(audio_data)
                    print(f"💾 Audio saved as: {audio_filename}")
                except Exception as e:
                    print(f"❌ Error saving audio: {e}")
                
                # Test get_audio_url function
                data_url = get_audio_url(test_case['text'], language_to_use)
                if data_url.startswith("data:audio/mp3;base64,"):
                    print("✅ Data URL generation successful")
                else:
                    print("❌ Data URL generation failed")
                    
            else:
                print("❌ Failed! No audio generated")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
        
        print("-" * 30)

def test_voice_configs():
    """Test different voice configurations"""
    print("\n🎤 Testing Voice Configurations\n")
    print("=" * 50)
    
    from services.text_to_speech import VOICE_CONFIGS, get_voice_config
    
    test_languages = ["en", "hi", "mr", "en-IN", "hi-IN", "invalid-lang"]
    
    for lang in test_languages:
        try:
            config = get_voice_config(lang)
            print(f"Language: {lang:10} -> {config['language_code']:8} | {config['name']:20} | {config['ssml_gender'].name}")
        except Exception as e:
            print(f"Language: {lang:10} -> Error: {e}")

def main():
    """Main test function"""
    try:
        print("🧪 Text-to-Speech Service Testing Started")
        print(f"📁 Using Google credentials: {os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')}")
        
        # Check if credentials file exists
        if not os.path.exists(os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', '')):
            print("❌ Google credentials file not found!")
            print(f"Expected path: {os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')}")
            return
        
        # Test voice configurations
        test_voice_configs()
        
        # Test text-to-speech functionality
        test_text_to_speech()
        
        print("\n🎉 Testing completed!")
        print("\n📋 Summary:")
        print("- Check the generated .mp3 files to verify audio quality")
        print("- All audio files should be playable")
        print("- Different languages should use appropriate voices")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    main()
