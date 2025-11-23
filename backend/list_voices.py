import os
import requests
from dotenv import load_dotenv

# Load .env from the backend directory
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

MURF_API_KEY = os.getenv("MURF_API_KEY")

def list_voices():
    url = "https://api.murf.ai/v1/speech/voices"
    headers = {
        "Accept": "application/json",
        "api-key": MURF_API_KEY
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        voices = response.json()
        
        print(f"Found {len(voices)} voices.")
        for voice in voices:
            if "Naomi" in voice.get("displayName", "") or "Naomi" in voice.get("voiceId", ""):
                print(f"Found Naomi: {voice}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_voices()
