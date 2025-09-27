#!/usr/bin/env python3
"""
Test script for Waste Recycling API endpoints
"""

import requests
import json
import base64
from PIL import Image
import io

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/waste-recycling"

def create_test_image():
    """Create a simple test image for testing"""
    # Create a simple 100x100 test image
    img = Image.new('RGB', (100, 100), color='green')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes.getvalue()

def test_common_practices():
    """Test the common practices endpoint"""
    print("Testing /common-practices endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/common-practices")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: Found {data['data']['total_count']} practices")
            for practice in data['data']['practices'][:2]:  # Show first 2
                print(f"  - {practice['icon']} {practice['title']}: {practice['description']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_practice_details():
    """Test the practice details endpoint"""
    print("\nTesting /practice/{id} endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/practice/1")
        if response.status_code == 200:
            data = response.json()
            practice = data['data']
            print(f"✅ Success: {practice['icon']} {practice['title']}")
            print(f"  Difficulty: {practice['difficulty']}")
            print(f"  Time Required: {practice['time_required']}")
            print(f"  Materials: {', '.join(practice['materials_needed'])}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_analyze_waste():
    """Test the waste analysis endpoint"""
    print("\nTesting /analyze-waste endpoint...")
    
    try:
        # Create test image
        image_bytes = create_test_image()
        
        # Prepare form data
        files = {
            'image': ('test_waste.jpg', image_bytes, 'image/jpeg')
        }
        data = {
            'location': 'test_farm',
            'farmer_id': 'test_farmer_001'
        }
        
        response = requests.post(f"{API_BASE}/analyze-waste", files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            suggestions = result['data']['ai_suggestions']
            print(f"✅ Success: Generated {len(suggestions)} AI suggestions")
            for i, suggestion in enumerate(suggestions[:3], 1):  # Show first 3
                print(f"  {i}. {suggestion}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_farmer_history():
    """Test the farmer history endpoint"""
    print("\nTesting /farmer-history/{id} endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/farmer-history/test_farmer_001")
        if response.status_code == 200:
            data = response.json()
            history = data['data']['history']
            print(f"✅ Success: Found {len(history)} analysis records")
            for record in history:
                print(f"  - {record['timestamp']}: {record['suggestions_count']} suggestions")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_save_analysis():
    """Test the save analysis endpoint"""
    print("\nTesting /save-analysis endpoint...")
    
    try:
        data = {
            'farmer_id': 'test_farmer_001',
            'image_data': 'test_image_data',
            'suggestions': json.dumps([
                "Test suggestion 1",
                "Test suggestion 2",
                "Test suggestion 3"
            ]),
            'location': 'test_farm'
        }
        
        response = requests.post(f"{API_BASE}/save-analysis", data=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: Analysis saved with ID {result['data']['id']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    """Run all tests"""
    print("🧪 Testing Waste Recycling API Endpoints")
    print("=" * 50)
    
    # Test all endpoints
    test_common_practices()
    test_practice_details()
    test_analyze_waste()
    test_farmer_history()
    test_save_analysis()
    
    print("\n" + "=" * 50)
    print("🏁 Testing completed!")

if __name__ == "__main__":
    main() 