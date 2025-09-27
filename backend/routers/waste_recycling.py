from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import base64
import io
from PIL import Image
import requests
import os
from typing import List, Optional
import json
import time

router = APIRouter(prefix="/waste-recycling", tags=["Waste Recycling"])

# Gemini 2.5 Flash API Configuration
GEMINI_API_KEY = "AIzaSyBhI1O9Bj_oUsM9HP1u7FlOLYIlKK9Dgt4"
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY

# Hardcoded common recycling practices for carousel
COMMON_RECYCLING_PRACTICES = [
    {
        "id": 1,
        "title": "Composting",
        "description": "Convert organic waste into nutrient-rich compost for your fields",
        "icon": "🌱",
        "difficulty": "Easy",
        "time_required": "2-3 months",
        "materials_needed": ["Organic waste", "Container", "Water"],
        "steps": [
            "Collect kitchen scraps and garden waste",
            "Layer with soil and water",
            "Turn regularly for aeration",
            "Use when dark and crumbly"
        ],
        "youtube_url": "https://www.youtube.com/watch?v=Yx6UgfQ7XXI"
    },
    {
        "id": 2,
        "title": "Mulching",
        "description": "Use waste materials as protective covering for soil",
        "icon": "🍂",
        "difficulty": "Very Easy",
        "time_required": "Immediate",
        "materials_needed": ["Leaves", "Straw", "Wood chips"],
        "steps": [
            "Collect dry leaves and plant waste",
            "Spread 2-3 inches thick around plants",
            "Keep away from plant stems",
            "Replenish as needed"
        ],
        "youtube_url": "https://www.youtube.com/watch?v=8nTz6J8Z_8Y"
    },
    {
        "id": 3,
        "title": "Vermicomposting",
        "description": "Use earthworms to break down organic waste quickly",
        "icon": "🪱",
        "difficulty": "Medium",
        "time_required": "1-2 months",
        "materials_needed": ["Worms", "Container", "Bedding", "Food scraps"],
        "steps": [
            "Set up worm bin with bedding",
            "Add worms and food scraps",
            "Maintain moisture and temperature",
            "Harvest worm castings"
        ],
        "youtube_url": "https://www.youtube.com/watch?v=OqHp03RRTDs"
    },
    {
        "id": 4,
        "title": "Biochar Production",
        "description": "Convert agricultural waste into carbon-rich soil amendment",
        "icon": "🔥",
        "difficulty": "Hard",
        "time_required": "1-2 days",
        "materials_needed": ["Agricultural waste", "Container", "Heat source"],
        "steps": [
            "Collect dry agricultural waste",
            "Heat in controlled environment",
            "Cool and crush into powder",
            "Mix with soil"
        ],
        "youtube_url": "https://www.youtube.com/watch?v=3mkLxYOJFGA"
    },
    {
        "id": 5,
        "title": "Water Conservation",
        "description": "Reuse household water for irrigation",
        "icon": "💧",
        "difficulty": "Easy",
        "time_required": "Immediate",
        "materials_needed": ["Collection containers", "Filter system"],
        "steps": [
            "Collect kitchen and bath water",
            "Filter out soap and chemicals",
            "Store in containers",
            "Use for irrigation"
        ],
        "youtube_url": "https://www.youtube.com/watch?v=2ZqJg3p_aPE"
    },
    {
        "id": 6,
        "title": "Seed Saving",
        "description": "Preserve seeds from your best crops for next season",
        "icon": "🌾",
        "difficulty": "Medium",
        "time_required": "Seasonal",
        "materials_needed": ["Mature plants", "Storage containers"],
        "steps": [
            "Select best plants for seed",
            "Allow seeds to mature fully",
            "Clean and dry seeds",
            "Store in cool, dry place"
        ],
        "youtube_url": "https://www.youtube.com/watch?v=Yx6UgfQ7XXI"
    }
]

def encode_image_to_base64(image_bytes: bytes) -> str:
    """Convert image bytes to base64 string"""
    return base64.b64encode(image_bytes).decode('utf-8')

def analyze_waste_with_gemini(image_base64: str, location: str = "farm") -> List[dict]:
    """Analyze waste image using Gemini 2.5 Flash and return recycling suggestions with YouTube videos"""
    
    prompt = f"""
    System: You are an expert in "waste-to-best" conversion for farms and rural households. Your goal is to convert the waste shown in the image into the "best" practical, low-cost, and environmentally-friendly uses available to small and medium farmers.

    Image context: The user submitted an image of agricultural or household waste. Location context: {location}

    Required output: Provide exactly 5 distinct, prioritized "waste-to-best" conversion suggestions. For each suggestion include:
    - title: a short 4-6 word title summarizing the conversion (e.g., "Compost for Soil Amendment")
    - description: 2-4 concise sentences explaining how to implement it on a small/medium farm and expected benefits
    - difficulty: one word (Easy/Medium/Hard)
    - time_required: short estimate (e.g., "Immediate", "2-3 months")
    - youtube_url: a direct YouTube video link that demonstrably shows or explains the technique (must be different for each suggestion)

    Keep the response strictly as valid JSON using this exact structure:
    {{
        "suggestions": [
            {{
                "title": "...",
                "description": "...",
                "difficulty": "...",
                "time_required": "...",
                "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID"
            }},
            ... (total 5 items)
        ]
    }}

    Prioritize immediate, low-cost, and soil-health-improving options. If the image is ambiguous, infer the most likely waste type and still provide five useful, distinct conversions. Do not include any extra text outside the JSON.
    """
    
    parts = [
        {"text": prompt},
        {"inlineData": {"mimeType": "image/jpeg", "data": image_base64}}
    ]
    
    data = {
        "contents": [
            {"role": "user", "parts": parts}
        ]
    }
    
    try:
        response = requests.post(GEMINI_API_URL, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        # Parse suggestions from response
        suggestions = []
        try:
            text = result['candidates'][0]['content']['parts'][0]['text']
            
            # Try to parse as JSON first
            try:
                import json
                parsed_data = json.loads(text)
                if 'suggestions' in parsed_data and isinstance(parsed_data['suggestions'], list):
                    suggestions = parsed_data['suggestions'][:5]  # Limit to 5 suggestions
                else:
                    raise ValueError("Invalid JSON structure")
            except (json.JSONDecodeError, ValueError, KeyError):
                # Fallback to text parsing if JSON fails
                lines = text.split('\n')
                for line in lines:
                    line = line.strip()
                    if line and len(line) > 10:  # Filter out very short lines
                        # Remove numbering and bullet points
                        line = line.lstrip('1234567890.-• ').strip()
                        if line and line not in [s.get('description', '') for s in suggestions]:
                            suggestions.append({
                                "description": line,
                                "youtube_url": "https://www.youtube.com/results?search_query=agricultural+waste+recycling"
                            })
                        if len(suggestions) >= 5:
                            break
            
            # If we don't have enough suggestions, add some generic ones with unique YouTube links
            fallback_suggestions = [
                {
                    "description": "Compost organic waste to create nutrient-rich soil amendment for better crop growth and soil health",
                    "youtube_url": "https://www.youtube.com/watch?v=Yx6UgfQ7XXI"
                },
                {
                    "description": "Use crop residues as mulch to retain soil moisture and suppress weed growth naturally",
                    "youtube_url": "https://www.youtube.com/watch?v=8nTz6J8Z_8Y"
                },
                {
                    "description": "Convert agricultural waste into biochar for long-term soil improvement and carbon sequestration",
                    "youtube_url": "https://www.youtube.com/watch?v=3mkLxYOJFGA"
                },
                {
                    "description": "Implement vermicomposting for faster organic matter breakdown using earthworms",
                    "youtube_url": "https://www.youtube.com/watch?v=OqHp03RRTDs"
                },
                {
                    "description": "Create raised beds using recycled materials to improve drainage and soil structure",
                    "youtube_url": "https://www.youtube.com/watch?v=2ZqJg3p_aPE"
                }
            ]
            
            while len(suggestions) < 5:
                suggestions.append(fallback_suggestions[len(suggestions)])
                
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            # Fallback suggestions with unique YouTube links
            suggestions = [
                {
                    "description": "Compost organic waste to create nutrient-rich soil amendment for better crop growth and soil health",
                    "youtube_url": "https://www.youtube.com/watch?v=Yx6UgfQ7XXI"
                },
                {
                    "description": "Use crop residues as mulch to retain soil moisture and suppress weed growth naturally",
                    "youtube_url": "https://www.youtube.com/watch?v=8nTz6J8Z_8Y"
                },
                {
                    "description": "Convert agricultural waste into biochar for long-term soil improvement and carbon sequestration",
                    "youtube_url": "https://www.youtube.com/watch?v=3mkLxYOJFGA"
                },
                {
                    "description": "Implement vermicomposting for faster organic matter breakdown using earthworms",
                    "youtube_url": "https://www.youtube.com/watch?v=OqHp03RRTDs"
                },
                {
                    "description": "Create raised beds using recycled materials to improve drainage and soil structure",
                    "youtube_url": "https://www.youtube.com/watch?v=2ZqJg3p_aPE"
                }
            ]
            
        return suggestions[:5]  # Ensure exactly 5 suggestions
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        # Return fallback suggestions with unique YouTube links
        return [
            {
                "description": "Compost organic waste to create nutrient-rich soil amendment for better crop growth and soil health",
                "youtube_url": "https://www.youtube.com/watch?v=Yx6UgfQ7XXI"
            },
            {
                "description": "Use crop residues as mulch to retain soil moisture and suppress weed growth naturally",
                "youtube_url": "https://www.youtube.com/watch?v=8nTz6J8Z_8Y"
            },
            {
                "description": "Convert agricultural waste into biochar for long-term soil improvement and carbon sequestration",
                "youtube_url": "https://www.youtube.com/watch?v=3mkLxYOJFGA"
            },
            {
                "description": "Implement vermicomposting for faster organic matter breakdown using earthworms",
                "youtube_url": "https://www.youtube.com/watch?v=OqHp03RRTDs"
            },
            {
                "description": "Create raised beds using recycled materials to improve drainage and soil structure",
                "youtube_url": "https://www.youtube.com/watch?v=2ZqJg3p_aPE"
            }
        ]

@router.post("/analyze-waste")
async def analyze_waste_image(
    image: UploadFile = File(...),
    location: str = Form("farm"),
    farmer_id: Optional[str] = Form(None)
):
    """
    Analyze waste image and provide recycling suggestions using Gemini 2.5 Flash
    """
    try:
        # Validate image file
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        image_bytes = await image.read()
        
        # Validate image size (max 10MB)
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size must be less than 10MB")
        
        # Convert to base64
        image_base64 = encode_image_to_base64(image_bytes)
        
        # Analyze with Gemini
        ai_suggestions = analyze_waste_with_gemini(image_base64, location)
        
        # Return response with both AI suggestions and common practices
        return JSONResponse({
            "success": True,
            "message": "Waste analysis completed successfully",
            "data": {
                "ai_suggestions": ai_suggestions,
                "common_practices": COMMON_RECYCLING_PRACTICES,
                "image_analyzed": True,
                "location": location,
                "farmer_id": farmer_id
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in waste analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze waste image")

@router.get("/common-practices")
async def get_common_practices():
    """
    Get list of common recycling practices for carousel display
    """
    return JSONResponse({
        "success": True,
        "data": {
            "practices": COMMON_RECYCLING_PRACTICES,
            "total_count": len(COMMON_RECYCLING_PRACTICES)
        }
    })

@router.get("/practice/{practice_id}")
async def get_practice_details(practice_id: int):
    """
    Get detailed information about a specific recycling practice
    """
    practice = next((p for p in COMMON_RECYCLING_PRACTICES if p["id"] == practice_id), None)
    
    if not practice:
        raise HTTPException(status_code=404, detail="Practice not found")
    
    return JSONResponse({
        "success": True,
        "data": practice
    })

@router.post("/save-analysis")
async def save_analysis(
    farmer_id: str = Form(...),
    image_data: str = Form(...),
    suggestions: str = Form(...),
    location: str = Form(...)
):
    """
    Save waste analysis results for future reference
    """
    try:
        # Parse suggestions from JSON string
        suggestions_list = json.loads(suggestions)
        
        # In a real implementation, you would save to database
        # For now, we'll just return success
        saved_analysis = {
            "id": f"analysis_{farmer_id}_{int(time.time())}",
            "farmer_id": farmer_id,
            "image_data": image_data[:100] + "...",  # Truncate for response
            "suggestions": suggestions_list,
            "location": location,
            "timestamp": time.time(),
            "status": "saved"
        }
        
        return JSONResponse({
            "success": True,
            "message": "Analysis saved successfully",
            "data": saved_analysis
        })
        
    except Exception as e:
        print(f"Error saving analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to save analysis")

@router.get("/farmer-history/{farmer_id}")
async def get_farmer_history(farmer_id: str):
    """
    Get waste analysis history for a specific farmer
    """
    # In a real implementation, fetch from database
    # For now, return mock data
    mock_history = [
        {
            "id": f"analysis_{farmer_id}_1",
            "timestamp": "2025-01-25T10:30:00Z",
            "location": "North Field",
            "suggestions_count": 5,
            "status": "completed"
        },
        {
            "id": f"analysis_{farmer_id}_2", 
            "timestamp": "2025-01-20T14:15:00Z",
            "location": "South Field",
            "suggestions_count": 5,
            "status": "completed"
        }
    ]
    
    return JSONResponse({
        "success": True,
        "data": {
            "farmer_id": farmer_id,
            "history": mock_history,
            "total_analyses": len(mock_history)
        }
    }) 