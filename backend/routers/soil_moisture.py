from fastapi import APIRouter, Query, HTTPException
from fastapi import Body
from services.firebase import db
import json
import datetime
import os
import google.generativeai as genai

# Utility to convert timestamps in dicts/lists to strings
def convert_timestamps(obj):
    if isinstance(obj, dict):
        return {k: convert_timestamps(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_timestamps(i) for i in obj]
    elif hasattr(obj, 'isoformat'):
        return obj.isoformat()
    else:
        return obj

# Gemini API setup
GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

router = APIRouter()

@router.get("/soil-moisture")
def get_soil_data():
    """
    Endpoint to get soil moisture data from Firestore (not API).
    """
    try:
        doc_ref = db.collection('soil_data').document('latest')
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="No soil data found.")
        data = doc.to_dict().get('data', [])
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.post("/soil-moisture/ai-suggestion")
def soil_moisture_ai_suggestion(
    state: str = Body(..., embed=True),
    district: str = Body(..., embed=True)
):
    try:
        from services.soil_moisture import get_soil_moisture_data
        records = get_soil_moisture_data(state, district)
        if not records:
            return {"suggestions": ["No soil data found for this district."]}
        latest = records[0]
        latest_serializable = convert_timestamps(latest)
        context = f"Soil moisture data for {district}, {state}:\n" + json.dumps(latest_serializable, indent=2)
        
        # Enhanced prompt with more agricultural context and specific guidance
        prompt = (
            "You are an expert agricultural assistant specializing in Indian farming practices. "
            "Analyze the following soil moisture data for a district in India and provide tailored advice. "
            "\n\n"
            f"LOCATION: {district}, {state}, India\n"
            f"SOIL DATA: {context}\n\n"
            "INSTRUCTIONS:\n"
            "1. Interpret the soil moisture values in relation to optimal levels for crops commonly grown in this region.\n"
            "2. Consider the current season in India and its implications for farming activities.\n"
            "3. Provide 3 specific, actionable suggestions that are:\n"
            "   a) Practical for small-scale farmers with limited resources\n"
            "   b) Specific to crops commonly grown in this district/state\n"
            "   c) Culturally appropriate for Indian farming communities\n"
            "   d) Implementable with locally available tools and materials\n"
            "4. Include guidance on water management, irrigation timing, or moisture conservation as appropriate.\n"
            "5. Mention specific crop varieties that would perform well under these moisture conditions.\n"
            "6. If moisture levels are problematic (too high/low), suggest affordable mitigation strategies.\n\n"
            "Use simple language with some Hindi/local terms where appropriate. Format each suggestion as a separate, concise point."
        )
        # Use Gemini 2.5 Flash model
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        text = response.text
        suggestions = []
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
        return {"suggestions": suggestions}
    except Exception as e:
        return {"suggestions": [f"Error: {str(e)}"]} 