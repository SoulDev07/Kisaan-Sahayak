# Weather Feature

## Overview
The Weather feature provides comprehensive weather information and agricultural insights tailored for farmers. It integrates with OpenWeatherMap API to fetch current weather conditions, forecasts, and air quality data, then uses AI to generate farming recommendations based on the weather data.

## Components

### Router: `weather.py`
Handles HTTP endpoints for weather data and AI-powered insights:
- **GET `/weather/city`**: Get current weather by city name
- **GET `/weather/coords`**: Get current weather by coordinates
- **GET `/weather/forecast/city`**: Get 5-day forecast by city name
- **GET `/weather/forecast/coords`**: Get 5-day forecast by coordinates
- **GET `/weather/air_quality`**: Get air quality data for a location
- **GET `/weather/geocode`**: Convert between city names and coordinates
- **GET `/weather/map_tile_url`**: Get URL for weather map tiles
- **GET `/weather/ai-analysis`**: Get AI-powered agricultural insights based on weather

### Service: `weather.py`
Implements core weather data fetching functionality:
- **get_weather_by_city()**: Fetches current weather for a city
- **get_weather_by_coords()**: Fetches current weather for coordinates
- **get_forecast_by_city()**: Fetches 5-day forecast for a city
- **get_forecast_by_coords()**: Fetches 5-day forecast for coordinates
- **get_air_quality()**: Fetches air quality data
- **geocode_city()**: Converts city name to coordinates
- **reverse_geocode()**: Converts coordinates to location name
- **get_weather_tile_url()**: Generates URLs for weather map tiles

## Technical Details
- Uses OpenWeatherMap API for weather data
- Integrates with Google Gemini for AI-powered weather insights
- Links to farmer profile data to get farm location
- Supports multiple weather data visualizations (clouds, precipitation, temperature, etc.)
- Returns data in metric units (Celsius, etc.)

## Prompt Improvement
The weather AI analysis prompt has been enhanced to:

1. **Regional Agricultural Focus**: Tailored specifically for Indian farming contexts and practices.
2. **Comprehensive Analysis Structure**: Includes crop impact, weather pattern assessment, short and medium-term actions, and risk assessment.
3. **Seasonal Context**: Evaluates weather conditions within the context of current agricultural seasons in India.
4. **Cultural Relevance**: References traditional weather indicators familiar to Indian farmers.
5. **Practical Format**: Structures output with a brief summary followed by specific actionable recommendations.
6. **Linguistic Adaptation**: Incorporates Hindi/regional terms for better understanding.
7. **Safety Prioritization**: Emphasizes safety and damage prevention during extreme weather events.

## Usage Example
```python
# Example of using the Weather API
import requests

# Get current weather for a city
city_url = "https://api.kisankiawaaz.com/weather/city?city=Pune,IN"
city_weather = requests.get(city_url).json()
print(f"Temperature in Pune: {city_weather['main']['temp']}°C")

# Get weather forecast by coordinates
forecast_url = "https://api.kisankiawaaz.com/weather/forecast/coords?lat=18.52&lon=73.85"
forecast = requests.get(forecast_url).json()
print(f"5-day forecast received with {len(forecast['list'])} time points")

# Get AI-powered agricultural insights for a farmer
insight_url = "https://api.kisankiawaaz.com/weather/ai-analysis?farmer_id=farmer123"
insights = requests.get(insight_url).json()
print("AI Weather Analysis:", insights['analysis'])
``` 