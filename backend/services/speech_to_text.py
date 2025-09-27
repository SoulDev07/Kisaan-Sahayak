import os
import logging
from google.cloud import speech
from google.cloud.speech_v2 import SpeechClient as SpeechClientV2
from google.cloud.speech_v2.types import cloud_speech
from google.api_core.client_options import ClientOptions
from google.api_core.exceptions import GoogleAPIError, NotFound

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants for different language codes
LANGUAGE_CODES = {
    "hindi": "hi-IN",
    "english": "en-IN",  # Indian English
    "marathi": "mr-IN",
    "punjabi": "pa-IN",
    "tamil": "ta-IN",
    "telugu": "te-IN",
    "bengali": "bn-IN",
    "gujarati": "gu-IN",
    "kannada": "kn-IN",
    "malayalam": "ml-IN",
    "oriya": "or-IN",
    "sanskrit": "sa-IN",
    "urdu": "ur-IN",
}

# V2 API Configuration
PROJECT_ID = 'artful-bonsai-466409-b9'
LOCATION = "us-central1"
RECOGNIZER_ID = "my-indian-language-recognizer"
RECOGNIZER_PATH = f"projects/{PROJECT_ID}/locations/{LOCATION}/recognizers/{RECOGNIZER_ID}"

def create_or_get_recognizer(client: SpeechClientV2):
    """
    Checks if a recognizer exists, and if not, creates it.
    This ensures the recognizer is ready for use.
    """
    try:
        logging.info(f"Checking for recognizer: {RECOGNIZER_PATH}")
        client.get_recognizer(name=RECOGNIZER_PATH)
        logging.info("Recognizer already exists.")
    except NotFound:
        logging.info(f"Recognizer not found. Creating {RECOGNIZER_PATH}...")
        
        # Define a default recognition config for the recognizer
        default_config = cloud_speech.RecognitionConfig(
            model="chirp_2",
            language_codes=["en-IN"],
            auto_decoding_config=cloud_speech.AutoDetectDecodingConfig(),
        )

        recognizer = cloud_speech.Recognizer(
            name=RECOGNIZER_PATH,
            default_recognition_config=default_config,
        )
        try:
            operation = client.create_recognizer(
                parent=f"projects/{PROJECT_ID}/locations/{LOCATION}",
                recognizer_id=RECOGNIZER_ID,
                recognizer=recognizer
            )
            operation.result()
            logging.info(f"Recognizer '{RECOGNIZER_ID}' created successfully in {LOCATION}.")
        except GoogleAPIError as create_e:
            logging.error(f"Failed to create recognizer: {create_e}")
            raise
    except GoogleAPIError as e:
        logging.error(f"Error accessing recognizer (not NotFound): {e}")
        raise
    except Exception as e:
        logging.error(f"An unexpected error occurred during recognizer check: {e}")
        raise

def transcribe_audio_v1(file_path: str, language_hint_key: str = None) -> tuple[str, str] | tuple[None, None]:
    """
    Transcribes an audio file using Google Cloud Speech-to-Text API v1 (better for 3GP files).
    
    Args:
        file_path: Path to the audio file.
        language_hint_key: Optional language key (e.g., "hindi", "english") from LANGUAGE_CODES
    
    Returns:
        A tuple of (transcribed_text, detected_language_code)
        Returns (None, None) if transcription fails or no results.
    """
    try:
        logging.info(f"🎵 Using Speech-to-Text v1 API for: {file_path}")
        
        # Initialize the Speech-to-Text v1 client
        client = speech.SpeechClient()
        
        with open(file_path, "rb") as audio_file:
            content = audio_file.read()

        # Configure for 3GP files
        audio = speech.RecognitionAudio(content=content)
        
        # Set up language codes
        if language_hint_key and language_hint_key in LANGUAGE_CODES:
            language_code = LANGUAGE_CODES[language_hint_key]
            logging.info(f"Using specific language hint: {language_code}")
        else:
            language_code = "en-IN"  # Default to Indian English
            logging.info("Using default language: en-IN")
        
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.AMR,
            sample_rate_hertz=8000,  # AMR typically uses 8kHz
            language_code=language_code,
            audio_channel_count=1,
            enable_automatic_punctuation=True,
        )
        
        # Perform the transcription
        response = client.recognize(config=config, audio=audio)
        
        if not response.results:
            logging.warning("⚠️ No speech recognition results returned from v1 API.")
            return None, None
            
        # Extract transcript
        full_transcript = " ".join([result.alternatives[0].transcript for result in response.results if result.alternatives])
        
        logging.info(f"Successfully transcribed with v1 API. Length: {len(full_transcript)} characters")
        
        return full_transcript, language_code
        
    except GoogleAPIError as e:
        logging.error(f"Google Cloud API v1 error during transcription: {e}")
        return None, None
    except Exception as e:
        logging.error(f"An unexpected error occurred during v1 transcription: {e}")
        return None, None

def transcribe_audio_v2(file_path: str, language_hint_key: str = None) -> tuple[str, str] | tuple[None, None]:
    """
    Transcribes an audio file using Google Cloud Speech-to-Text API v2 with Chirp 2 model.
    
    Args:
        file_path: Path to the audio file.
        language_hint_key: Optional language key (e.g., "hindi", "english") from LANGUAGE_CODES
                           to hint the model. If None, the model will auto-detect the language.
    
    Returns:
        A tuple of (transcribed_text, detected_language_code)
        Returns (None, None) if transcription fails or no results.
    """
    try:
        logging.info(f"🎵 Analyzing audio file: {file_path} using API v2 and Chirp 2")

        # Check file extension for special handling
        file_extension = file_path.lower().split('.')[-1]
        logging.info(f"Detected file extension: {file_extension}")
        
        # For 3GP files, use the v1 API which handles them better
        if file_extension in ['3gp', '3gpp']:
            logging.info("Using Speech-to-Text v1 API for 3GP file compatibility")
            return transcribe_audio_v1(file_path, language_hint_key)

        # Initialize the Speech-to-Text V2 client for other formats
        client = SpeechClientV2(
            client_options=ClientOptions(
                api_endpoint=f"{LOCATION}-speech.googleapis.com",
            )
        )
        
        # Ensure the recognizer exists before using it
        create_or_get_recognizer(client)
        
        with open(file_path, "rb") as audio_file:
            content = audio_file.read()

        language_codes_for_config = []
        if language_hint_key and language_hint_key in LANGUAGE_CODES:
            target_language_code = LANGUAGE_CODES[language_hint_key]
            language_codes_for_config.append(target_language_code)
            logging.info(f"Using specific language hint: {target_language_code}")
        else:
            language_codes_for_config.append("auto")
            logging.info("Attempting auto language detection with Chirp 2")
        
        # Use auto-detection for non-3GP files
        config = cloud_speech.RecognitionConfig(
            model="chirp_2",
            language_codes=language_codes_for_config,
            auto_decoding_config=cloud_speech.AutoDetectDecodingConfig(),
        )
        logging.info("Using auto-detection for audio decoding")
        
        request = cloud_speech.RecognizeRequest(
            recognizer=RECOGNIZER_PATH,
            config=config,
            content=content,
        )
        
        response = client.recognize(request=request)
        
        if not response.results:
            logging.warning("⚠️ No speech recognition results returned.")
            return None, None
            
        full_transcript = " ".join([result.alternatives[0].transcript for result in response.results if result.alternatives])
        detected_language_code = response.results[0].language_code if response.results[0].language_code else None
        
        # Map base language codes to regional codes if needed
        if detected_language_code:
            # Mapping for base language codes to regional variants
            language_mapping = {
                "hi": "hi-IN",
                "mr": "mr-IN",
                "en": "en-IN",
                "pa": "pa-IN",
                "ta": "ta-IN",
                "te": "te-IN",
                "bn": "bn-IN",
                "gu": "gu-IN",
                "kn": "kn-IN",
                "ml": "ml-IN",
                "or": "or-IN",
                "sa": "sa-IN",
                "ur": "ur-IN",
            }
            
            # If it's a base language code, map it to the regional variant
            if detected_language_code in language_mapping:
                detected_language_code = language_mapping[detected_language_code]
                logging.info(f"Mapped base language code to regional variant: {detected_language_code}")
        
        logging.info(f"Successfully transcribed audio. Length: {len(full_transcript)} characters. Detected Language: {detected_language_code}")
        
        return full_transcript, detected_language_code
        
    except GoogleAPIError as e:
        logging.error(f"Google Cloud API error during transcription: {e}")
        return None, None
    except Exception as e:
        logging.error(f"An unexpected error occurred during transcription: {e}")
        return None, None

def transcribe_audio(file_path: str) -> tuple[str, str]:
    """
    Transcribes an audio file using Google Cloud Speech-to-Text V2 API.
    Returns both the transcript and detected language code.
    
    This is a wrapper around transcribe_audio_v2 for backward compatibility.
    """
    transcript, language_code = transcribe_audio_v2(file_path)
    return transcript, language_code
