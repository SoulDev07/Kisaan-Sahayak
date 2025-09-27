from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import firebase_admin
from firebase_admin import firestore
import google.generativeai as genai
from pydantic import BaseModel
import numpy as np
from datetime import datetime
import json
from sentence_transformers import SentenceTransformer

router = APIRouter()

# Initialize Gemini
genai.configure(api_key="AIzaSyBCNsEX1Lss6wUve6NufMXl0ay0-20dUKI")

# Initialize sentence transformer model (cached)
sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

# Get Firestore client
try:
    db = firestore.client()
except:
    # Initialize if not already done
    import os
    cred_path = os.path.join(os.path.dirname(__file__), '..', 'vinayak', 'serviceAccountKey.json')
    if os.path.exists(cred_path):
        from firebase_admin import credentials
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
    else:
        db = None

def generate_embedding(text: str) -> List[float]:
    """Generate embedding using sentence transformers"""
    try:
        # Use the cached sentence transformer model
        embedding = sentence_model.encode(text)
        
        # Convert to list and return
        return embedding.tolist()
        
    except Exception as e:
        print(f"Error generating embedding: {e}")
        # Return a fallback embedding to prevent 500 errors
        return [0.1] * 384  # MiniLM embedding dimension

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    if not a or not b:
        return 0.0
    
    a_array = np.array(a)
    b_array = np.array(b)
    
    dot_product = np.dot(a_array, b_array)
    norm_a = np.linalg.norm(a_array)
    norm_b = np.linalg.norm(b_array)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    return dot_product / (norm_a * norm_b)

def search_similar_documents(query: str, doc_type: str = None, limit: int = 5) -> List[Dict]:
    """Search for similar documents using embeddings"""
    if not db:
        print("Database not available, returning generic message")
        return []
        
    try:
        query_embedding = generate_embedding(query)
        
        if not query_embedding or all(x == 0.0 for x in query_embedding):
            print("Could not generate valid embedding, returning generic message")
            return []
        
        # Get all documents from crop_cycle_data collection
        collection_ref = db.collection('crop_cycle_data')
        
        if doc_type:
            docs = collection_ref.where('type', '==', doc_type).stream()
        else:
            docs = collection_ref.stream()
        
        similarities = []
        
        for doc in docs:
            doc_data = doc.to_dict()
            doc_embedding = doc_data.get('embedding', [])
            
            if doc_embedding:
                similarity = cosine_similarity(query_embedding, doc_embedding)
                similarities.append({
                    'id': doc.id,
                    'similarity': similarity,
                    'data': doc_data
                })
        
        # Sort by similarity and return top results
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        return similarities[:limit]
        
    except Exception as e:
        print(f"Error in search_similar_documents: {e}")
        return []

class CropAnalysisRequest(BaseModel):
    crop: str
    land_size: float
    irrigation_method: str
    available_tools: List[str]
    location: Optional[str] = "India"

class PhoneCallRequest(BaseModel):
    phone_number: str

@router.post("/analyze-crop", tags=["Crop Cycle"])
async def analyze_crop(request: CropAnalysisRequest):
    """Analyze crop and provide comprehensive recommendations"""
    try:
        # Search for relevant information (with fallback if database is unavailable)
        crop_recommendations = []
        buyers = []
        loans = []
        insurance = []
        soil_cert = []
        power_info = []
        mandi_info = []
        
        if db:
            try:
                crop_query = f"crop recommendations best practices {request.crop} {request.irrigation_method}"
                crop_recommendations = search_similar_documents(crop_query, "crop_recommendations", 3)
                
                # Get corporate buyers for the crop
                buyers_query = f"corporate buyers {request.crop} contract farming"
                buyers = search_similar_documents(buyers_query, "corporate_buyer", 5)
                
                # Get loan schemes
                loan_query = f"agricultural loans financing schemes farmers"
                loans = search_similar_documents(loan_query, "loan_scheme", 3)
                
                # Get insurance plans
                insurance_query = f"crop insurance protection {request.crop}"
                insurance = search_similar_documents(insurance_query, "insurance_plan", 3)
                
                # Get soil and certification info
                soil_query = f"soil testing certification {request.crop}"
                soil_cert = search_similar_documents(soil_query, "certification", 2)
                
                # Get solar/power information
                power_query = f"solar power agriculture irrigation energy"
                power_info = search_similar_documents(power_query, "solar_scheme", 2)
                
                # Get mandi information
                mandi_query = f"agricultural market mandi {request.crop}"
                mandi_info = search_similar_documents(mandi_query, "mandi", 3)
            except Exception as db_error:
                print(f"Database search error: {db_error}")
                # Continue without database results
        
        # Generate AI analysis using Gemini
        analysis_prompt = f"""
        As an expert agricultural advisor, provide comprehensive analysis for:
        Crop: {request.crop}
        Land Size: {request.land_size} acres
        Irrigation: {request.irrigation_method}
        Available Tools: {', '.join(request.available_tools)}
        
        Based on the available data, provide:
        1. Feasibility assessment (percentage and reasoning)
        2. Expected profit calculation
        3. ROI estimation
        4. Key recommendations
        5. Risk factors
        6. Timeline for cultivation
        
        Make it practical and actionable for Indian farmers.
        """
        
        # Generate analysis using Gemini Flash
        ai_analysis_text = "Analysis temporarily unavailable"
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            analysis_response = model.generate_content(analysis_prompt)
            ai_analysis_text = analysis_response.text
        except Exception as ai_error:
            print(f"AI generation error: {ai_error}")
            # Provide basic analysis without AI
            ai_analysis_text = f"Basic analysis for {request.crop}: Suitable crop for {request.land_size} acres with {request.irrigation_method} irrigation."
        
        return {
            "status": "success",
            "crop": request.crop,
            "analysis": {
                "ai_analysis": ai_analysis_text,
                "feasibility": 85,  # This could be calculated based on various factors
                "expected_profit": int(request.land_size * 45000),  # Base calculation
                "roi_percentage": 165,
                "risk_level": "Medium"
            },
            "recommendations": {
                "crop_practices": [doc['data'] for doc in crop_recommendations],
                "corporate_buyers": [doc['data'] for doc in buyers],
                "financing_options": [doc['data'] for doc in loans],
                "insurance_options": [doc['data'] for doc in insurance],
                "certifications": [doc['data'] for doc in soil_cert],
                "power_solutions": [doc['data'] for doc in power_info],
                "market_info": [doc['data'] for doc in mandi_info]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing crop: {str(e)}")

@router.get("/corporate-buyers/{crop}", tags=["Crop Cycle"])
async def get_corporate_buyers(crop: str):
    """Get corporate buyers for a specific crop"""
    try:
        query = f"corporate buyers {crop} contract farming"
        buyers = search_similar_documents(query, "corporate_buyer", 10)
        buyers_list = [doc['data']['data'] for doc in buyers if doc['data'].get('crop', '').lower() == crop.lower()]
        if not buyers_list:
            buyers_list = [{
                'message': 'No specific corporate buyers found for your crop. Consider joining a local FPO or contacting agri-market platforms for more options.'
            }]
        return {
            "status": "success",
            "crop": crop,
            "buyers": buyers_list
        }
    except Exception as e:
        return {
            "status": "success",
            "crop": crop,
            "buyers": [{
                'message': 'No specific corporate buyers found for your crop. Consider joining a local FPO or contacting agri-market platforms for more options.'
            }]
        }

@router.get("/loan-schemes", tags=["Crop Cycle"])
async def get_loan_schemes():
    """Get available loan schemes"""
    try:
        query = "agricultural loans financing schemes farmers"
        loans = search_similar_documents(query, "loan_scheme", 10)
        loans_list = [doc['data']['data'] for doc in loans]
        if not loans_list:
            loans_list = [{
                'message': 'No specific loan schemes found for your request. Consider exploring government schemes or private financing options.'
            }]
        return {"status": "success", "schemes": loans_list}
    except Exception as e:
        return {"status": "success", "schemes": [{
            'message': 'No specific loan schemes found for your request. Consider exploring government schemes or private financing options.'
        }]}

@router.get("/insurance-plans", tags=["Crop Cycle"])
async def get_insurance_plans():
    """Get available insurance plans"""
    try:
        query = "crop insurance protection plans"
        insurance = search_similar_documents(query, "insurance_plan", 10)
        insurance_list = [doc['data']['data'] for doc in insurance]
        if not insurance_list:
            insurance_list = [{
                'message': 'No specific insurance plans found for your crop. Consider exploring PMFBY or private crop insurance options.'
            }]
        return {"status": "success", "plans": insurance_list}
    except Exception as e:
        return {"status": "success", "plans": [{
            'message': 'No specific insurance plans found for your crop. Consider exploring PMFBY or private crop insurance options.'
        }]}

@router.get("/certifications", tags=["Crop Cycle"])
async def get_certifications():
    """Get available certifications"""
    try:
        query = "agricultural certifications organic FSSAI"
        certifications = search_similar_documents(query, "certification", 10)
        cert_list = [doc['data']['data'] for doc in certifications]
        if not cert_list:
            cert_list = [{
                'message': 'No specific certifications found for your crop. Consider exploring organic certification or FSSAI certification.'
            }]
        return {"status": "success", "certifications": cert_list}
    except Exception as e:
        return {"status": "success", "certifications": [{
            'message': 'No specific certifications found for your crop. Consider exploring organic certification or FSSAI certification.'
        }]}

@router.get("/solar-schemes", tags=["Crop Cycle"])
async def get_solar_schemes():
    """Get solar power schemes"""
    try:
        query = "solar power schemes agriculture PM-KUSUM"
        solar = search_similar_documents(query, "solar_scheme", 10)
        solar_list = [doc['data']['data'] for doc in solar]
        if not solar_list:
            solar_list = [{
                'message': 'No specific solar power schemes found for your request. Consider exploring solar pump options or government subsidies.'
            }]
        return {"status": "success", "schemes": solar_list}
    except Exception as e:
        return {"status": "success", "schemes": [{
            'message': 'No specific solar power schemes found for your request. Consider exploring solar pump options or government subsidies.'
        }]}

@router.get("/soil-testing-labs", tags=["Crop Cycle"])
async def get_soil_testing_labs():
    """Get soil testing laboratories"""
    try:
        query = "soil testing laboratories government private"
        labs = search_similar_documents(query, "soil_testing_lab", 10)
        
        return {
            "status": "success",
            "labs": [doc['data']['data'] for doc in labs]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching soil testing labs: {str(e)}")

@router.get("/mandi-info", tags=["Crop Cycle"])
async def get_mandi_info():
    """Get mandi information"""
    try:
        query = "agricultural market mandi prices"
        mandis = search_similar_documents(query, "mandi", 10)
        mandi_list = [doc['data']['data'] for doc in mandis]
        if not mandi_list:
            mandi_list = [{
                'message': 'No specific mandi information found for your crop. Consider checking local mandi prices or exploring online market platforms.'
            }]
        return {"status": "success", "mandis": mandi_list}
    except Exception as e:
        return {"status": "success", "mandis": [{
            'message': 'No specific mandi information found for your crop. Consider checking local mandi prices or exploring online market platforms.'
        }]}

@router.get("/government-schemes", tags=["Crop Cycle"])
async def get_government_schemes():
    """Get government schemes"""
    try:
        query = "government schemes agriculture irrigation organic"
        schemes = search_similar_documents(query, "government_scheme", 10)
        scheme_list = [doc['data']['data'] for doc in schemes]
        if not scheme_list:
            scheme_list = [{
                'message': 'No specific government schemes found for your request. Consider exploring government subsidies or private financing options.'
            }]
        return {"status": "success", "schemes": scheme_list}
    except Exception as e:
        return {"status": "success", "schemes": [{
            'message': 'No specific government schemes found for your request. Consider exploring government subsidies or private financing options.'
        }]}

@router.post("/generate-insights", tags=["Crop Cycle"])
async def generate_insights(request: CropAnalysisRequest):
    """Generate AI-powered insights for the crop"""
    try:
        insights_prompt = f"""
        Generate 5 actionable AI insights for a farmer growing {request.crop} on {request.land_size} acres
        using {request.irrigation_method} irrigation with tools: {', '.join(request.available_tools)}.
        
        Focus on:
        - Market predictions and timing
        - Cost optimization
        - Yield improvement
        - Risk mitigation
        - Technology adoption
        
        Make each insight specific, practical, and immediately actionable.
        """
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        try:
            response = model.generate_content(insights_prompt)
            insights_text = response.text
        except Exception as ai_error:
            print(f"AI insights generation error: {ai_error}")
            # Provide basic insights without AI
            insights_text = f"""
            1. Consider market timing for {request.crop} harvest to maximize profits
            2. Optimize irrigation schedule with {request.irrigation_method} system
            3. Monitor weather patterns for best planting decisions
            4. Use available tools: {', '.join(request.available_tools)} efficiently
            5. Connect with local agricultural extension services for guidance
            """
        
        # Parse the response into individual insights
        insights = [insight.strip() for insight in insights_text.split('\n') if insight.strip() and not insight.strip().startswith('#')]
        
        return {
            "status": "success",
            "crop": request.crop,
            "insights": insights[:5]  # Return top 5 insights
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")

@router.get("/search", tags=["Crop Cycle"])
async def search_crop_data(
    query: str = Query(..., description="Search query"),
    doc_type: Optional[str] = Query(None, description="Document type to filter"),
    limit: int = Query(5, description="Number of results to return")
):
    """Search across all crop cycle data"""
    try:
        results = search_similar_documents(query, doc_type, limit)
        
        return {
            "status": "success",
            "query": query,
            "results": [
                {
                    "id": result['id'],
                    "similarity": result['similarity'],
                    "type": result['data']['type'],
                    "data": result['data']['data']
                }
                for result in results
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching data: {str(e)}")

@router.post("/initiate-call", tags=["Crop Cycle"])
async def initiate_call(request: PhoneCallRequest):
    """Return formatted phone number for calling"""
    try:
        # Clean and format the phone number
        phone = request.phone_number.strip()
        
        # Remove common prefixes and format
        if phone.startswith('+91-'):
            formatted_phone = phone
        elif phone.startswith('+91'):
            formatted_phone = phone
        elif phone.startswith('91'):
            formatted_phone = f"+{phone}"
        elif phone.startswith('1800'):
            formatted_phone = f"+91-{phone}"
        else:
            formatted_phone = f"+91-{phone}"
        
        return {
            "status": "success",
            "formatted_number": formatted_phone,
            "call_url": f"tel:{formatted_phone}",
            "message": f"Ready to call {formatted_phone}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error formatting phone number: {str(e)}")

@router.get("/health", tags=["Crop Cycle"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "crop_cycle_api",
        "timestamp": datetime.now().isoformat()
    }

# ======= NEW COMPREHENSIVE CROP CYCLE MANAGEMENT ROUTES =======

# Pydantic models for the new endpoints
class CropDetails(BaseModel):
    name: str
    scientific_name: Optional[str] = None
    category: str
    description: str
    growing_season: str
    climate_requirements: Dict[str, Any]
    soil_requirements: Dict[str, Any]
    water_requirements: Dict[str, Any]
    growth_duration_days: int
    stages: List[Dict[str, Any]]
    common_varieties: List[str]
    market_price_range: Dict[str, float]
    nutritional_value: Dict[str, Any]
    best_practices: List[str]
    common_diseases: List[str]
    fertilizer_schedule: List[Dict[str, Any]]
    irrigation_schedule: List[Dict[str, Any]]

class CropCycle(BaseModel):
    farmer_id: str
    crop_id: str
    crop_name: str
    variety: str
    area_planted: float  # in acres
    planting_date: str
    expected_harvest_date: str
    current_stage: str
    progress_percentage: float
    location: Dict[str, str]
    notes: Optional[str] = None

class CropTask(BaseModel):
    cycle_id: str
    task_name: str
    task_type: str  # irrigation, fertilization, pest_control, etc.
    description: str
    scheduled_date: str
    priority: str  # low, medium, high
    estimated_duration_hours: float
    required_resources: List[str]
    cost_estimate: Optional[float] = None

@router.get("/crops", tags=["Crop Cycle"])
async def get_all_crops(
    category: Optional[str] = Query(None, description="Filter by crop category"),
    season: Optional[str] = Query(None, description="Filter by growing season"),
    search: Optional[str] = Query(None, description="Search in crop names/descriptions")
):
    """Get all available crops in the system"""
    try:
        crops_ref = db.collection('crops_master')
        
        crops = []
        for doc in crops_ref.stream():
            crop = doc.to_dict()
            crop['id'] = doc.id
            
            # Apply filters
            if category and crop.get('category', '').lower() != category.lower():
                continue
            if season and season.lower() not in crop.get('growing_season', '').lower():
                continue
            if search and search.lower() not in crop.get('name', '').lower() and search.lower() not in crop.get('description', '').lower():
                continue
                
            crops.append(crop)
        
        return {
            "crops": crops,
            "total_count": len(crops)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching crops: {str(e)}")

@router.post("/crops", tags=["Crop Cycle"])
async def add_new_crop(crop: CropDetails):
    """Add a new crop to the system"""
    try:
        crop_id = str(uuid.uuid4())
        
        crop_data = crop.dict()
        crop_data.update({
            'id': crop_id,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'created_by': 'admin'  # Could be dynamic based on auth
        })
        
        # Generate embedding for search
        search_text = f"{crop.name} {crop.scientific_name or ''} {crop.description} {crop.category}"
        crop_data['embedding'] = generate_embedding(search_text)
        
        db.collection('crops_master').document(crop_id).set(crop_data)
        
        return {
            "message": "Crop added successfully",
            "crop_id": crop_id,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding crop: {str(e)}")

@router.get("/crops/{crop_id}", tags=["Crop Cycle"])
async def get_crop_details(crop_id: str):
    """Get detailed information about a specific crop"""
    try:
        doc_ref = db.collection('crops_master').document(crop_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Crop not found")
        
        crop_data = doc.to_dict()
        crop_data['id'] = doc.id
        
        return crop_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching crop details: {str(e)}")

@router.put("/crops/{crop_id}", tags=["Crop Cycle"])
async def update_crop_details(crop_id: str, updates: Dict[str, Any]):
    """Update crop information"""
    try:
        doc_ref = db.collection('crops_master').document(crop_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Crop not found")
        
        updates['updated_at'] = datetime.now().isoformat()
        
        # Update embedding if search-relevant fields changed
        if any(field in updates for field in ['name', 'scientific_name', 'description', 'category']):
            current_data = doc.to_dict()
            current_data.update(updates)
            search_text = f"{current_data.get('name', '')} {current_data.get('scientific_name', '')} {current_data.get('description', '')} {current_data.get('category', '')}"
            updates['embedding'] = generate_embedding(search_text)
        
        doc_ref.update(updates)
        
        return {
            "message": "Crop updated successfully",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating crop: {str(e)}")

@router.delete("/crops/{crop_id}", tags=["Crop Cycle"])
async def delete_crop(crop_id: str):
    """Delete a crop from the system"""
    try:
        # Check if crop is being used in active cycles
        cycles_ref = db.collection('crop_cycles').where('crop_id', '==', crop_id).where('status', '==', 'active')
        active_cycles = list(cycles_ref.stream())
        
        if active_cycles:
            raise HTTPException(status_code=400, detail="Cannot delete crop with active cycles")
        
        doc_ref = db.collection('crops_master').document(crop_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Crop not found")
        
        doc_ref.delete()
        
        return {
            "message": "Crop deleted successfully",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting crop: {str(e)}")

@router.get("/farmer/{farmer_id}/cycles", tags=["Crop Cycle"])
async def get_farmer_crop_cycles(
    farmer_id: str,
    status: Optional[str] = Query(None, description="Filter by status: active, completed, cancelled")
):
    """Get all crop cycles for a farmer"""
    try:
        cycles_ref = db.collection('crop_cycles').where('farmer_id', '==', farmer_id)
        
        if status:
            cycles_ref = cycles_ref.where('status', '==', status)
        
        cycles = []
        for doc in cycles_ref.stream():
            cycle = doc.to_dict()
            cycle['id'] = doc.id
            cycles.append(cycle)
        
        # Sort by planting date (newest first)
        cycles.sort(key=lambda x: x.get('planting_date', ''), reverse=True)
        
        return {
            "farmer_id": farmer_id,
            "cycles": cycles,
            "total_count": len(cycles),
            "active_count": len([c for c in cycles if c.get('status') == 'active'])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching farmer cycles: {str(e)}")

@router.post("/farmer/{farmer_id}/cycles", tags=["Crop Cycle"])
async def start_crop_cycle(farmer_id: str, cycle: CropCycle):
    """Start a new crop cycle for farmer"""
    try:
        cycle_id = str(uuid.uuid4())
        
        # Validate crop exists
        crop_ref = db.collection('crops_master').document(cycle.crop_id)
        crop_doc = crop_ref.get()
        
        if not crop_doc.exists:
            raise HTTPException(status_code=404, detail="Crop not found")
        
        crop_data = crop_doc.to_dict()
        
        cycle_data = cycle.dict()
        cycle_data.update({
            'id': cycle_id,
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'current_stage': 'preparation',
            'progress_percentage': 0.0,
            'crop_details': {
                'name': crop_data.get('name'),
                'category': crop_data.get('category'),
                'growth_duration_days': crop_data.get('growth_duration_days')
            }
        })
        
        db.collection('crop_cycles').document(cycle_id).set(cycle_data)
        
        # Generate initial tasks based on crop requirements
        if 'stages' in crop_data:
            tasks_to_create = []
            for stage in crop_data['stages']:
                for task in stage.get('tasks', []):
                    task_data = {
                        'cycle_id': cycle_id,
                        'farmer_id': farmer_id,
                        'task_name': task,
                        'task_type': 'stage_task',
                        'description': f"Complete {task} for {stage.get('title', 'stage')}",
                        'scheduled_date': cycle.planting_date,  # Would be calculated based on stage timing
                        'priority': 'medium',
                        'status': 'pending',
                        'created_at': datetime.now().isoformat()
                    }
                    tasks_to_create.append(task_data)
            
            # Add initial tasks to database
            for task in tasks_to_create[:5]:  # Limit initial tasks
                task_id = str(uuid.uuid4())
                task['id'] = task_id
                db.collection('crop_tasks').document(task_id).set(task)
        
        return {
            "message": "Crop cycle started successfully",
            "cycle_id": cycle_id,
            "status": "active"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting crop cycle: {str(e)}")

@router.get("/farmer/{farmer_id}/cycles/{cycle_id}", tags=["Crop Cycle"])
async def get_crop_cycle_details(farmer_id: str, cycle_id: str):
    """Get detailed information about a specific crop cycle"""
    try:
        doc_ref = db.collection('crop_cycles').document(cycle_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Crop cycle not found")
        
        cycle_data = doc.to_dict()
        
        # Verify farmer ownership
        if cycle_data.get('farmer_id') != farmer_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        cycle_data['id'] = doc.id
        
        # Get associated tasks
        tasks_ref = db.collection('crop_tasks').where('cycle_id', '==', cycle_id)
        tasks = []
        for task_doc in tasks_ref.stream():
            task = task_doc.to_dict()
            task['id'] = task_doc.id
            tasks.append(task)
        
        cycle_data['tasks'] = tasks
        cycle_data['tasks_count'] = len(tasks)
        cycle_data['completed_tasks'] = len([t for t in tasks if t.get('status') == 'completed'])
        
        return cycle_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cycle details: {str(e)}")

@router.put("/farmer/{farmer_id}/cycles/{cycle_id}", tags=["Crop Cycle"])
async def update_crop_cycle(farmer_id: str, cycle_id: str, updates: Dict[str, Any]):
    """Update crop cycle information"""
    try:
        doc_ref = db.collection('crop_cycles').document(cycle_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Crop cycle not found")
        
        cycle_data = doc.to_dict()
        
        # Verify farmer ownership
        if cycle_data.get('farmer_id') != farmer_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        updates['updated_at'] = datetime.now().isoformat()
        doc_ref.update(updates)
        
        return {
            "message": "Crop cycle updated successfully",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating crop cycle: {str(e)}")

@router.delete("/farmer/{farmer_id}/cycles/{cycle_id}", tags=["Crop Cycle"])
async def end_crop_cycle(farmer_id: str, cycle_id: str):
    """End/complete a crop cycle"""
    try:
        doc_ref = db.collection('crop_cycles').document(cycle_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Crop cycle not found")
        
        cycle_data = doc.to_dict()
        
        # Verify farmer ownership
        if cycle_data.get('farmer_id') != farmer_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Update status to completed
        doc_ref.update({
            'status': 'completed',
            'completion_date': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        })
        
        return {
            "message": "Crop cycle completed successfully",
            "status": "completed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending crop cycle: {str(e)}")

@router.get("/farmer/{farmer_id}/cycles/{cycle_id}/tasks", tags=["Crop Cycle"])
async def get_cycle_tasks(farmer_id: str, cycle_id: str, status: Optional[str] = Query(None)):
    """Get all tasks for a crop cycle"""
    try:
        # Verify cycle exists and belongs to farmer
        cycle_ref = db.collection('crop_cycles').document(cycle_id)
        cycle_doc = cycle_ref.get()
        
        if not cycle_doc.exists:
            raise HTTPException(status_code=404, detail="Crop cycle not found")
        
        cycle_data = cycle_doc.to_dict()
        if cycle_data.get('farmer_id') != farmer_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get tasks
        tasks_ref = db.collection('crop_tasks').where('cycle_id', '==', cycle_id)
        
        if status:
            tasks_ref = tasks_ref.where('status', '==', status)
        
        tasks = []
        for doc in tasks_ref.stream():
            task = doc.to_dict()
            task['id'] = doc.id
            tasks.append(task)
        
        # Sort by scheduled date
        tasks.sort(key=lambda x: x.get('scheduled_date', ''))
        
        return {
            "cycle_id": cycle_id,
            "tasks": tasks,
            "total_count": len(tasks)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tasks: {str(e)}")

@router.post("/farmer/{farmer_id}/cycles/{cycle_id}/tasks", tags=["Crop Cycle"])
async def add_cycle_task(farmer_id: str, cycle_id: str, task: CropTask):
    """Add a task to crop cycle"""
    try:
        # Verify cycle exists and belongs to farmer
        cycle_ref = db.collection('crop_cycles').document(cycle_id)
        cycle_doc = cycle_ref.get()
        
        if not cycle_doc.exists:
            raise HTTPException(status_code=404, detail="Crop cycle not found")
        
        cycle_data = cycle_doc.to_dict()
        if cycle_data.get('farmer_id') != farmer_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        task_id = str(uuid.uuid4())
        
        task_data = task.dict()
        task_data.update({
            'id': task_id,
            'farmer_id': farmer_id,
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        })
        
        db.collection('crop_tasks').document(task_id).set(task_data)
        
        return {
            "message": "Task added successfully",
            "task_id": task_id,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding task: {str(e)}")

@router.get("/farmer/{farmer_id}/analytics", tags=["Crop Cycle"])
async def get_farmer_crop_analytics(farmer_id: str):
    """Get crop cycle analytics for farmer"""
    try:
        # Get all cycles for farmer
        cycles_ref = db.collection('crop_cycles').where('farmer_id', '==', farmer_id)
        cycles = [doc.to_dict() for doc in cycles_ref.stream()]
        
        # Calculate analytics
        total_cycles = len(cycles)
        active_cycles = len([c for c in cycles if c.get('status') == 'active'])
        completed_cycles = len([c for c in cycles if c.get('status') == 'completed'])
        
        # Calculate total area under cultivation
        total_area = sum(c.get('area_planted', 0) for c in cycles if c.get('status') == 'active')
        
        # Most grown crops
        crop_counts = {}
        for cycle in cycles:
            crop_name = cycle.get('crop_name', 'Unknown')
            crop_counts[crop_name] = crop_counts.get(crop_name, 0) + 1
        
        most_grown_crops = sorted(crop_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Seasonal distribution
        seasonal_distribution = {'Kharif': 0, 'Rabi': 0, 'Zaid': 0}
        for cycle in cycles:
            planting_date = cycle.get('planting_date', '')
            if planting_date:
                month = int(planting_date.split('-')[1]) if '-' in planting_date else 1
                if month in [6, 7, 8, 9, 10]:
                    seasonal_distribution['Kharif'] += 1
                elif month in [11, 12, 1, 2, 3, 4]:
                    seasonal_distribution['Rabi'] += 1
                else:
                    seasonal_distribution['Zaid'] += 1
        
        return {
            "farmer_id": farmer_id,
            "summary": {
                "total_cycles": total_cycles,
                "active_cycles": active_cycles,
                "completed_cycles": completed_cycles,
                "total_area_under_cultivation": total_area
            },
            "most_grown_crops": most_grown_crops,
            "seasonal_distribution": seasonal_distribution,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analytics: {str(e)}")

@router.get("/seasons", tags=["Crop Cycle"])
async def get_crop_seasons():
    """Get crop planting seasons information"""
    try:
        seasons = {
            "Kharif": {
                "description": "Monsoon season crops",
                "planting_months": ["June", "July", "August"],
                "harvesting_months": ["October", "November", "December"],
                "common_crops": ["Rice", "Cotton", "Sugarcane", "Maize", "Soybean"],
                "characteristics": "Rain-fed crops, requires high temperature and humidity"
            },
            "Rabi": {
                "description": "Winter season crops", 
                "planting_months": ["November", "December", "January"],
                "harvesting_months": ["March", "April", "May"],
                "common_crops": ["Wheat", "Barley", "Peas", "Gram", "Mustard"],
                "characteristics": "Requires cool climate during growth and warm climate during ripening"
            },
            "Zaid": {
                "description": "Summer season crops",
                "planting_months": ["March", "April", "May"],
                "harvesting_months": ["June", "July"],
                "common_crops": ["Watermelon", "Muskmelon", "Cucumber", "Fodder crops"],
                "characteristics": "Requires irrigation, grown in summer with artificial watering"
            }
        }
        
        return {"seasons": seasons}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching seasons: {str(e)}")

@router.get("/farmer/{farmer_id}/recommendations", tags=["Crop Cycle"])
async def get_farmer_crop_recommendations(farmer_id: str):
    """Get personalized crop recommendations for farmer"""
    try:
        # Get farmer profile and past cycles for context
        farmer_ref = db.collection('farmers').document(farmer_id)
        farmer_doc = farmer_ref.get()
        
        if not farmer_doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")
        
        farmer_data = farmer_doc.to_dict()
        
        # Get farmer's crop cycles
        cycles_ref = db.collection('crop_cycles').where('farmer_id', '==', farmer_id)
        cycles = [doc.to_dict() for doc in cycles_ref.stream()]
        
        # Analyze farmer's preferences and history
        grown_crops = set(cycle.get('crop_name', '') for cycle in cycles)
        farm_location = farmer_data.get('location', {})
        state = farm_location.get('state', 'Unknown')
        
        # Generate recommendations based on:
        # 1. Current season
        # 2. Location/climate
        # 3. Past crop performance
        # 4. Market trends
        
        current_month = datetime.now().month
        
        # Determine current season
        if current_month in [6, 7, 8, 9, 10]:
            current_season = "Kharif"
            season_crops = ["Rice", "Cotton", "Sugarcane", "Maize", "Soybean", "Groundnut"]
        elif current_month in [11, 12, 1, 2, 3, 4]:
            current_season = "Rabi"
            season_crops = ["Wheat", "Barley", "Peas", "Gram", "Mustard", "Potato"]
        else:
            current_season = "Zaid"
            season_crops = ["Watermelon", "Muskmelon", "Cucumber", "Fodder crops"]
        
        # Filter out already grown crops and add variety
        new_crop_suggestions = [crop for crop in season_crops if crop not in grown_crops][:3]
        
        # Add some tried crops with improvement suggestions
        improvement_crops = list(grown_crops)[:2]
        
        recommendations = []
        
        # Add new crop recommendations
        for crop in new_crop_suggestions:
            recommendations.append({
                "crop_name": crop,
                "recommendation_type": "new_crop",
                "season": current_season,
                "reason": f"Suitable for {current_season} season in {state}",
                "confidence": 0.8,
                "market_potential": "High",
                "expected_yield": "Good",
                "investment_required": "Medium"
            })
        
        # Add improvement recommendations for existing crops
        for crop in improvement_crops:
            recommendations.append({
                "crop_name": crop,
                "recommendation_type": "improve_existing",
                "season": current_season,
                "reason": f"Optimize yield for previously grown {crop}",
                "confidence": 0.9,
                "market_potential": "Known",
                "expected_yield": "Improved",
                "investment_required": "Low"
            })
        
        return {
            "success": True,
            "farmer_id": farmer_id,
            "current_season": current_season,
            "recommendations": recommendations,
            "total_recommendations": len(recommendations)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

import uuid
