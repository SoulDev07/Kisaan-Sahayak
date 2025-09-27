import os
import firebase_admin
from firebase_admin import credentials, firestore
import requests
from sentence_transformers import SentenceTransformer
import time

# --- CONFIG ---
FIREBASE_KEY_PATH = 'serviceAccountKey.json'  # Path to your Firebase service account key
DISTRICT = 'Buldhana'
STATE = 'Maharashtra'

COMMODITIES = [
    'Toria', 'Tube Flower', 'Tube Rose(Double)', 'Tube Rose(Loose)', 'Tube Rose(Single)', 'Turmeric', 'Turmeric (raw)', 'Turnip', 'Walnut', 'Water Melon', 'Wheat', 'Wheat Atta', 'White Muesli', 'White Peas', 'White Pumpkin', 'Wood', 'Wool', 'Yam', 'Yam (Ratalu)', 'basil', 'Chilly Capsicum', 'Chow Chow', 'Chrysanthemum', 'Chrysanthemum(Loose)', 'Cinamon(Dalchini)', 'Cloves', 'Cluster beans', 'Coca', 'Cock', 'Cocoa', 'Coconut', 'Coconut Oil', 'Coconut Seed', 'Coffee', 'Colacasia', 'Copra', 'Coriander(Leaves)', 'Corriander seed', 'Cotton', 'Cotton Seed',
    'Raddish', 'Ragi (Finger Millet)', 'Raibel', 'Rajgir', 'Ram', 'Rat Tail Radish (Mogari)', 'Ratanjot', 'Raya', 'Red Gram', 'Resinwood', 'Riccbcan', 'Rice', 'Ridgeguard(Tori)', 'Rose(Local)', 'Rose(Loose)', 'Rose(Tata)', 'Round gourd', 'Rubber', 'Sabu Dan', 'Safflower',
    'Daila(Chandni)', 'Dal (Avare)', 'Dalda', 'Delha', 'Dhaincha', 'Drumstick', 'Dry Chillies', 'Dry Fodder', 'Dry Grapes', 'Duck', 'Duster Beans', 'Egg', 'Egyptian Clover(Barseem)', 'Elephant Yam (Suran)', 'Field Pea', 'Fig(Anjura/Anjeer)', 'Firewood', 'Fish', 'Flower Broom', 'Foxtail Millet(Navane)'
]

# --- EMBEDDING MODEL ---
model = SentenceTransformer('all-MiniLM-L6-v2')
def vectorize(text):
    return model.encode(text).tolist()

# --- FIREBASE INIT ---
cred = credentials.Certificate(FIREBASE_KEY_PATH)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

# --- MARKET API LOGIC (from market.py) ---
MARKET_API_URL = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24"
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "579b464db66ec23bdd000001f98db72a1fea4df0757c14b5d10dd835")
CROP_NAME_MAP = {
    "Organic Wheat": "Wheat",
    "Wheat": "Wheat",
    "Tomatoes": "Tomato",
    "Tomato": "Tomato",
    "Onion": "Onion",
    "Fresh Milk": "Milk",
    "Fresh Onions":"Onion",
    "Chickpeas":"Peas(Dry)"
}
def fetch_market_prices(state, commodity):
    mapped_commodity = CROP_NAME_MAP.get(commodity.strip(), commodity.strip().capitalize())
    params = {
        "api-key": DATA_GOV_API_KEY,
        "format": "json",
        "offset": "0",
        "limit": "20",
        "filters[State]": state.strip(),
        "filters[Commodity]": mapped_commodity,
    }
    try:
        print(f"Fetching: {params}")  # DEBUG
        response = requests.get(MARKET_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        records = data.get("records", [])
        print(f"Commodity: {commodity}, Records: {len(records)}")  # DEBUG
        # Filter for unique records (by market, commodity, variety, arrival_date)
        seen = set()
        unique_records = []
        for rec in records:
            market = rec.get("market") or rec.get("Market")
            commodity = rec.get("commodity") or rec.get("Commodity")
            variety = rec.get("variety") or rec.get("Variety")
            arrival_date = rec.get("arrival_date") or rec.get("Arrival_Date")
            key = (market, commodity, variety, arrival_date)
            if key not in seen:
                seen.add(key)
                unique_records.append(rec)
        return unique_records
    except Exception as e:
        print(f"Error fetching market prices for {commodity}: {e}")
        return []

def get_all_market_data():
    all_data = []
    for commodity in COMMODITIES:
        data = fetch_market_prices(STATE, commodity)
        if data:
            all_data.extend(data)
        time.sleep(0.2)  # Be nice to the API
    return all_data

# --- SOIL MOISTURE API LOGIC (from soil_moisture.py) ---
SOIL_API_URL = "https://api.data.gov.in/resource/4554a3c8-74e3-4f93-8727-8fd92161e345"
SOIL_API_KEY = DATA_GOV_API_KEY

def fetch_soil_moisture(state, district=None):
    params = {
        "api-key": SOIL_API_KEY,
        "format": "json",
        "offset": "0",
        "limit": "1000",
        "filters[State]": state.strip(),
    }
    if district:
        params["filters[District]"] = district.strip()
    try:
        response = requests.get(SOIL_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        records = data.get("records", [])
        # Get latest by date
        if not records:
            return []
        # Sort by 'Date' descending
        records = [r for r in records if 'Date' in r]
        records.sort(key=lambda x: x['Date'], reverse=True)
        # Group by State, District, take first (latest)
        seen = set()
        latest = []
        for r in records:
            key = (r.get('State'), r.get('District'))
            if key not in seen:
                seen.add(key)
                latest.append(r)
        return latest
    except Exception as e:
        print(f"Error fetching soil moisture: {e}")
        return []

# --- WEATHER API LOGIC (from weather.py) ---
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '0a2d0746df030311d5eeed1aea9faa05')
BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct'

def geocode_city(city, state=None, country='IN'):
    q = city
    if state:
        q += f",{state}"
    q += f",{country}"
    params = {'q': q, 'limit': 1, 'appid': OPENWEATHER_API_KEY}
    resp = requests.get(GEOCODING_URL, params=params)
    resp.raise_for_status()
    data = resp.json()
    if data:
        return data[0]['lat'], data[0]['lon']
    raise Exception(f"Could not geocode {city}")

def fetch_weather(city, state=None):
    try:
        lat, lon = geocode_city(city, state)
        params = {'lat': lat, 'lon': lon, 'appid': OPENWEATHER_API_KEY, 'units': 'metric'}
        resp = requests.get(BASE_URL, params=params)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return {}

# --- MAIN LOGIC ---
def main():
    print("Fetching market data...")
    market_data = get_all_market_data()
    print(f"Fetched {len(market_data)} market records.")
    print("Fetching soil moisture data...")
    soil_data = fetch_soil_moisture(STATE, DISTRICT)
    print(f"Fetched {len(soil_data)} soil records.")
    print("Fetching weather data...")
    weather_data = fetch_weather(DISTRICT, STATE)
    print("Fetched weather data.")

    # --- EMBEDDINGS ---
    market_text = str(market_data)
    soil_text = str(soil_data)
    weather_text = str(weather_data)
    market_embedding = vectorize(market_text)
    soil_embedding = vectorize(soil_text)
    weather_embedding = vectorize(weather_text)

    # --- UPLOAD TO FIRESTORE ---
    print("Uploading to Firestore...")
    db.collection('market_data').document('latest').set({
        'district': DISTRICT,
        'state': STATE,
        'commodities': COMMODITIES,
        'data': market_data,
        'embedding': market_embedding,
        'updatedAt': firestore.SERVER_TIMESTAMP
    })
    db.collection('soil_data').document('latest').set({
        'district': DISTRICT,
        'state': STATE,
        'data': soil_data,
        'embedding': soil_embedding,
        'updatedAt': firestore.SERVER_TIMESTAMP
    })
    db.collection('weather_data').document('latest').set({
        'district': DISTRICT,
        'state': STATE,
        'data': weather_data,
        'embedding': weather_embedding,
        'updatedAt': firestore.SERVER_TIMESTAMP
    })
    print("All data uploaded successfully!")

if __name__ == "__main__":
    main() 