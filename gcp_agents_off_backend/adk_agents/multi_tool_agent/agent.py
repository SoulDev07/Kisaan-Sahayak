from google.adk import Agent
from datetime import datetime
import pytz
from services.weather import weather_service
from services.price import price_service
from services.chat_rag import generate_rag_response
from services.text_to_speech import text_to_speech, detect_language

# Import farmer tools from their respective files
from adk_agents.multi_tool_agent.farmer_read_tools import (
    get_farmer, get_farmer_profile, get_farmer_livestock, get_farmer_crops,
    get_farmer_calendar, get_farmer_market, get_farmer_chat_history,
    get_farmer_documents, get_farmer_vectors, get_calendar_ai_analysis
)
from adk_agents.multi_tool_agent.farmer_write_tools import (
    create_farmer, add_livestock, add_crop, add_calendar_event,
    add_market_listing, add_chat_history, add_document, set_vectors,
    add_space_suggestions
)
from adk_agents.multi_tool_agent.farmer_update_tools import (
    update_farmer_profile, update_livestock, update_crop, update_calendar_event,
    update_market_listing, update_chat_history, update_document, update_vectors
)

async def get_current_temperature(lat: float, lon: float, units: str = "metric") -> dict:
    """Get current temperature for the specified latitude/longitude. Always returns in Celsius (metric units)."""
    # Always use metric units to ensure temperature is in Celsius
    return await weather_service.get_current_temperature(lat, lon, "metric")


async def get_forecast(lat: float, lon: float, units: str = "metric") -> dict:
    """Get weather forecast for the specified latitude/longitude. Always returns in Celsius (metric units)."""
    # Always use metric units to ensure temperature is in Celsius
    return await weather_service.get_forecast(lat, lon, "metric")

async def get_agri_price(commodity: str, state: str, district: str, date_from: str, date_to: str) -> dict:
    """
    Get agricultural price data for a specified commodity, state, district, and date range.

    Args:
        commodity (str): The name of the commodity (e.g., "Wheat").
        state (str): The state for which to retrieve data (e.g., "Maharashtra").
        district (str): The district for which to retrieve data (e.g., "Nagpur").
        date_from (str): The start date for the data in DD-Month-YYYY format (e.g., "01-July-2025").
        date_to (str): The end date for the data in DD-Month-YYYY format (e.g., "02-July-2025").

    Returns:
        dict: Agricultural price data and a summary.
    """
    return await price_service.get_agri_data(commodity, state, district, date_from, date_to)

def generate_response(prompt: str) -> str:
    """
    Generate a response based on the provided prompt using RAG (Retrieval-Augmented Generation).

    Args:
        prompt (str): The user prompt to generate a response for.

    Returns:
        str: The generated response.
    """
    return generate_rag_response(prompt)

def generate_response_with_audio(prompt: str) -> dict:
    """
    Generate a response with both text and audio using RAG (Retrieval-Augmented Generation).

    Args:
        prompt (str): The user prompt to generate a response for.

    Returns:
        dict: Dictionary containing 'response' (text) and 'audio' (base64 encoded audio).
    """
    # Generate text response
    text_response = generate_rag_response(prompt)
    
    # Detect language from the response
    detected_language = detect_language(text_response)
    
    # Convert to speech
    audio_base64 = text_to_speech(text_response, detected_language)
    
    return {
        "response": text_response,
        "audio": audio_base64
    }

root_agent = Agent(
    name="agri_agent",
    model="gemini-2.5-flash",  # Use your preferred Gemini model
    description="Agent for agricultural, weather, and comprehensive farmer data management (read, write, update operations).",
    instruction=(
        "You can invoke tools for current temperature, weather forecast, agricultural prices, "
        "and a wide range of farmer data management operations (read, write, update). "
        "Provide a concise summary. Always reply in the language of the user; if the user asks in Hindi, reply in Hindi. "
        "The input includes location coordinates (lat, lon) and temperature units are always in metric (Celsius). "
        "You have access to fixed location data (lat: 37.526194, lon: -77.330009) and should use metric units for all temperature queries. "
        "Before calling any tool to add or update data, you must first gather all the required parameters for that object from the user. Do not call the tool with incomplete information. "
        "For example, to add a new livestock, you need to provide `id`, `type`, `name`, `age`, `breed`, `health`, `lastCheckup`, `icon`, and `color`. "
        "To add a new crop, you need `cropId`, `name`, `icon`, `plantingDate`, `totalDuration`, and `stages`. "
        "To add a calendar event, you need `date`, `time`, `task`, `type`, `priority`, `details`, and `completed` status."
        "To add a market listing, you need `name`, `quantity`, `myPrice`, `marketPrice`, `status` (default: 'active'), `views` (default: 0), `inquiries` (default: 0), `emoji` (optional, default: '🌾'), and `createdAt` (default: current date)."
        "before calling the function, keep on asking the user for the required parameters until you have all the required parameters to call the function."
        "When none of the tool fit for the user query, use the `generate_response` tool to generate a response using RAG (Retrieval-Augmented Generation) approach."
    ),
    tools=[
        get_current_temperature,
        get_forecast,
        get_agri_price,
        get_farmer,
        get_farmer_profile,
        # update_farmer_profile,
        get_farmer_livestock,
        get_farmer_crops,
        get_farmer_calendar,
        get_farmer_market,
        get_farmer_chat_history,
        get_farmer_documents,
        get_farmer_vectors,
        get_calendar_ai_analysis,
        # create_farmer,
        add_livestock,
        add_crop,
        add_calendar_event,
        add_market_listing,
        add_chat_history,
        add_document,
        # set_vectors,
        add_space_suggestions,
        # update_livestock,
        # update_crop,
        # update_calendar_event,
        # update_market_listing,
        # update_chat_history,
        # update_document,
        # update_vectors,
        generate_response,
        generate_response_with_audio
    ],
)
