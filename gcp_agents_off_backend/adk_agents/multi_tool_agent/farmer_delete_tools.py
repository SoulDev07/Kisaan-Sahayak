from typing import Any
from services.farmer import FarmerService

# Initialize FarmerService here, as it's needed by these tools
farmer_service_instance = FarmerService()

async def delete_livestock(farmer_id: str, item_id: str) -> dict:
    """Deletes a livestock entry from a farmer's record."""
    return await farmer_service_instance.delete_livestock(farmer_id=farmer_id, item_id=item_id)

async def delete_crop(farmer_id: str, crop_id: str) -> dict:
    """Deletes a crop entry from a farmer's record."""
    return await farmer_service_instance.delete_crop(farmer_id=farmer_id, crop_id=crop_id)

async def delete_calendar_event(farmer_id: str, event_id: str) -> dict:
    """Deletes a calendar event from a farmer's record."""
    return await farmer_service_instance.delete_calendar_event(farmer_id=farmer_id, event_id=event_id)

async def delete_market_listing(farmer_id: str, listing_id: str) -> dict:
    """Deletes a market listing from a farmer's record."""
    return await farmer_service_instance.delete_market_listing(farmer_id=farmer_id, listing_id=listing_id)

async def delete_chat_history(farmer_id: str, chat_id: str) -> dict:
    """Deletes a chat history entry from a farmer's record."""
    return await farmer_service_instance.delete_chat_history(farmer_id=farmer_id, chat_id=chat_id)

async def delete_document(farmer_id: str, doc_id: str) -> dict:
    """Deletes a document entry from a farmer's record."""
    return await farmer_service_instance.delete_document(farmer_id=farmer_id, doc_id=doc_id)

async def delete_vectors(farmer_id: str) -> dict:
    """Deletes the vector data for a farmer."""
    return await farmer_service_instance.delete_vectors(farmer_id=farmer_id)
