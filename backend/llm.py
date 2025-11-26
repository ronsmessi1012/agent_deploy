import requests
import os
from abc import ABC, abstractmethod

# -----------------------------
# Base Interface
# -----------------------------
class ModelClient(ABC):

    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        pass


# -----------------------------
# Gemini Model Client
# -----------------------------
class GeminiClient(ModelClient):
    def __init__(self, model: str = "gemini-flash-latest"):
        self.model_name = model
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("WARNING: GEMINI_API_KEY not found in environment variables.")

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        if not self.api_key:
            return "Error: Gemini API Key not configured."

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        
        # Gemini doesn't have a strict "system prompt" in the same way, but we can prepend it
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        payload = {
            "contents": [{
                "parts": [{"text": full_prompt}]
            }]
        }

        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            # Extract text from response
            return data['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            print(f"Gemini API Error: {e}")
            if 'response' in locals() and response.text:
                 print(f"Response content: {response.text}")
            return "Error generating response from Gemini."

# llm.py (add this at the bottom)
def llm_generate(prompt: str) -> str:
    client = GeminiClient()
    return client.generate(system_prompt="", user_prompt=prompt)
