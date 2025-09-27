from typing import Any, Optional
from services.farmer import FarmerService

# Initialize FarmerService here, as it's needed by these tools
farmer_service_instance = FarmerService()

def update_farmer_profile(farmer_id: str, profile: dict) -> dict:
    """Updates a farmer's profile information."""
    return farmer_service_instance.update_farmer_profile(farmer_id=farmer_id, profile=profile)

def update_livestock(farmer_id: str, item_id: str, livestock: dict) -> dict:
    """Updates an existing livestock entry for a farmer."""
    return farmer_service_instance.update_livestock(farmer_id=farmer_id, item_id=item_id, livestock=livestock)

def update_crop(farmer_id: str, crop_id: str, crop: dict) -> dict:
    """Updates an existing crop entry for a farmer."""
    return farmer_service_instance.update_crop(farmer_id=farmer_id, crop_id=crop_id, crop=crop)

def update_calendar_event(farmer_id: str, event_id: str, event: dict) -> dict:
    """Updates an existing calendar event for a farmer."""
    return farmer_service_instance.update_calendar_event(farmer_id=farmer_id, event_id=event_id, event=event)

def update_market_listing(farmer_id: str, listing_id: str, listing: dict) -> dict:
    """Updates an existing market listing for a farmer."""
    return farmer_service_instance.update_market_listing(farmer_id=farmer_id, listing_id=listing_id, listing=listing)

def update_chat_history(farmer_id: str, chat_id: str, chat: dict) -> dict:
    """Updates an existing chat history entry for a farmer."""
    return farmer_service_instance.update_chat_history(farmer_id=farmer_id, chat_id=chat_id, chat=chat)

def update_document(farmer_id: str, doc_id: str, document: dict) -> dict:
    """Updates an existing document entry for a farmer."""
    return farmer_service_instance.update_document(farmer_id=farmer_id, doc_id=doc_id, document=document)

def update_vectors(farmer_id: str, vectors: dict) -> dict:
    """Updates the vector data for a farmer."""
    return farmer_service_instance.update_vectors(farmer_id=farmer_id, vectors=vectors)
