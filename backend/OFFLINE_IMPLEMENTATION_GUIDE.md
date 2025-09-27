# Offline/Online Implementation Guide

## Overview

You now have a complete hybrid offline/online system that automatically handles switching between modes based on connectivity and data availability.

## Architecture

### 1. **Hybrid Backend Approach** ✅ (Recommended)
- **Single Backend** with smart routing
- **Automatic Fallback** from online to offline
- **No separate servers** needed
- **Seamless Integration** with existing code

### 2. **Key Components**

#### Backend Components:
1. **`hybrid_offline.py`** - Main hybrid router with offline fallback
2. **`config_helper.py`** - Configuration endpoint for frontend
3. **`offline_data/`** - JSON files with embeddings for offline use
4. **Updated `main.py`** - Includes hybrid routes

#### Frontend Components:
1. **`frontend_api_manager.js`** - JavaScript API manager
2. **`useOfflineApi.jsx`** - React hook for easy integration
3. **Auto-detection** of online/offline mode

## Implementation Steps

### 1. **Run Data Collection**
```bash
# First, collect offline data
python alternative_offline_fetcher.py
```

### 2. **Start Backend**
```bash
# Start your existing backend (now with hybrid routes)
python main.py
```

### 3. **Frontend Integration**

#### Option A: Vanilla JavaScript
```javascript
const api = new ApiManager('http://localhost:8000');

// Automatically handles online/offline
api.getWeather('Pune,IN').then(weather => {
    console.log('Weather:', weather);
    // weather._metadata.source tells you: 'online', 'offline', or 'cache'
});
```

#### Option B: React
```jsx
import { useOfflineApi } from './useOfflineApi';

function MyComponent() {
    const { getWeather, isOnline, loading } = useOfflineApi();
    
    // Use exactly like online API - it handles fallback automatically
    const [weather, setWeather] = useState(null);
    
    useEffect(() => {
        getWeather('Pune,IN').then(setWeather);
    }, []);
    
    return (
        <div>
            <div>{isOnline ? '🟢 Online' : '🔴 Offline'}</div>
            <div>{weather?.data?.temperature}°C</div>
        </div>
    );
}
```

## How It Works

### 1. **Smart Routing**
```
Frontend Request → Hybrid Router → Online Service (if available)
                                 ↓
                                 Offline Data (if online fails)
```

### 2. **Automatic Detection**
- **Connectivity Check**: Tests internet connection
- **Service Availability**: Checks if Firebase/Gemini are accessible
- **Data Freshness**: Uses timestamps to determine data age

### 3. **Fallback Strategy**
1. **Try Online First**: If connected and services available
2. **Fall Back to Offline**: If online fails or unavailable
3. **Use Cache**: If both fail, use previously cached data
4. **Graceful Degradation**: Clear error messages and limited functionality

## API Responses Include Metadata

```json
{
    "data": { /* your actual data */ },
    "_metadata": {
        "source": "online|offline|cache",
        "timestamp": "2025-01-26T...",
        "endpoint": "http://localhost:8000/hybrid/weather/city"
    }
}
```

## Features Available Offline

### ✅ **Fully Available Offline with Intelligence**
- **Enhanced RAG Chat** - Smart intent detection, relevance scoring, and contextual responses
- **Market prices** - Cached data with intelligent filtering
- **Weather** - Pattern-based responses and cached data
- **Crop recommendations** - Rule-based with local data matching
- **Search** - Multi-source semantic search with ranking
- **Government schemes** - Cached scheme data with relevance matching

### ⚠️ **Limited Offline**
- AI analysis (uses cached patterns and rule-based logic)
- Document generation (templates only)
- Voice processing (requires online)

### ❌ **Requires Online**
- Real-time Gemini AI calls
- Live weather updates
- Fresh market data
- Voice-to-text processing
- Firebase real-time updates

## Enhanced Offline RAG Features

The offline RAG system now includes:

### 🧠 **Intent Detection**
- Automatically detects query type (market, weather, crop disease, etc.)
- Extracts key information (crop names, seasons, locations)
- Determines urgency level

### 🎯 **Smart Filtering**
- Weights different data sources based on query intent
- Applies relevance scoring using multiple factors
- Filters out low-relevance results

### 📊 **Response Quality**
- Context-aware response generation
- Intent-specific response templates
- Confidence scoring for transparency
- Fallback responses for edge cases

### 🔍 **Search Intelligence**
- Multi-keyword matching
- Exact phrase detection
- Source-specific weighting
- Relevance ranking

### Example Offline RAG Responses:

**Query**: "What is the price of wheat?"
```json
{
  "response": "Based on available market data:\n• Wheat: ₹2,100/quintal at Delhi Mandi\n• Wheat: ₹2,050/quintal at Punjab Mandi\n\nFor wheat, consider current market trends and transportation costs to nearby markets.",
  "intent": {"type": "market", "crop_name": "wheat"},
  "confidence": 0.85,
  "source": "offline_rag"
}
```

**Query**: "My tomato plants are turning yellow"
```json
{
  "response": "Based on crop health information:\n\n• Yellow leaves in tomatoes can indicate overwatering, nutrient deficiency, or early blight...\n\nGeneral recommendations:\n• Inspect crops regularly for early signs\n• Maintain proper spacing and ventilation\n• Use organic methods when possible",
  "intent": {"type": "crop_disease", "crop_name": "tomato"},
  "confidence": 0.72,
  "source": "offline_rag"
}
```

## Configuration Endpoints

### Check System Status
```bash
GET /hybrid/status
```
Returns current online/offline status and available features.

### Get Frontend Configuration
```bash
GET /config/endpoints
```
Returns endpoint mappings for frontend to use correct URLs.

### Check Offline Data Status
```bash
GET /config/offline-status
```
Returns detailed information about available offline data.

## Benefits of This Approach

### 1. **No Separate Backend Needed**
- Everything runs in your existing FastAPI server
- No additional infrastructure
- Same codebase handles both modes

### 2. **Seamless User Experience**
- Automatic switching
- Clear status indicators
- Graceful degradation
- No app crashes when offline

### 3. **Development Friendly**
- Easy to test both modes
- Clear separation of concerns
- Existing code mostly unchanged
- Progressive enhancement

### 4. **Production Ready**
- Handles network failures gracefully
- Caches data automatically
- Provides meaningful error messages
- Maintains app functionality

## Testing the Implementation

### 1. **Test Online Mode**
```bash
# With internet connection
curl http://localhost:8000/hybrid/weather/city?city=Pune,IN
```

### 2. **Test Offline Mode**
```bash
# Disconnect internet, then:
curl http://localhost:8000/hybrid/weather/city?city=Pune,IN
```

### 3. **Test Frontend**
```javascript
// In browser console
const api = new ApiManager();
api.getStatus(); // Check current mode
api.getWeather('Pune,IN'); // Test weather API
```

## Next Steps

1. **Run the data collection script** to populate offline data
2. **Update your frontend** to use the new API manager
3. **Add status indicators** to show online/offline mode
4. **Test thoroughly** in both online and offline scenarios
5. **Customize offline responses** based on your app's needs

This approach gives you the best of both worlds - full functionality when online, and graceful degradation when offline, all without needing separate backends or complex infrastructure changes!
