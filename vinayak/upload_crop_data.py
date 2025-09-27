import json
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai
import numpy as np
from typing import List, Dict, Any
import os
from datetime import datetime

# Use sentence-transformers for embedding to match backend
from sentence_transformers import SentenceTransformer

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize sentence transformer model (must match backend)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embedding(text: str) -> List[float]:
    """Generate embedding using sentence transformers (384-dim)"""
    try:
        embedding = embedding_model.encode(text)
        return embedding.tolist()
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return [0.1] * 384

def create_searchable_text(data: Dict[Any, Any], prefix: str = "") -> str:
    """Convert nested dictionary to searchable text"""
    text_parts = []
    
    for key, value in data.items():
        if isinstance(value, dict):
            text_parts.append(create_searchable_text(value, f"{prefix}{key} "))
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    text_parts.append(create_searchable_text(item, f"{prefix}{key} "))
                else:
                    text_parts.append(f"{prefix}{key}: {str(item)}")
        else:
            text_parts.append(f"{prefix}{key}: {str(value)}")
    
    return " ".join(text_parts)

def delete_existing_collection():
    """Delete all documents in the crop_cycle_data collection"""
    print("Deleting existing crop_cycle_data collection...")
    collection_ref = db.collection('crop_cycle_data')
    docs = collection_ref.stream()
    deleted_count = 0
    for doc in docs:
        doc.reference.delete()
        deleted_count += 1
    print(f"Deleted {deleted_count} existing documents")

def process_and_upload_crop_data():
    """Process crop cycle data and upload to Firebase with embeddings"""
    
    # Delete existing collection first
    delete_existing_collection()
    
    # Load the real data
    with open('crop_cycle_real_data.json', 'r', encoding='utf-8') as f:
        crop_data = json.load(f)
    
    collection_ref = db.collection('crop_cycle_data')
    
    # Process corporate buyers
    print("Processing corporate buyers...")
    for crop, buyers in crop_data['corporate_buyers'].items():
        for buyer in buyers:
            # Create searchable text
            searchable_text = create_searchable_text(buyer, f"Corporate buyer for {crop} ")
            
            # Generate embedding
            embedding = generate_embedding(searchable_text)
            
            # Prepare document
            doc_data = {
                'type': 'corporate_buyer',
                'crop': crop,
                'data': buyer,
                'searchable_text': searchable_text,
                'embedding': embedding,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            # Upload to Firebase
            doc_ref = collection_ref.document(f"buyer_{crop}_{buyer['id']}")
            doc_ref.set(doc_data)
            print(f"Uploaded buyer: {buyer['name']} for {crop}")
    
    # Process loan schemes
    print("Processing loan schemes...")
    for scheme_name, scheme_data in crop_data['loan_schemes'].items():
        searchable_text = create_searchable_text(scheme_data, f"Loan scheme {scheme_name} ")
        embedding = generate_embedding(searchable_text)
        
        doc_data = {
            'type': 'loan_scheme',
            'scheme_name': scheme_name,
            'data': scheme_data,
            'searchable_text': searchable_text,
            'embedding': embedding,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        doc_ref = collection_ref.document(f"loan_{scheme_name.replace(' ', '_').lower()}")
        doc_ref.set(doc_data)
        print(f"Uploaded loan scheme: {scheme_name}")
    
    # Process insurance plans
    print("Processing insurance plans...")
    for plan_name, plan_data in crop_data['insurance_plans'].items():
        searchable_text = create_searchable_text(plan_data, f"Insurance plan {plan_name} ")
        embedding = generate_embedding(searchable_text)
        
        doc_data = {
            'type': 'insurance_plan',
            'plan_name': plan_name,
            'data': plan_data,
            'searchable_text': searchable_text,
            'embedding': embedding,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        doc_ref = collection_ref.document(f"insurance_{plan_name.lower()}")
        doc_ref.set(doc_data)
        print(f"Uploaded insurance plan: {plan_name}")
    
    # Process certification providers
    print("Processing certification providers...")
    for cert_type, cert_data in crop_data['certification_providers'].items():
        searchable_text = create_searchable_text(cert_data, f"Certification {cert_type} ")
        embedding = generate_embedding(searchable_text)
        
        doc_data = {
            'type': 'certification',
            'certification_type': cert_type,
            'data': cert_data,
            'searchable_text': searchable_text,
            'embedding': embedding,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        doc_ref = collection_ref.document(f"cert_{cert_type.lower()}")
        doc_ref.set(doc_data)
        print(f"Uploaded certification: {cert_type}")
    
    # Process mandi information
    print("Processing mandi information...")
    for mandi_name, mandi_data in crop_data['mandi_information'].items():
        searchable_text = create_searchable_text(mandi_data, f"Mandi {mandi_name} ")
        embedding = generate_embedding(searchable_text)
        
        doc_data = {
            'type': 'mandi',
            'mandi_name': mandi_name,
            'data': mandi_data,
            'searchable_text': searchable_text,
            'embedding': embedding,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        doc_ref = collection_ref.document(f"mandi_{mandi_name.replace(' ', '_').replace(',', '').lower()}")
        doc_ref.set(doc_data)
        print(f"Uploaded mandi: {mandi_name}")
    
    # Process solar providers
    print("Processing solar providers...")
    for provider_name, provider_data in crop_data['solar_providers'].items():
        searchable_text = create_searchable_text(provider_data, f"Solar scheme {provider_name} ")
        embedding = generate_embedding(searchable_text)
        
        doc_data = {
            'type': 'solar_scheme',
            'scheme_name': provider_name,
            'data': provider_data,
            'searchable_text': searchable_text,
            'embedding': embedding,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        doc_ref = collection_ref.document(f"solar_{provider_name.replace('-', '_').lower()}")
        doc_ref.set(doc_data)
        print(f"Uploaded solar scheme: {provider_name}")
    
    # Process soil testing labs
    print("Processing soil testing labs...")
    for lab_type, labs in crop_data['soil_testing_labs'].items():
        for i, lab in enumerate(labs):
            searchable_text = create_searchable_text(lab, f"Soil testing lab {lab_type} ")
            embedding = generate_embedding(searchable_text)
            
            doc_data = {
                'type': 'soil_testing_lab',
                'lab_type': lab_type,
                'data': lab,
                'searchable_text': searchable_text,
                'embedding': embedding,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            doc_ref = collection_ref.document(f"soil_lab_{lab_type.lower()}_{i}")
            doc_ref.set(doc_data)
            print(f"Uploaded soil lab: {lab.get('name', f'{lab_type} lab {i}')}")
    
    # Process government schemes
    print("Processing government schemes...")
    for scheme_name, scheme_data in crop_data['government_schemes'].items():
        searchable_text = create_searchable_text(scheme_data, f"Government scheme {scheme_name} ")
        embedding = generate_embedding(searchable_text)
        
        doc_data = {
            'type': 'government_scheme',
            'scheme_name': scheme_name,
            'data': scheme_data,
            'searchable_text': searchable_text,
            'embedding': embedding,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        doc_ref = collection_ref.document(f"gov_scheme_{scheme_name}")
        doc_ref.set(doc_data)
        print(f"Uploaded government scheme: {scheme_name}")
    
    print("All data uploaded successfully!")

def create_crop_specific_recommendations():
    """Create crop-specific recommendations with embeddings"""
    
    crop_recommendations = {
        "Rice": {
            "best_practices": [
                "Maintain 2-3 inches of standing water during tillering stage",
                "Apply nitrogen in 3 splits: 50% basal, 25% tillering, 25% panicle initiation",
                "Use SRI (System of Rice Intensification) method for 20-30% higher yield",
                "Monitor for brown plant hopper and stem borer during critical growth stages"
            ],
            "optimal_conditions": {
                "temperature": "20-27°C",
                "rainfall": "1200-2500mm annually",
                "soil_ph": "5.5-6.5",
                "soil_type": "Clay or clay loam with good water retention"
            },
            "market_timing": "October-November for Kharif, March-April for Rabi",
            "storage_tips": [
                "Dry to 14% moisture content before storage",
                "Use hermetic storage bags for small quantities",
                "Regular monitoring for pest infestation"
            ]
        },
        "Wheat": {
            "best_practices": [
                "Sow between November 15 to December 15 for optimal yield",
                "Apply 120kg N, 60kg P2O5, 40kg K2O per hectare",
                "Ensure adequate soil moisture during crown root formation",
                "Monitor for rust diseases and aphid infestation"
            ],
            "optimal_conditions": {
                "temperature": "15-25°C during growing season",
                "rainfall": "400-700mm annually",
                "soil_ph": "6.0-7.5",
                "soil_type": "Well-drained loamy soil"
            },
            "market_timing": "April-May for optimal prices",
            "storage_tips": [
                "Dry to 12% moisture content",
                "Store in cool, dry place with good ventilation",
                "Use phosphine fumigation for large storage"
            ]
        },
        "Cotton": {
            "best_practices": [
                "Maintain plant population of 1-1.5 lakh plants per hectare",
                "Apply FYM 10-15 tonnes per hectare before sowing",
                "Regular monitoring for bollworm and whitefly",
                "Picking should be done at proper maturity for quality fiber"
            ],
            "optimal_conditions": {
                "temperature": "21-27°C during growing season",
                "rainfall": "500-1000mm annually",
                "soil_ph": "5.8-8.0",
                "soil_type": "Deep, well-drained black cotton soil"
            },
            "market_timing": "November-December for better prices",
            "storage_tips": [
                "Store in moisture-proof containers",
                "Maintain 8% moisture content",
                "Regular inspection for pest damage"
            ]
        }
    }
    
    collection_ref = db.collection('crop_cycle_data')
    
    for crop, recommendations in crop_recommendations.items():
        searchable_text = create_searchable_text(recommendations, f"Crop recommendations for {crop} ")
        embedding = generate_embedding(searchable_text)
        
        doc_data = {
            'type': 'crop_recommendations',
            'crop': crop,
            'data': recommendations,
            'searchable_text': searchable_text,
            'embedding': embedding,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        doc_ref = collection_ref.document(f"recommendations_{crop.lower()}")
        doc_ref.set(doc_data)
        print(f"Uploaded recommendations for: {crop}")

if __name__ == "__main__":
    print("Starting data upload process...")
    process_and_upload_crop_data()
    create_crop_specific_recommendations()
    print("Data upload completed successfully!")
