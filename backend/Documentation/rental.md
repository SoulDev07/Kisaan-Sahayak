# Rental Feature

## Overview
The Rental Feature enables farmers to list, search, and book agricultural equipment and machinery. This peer-to-peer rental marketplace allows farmers to monetize their underutilized equipment and helps others access machinery they need without the high cost of purchase. The system uses semantic search to match farmers' needs with available equipment.

## Components

### Router: `rental.py`
Handles HTTP endpoints for equipment rental functionality:
- **POST `/rental`**: Search for rental equipment using semantic search
- **GET `/rental/activity`**: Retrieve a farmer's rental activity (owned and rented items)
- **GET `/rental/featured`**: Get featured rental listings excluding the farmer's own
- **POST `/rental/list`**: List new equipment for rental
- **GET `/rental/bookings`**: Get a farmer's equipment bookings
- **GET `/rental/earnings`**: Retrieve earnings from equipment rentals
- **POST `/rental/book`**: Book equipment for a specific time period

## Technical Details
- Uses semantic search with SentenceTransformer for intelligent equipment matching
- Stores equipment listings, bookings, and earnings in Firebase Firestore
- Implements vector embeddings for equipment descriptions
- Calculates similarity scores to match search queries with available equipment
- Manages the complete rental lifecycle from listing to booking

## Data Structure
The rental system manages several data collections:
- **Rental Listings**: Available equipment with descriptions, prices, and availability
- **My Products**: Equipment owned or rented by a specific farmer
- **My Listings**: Equipment listed for rent by a specific farmer
- **Rental Bookings**: Records of equipment reservations
- **Rental Earnings**: Financial records of rental income

## Prompt Improvement
The rental feature could be enhanced with AI-powered recommendations by:

1. **Equipment Suggestions**: Add prompts to suggest appropriate equipment based on a farmer's crops and calendar.
2. **Pricing Guidance**: Implement AI to recommend optimal rental pricing based on equipment type, condition, and regional demand.
3. **Seasonal Recommendations**: Provide timely equipment suggestions based on the agricultural season and regional farming practices.
4. **Usage Instructions**: Generate equipment usage instructions in local languages for farmers unfamiliar with specific machinery.
5. **Maintenance Tips**: Include prompts for AI-generated maintenance advice for both equipment owners and renters.

## Usage Example
```python
# Example of using the Rental API
import requests
import json

# Search for equipment
search_url = "https://api.kisankiawaaz.com/rental"
search_data = {
    "query": "tractor with cultivator attachment",
    "farmerId": "farmer123"
}
search_results = requests.post(search_url, json=search_data).json()
print(f"Found {len(search_results['matches'])} matching equipment items")

# List equipment for rent
listing_url = "https://api.kisankiawaaz.com/rental/list"
equipment_data = {
    "name": "Mahindra Tractor 575",
    "description": "45 HP tractor with cultivator, good condition",
    "price_per_day": 1500,
    "location": {"village": "Baramati", "district": "Pune"},
    "owner": {
        "farmerId": "farmer123",
        "name": "Raj Kumar",
        "phoneNumber": "9876543210"
    },
    "available": True,
    "type": "tractor"
}
response = requests.post(listing_url, json=equipment_data)
print("Equipment listed:", response.json()["message"])

# Book equipment
booking_url = "https://api.kisankiawaaz.com/rental/book"
booking_data = {
    "equipmentId": "farmer456_1234",
    "farmerId": "farmer123",
    "startDate": "2023-06-15",
    "endDate": "2023-06-17",
    "notes": "Need for sowing season"
}
booking_response = requests.post(booking_url, json=booking_data)
print("Booking status:", booking_response.json()["message"])
``` 