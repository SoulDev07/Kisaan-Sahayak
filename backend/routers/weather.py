from fastapi import APIRouter, Query, HTTPException
from services.weather import (
    get_weather_by_city, get_weather_by_coords,
    get_forecast_by_city, get_forecast_by_coords,
    get_air_quality,
    geocode_city, reverse_geocode, get_weather_tile_url
)
from services.gemini import GEMINI_API_URL
import requests
from services.firebase import db

router = APIRouter()

@router.get("/weather/city")
def weather_by_city(city: str = Query(..., description="City name, e.g. Pune,IN")):
    try:
        data = get_weather_by_city(city)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/weather/coords")
def weather_by_coords(lat: float = Query(...), lon: float = Query(...)):
    try:
        data = get_weather_by_coords(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/weather/forecast/city")
def forecast_by_city(city: str = Query(..., description="City name, e.g. Pune,IN")):
    try:
        data = get_forecast_by_city(city)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/weather/forecast/coords")
def forecast_by_coords(lat: float = Query(...), lon: float = Query(...)):
    try:
        data = get_forecast_by_coords(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/weather/air_quality")
def air_quality(lat: float = Query(...), lon: float = Query(...)):
    try:
        data = get_air_quality(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/weather/geocode")
def geocode(city: str = Query(None), lat: float = Query(None), lon: float = Query(None)):
    try:
        if city:
            data = geocode_city(city)
            return data
        elif lat is not None and lon is not None:
            data = reverse_geocode(lat, lon)
            return data
        else:
            raise HTTPException(status_code=400, detail="Provide either city or both lat and lon.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/weather/map_tile_url")
def map_tile_url(layer: str = Query(...), z: int = Query(...), x: int = Query(...), y: int = Query(...)):
    try:
        url = get_weather_tile_url(layer, z, x, y)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/weather/ai-analysis")
def weather_ai_analysis(farmer_id: str = Query(..., description="Farmer ID")):
    """
    Generate AI-powered weather insights for the farmer's location using Gemini.
    """
    # Fetch farmer profile (for location)
    doc_ref = db.collection('farmers').document(farmer_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Farmer not found")
    data = doc.to_dict()
    profile = data.get('profile', data)  # fallback to root if no 'profile' field
    farm_location = profile.get('farmLocation') or data.get('farmLocation')
    village = profile.get('village', '')
    if not farm_location or not farm_location.get('lat') or not farm_location.get('lng'):
        return {"analysis": "No farm location set for this farmer."}
    lat, lon = farm_location['lat'], farm_location['lng']
    # Fetch latest weather for this location
    from services.weather import get_weather_by_coords
    try:
        weather = get_weather_by_coords(lat, lon)
    except Exception as e:
        return {"analysis": f"Failed to fetch weather: {str(e)}"}
    # Build context string
    context = f"Weather for {village} ({lat:.3f}, {lon:.3f}):\n" + str(weather)
    
    # Enhanced weather analysis prompt for agricultural insights
    prompt = (
        "You are an expert agricultural advisor specializing in Indian farming. "
        "Analyze this weather data for a farm in India and provide actionable insights for the farmer.\n\n"
        f"LOCATION: {village} (Coordinates: {lat:.3f}, {lon:.3f})\n"
        f"WEATHER DATA: {context}\n\n"
        "ANALYSIS REQUIREMENTS:\n"
        "1. Crop Impact Analysis: How does this weather affect crops commonly grown in this region of India?\n"
        "2. Weather Pattern Assessment: Is this normal/unusual for this region and current season?\n"
        "3. Short-term Actions: What immediate actions should the farmer take in the next 24-48 hours?\n"
        "4. Medium-term Planning: What preparations should be made for the coming week?\n"
        "5. Risk Assessment: Identify any weather-related risks and their mitigation.\n\n"
        "RESPONSE FORMAT:\n"
        "- Begin with a brief 1-2 sentence summary of the overall weather situation\n"
        "- Provide 3-4 specific, actionable recommendations formatted as bullet points\n"
        "- Ensure recommendations are practical for small-scale Indian farmers\n"
        "- Use simple language with occasional Hindi/regional terms for clarity\n"
        "- Focus on crop protection, water management, and timing of farm activities\n"
        "- Reference traditional weather indicators familiar to Indian farmers when relevant\n"
        "- If extreme weather is detected, prioritize safety and damage prevention advice\n"
    )
    data = {
        "contents": [
            {"role": "user", "parts": [{"text": prompt}]}
        ]
    }
    response = requests.post(GEMINI_API_URL, json=data)
    if response.status_code != 200:
        return {"analysis": f"Gemini API error: {response.text}"}
    result = response.json()
    # Parse suggestions from the response
    try:
        text = result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        text = f"Error parsing Gemini response: {e}"
    return {"analysis": text} 