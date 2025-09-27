# Farmer Feature

## Overview
The Farmer Feature provides comprehensive farmer profile management capabilities for the application. It allows for creating, retrieving, updating, and deleting farmer profiles and related data such as livestock, crops, calendar events, market listings, chat history, and documents. This feature serves as the central data management system for all farmer-related information.

## Components

### Router: `farmer.py`
Handles HTTP endpoints for farmer profile management:
- **GET endpoints**: Retrieve farmer data and specific sections (profile, livestock, crops, etc.)
- **POST endpoints**: Create new farmers and add items to their collections
- **PUT endpoints**: Update existing farmer data by ID
- **DELETE endpoints**: Remove items from farmer collections

### Special Endpoints
- **GET `/farmer/{farmer_id}/calendar/ai-analysis`**: Provides AI-powered analysis of a farmer's calendar events
- **POST `/farmer/{farmer_id}/space-suggestions`**: Analyzes farm space images and provides improvement suggestions

## Data Structure
The farmer data model includes:
- **Profile**: Basic information (name, village, phone, language, etc.)
- **Livestock**: Animals owned by the farmer
- **Crops**: Crops being grown
- **Calendar Events**: Scheduled farming activities
- **Market Listings**: Items the farmer is selling
- **Chat History**: Record of conversations
- **Documents**: Important documents and records
- **Vectors**: Embeddings for semantic search

## Technical Details
- Uses Firebase Firestore for data storage
- Integrates with Google Gemini for AI-powered insights
- Implements vector embeddings for semantic search
- Supports image upload and analysis for farm space optimization
- Maintains relationships between different data collections

## Prompt Improvement
The AI analysis prompts in the farmer feature could be enhanced by:

1. **Calendar Analysis**: Improve the prompt to provide more seasonally relevant agricultural insights based on scheduled events.
2. **Space Suggestions**: Enhance the image analysis prompt to better understand Indian farming layouts and provide more culturally appropriate space optimization recommendations.
3. **Regional Context**: Add more regional farming knowledge to better interpret calendar events and farm layouts specific to different Indian states.
4. **Crop Rotation Insights**: Include suggestions for crop rotation and companion planting based on the farmer's current crops and calendar.
5. **Weather Integration**: Correlate calendar events with seasonal weather patterns for better planning advice.

## Usage Example
```python
# Example of using the Farmer API
import requests
import json

# Get farmer profile
farmer_id = "farmer123"
profile_url = f"https://api.kisankiawaaz.com/farmer/{farmer_id}/profile"
profile = requests.get(profile_url).json()
print(f"Farmer: {profile['name']} from {profile['village']}")

# Add a new crop
crop_data = {
    "cropId": "crop123",
    "name": "Wheat",
    "variety": "HD-2967",
    "plantingDate": "2023-11-15",
    "harvestDate": "2024-04-10",
    "area": 2.5,
    "status": "growing"
}
crop_url = f"https://api.kisankiawaaz.com/farmer/{farmer_id}/crops"
response = requests.post(crop_url, json=crop_data)
print("Crop added:", response.json()["message"])

# Get AI analysis of calendar events
analysis_url = f"https://api.kisankiawaaz.com/farmer/{farmer_id}/calendar/ai-analysis"
analysis = requests.get(analysis_url).json()
print("Calendar Analysis:", analysis["analysis"])
``` 