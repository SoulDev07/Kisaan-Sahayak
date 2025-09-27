# Comprehensive Farmer Backend API

This document outlines all the enhanced backend routes for the farmer application, including the newly added comprehensive modules for crop marketplace, enhanced rental system, and complete crop cycle management.

## 📊 API Overview

- **Total Routes**: 189
- **Total Modules**: 14  
- **AI-Integrated Endpoints**: 13
- **New Comprehensive Modules**: 3

## 🌾 Crop Marketplace Module

### Overview
Complete marketplace system for farmers to buy and sell crops with advanced features like search, filtering, orders management, and analytics.

### Key Features
- **Semantic Search**: AI-powered crop search using embeddings
- **Advanced Filtering**: By location, price, category, organic certification
- **Order Management**: Complete order lifecycle from placement to delivery
- **Price Negotiation**: Built-in negotiation system
- **Analytics**: Trending crops and market insights
- **Reviews & Ratings**: Seller rating system

### Routes

#### Crop Listings
```
GET /marketplace/crops - Get all marketplace crops with filters
POST /marketplace/crops - Add crop to marketplace
GET /marketplace/crops/{crop_id} - Get specific crop details
PUT /marketplace/crops/{crop_id} - Update crop listing
DELETE /marketplace/crops/{crop_id} - Remove crop from marketplace
```

#### Search & Discovery
```
GET /marketplace/crops/search - Semantic search for crops
GET /marketplace/crops/categories - Get crop categories
GET /marketplace/analytics/trending - Get trending crops
```

#### Order Management
```
POST /marketplace/crops/{crop_id}/buy - Purchase crop
GET /marketplace/orders - Get orders with filters
GET /marketplace/orders/{order_id} - Get order details
PUT /marketplace/orders/{order_id}/status - Update order status
```

#### Farmer-Specific
```
GET /marketplace/farmer/{farmer_id}/listings - Get farmer's crop listings
GET /marketplace/farmer/{farmer_id}/purchases - Get farmer's purchases
GET /marketplace/farmer/{farmer_id}/favorites - Get favorite crops
```

## 🚜 Enhanced Rental System Module

### Overview
Advanced equipment rental system with comprehensive booking management, reviews, availability checking, and analytics.

### Key Features
- **Equipment Management**: Complete CRUD for rental equipment
- **Smart Booking**: Availability checking and conflict resolution
- **Review System**: Equipment and owner reviews
- **Payment Integration**: Payment processing and tracking
- **Analytics**: Popular items and rental trends
- **Category Management**: Organized equipment categories

### Routes

#### Equipment Management
```
GET /rental/items - Get all rental items with pagination
GET /rental/items/{item_id} - Get item details
PUT /rental/items/{item_id} - Update rental item
DELETE /rental/items/{item_id} - Delete rental item
POST /rental/list - List new equipment
```

#### Booking System
```
POST /rental/book - Book equipment
GET /rental/bookings - Get farmer's bookings
GET /rental/bookings/{booking_id} - Get booking details
PUT /rental/bookings/{booking_id} - Update booking status
POST /rental/bookings/{booking_id}/extend - Extend rental period
POST /rental/bookings/{booking_id}/return - Mark as returned
```

#### Availability & Reviews
```
GET /rental/items/{item_id}/availability - Check availability
GET /rental/items/{item_id}/reviews - Get item reviews
POST /rental/items/{item_id}/reviews - Add review
```

#### Analytics & Categories
```
GET /rental/categories - Get equipment categories
GET /rental/analytics/popular - Get popular items
GET /rental/analytics/trends - Get rental trends
```

#### Farmer-Specific
```
GET /rental/farmer/{farmer_id}/listings - Get farmer's listings
GET /rental/farmer/{farmer_id}/rentals - Get farmer's rentals
GET /rental/farmer/{farmer_id}/income - Get rental income stats
```

## 🌱 Comprehensive Crop Cycle Management

### Overview
Complete crop lifecycle management system from planning to harvest with task management, progress tracking, and AI-powered recommendations.

### Key Features
- **Crop Master Database**: Comprehensive crop information
- **Cycle Management**: Full lifecycle tracking
- **Task Management**: Automated and manual task creation
- **Progress Tracking**: Stage-wise progress monitoring
- **Analytics**: Detailed farming analytics
- **AI Recommendations**: Personalized farming advice
- **Seasonal Planning**: Season-based crop planning

### Routes

#### Crop Master Data
```
GET /crop-cycle/crops - Get all available crops
POST /crop-cycle/crops - Add new crop to system
GET /crop-cycle/crops/{crop_id} - Get crop details
PUT /crop-cycle/crops/{crop_id} - Update crop information
DELETE /crop-cycle/crops/{crop_id} - Delete crop
```

#### Crop Cycle Management
```
GET /crop-cycle/farmer/{farmer_id}/cycles - Get farmer's crop cycles
POST /crop-cycle/farmer/{farmer_id}/cycles - Start new crop cycle
GET /crop-cycle/farmer/{farmer_id}/cycles/{cycle_id} - Get cycle details
PUT /crop-cycle/farmer/{farmer_id}/cycles/{cycle_id} - Update cycle
DELETE /crop-cycle/farmer/{farmer_id}/cycles/{cycle_id} - End cycle
```

#### Task Management
```
GET /crop-cycle/farmer/{farmer_id}/cycles/{cycle_id}/tasks - Get cycle tasks
POST /crop-cycle/farmer/{farmer_id}/cycles/{cycle_id}/tasks - Add task
PUT /crop-cycle/farmer/{farmer_id}/cycles/{cycle_id}/tasks/{task_id} - Update task
DELETE /crop-cycle/farmer/{farmer_id}/cycles/{cycle_id}/tasks/{task_id} - Delete task
```

#### Analytics & Recommendations
```
GET /crop-cycle/farmer/{farmer_id}/analytics - Get farming analytics
GET /crop-cycle/farmer/{farmer_id}/recommendations - Get AI recommendations
GET /crop-cycle/seasons - Get crop seasons information
```

#### Knowledge Base
```
GET /crop-cycle/varieties/{crop_name} - Get crop varieties
GET /crop-cycle/best-practices/{crop_id} - Get best practices
GET /crop-cycle/diseases/{crop_id} - Get common diseases
GET /crop-cycle/fertilizers/{crop_id} - Get fertilizer recommendations
GET /crop-cycle/irrigation/{crop_id} - Get irrigation schedule
```

## 🔧 Existing Modules Enhanced

### Farmer Management
- Enhanced with marketplace listings tracking
- Added rental activity monitoring
- Integrated crop cycle management

### Market Module
- Connected with marketplace for price comparison
- Enhanced AI recommendations

### Weather Module
- Integrated with crop cycle for weather-based recommendations
- Enhanced analytics for crop planning

## 📋 Data Models

### Crop Marketplace Models
- `CropMarketplaceListing`: Complete crop listing structure
- `CropOrder`: Order management with delivery tracking
- `CropNegotiation`: Price negotiation system

### Enhanced Rental Models
- `RentalEquipment`: Comprehensive equipment details
- `RentalBooking`: Advanced booking management
- `RentalReview`: Review and rating system
- `RentalPayment`: Payment tracking

### Crop Cycle Models
- `CropMaster`: Master crop database
- `CropCycle`: Complete lifecycle tracking
- `CropTask`: Task management
- `CropStageProgress`: Stage-wise progress
- `CropAnalytics`: Comprehensive analytics

## 🚀 Getting Started

### Prerequisites
```bash
pip install fastapi uvicorn firebase-admin sentence-transformers google-generativeai
```

### Environment Setup
```bash
# Set up Firebase credentials
GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json

# Set up Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### Running the Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📊 Database Collections

### New Collections Added
- `marketplace_crops`: Crop marketplace listings
- `crop_orders`: Order management
- `rental_listings`: Enhanced rental equipment
- `rental_bookings`: Booking management
- `rental_reviews`: Review system
- `crop_cycles`: Crop lifecycle tracking
- `crop_tasks`: Task management
- `crops_master`: Master crop database

## 🔍 Search & AI Features

### Semantic Search
- Vector embeddings using sentence-transformers
- Cosine similarity for relevance scoring
- Multi-field search across descriptions

### AI Integration
- Gemini 2.5 Flash for recommendations
- Automated task generation
- Market trend analysis
- Weather-based suggestions

## 📱 API Usage Examples

### Add Crop to Marketplace
```python
import requests

crop_data = {
    "farmer_id": "farmer123",
    "crop_name": "Rice",
    "variety": "Basmati",
    "quantity": 50.0,
    "unit": "quintal",
    "price_per_unit": 2500.0,
    "total_price": 125000.0,
    "quality_grade": "A",
    "organic_certified": True,
    "harvest_date": "2024-11-15",
    "location": {
        "district": "Punjab",
        "state": "Punjab",
        "pin_code": "144001"
    },
    "description": "Premium quality Basmati rice",
    "available_from": "2024-11-20",
    "available_until": "2024-12-20",
    "negotiable": True
}

response = requests.post("http://localhost:8000/marketplace/crops", json=crop_data)
```

### Book Rental Equipment
```python
booking_data = {
    "equipmentId": "tractor123",
    "farmerId": "farmer456",
    "startDate": "2024-08-01",
    "endDate": "2024-08-05",
    "notes": "Need for rice harvesting",
    "contact_info": {
        "phone": "+91-9876543210",
        "email": "farmer@example.com"
    }
}

response = requests.post("http://localhost:8000/rental/book", json=booking_data)
```

### Start Crop Cycle
```python
cycle_data = {
    "farmer_id": "farmer789",
    "crop_id": "crop123",
    "crop_name": "Wheat",
    "variety": "HD-2967",
    "area_planted": 10.0,
    "planting_date": "2024-11-01",
    "expected_harvest_date": "2025-04-15",
    "location": {
        "field_name": "North Field",
        "district": "Haryana",
        "state": "Haryana"
    }
}

response = requests.post("http://localhost:8000/crop-cycle/farmer/farmer789/cycles", json=cycle_data)
```

## 🔐 Security Features

- Farmer ID verification for all operations
- Access control for sensitive operations
- Input validation using Pydantic models
- Error handling and logging

## 📈 Monitoring & Analytics

- Comprehensive API analytics
- Performance monitoring
- User behavior tracking
- Business intelligence reports

## 🚀 Future Enhancements

- Real-time notifications
- Mobile app integration
- IoT sensor integration
- Blockchain for supply chain tracking
- Machine learning for yield prediction

## 📞 Support

For technical support or feature requests, contact the development team or create an issue in the repository.
