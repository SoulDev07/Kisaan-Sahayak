import firebase_admin
from firebase_admin import credentials, firestore
from sentence_transformers import SentenceTransformer
import datetime
import random

# Initialize embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')
def vectorize(text):
    return model.encode(text).tolist()

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

# --- MOCK RENTAL LISTINGS DATA ---
owners = [
    {'farmerId': 'f001', 'name': 'Vinayak Bhatia', 'village': 'Shirur, Maharashtra'},
    {'farmerId': 'f002', 'name': 'Asha Patil', 'village': 'Baramati, Maharashtra'},
    {'farmerId': 'f003', 'name': 'Ramesh Pawar', 'village': 'Satara, Maharashtra'},
]

locations = [
    {'lat': 18.8237, 'lng': 74.3732, 'village': 'Shirur'},
    {'lat': 18.1516, 'lng': 74.5777, 'village': 'Baramati'},
    {'lat': 17.6805, 'lng': 74.0183, 'village': 'Satara'},
]

products_for_rent = [
    {
        'name': 'Tractor (Mahindra 575 DI)',
        'description': 'Powerful 45 HP tractor, ideal for ploughing and tilling. Well maintained.',
        'price_per_day': 1200,
        'location': locations[0],
        'owner': owners[0],
        'type': 'rent',
        'available': True,
        'image': 'https://www.mahindratractor.com/images/575di.jpg',
    },
    {
        'name': 'Rotavator',
        'description': '6 feet rotavator for soil preparation. Heavy duty.',
        'price_per_day': 500,
        'location': locations[1],
        'owner': owners[1],
        'type': 'rent',
        'available': True,
        'image': 'https://5.imimg.com/data5/SELLER/Default/2022/7/UV/GL/GL/1517266/rotavator-500x500.jpg',
    },
    {
        'name': 'Sprayer Machine',
        'description': 'Battery operated sprayer, 16L tank. Suitable for pesticides.',
        'price_per_day': 150,
        'location': locations[2],
        'owner': owners[2],
        'type': 'rent',
        'available': True,
        'image': 'https://www.kisanestore.com/image/cache/catalog/Products/Sprayer/knapsack-battery-sprayer-16l-800x800.jpg',
    },
]

products_for_sale = [
    {
        'name': 'Used Drip Irrigation Kit',
        'description': 'Complete kit for 1 acre. Good condition, all pipes and emitters included.',
        'price': 3500,
        'location': locations[0],
        'owner': owners[0],
        'type': 'sale',
        'available': True,
        'image': 'https://www.indiamart.com/proddetail/drip-irrigation-kit-12345678912.html',
    },
    {
        'name': 'Organic Vermicompost (50kg)',
        'description': 'High quality, nutrient-rich compost. Suitable for all crops.',
        'price': 600,
        'location': locations[1],
        'owner': owners[1],
        'type': 'sale',
        'available': True,
        'image': 'https://www.bigbasket.com/media/uploads/p/l/40075597_2-vermicompost-organic-manure.jpg',
    },
    {
        'name': 'Mini Power Tiller',
        'description': '3 HP mini tiller, easy to operate. Used for 2 seasons only.',
        'price': 9000,
        'location': locations[2],
        'owner': owners[2],
        'type': 'sale',
        'available': True,
        'image': 'https://www.indiamart.com/proddetail/mini-power-tiller-1234567890.html',
    },
]

# Simulate "my products" and "my listings" for farmer f001
my_products = [
    {
        'name': 'Old Plough',
        'description': 'Traditional iron plough, still usable.',
        'price': 800,
        'location': locations[0],
        'owner': owners[0],
        'type': 'sale',
        'available': False,
        'image': '',
        'sold_to': 'f002',
        'sold_on': '2024-06-10',
    },
    {
        'name': 'Tractor (Mahindra 575 DI)',
        'description': 'Powerful 45 HP tractor, ideal for ploughing and tilling. Well maintained.',
        'price_per_day': 1200,
        'location': locations[0],
        'owner': owners[0],
        'type': 'rent',
        'available': True,
        'image': 'https://www.mahindratractor.com/images/575di.jpg',
    },
]

my_listings = [
    {
        'name': 'Tractor (Mahindra 575 DI)',
        'description': 'Powerful 45 HP tractor, ideal for ploughing and tilling. Well maintained.',
        'price_per_day': 1200,
        'location': locations[0],
        'owner': owners[0],
        'type': 'rent',
        'available': True,
        'image': 'https://www.mahindratractor.com/images/575di.jpg',
    },
    {
        'name': 'Used Drip Irrigation Kit',
        'description': 'Complete kit for 1 acre. Good condition, all pipes and emitters included.',
        'price': 3500,
        'location': locations[0],
        'owner': owners[0],
        'type': 'sale',
        'available': True,
        'image': 'https://www.indiamart.com/proddetail/drip-irrigation-kit-12345678912.html',
    },
]

def build_embedding_text(listing):
    # Concatenate fields for embedding
    fields = [listing.get('name', ''), listing.get('description', ''), listing.get('owner', {}).get('name', ''), listing.get('location', {}).get('village', ''), str(listing.get('price', listing.get('price_per_day', ''))), listing.get('type', '')]
    return ' '.join([str(f) for f in fields if f])

def upload_listing(listing, collection='rental_listings'):
    # Add embedding
    listing['embedding'] = vectorize(build_embedding_text(listing))
    # Add timestamp
    listing['createdAt'] = datetime.datetime.now().isoformat()
    # Generate a random id
    doc_id = f"{listing['owner']['farmerId']}_{random.randint(1000,9999)}"
    db.collection(collection).document(doc_id).set(listing)
    print(f"Uploaded listing: {listing['name']} ({listing['type']}) by {listing['owner']['name']}")

if __name__ == "__main__":
    for l in products_for_rent + products_for_sale:
        upload_listing(l)
    # Simulate my products and my listings for f001
    for l in my_products:
        upload_listing(l, collection='my_products')
    for l in my_listings:
        upload_listing(l, collection='my_listings')
    print("All rental and sale listings uploaded!") 