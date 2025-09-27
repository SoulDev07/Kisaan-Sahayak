import httpx
from config.setting import settings
from typing import Dict, Any, Optional


class WeatherService:
    """Service for interacting with OpenWeatherMap API"""
    
    def __init__(self):
        # Use URL from settings
        self.base_url = settings.OPEN_WEATHER_API_URL
        self.api_key = settings.OPEN_WEATHER_API_KEY
        
    async def get_current_weather(self, lat: float, lon: float, units: Optional[str] = None) -> Dict[str, Any]:
        """
        Get current weather data for the specified location using free tier endpoint
        
        Args:
            lat (float): Latitude
            lon (float): Longitude
            units (str, optional): Units of measurement (metric, imperial, standard)
            
        Returns:
            Dict[str, Any]: Weather data
        """
        units = units or settings.DEFAULT_UNITS
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": units
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch weather data: {response.text}")
                
            return response.json()
            
    async def get_forecast_data(self, lat: float, lon: float, units: Optional[str] = None) -> Dict[str, Any]:
        """
        Get forecast data for the specified location using free tier endpoint
        
        Args:
            lat (float): Latitude
            lon (float): Longitude
            units (str, optional): Units of measurement (metric, imperial, standard)
            
        Returns:
            Dict[str, Any]: Forecast data
        """
        units = units or settings.DEFAULT_UNITS
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/forecast",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": units
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch forecast data: {response.text}")
                
            return response.json()
    
    async def get_current_temperature(self, lat: float, lon: float, units: Optional[str] = None) -> Dict[str, Any]:
        """
        Get current temperature for the specified location
        
        Args:
            lat (float): Latitude
            lon (float): Longitude
            units (str, optional): Units of measurement (metric, imperial, standard)
            
        Returns:
            Dict[str, Any]: Temperature data
        """
        weather_data = await self.get_current_weather(lat, lon, units)
        
        main = weather_data.get("main", {})
        weather = weather_data.get("weather", [{}])[0]
        
        return {
            "temperature": main.get("temp"),
            "feels_like": main.get("feels_like"),
            "humidity": main.get("humidity"),
            "units": units or settings.DEFAULT_UNITS,
            "description": weather.get("description", ""),
            "location": {
                "lat": weather_data.get("coord", {}).get("lat"),
                "lon": weather_data.get("coord", {}).get("lon"),
            }
        }
        
    async def get_forecast(self, lat: float, lon: float, units: Optional[str] = None) -> Dict[str, Any]:
        """
        Get weather forecast for the specified location
        
        Args:
            lat (float): Latitude
            lon (float): Longitude
            units (str, optional): Units of measurement (metric, imperial, standard)
            
        Returns:
            Dict[str, Any]: Forecast data
        """
        forecast_data = await self.get_forecast_data(lat, lon, units)
        
        # Extract the list of forecast items
        forecast_list = forecast_data.get("list", [])
        
        # Group forecast by day (using the dt_txt field)
        daily_forecast = {}
        hourly_forecast = []
        
        for item in forecast_list:
            # Process hourly data (limit to 24 hours)
            if len(hourly_forecast) < 24:
                hourly_forecast.append({
                    "dt": item.get("dt"),
                    "temp": item.get("main", {}).get("temp"),
                    "humidity": item.get("main", {}).get("humidity"),
                    "description": item.get("weather", [{}])[0].get("description", ""),
                    "dt_txt": item.get("dt_txt")
                })
            
            # Process daily data (group by date)
            date = item.get("dt_txt", "").split(" ")[0]  # Extract date part
            if date not in daily_forecast:
                daily_forecast[date] = {
                    "dt": item.get("dt"),
                    "temp": {
                        "day": item.get("main", {}).get("temp"),
                        "min": item.get("main", {}).get("temp_min"),
                        "max": item.get("main", {}).get("temp_max"),
                    },
                    "humidity": item.get("main", {}).get("humidity"),
                    "weather": item.get("weather", []),
                    "dt_txt": item.get("dt_txt")
                }
        
        # Convert daily_forecast dict to list
        daily = list(daily_forecast.values())
        
        return {
            "daily": daily,
            "hourly": hourly_forecast,
            "units": units or settings.DEFAULT_UNITS,
            "location": {
                "lat": lat,
                "lon": lon,
            }
        }


# Create singleton instance
weather_service = WeatherService()
