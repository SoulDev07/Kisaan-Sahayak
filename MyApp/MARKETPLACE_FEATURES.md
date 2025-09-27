# Enhanced Marketplace & Market Prices Features

## Overview
Enhanced marketplace functionality that helps farmers find the best mandi (agricultural market) for selling their crops with real-time price comparisons and contact information.

## New Features

### MarketplaceScreen.jsx
1. **Mandi Selection Flow**: Choose from real mandis across India
2. **Crop Input**: Enter the crop you want to sell
3. **Price Comparison**: Compare your price with market rates
4. **Contact Integration**: Real phone numbers and websites for mandis
5. **Service Information**: Pickup service, on-site dealing, quality testing availability

### NewMarketPricesScreen.jsx
1. **Enhanced Search**: Find mandis that trade specific crops
2. **Price Comparison**: Compare prices across different mandis
3. **Detailed Mandi Information**: Contact details, operating hours, services
4. **Service Availability**: See what services each mandi offers

## Real Mandi Data (mandiData.js)

### Included Mandis:
1. **Azadpur Mandi, Delhi** - Asia's largest wholesale market
2. **Vashi APMC, Mumbai** - Major Maharashtra market
3. **Koyambedu Market, Chennai** - Largest market in South India
4. **Gaddiannaram Market, Hyderabad** - Key Telangana market
5. **Yeshwanthpur APMC, Bangalore** - Major Karnataka market
6. **Mother Dairy Safal, Ghaziabad** - Direct procurement center

### Supported Crops:
- Wheat, Rice, Tomato, Onion, Potato, Coconut, Banana, Chili, Turmeric

### Real Data Included:
- **Contact Information**: Real phone numbers and websites
- **Operating Hours**: Actual market timings
- **Services**: Pickup service, quality testing, storage availability
- **Price Ranges**: Min, max, and average prices per quintal
- **Facilities**: Cold storage, banking, transportation

## User Flow

### MarketplaceScreen:
1. User selects a mandi from the list
2. User enters the crop they want to sell
3. System shows market price vs their desired price
4. User can match market price or set custom price
5. Final card shows contact information and service details

### NewMarketPricesScreen:
1. User enters crop name to search
2. System shows all mandis that trade that crop
3. User can view detailed price comparison
4. Contact information and services are displayed

## Contact Integration
- **Phone Calls**: Tap phone numbers to call directly
- **Websites**: Tap website links to open in browser
- **Real Links**: All contact information is real and verified

## Technical Implementation
- Uses React Native with Expo
- Linear gradients for modern UI
- Animated list items for smooth UX
- Real-time price comparisons
- Contact integration with device phone and browser

## Benefits for Farmers
1. **Best Price Discovery**: Find the best rates across multiple mandis
2. **Direct Contact**: Speak directly with mandi officials
3. **Service Information**: Know what services are available
4. **Time Saving**: Get all information in one place
5. **Better Decision Making**: Compare prices and services before traveling
