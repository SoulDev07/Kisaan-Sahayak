# Soil Moisture Feature

## Overview
The Soil Moisture feature provides farmers with access to soil moisture data for their region and AI-generated recommendations for optimal farming practices based on current soil conditions. It leverages India's open data API to fetch real soil moisture measurements and uses Gemini AI to generate contextual agricultural advice.

## Components

### Router: `soil_moisture.py`
Handles HTTP endpoints for soil moisture data and AI recommendations:
- **GET `/soil-moisture`**: Retrieves the latest soil moisture data from Firestore.
- **POST `/soil-moisture/ai-suggestion`**: Provides AI-generated recommendations based on soil moisture data for a specific state and district.

### Service: `soil_moisture.py`
Core functionality for fetching and processing soil moisture data:
- **get_soil_moisture_data()**: Fetches soil moisture data from India's government data API based on location parameters.

## Technical Details
- Integrates with India's Open Government Data API (data.gov.in)
- Uses pandas for data processing and aggregation
- Implements timestamp handling for proper data serialization
- Uses Google Gemini 2.5 Flash for generating agricultural recommendations
- Caches latest data in Firestore for improved performance

## Data Sources
- Primary data source: India's Open Government Data API (resource ID: 4554a3c8-74e3-4f93-8727-8fd92161e345)
- Data includes state, district, soil moisture readings, and date information

## Prompt Improvement
The AI suggestion prompt has been enhanced to:

1. **Regional Specificity**: Focus on crops and farming practices specific to Indian regions.
2. **Resource Awareness**: Prioritize recommendations suitable for small-scale farmers with limited resources.
3. **Cultural Context**: Incorporate culturally appropriate suggestions relevant to Indian farming communities.
4. **Local Language**: Include Hindi/local terms where appropriate for better farmer understanding.
5. **Season Awareness**: Consider the current agricultural season in India for more timely advice.
6. **Specific Crop Recommendations**: Suggest crop varieties suited to the current soil moisture conditions.
7. **Mitigation Strategies**: Provide affordable solutions for problematic moisture levels.

## Usage Example
```python
# Example of using the Soil Moisture API
import requests
import json

# Get soil moisture data
moisture_url = "https://api.kisankiawaaz.com/soil-moisture"
response = requests.get(moisture_url)
moisture_data = response.json()
print("Current soil moisture data:", moisture_data)

# Get AI recommendations for a specific location
suggestion_url = "https://api.kisankiawaaz.com/soil-moisture/ai-suggestion"
payload = {
    "state": "Maharashtra",
    "district": "Pune"
}
response = requests.post(suggestion_url, json=payload)
suggestions = response.json()["suggestions"]

print("AI recommendations:")
for idx, suggestion in enumerate(suggestions, 1):
    print(f"{idx}. {suggestion}")
``` 