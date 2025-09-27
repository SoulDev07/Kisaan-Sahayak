/**
 * Frontend API Configuration for Offline/Online Mode
 * Automatically handles switching between online and offline endpoints
 */

class ApiManager {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
        this.isOnline = navigator.onLine;
        this.config = null;
        this.offlineData = new Map();
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.loadConfiguration();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        this.init();
    }
    
    async init() {
        await this.loadConfiguration();
        await this.loadOfflineData();
    }
    
    async loadConfiguration() {
        try {
            const response = await fetch(`${this.baseUrl}/config/endpoints`);
            this.config = await response.json();
            console.log('✅ API Configuration loaded:', this.config);
        } catch (error) {
            console.warn('⚠️ Could not load API configuration, using defaults');
            this.config = this.getDefaultConfig();
        }
    }
    
    async loadOfflineData() {
        try {
            const response = await fetch(`${this.baseUrl}/config/offline-status`);
            const offlineStatus = await response.json();
            
            if (offlineStatus.offline_data_available) {
                console.log('✅ Offline data available:', offlineStatus);
                // You could pre-load critical offline data here
            }
        } catch (error) {
            console.warn('⚠️ Could not check offline data status');
        }
    }
    
    getDefaultConfig() {
        return {
            mode: "online",
            endpoints: {
                market: { online: "/market/prices", offline: "/hybrid/market/prices" },
                weather: { online: "/weather/city", offline: "/hybrid/weather/city" },
                chat: { online: "/chat/rag", offline: "/hybrid/chat/rag" },
                crop_intelligence: { online: "/crop-intelligence/recommend", offline: "/hybrid/crop-intelligence/recommend" }
            }
        };
    }
    
    getEndpoint(service, operation = '') {
        if (!this.config) return null;
        
        const serviceConfig = this.config.endpoints[service];
        if (!serviceConfig) return null;
        
        // Determine which endpoint to use
        let endpoint;
        if (this.isOnline && serviceConfig.online) {
            endpoint = serviceConfig.online;
        } else if (serviceConfig.offline) {
            endpoint = serviceConfig.offline;
        } else if (serviceConfig.hybrid) {
            endpoint = serviceConfig.hybrid;
        } else {
            endpoint = serviceConfig.online; // fallback
        }
        
        return `${this.baseUrl}${endpoint}${operation}`;
    }
    
    async makeRequest(service, options = {}) {
        const { 
            operation = '', 
            method = 'GET', 
            data = null, 
            params = new URLSearchParams() 
        } = options;
        
        const endpoint = this.getEndpoint(service, operation);
        if (!endpoint) {
            throw new Error(`Service ${service} not configured`);
        }
        
        const url = params.toString() ? `${endpoint}?${params}` : endpoint;
        
        const requestOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            requestOptions.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, requestOptions);
            const result = await response.json();
            
            // Add metadata about the response source
            result._metadata = {
                source: result.source || (this.isOnline ? 'online' : 'offline'),
                timestamp: new Date().toISOString(),
                endpoint: url
            };
            
            return result;
        } catch (error) {
            console.error(`❌ API request failed for ${service}:`, error);
            
            // Try to return cached data if available
            if (this.offlineData.has(service)) {
                console.log(`📦 Returning cached data for ${service}`);
                return {
                    ...this.offlineData.get(service),
                    _metadata: {
                        source: 'cache',
                        timestamp: new Date().toISOString(),
                        error: error.message
                    }
                };
            }
            
            throw error;
        }
    }
    
    // Convenience methods for specific services
    async getMarketPrices(commodity = null) {
        const params = new URLSearchParams();
        if (commodity) params.append('commodity', commodity);
        
        return this.makeRequest('market', { params });
    }
    
    async getWeather(city) {
        const params = new URLSearchParams({ city });
        return this.makeRequest('weather', { params });
    }
    
    async chatWithAI(query, chatHistory = '', section = 'crops') {
        const data = {
            user_query: query,
            chat_history: chatHistory,
            section: section
        };
        
        return this.makeRequest('chat', { 
            method: 'POST', 
            data 
        });
    }
    
    async getCropRecommendations(params) {
        const searchParams = new URLSearchParams(params);
        return this.makeRequest('crop_intelligence', { params: searchParams });
    }
    
    async search(query, limit = 10) {
        const params = new URLSearchParams({ q: query, limit });
        return this.makeRequest('search', { params });
    }
    
    // Cache management
    setCachedData(service, data) {
        this.offlineData.set(service, data);
        
        // Also store in localStorage for persistence
        try {
            localStorage.setItem(`cached_${service}`, JSON.stringify(data));
        } catch (error) {
            console.warn('Could not cache data to localStorage:', error);
        }
    }
    
    getCachedData(service) {
        // Try memory cache first
        if (this.offlineData.has(service)) {
            return this.offlineData.get(service);
        }
        
        // Try localStorage
        try {
            const cached = localStorage.getItem(`cached_${service}`);
            if (cached) {
                const data = JSON.parse(cached);
                this.offlineData.set(service, data);
                return data;
            }
        } catch (error) {
            console.warn('Could not retrieve cached data:', error);
        }
        
        return null;
    }
    
    // Status methods
    isOfflineMode() {
        return !this.isOnline || this.config?.mode === 'offline';
    }
    
    getStatus() {
        return {
            isOnline: this.isOnline,
            mode: this.config?.mode || 'unknown',
            hasOfflineData: this.config?.offline_available || false,
            cachedServices: Array.from(this.offlineData.keys())
        };
    }
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = ApiManager;
} else if (typeof window !== 'undefined') {
    // Browser
    window.ApiManager = ApiManager;
}

// Usage example:
/*
const api = new ApiManager('http://localhost:8000');

// The API manager automatically handles online/offline mode
api.getWeather('Pune,IN').then(weather => {
    console.log('Weather data:', weather);
    // weather._metadata will tell you if it came from online, offline, or cache
});

api.chatWithAI('What crops should I plant?').then(response => {
    console.log('AI Response:', response);
});

// Check current status
console.log('API Status:', api.getStatus());
*/
