import os
from google.cloud import texttospeech

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "creds_gcp.json"

client = texttospeech.TextToSpeechClient()

# Marathi text
synthesis_input = texttospeech.SynthesisInput(text="तुमचं स्वागत आहे. मी मराठी शिकत आहे.")

# Native Marathi voice
voice = texttospeech.VoiceSelectionParams(
    language_code="mr-IN",
    ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
)

audio_config = texttospeech.AudioConfig(
    audio_encoding=texttospeech.AudioEncoding.MP3
)

response = client.synthesize_speech(
    input=synthesis_input, voice=voice, audio_config=audio_config
)

with open("output_marathi_native.mp3", "wb") as out:
    out.write(response.audio_content)
    print('Audio content written to file "output_marathi_native.mp3"')