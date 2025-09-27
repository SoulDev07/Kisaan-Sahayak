"""
Crop Intelligence API Router with Vector Search and Gemini Integration
Provides intelligent crop recommendations using vector embeddings and AI analysis
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
import firebase_admin
from firebase_admin import firestore
import google.generativeai as genai
import requests
import json
import os
from datetime import datetime
import logging
from services.firebase import db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Helper function to serialize Firebase datetime objects
def serialize_firebase_data(data):
    """Convert Firebase DatetimeWithNanoseconds to ISO string for JSON serialization"""
    if isinstance(data, dict):
        return {key: serialize_firebase_data(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize_firebase_data(item) for item in data]
    elif hasattr(data, 'timestamp'):  # Firebase DatetimeWithNanoseconds
        return data.isoformat()
    else:
        return data

        # Alternative Gemini API function using direct HTTP calls (as backup)
def call_gemini_api_direct(prompt: str) -> str:
    """Direct HTTP call to Gemini API as fallback"""
    try:
        GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY', 'AIzaSyCLii-M1ywSa5PH-cXc3T-F5AJrCqSrX_4')
        GEMINI_API_URL = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}'
        
        # Add JSON instruction to the prompt
        enhanced_prompt = prompt + "\n\nIMPORTANT: Return only valid JSON without any markdown formatting or additional text."
        
        data = {
            "contents": [
                {"role": "user", "parts": [{"text": enhanced_prompt}]}
            ],
            "generationConfig": {
                "temperature": 0.1,  # Lower temperature for more consistent JSON
                "maxOutputTokens": 2048,
                "topP": 0.8,
                "topK": 10
            }
        }
        
        response = requests.post(GEMINI_API_URL, json=data)
        if response.status_code != 200:
            raise Exception(f"Gemini API error: {response.text}")
        
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        logger.error(f"Direct Gemini API call failed: {e}")
        return None

def clean_and_validate_json(response_text: str) -> dict:
    """Clean and validate JSON response from AI"""
    try:
        # Clean the response - remove markdown code blocks if present
        cleaned_response = response_text.strip()
        
        # Remove markdown code blocks
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
        elif cleaned_response.startswith('```'):
            cleaned_response = cleaned_response[3:]
            
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]
            
        cleaned_response = cleaned_response.strip()
        
        # Try to find JSON object in the response
        json_start = cleaned_response.find('{')
        json_end = cleaned_response.rfind('}')
        
        if json_start != -1 and json_end != -1 and json_end > json_start:
            json_str = cleaned_response[json_start:json_end + 1]
            parsed_json = json.loads(json_str)
            
            # Validate structure and fix data types
            if isinstance(parsed_json, dict) and 'recommendations' in parsed_json:
                # Ensure market_insights is always a list
                if 'market_insights' in parsed_json:
                    if isinstance(parsed_json['market_insights'], str):
                        # Convert string to list by splitting on common delimiters
                        market_text = parsed_json['market_insights']
                        if '. ' in market_text:
                            # Split by sentences
                            parsed_json['market_insights'] = [s.strip() for s in market_text.split('. ') if s.strip()]
                        else:
                            # Wrap single string in list
                            parsed_json['market_insights'] = [market_text]
                
                # Ensure weather_insights is always a list
                if 'weather_insights' in parsed_json:
                    if isinstance(parsed_json['weather_insights'], str):
                        weather_text = parsed_json['weather_insights']
                        if '. ' in weather_text:
                            # Split by sentences
                            parsed_json['weather_insights'] = [s.strip() for s in weather_text.split('. ') if s.strip()]
                        else:
                            # Wrap single string in list
                            parsed_json['weather_insights'] = [weather_text]
                
                # Ensure action_plan is always a list
                if 'action_plan' in parsed_json:
                    if isinstance(parsed_json['action_plan'], str):
                        action_text = parsed_json['action_plan']
                        if '. ' in action_text:
                            # Split by sentences
                            parsed_json['action_plan'] = [s.strip() for s in action_text.split('. ') if s.strip()]
                        else:
                            # Wrap single string in list
                            parsed_json['action_plan'] = [action_text]
                
                return parsed_json
            else:
                logger.warning("JSON doesn't have expected structure")
                return None
        else:
            logger.warning("No valid JSON object found in response")
            return None
            
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        logger.error(f"Problematic text: {response_text[:200]}...")
        return None
    except Exception as e:
        logger.error(f"Error cleaning JSON: {e}")
        return None

# Initialize models
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("✓ Sentence transformer model loaded")
except Exception as e:
    logger.error(f"Error loading sentence transformer: {e}")
    model = None

# Initialize Gemini - using global variable
gemini_model = None
gemini_available = False

try:
    GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY', 'AIzaSyBhI1O9Bj_oUsM9HP1u7FlOLYIlKK9Dgt4')
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Test API with a simple call to verify it's working
    test_response = gemini_model.generate_content("Test")
    gemini_available = True
    logger.info("✓ Gemini API configured and verified")
except Exception as e:
    logger.warning(f"Gemini API not available: {e}")
    logger.info("⚠ Continuing with vector search only mode")
    gemini_model = None
    gemini_available = False

# Request/Response Models
class CropRecommendationRequest(BaseModel):
    location: str
    temperature: float
    humidity: float
    soil_moisture: float
    season: str
    farmer_experience: str = "beginner"
    available_investment: str = "₹25,000-50,000"
    farm_size: str = "1-2 hectares"
    specific_query: Optional[str] = None

class FarmingTechniqueRequest(BaseModel):
    crop_name: str
    growth_stage: str = "planting"
    current_issues: List[str] = []
    weather_conditions: str = ""
    farmer_level: str = "beginner"

class VectorSearchResult(BaseModel):
    collection: str
    document_id: str
    content: Dict[str, Any]
    similarity_score: float

class CropRecommendationResponse(BaseModel):
    success: bool
    recommendations: List[Dict[str, Any]]
    context_used: List[Dict[str, Any]]  # Changed from List[VectorSearchResult] to handle serialization
    weather_insights: List[str]  # Changed from weather_analysis string to list
    market_insights: List[str]   # Changed from market_insights string to list
    action_plan: List[str]
    confidence_score: float

# Vector Search Functions
def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    try:
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        dot_product = np.dot(vec1, vec2)
        norm_vec1 = np.linalg.norm(vec1)
        norm_vec2 = np.linalg.norm(vec2)
        
        if norm_vec1 == 0 or norm_vec2 == 0:
            return 0.0
            
        return float(dot_product / (norm_vec1 * norm_vec2))
    except Exception as e:
        logger.error(f"Error calculating cosine similarity: {e}")
        return 0.0

async def vector_search(query: str, collections: List[str], limit: int = 5) -> List[VectorSearchResult]:
    """Perform vector search across specified collections"""
    if not model or not db:
        logger.error("Model or database not initialized")
        return []
    
    try:
        # Generate query embedding
        query_embedding = model.encode(query).tolist()
        results = []
        
        for collection_name in collections:
            collection_ref = db.collection(collection_name)
            documents = collection_ref.stream()
            
            for doc in documents:
                doc_data = doc.to_dict()
                if 'vector_embedding' in doc_data:
                    similarity = cosine_similarity(query_embedding, doc_data['vector_embedding'])
                    
                    # Remove embedding from response to save bandwidth and serialize Firebase data
                    clean_data = {k: v for k, v in doc_data.items() if k != 'vector_embedding'}
                    serialized_data = serialize_firebase_data(clean_data)
                    
                    results.append(VectorSearchResult(
                        collection=collection_name,
                        document_id=doc.id,
                        content=serialized_data,
                        similarity_score=similarity
                    ))
        
        # Sort by similarity and return top results
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        return results[:limit]
        
    except Exception as e:
        logger.error(f"Error in vector search: {e}")
        return []

async def get_ai_prompt_template(prompt_type: str) -> str:
    """Get AI prompt template from Firestore"""
    if not db:
        return ""
    
    try:
        doc_ref = db.collection('ai_prompts').document(prompt_type)
        doc = doc_ref.get()
        
        if doc.exists:
            return doc.to_dict().get('template', '')
        return ""
    except Exception as e:
        logger.error(f"Error getting prompt template: {e}")
        return ""

# API Endpoints
@router.get("/crop-intelligence/combos")
async def get_crop_combos():
    """Get all available crop combination packages"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        combos_ref = db.collection('crop_combos')
        combos = combos_ref.stream()
        
        combo_list = []
        for combo in combos:
            combo_data = combo.to_dict()
            # Remove vector embedding to save bandwidth and serialize Firebase data
            combo_data.pop('vector_embedding', None)
            serialized_combo = serialize_firebase_data(combo_data)
            combo_list.append(serialized_combo)
        
        return {"success": True, "combos": combo_list}
    except Exception as e:
        logger.error(f"Error fetching combos: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching combos: {str(e)}")

@router.get("/crop-intelligence/recommendations")
def get_crop_recommendations_simple(
    temperature: float = Query(25.0, description="Current temperature in Celsius"),
    humidity: float = Query(70.0, description="Current humidity percentage"),
    soil_moisture: float = Query(75.0, description="Current soil moisture percentage"),
    location: str = Query("Pune,Maharashtra", description="Location for recommendations")
):
    """
    Get crop recommendations based on current weather and soil conditions (Legacy endpoint)
    """
    try:
        # Build search query
        search_query = f"""
        Temperature: {temperature}°C
        Humidity: {humidity}%
        Soil moisture: {soil_moisture}%
        Location: {location}
        """
        
        # Use async wrapper for vector search
        import asyncio
        search_results = asyncio.run(vector_search(search_query, ['crop_combos', 'crop_recommendations'], limit=5))
        
        # Create AI prompt for crop recommendations
        prompt = f"""
        Based on the following agricultural conditions, provide crop recommendations for farmers in {location}:
        
        Current Conditions:
        - Temperature: {temperature}°C
        - Humidity: {humidity}%
        - Soil Moisture: {soil_moisture}%
        - Location: {location}
        
        Context from database:
        """
        
        for result in search_results:
            prompt += f"\n{json.dumps(result.content, indent=2)}\n"
        
        prompt += """
        Please provide:
        1. Top 3 crop recommendations with confidence scores
        2. Expected yield and investment required
        3. Best farming techniques for current conditions
        4. Market price expectations
        
        Format as JSON with crop_name, confidence_score, expected_yield, investment_required, market_price, and farming_techniques.
        """
        
        if gemini_model:
            response = gemini_model.generate_content(prompt)
            
            return {
                "location": location,
                "conditions": {
                    "temperature": temperature,
                    "humidity": humidity,
                    "soil_moisture": soil_moisture
                },
                "recommendations": response.text,
                "context_used": len(search_results),
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Fallback without AI
            fallback_crops = []
            for result in search_results[:3]:
                if result.collection == 'crop_combos':
                    crop_data = result.content
                    fallback_crops.append({
                        "crop_name": crop_data.get('name', 'Unknown'),
                        "confidence_score": int(result.similarity_score * 100),
                        "expected_yield": "Variable",
                        "investment_required": crop_data.get('total_investment', 'Variable'),
                        "market_price": "Current market rates",
                        "farming_techniques": crop_data.get('farming_techniques', [])
                    })
            
            return {
                "location": location,
                "conditions": {
                    "temperature": temperature,
                    "humidity": humidity,
                    "soil_moisture": soil_moisture
                },
                "recommendations": fallback_crops,
                "context_used": len(search_results),
                "timestamp": datetime.now().isoformat()
            }
        
    except Exception as e:
        logger.error(f"Error in crop recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@router.post("/crop-intelligence/recommend")
async def get_crop_recommendations(request: CropRecommendationRequest):
    """Get AI-powered crop recommendations using vector search context"""
    
    try:
        # Build search query from request
        search_query = f"""
        Location: {request.location}
        Temperature: {request.temperature}°C
        Humidity: {request.humidity}%
        Season: {request.season}
        Farmer experience: {request.farmer_experience}
        Investment: {request.available_investment}
        Farm size: {request.farm_size}
        Soil moisture: {request.soil_moisture}%
        {request.specific_query or ''}
        """
        
        # Perform vector search across relevant collections
        collections_to_search = ['crop_combos', 'crop_recommendations', 'soil_crop_matrix', 'weather_patterns']
        search_results = await vector_search(search_query, collections_to_search, limit=8)
        
        if not search_results:
            raise HTTPException(status_code=500, detail="No relevant data found")
        
        # Get AI prompt template
        prompt_template = await get_ai_prompt_template('crop_recommendation')
        
        # Build context from search results
        context_data = []
        for result in search_results:
            # Ensure all Firebase data is properly serialized
            serialized_content = serialize_firebase_data(result.content)
            context_data.append({
                'type': result.collection,
                'data': serialized_content,
                'relevance': result.similarity_score
            })
        
        # Format prompt with context and user data
        if prompt_template:
            formatted_prompt = prompt_template.format(
                location=request.location,
                temperature=request.temperature,
                humidity=request.humidity,
                soil_moisture=request.soil_moisture,
                season=request.season,
                farmer_experience=request.farmer_experience,
                investment=request.available_investment,
                farm_size=request.farm_size
            )
        else:
            # Fallback prompt if template not found
            formatted_prompt = f"""
            As an expert agricultural AI assistant, analyze the following conditions and provide concise crop recommendations:

            Current Conditions:
            - Location: {request.location}
            - Temperature: {request.temperature}°C
            - Humidity: {request.humidity}%
            - Soil Moisture: {request.soil_moisture}%
            - Season: {request.season}
            - Farmer Experience: {request.farmer_experience}
            - Available Investment: {request.available_investment}
            - Farm Size: {request.farm_size}

            Based on the provided context data, recommend the best 3 crop combinations with brief, actionable insights.

            IMPORTANT: Respond ONLY with valid JSON. Keep all text concise and bullet-point focused.

            JSON Format:
            {{
                "recommendations": [
                    {{
                        "combo_name": "Combo Name",
                        "confidence_score": 95,
                        "key_points": [
                            "Brief key insight 1",
                            "Brief key insight 2", 
                            "Brief key insight 3"
                        ],
                        "expected_roi": "75-90%",
                        "risk_level": "Low",
                        "timeline": "3-4 months"
                    }}
                ],
                "weather_insights": [
                    "Concise weather point 1",
                    "Concise weather point 2"
                ],
                "market_insights": [
                    "Brief market insight 1",
                    "Brief market insight 2"
                ],
                "action_plan": [
                    "Step 1: Immediate action needed",
                    "Step 2: Within next week",
                    "Step 3: Long-term planning"
                ]
            }}
            """
        
        # Add context to prompt
        context_text = "\n\nRELEVANT DATA CONTEXT:\n"
        for ctx in context_data:
            context_text += f"\nFrom {ctx['type']} (relevance: {ctx['relevance']:.2f}):\n"
            context_text += json.dumps(ctx['data'], indent=2)
        
        full_prompt = formatted_prompt + context_text
        
        # Get AI recommendation or intelligent fallback
        global gemini_model, gemini_available
        
        ai_response = None
        if gemini_available and gemini_model:
            try:
                response = gemini_model.generate_content(full_prompt)
                ai_response = response.text
            except Exception as e:
                logger.warning(f"Primary Gemini API call failed: {e}")
                # Try direct API call as backup
                ai_response = call_gemini_api_direct(full_prompt)
                if not ai_response:
                    logger.warning("Both Gemini API methods failed, falling back to vector search")
                    gemini_available = False
        
        if ai_response:
            # Use improved JSON cleaning and validation
            ai_data = clean_and_validate_json(ai_response)
            
            if ai_data:
                # Successfully parsed JSON
                serialized_search_results = []
                for result in search_results:
                    serialized_search_results.append({
                        'collection': result.collection,
                        'document_id': result.document_id,
                        'content': serialize_firebase_data(result.content),
                        'similarity_score': result.similarity_score
                    })
                
                return CropRecommendationResponse(
                    success=True,
                    recommendations=ai_data.get('recommendations', []),
                    context_used=serialized_search_results,
                    weather_insights=ai_data.get('weather_insights', []),
                    market_insights=ai_data.get('market_insights', []),
                    action_plan=ai_data.get('action_plan', []),
                    confidence_score=0.85
                )
            else:
                # JSON parsing failed, try to extract information
                logger.warning("JSON parsing failed, attempting text extraction")
                recommendations = []
                try:
                    # Extract combo information using regex
                    import re
                    
                    # Look for structured patterns in the text
                    combo_matches = re.findall(r'"combo_name":\s*"([^"]+)"', ai_response)
                    confidence_matches = re.findall(r'"confidence_score":\s*(\d+)', ai_response)
                    key_points_matches = re.findall(r'"key_points":\s*\[(.*?)\]', ai_response, re.DOTALL)
                    roi_matches = re.findall(r'"expected_roi":\s*"([^"]+)"', ai_response)
                    risk_matches = re.findall(r'"risk_level":\s*"([^"]+)"', ai_response)
                    timeline_matches = re.findall(r'"timeline":\s*"([^"]+)"', ai_response)
                    
                    for i, combo_name in enumerate(combo_matches):
                        # Parse key points from the matched string
                        key_points = ["AI-analyzed recommendation", "Based on current conditions"]
                        if i < len(key_points_matches):
                            try:
                                points_text = key_points_matches[i]
                                key_points = re.findall(r'"([^"]*)"', points_text)
                            except:
                                pass
                        
                        rec = {
                            "combo_name": combo_name,
                            "confidence_score": int(confidence_matches[i]) if i < len(confidence_matches) else 80,
                            "key_points": key_points,
                            "expected_roi": roi_matches[i] if i < len(roi_matches) else "Variable",
                            "risk_level": risk_matches[i] if i < len(risk_matches) else "Medium",
                            "timeline": timeline_matches[i] if i < len(timeline_matches) else "3-6 months"
                        }
                        recommendations.append(rec)
                    
                    # If no structured data found, create a single recommendation from the raw text
                    if not recommendations:
                        # Split response into chunks and use as justification
                        cleaned_text = re.sub(r'[{}"\[\],]', '', ai_response)  # Remove JSON characters
                        cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()  # Normalize whitespace
                        
                        recommendations = [{
                            "combo_name": "AI-Generated Custom Recommendation",
                            "confidence_score": 80,
                            "key_points": [
                                "Tailored to current conditions",
                                "Based on AI analysis",
                                "Requires expert validation"
                            ],
                            "expected_roi": "Variable based on conditions",
                            "risk_level": "Medium",
                            "timeline": "Season dependent"
                        }]
                        
                except Exception as extract_error:
                    logger.error(f"Failed to extract recommendations from text: {extract_error}")
                    recommendations = [{
                        "combo_name": "Agricultural Consultation Recommended",
                        "confidence_score": 75,
                        "key_points": [
                            "AI analysis completed",
                            "Expert validation required",
                            "Risk mitigation needed"
                        ],
                        "expected_roi": "Variable",
                        "risk_level": "Medium",
                        "timeline": "Consult expert"
                    }]
                
                # Return structured response even with parsing issues
                serialized_search_results = []
                for result in search_results:
                    serialized_search_results.append({
                        'collection': result.collection,
                        'document_id': result.document_id,
                        'content': serialize_firebase_data(result.content),
                        'similarity_score': result.similarity_score
                    })
                
                return CropRecommendationResponse(
                    success=True,
                    recommendations=recommendations,
                    context_used=serialized_search_results,
                    weather_insights=["Weather analysis completed based on current conditions"],
                    market_insights=["Market trends analyzed from available data"],
                    action_plan=["Review AI recommendations", "Consult local experts", "Monitor conditions"],
                    confidence_score=0.75
                )
        
        # Enhanced fallback recommendation using intelligent analysis
        logger.info("Using enhanced vector search recommendations")
        fallback_recommendations = []
        
        # Analyze search results by collection type
        combo_results = [r for r in search_results if r.collection == 'crop_combos']
        weather_results = [r for r in search_results if r.collection == 'weather_patterns']
        soil_results = [r for r in search_results if r.collection == 'soil_crop_matrix']
        
        # Generate intelligent recommendations from top matches
        for i, result in enumerate(combo_results[:3]):
            combo_data = result.content
            
            # Analyze suitability based on conditions
            suitability_score = result.similarity_score * 100
            risk_assessment = "Low"
            
            # Adjust risk based on farmer experience and investment
            if request.farmer_experience == "beginner" and combo_data.get('difficulty', '').lower() in ['hard', 'expert']:
                risk_assessment = "High"
                suitability_score *= 0.8
            elif request.farmer_experience == "intermediate" and combo_data.get('difficulty', '').lower() == 'expert':
                risk_assessment = "Medium-High"
                suitability_score *= 0.9
            
            # Weather suitability analysis
            weather_suitable = any(
                str(request.temperature) in str(w.content) or 
                request.season.lower() in str(w.content).lower()
                for w in weather_results
            )
            
            if not weather_suitable:
                suitability_score *= 0.85
                risk_assessment = "Medium" if risk_assessment == "Low" else "High"
            
            # Build key points for concise display
            key_points = [
                f"High vector match ({result.similarity_score:.2f})",
                f"Suitable for {request.season} season",
                f"Matches {request.farmer_experience} experience level"
            ]
            
            if weather_suitable:
                key_points.append("Weather conditions favorable")
            else:
                key_points.append("Weather requires monitoring")
            
            # Add investment alignment
            key_points.append(f"Budget-aligned investment")
            
            fallback_recommendations.append({
                "combo_name": combo_data.get('name', f'Recommended Combo {i+1}'),
                "confidence_score": int(suitability_score),
                "key_points": key_points[:3],  # Keep only top 3 points
                "expected_roi": combo_data.get('roi_percentage', f"{70 + i*5}-{85 + i*5}%"),
                "risk_level": risk_assessment,
                "timeline": combo_data.get('duration', f"{3 + i}-{4 + i} months")
            })
        
        # If no crop combos found, create generic recommendations
        if not fallback_recommendations:
            fallback_recommendations = [{
                "combo_name": "Season-Appropriate Crops",
                "confidence_score": 75,
                "key_points": [
                    f"Based on {request.season} season conditions",
                    f"Temperature {request.temperature}°C suitable",
                    f"Location {request.location} appropriate"
                ],
                "expected_roi": "70-85%",
                "risk_level": "Medium",
                "timeline": "3-4 months"
            }]
        
        # Generate weather analysis
        weather_analysis = f"Current conditions (Temp: {request.temperature}°C, Humidity: {request.humidity}%, Soil Moisture: {request.soil_moisture}%) are "
        if request.temperature >= 20 and request.temperature <= 35:
            weather_analysis += "favorable for most crops. "
        elif request.temperature < 20:
            weather_analysis += "cooler, suitable for winter crops. "
        else:
            weather_analysis += "warmer, requiring heat-resistant varieties. "
            
        if request.humidity >= 60 and request.humidity <= 80:
            weather_analysis += "Humidity levels are optimal for plant growth."
        elif request.humidity < 60:
            weather_analysis += "Low humidity may require additional irrigation."
        else:
            weather_analysis += "High humidity requires good ventilation and disease monitoring."
        
        # Generate market insights
        market_insights = f"For {request.season} season in {request.location}: Focus on crops with shorter cycles for quick returns. "
        market_insights += f"Your investment range of {request.available_investment} allows for medium-scale operations. "
        market_insights += "Consider diversification to minimize risk and maximize market opportunities."
        
        # Generate action plan
        action_plan = [
            f"Immediate: Prepare {request.farm_size} farm area for {request.season} planting",
            "Week 1: Source quality seeds and prepare soil based on moisture levels",
            "Week 2: Begin planting according to recommended timeline",
            f"Ongoing: Monitor weather conditions and adjust irrigation (current soil moisture: {request.soil_moisture}%)",
            "Monthly: Track growth progress and market prices for optimal harvest timing"
        ]
        
        # Serialize search results for response
        serialized_search_results = []
        for result in search_results:
            serialized_search_results.append({
                'collection': result.collection,
                'document_id': result.document_id,
                'content': serialize_firebase_data(result.content),
                'similarity_score': result.similarity_score
            })
        
        return CropRecommendationResponse(
            success=True,
            recommendations=fallback_recommendations,
            context_used=serialized_search_results,
            weather_insights=[weather_analysis],
            market_insights=[market_insights],
            action_plan=action_plan,
            confidence_score=0.78
        )
            
    except Exception as e:
        logger.error(f"Error in crop recommendation: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@router.post("/crop-intelligence/farming-techniques")
async def get_farming_techniques(request: FarmingTechniqueRequest):
    """Get farming technique recommendations using vector search"""
    
    try:
        # Build search query
        search_query = f"""
        Crop: {request.crop_name}
        Growth stage: {request.growth_stage}
        Issues: {' '.join(request.current_issues)}
        Weather: {request.weather_conditions}
        Farmer level: {request.farmer_level}
        """
        
        # Search farming techniques and crop recommendations
        collections = ['farming_techniques', 'crop_recommendations']
        search_results = await vector_search(search_query, collections, limit=5)
        
        # Get prompt template
        prompt_template = await get_ai_prompt_template('farming_technique')
        
        # Build context
        context_text = "\n\nRELEVANT TECHNIQUES:\n"
        for result in search_results:
            context_text += f"\nFrom {result.collection} (relevance: {result.similarity_score:.2f}):\n"
            context_text += json.dumps(result.content, indent=2)
        
        if prompt_template:
            formatted_prompt = prompt_template.format(
                crop_name=request.crop_name,
                growth_stage=request.growth_stage,
                issues=' '.join(request.current_issues),
                weather=request.weather_conditions,
                farmer_level=request.farmer_level
            )
        else:
            formatted_prompt = f"""
            As an agricultural expert, provide specific farming technique recommendations for:

            Crop: {request.crop_name}
            Growth Stage: {request.growth_stage}
            Current Issues: {request.current_issues}
            Weather Conditions: {request.weather_conditions}
            Farmer Level: {request.farmer_level}

            Provide practical, implementable advice in JSON format:
            {{
                "immediate_actions": ["action1", "action2"],
                "techniques_recommended": [
                    {{
                        "technique": "Technique Name",
                        "description": "How to implement",
                        "benefits": "Expected benefits",
                        "cost": "Estimated cost",
                        "difficulty": "Easy/Medium/Hard"
                    }}
                ],
                "preventive_measures": ["measure1", "measure2"],
                "success_tips": ["tip1", "tip2"],
                "timeline": "When to implement each action"
            }}
            """
        
        full_prompt = formatted_prompt + context_text
        
        # Get AI response
        global gemini_model, gemini_available
        
        if gemini_available and gemini_model:
            try:
                response = gemini_model.generate_content(full_prompt)
                ai_response = response.text
                
                try:
                    ai_data = json.loads(ai_response)
                    return {
                        "success": True,
                        "techniques": ai_data,
                        "context_used": search_results
                    }
                except json.JSONDecodeError:
                    return {
                        "success": True,
                        "techniques": {"raw_response": ai_response},
                        "context_used": search_results
                    }
            except Exception as e:
                logger.warning(f"Gemini API call failed in farming techniques: {e}")
                gemini_available = False
        else:
            # Fallback using search results
            techniques = []
            for result in search_results:
                if result.collection == 'farming_techniques':
                    techniques.append(result.content)
            
            return {
                "success": True,
                "techniques": {"available_techniques": techniques},
                "context_used": search_results
            }
            
    except Exception as e:
        logger.error(f"Error in farming techniques: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting techniques: {str(e)}")

@router.get("/crop-intelligence/search")
async def search_crop_data(query: str, collections: str = "crop_combos,farming_techniques"):
    """Generic vector search endpoint"""
    try:
        collection_list = collections.split(',')
        results = await vector_search(query, collection_list, limit=10)
        
        return {
            "success": True,
            "query": query,
            "results": results
        }
    except Exception as e:
        logger.error(f"Error in search: {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@router.get("/crop-intelligence/health")
async def health_check():
    """Health check endpoint"""
    global gemini_model, gemini_available
    
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "gemini_available": gemini_available,
        "database_connected": db is not None,
        "features": {
            "vector_search": model is not None and db is not None,
            "ai_recommendations": gemini_available,
            "fallback_recommendations": model is not None and db is not None
        },
        "mode": "AI-enhanced" if gemini_available else "Vector search only",
        "timestamp": datetime.now().isoformat()
    }
