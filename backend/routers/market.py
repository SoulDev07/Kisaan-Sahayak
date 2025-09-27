from fastapi import APIRouter, Query, HTTPException, Body
from services.firebase import db
import os
import requests
from services.gemini import GEMINI_API_URL

router = APIRouter()

@router.get("/market/prices")
def get_prices(
    commodity: str = Query(None, description="Commodity to search for, e.g., 'Wheat'"),
):
    """
    Endpoint to get market prices for a given commodity (from Firestore, not API).
    """
    try:
        doc_ref = db.collection('market_data').document('latest')
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="No market data found.")
        data = doc.to_dict().get('data', [])
        if commodity:
            filtered = [item for item in data if (item.get('commodity') or item.get('Commodity', '')).lower() == commodity.lower()]
            return filtered
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.post("/market/ai-recommendations")
def market_ai_recommendations(
    state: str = Body(...),
    commodity: str = Body(...),
    district: str = Body(None),
    farmer_profile: dict = Body(None)
):
    """
    Generates AI-powered market insights and recommendations for farmers based on price data.
    """
    try:
        # Get market data
        doc_ref = db.collection('market_data').document('latest')
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="No market data found.")
        
        all_data = doc.to_dict().get('data', [])
        
        # Filter data based on parameters
        filtered_data = [item for item in all_data if 
            (item.get('commodity') or item.get('Commodity', '')).lower() == commodity.lower() and
            (item.get('state') or item.get('State', '')).lower() == state.lower()]
        
        if district:
            filtered_data = [item for item in filtered_data if 
                (item.get('district') or item.get('District', '')).lower() == district.lower()]
        
        if not filtered_data:
            return {"recommendations": ["No market data available for this selection."]}
        
        # Build context for AI prompt
        market_context = f"Market data for {commodity} in {state}"
        if district:
            market_context += f", {district}"
        market_context += ":\n"
        
        # Format market data
        for i, item in enumerate(filtered_data[:10]):  # Limit to 10 items for context size
            market = item.get('market') or item.get('Market', 'Unknown')
            price = item.get('modal_price') or item.get('Modal_Price', 'Unknown')
            variety = item.get('variety') or item.get('Variety', 'Unknown')
            arrival_date = item.get('arrival_date') or item.get('Arrival_Date', 'Unknown')
            market_context += f"{i+1}. Market: {market}, Variety: {variety}, Price: ₹{price}/quintal, Date: {arrival_date}\n"
        
        # Add farmer profile context if available
        farmer_context = ""
        if farmer_profile:
            farmer_context = "Farmer details:\n"
            farmer_context += f"- Location: {farmer_profile.get('village', '')}, {farmer_profile.get('district', '')}\n"
            farmer_context += f"- Land size: {farmer_profile.get('land_size', 'Unknown')} acres\n"
            farmer_context += f"- Current crops: {', '.join(farmer_profile.get('crops', []))}\n"
            farmer_context += f"- Transportation access: {farmer_profile.get('has_transportation', 'Unknown')}\n"
        
        # Create voice-friendly prompt for market insights
        prompt = (
            "You are a friendly voice assistant helping farmers with market prices. "
            f"Give a SHORT, conversational response about {commodity} prices. "
            "Speak naturally like you're advising a friend. Keep it under 40 words total.\n\n"
            f"{market_context}\n"
            f"{farmer_context}\n"
            "Focus on: current price, whether it's good/bad, and one simple selling tip."
        )
        
        data = {
            "contents": [
                {"role": "user", "parts": [{"text": prompt}]}
            ]
        }
        
        response = requests.post(GEMINI_API_URL, json=data)
        if response.status_code != 200:
            return {"recommendations": [f"AI service error: {response.text}"]}
            
        result = response.json()
        
        try:
            text = result['candidates'][0]['content']['parts'][0]['text']
            
            # Process the response into recommendations format
            lines = text.split('\n')
            recommendations = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                if line.startswith('- ') or line.startswith('• ') or (len(line) > 2 and line[0].isdigit() and line[1] == '.'):
                    clean_line = line.lstrip('- •').lstrip('0123456789').lstrip('.) ')
                    recommendations.append(clean_line)
            
            # If we couldn't extract structured recommendations, return the whole text
            if not recommendations:
                recommendations = [text]
                
            return {"recommendations": recommendations}
        
        except Exception as e:
            return {"recommendations": [f"Error parsing AI response: {e}"]}
            
    except Exception as e:
        return {"recommendations": [f"An error occurred: {str(e)}"]} 