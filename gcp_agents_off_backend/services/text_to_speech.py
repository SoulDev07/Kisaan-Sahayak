import os
from google.cloud import texttospeech
import base64
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def clean_text_for_speech(text: str) -> str:
    """
    Clean text to make it more suitable for text-to-speech conversion.
    Removes markdown formatting and other elements that don't sound good when spoken.
    
    Args:
        text: The raw text that may contain markdown formatting
        
    Returns:
        Cleaned text suitable for speech synthesis
    """
    if not text:
        return text
    
    # Remove markdown bold formatting (**text** or __text__)
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'__(.*?)__', r'\1', text)
    
    # Remove markdown italic formatting (*text* or _text_)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    text = re.sub(r'_(.*?)_', r'\1', text)
    
    # Remove markdown headers (# ## ### etc.)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    
    # Remove markdown links [text](url) - keep only the text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    
    # Remove markdown code blocks ```code``` and inline code `code`
    text = re.sub(r'```[^`]*```', '', text, flags=re.DOTALL)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    
    # Remove bullet points and list formatting
    text = re.sub(r'^[\s]*[-•*]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^[\s]*\d+\.\s+', '', text, flags=re.MULTILINE)
    
    # Remove extra whitespace and newlines
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    
    # Remove any remaining special characters that might sound awkward
    text = re.sub(r'[<>{}[\]|\\]', '', text)
    
    return text.strip()

# Constants for different voice configurations
VOICE_CONFIGS = {
    # Base language codes
    "en": {
        "language_code": "en-IN",  # Indian English
        "name": "en-IN-Neural2-B",  # Male voice
        "ssml_gender": texttospeech.SsmlVoiceGender.MALE
    },
    "hi": {
        "language_code": "hi-IN",  # Hindi
        "name": "hi-IN-Neural2-A",  # Female voice
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    },
    "mr": {
        "language_code": "mr-IN",  # Marathi
        "name": "mr-IN-Standard-A",
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    },
    # Regional language codes
    "en-IN": {
        "language_code": "en-IN",  # Indian English
        "name": "en-IN-Neural2-B",  # Male voice
        "ssml_gender": texttospeech.SsmlVoiceGender.MALE
    },
    "hi-IN": {
        "language_code": "hi-IN",  # Hindi
        "name": "hi-IN-Neural2-A",  # Female voice
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    },
    "mr-IN": {
        "language_code": "mr-IN",  # Marathi
        "name": "mr-IN-Standard-A",
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    },
    "pa-IN": {
        "language_code": "pa-IN",  # Punjabi
        "name": "pa-IN-Standard-A",
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    },
    "ta-IN": {
        "language_code": "ta-IN",  # Tamil
        "name": "ta-IN-Standard-A",
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    },
    "te-IN": {
        "language_code": "te-IN",  # Telugu
        "name": "te-IN-Standard-A",
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    },
    "bn-IN": {
        "language_code": "bn-IN",  # Bengali
        "name": "bn-IN-Standard-A",
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    },
    "gu-IN": {
        "language_code": "gu-IN",  # Gujarati
        "name": "gu-IN-Standard-A",
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    },
    "kn-IN": {
        "language_code": "kn-IN",  # Kannada
        "name": "kn-IN-Standard-A",
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    },
    "ml-IN": {
        "language_code": "ml-IN",  # Malayalam
        "name": "ml-IN-Standard-A",
        "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE
    }
}

def detect_language(text: str) -> str:
    """
    Detect the language of the text to use appropriate voice configuration.
    Basic detection based on script characteristics.
    
    Returns:
        A language code key for VOICE_CONFIGS (e.g., "hi", "en", "mr")
    """
    # Simple detection based on character ranges
    # Hindi/Devanagari characters range (used by Hindi, Marathi, etc.)
    devanagari_chars = sum(1 for c in text if '\u0900' <= c <= '\u097F')
    
    # If more than 20% of characters are Devanagari, consider it Hindi by default
    # (A more sophisticated approach would differentiate between Hindi, Marathi, etc.)
    if devanagari_chars / max(len(text), 1) > 0.2:
        return "hi"
    
    # Default to English
    return "en"

def get_voice_config(language_code: str) -> dict:
    """
    Get the appropriate voice configuration for a language code.
    Handles both base language codes (e.g., "hi") and regional variants (e.g., "hi-IN").
    
    Args:
        language_code: Language code (e.g., "hi", "en", "hi-IN")
        
    Returns:
        Voice configuration dictionary
    """
    # First try exact match
    if language_code in VOICE_CONFIGS:
        return VOICE_CONFIGS[language_code]
    
    # If not found, try base language code (first 2 characters)
    base_code = language_code.split('-')[0] if '-' in language_code else language_code
    if base_code in VOICE_CONFIGS:
        return VOICE_CONFIGS[base_code]
    
    # Default to English if no match found
    logging.warning(f"No voice configuration found for language code: {language_code}. Using English.")
    return VOICE_CONFIGS["en"]

def text_to_speech(text: str, language: str = None) -> str:
    """
    Converts text to speech using Google Cloud Text-to-Speech API.
    Returns a base64 encoded audio string.
    
    Args:
        text: The text to convert to speech
        language: Optional language code. Can be base code (e.g., "hi") 
                 or regional variant (e.g., "hi-IN"). 
                 If None, auto-detection is attempted.
    
    Returns:
        Base64 encoded audio string
    """
    try:
        # Set up Google Cloud credentials
        SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), '..', 'creds', 'creds_gcp.json')
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(SERVICE_ACCOUNT_PATH)
        
        # Clean the text to remove markdown and formatting that sounds bad in speech
        clean_text = clean_text_for_speech(text)
        logging.info(f"Cleaned text for speech: '{text[:50]}...' -> '{clean_text[:50]}...'")
        
        # Create client
        client = texttospeech.TextToSpeechClient()
        
        # If language is not specified, try to detect it
        if not language:
            language = detect_language(clean_text)
            logging.info(f"Auto-detected language: {language}")
        
        # Get voice configuration
        voice_config = get_voice_config(language)
        logging.info(f"Using voice configuration: {voice_config}")
        
        # Set input text (use cleaned text)
        synthesis_input = texttospeech.SynthesisInput(text=clean_text)
        
        # Configure voice
        voice = texttospeech.VoiceSelectionParams(
            language_code=voice_config["language_code"],
            name=voice_config["name"],
            ssml_gender=voice_config["ssml_gender"]
        )
        
        # Configure audio output
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        
        # Generate speech
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Encode audio content as base64
        audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')
        
        # Log successful conversion
        logging.info(f"Successfully converted text to speech. Text length: {len(clean_text)} characters")
        
        # Reset credentials to default
        SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), '..', 'creds', 'serviceAccountKey.json')
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(SERVICE_ACCOUNT_PATH)
        
        return audio_base64
        
    except Exception as e:
        logging.error(f"Error in text-to-speech conversion: {e}")
        # Reset credentials to default even on error
        try:
            SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), '..', 'creds', 'serviceAccountKey.json')
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(SERVICE_ACCOUNT_PATH)
        except:
            pass
        return ""

def get_audio_url(text: str, language: str = None) -> str:
    """
    Convenience function to get a data URL for the audio that can be used in HTML audio elements.
    
    Args:
        text: The text to convert to speech
        language: Optional language code
        
    Returns:
        Data URL for the audio
    """
    audio_base64 = text_to_speech(text, language)
    if audio_base64:
        return f"data:audio/mp3;base64,{audio_base64}"
    return "" 