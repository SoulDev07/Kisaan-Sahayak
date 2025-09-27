import os
from google.cloud import speech
import logging
# Set the path to your GCP credentials JSON file
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath("creds_gcp.json")
# Create a Speech client
client = speech.SpeechClient()

LANGUAGE_CODES = {
    "hindi": "hi-IN",
    "english": "en-IN",  # Indian English
    "marathi": "mr-IN",
    "punjabi": "pa-IN",
    "tamil": "ta-IN",
    "telugu": "te-IN",
    "bengali": "bn-IN",
    "gujarati": "gu-IN",
}

def transcribe_audio(file_path: str, language: str = None) -> str:
    """
    Transcribes an audio file using Google Cloud Speech-to-Text.
    
    Args:
        file_path: Path to the audio file
        language: Optional language code to use. If None, auto-detection is attempted.
    
    Returns:
        Transcribed text
    """
    try:
        print(f"🎵 Analyzing audio file: {file_path}")
        client = speech.SpeechClient()
        
        with open(file_path, "rb") as audio_file:
            content = audio_file.read()
            
        audio = speech.RecognitionAudio(content=content)
        
        # Configure speech recognition with agricultural terms as speech context
        speech_context = speech.SpeechContext(
            phrases=[
                # Common crop names
                "धान", "गेहूँ", "चावल", "wheat", "rice", "cotton", "कपास", 
                "मक्का", "maize", "corn", "सोयाबीन", "soybean", "गन्ना", "sugarcane",
                
                # Agricultural terms
                "खाद", "fertilizer", "बीज", "seeds", "कीटनाशक", "pesticide",
                "सिंचाई", "irrigation", "फसल", "crop", "मिट्टी", "soil", "किसान", "farmer",
                
                # Common diseases
                "ब्लास्ट", "blast", "झुलसा", "blight", "पत्ती धब्बा", "leaf spot"
            ]
        )
        
        # If language is specified, use it; otherwise, enable language detection
        if language and language in LANGUAGE_CODES:
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=44100,
                language_code=LANGUAGE_CODES[language],
                speech_contexts=[speech_context],
                model="default",  # Using default for better accuracy
                use_enhanced=True,  # For better results with domain-specific audio
            )
        else:
            print("else")
            # Auto language detection with preference to Indian languages
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=44100,
                language_code="en-IN",  # Primary language hint
                alternative_language_codes=["en-IN", "mr-IN", "pa-IN", "ta-IN", "te-IN", "bn-IN", "gu-IN"],   # Alternative languages
                speech_contexts=[speech_context],
                model="default",
                use_enhanced=True,
            )

        response = client.recognize(config=config, audio=audio)
        
        if not response.results:
            print("⚠️ No speech recognition results returned")
            return ""
            
        transcript = " ".join([result.alternatives[0].transcript for result in response.results])
        
        # Log successful transcription
        logging.info(f"Successfully transcribed audio. Length: {len(transcript)} characters")
        
        return transcript
        
    except Exception as e:
        logging.error(f"Error in transcription: {e}")
        return ""


if __name__ == "__main__":
    file_path = "uploaded.wav"
    transcribed_text = transcribe_audio(file_path)
    print(f"Transcribed text: {transcribed_text}")

