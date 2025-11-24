import requests
import sys

API_KEY = "AIzaSyD9rQvv1baWPykTCciT4jd6pifI4nSwDYI"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"

payload = {
    "contents": [{
        "parts": [{"text": "Hello, are you working?"}]
    }]
}

try:
    response = requests.post(URL, json=payload)
    if response.status_code == 200:
        print("SUCCESS: API Key is valid.")
        print("Response:", response.json()['candidates'][0]['content']['parts'][0]['text'])
    else:
        print(f"FAILED: {response.status_code}")
        print(response.text)
        sys.exit(1)
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
