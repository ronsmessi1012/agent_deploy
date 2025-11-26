import os
import requests
import time
import json
from functools import lru_cache

MURF_API_KEY = os.getenv("MURF_API_KEY")

# Global session for connection pooling
session = requests.Session()
if MURF_API_KEY:
    session.headers.update({
        "api-key": MURF_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    })

@lru_cache(maxsize=100)
def generate_speech(text: str, voice_id: str = "en-US-naomi") -> bytes:
    """
    Generates speech from text using Murf AI API directly.
    """
    if not MURF_API_KEY:
        print("DEBUG: MURF_API_KEY is missing! Using fallback.")

    print(f"DEBUG: Generating speech for voice_id={voice_id}")
    
    start_time = time.time()
    
    try:
        payload = {
            "voiceId": voice_id,
            "text": text,
            "format": "MP3",
            "channelType": "MONO",
            "sampleRate": 24000
        }

        # 1. Generate Speech URL
        response = session.post(
            "https://api.murf.ai/v1/speech/generate",
            json=payload,
            timeout=30  # Increased timeout
        )
        response.raise_for_status()
        
        gen_time = time.time() - start_time
        print(f"DEBUG: TTS Generation took {gen_time:.2f}s")

        data = response.json()
        audio_url = data.get("audioFile")
        
        if not audio_url:
            raise Exception(f"No audioFile in response: {data}")

        # 2. Download Audio
        dl_start = time.time()
        audio_response = session.get(audio_url, timeout=30)
        audio_response.raise_for_status()
        
        dl_time = time.time() - dl_start
        total_time = time.time() - start_time
        print(f"DEBUG: Audio Download took {dl_time:.2f}s (Total: {total_time:.2f}s)")
        
        return audio_response.content

    except Exception as e:
        print(f"Error calling Murf API: {e}")
        print("WARNING: Falling back to dummy audio.")
        # Return 1 second of silence (minimal MP3 frame)
        # This allows the frontend to continue without erroring out
        return b'\xff\xf3\x44\xc4\x00\x00\x00\x03\x48\x00\x00\x00\x00\x4c\x41\x4d\x45\x33\x2e\x39\x39\x2e\x35'
