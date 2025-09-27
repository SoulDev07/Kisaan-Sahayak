"""
Hybrid Offline/Online Backend Router
Automatically switches between online API calls and offline JSON data based on connectivity
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, List, Any, Optional
import json
import os
import asyncio
from datetime import datetime
import requests
from pathlib import Path

# Import your existing services
try:
    from services.gemini import GEMINI_API_URL
    from services.firebase import db
    ONLINE_SERVICES_AVAILABLE = True
except ImportError:
    ONLINE_SERVICES_AVAILABLE = False
    print("⚠️ Online services not available, running in offline mode")

class HybridDataManager:
    def __init__(self, offline_data_dir: str = "offline_data"):
        self.offline_data_dir = offline_data_dir
        self.offline_data = {}
        self.is_online = self._check_connectivity()
        self._load_offline_data()
    
    def _check_connectivity(self) -> bool:
        """Check if online services are available"""
        try:
            response = requests.get("https://www.google.com", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def _load_offline_data(self):
        """Load all offline JSON data into memory"""
        if not os.path.exists(self.offline_data_dir):
            print(f"❌ Offline data directory not found: {self.offline_data_dir}")
            return
        
        for filename in os.listdir(self.offline_data_dir):
            if filename.endswith('.json'):
                try:
                    filepath = os.path.join(self.offline_data_dir, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        key = filename.replace('.json', '')
                        self.offline_data[key] = data
                        print(f"✅ Loaded offline data: {filename}")
                except Exception as e:
                    print(f"❌ Error loading {filename}: {e}")
    
    async def get_data(self, data_type: str, **params) -> Dict[str, Any]:
        """Get data with automatic fallback to offline"""
        try:
            # Try online first if available
            if self.is_online and ONLINE_SERVICES_AVAILABLE:
                online_result = await self._get_online_data(data_type, **params)
                if online_result:
                    return {"source": "online", "data": online_result}
        except Exception as e:
            print(f"⚠️ Online fetch failed: {e}, falling back to offline")
        
        # Fallback to offline data
        offline_result = self._get_offline_data(data_type, **params)
        return {"source": "offline", "data": offline_result}
    
    async def _get_online_data(self, data_type: str, **params) -> Any:
        """Fetch data from online services"""
        # This would call your existing online services
        # Implementation depends on the specific data type
        pass
    
    def _get_offline_data(self, data_type: str, **params) -> Any:
        """Get data from offline JSON files"""
        if data_type in self.offline_data:
            return self.offline_data[data_type].get('data', {})
        return {}
    
    def search_offline(self, query: str, limit: int = 10) -> List[Dict]:
        """Search across all offline data"""
        results = []
        query_lower = query.lower()
        
        # Load search index if available
        if 'comprehensive_search_index' in self.offline_data:
            search_index = self.offline_data['comprehensive_search_index']
            searchable_items = search_index.get('searchable_items', [])
            
            for item in searchable_items:
                if query_lower in item.get('text', '').lower():
                    results.append({
                        'text': item.get('text', ''),
                        'source': item.get('source_category', ''),
                        'data': item.get('original_data', {}),
                        'relevance_score': self._calculate_relevance(query_lower, item.get('text', ''))
                    })
            
            # Sort by relevance and limit results
            results.sort(key=lambda x: x['relevance_score'], reverse=True)
            return results[:limit]
        
        return results
    
    def _calculate_relevance(self, query: str, text: str) -> float:
        """Simple relevance scoring"""
        text_lower = text.lower()
        words = query.split()
        score = 0
        
        for word in words:
            if word in text_lower:
                score += 1
        
        return score / len(words) if words else 0

# Initialize hybrid manager
hybrid_manager = HybridDataManager()

# Create hybrid router
hybrid_router = APIRouter(prefix="/hybrid", tags=["Hybrid Offline/Online"])

@hybrid_router.get("/status")
async def get_system_status():
    """Get current system status (online/offline)"""
    return {
        "is_online": hybrid_manager.is_online,
        "online_services_available": ONLINE_SERVICES_AVAILABLE,
        "offline_data_loaded": len(hybrid_manager.offline_data),
        "mode": "hybrid",
        "offline_collections": list(hybrid_manager.offline_data.keys())
    }

@hybrid_router.get("/market/prices")
async def get_market_prices_hybrid(commodity: str = Query(None)):
    """Get market prices with offline fallback"""
    try:
        if hybrid_manager.is_online:
            # Try online first
            from routers.market import get_prices
            try:
                return await hybrid_manager.get_data("market_prices", commodity=commodity)
            except:
                pass
        
        # Fallback to offline
        offline_data = hybrid_manager.offline_data.get('market_data', {}).get('data', [])
        if commodity:
            filtered_data = [item for item in offline_data 
                           if commodity.lower() in str(item).lower()]
            return {"source": "offline", "data": filtered_data}
        
        return {"source": "offline", "data": offline_data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@hybrid_router.get("/weather/city")
async def get_weather_hybrid(city: str = Query(...)):
    """Get weather with offline fallback"""
    try:
        if hybrid_manager.is_online:
            # Try online weather API
            try:
                from routers.weather import weather_by_city
                return weather_by_city(city)
            except:
                pass
        
        # Fallback to offline weather data
        offline_weather = hybrid_manager.offline_data.get('parameterized_routes_data', {})
        weather_data = offline_weather.get('data', {}).get('weather_by_city', {})
        
        if city in weather_data:
            return {"source": "offline", "data": weather_data[city]}
        
        # Return sample weather data if specific city not found
        sample_weather = {
            "city": city,
            "temperature": 25,
            "humidity": 65,
            "description": "Partly cloudy (offline mode)",
            "offline": True
        }
        return {"source": "offline", "data": sample_weather}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@hybrid_router.post("/chat/rag")
async def chat_hybrid(request: dict = Body(...)):
    """Hybrid chat with enhanced offline RAG"""
    try:
        user_query = request.get('user_query', '')
        chat_history = request.get('chat_history', '')
        section = request.get('section', 'crops')
        top_k = request.get('top_k', 5)
        
        if hybrid_manager.is_online and ONLINE_SERVICES_AVAILABLE:
            try:
                # Try online RAG first
                from routers.chat_rag import chat_rag_endpoint
                from pydantic import BaseModel
                
                class RAGChatRequest(BaseModel):
                    user_query: str
                    chat_history: str = ""
                    section: str = "crops"
                    top_k: int = 3
                    image: dict = None
                
                rag_request = RAGChatRequest(
                    user_query=user_query,
                    chat_history=chat_history,
                    section=section,
                    top_k=top_k
                )
                
                online_result = chat_rag_endpoint(rag_request)
                online_result['source'] = 'online'
                return online_result
                
            except Exception as e:
                print(f"Online RAG failed: {e}, falling back to offline")
        
        # Enhanced offline RAG
        from services.offline_rag import get_offline_rag_engine
        
        rag_engine = get_offline_rag_engine()
        offline_result = rag_engine.process_rag_query(user_query, chat_history, section, top_k)
        
        return offline_result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@hybrid_router.get("/search")
async def search_hybrid(q: str = Query(...), limit: int = Query(10)):
    """Search across all offline data"""
    try:
        results = hybrid_manager.search_offline(q, limit)
        return {
            "query": q,
            "results": results,
            "total_found": len(results),
            "source": "offline"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@hybrid_router.get("/crop-intelligence/recommend")
async def crop_intelligence_hybrid(
    location: str = Query(...),
    temperature: float = Query(...),
    humidity: float = Query(...),
    soil_moisture: float = Query(...),
    season: str = Query(...)
):
    """Crop intelligence with offline fallback"""
    try:
        if hybrid_manager.is_online:
            try:
                # Try online crop intelligence
                from routers.crop_intelligence import recommend_crops
                # Call online service
                pass
            except:
                pass
        
        # Offline recommendation logic
        offline_crops = hybrid_manager.offline_data.get('processed_crop_specific_data.json', {}).get('data', {})
        
        # Simple rule-based recommendations for offline mode
        recommendations = []
        
        if isinstance(offline_crops, dict):
            for crop_type, crops in offline_crops.items():
                if isinstance(crops, list):
                    for crop in crops:
                        if isinstance(crop, dict):
                            # Simple matching logic
                            if (season.lower() in str(crop).lower() or 
                                location.lower() in str(crop).lower()):
                                recommendations.append({
                                    "crop_name": crop.get('name', 'Unknown'),
                                    "suitability": "Medium",
                                    "reason": f"Suitable for {season} season in {location} (offline mode)",
                                    "data": crop
                                })
        
        return {
            "source": "offline",
            "recommendations": recommendations[:5],
            "note": "These are offline recommendations based on cached data"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Export the router
router = hybrid_router
