"""
Advanced Crop Intelligence Data Insertion Script with Embeddings
Inserts comprehensive crop, weather, and agricultural data into Firebase with vector embeddings.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from sentence_transformers import SentenceTransformer
import datetime

# Initialize the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

def vectorize(text):
    """Generate embeddings for text"""
    return model.encode(str(text)).tolist()

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

def load_crop_intelligence_data():
    """Load the crop intelligence JSON data"""
    json_path = os.path.join('..', 'MyApp', 'data', 'crop_intelligence_data.json')
    
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Crop intelligence data not found at {json_path}")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def create_crop_recommendations_collection(data):
    """Create crop recommendations with embeddings"""
    print("Creating crop recommendations collection...")
    
    collection_ref = db.collection('crop_recommendations')
    
    for crop in data['crop_recommendations']['ideal_crops']:
        # Create comprehensive text for embedding
        embedding_text = f"""
        Crop: {crop['crop_name']}
        Growth Duration: {crop['growth_duration']}
        Expected Yield: {crop['expected_yield']}
        Investment: {crop['investment_required']}
        Market Price: {crop['market_price']}
        Water Requirement: {crop['water_requirement']}
        Disease Risk: {crop['disease_risk']}
        Confidence Score: {crop['confidence_score']}%
        
        Weather Requirements:
        Temperature: {crop['weather_requirements']['temperature']}
        Humidity: {crop['weather_requirements']['humidity']}
        Rainfall: {crop['weather_requirements']['rainfall']}
        Soil Moisture: {crop['weather_requirements']['soil_moisture']}
        
        Farming Techniques: {' '.join([t['technique'] for t in crop['farming_techniques']])}
        """
        
        # Add vector embedding
        crop_with_embedding = {
            **crop,
            'vector_embedding': vectorize(embedding_text),
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }
        
        doc_ref = collection_ref.document(crop['crop_name'].lower().replace(' ', '_'))
        doc_ref.set(crop_with_embedding)
        print(f"✓ Added crop recommendation: {crop['crop_name']}")

def create_farming_techniques_collection(data):
    """Create farming techniques with embeddings"""
    print("Creating farming techniques collection...")
    
    collection_ref = db.collection('farming_techniques')
    
    # Modern methods
    for technique in data['farming_techniques']['modern_methods']:
        # Build embedding text with available fields
        embedding_parts = [
            f"Technique: {technique['name']}",
            f"Description: {technique['description']}",
            f"Investment: {technique['investment']}"
        ]
        
        # Add optional fields if they exist
        if 'yield_increase' in technique:
            embedding_parts.append(f"Yield Increase: {technique['yield_increase']}")
        if 'space_efficiency' in technique:
            embedding_parts.append(f"Space Efficiency: {technique['space_efficiency']}")
        if 'water_saving' in technique:
            embedding_parts.append(f"Water Saving: {technique['water_saving']}")
        if 'efficiency_gain' in technique:
            embedding_parts.append(f"Efficiency Gain: {technique['efficiency_gain']}")
        if 'resource_efficiency' in technique:
            embedding_parts.append(f"Resource Efficiency: {technique['resource_efficiency']}")
        if 'income_diversification' in technique:
            embedding_parts.append(f"Income Diversification: {technique['income_diversification']}")
        if 'risk_reduction' in technique:
            embedding_parts.append(f"Risk Reduction: {technique['risk_reduction']}")
        
        # Add success stories and requirements
        if 'success_stories' in technique and technique['success_stories']:
            success_stories = ' '.join([f"{s.get('farmer', s.get('system', 'Unknown'))}: {s['result']}" for s in technique['success_stories']])
            embedding_parts.append(f"Success Stories: {success_stories}")
        
        if 'requirements' in technique and technique['requirements']:
            embedding_parts.append(f"Requirements: {' '.join(technique['requirements'])}")
        
        embedding_text = '\n'.join(embedding_parts)
        
        technique_with_embedding = {
            **technique,
            'category': 'modern',
            'vector_embedding': vectorize(embedding_text),
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }
        
        doc_ref = collection_ref.document(f"modern_{technique['name'].lower().replace(' ', '_')}")
        doc_ref.set(technique_with_embedding)
        print(f"✓ Added modern technique: {technique['name']}")

def create_weather_patterns_collection(data):
    """Create weather patterns with embeddings"""
    print("Creating weather patterns collection...")
    
    collection_ref = db.collection('weather_patterns')
    
    for pattern in data['weather_patterns']['historical_data']:
        embedding_text = f"""
        Year: {pattern['year']}
        Rainfall: {pattern['rainfall']}
        Average Temperature: {pattern['avg_temperature']}
        Successful Crops: {' '.join(pattern['successful_crops'])}
        Farmer Practices: {' '.join([p['practice'] for p in pattern['farmer_practices']])}
        """
        
        pattern_with_embedding = {
            **pattern,
            'vector_embedding': vectorize(embedding_text),
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }
        
        doc_ref = collection_ref.document(f"weather_{pattern['year']}")
        doc_ref.set(pattern_with_embedding)
        print(f"✓ Added weather pattern: {pattern['year']}")

def create_soil_crop_matrix_collection(data):
    """Create soil-crop compatibility matrix with embeddings"""
    print("Creating soil-crop matrix collection...")
    
    collection_ref = db.collection('soil_crop_matrix')
    
    for soil_type, soil_data in data['soil_crop_matrix'].items():
        embedding_text = f"""
        Soil Type: {soil_type}
        pH: {soil_data['characteristics']['pH']}
        Organic Matter: {soil_data['characteristics']['organic_matter']}
        Drainage: {soil_data['characteristics']['drainage']}
        Best Crops: {' '.join(soil_data['best_crops'])}
        Management Tips: {' '.join(soil_data['management_tips'])}
        """
        
        soil_with_embedding = {
            **soil_data,
            'soil_type': soil_type,
            'vector_embedding': vectorize(embedding_text),
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }
        
        doc_ref = collection_ref.document(soil_type.lower().replace(' ', '_'))
        doc_ref.set(soil_with_embedding)
        print(f"✓ Added soil type: {soil_type}")

def create_crop_combos_collection():
    """Create intelligent crop combo recommendations"""
    print("Creating crop combos collection...")
    
    collection_ref = db.collection('crop_combos')
    
    combos = [
        {
            'combo_id': 'monsoon_premium',
            'name': 'Monsoon Premium Combo',
            'season': 'Monsoon',
            'description': 'High-yield monsoon crops with premium market prices',
            'crops': ['Rice', 'Sugarcane', 'Cotton'],
            'total_investment': '₹85,000 - ₹1,20,000',
            'expected_returns': '₹1,50,000 - ₹2,25,000',
            'roi_percentage': '75-90%',
            'duration': '4-6 months',
            'difficulty': 'Intermediate',
            'water_requirement': 'High',
            'labor_intensity': 'Medium',
            'market_demand': 'Very High',
            'weather_conditions': {
                'temperature': '25-35°C',
                'humidity': '70-85%',
                'rainfall': '800-1200mm'
            },
            'farming_techniques': [
                'Drip irrigation for water efficiency',
                'Organic fertilizers for better soil health',
                'Integrated pest management'
            ],
            'success_rate': '87%',
            'farmers_using': '2,847 farmers',
            'advantages': [
                'High market demand guaranteed',
                'Government procurement support',
                'Lower disease risk with proper management'
            ],
            'challenges': [
                'Requires consistent water supply',
                'Market price fluctuation risk',
                'Labor-intensive harvesting'
            ]
        },
        {
            'combo_id': 'winter_value',
            'name': 'Winter Value Combo',
            'season': 'Winter',
            'description': 'Profitable winter crops with export potential',
            'crops': ['Wheat', 'Chickpea', 'Mustard'],
            'total_investment': '₹45,000 - ₹65,000',
            'expected_returns': '₹85,000 - ₹1,15,000',
            'roi_percentage': '65-80%',
            'duration': '3-4 months',
            'difficulty': 'Beginner',
            'water_requirement': 'Medium',
            'labor_intensity': 'Low',
            'market_demand': 'High',
            'weather_conditions': {
                'temperature': '15-25°C',
                'humidity': '50-70%',
                'rainfall': '200-400mm'
            },
            'farming_techniques': [
                'Zero-tillage farming',
                'Precision seeding',
                'Bio-fertilizer application'
            ],
            'success_rate': '92%',
            'farmers_using': '4,523 farmers',
            'advantages': [
                'Lower water requirements',
                'Stable market prices',
                'Government MSP support'
            ],
            'challenges': [
                'Cold wave sensitivity',
                'Storage requirements',
                'Transportation logistics'
            ]
        },
        {
            'combo_id': 'summer_resilient',
            'name': 'Summer Resilient Combo',
            'season': 'Summer',
            'description': 'Heat-tolerant crops for maximum summer profits',
            'crops': ['Tomato', 'Onion', 'Chili'],
            'total_investment': '₹35,000 - ₹55,000',
            'expected_returns': '₹75,000 - ₹1,05,000',
            'roi_percentage': '70-85%',
            'duration': '2-3 months',
            'difficulty': 'Advanced',
            'water_requirement': 'High',
            'labor_intensity': 'High',
            'market_demand': 'Very High',
            'weather_conditions': {
                'temperature': '30-40°C',
                'humidity': '40-60%',
                'rainfall': '100-300mm'
            },
            'farming_techniques': [
                'Shade net cultivation',
                'Mulching for moisture retention',
                'Hydroponic systems'
            ],
            'success_rate': '78%',
            'farmers_using': '1,856 farmers',
            'advantages': [
                'Premium vegetable prices',
                'Quick harvest cycle',
                'Urban market access'
            ],
            'challenges': [
                'Heat stress management',
                'Intensive irrigation needs',
                'Pest and disease pressure'
            ]
        },
        {
            'combo_id': 'beginner_safe',
            'name': 'Beginner Safe Combo',
            'season': 'All Season',
            'description': 'Low-risk crops perfect for new farmers',
            'crops': ['Maize', 'Soybean', 'Green Gram'],
            'total_investment': '₹25,000 - ₹40,000',
            'expected_returns': '₹55,000 - ₹75,000',
            'roi_percentage': '60-75%',
            'duration': '3-4 months',
            'difficulty': 'Beginner',
            'water_requirement': 'Medium',
            'labor_intensity': 'Low',
            'market_demand': 'Medium',
            'weather_conditions': {
                'temperature': '20-30°C',
                'humidity': '60-75%',
                'rainfall': '600-800mm'
            },
            'farming_techniques': [
                'Traditional farming methods',
                'Crop rotation practices',
                'Organic manure application'
            ],
            'success_rate': '95%',
            'farmers_using': '6,234 farmers',
            'advantages': [
                'Extremely low risk',
                'Minimal investment',
                'Easy cultivation'
            ],
            'challenges': [
                'Lower profit margins',
                'Market competition',
                'Weather dependency'
            ]
        },
        {
            'combo_id': 'tech_advanced',
            'name': 'Tech Advanced Combo',
            'season': 'All Season',
            'description': 'Modern technology-driven high-profit farming',
            'crops': ['Strawberry', 'Lettuce', 'Bell Pepper'],
            'total_investment': '₹1,25,000 - ₹2,50,000',
            'expected_returns': '₹3,50,000 - ₹5,50,000',
            'roi_percentage': '120-150%',
            'duration': '6-8 months',
            'difficulty': 'Expert',
            'water_requirement': 'Controlled',
            'labor_intensity': 'Medium',
            'market_demand': 'Premium',
            'weather_conditions': {
                'temperature': 'Controlled 18-25°C',
                'humidity': 'Controlled 65-75%',
                'rainfall': 'Not applicable'
            },
            'farming_techniques': [
                'Hydroponics/Aeroponics',
                'Climate-controlled greenhouses',
                'IoT monitoring systems'
            ],
            'success_rate': '85%',
            'farmers_using': '437 farmers',
            'advantages': [
                'Highest profit margins',
                'Year-round production',
                'Premium market access'
            ],
            'challenges': [
                'High initial investment',
                'Technical expertise required',
                'Electricity dependency'
            ]
        }
    ]
    
    for combo in combos:
        # Create embedding for the combo
        embedding_text = f"""
        Combo: {combo['name']}
        Season: {combo['season']}
        Description: {combo['description']}
        Crops: {' '.join(combo['crops'])}
        Investment: {combo['total_investment']}
        Returns: {combo['expected_returns']}
        ROI: {combo['roi_percentage']}
        Duration: {combo['duration']}
        Difficulty: {combo['difficulty']}
        Water Requirement: {combo['water_requirement']}
        Success Rate: {combo['success_rate']}
        Advantages: {' '.join(combo['advantages'])}
        Challenges: {' '.join(combo['challenges'])}
        Techniques: {' '.join(combo['farming_techniques'])}
        """
        
        combo_with_embedding = {
            **combo,
            'vector_embedding': vectorize(embedding_text),
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }
        
        doc_ref = collection_ref.document(combo['combo_id'])
        doc_ref.set(combo_with_embedding)
        print(f"✓ Added crop combo: {combo['name']}")

def create_ai_prompts_collection():
    """Create AI prompt templates for Gemini"""
    print("Creating AI prompts collection...")
    
    collection_ref = db.collection('ai_prompts')
    
    prompts = {
        'crop_recommendation': {
            'template': """
            As an expert agricultural AI assistant, analyze the following conditions and provide crop recommendations:

            Current Conditions:
            - Location: {location}
            - Temperature: {temperature}°C
            - Humidity: {humidity}%
            - Soil Moisture: {soil_moisture}%
            - Season: {season}
            - Farmer Experience: {farmer_experience}
            - Available Investment: {investment}
            - Farm Size: {farm_size}

            Based on this data and the crop combos available, recommend the best 3 crop combinations with detailed justification.

            Format your response as JSON:
            {{
                "recommendations": [
                    {{
                        "combo_name": "Combo Name",
                        "confidence_score": 95,
                        "justification": "Detailed explanation",
                        "expected_roi": "75-90%",
                        "risk_level": "Low/Medium/High",
                        "timeline": "3-4 months",
                        "key_advantages": ["advantage1", "advantage2"],
                        "important_considerations": ["consideration1", "consideration2"]
                    }}
                ],
                "weather_analysis": "Brief weather suitability analysis",
                "market_insights": "Current market trends and pricing",
                "action_plan": [
                    "Step 1: Immediate action needed",
                    "Step 2: Within next week",
                    "Step 3: Long-term planning"
                ]
            }}
            """,
            'created_at': datetime.datetime.now()
        },
        'farming_technique': {
            'template': """
            As an agricultural expert, provide specific farming technique recommendations for:

            Crop: {crop_name}
            Growth Stage: {growth_stage}
            Current Issues: {issues}
            Weather Conditions: {weather}
            Farmer Level: {farmer_level}

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
            """,
            'created_at': datetime.datetime.now()
        }
    }
    
    for prompt_name, prompt_data in prompts.items():
        doc_ref = collection_ref.document(prompt_name)
        doc_ref.set(prompt_data)
        print(f"✓ Added AI prompt: {prompt_name}")

def main():
    """Main function to run the data insertion"""
    try:
        print("🌱 Starting Crop Intelligence Data Insertion...")
        
        # Load crop intelligence data
        crop_data = load_crop_intelligence_data()
        print(f"✓ Loaded crop intelligence data successfully")
        
        # Create collections with embeddings
        create_crop_recommendations_collection(crop_data)
        create_farming_techniques_collection(crop_data)
        create_weather_patterns_collection(crop_data)
        create_soil_crop_matrix_collection(crop_data)
        create_crop_combos_collection()
        create_ai_prompts_collection()
        
        print("🎉 All crop intelligence data uploaded successfully!")
        print("\nCollections created:")
        print("- crop_recommendations (with vector embeddings)")
        print("- farming_techniques (with vector embeddings)")  
        print("- weather_patterns (with vector embeddings)")
        print("- soil_crop_matrix (with vector embeddings)")
        print("- crop_combos (with vector embeddings)")
        print("- ai_prompts (template storage)")
        
    except Exception as e:
        print(f"❌ Error during data insertion: {e}")
        raise

if __name__ == "__main__":
    main()
