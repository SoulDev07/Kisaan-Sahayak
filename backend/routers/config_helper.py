"""
Frontend Configuration Helper for Offline/Online Mode
This helps the frontend understand which endpoints to use
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any
import json
import os

router = APIRouter(prefix="/config", tags=["Configuration"])

@router.get("/endpoints")
async def get_endpoint_configuration():
    """Get endpoint configuration for frontend"""
    
    # Check if offline data is available
    offline_available = os.path.exists("offline_data")
    online_available = True  # You can add connectivity check here
    
    config = {
        "mode": "hybrid" if (offline_available and online_available) else ("offline" if offline_available else "online"),
        "offline_available": offline_available,
        "online_available": online_available,
        "endpoints": {
            "market": {
                "online": "/market/prices",
                "offline": "/hybrid/market/prices",
                "hybrid": "/hybrid/market/prices"
            },
            "weather": {
                "online": "/weather/city",
                "offline": "/hybrid/weather/city", 
                "hybrid": "/hybrid/weather/city"
            },
            "chat": {
                "online": "/chat/rag",
                "offline": "/hybrid/chat/rag",
                "hybrid": "/hybrid/chat/rag"
            },
            "crop_intelligence": {
                "online": "/crop-intelligence/recommend",
                "offline": "/hybrid/crop-intelligence/recommend",
                "hybrid": "/hybrid/crop-intelligence/recommend"
            },
            "search": {
                "online": "/crop-intelligence/search",
                "offline": "/hybrid/search",
                "hybrid": "/hybrid/search"
            }
        },
        "offline_capabilities": [
            "market_prices",
            "weather_basic",
            "crop_recommendations",
            "search",
            "chat_basic"
        ],
        "requires_online": [
            "gemini_ai_analysis",
            "real_time_weather",
            "live_market_prices",
            "voice_processing",
            "pdf_generation"
        ]
    }
    
    return config

@router.get("/offline-status")
async def get_offline_status():
    """Get detailed offline data status"""
    
    offline_data_dir = "offline_data"
    status = {
        "offline_data_available": False,
        "files": [],
        "total_records": 0,
        "last_updated": None,
        "search_enabled": False
    }
    
    if os.path.exists(offline_data_dir):
        status["offline_data_available"] = True
        
        for filename in os.listdir(offline_data_dir):
            if filename.endswith('.json'):
                try:
                    filepath = os.path.join(offline_data_dir, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                        file_info = {
                            "filename": filename,
                            "size_kb": round(os.path.getsize(filepath) / 1024, 2),
                            "records": len(data.get('data', [])) if isinstance(data.get('data'), list) else 'N/A',
                            "last_updated": data.get('last_updated', 'Unknown')
                        }
                        
                        status["files"].append(file_info)
                        
                        if isinstance(data.get('data'), list):
                            status["total_records"] += len(data['data'])
                        
                        if filename == 'comprehensive_search_index.json':
                            status["search_enabled"] = True
                            status["searchable_items"] = data.get('total_items', 0)
                
                except Exception as e:
                    status["files"].append({
                        "filename": filename,
                        "error": str(e)
                    })
    
    return status
