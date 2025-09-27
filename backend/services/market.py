import requests
import os

# Crop name mapping: app name -> API name
CROP_NAME_MAP = {
    "Organic Wheat": "Wheat",
    "Wheat": "Wheat",
    "Tomatoes": "Tomato",
    "Tomato": "Tomato",
    "Onion": "Onion",
    "Fresh Milk": "Milk",
    "Fresh Onions":"Onion",
    "Chickpeas":"Peas(Dry)"
    # Add more mappings as needed
}

# IMPORTANT: You need to get your own API key from data.gov.in and set it as an environment variable.
# This is the endpoint for Variety-wise daily prices of agricultural commodities.
MARKET_API_URL = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24"
# Use the sample key from the documentation if the user's key is not set.
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "579b464db66ec23bdd000001f98db72a1fea4df0757c14b5d10dd835")

def get_market_prices(state: str, commodity: str, district: str = None):
    """
    Fetches variety-wise market prices for a given state, commodity, and optional district.
    Maps commodity names and returns only unique records.
    """
    # Map commodity name
    mapped_commodity = CROP_NAME_MAP.get(commodity.strip(), commodity.strip().capitalize())

    if not DATA_GOV_API_KEY:
        print("Warning: DATA_GOV_API_KEY not set. Returning sample data.")
        return [
            {"market": "Pune", "commodity": "Wheat", "variety": "Lokwan", "modal_price": "2450", "district": "Pune", "state": "Maharashtra", "arrival_date": "2024-05-20"},
            {"market": "Mumbai", "commodity": "Wheat", "variety": "Sihore", "modal_price": "2500", "district": "Mumbai", "state": "Maharashtra", "arrival_date": "2024-05-20"},
            {"market": "Nashik", "commodity": "Wheat", "variety": "Lokwan", "modal_price": "2380", "district": "Nashik", "state": "Maharashtra", "arrival_date": "2024-05-20"},
        ]

    params = {
        "api-key": DATA_GOV_API_KEY,
        "format": "json",
        "offset": "0",
        "limit": "20",
        "filters[State]": state.strip(),
        "filters[Commodity]": mapped_commodity,
    }
    if district:
        params["filters[District]"] = district.strip()

    try:
        response = requests.get(MARKET_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        records = data.get("records", [])
        # Filter for unique records (by market, commodity, variety, arrival_date)
        seen = set()
        unique_records = []
        for rec in records:
            # Support both API and fallback sample keys
            market = rec.get("market") or rec.get("Market")
            commodity = rec.get("commodity") or rec.get("Commodity")
            variety = rec.get("variety") or rec.get("Variety")
            arrival_date = rec.get("arrival_date") or rec.get("Arrival_Date")
            key = (market, commodity, variety, arrival_date)
            if key not in seen:
                seen.add(key)
                unique_records.append(rec)
        return unique_records
    except requests.exceptions.RequestException as e:
        print(f"Error fetching market prices: {e}")
        return {"error": f"Failed to fetch market data: {e}"}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": "An unexpected error occurred"} 