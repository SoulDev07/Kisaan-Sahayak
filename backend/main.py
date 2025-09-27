from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# --- Modular Routers ---
from routers import farmer
from routers import weather
from routers import crop_disease
from routers import crop_intelligence
from routers import chat_rag
from routers import market
from routers import soil_moisture
from routers import rental
from routers import crop_cycle
from routers import crop_marketplace
from routers.speech_to_text import router as speech_to_text_router
from routers.voice_command import router as voice_command_router
from routers.chat_rag_whatsapp import router as chat_rag_whatsapp_router
from routers.document_builder import router as document_builder_router
from routers.hybrid_offline import router as hybrid_offline_router
from routers.config_helper import router as config_helper_router
from routers.waste_recycling import router as waste_recycling_router
from routers.suicide_prevention import router as suicide_prevention_router
from routers.document_generator import router as document_generator_router

app = FastAPI(
    title="Farmer Assistant API",
    description="Comprehensive API for farmer assistance including AI chatbot, document builder, and government schemes",
    version="2.0.0"
)

# Allow CORS for local development (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

app.include_router(farmer.router)
app.include_router(weather.router)
app.include_router(crop_disease.router)
app.include_router(crop_intelligence.router)
app.include_router(chat_rag.router)
app.include_router(market.router)
app.include_router(crop_marketplace.router, prefix="/marketplace")
app.include_router(soil_moisture.router)
app.include_router(rental.router, prefix="/rental")
app.include_router(crop_cycle.router, prefix="/crop-cycle")
app.include_router(speech_to_text_router)
app.include_router(voice_command_router)
app.include_router(document_builder_router)
app.include_router(document_generator_router)
app.include_router(chat_rag_whatsapp_router)
app.include_router(hybrid_offline_router)
app.include_router(config_helper_router)
app.include_router(waste_recycling_router)
app.include_router(suicide_prevention_router)


@app.get("/")
def root():
    return {
        "message": "FastAPI backend for Farmer App is running!",
        "version": "2.0.0",
        "features": [
            "AI Chatbot with Gemini 2.5 Flash",
            "Document Builder System",
            "Government Schemes Database",
            "Vector Search & Retrieval",
            "Voice Command Processing",
            "Crop Intelligence & Disease Detection",
            "Weather & Market Information",
            "Farmer Profiles & Management",
            "Comprehensive Crop Marketplace",
            "Advanced Equipment Rental System",
            "Complete Crop Cycle Management",
            "AI-Powered Crop Recommendations"
        ],
        "new_comprehensive_modules": {
            "crop_marketplace": {
                "description": "Complete marketplace for buying/selling crops",
                "endpoints": "/marketplace/crops",
                "features": ["Search", "Filters", "Orders", "Analytics"]
            },
            "enhanced_rental": {
                "description": "Advanced equipment rental system",
                "endpoints": "/rental/items",
                "features": ["Bookings", "Reviews", "Analytics", "Categories"]
            },
            "crop_cycle_management": {
                "description": "Full crop lifecycle management",
                "endpoints": "/crop-cycle/crops",
                "features": ["CRUD Operations", "Task Management", "Analytics", "Recommendations"]
            }
        },
        "api_stats": {
            "total_routes": 189,
            "total_modules": 14,
            "ai_integrated_endpoints": 13
        }
    }
