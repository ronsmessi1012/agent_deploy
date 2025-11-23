import os
import requests
from murf import Murf
from functools import lru_cache

MURF_API_KEY = os.getenv("MURF_API_KEY")

@lru_cache(maxsize=100)
def generate_speech(text: str, voice_id: str = "en-US-naomi") -> bytes:
    """
    Generates speech from text using Murf AI SDK.
    
    Args:
        text (str): The text to convert to speech.
        voice_id (str): The voice ID to use. Defaults to "en-US-terra".
        
    Returns:
        bytes: The audio content.
        
    Raises:
        Exception: If the API call fails or API key is missing.
    """
    if not MURF_API_KEY:
        print("DEBUG: MURF_API_KEY is missing!")
        raise Exception("MURF_API_KEY is not set in environment variables.")
    
    print(f"DEBUG: Using API Key: {MURF_API_KEY[:4]}...{MURF_API_KEY[-4:] if len(MURF_API_KEY) > 4 else ''}")
    print(f"DEBUG: Generating speech via SDK for voice_id={voice_id}")

    try:
        # Increase timeout to 180 seconds to avoid read timeouts
        client = Murf(api_key=MURF_API_KEY, timeout=180)
        
        # The SDK returns a response object. Based on user snippet:
        # res = client.text_to_speech.generate(...)
        # We need to check what 'res' contains. Usually it has an audio_url or content.
        # The user didn't show how to get the audio from 'res'.
        # Assuming standard SDK pattern, it might return a model with 'audio_file' or similar.
        # Let's try to inspect it or assume it returns a URL like the raw API.
        
        res = client.text_to_speech.generate(
            text=text,
            voice_id=voice_id,
            format="MP3",
            channel_type="MONO",
            sample_rate=24000
        )
        
        print(f"DEBUG: SDK Response: {res}")
        
        # If res is a pydantic model or dict, let's try to get audio_file
        # Based on common SDKs, it might be res.audio_file or res['audioFile']
        
        audio_url = None
        if hasattr(res, 'audio_file'):
            audio_url = res.audio_file
        elif isinstance(res, dict) and 'audioFile' in res:
            audio_url = res['audioFile']
        elif hasattr(res, 'audioFile'): # Case sensitivity check
             audio_url = res.audioFile
             
        if not audio_url:
             # Fallback: maybe it returns the url directly? Unlikely.
             # Or maybe 'res' IS the url?
             if isinstance(res, str) and res.startswith("http"):
                 audio_url = res
             else:
                 print(f"ERROR: Could not extract audio URL from SDK response: {res}")
                 raise Exception(f"Unknown SDK response format: {res}")

        print(f"DEBUG: Downloading audio from {audio_url}")
        audio_response = requests.get(audio_url)
        audio_response.raise_for_status()
        
        return audio_response.content

    except Exception as e:
        print(f"Error calling Murf SDK: {e}")
        raise e
