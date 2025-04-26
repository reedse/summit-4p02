import requests
import json
import os
from dotenv import load_dotenv

# --- Configuration ---
# WARNING: Hardcoding API keys is insecure. 
# It's better to load from environment variables.
# Load environment variables from .env file if it exists
load_dotenv()

# Attempt to get API key from environment, fall back to hardcoded key as a last resort
# Replace the fallback value with your actual key if needed for quick testing, 
# BUT DO NOT COMMIT THIS HARDCODED KEY TO VERSION CONTROL.
API_KEY = os.getenv('GOOGLE_TRANSLATE_API_KEY', 'AIzaSyDqkyW03Bw4A5rK1ZlJCzgkYvo0dMzDxjM')
API_URL = 'https://translation.googleapis.com/language/translate/v2'
DETECT_URL = 'https://translation.googleapis.com/language/translate/v2/detect'

if API_KEY == 'AIzaSyDqkyW03Bw4A5rK1ZlJCzgkYvo0dMzDxjM':
    print("\nWARNING: Using hardcoded Google Translate API key. This is insecure.")
    print("Please set the GOOGLE_TRANSLATE_API_KEY environment variable.")

# --- Functions ---

def detect_language(text):
    """Detects the language of the input text."""
    if not text.strip():
        print("Error: Input text is empty.")
        return None

    try:
        response = requests.post(
            f"{DETECT_URL}?key={API_KEY}",
            json={'q': text}
        )
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

        data = response.json()
        
        if data.get('data') and data['data'].get('detections') and data['data']['detections'][0]:
            detected = data['data']['detections'][0][0]['language']
            confidence = data['data']['detections'][0][0]['confidence']
            print(f"Detected language: {detected} (Confidence: {confidence:.2f})")
            return detected
        else:
            print("Could not detect language from response:", data)
            return None

    except requests.exceptions.RequestException as e:
        print(f"Error during language detection API call: {e}")
        if e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return None
    except json.JSONDecodeError:
        print("Error decoding JSON response from detection API.")
        print(f"Response text: {response.text}")
        return None

def translate_text(text, target_language, source_language=None):
    """Translates text to the target language. 
       Optionally specify the source language.
    """
    if not text.strip():
        print("Error: Input text is empty.")
        return None

    try:
        payload = {
            'q': text,
            'target': target_language,
            'format': 'text'
        }
        if source_language:
            payload['source'] = source_language

        response = requests.post(
            f"{API_URL}?key={API_KEY}",
            json=payload
        )
        response.raise_for_status() # Raise an exception for bad status codes

        data = response.json()
        
        if data.get('data') and data['data'].get('translations'):
            translated = data['data']['translations'][0]['translatedText']
            detected_source = data['data']['translations'][0].get('detectedSourceLanguage')
            
            print(f"Original: '{text}'")
            if detected_source:
                print(f"Detected Source Language: {detected_source}")
            print(f"Translated ({target_language}): '{translated}'")
            return translated
        else:
            print("Could not translate text from response:", data)
            return None

    except requests.exceptions.RequestException as e:
        print(f"Error during translation API call: {e}")
        if e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return None
    except json.JSONDecodeError:
        print("Error decoding JSON response from translation API.")
        print(f"Response text: {response.text}")
        return None

# --- Example Usage ---
if __name__ == "__main__":
    print("--- Testing Google Translate API ---")

    # Test Detection
    print("\n--- Testing Language Detection ---")
    detect_language("Bonjour le monde")
    detect_language("Hello world")
    detect_language("Hola mundo")
    detect_language("") # Test empty input

    # Test Translation (Auto-detect source)
    print("\n--- Testing Translation (Auto-Detect Source) ---")
    translate_text("Hello world", "fr")
    translate_text("Bonjour le monde", "es")

    # Test Translation (Specify source)
    print("\n--- Testing Translation (Specify Source) ---")
    translate_text("Hello world", "de", source_language="en")
    translate_text("This is a test", "ja", source_language="en")
    translate_text("", "fr") # Test empty input

    print("\n--- Test Complete ---")
