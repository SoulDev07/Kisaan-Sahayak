from typing import Any, Optional, List, Dict
from services.farmer import FarmerService
from models.farmer import Farmer, Livestock, Crop, CalendarEvent, MarketListing, ChatHistory, Document, Vectors

# Initialize FarmerService here, as it's needed by these tools
farmer_service_instance = FarmerService()

def create_farmer(farmer: dict) -> dict:
    """Creates a new farmer entry in the database."""
    farmer_model = Farmer(**farmer)
    return farmer_service_instance.create_farmer(farmer=farmer_model)

def add_livestock(
    farmer_id: str,
    id: str,
    type: str,
    name: str,
    age: str,
    breed: str,
    health: str,
    lastCheckup: str,
    icon: str,
    color: str,
    milkCapacity: Optional[str] = None,
    eggCapacity: Optional[str] = None
) -> dict:
    """Adds a new livestock entry to a farmer's record."""
    livestock_data = {
        "id": id,
        "type": type,
        "name": name,
        "age": age,
        "breed": breed,
        "health": health,
        "lastCheckup": lastCheckup,
        "icon": icon,
        "color": color,
        "milkCapacity": milkCapacity,
        "eggCapacity": eggCapacity
    }
    livestock_model = Livestock(**livestock_data)
    return farmer_service_instance.add_livestock(farmer_id=farmer_id, livestock=livestock_model)

def add_crop(farmer_id: str, crop: dict) -> dict:
    """Adds a new crop entry to a farmer's record."""
    crop_model = Crop(**crop)
    return farmer_service_instance.add_crop(farmer_id=farmer_id, crop=crop_model)

def add_calendar_event(farmer_id: str, event: dict) -> dict:
    """Adds a new calendar event to a farmer's record."""
    try:
        # Ensure required fields are present with defaults
        event_data = {
            "date": event.get("date", ""),
            "time": event.get("time", ""),
            "task": event.get("task", ""),
            "type": event.get("type", "farming"),
            "priority": event.get("priority", "low"),
            "details": event.get("details", ""),
            "completed": event.get("completed", False)
        }
        event_model = CalendarEvent(**event_data)
        return farmer_service_instance.add_calendar_event(farmer_id=farmer_id, event=event_model)
    except Exception as e:
        print(f"Error creating calendar event: {e}")
        print(f"Event data received: {event}")
        return {"error": f"Failed to add calendar event: {str(e)}", "received_data": event}

def add_market_listing(farmer_id: str, listing: dict) -> dict:
    """Adds a new market listing to a farmer's record."""
    try:
        # Ensure required fields are present with defaults
        import uuid
        from datetime import datetime
        
        listing_data = {
            "id": listing.get("id", str(uuid.uuid4())),
            "name": listing.get("name", ""),
            "quantity": listing.get("quantity", ""),
            "myPrice": float(listing.get("myPrice", 0)),
            "marketPrice": float(listing.get("marketPrice", 0)),
            "status": listing.get("status", "active"),
            "views": int(listing.get("views", 0)),
            "inquiries": int(listing.get("inquiries", 0)),
            "emoji": listing.get("emoji", "🌾"),  # Default emoji
            "createdAt": listing.get("createdAt", datetime.now().strftime("%Y-%m-%d"))
        }
        listing_model = MarketListing(**listing_data)
        return farmer_service_instance.add_market_listing(farmer_id=farmer_id, listing=listing_model)
    except Exception as e:
        print(f"Error creating market listing: {e}")
        print(f"Listing data received: {listing}")
        return {"error": f"Failed to add market listing: {str(e)}", "received_data": listing}

def add_chat_history(farmer_id: str, chat: dict) -> dict:
    """Adds a new chat history entry to a farmer's record."""
    chat_model = ChatHistory(**chat)
    return farmer_service_instance.add_chat_history(farmer_id=farmer_id, chat=chat_model)

def add_document(farmer_id: str, document: dict) -> dict:
    """Adds a new document entry to a farmer's record."""
    document_model = Document(**document)
    return farmer_service_instance.add_document(farmer_id=farmer_id, document=document_model)

def set_vectors(farmer_id: str, vectors: dict) -> dict:
    """Sets the vector data for a farmer."""
    vectors_model = Vectors(**vectors)
    return farmer_service_instance.set_vectors(farmer_id=farmer_id, vectors=vectors_model)

def add_space_suggestions(farmer_id: str, body: dict) -> dict:
    """Accepts an image (base64), animals, and calendar events. Stores the image, calls Gemini for analysis, and returns suggestions."""
    return farmer_service_instance.add_space_suggestions(farmer_id=farmer_id, body=body)
