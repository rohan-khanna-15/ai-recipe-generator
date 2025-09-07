import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("Testing Gemini API...")

try:
    # Configure Gemini API
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"API Key loaded: {'Yes' if api_key else 'No'}")
    print(f"API Key (first 10 chars): {api_key[:10] if api_key else 'None'}")
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')  # Using the correct model name
    
    print("Model configured successfully")
    
    # Test generation
    response = model.generate_content("Generate a simple recipe for pasta.")
    print("Response received successfully")
    print(f"Response text: {response.text[:100]}...")
    
except Exception as e:
    print(f"Error: {e}")
    print(f"Error type: {type(e).__name__}")
