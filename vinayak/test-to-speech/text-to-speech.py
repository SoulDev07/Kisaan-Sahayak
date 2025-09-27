import os
from google.cloud import texttospeech
import os

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath("creds_gcp.json")

# You'll need your Google Cloud Project ID
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT",'artful-bonsai-466409-b9')
if not PROJECT_ID:
    raise ValueError("GOOGLE_CLOUD_PROJECT environment variable not set.")

def synthesize_text(text: str, language_code: str = "hi-IN", voice_name: str = None, output_file: str = "output.mp3"):
    """
    Synthesizes speech from the input text using Google Cloud Text-to-Speech.

    Args:
        text: The text to synthesize.
        language_code: The language code for the voice (e.g., "en-US", "hi-IN").
        voice_name: Optional. The name of the voice to use. If None, a default voice is selected.
        output_file: The path to save the synthesized audio (default: output.mp3).
    """
    try:
        # Initialize the Text-to-Speech client
        client = texttospeech.TextToSpeechClient()

        # Set the text input to be synthesized
        synthesis_input = texttospeech.SynthesisInput(text=text)

        # Build the voice request, select the language code and optionally the name.
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=voice_name  # If None, a suitable voice will be automatically selected
        )

        # Select the type of audio file you want returned
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3  # Or LINEAR16 for WAV
        )

        # Perform the text-to-speech request on the text input with the selected
        # voice parameters and audio file type
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        # The response's audio_content is binary. Save the synthesized audio
        with open(output_file, "wb") as out:
            out.write(response.audio_content)
        print(f"Audio content written to file '{output_file}'")

    except Exception as e:
        print(f"Error during text-to-speech: {e}")

# Example Usage:
if __name__ == "__main__":
    text_to_synthesize = "नमस्ते दुनिया! यह हिंदी में पाठ-से-वाक् का एक उदाहरण है।"
    synthesize_text(text_to_synthesize, language_code="hi-IN", output_file="hindi_output.mp3")

    text_to_synthesize = "Hello world! This is an example of text-to-speech in English."
    synthesize_text(text_to_synthesize, language_code="en-US", output_file="english_output.mp3")
