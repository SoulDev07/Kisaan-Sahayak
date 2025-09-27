import firebase_admin
from firebase_admin import credentials, firestore
import datetime
import random
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
def vectorize(text):
    return model.encode(text).tolist()

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- ENHANCED CROPS DATA ---
crops = [
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
        ],
        'subsidies': [
            {'id': 'sub1', 'title': 'PM Krishi Sinchayee Yojana', 'description': 'Subsidy for micro-irrigation systems.'},
            {'id': 'sub2', 'title': 'Sugarcane Development Scheme', 'description': 'Support for high-yielding varieties.'}
        ],
        'analysis': {
            'trends': {
                'labels': ['4w ago', '3w ago', '2w ago', 'Last week'],
                'datasets': [
                    {'name': 'Soil Moisture', 'color': '#3498db', 'data': [70, 65, 75, 60]},
                    {'name': 'Rainfall (mm)', 'color': '#9b59b6', 'data': [10, 5, 25, 2]},
                ]
            },
            'aiInsights': 'Soil moisture dropped last week. Recommend irrigation.'
        },
        'suggestions': [
            {'id': 'sug1', 'type': 'alert', 'title': 'Pest Alert: Top Borer', 'description': 'Minor infestation detected. Spray recommended.', 'icon': 'alert-octagon'},
            {'id': 'sug2', 'type': 'recommendation', 'title': 'Nutrient Boost', 'description': 'Apply potassium fertilizer soon.', 'icon': 'flask-outline'}
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
        ],
        'subsidies': [
            {'id': 'sub1', 'title': 'Wheat MSP', 'description': 'Minimum support price for wheat.'}
        ],
        'analysis': {
            'trends': {
                'labels': ['4w ago', '3w ago', '2w ago', 'Last week'],
                'datasets': [
                    {'name': 'Growth Rate', 'color': '#2ecc71', 'data': [60, 70, 80, 90]},
                    {'name': 'Rainfall (mm)', 'color': '#9b59b6', 'data': [5, 10, 15, 8]},
                ]
            },
            'aiInsights': 'Growth rate is improving. Monitor rainfall.'
        },
        'suggestions': [
            {'id': 'sug1', 'type': 'recommendation', 'title': 'Increase Irrigation', 'description': 'Soil is drying, irrigate soon.', 'icon': 'water-outline'}
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
        ],
        'subsidies': [
            {'id': 'sub1', 'title': 'MIDH', 'description': 'Support for high-quality seeds and post-harvest infrastructure.'}
        ],
        'analysis': {
            'trends': {
                'labels': ['4w ago', '3w ago', '2w ago', 'Last week'],
                'datasets': [
                    {'name': 'Bulb Size Index', 'color': '#fca311', 'data': [30, 40, 55, 60]},
                    {'name': 'Fungal Incidence', 'color': '#e74c3c', 'data': [5, 8, 12, 10]},
                ]
            },
            'aiInsights': 'Bulb size is increasing. Fungal incidence is manageable.'
        },
        'suggestions': [
            {'id': 'sug1', 'type': 'recommendation', 'title': 'Fungicide Application', 'description': 'Apply fungicide if rain persists.', 'icon': 'flask-outline'}
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
        ],
        'subsidies': [
            {'id': 'sub1', 'title': 'MIDH', 'description': 'Support for integrated pest management and post-harvest.'}
        ],
        'analysis': {
            'trends': {
                'labels': ['4w ago', '3w ago', '2w ago', 'Last week'],
                'datasets': [
                    {'name': 'Fruit Set Rate', 'color': '#2ecc71', 'data': [40, 60, 85, 90]},
                    {'name': 'Pest Activity', 'color': '#e74c3c', 'data': [5, 8, 12, 15]},
                ]
            },
            'aiInsights': 'Fruit set rate is excellent. Pest activity rising, monitor closely.'
        },
        'suggestions': [
            {'id': 'sug1', 'type': 'recommendation', 'title': 'Increase Potassium', 'description': 'Apply potassium nitrate to improve fruit size.', 'icon': 'flask-outline'}
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
        ],
        'subsidies': [
            {'id': 'sub1', 'title': 'Chickpea Certification', 'description': 'Government certification for quality produce.'}
        ],
        'analysis': {
            'trends': {
                'labels': ['4w ago', '3w ago', '2w ago', 'Last week'],
                'datasets': [
                    {'name': 'Pod Count', 'color': '#fca311', 'data': [10, 20, 30, 40]},
                    {'name': 'Pest Incidence', 'color': '#e74c3c', 'data': [2, 3, 5, 4]},
                ]
            },
            'aiInsights': 'Pod count is increasing. Pest incidence is low.'
        },
        'suggestions': [
            {'id': 'sug1', 'type': 'recommendation', 'title': 'Monitor Pods', 'description': 'Check for pod borer weekly.', 'icon': 'eye-outline'}
        ]
    },
]

calendarEvents = [
    # July 2025 events
    {'date': '2025-07-05', 'time': '07:00', 'task': 'Weed Removal - Field A', 'type': 'maintenance', 'priority': 'medium', 'details': 'Remove weeds from Field A.', 'completed': False},
    {'date': '2025-07-10', 'time': '06:30', 'task': 'Irrigation - Field B', 'type': 'irrigation', 'priority': 'high', 'details': 'Irrigate Field B for 1.5 hours.', 'completed': False},
    {'date': '2025-07-15', 'time': '08:00', 'task': 'Fertilizer Application', 'type': 'treatment', 'priority': 'medium', 'details': 'Apply NPK fertilizer to wheat.', 'completed': False},
    {'date': '2025-07-20', 'time': '09:00', 'task': 'Cattle Health Check', 'type': 'livestock', 'priority': 'high', 'details': 'Routine health check for all cattle.', 'completed': False},
    {'date': '2025-07-25', 'time': '07:30', 'task': 'Harvest - Onion', 'type': 'harvest', 'priority': 'high', 'details': 'Begin onion harvest.', 'completed': False},
    # August 2025 events
    {'date': '2025-08-02', 'time': '06:00', 'task': 'Soil Testing - Plot 2', 'type': 'analysis', 'priority': 'medium', 'details': 'Collect soil samples for NPK analysis.', 'completed': False},
    {'date': '2025-08-08', 'time': '07:00', 'task': 'Pest Control - Tomato', 'type': 'monitoring', 'priority': 'high', 'details': 'Spray pesticide for tomato pests.', 'completed': False},
    {'date': '2025-08-15', 'time': '08:30', 'task': 'Market Visit', 'type': 'market', 'priority': 'medium', 'details': 'Visit local mandi for price check.', 'completed': False},
    {'date': '2025-08-20', 'time': '09:00', 'task': 'Chickpea Sowing', 'type': 'planting', 'priority': 'high', 'details': 'Sow chickpea seeds in Field C.', 'completed': False},
    {'date': '2025-08-28', 'time': '07:30', 'task': 'Equipment Maintenance', 'type': 'maintenance', 'priority': 'low', 'details': 'Check and repair farm equipment.', 'completed': False},
]

def update_farmer_fields(farmer_id, crops, calendarEvents):
    doc_ref = db.collection('farmers').document(farmer_id)
    try:
        doc_ref.update({
            'crops': crops,
            'calendarEvents': calendarEvents,
        })
        print(f"Updated crops and calendarEvents for farmer: {farmer_id}")
    except Exception as e:
        print(f"Error updating farmer {farmer_id}: {e}")

if __name__ == "__main__":
    update_farmer_fields('f001', crops, calendarEvents)
    print("Crops and calendarEvents updated successfully!") 