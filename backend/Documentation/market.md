# Market Feature

## Overview
The Market Feature provides farmers with up-to-date agricultural commodity price information and AI-powered market insights. It helps farmers make informed decisions about when and where to sell their produce for maximum profit by accessing official market data and providing strategic recommendations tailored to their specific crops and region.

## Components

### Router: `market.py`
Handles HTTP endpoints for market price data and AI recommendations:
- **GET `/market/prices`**: Retrieves commodity price data from the database with optional filtering by commodity name.
- **POST `/market/ai-recommendations`**: Provides AI-generated market insights and selling recommendations based on price data and farmer profile.

### Service: `market.py`
Core functionality for fetching and processing market price data:
- **get_market_prices()**: Fetches commodity prices from India's government data API based on state, commodity, and optional district parameters.

## Technical Details
- Integrates with India's Open Government Data API for agricultural prices
- Implements commodity name mapping for consistency between app and API
- Uses Google Gemini for AI-powered market insights
- Provides price filtering by commodity, state, and district
- Handles data normalization for inconsistent field names in API responses
- Supports farmer profile context for personalized recommendations

## Data Structure
Market data includes:
- Commodity name
- Market name
- District and state
- Variety
- Modal price (per quintal)
- Arrival date

## Prompt Improvement
The market AI recommendations prompt has been enhanced to:

1. **Data-Driven Analysis**: Analyzes price trends across multiple markets to identify patterns and optimal selling opportunities.
2. **Strategic Recommendations**: Provides specific advice on timing, market selection, and price negotiation strategies.
3. **Value Addition Opportunities**: Suggests ways farmers can increase the value of their produce before selling.
4. **Regional Market Intelligence**: Considers local market conditions and transportation factors specific to Indian agricultural markets.
5. **Personalized Context**: Incorporates farmer profile details when available for more tailored recommendations.
6. **Practical Formatting**: Structures responses with a brief market summary followed by actionable bullet points.
7. **Language Accessibility**: Uses simple language with Hindi terms where appropriate for better farmer understanding.

## Usage Example
```python
# Example of using the Market API
import requests
import json

# Get market prices for a specific commodity
prices_url = "https://api.kisankiawaaz.com/market/prices?commodity=Wheat"
response = requests.get(prices_url)
prices = response.json()

print(f"Found {len(prices)} market entries for Wheat")
for price in prices[:3]:  # Show first 3 entries
    market = price.get('market') or price.get('Market')
    modal_price = price.get('modal_price') or price.get('Modal_Price')
    print(f"Market: {market}, Price: ₹{modal_price}/quintal")

# Get AI-powered market recommendations
recommendations_url = "https://api.kisankiawaaz.com/market/ai-recommendations"
payload = {
    "state": "Maharashtra",
    "commodity": "Wheat",
    "district": "Pune",
    "farmer_profile": {
        "village": "Baramati",
        "district": "Pune",
        "land_size": "5",
        "crops": ["Wheat", "Onion"],
        "has_transportation": "Yes"
    }
}
response = requests.post(recommendations_url, json=payload)
insights = response.json()["recommendations"]

print("\nMarket Recommendations:")
for i, insight in enumerate(insights, 1):
    print(f"{i}. {insight}")
``` 