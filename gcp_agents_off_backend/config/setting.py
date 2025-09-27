from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings(BaseSettings):
    # OpenWeatherMap API settings
    OPEN_WEATHER_API_KEY: str = os.getenv("OPEN_WEATHER_API_KEY", "")
    OPEN_WEATHER_API_URL: str = os.getenv("OPEN_WEATHER_API_URL", "https://api.openweathermap.org/data/2.5")
    
    # Google Gemini API key
    GOOGLE_API_KEY: Optional[str] = os.getenv("GOOGLE_API_KEY", "")
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", "")

    # Default settings
    DEFAULT_UNITS: str = "metric"  # metric, imperial, standard


settings = Settings() 