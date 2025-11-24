import requests
import os
from abc import ABC, abstractmethod
import google.generativeai as genai

# -----------------------------
# Base Interface
# -----------------------------
class ModelClient(ABC):

    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        pass


# -----------------------------
# Dummy Model Client
# -----------------------------
class DummyModelClient(ModelClient):

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        return f"(dummy) System: {system_prompt[:30]} | User: {user_prompt[:30]}..."


# -----------------------------
# Ollama Model Client
# -----------------------------
class OllamaClient(ModelClient):
    def __init__(self, model: str = "llama3.1:8b"):
        self.model = model

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        url = "http://localhost:11434/api/generate"

        full_prompt = f"{system_prompt}\n\n{user_prompt}"

        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": False
        }

        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()

        return data.get("response", "")

# -----------------------------
# Gemini Model Client
# -----------------------------
class GeminiClient(ModelClient):
    def __init__(self, model: str = "gemini-pro"):
        self.model_name = model
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found in environment variables.")
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(model)

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        try:
            # Gemini doesn't have a strict "system prompt" in the same way, but we can prepend it
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return "Error generating response from Gemini."

# llm.py (add this at the bottom)
def llm_generate(prompt: str) -> str:
    client = GeminiClient()
    return client.generate(system_prompt="", user_prompt=prompt)
