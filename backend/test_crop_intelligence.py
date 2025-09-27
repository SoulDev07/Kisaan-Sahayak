#!/usr/bin/env python3
"""
Test script for Crop Intelligence Backend
Tests all the endpoints to ensure they work correctly
"""

import requests
import json
import sys

API_BASE = 'http://localhost:8000'

def test_health():
    """Test health endpoint"""
    print("🏥 Testing health endpoint...")
    try:
        response = requests.get(f'{API_BASE}/crop-intelligence/health')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_combos():
    """Test crop combos endpoint"""
    print("\n🌾 Testing crop combos endpoint...")
    try:
        response = requests.get(f'{API_BASE}/crop-intelligence/combos')
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('combos'):
                print(f"✅ Found {len(data['combos'])} crop combos")
                return True
            else:
                print("❌ No combos found in response")
                return False
        else:
            print(f"❌ Combos endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Combos endpoint error: {e}")
        return False

def test_recommendations():
    """Test AI recommendations endpoint"""
    print("\n🤖 Testing AI recommendations endpoint...")
    try:
        test_data = {
            "location": "Pune, Maharashtra",
            "temperature": 28.5,
            "humidity": 75.0,
            "soil_moisture": 80.0,
            "season": "monsoon",
            "farmer_experience": "intermediate",
            "available_investment": "₹50,000-75,000",
            "farm_size": "2-3 hectares",
            "specific_query": "Need crops suitable for monsoon season with good market prices"
        }
        
        response = requests.post(
            f'{API_BASE}/crop-intelligence/recommend', 
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('recommendations'):
                print(f"✅ Got {len(data['recommendations'])} recommendations")
                print(f"   Confidence: {data.get('confidence_score', 0)*100:.1f}%")
                return True
            else:
                print("❌ No recommendations found in response")
                return False
        else:
            print(f"❌ Recommendations endpoint failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Recommendations endpoint error: {e}")
        return False

def test_search():
    """Test search endpoint"""
    print("\n🔍 Testing search endpoint...")
    try:
        response = requests.get(f'{API_BASE}/crop-intelligence/search?query=rice farming techniques&collections=crop_combos,farming_techniques')
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('results'):
                print(f"✅ Found {len(data['results'])} search results")
                return True
            else:
                print("❌ No search results found")
                return False
        else:
            print(f"❌ Search endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Search endpoint error: {e}")
        return False

def test_legacy_endpoint():
    """Test legacy recommendations endpoint"""
    print("\n🔄 Testing legacy recommendations endpoint...")
    try:
        response = requests.get(f'{API_BASE}/crop-intelligence/recommendations?temperature=28&humidity=75&soil_moisture=80&location=Pune,Maharashtra')
        if response.status_code == 200:
            data = response.json()
            print("✅ Legacy endpoint working")
            return True
        else:
            print(f"❌ Legacy endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Legacy endpoint error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Crop Intelligence Backend Tests...\n")
    
    tests = [
        test_health,
        test_combos,
        test_recommendations,
        test_search,
        test_legacy_endpoint
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the backend setup.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
