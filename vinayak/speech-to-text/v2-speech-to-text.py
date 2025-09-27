import os
import logging
from google.cloud.speech_v2 import SpeechClient
from google.cloud.speech_v2.types import cloud_speech
from google.api_core.client_options import ClientOptions
from google.api_core.exceptions import GoogleAPIError, NotFound # <-- Add NotFound here
import os
from google.cloud import speech
import logging
from google.api_core.exceptions import GoogleAPIError
# Set the path to your GCP credentials JSON file
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath("creds_gcp.json")
# Create a Speech client
client = speech.SpeechClient()


# You'll need your Google Cloud Project ID
# Best practice: set this as an environment variable or retrieve dynamically
PROJECT_ID = 'artful-bonsai-466409-b9'
if not PROJECT_ID:
    logging.error("GOOGLE_CLOUD_PROJECT environment variable not set.")
    PROJECT_ID = input("Please enter your Google Cloud Project ID: ")
    if not PROJECT_ID:
        raise ValueError("Google Cloud Project ID is required to proceed.")
    




# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# You'll need your Google Cloud Project ID
# Best practice: set this as an environment variable or retrieve dynamically
PROJECT_ID = 'artful-bonsai-466409-b9'
if not PROJECT_ID:
    raise ValueError("GOOGLE_CLOUD_PROJECT environment variable not set. Please set it (e.g., export GOOGLE_CLOUD_PROJECT='your-project-id').")

# Define the region where your recognizer will be or where you want to send requests
# 'us-central1' is a common choice, but you can select others.
LOCATION = "us-central1" 
# Define a name for your recognizer. You can create one or use an existing one.
# For simplicity, we'll use a hardcoded name; in production, you might manage this more dynamically.
RECOGNIZER_ID = "my-indian-language-recognizer"
RECOGNIZER_PATH = f"projects/{PROJECT_ID}/locations/{LOCATION}/recognizers/{RECOGNIZER_ID}"

# Constants for different Indian language codes (useful for hints)
INDIAN_LANGUAGE_CODES = {
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
    "oriya": "or", # Updated
    "sanskrit": "sa", # Updated
    "urdu": "ur-IN",
}


def create_or_get_recognizer(client: SpeechClient):
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
            model="chirp_2", # Set a default model here for the recognizer itself
            language_codes=["en-IN"], # A default or broad language, e.g., Indian English
                                      # Or ["auto"] if you prefer the recognizer's default to be auto-detect
            auto_decoding_config=cloud_speech.AutoDetectDecodingConfig(),
            # Add any other default features you might always want, e.g., features=...
        )

        recognizer = cloud_speech.Recognizer(
            name=RECOGNIZER_PATH,
            default_recognition_config=default_config, # <--- ADD THIS LINE
        )
        try:
            operation = client.create_recognizer(
                parent=f"projects/{PROJECT_ID}/locations/{LOCATION}",
                recognizer_id=RECOGNIZER_ID,
                recognizer=recognizer
            )
            operation.result() # Wait for the creation to complete
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


def transcribe_audio_v2(file_path: str, language_hint_key: str = None) -> tuple[str, str] | tuple[None, None]:
    """
    Transcribes an audio file using Google Cloud Speech-to-Text API v2 with Chirp 2 model.
    
    Args:
        file_path: Path to the audio file.
        language_hint_key: Optional language key (e.g., "hindi", "english") from INDIAN_LANGUAGE_CODES
                           to hint the model. If None, the model will primarily auto-detect
                           based on the Chirp 2's broad language capabilities.
    
    Returns:
        A tuple of (transcribed_text, detected_language_code)
        Returns (None, None) if transcription fails or no results.
    """
    try:
        logging.info(f"🎵 Analyzing audio file: {file_path} using API v2 and Chirp 2")

        # Initialize the Speech-to-Text V2 client
        client = SpeechClient(
            client_options=ClientOptions(
                api_endpoint=f"{LOCATION}-speech.googleapis.com", # Use region-specific endpoint
            )
        )
        
        # Ensure the recognizer exists before using it
        create_or_get_recognizer(client)
        
        with open(file_path, "rb") as audio_file:
            content = audio_file.read()
            
        language_codes_for_config = []
        if language_hint_key and language_hint_key in INDIAN_LANGUAGE_CODES:
            # If a specific Indian language hint is provided, use it
            target_language_code = INDIAN_LANGUAGE_CODES[language_hint_key]
            language_codes_for_config.append(target_language_code)
            logging.info(f"Using specific language hint: {target_language_code}")
        else:
            # For broad Indian language support with auto-detection,
            # you can provide a list of common Indian languages as hints,
            # or just rely on "auto" if Chirp 2's general detection is sufficient.
            # "auto" is often very effective with Chirp 2.
            language_codes_for_config.append("auto") # Let Chirp 2 auto-detect
            logging.info("Attempting auto language detection with Chirp 2 (no specific hint or using 'auto').")
        
        config = cloud_speech.RecognitionConfig(
            model="chirp_2",
            language_codes=language_codes_for_config,
            auto_decoding_config=cloud_speech.AutoDetectDecodingConfig(), # Let API auto-detect encoding/sample rate
        )
        
        request = cloud_speech.RecognizeRequest(
            recognizer=RECOGNIZER_PATH, # Use the explicit recognizer path
            config=config,
            content=content,
        )
        
        response = client.recognize(request=request)
        
        if not response.results:
            logging.warning("⚠️ No speech recognition results returned.")
            return None, None
            
        full_transcript = " ".join([result.alternatives[0].transcript for result in response.results if result.alternatives])
        # The detected language_code will be present in the first result if successfully detected
        detected_language_code = response.results[0].language_code if response.results[0].language_code else None
        
        logging.info(f"Successfully transcribed audio. Length: {len(full_transcript)} characters. Detected Language: {detected_language_code}")
        
        return full_transcript, detected_language_code
        
    except GoogleAPIError as e:
        logging.error(f"Google Cloud API error during transcription: {e}")
        return None, None
    except Exception as e:
        logging.error(f"An unexpected error occurred during transcription: {e}")
        return None, None

# Example Usage:
if __name__ == "__main__":
    # Ensure your GOOGLE_CLOUD_PROJECT environment variable is set
    # e.g., export GOOGLE_CLOUD_PROJECT="artful-bonsai-466409-b9"

    # --- IMPORTANT ---
    # Replace 'path/to/your/audio.wav' with the actual path to your audio file.
    # For testing, ensure this audio file exists and contains speech.
    # For a real test of Indian language support, use an audio file with Indian language speech.
    
    # Example audio file paths (replace with your actual files)
    HINDI_AUDIO_PATH = "path/to/your/hindi_audio.wav"
    TELUGU_AUDIO_PATH = "path/to/your/telugu_audio.wav"
    UNKNOWN_LANG_AUDIO_PATH = "test_audio.wav"

    # Test 1: Transcribe with a Hindi hint
    print(f"\n--- Transcribing with Hindi Hint ({HINDI_AUDIO_PATH}) ---")
    if os.path.exists(HINDI_AUDIO_PATH):
        transcript, language = transcribe_audio_v2(HINDI_AUDIO_PATH, language_hint_key="hindi")
        if transcript is not None:
            print(f"Transcript: {transcript}")
            print(f"Detected Language: {language}")
    else:
        print(f"Skipping Hindi test: Audio file not found at {HINDI_AUDIO_PATH}")

    # Test 2: Transcribe with a Telugu hint
    print(f"\n--- Transcribing with Telugu Hint ({TELUGU_AUDIO_PATH}) ---")
    if os.path.exists(TELUGU_AUDIO_PATH):
        transcript, language = transcribe_audio_v2(TELUGU_AUDIO_PATH, language_hint_key="telugu")
        if transcript is not None:
            print(f"Transcript: {transcript}")
            print(f"Detected Language: {language}")
    else:
        print(f"Skipping Telugu test: Audio file not found at {TELUGU_AUDIO_PATH}")

    # Test 3: Transcribe with auto-detection (no specific language hint)
    print(f"\n--- Transcribing with Auto-Detection ({UNKNOWN_LANG_AUDIO_PATH}) ---")
    if os.path.exists(UNKNOWN_LANG_AUDIO_PATH):
        transcript, language = transcribe_audio_v2(UNKNOWN_LANG_AUDIO_PATH)
        if transcript is not None:
            print(f"Transcript: {transcript}")
            print(f"Detected Language: {language}")
    else:
        print(f"Skipping Auto-Detect test: Audio file not found at {UNKNOWN_LANG_AUDIO_PATH}")
