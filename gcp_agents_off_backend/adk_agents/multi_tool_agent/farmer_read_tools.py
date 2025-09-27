from typing import Any
from services.farmer import FarmerService

# Initialize FarmerService here, as it's needed by these tools
farmer_service_instance = FarmerService()

def get_farmer(farmer_id: str) -> dict:
    print(f"Retrieving farmer data for ID: {farmer_id}")
    """Retrieves a farmer's complete data by their ID."""
    return farmer_service_instance.get_farmer(farmer_id=farmer_id)

def get_farmer_profile(farmer_id: str) -> dict:
    """Retrieves a farmer's profile information by their ID."""
    return farmer_service_instance.get_farmer_profile(farmer_id=farmer_id)

def get_farmer_livestock(farmer_id: str) -> dict:
    """Retrieves the list of livestock for a given farmer."""
    return farmer_service_instance.get_farmer_livestock(farmer_id=farmer_id)

def get_farmer_crops(farmer_id: str) -> dict:
    """Retrieves the list of crops for a given farmer."""
    return farmer_service_instance.get_farmer_crops(farmer_id=farmer_id)

def get_farmer_calendar(farmer_id: str) -> dict:
    """Retrieves the calendar events for a given farmer."""
    return farmer_service_instance.get_farmer_calendar(farmer_id=farmer_id)

def get_farmer_market(farmer_id: str) -> dict:
    """Retrieves the market listings for a given farmer."""
    return farmer_service_instance.get_farmer_market(farmer_id=farmer_id)

def get_farmer_chat_history(farmer_id: str) -> dict:
    """Retrieves the chat history for a given farmer."""
    return farmer_service_instance.get_farmer_chat_history(farmer_id=farmer_id)

def get_farmer_documents(farmer_id: str) -> dict:
    """Retrieves the documents for a given farmer."""
    return farmer_service_instance.get_farmer_documents(farmer_id=farmer_id)

def get_farmer_vectors(farmer_id: str) -> dict:
    """Retrieves the vector data for a given farmer."""
    return farmer_service_instance.get_farmer_vectors(farmer_id=farmer_id)

def get_calendar_ai_analysis(farmer_id: str) -> dict:
    """Analyzes a farmer's calendar events using AI and generates a summary and insights."""
    return farmer_service_instance.get_calendar_ai_analysis(farmer_id=farmer_id)
