import requests
import os

OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '0a2d0746df030311d5eeed1aea9faa05')
BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'
AIR_QUALITY_URL = 'https://api.openweathermap.org/data/2.5/air_pollution'
GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct'
REVERSE_GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/reverse'
TILE_URL_TEMPLATE = 'https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}'

# Example: get_weather_by_city('Pune,IN')
def get_weather_by_city(city: str):
    params = {
        'q': city,
        'appid': OPENWEATHER_API_KEY,
        'units': 'metric',
    }
    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()
    return response.json()

# Example: get_weather_by_coords(lat, lon)
def get_weather_by_coords(lat: float, lon: float):
    params = {
        'lat': lat,
        'lon': lon,
        'appid': OPENWEATHER_API_KEY,
        'units': 'metric',
    }
    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()
    return response.json()

# 5-day/3-hour forecast by city name
def get_forecast_by_city(city: str):
    params = {
        'q': city,
        'appid': OPENWEATHER_API_KEY,
        'units': 'metric',
    }
    response = requests.get(FORECAST_URL, params=params)
    response.raise_for_status()
    return response.json()

# 5-day/3-hour forecast by coordinates
def get_forecast_by_coords(lat: float, lon: float):
    params = {
        'lat': lat,
        'lon': lon,
        'appid': OPENWEATHER_API_KEY,
        'units': 'metric',
    }
    response = requests.get(FORECAST_URL, params=params)
    response.raise_for_status()
    return response.json()

def get_air_quality(lat: float, lon: float):
    params = {
        'lat': lat,
        'lon': lon,
        'appid': OPENWEATHER_API_KEY,
    }
    response = requests.get(AIR_QUALITY_URL, params=params)
    response.raise_for_status()
    return response.json()

def geocode_city(city: str, limit: int = 1):
    params = {
        'q': city,
        'limit': limit,
        'appid': OPENWEATHER_API_KEY,
    }
    response = requests.get(GEOCODING_URL, params=params)
    response.raise_for_status()
    return response.json()

def reverse_geocode(lat: float, lon: float, limit: int = 1):
    params = {
        'lat': lat,
        'lon': lon,
        'limit': limit,
        'appid': OPENWEATHER_API_KEY,
    }
    response = requests.get(REVERSE_GEOCODING_URL, params=params)
    response.raise_for_status()
    return response.json()

def get_weather_tile_url(layer: str, z: int, x: int, y: int):
    # layer: clouds_new, precipation_new, temp_new, wind_new, pressure_new, etc.
    return TILE_URL_TEMPLATE.format(layer=layer, z=z, x=x, y=y, api_key=OPENWEATHER_API_KEY) 