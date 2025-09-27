"""
Alternative Offline Data Fetcher - Uses Backend API Routes
Fetches data from your running backend server instead of directly from Firebase
"""

import json
import os
import requests
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Any
import numpy as np
from pathlib import Path

try:
    from sentence_transformers import SentenceTransformer
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Embedding model loaded successfully")
except Exception as e:
    print(f"❌ Error loading embedding model: {e}")
    embedding_model = None

# Base URL for the backend
BASE_URL = "http://localhost:8000"
OFFLINE_DATA_DIR = "offline_data"

# Ensure offline data directory exists
os.makedirs(OFFLINE_DATA_DIR, exist_ok=True)

def create_embedding(text: str) -> List[float]:
    """Create embedding for text"""
    if embedding_model and text:
        try:
            return embedding_model.encode(text).tolist()
        except Exception as e:
            print(f"Error creating embedding: {e}")
    return []

def save_json(data: Dict[str, Any], filename: str):
    """Save data to JSON file"""
    filepath = os.path.join(OFFLINE_DATA_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    print(f"✅ Saved {filename} with {len(data.get('data', []))} records")

def load_existing_data_files():
    """Load existing data files from the project"""
    print("📊 Loading existing data files...")
    
    # Look for existing data files in the project
    data_files = {
        'crop_specific_data.json': '../../crop_specific_data.json',
        'data.json': '../../data.json'
    }
    
    loaded_data = {}
    
    for filename, filepath in data_files.items():
        try:
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # Add embeddings to the data
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            # Create searchable text from all string values
                            searchable_text = ' '.join([str(v) for k, v in item.items() 
                                                      if isinstance(v, (str, int, float)) and str(v).strip()])
                            item['embedding'] = create_embedding(searchable_text)
                            item['searchable_text'] = searchable_text
                elif isinstance(data, dict):
                    for key, items in data.items():
                        if isinstance(items, list):
                            for item in items:
                                if isinstance(item, dict):
                                    searchable_text = ' '.join([str(v) for k, v in item.items() 
                                                              if isinstance(v, (str, int, float)) and str(v).strip()])
                                    item['embedding'] = create_embedding(searchable_text)
                                    item['searchable_text'] = searchable_text
                
                loaded_data[filename] = data
                print(f"✅ Loaded {filename}")
            else:
                print(f"❌ File not found: {filepath}")
        except Exception as e:
            print(f"❌ Error loading {filename}: {e}")
    
    # Save processed data
    for filename, data in loaded_data.items():
        save_json({
            'data': data,
            'source': 'existing_file',
            'original_file': filename,
            'last_updated': datetime.now().isoformat()
        }, f"processed_{filename}")
    
    return loaded_data

async def fetch_api_routes():
    """Fetch data from available API routes"""
    print("📊 Fetching data from API routes...")
    
    api_data = {}
    
    # Routes that don't require parameters
    simple_routes = [
        ('/market/prices', 'market_prices'),
        ('/soil-moisture', 'soil_moisture'),
        ('/crop-cycle/health', 'crop_cycle_health'),
        ('/crop-intelligence/health', 'crop_intelligence_health'),
        ('/crop-intelligence/combos', 'crop_combos'),
        ('/crop-intelligence/recommendations', 'crop_recommendations')
    ]
    
    async with aiohttp.ClientSession() as session:
        for route, name in simple_routes:
            try:
                url = f"{BASE_URL}{route}"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Add embeddings if it's list data
                        if isinstance(data, list):
                            for item in data:
                                if isinstance(item, dict):
                                    searchable_text = ' '.join([str(v) for k, v in item.items() 
                                                              if isinstance(v, (str, int, float)) and str(v).strip()])
                                    item['embedding'] = create_embedding(searchable_text)
                                    item['searchable_text'] = searchable_text
                        
                        api_data[name] = data
                        print(f"✅ Fetched {name}")
                    else:
                        print(f"❌ Error fetching {route}: {response.status}")
            except Exception as e:
                print(f"❌ Error fetching {route}: {e}")
    
    if api_data:
        save_json({
            'data': api_data,
            'source': 'api_routes',
            'routes_fetched': list(api_data.keys()),
            'last_updated': datetime.now().isoformat()
        }, 'api_fetched_data.json')
    
    return api_data

def fetch_sample_data_for_routes():
    """Create sample data for routes that require parameters"""
    print("📊 Creating sample data for parameterized routes...")
    
    sample_data = {
        'farmer_management': {
            'sample_farmer_id': 'farmer_001',
            'routes': [
                '/farmer/{farmer_id}',
                '/farmer/{farmer_id}/profile',
                '/farmer/{farmer_id}/crops',
                '/farmer/{farmer_id}/livestock',
                '/farmer/{farmer_id}/calendar',
                '/farmer/{farmer_id}/market'
            ]
        },
        'weather_routes': {
            'sample_locations': [
                {'city': 'Pune,IN', 'lat': 18.52, 'lon': 73.86},
                {'city': 'Mumbai,IN', 'lat': 19.07, 'lon': 72.87},
                {'city': 'Delhi,IN', 'lat': 28.61, 'lon': 77.20}
            ],
            'routes': [
                '/weather/city?city={city}',
                '/weather/coords?lat={lat}&lon={lon}',
                '/weather/forecast/city?city={city}',
                '/weather/forecast/coords?lat={lat}&lon={lon}'
            ]
        },
        'crop_cycle_routes': {
            'sample_crops': ['wheat', 'rice', 'cotton', 'sugarcane'],
            'routes': [
                '/crop-cycle/corporate-buyers/{crop}',
                '/crop-cycle/loan-schemes',
                '/crop-cycle/insurance-plans',
                '/crop-cycle/certifications',
                '/crop-cycle/solar-schemes',
                '/crop-cycle/government-schemes'
            ]
        },
        'rental_routes': {
            'sample_farmer_id': 'farmer_001',
            'routes': [
                '/rental/activity?farmerId={farmer_id}',
                '/rental/featured?farmerId={farmer_id}',
                '/rental/bookings?farmerId={farmer_id}',
                '/rental/earnings?farmerId={farmer_id}'
            ]
        }
    }
    
    save_json({
        'data': sample_data,
        'source': 'sample_templates',
        'description': 'Sample data templates for parameterized routes',
        'last_updated': datetime.now().isoformat()
    }, 'sample_route_templates.json')
    
    return sample_data

async def fetch_parameterized_routes():
    """Fetch data from routes that require parameters using sample data"""
    print("📊 Fetching data from parameterized routes...")
    
    parameterized_data = {}
    
    async with aiohttp.ClientSession() as session:
        # Try weather routes with sample cities
        sample_cities = ['Pune,IN', 'Mumbai,IN', 'Delhi,IN']
        weather_data = {}
        
        for city in sample_cities:
            try:
                url = f"{BASE_URL}/weather/city?city={city}"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        weather_data[city] = data
                        print(f"✅ Fetched weather for {city}")
            except Exception as e:
                print(f"❌ Error fetching weather for {city}: {e}")
        
        if weather_data:
            parameterized_data['weather_by_city'] = weather_data
        
        # Try crop cycle routes
        crop_cycle_routes = [
            '/crop-cycle/loan-schemes',
            '/crop-cycle/insurance-plans',
            '/crop-cycle/certifications',
            '/crop-cycle/solar-schemes',
            '/crop-cycle/government-schemes'
        ]
        
        crop_cycle_data = {}
        for route in crop_cycle_routes:
            try:
                url = f"{BASE_URL}{route}"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        route_name = route.split('/')[-1]
                        crop_cycle_data[route_name] = data
                        print(f"✅ Fetched {route_name}")
            except Exception as e:
                print(f"❌ Error fetching {route}: {e}")
        
        if crop_cycle_data:
            parameterized_data['crop_cycle'] = crop_cycle_data
    
    if parameterized_data:
        save_json({
            'data': parameterized_data,
            'source': 'parameterized_api_routes',
            'last_updated': datetime.now().isoformat()
        }, 'parameterized_routes_data.json')
    
    return parameterized_data

def create_comprehensive_search_index():
    """Create a comprehensive search index from all collected data"""
    print("📊 Creating comprehensive search index...")
    
    search_index = {
        'created_at': datetime.now().isoformat(),
        'total_items': 0,
        'categories': {},
        'embeddings': [],
        'searchable_items': []
    }
    
    # Scan all JSON files in offline_data directory
    for filename in os.listdir(OFFLINE_DATA_DIR):
        if filename.endswith('.json') and filename != 'comprehensive_search_index.json':
            filepath = os.path.join(OFFLINE_DATA_DIR, filename)
            category = filename.replace('.json', '')
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    file_data = json.load(f)
                
                search_index['categories'][category] = {
                    'filename': filename,
                    'item_count': 0,
                    'has_embeddings': False
                }
                
                def extract_searchable_items(data, source_category, source_file):
                    """Recursively extract searchable items from data"""
                    items_found = 0
                    
                    if isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and 'searchable_text' in item:
                                search_index['searchable_items'].append({
                                    'id': len(search_index['searchable_items']),
                                    'text': item['searchable_text'],
                                    'embedding': item.get('embedding', []),
                                    'source_category': source_category,
                                    'source_file': source_file,
                                    'original_data': {k: v for k, v in item.items() 
                                                    if k not in ['embedding', 'searchable_text']}
                                })
                                items_found += 1
                                
                                if item.get('embedding'):
                                    search_index['categories'][category]['has_embeddings'] = True
                    
                    elif isinstance(data, dict):
                        for key, value in data.items():
                            items_found += extract_searchable_items(value, f"{source_category}.{key}", source_file)
                    
                    return items_found
                
                # Extract items from file data
                items_count = extract_searchable_items(file_data.get('data', {}), category, filename)
                search_index['categories'][category]['item_count'] = items_count
                search_index['total_items'] += items_count
                
            except Exception as e:
                print(f"❌ Error processing {filename} for search index: {e}")
    
    # Create embedding matrix for efficient similarity search
    embeddings_matrix = []
    for item in search_index['searchable_items']:
        if item['embedding']:
            embeddings_matrix.append(item['embedding'])
    
    if embeddings_matrix:
        search_index['embeddings_matrix_shape'] = [len(embeddings_matrix), len(embeddings_matrix[0])]
        # Don't save the full matrix in JSON due to size, but note its availability
        search_index['has_embeddings_matrix'] = True
    
    save_json(search_index, 'comprehensive_search_index.json')
    
    return search_index

def create_api_documentation():
    """Create comprehensive API documentation from collected data"""
    print("📊 Creating API documentation...")
    
    # Load the routes JSON we created earlier
    try:
        with open('all_backend_routes.json', 'r') as f:
            routes_data = json.load(f)
    except:
        routes_data = {}
    
    api_docs = {
        'generated_at': datetime.now().isoformat(),
        'total_routes': routes_data.get('summary', {}).get('total_routes', 0),
        'backend_info': {
            'base_url': BASE_URL,
            'total_modules': routes_data.get('summary', {}).get('total_modules', 0),
            'methods_breakdown': routes_data.get('summary', {}).get('methods_breakdown', {}),
            'key_features': routes_data.get('summary', {}).get('key_features', [])
        },
        'route_categories': {},
        'data_availability': {},
        'offline_capabilities': {
            'data_files_created': len([f for f in os.listdir(OFFLINE_DATA_DIR) if f.endswith('.json')]),
            'search_enabled': True,
            'embeddings_available': embedding_model is not None
        }
    }
    
    # Add route information
    if 'backend_routes' in routes_data:
        for category, category_info in routes_data['backend_routes'].items():
            api_docs['route_categories'][category] = {
                'base_url': category_info.get('base_url', ''),
                'route_count': len(category_info.get('routes', [])),
                'routes': category_info.get('routes', [])
            }
    
    # Check which data is available offline
    for filename in os.listdir(OFFLINE_DATA_DIR):
        if filename.endswith('.json'):
            try:
                filepath = os.path.join(OFFLINE_DATA_DIR, filename)
                with open(filepath, 'r') as f:
                    data = json.load(f)
                    
                api_docs['data_availability'][filename] = {
                    'records_count': len(data.get('data', [])) if isinstance(data.get('data'), list) else 'N/A',
                    'last_updated': data.get('last_updated', 'Unknown'),
                    'source': data.get('source', 'Unknown'),
                    'has_embeddings': any('embedding' in str(data).lower() for _ in [1])
                }
            except:
                api_docs['data_availability'][filename] = {'status': 'error_reading_file'}
    
    save_json(api_docs, 'api_documentation.json')
    return api_docs

async def main():
    """Main function to fetch all offline data"""
    print("🚀 Starting comprehensive offline data fetching process...")
    print(f"📁 Data will be saved to: {os.path.abspath(OFFLINE_DATA_DIR)}")
    
    try:
        # Step 1: Load existing data files
        existing_data = load_existing_data_files()
        
        # Step 2: Fetch from simple API routes
        api_data = await fetch_api_routes()
        
        # Step 3: Create sample data templates
        sample_data = fetch_sample_data_for_routes()
        
        # Step 4: Fetch from parameterized routes
        parameterized_data = await fetch_parameterized_routes()
        
        # Step 5: Create comprehensive search index
        search_index = create_comprehensive_search_index()
        
        # Step 6: Create API documentation
        api_docs = create_api_documentation()
        
        print("\n✅ Comprehensive offline data collection completed!")
        print(f"📊 Total JSON files created: {len([f for f in os.listdir(OFFLINE_DATA_DIR) if f.endswith('.json')])}")
        print(f"🔍 Total searchable items: {search_index.get('total_items', 0)}")
        print(f"📁 Data location: {os.path.abspath(OFFLINE_DATA_DIR)}")
        
        # Print summary
        print("\n📋 Files created:")
        for filename in sorted(os.listdir(OFFLINE_DATA_DIR)):
            if filename.endswith('.json'):
                filepath = os.path.join(OFFLINE_DATA_DIR, filename)
                size_kb = round(os.path.getsize(filepath) / 1024, 2)
                print(f"  • {filename} ({size_kb} KB)")
        
        print(f"\n🎯 Next steps:")
        print(f"  1. Use the search index for offline search functionality")
        print(f"  2. Implement embedding-based similarity search")
        print(f"  3. Use API documentation for route mapping")
        print(f"  4. Consider running backend server to fetch more live data")
        
    except Exception as e:
        print(f"❌ Error in main process: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
