"""
Script to upload rich, Indian-specific mock data for 5 farmers to Firebase Firestore.

Instructions:
1. Go to Firebase Console > Project Settings > Service Accounts.
2. Generate a new private key and download the JSON file.
3. Place the JSON file as 'serviceAccountKey.json' in this folder.
4. Install dependencies: pip install firebase-admin
5. Run this script: python data.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import datetime
import random
import numpy as np

# pip install sentence-transformers
from sentence_transformers import SentenceTransformer

# Initialize the embedding model once
model = SentenceTransformer('all-MiniLM-L6-v2')

def vectorize(text):
    return model.encode(text).tolist()

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- MOCK DATA FOR ONE FARMER ---
farmer = {
    'farmerId': 'f001',
    'name': 'Vinayak Bhatia',
    'profileImage': 'https://randomuser.me/api/portraits/men/31.jpg',
    'village': 'Shirur, Maharashtra',
    'phoneNumber': '+91 98765 43210',
    'language': 'Marathi',
    'farmLocation': {'lat': 18.8237, 'lng': 74.3732},
    'farmSize': '5 acres',
    'preferredInteractionMode': 'voice',
    'onboardingStatus': 'complete',
    'livestock': [
        {'id': 'c1', 'type': 'cow', 'name': 'Gauri', 'age': '4 years', 'breed': 'Gir', 'milkCapacity': '18L/day', 'health': 'Excellent', 'lastCheckup': '2024-06-10', 'icon': '🐄', 'color': '#4ADE80'},
        {'id': 'c2', 'type': 'goat', 'name': 'Moti', 'age': '2 years', 'breed': 'Jamunapari', 'milkCapacity': '2L/day', 'health': 'Good', 'lastCheckup': '2024-06-12', 'icon': '🐐', 'color': '#8B5CF6'},
        {'id': 'c3', 'type': 'buffalo', 'name': 'Shyam', 'age': '5 years', 'breed': 'Murrah', 'milkCapacity': '22L/day', 'health': 'Excellent', 'lastCheckup': '2024-06-15', 'icon': '🐃', 'color': '#F59E0B'},
        {'id': 'c4', 'type': 'hen', 'name': 'Chikki', 'age': '1 year', 'breed': 'Aseel', 'eggCapacity': '6 eggs/week', 'health': 'Good', 'lastCheckup': '2024-06-18', 'icon': '🐔', 'color': '#EF4444'},
    ],
    'crops': [
        {
            'cropId': 'cr1',
            'name': 'Sugarcane',
            'icon': 'barley',
            'plantingDate': '2023-10-15',
            'totalDuration': '12-18 Months',
            'stages': [
                {'id': 1, 'title': 'Land Preparation', 'durationWeeks': 4, 'icon': 'shovel', 'color': '#a1662f', 'tasks': ['Deep ploughing', 'Apply FYM', 'Create furrows'], 'needs': 'Well-drained, loamy soil.', 'threats': 'Soil-borne pathogens.'},
                {'id': 2, 'title': 'Planting', 'durationWeeks': 2, 'icon': 'seed-outline', 'color': '#8f9a62', 'tasks': ['Select healthy setts', 'Treat with fungicide', 'Plant in furrows'], 'needs': 'Optimal moisture.', 'threats': 'Poor sett quality.'},
                {'id': 3, 'title': 'Irrigation', 'durationWeeks': 8, 'icon': 'water-outline', 'color': '#60A5FA', 'tasks': ['Drip irrigation', 'Monitor soil moisture'], 'needs': 'Consistent water supply.', 'threats': 'Waterlogging.'},
                {'id': 4, 'title': 'Fertilization', 'durationWeeks': 6, 'icon': 'fertilizer', 'color': '#fca311', 'tasks': ['Apply urea', 'Micronutrient spray'], 'needs': 'Balanced nutrients.', 'threats': 'Nutrient deficiency.'},
            ]
        },
        {
            'cropId': 'cr2',
            'name': 'Wheat',
            'icon': 'wheat',
            'plantingDate': '2023-11-10',
            'totalDuration': '5 Months',
            'stages': [
                {'id': 1, 'title': 'Sowing', 'durationWeeks': 2, 'icon': 'seed-outline', 'color': '#a1662f', 'tasks': ['Sow seeds', 'Irrigate'], 'needs': 'Moist soil.', 'threats': 'Birds.'},
                {'id': 2, 'title': 'Tillering', 'durationWeeks': 4, 'icon': 'sprout-outline', 'color': '#8f9a62', 'tasks': ['Weeding', 'Fertilizer application'], 'needs': 'Nutrients.', 'threats': 'Weeds.'},
                {'id': 3, 'title': 'Harvest', 'durationWeeks': 2, 'icon': 'harvest', 'color': '#fca311', 'tasks': ['Cutting', 'Threshing'], 'needs': 'Dry weather.', 'threats': 'Rain.'},
            ]
        },
        {
            'cropId': 'cr3',
            'name': 'Onion',
            'icon': 'onion',
            'plantingDate': '2024-01-05',
            'totalDuration': '4 Months',
            'stages': [
                {'id': 1, 'title': 'Nursery Preparation', 'durationWeeks': 3, 'icon': 'seed-outline', 'color': '#99bb6d', 'tasks': ['Prepare nursery bed', 'Sow seeds'], 'needs': 'Fine soil.', 'threats': 'Seedling blight.'},
                {'id': 2, 'title': 'Transplanting', 'durationWeeks': 1, 'icon': 'plant-outline', 'color': '#6a994e', 'tasks': ['Transplant seedlings'], 'needs': 'Flooded field.', 'threats': 'Root rot.'},
                {'id': 3, 'title': 'Bulb Formation', 'durationWeeks': 6, 'icon': 'bulb-outline', 'color': '#fca311', 'tasks': ['Fertilizer application', 'Irrigation'], 'needs': 'Nutrients.', 'threats': 'Fungal rot.'},
            ]
        },
        {
            'cropId': 'cr4',
            'name': 'Tomato',
            'icon': 'tomato',
            'plantingDate': '2024-02-10',
            'totalDuration': '3 Months',
            'stages': [
                {'id': 1, 'title': 'Seed Sowing', 'durationWeeks': 2, 'icon': 'seed-outline', 'color': '#a1662f', 'tasks': ['Sow seeds', 'Water daily'], 'needs': 'Moist soil.', 'threats': 'Damping off.'},
                {'id': 2, 'title': 'Transplanting', 'durationWeeks': 1, 'icon': 'plant-outline', 'color': '#6a994e', 'tasks': ['Transplant seedlings'], 'needs': 'Cool weather.', 'threats': 'Transplant shock.'},
                {'id': 3, 'title': 'Flowering', 'durationWeeks': 2, 'icon': 'flower-outline', 'color': '#fca311', 'tasks': ['Fertilizer application', 'Pest control'], 'needs': 'Warm weather.', 'threats': 'Aphids.'},
                {'id': 4, 'title': 'Harvest', 'durationWeeks': 2, 'icon': 'harvest', 'color': '#fca311', 'tasks': ['Pick ripe tomatoes'], 'needs': 'Gentle handling.', 'threats': 'Bruising.'},
            ]
        },
        {
            'cropId': 'cr5',
            'name': 'Chickpea',
            'icon': 'chickpea',
            'plantingDate': '2023-12-01',
            'totalDuration': '4 Months',
            'stages': [
                {'id': 1, 'title': 'Sowing', 'durationWeeks': 2, 'icon': 'seed-outline', 'color': '#a1662f', 'tasks': ['Sow seeds', 'Irrigate'], 'needs': 'Moist soil.', 'threats': 'Seed rot.'},
                {'id': 2, 'title': 'Vegetative', 'durationWeeks': 6, 'icon': 'sprout-outline', 'color': '#8f9a62', 'tasks': ['Weeding', 'Fertilizer application'], 'needs': 'Nutrients.', 'threats': 'Weeds.'},
                {'id': 3, 'title': 'Pod Formation', 'durationWeeks': 3, 'icon': 'pod-outline', 'color': '#fca311', 'tasks': ['Monitor pods', 'Pest control'], 'needs': 'Dry weather.', 'threats': 'Pod borer.'},
            ]
        },
    ],
    'calendarEvents': [
        {'date': '2024-07-22', 'time': '06:00', 'task': 'Irrigation - Field A', 'type': 'irrigation', 'priority': 'high', 'details': 'Irrigate Field A for 2 hours. Use drip system. Check pump pressure.', 'completed': False},
        {'date': '2024-07-23', 'time': '09:00', 'task': 'Soil Testing - Plot 3', 'type': 'analysis', 'priority': 'medium', 'details': 'Collect soil samples from Plot 3. Send to lab for NPK analysis.', 'completed': False},
        {'date': '2024-07-24', 'time': '07:00', 'task': 'Banana Fertilizer', 'type': 'treatment', 'priority': 'medium', 'details': 'Apply potash fertilizer to banana plants.', 'completed': False},
        {'date': '2024-07-25', 'time': '06:30', 'task': 'Cotton Pest Control', 'type': 'monitoring', 'priority': 'high', 'details': 'Spray pesticide for bollworm.', 'completed': False},
        {'date': '2024-07-26', 'time': '08:00', 'task': 'Wheat Harvest', 'type': 'harvest', 'priority': 'high', 'details': 'Begin wheat harvest in Field B.', 'completed': False},
    ],
    'marketListings': [
        {'id': 'm1', 'name': 'Organic Wheat', 'quantity': '50 quintals', 'myPrice': 2600, 'marketPrice': 2450, 'status': 'active', 'views': 24, 'inquiries': 3, 'emoji': '🌾', 'createdAt': '2024-06-01'},
        {'id': 'm2', 'name': 'Fresh Onions', 'quantity': '20 quintals', 'myPrice': 1800, 'marketPrice': 1700, 'status': 'active', 'views': 15, 'inquiries': 2, 'emoji': '🧅', 'createdAt': '2024-06-10'},
        {'id': 'm3', 'name': 'Tomatoes', 'quantity': '15 quintals', 'myPrice': 2200, 'marketPrice': 2100, 'status': 'active', 'views': 18, 'inquiries': 4, 'emoji': '🍅', 'createdAt': '2024-06-15'},
        {'id': 'm4', 'name': 'Chickpeas', 'quantity': '10 quintals', 'myPrice': 5000, 'marketPrice': 4800, 'status': 'active', 'views': 10, 'inquiries': 1, 'emoji': '🥜', 'createdAt': '2024-06-20'},
    ],
    'chatHistory': [
        {'id': 'ch1', 'title': 'Sugarcane Disease', 'date': '2024-06-10', 'messages': [
            {'sender': 'user', 'type': 'text', 'content': 'My sugarcane leaves are yellowing.', 'timestamp': '2024-06-10T10:00:00'},
            {'sender': 'ai', 'type': 'text', 'content': 'It could be nitrogen deficiency. Try urea application.', 'timestamp': '2024-06-10T10:01:00'},
        ]},
        {'id': 'ch2', 'title': 'Wheat Harvest', 'date': '2024-06-15', 'messages': [
            {'sender': 'user', 'type': 'text', 'content': 'When should I harvest wheat?', 'timestamp': '2024-06-15T08:00:00'},
            {'sender': 'ai', 'type': 'text', 'content': 'Harvest when grains are hard and golden.', 'timestamp': '2024-06-15T08:01:00'},
        ]},
        {'id': 'ch3', 'title': 'Onion Storage', 'date': '2024-06-20', 'messages': [
            {'sender': 'user', 'type': 'text', 'content': 'How to store onions after harvest?', 'timestamp': '2024-06-20T09:00:00'},
            {'sender': 'ai', 'type': 'text', 'content': 'Cure onions in shade for 2 weeks before storage.', 'timestamp': '2024-06-20T09:01:00'},
        ]},
        {'id': 'ch4', 'title': 'Tomato Pests', 'date': '2024-06-25', 'messages': [
            {'sender': 'user', 'type': 'text', 'content': 'Tomato plants have whiteflies.', 'timestamp': '2024-06-25T10:00:00'},
            {'sender': 'ai', 'type': 'text', 'content': 'Use yellow sticky traps and neem oil spray.', 'timestamp': '2024-06-25T10:01:00'},
        ]},
    ],
    'documents': [
        {'id': 'd1', 'title': 'Land Ownership Affidavit', 'time': '2024-06-10T10:24:00', 'type': 'affidavit', 'status': 'completed', 'fields': {'owner': 'Vinayak Patil', 'village': 'Shirur'}},
        {'id': 'd2', 'title': 'Crop Insurance', 'time': '2024-06-12T11:00:00', 'type': 'insurance', 'status': 'completed', 'fields': {'insured': 'Vinayak Bhatia', 'crop': 'Wheat'}},
        {'id': 'd3', 'title': 'Veterinary Bill', 'time': '2024-06-15T09:00:00', 'type': 'bill', 'status': 'completed', 'fields': {'animal': 'Shyam', 'amount': 700}},
        {'id': 'd4', 'title': 'Soil Test Report', 'time': '2024-06-18T11:00:00', 'type': 'report', 'status': 'completed', 'fields': {'crop': 'Onion', 'ph': 6.7}},
        {'id': 'd5', 'title': 'Chickpea Certification', 'time': '2024-06-20T12:00:00', 'type': 'certificate', 'status': 'completed', 'fields': {'crop': 'Chickpea', 'certifiedBy': 'Govt. of Maharashtra'}},
    ],
}

# --- VECTORIZE MAJOR SECTIONS ---
farmer['vectors'] = {
    'profile': vectorize(farmer['name'] + ' ' + farmer['village'] + ' ' + farmer['language']),
    'livestock': vectorize(str(farmer['livestock'])),
    'crops': vectorize(str(farmer['crops'])),
    'calendarEvents': vectorize(str(farmer['calendarEvents'])),
    'marketListings': vectorize(str(farmer['marketListings'])),
    'chatHistory': vectorize(str(farmer['chatHistory'])),
    'documents': vectorize(str(farmer['documents'])),
}

# --- UPLOAD TO FIRESTORE WITH ERROR HANDLING ---
def upload_farmer(farmer):
    doc_ref = db.collection('farmers').document(farmer['farmerId'])
    try:
        doc_ref.set({k: v for k, v in farmer.items() if k != 'farmerId'})
        print(f"Uploaded data for farmer: {farmer['name']} ({farmer['village']})")
    except Exception as e:
        print(f"Error uploading data for farmer {farmer['name']}: {e}")

if __name__ == "__main__":
    upload_farmer(farmer)
    print("All mock data uploaded successfully!")
