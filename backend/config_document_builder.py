"""
Configuration for Document Builder System
Handles AI, Vector Database, Document Generation, and Templates
"""

import os
from typing import Dict, List

class DocumentBuilderConfig:
    # Google AI Configuration
    GOOGLE_API_KEY = "AIzaSyD3K4HNxRHnfATZ6n_nln3MnpdOPqoHZRs"
    GEMINI_MODEL = "gemini-2.0-flash-exp"
    GEMINI_TEMPERATURE = 0.7
    GEMINI_MAX_TOKENS = 8192
    
    # Vector Database Configuration
    CHROMA_DB_PATH = "./chroma_db"
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"
    VECTOR_COLLECTION_NAME = "farmer_schemes"
    MAX_SEARCH_RESULTS = 10
    SIMILARITY_THRESHOLD = 0.5
    
    # Document Generation Configuration
    DOCUMENT_OUTPUT_DIR = "./generated_documents"
    TEMPLATE_DIR = "./templates"
    
    # Chat Configuration
    MAX_CHAT_HISTORY = 50
    CHAT_SESSION_TIMEOUT = 7200  # 2 hours
    
    # System Prompt for AI Chatbot
    SYSTEM_PROMPT = """You are an expert agricultural assistant for Indian farmers. You have comprehensive knowledge of:
    1. All Government schemes and subsidies (Central and State)
    2. Agricultural best practices and crop management
    3. Document requirements and application processes
    4. Market information and pricing
    5. Weather and seasonal guidance

    Respond in a helpful, friendly, and conversational manner like a knowledgeable human expert.
    Always provide specific, actionable advice and ask relevant follow-up questions to better assist farmers.
    When discussing government schemes, provide accurate information about eligibility, benefits, and application processes.
    """
    
    # Document Templates Configuration
    DOCUMENT_TEMPLATES = {
        "loan_application": {
            "name": "Loan Application Form",
            "description": "Agricultural loan application with scheme details",
            "required_fields": ["farmer_name", "aadhaar_number", "land_details", "loan_amount", "scheme_name", "bank_details"],
        },
        "subsidy_application": {
            "name": "Subsidy Application Form", 
            "description": "Government subsidy application form",
            "required_fields": ["farmer_name", "aadhaar_number", "land_records", "scheme_name", "subsidy_amount", "bank_details"],
        },
        "crop_insurance": {
            "name": "Crop Insurance Application",
            "description": "PMFBY crop insurance enrollment form",
            "required_fields": ["farmer_name", "aadhaar_number", "land_details", "crop_details", "insurance_amount", "bank_details"],
        },
        "land_records": {
            "name": "Land Records Certificate",
            "description": "Land ownership and cultivation rights document",
            "required_fields": ["farmer_name", "land_survey_number", "area", "land_type", "ownership_type"],
        },
        "income_certificate": {
            "name": "Agricultural Income Certificate",
            "description": "Farmer income declaration for scheme eligibility",
            "required_fields": ["farmer_name", "aadhaar_number", "annual_income", "income_sources", "land_details"],
        },
        "machinery_subsidy": {
            "name": "Farm Machinery Subsidy Form",
            "description": "Application for agricultural machinery subsidy",
            "required_fields": ["farmer_name", "aadhaar_number", "machinery_type", "cost_estimate", "dealer_details", "bank_details"],
        },
        "organic_certification": {
            "name": "Organic Farming Certificate Application",
            "description": "PGS-India organic certification application",
            "required_fields": ["farmer_name", "land_details", "farming_practices", "input_records", "group_details"],
        },
        "general_application": {
            "name": "General Scheme Application",
            "description": "Generic application form for various schemes",
            "required_fields": ["farmer_name", "aadhaar_number", "scheme_name", "purpose", "supporting_documents", "bank_details"],
        }
    }

# Ensure required directories exist
os.makedirs(DocumentBuilderConfig.DOCUMENT_OUTPUT_DIR, exist_ok=True)
os.makedirs(DocumentBuilderConfig.CHROMA_DB_PATH, exist_ok=True)
os.makedirs(DocumentBuilderConfig.TEMPLATE_DIR, exist_ok=True)
