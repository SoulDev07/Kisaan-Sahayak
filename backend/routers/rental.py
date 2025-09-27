from fastapi import APIRouter, HTTPException, Query, Body, Path
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.firebase import db
from sentence_transformers import SentenceTransformer
import numpy as np
from uuid import uuid4
from datetime import datetime, timedelta
import random

router = APIRouter()

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def vectorize(text):
    return embedding_model.encode(text).tolist()

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def build_embedding_text(listing):
    fields = [
        listing.get('name', ''), 
        listing.get('description', ''), 
        listing.get('owner', {}).get('name', ''), 
        listing.get('location', {}).get('village', ''), 
        str(listing.get('price', listing.get('price_per_day', ''))), 
        listing.get('type', ''),
        listing.get('category', '')
    ]
    return ' '.join([str(f) for f in fields if f])

# Pydantic Models
class RentalQuery(BaseModel):
    query: str
    farmerId: str

class RentalItem(BaseModel):
    name: str
    description: str
    category: str
    type: str
    owner: Dict[str, str]
    location: Dict[str, str]
    price_per_day: float
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    images: List[str]
    availability_start: str
    availability_end: str
    min_rental_days: int = 1
    max_rental_days: int = 30
    condition: str = "good"
    year_manufactured: Optional[int] = None
    specifications: Dict[str, Any] = {}

class BookingRequest(BaseModel):
    equipmentId: str
    farmerId: str
    startDate: str
    endDate: str
    notes: Optional[str] = ""
    contact_info: Dict[str, str]

class ReviewModel(BaseModel):
    farmerId: str
    rating: int
    comment: str
    
# Existing endpoints
@router.post("/rental")
def rental_search(body: RentalQuery):
    try:
        # 1. Get all available listings
        listings_ref = db.collection('rental_listings')
        listings = [doc.to_dict() for doc in listings_ref.stream() if doc.to_dict().get('available', True)]
        # 2. Get my products (bought/sold)
        my_products_ref = db.collection('my_products')
        my_products = [doc.to_dict() for doc in my_products_ref.stream() if doc.to_dict().get('owner', {}).get('farmerId') == body.farmerId or doc.to_dict().get('sold_to') == body.farmerId]
        # 3. Get my active listings
        my_listings_ref = db.collection('my_listings')
        my_listings = [doc.to_dict() for doc in my_listings_ref.stream() if doc.to_dict().get('owner', {}).get('farmerId') == body.farmerId]
        # 4. Semantic search on listings
        query_vec = vectorize(body.query)
        scored = []
        for l in listings:
            emb = l.get('embedding')
            if emb:
                sim = cosine_similarity(query_vec, emb)
                scored.append((sim, l))
        scored.sort(reverse=True, key=lambda x: x[0])
        matches = [l for sim, l in scored[:10] if sim > 0.5]  # Top 10, sim threshold
        return {
            'matches': matches,
            'myProducts': my_products,
            'myListings': my_listings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/activity")
def get_rental_activity(farmerId: str = Query(...)):
    """
    Returns the farmer's own bought/sold products and active listings.
    """
    try:
        my_products_ref = db.collection('my_products')
        my_products = [doc.to_dict() for doc in my_products_ref.stream() if doc.to_dict().get('owner', {}).get('farmerId') == farmerId or doc.to_dict().get('sold_to') == farmerId]
        my_listings_ref = db.collection('my_listings')
        my_listings = [doc.to_dict() for doc in my_listings_ref.stream() if doc.to_dict().get('owner', {}).get('farmerId') == farmerId]
        print(f"[DEBUG] /rental/activity for farmerId={farmerId}")
        print(f"  my_products count: {len(my_products)}; names: {[p.get('name') for p in my_products]}")
        print(f"  my_listings count: {len(my_listings)}; names: {[l.get('name') for l in my_listings]}")
        return {
            "myProducts": my_products,
            "myListings": my_listings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/featured")
def get_rental_featured(farmerId: str = Query(...)):
    """
    Returns all available rental listings except the farmer's own.
    """
    try:
        listings_ref = db.collection('rental_listings')
        listings = [
            doc.to_dict()
            for doc in listings_ref.stream()
            if doc.to_dict().get('available', True) and doc.to_dict().get('owner', {}).get('farmerId') != farmerId
        ]
        print(f"[DEBUG] /rental/featured for farmerId={farmerId}")
        print(f"  featured count: {len(listings)}; names: {[l.get('name') for l in listings]}")
        return {"featured": listings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/list")
def list_equipment(equipment: dict = Body(...)):
    """
    Add a new equipment listing to 'rental_listings'.
    """
    try:
        # Add embedding if not present
        if 'embedding' not in equipment:
            equipment['embedding'] = vectorize(build_embedding_text(equipment))
        equipment['createdAt'] = datetime.now().isoformat()
        equipment['available'] = True
        equipment['views'] = 0
        equipment['bookings_count'] = 0
        doc_id = f"{equipment.get('owner', {}).get('farmerId', 'unknown')}_{random.randint(1000,9999)}"
        db.collection('rental_listings').document(doc_id).set(equipment)
        return {"message": "Equipment listed successfully!", "listing_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/bookings")
def get_rental_bookings(farmerId: str = Query(...)):
    """
    Returns bookings for the given farmer.
    """
    try:
        bookings_ref = db.collection('rental_bookings')
        bookings = [doc.to_dict() for doc in bookings_ref.stream() if doc.to_dict().get('farmerId') == farmerId]
        return {"bookings": bookings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/earnings")
def get_rental_earnings(farmerId: str = Query(...)):
    """
    Returns earnings summary for the given farmer.
    """
    try:
        earnings_ref = db.collection('rental_earnings')
        earnings = [doc.to_dict() for doc in earnings_ref.stream() if doc.to_dict().get('farmerId') == farmerId]
        return {"earnings": earnings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/book")
def book_equipment(body: dict = Body(...)):
    """
    Book a rental equipment. Expects: equipmentId, farmerId, startDate, endDate, notes (optional)
    """
    try:
        equipment_id = body.get('equipmentId')
        farmer_id = body.get('farmerId')
        start_date = body.get('startDate')
        end_date = body.get('endDate')
        notes = body.get('notes', '')
        if not all([equipment_id, farmer_id, start_date, end_date]):
            raise HTTPException(status_code=400, detail="Missing required fields.")
        # Check equipment exists and is available
        equip_ref = db.collection('rental_listings').document(equipment_id)
        equip_doc = equip_ref.get()
        if not equip_doc.exists:
            raise HTTPException(status_code=404, detail="Equipment not found.")
        equip = equip_doc.to_dict()
        if not equip.get('available', True):
            raise HTTPException(status_code=400, detail="Equipment not available.")
        # Create booking
        booking_id = str(uuid4())
        booking = {
            'id': booking_id,
            'equipmentId': equipment_id,
            'equipmentName': equip.get('name'),
            'farmerId': farmer_id,
            'startDate': start_date,
            'endDate': end_date,
            'notes': notes,
            'status': 'confirmed',
            'price': equip.get('price_per_day'),
            'createdAt': datetime.now().isoformat()
        }
        db.collection('rental_bookings').document(booking_id).set(booking)
        return { 'message': 'Booking successful!', 'bookingId': booking_id }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# New comprehensive endpoints
@router.get("/items")
def get_all_rental_items(
    category: Optional[str] = Query(None, description="Filter by category"),
    location: Optional[str] = Query(None, description="Filter by location"),
    min_price: Optional[float] = Query(None, description="Minimum price per day"),
    max_price: Optional[float] = Query(None, description="Maximum price per day"),
    available_only: bool = Query(True, description="Show only available items"),
    sort_by: str = Query("created_at", description="Sort by: price, rating, created_at"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(20, description="Items per page")
):
    """Get all available rental items with pagination and filters"""
    try:
        listings_ref = db.collection('rental_listings')
        
        # Apply basic filters
        query = listings_ref
        if available_only:
            query = query.where('available', '==', True)
        
        # Get all items and apply additional filters
        items = []
        for doc in query.stream():
            item = doc.to_dict()
            item['id'] = doc.id
            
            # Apply filters
            if category and item.get('category', '').lower() != category.lower():
                continue
            if location and location.lower() not in item.get('location', {}).get('village', '').lower():
                continue
            if min_price and item.get('price_per_day', 0) < min_price:
                continue
            if max_price and item.get('price_per_day', float('inf')) > max_price:
                continue
                
            items.append(item)
        
        # Sort items
        if sort_by == 'price':
            items.sort(key=lambda x: x.get('price_per_day', 0))
        elif sort_by == 'rating':
            items.sort(key=lambda x: x.get('average_rating', 0), reverse=True)
        else:
            items.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
        
        # Pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_items = items[start_idx:end_idx]
        
        return {
            "items": paginated_items,
            "total_count": len(items),
            "page": page,
            "limit": limit,
            "total_pages": (len(items) + limit - 1) // limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching rental items: {str(e)}")

@router.get("/items/{item_id}")
def get_rental_item_details(item_id: str = Path(...)):
    """Get detailed information about a specific rental item"""
    try:
        doc_ref = db.collection('rental_listings').document(item_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Rental item not found")
        
        item_data = doc.to_dict()
        item_data['id'] = doc.id
        
        # Increment view count
        doc_ref.update({'views': item_data.get('views', 0) + 1})
        
        # Get reviews
        reviews_ref = db.collection('rental_reviews').where('item_id', '==', item_id)
        reviews = [doc.to_dict() for doc in reviews_ref.stream()]
        item_data['reviews'] = reviews
        item_data['reviews_count'] = len(reviews)
        
        if reviews:
            avg_rating = sum(r.get('rating', 0) for r in reviews) / len(reviews)
            item_data['average_rating'] = round(avg_rating, 1)
        
        return item_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching item details: {str(e)}")

@router.put("/items/{item_id}")
def update_rental_item(item_id: str = Path(...), updates: Dict[str, Any] = Body(...)):
    """Update rental item details"""
    try:
        doc_ref = db.collection('rental_listings').document(item_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Rental item not found")
        
        # Update timestamp
        updates['updatedAt'] = datetime.now().isoformat()
        
        # Update embedding if relevant fields changed
        if any(field in updates for field in ['name', 'description', 'category', 'type']):
            current_data = doc.to_dict()
            current_data.update(updates)
            updates['embedding'] = vectorize(build_embedding_text(current_data))
        
        doc_ref.update(updates)
        
        return {"message": "Rental item updated successfully", "status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating rental item: {str(e)}")

@router.delete("/items/{item_id}")
def delete_rental_item(item_id: str = Path(...)):
    """Delete rental item listing"""
    try:
        doc_ref = db.collection('rental_listings').document(item_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Rental item not found")
        
        # Check for active bookings
        bookings_ref = db.collection('rental_bookings').where('equipmentId', '==', item_id).where('status', 'in', ['confirmed', 'in-use'])
        active_bookings = list(bookings_ref.stream())
        
        if active_bookings:
            raise HTTPException(status_code=400, detail="Cannot delete item with active bookings")
        
        doc_ref.delete()
        
        return {"message": "Rental item deleted successfully", "status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting rental item: {str(e)}")

@router.get("/items/{item_id}/availability")
def check_item_availability(
    item_id: str = Path(...),
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)")
):
    """Check availability of rental item for specific dates"""
    try:
        # Check if item exists
        item_ref = db.collection('rental_listings').document(item_id)
        item_doc = item_ref.get()
        
        if not item_doc.exists:
            raise HTTPException(status_code=404, detail="Rental item not found")
        
        item_data = item_doc.to_dict()
        
        # Check existing bookings for date conflicts
        bookings_ref = db.collection('rental_bookings').where('equipmentId', '==', item_id)
        conflicting_bookings = []
        
        for booking_doc in bookings_ref.stream():
            booking = booking_doc.to_dict()
            if booking.get('status') in ['confirmed', 'in-use']:
                booking_start = booking.get('startDate')
                booking_end = booking.get('endDate')
                
                # Check for date overlap
                if booking_start <= end_date and booking_end >= start_date:
                    conflicting_bookings.append({
                        'booking_id': booking.get('id'),
                        'start_date': booking_start,
                        'end_date': booking_end
                    })
        
        is_available = len(conflicting_bookings) == 0 and item_data.get('available', True)
        
        return {
            "available": is_available,
            "conflicting_bookings": conflicting_bookings,
            "item_status": item_data.get('available', True)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking availability: {str(e)}")

@router.get("/items/{item_id}/reviews")
def get_item_reviews(item_id: str = Path(...)):
    """Get reviews for a rental item"""
    try:
        reviews_ref = db.collection('rental_reviews').where('item_id', '==', item_id)
        
        reviews = []
        for doc in reviews_ref.stream():
            review = doc.to_dict()
            review['id'] = doc.id
            reviews.append(review)
        
        # Sort by creation date (newest first)
        reviews.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        # Calculate average rating
        if reviews:
            avg_rating = sum(r.get('rating', 0) for r in reviews) / len(reviews)
            rating_distribution = {i: len([r for r in reviews if r.get('rating') == i]) for i in range(1, 6)}
        else:
            avg_rating = 0
            rating_distribution = {i: 0 for i in range(1, 6)}
        
        return {
            "reviews": reviews,
            "total_reviews": len(reviews),
            "average_rating": round(avg_rating, 1),
            "rating_distribution": rating_distribution
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reviews: {str(e)}")

@router.post("/items/{item_id}/reviews")
def add_item_review(item_id: str = Path(...), review: ReviewModel = Body(...)):
    """Add review for a rental item"""
    try:
        # Check if item exists
        item_ref = db.collection('rental_listings').document(item_id)
        item_doc = item_ref.get()
        
        if not item_doc.exists:
            raise HTTPException(status_code=404, detail="Rental item not found")
        
        # Check if user has rented this item
        bookings_ref = db.collection('rental_bookings').where('equipmentId', '==', item_id).where('farmerId', '==', review.farmerId).where('status', '==', 'completed')
        user_bookings = list(bookings_ref.stream())
        
        if not user_bookings:
            raise HTTPException(status_code=400, detail="You can only review items you have rented")
        
        # Check if user already reviewed this item
        existing_review_ref = db.collection('rental_reviews').where('item_id', '==', item_id).where('farmerId', '==', review.farmerId)
        existing_reviews = list(existing_review_ref.stream())
        
        if existing_reviews:
            raise HTTPException(status_code=400, detail="You have already reviewed this item")
        
        # Create review
        review_id = str(uuid4())
        review_data = review.dict()
        review_data.update({
            'id': review_id,
            'item_id': item_id,
            'created_at': datetime.now().isoformat()
        })
        
        db.collection('rental_reviews').document(review_id).set(review_data)
        
        # Update item's average rating
        all_reviews_ref = db.collection('rental_reviews').where('item_id', '==', item_id)
        all_reviews = [doc.to_dict() for doc in all_reviews_ref.stream()]
        avg_rating = sum(r.get('rating', 0) for r in all_reviews) / len(all_reviews)
        
        item_ref.update({
            'average_rating': round(avg_rating, 1),
            'reviews_count': len(all_reviews)
        })
        
        return {
            "message": "Review added successfully",
            "review_id": review_id,
            "new_average_rating": round(avg_rating, 1)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding review: {str(e)}")

@router.get("/categories")
def get_rental_categories():
    """Get all rental equipment categories"""
    try:
        categories = [
            {
                "name": "Tractors",
                "description": "Farm tractors and attachments",
                "icon": "🚜"
            },
            {
                "name": "Harvesters",
                "description": "Harvesting equipment",
                "icon": "🌾"
            },
            {
                "name": "Irrigation",
                "description": "Water management systems",
                "icon": "💧"
            },
            {
                "name": "Planting",
                "description": "Seeding and planting equipment",
                "icon": "🌱"
            },
            {
                "name": "Processing",
                "description": "Crop processing equipment",
                "icon": "⚙️"
            },
            {
                "name": "Transportation",
                "description": "Vehicles and trailers",
                "icon": "🚚"
            },
            {
                "name": "Tools",
                "description": "Hand tools and implements",
                "icon": "🔨"
            }
        ]
        
        return {"categories": categories}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@router.get("/bookings/{booking_id}")
def get_booking_details(booking_id: str = Path(...)):
    """Get detailed information about a specific booking"""
    try:
        doc_ref = db.collection('rental_bookings').document(booking_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        booking_data = doc.to_dict()
        booking_data['id'] = doc.id
        
        # Get equipment details
        equipment_ref = db.collection('rental_listings').document(booking_data.get('equipmentId'))
        equipment_doc = equipment_ref.get()
        if equipment_doc.exists:
            booking_data['equipment_details'] = equipment_doc.to_dict()
        
        return booking_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching booking details: {str(e)}")

@router.put("/bookings/{booking_id}")
def update_booking_status(
    booking_id: str = Path(...),
    status: str = Body(..., embed=True),
    notes: Optional[str] = Body(None, embed=True)
):
    """Update booking status (confirmed, in-use, completed, cancelled)"""
    try:
        booking_ref = db.collection('rental_bookings').document(booking_id)
        booking_doc = booking_ref.get()
        
        if not booking_doc.exists:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        valid_statuses = ['confirmed', 'in-use', 'completed', 'cancelled']
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        update_data = {
            'status': status,
            'updatedAt': datetime.now().isoformat()
        }
        
        if notes:
            update_data['status_notes'] = notes
        
        booking_ref.update(update_data)
        
        # If booking is completed, make equipment available again
        if status == 'completed':
            booking_data = booking_doc.to_dict()
            equipment_ref = db.collection('rental_listings').document(booking_data.get('equipmentId'))
            equipment_ref.update({'available': True})
        
        return {
            "message": f"Booking status updated to {status}",
            "booking_id": booking_id,
            "status": status
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating booking status: {str(e)}")

@router.get("/analytics/popular")
def get_popular_rental_items():
    """Get most popular rental items based on bookings and views"""
    try:
        listings_ref = db.collection('rental_listings')
        
        popular_items = []
        for doc in listings_ref.stream():
            item = doc.to_dict()
            item['id'] = doc.id
            
            # Calculate popularity score
            views = item.get('views', 0)
            bookings = item.get('bookings_count', 0)
            rating = item.get('average_rating', 0)
            
            popularity_score = (views * 0.1) + (bookings * 5) + (rating * 2)
            item['popularity_score'] = popularity_score
            
            popular_items.append(item)
        
        # Sort by popularity
        popular_items.sort(key=lambda x: x['popularity_score'], reverse=True)
        
        return {
            "popular_items": popular_items[:20],  # Top 20
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching popular items: {str(e)}") 
