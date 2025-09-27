import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY") or "AIzaSyCLii-M1ywSa5PH-cXc3T-F5AJrCqSrX_4"
if not GEMINI_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY environment variable not set. Please set it before running the backend.")
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY

def analyze_image_with_context(images, context):
    """
    Calls Gemini 2.5 Flash with the given images (list of base64) and context (string), returns suggestions (list of 3 strings).
    """
    if isinstance(images, str):
        images = [images]
    prompt = f"""
    You are an expert agricultural assistant. Analyze the following crop field images and the provided context about the farmer's animals and calendar updates. Give 3 actionable, concise, and practical space improvement suggestions for the farmer's field. Each suggestion should be a single sentence. Use the context to make the suggestions relevant.

    Context:
    {context}
    """
    parts = [{"text": prompt}]
    for img in images:
        parts.append({"inlineData": {"mimeType": "image/jpeg", "data": img}})
    data = {
        "contents": [
            {"role": "user", "parts": parts}
        ]
    }
    response = requests.post(GEMINI_API_URL, json=data)
    if response.status_code != 200:
        raise Exception(f"Gemini API error: {response.text}")
    result = response.json()
    print(result)
    # Parse suggestions from the response
    suggestions = []
    try:
        text = result['candidates'][0]['content']['parts'][0]['text']
        # Only keep lines that look like suggestions (start with a number or bullet)
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
            if line[0] in {'-', '•'} or line[:2].isdigit() or line[:1].isdigit():
                line = line.lstrip('-•1234567890. ').strip()
                if line:
                    suggestions.append(line)
            if len(suggestions) == 3:
                break
        if len(suggestions) < 3:
            for line in text.split('\n'):
                line = line.strip()
                if line and line not in suggestions:
                    suggestions.append(line)
                if len(suggestions) == 3:
                    break
        print('Parsed suggestions:', suggestions)
    except Exception as e:
        raise Exception(f"Failed to parse Gemini response: {e}")
    return suggestions

def ask_gemini(prompt):
    """
    Send a text prompt to Gemini and return the response.
    
    Args:
        prompt (str): The text prompt to send to Gemini
        
    Returns:
        dict: The parsed response from Gemini, or error dict if failed
    """
    try:
        data = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 2048
            }
        }
        
        response = requests.post(GEMINI_API_URL, json=data)
        
        if response.status_code != 200:
            return {"error": f"Gemini API error: {response.text}"}
        
        result = response.json()
        
        # Extract the text response
        try:
            text_response = result['candidates'][0]['content']['parts'][0]['text']
            
            # Try to parse as JSON if it looks like JSON
            if text_response.strip().startswith('{') and text_response.strip().endswith('}'):
                try:
                    return json.loads(text_response)
                except json.JSONDecodeError:
                    pass
            
            # Return as text if not JSON
            return {"response": text_response}
            
        except (KeyError, IndexError) as e:
            return {"error": f"Failed to parse Gemini response: {e}"}
            
    except Exception as e:
        return {"error": f"Error calling Gemini API: {str(e)}"} 