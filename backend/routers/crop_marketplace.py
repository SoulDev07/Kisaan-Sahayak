from fastapi import APIRouter, HTTPException, Query, Body, Path
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.firebase import db
from datetime import datetime, timedelta
import uuid
from sentence_transformers import SentenceTransformer
import numpy as np

router = APIRouter()

# Initialize embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embedding(text: str) -> List[float]:
    """Generate embedding for text search"""
    return embedding_model.encode(text).tolist()

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between vectors"""
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# Pydantic Models
class CropMarketplaceListing(BaseModel):
    farmer_id: str
    crop_name: str
    variety: str
    quantity: float
    unit: str  # kg, quintal, ton
    price_per_unit: float
    total_price: float
    quality_grade: str
    organic_certified: bool
    harvest_date: str
    location: Dict[str, str]  # district, state, pin_code
    images: List[str]
    description: str
    contact_info: Dict[str, str]
    available_from: str
    available_until: str
    negotiable: bool

class CropOrder(BaseModel):
    buyer_farmer_id: str
    seller_farmer_id: str
    crop_listing_id: str
    quantity_ordered: float
    agreed_price_per_unit: float
    total_amount: float
    delivery_address: Dict[str, str]
    special_instructions: Optional[str] = None

@router.get("/marketplace/crops")
def get_marketplace_crops(
    category: Optional[str] = Query(None, description="Filter by crop category"),
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    organic_only: Optional[bool] = Query(False, description="Show only organic crops"),
    available_only: Optional[bool] = Query(True, description="Show only available crops"),
    sort_by: Optional[str] = Query("created_at", description="Sort by: price, quantity, created_at, harvest_date"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc, desc"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(20, description="Items per page")
):
    """Get all crops available in marketplace with advanced filtering"""
    try:
        listings_ref = db.collection('marketplace_crops')
        
        # Apply filters
        query = listings_ref
        
        if available_only:
            query = query.where('status', '==', 'available')
        
        if organic_only:
            query = query.where('organic_certified', '==', True)
            
        if state:
            query = query.where('location.state', '==', state)
            
        if district:
            query = query.where('location.district', '==', district)
        
        # Get results
        listings = []
        for doc in query.stream():
            listing = doc.to_dict()
            listing['id'] = doc.id
            
            # Apply additional filters
            if category and listing.get('category', '').lower() != category.lower():
                continue
            if min_price and listing.get('price_per_unit', 0) < min_price:
                continue
            if max_price and listing.get('price_per_unit', float('inf')) > max_price:
                continue
                
            listings.append(listing)
        
        # Sort results
        if sort_by == 'price':
            listings.sort(key=lambda x: x.get('price_per_unit', 0), reverse=(sort_order == 'desc'))
        elif sort_by == 'quantity':
            listings.sort(key=lambda x: x.get('quantity', 0), reverse=(sort_order == 'desc'))
        elif sort_by == 'harvest_date':
            listings.sort(key=lambda x: x.get('harvest_date', ''), reverse=(sort_order == 'desc'))
        else:
            listings.sort(key=lambda x: x.get('created_at', ''), reverse=(sort_order == 'desc'))
        
        # Pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_listings = listings[start_idx:end_idx]
        
        return {
            "crops": paginated_listings,
            "total_count": len(listings),
            "page": page,
            "limit": limit,
            "total_pages": (len(listings) + limit - 1) // limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching marketplace crops: {str(e)}")

@router.post("/marketplace/crops")
def add_crop_to_marketplace(listing: CropMarketplaceListing):
    """Add a crop to the marketplace for selling"""
    try:
        # Generate listing ID
        listing_id = str(uuid.uuid4())
        
        # Create listing document
        listing_data = listing.dict()
        listing_data.update({
            'id': listing_id,
            'status': 'available',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'views': 0,
            'inquiries': 0,
            'favorites': 0
        })
        
        # Generate embedding for search
        search_text = f"{listing.crop_name} {listing.variety} {listing.description} {listing.location.get('district', '')} {listing.location.get('state', '')}"
        listing_data['embedding'] = generate_embedding(search_text)
        
        # Add to Firestore
        db.collection('marketplace_crops').document(listing_id).set(listing_data)
        
        # Update farmer's listings
        farmer_ref = db.collection('farmers').document(listing.farmer_id)
        farmer_doc = farmer_ref.get()
        if farmer_doc.exists:
            farmer_data = farmer_doc.to_dict()
            marketplace_listings = farmer_data.get('marketplace_listings', [])
            marketplace_listings.append(listing_id)
            farmer_ref.update({'marketplace_listings': marketplace_listings})
        
        return {
            "message": "Crop added to marketplace successfully",
            "listing_id": listing_id,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding crop to marketplace: {str(e)}")

@router.get("/marketplace/crops/{crop_id}")
def get_marketplace_crop_details(crop_id: str = Path(..., description="Crop listing ID")):
    """Get detailed information about a specific crop listing"""
    try:
        doc_ref = db.collection('marketplace_crops').document(crop_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Crop listing not found")
        
        crop_data = doc.to_dict()
        crop_data['id'] = doc.id
        
        # Increment view count
        doc_ref.update({'views': crop_data.get('views', 0) + 1})
        
        # Get seller information
        seller_ref = db.collection('farmers').document(crop_data['farmer_id'])
        seller_doc = seller_ref.get()
        if seller_doc.exists:
            seller_data = seller_doc.to_dict()
            crop_data['seller_info'] = {
                'name': seller_data.get('profile', {}).get('name'),
                'village': seller_data.get('profile', {}).get('village'),
                'phone': seller_data.get('profile', {}).get('phoneNumber'),
                'rating': seller_data.get('rating', 4.0),
                'total_sales': seller_data.get('total_sales', 0)
            }
        
        return crop_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching crop details: {str(e)}")

@router.put("/marketplace/crops/{crop_id}")
def update_marketplace_crop(crop_id: str = Path(...), updates: Dict[str, Any] = Body(...)):
    """Update crop listing in marketplace"""
    try:
        doc_ref = db.collection('marketplace_crops').document(crop_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Crop listing not found")
        
        # Add update timestamp
        updates['updated_at'] = datetime.now().isoformat()
        
        # Update embedding if search-relevant fields changed
        if any(field in updates for field in ['crop_name', 'variety', 'description', 'location']):
            current_data = doc.to_dict()
            current_data.update(updates)
            search_text = f"{current_data.get('crop_name', '')} {current_data.get('variety', '')} {current_data.get('description', '')} {current_data.get('location', {}).get('district', '')} {current_data.get('location', {}).get('state', '')}"
            updates['embedding'] = generate_embedding(search_text)
        
        doc_ref.update(updates)
        
        return {"message": "Crop listing updated successfully", "status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating crop listing: {str(e)}")

@router.delete("/marketplace/crops/{crop_id}")
def remove_crop_from_marketplace(crop_id: str = Path(...)):
    """Remove crop listing from marketplace"""
    try:
        doc_ref = db.collection('marketplace_crops').document(crop_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Crop listing not found")
        
        crop_data = doc.to_dict()
        farmer_id = crop_data['farmer_id']
        
        # Remove from marketplace
        doc_ref.delete()
        
        # Update farmer's listings
        farmer_ref = db.collection('farmers').document(farmer_id)
        farmer_doc = farmer_ref.get()
        if farmer_doc.exists:
            farmer_data = farmer_doc.to_dict()
            marketplace_listings = farmer_data.get('marketplace_listings', [])
            if crop_id in marketplace_listings:
                marketplace_listings.remove(crop_id)
                farmer_ref.update({'marketplace_listings': marketplace_listings})
        
        return {"message": "Crop listing removed successfully", "status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing crop listing: {str(e)}")

@router.post("/marketplace/crops/{crop_id}/buy")
def buy_crop_from_marketplace(crop_id: str = Path(...), order: CropOrder = Body(...)):
    """Purchase a crop from marketplace"""
    try:
        # Check if crop listing exists and is available
        listing_ref = db.collection('marketplace_crops').document(crop_id)
        listing_doc = listing_ref.get()
        
        if not listing_doc.exists:
            raise HTTPException(status_code=404, detail="Crop listing not found")
        
        listing_data = listing_doc.to_dict()
        if listing_data.get('status') != 'available':
            raise HTTPException(status_code=400, detail="Crop is not available for purchase")
        
        if order.quantity_ordered > listing_data.get('quantity', 0):
            raise HTTPException(status_code=400, detail="Requested quantity exceeds available quantity")
        
        # Create order
        order_id = str(uuid.uuid4())
        order_data = order.dict()
        order_data.update({
            'id': order_id,
            'crop_listing_id': crop_id,
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'payment_status': 'pending'
        })
        
        # Add order to database
        db.collection('crop_orders').document(order_id).set(order_data)
        
        # Update crop quantity
        remaining_quantity = listing_data['quantity'] - order.quantity_ordered
        listing_updates = {
            'quantity': remaining_quantity,
            'updated_at': datetime.now().isoformat()
        }
        
        if remaining_quantity <= 0:
            listing_updates['status'] = 'sold_out'
        
        listing_ref.update(listing_updates)
        
        # Update seller's pending orders
        seller_ref = db.collection('farmers').document(order.seller_farmer_id)
        seller_doc = seller_ref.get()
        if seller_doc.exists:
            seller_data = seller_doc.to_dict()
            pending_orders = seller_data.get('pending_orders', [])
            pending_orders.append(order_id)
            seller_ref.update({'pending_orders': pending_orders})
        
        return {
            "message": "Order placed successfully",
            "order_id": order_id,
            "status": "pending",
            "estimated_delivery": (datetime.now() + timedelta(days=3)).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error placing order: {str(e)}")

@router.get("/marketplace/crops/search")
def search_marketplace_crops(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, description="Number of results to return")
):
    """Search crops in marketplace using semantic similarity"""
    try:
        # Generate query embedding
        query_embedding = generate_embedding(query)
        
        # Get all available crops
        listings_ref = db.collection('marketplace_crops').where('status', '==', 'available')
        
        # Calculate similarities
        results = []
        for doc in listings_ref.stream():
            listing = doc.to_dict()
            listing['id'] = doc.id
            
            if 'embedding' in listing:
                similarity = cosine_similarity(query_embedding, listing['embedding'])
                if similarity > 0.3:  # Threshold for relevance
                    listing['relevance_score'] = similarity
                    results.append(listing)
        
        # Sort by relevance and limit results
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        results = results[:limit]
        
        return {
            "query": query,
            "results": results,
            "total_found": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching crops: {str(e)}")

@router.get("/marketplace/crops/categories")
def get_crop_categories():
    """Get all available crop categories"""
    try:
        # This could be dynamic based on existing listings or predefined
        categories = [
            {"name": "Cereals", "crops": ["Rice", "Wheat", "Maize", "Barley", "Oats"]},
            {"name": "Pulses", "crops": ["Lentil", "Chickpea", "Black Gram", "Green Gram", "Pigeon Pea"]},
            {"name": "Oilseeds", "crops": ["Soybean", "Sunflower", "Mustard", "Groundnut", "Sesame"]},
            {"name": "Vegetables", "crops": ["Tomato", "Potato", "Onion", "Cabbage", "Cauliflower"]},
            {"name": "Fruits", "crops": ["Mango", "Apple", "Banana", "Orange", "Grapes"]},
            {"name": "Spices", "crops": ["Turmeric", "Coriander", "Cumin", "Chili", "Cardamom"]},
            {"name": "Cash Crops", "crops": ["Cotton", "Sugarcane", "Tea", "Coffee", "Tobacco"]}
        ]
        
        return {"categories": categories}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@router.get("/marketplace/farmer/{farmer_id}/listings")
def get_farmer_crop_listings(farmer_id: str = Path(...)):
    """Get all crop listings by a specific farmer"""
    try:
        listings_ref = db.collection('marketplace_crops').where('farmer_id', '==', farmer_id)
        
        listings = []
        for doc in listings_ref.stream():
            listing = doc.to_dict()
            listing['id'] = doc.id
            listings.append(listing)
        
        # Sort by creation date (newest first)
        listings.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return {
            "farmer_id": farmer_id,
            "listings": listings,
            "total_count": len(listings),
            "active_count": len([l for l in listings if l.get('status') == 'available'])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching farmer listings: {str(e)}")

@router.get("/marketplace/orders")
def get_crop_orders(
    farmer_id: Optional[str] = Query(None, description="Filter by farmer ID"),
    status: Optional[str] = Query(None, description="Filter by order status"),
    role: Optional[str] = Query(None, description="buyer or seller")
):
    """Get crop orders with optional filters"""
    try:
        orders_ref = db.collection('crop_orders')
        
        # Apply filters
        query = orders_ref
        if status:
            query = query.where('status', '==', status)
        
        orders = []
        for doc in query.stream():
            order = doc.to_dict()
            order['id'] = doc.id
            
            # Apply farmer_id filter based on role
            if farmer_id:
                if role == 'buyer' and order.get('buyer_farmer_id') != farmer_id:
                    continue
                elif role == 'seller' and order.get('seller_farmer_id') != farmer_id:
                    continue
                elif not role and order.get('buyer_farmer_id') != farmer_id and order.get('seller_farmer_id') != farmer_id:
                    continue
            
            orders.append(order)
        
        # Sort by creation date (newest first)
        orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return {
            "orders": orders,
            "total_count": len(orders)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")

@router.put("/marketplace/orders/{order_id}/status")
def update_crop_order_status(
    order_id: str = Path(...),
    status: str = Body(..., embed=True),
    notes: Optional[str] = Body(None, embed=True)
):
    """Update order status (pending, confirmed, shipped, delivered, cancelled)"""
    try:
        order_ref = db.collection('crop_orders').document(order_id)
        order_doc = order_ref.get()
        
        if not order_doc.exists:
            raise HTTPException(status_code=404, detail="Order not found")
        
        valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        update_data = {
            'status': status,
            'updated_at': datetime.now().isoformat()
        }
        
        if notes:
            update_data['status_notes'] = notes
        
        order_ref.update(update_data)
        
        return {
            "message": f"Order status updated to {status}",
            "order_id": order_id,
            "status": status
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating order status: {str(e)}")

@router.get("/marketplace/analytics/trending")
def get_trending_crops():
    """Get trending crops in marketplace based on views, inquiries, and orders"""
    try:
        # Get all active listings
        listings_ref = db.collection('marketplace_crops').where('status', '==', 'available')
        
        trending_crops = []
        for doc in listings_ref.stream():
            listing = doc.to_dict()
            listing['id'] = doc.id
            
            # Calculate trending score based on engagement
            views = listing.get('views', 0)
            inquiries = listing.get('inquiries', 0)
            favorites = listing.get('favorites', 0)
            
            # Simple trending algorithm
            trending_score = (views * 0.1) + (inquiries * 2) + (favorites * 1.5)
            listing['trending_score'] = trending_score
            
            trending_crops.append(listing)
        
        # Sort by trending score
        trending_crops.sort(key=lambda x: x['trending_score'], reverse=True)
        
        return {
            "trending_crops": trending_crops[:20],  # Top 20 trending
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trending crops: {str(e)}")
