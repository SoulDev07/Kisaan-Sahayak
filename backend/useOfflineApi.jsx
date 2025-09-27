/**
 * React Hook for Offline/Online API Management
 * Provides easy integration with React components
 */

import { useState, useEffect, useCallback } from 'react';

// Assuming you have the ApiManager class available
// import ApiManager from './frontend_api_manager.js';

export const useOfflineApi = (baseUrl = 'http://localhost:8000') => {
    const [apiManager, setApiManager] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize API manager
    useEffect(() => {
        const initApiManager = async () => {
            try {
                setLoading(true);
                const manager = new ApiManager(baseUrl);
                await manager.init();
                setApiManager(manager);
                setConfig(manager.config);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Failed to initialize API manager:', err);
            } finally {
                setLoading(false);
            }
        };

        initApiManager();
    }, [baseUrl]);

    // Listen for online/offline events
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // API methods
    const getMarketPrices = useCallback(async (commodity = null) => {
        if (!apiManager) throw new Error('API manager not initialized');
        return apiManager.getMarketPrices(commodity);
    }, [apiManager]);

    const getWeather = useCallback(async (city) => {
        if (!apiManager) throw new Error('API manager not initialized');
        return apiManager.getWeather(city);
    }, [apiManager]);

    const chatWithAI = useCallback(async (query, chatHistory = '', section = 'crops') => {
        if (!apiManager) throw new Error('API manager not initialized');
        return apiManager.chatWithAI(query, chatHistory, section);
    }, [apiManager]);

    const getCropRecommendations = useCallback(async (params) => {
        if (!apiManager) throw new Error('API manager not initialized');
        return apiManager.getCropRecommendations(params);
    }, [apiManager]);

    const search = useCallback(async (query, limit = 10) => {
        if (!apiManager) throw new Error('API manager not initialized');
        return apiManager.search(query, limit);
    }, [apiManager]);

    const getStatus = useCallback(() => {
        if (!apiManager) return { isOnline, mode: 'unknown' };
        return apiManager.getStatus();
    }, [apiManager, isOnline]);

    return {
        // State
        loading,
        error,
        isOnline,
        config,
        
        // API methods
        getMarketPrices,
        getWeather,
        chatWithAI,
        getCropRecommendations,
        search,
        getStatus,
        
        // Utils
        isOfflineMode: () => apiManager?.isOfflineMode() || false,
        getCachedData: (service) => apiManager?.getCachedData(service),
        setCachedData: (service, data) => apiManager?.setCachedData(service, data)
    };
};

// Example usage component
export const WeatherComponent = ({ city }) => {
    const { getWeather, isOnline, loading } = useOfflineApi();
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);

    useEffect(() => {
        const fetchWeather = async () => {
            if (!city) return;
            
            try {
                setWeatherLoading(true);
                const weatherData = await getWeather(city);
                setWeather(weatherData);
            } catch (err) {
                console.error('Failed to fetch weather:', err);
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchWeather();
    }, [city, getWeather]);

    if (loading) return <div>Initializing...</div>;
    if (weatherLoading) return <div>Loading weather...</div>;

    return (
        <div className="weather-component">
            <div className="status-indicator">
                {isOnline ? '🟢 Online' : '🔴 Offline'}
                {weather?._metadata && (
                    <span className="data-source">
                        (Data from: {weather._metadata.source})
                    </span>
                )}
            </div>
            
            {weather && (
                <div className="weather-data">
                    <h3>Weather for {city}</h3>
                    <p>Temperature: {weather.data?.temperature || weather.temperature}°C</p>
                    <p>Humidity: {weather.data?.humidity || weather.humidity}%</p>
                    <p>Description: {weather.data?.description || weather.description}</p>
                </div>
            )}
        </div>
    );
};

// Chat component example
export const ChatComponent = () => {
    const { chatWithAI, isOnline, loading } = useOfflineApi();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { type: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            setChatLoading(true);
            const chatHistory = messages.map(m => `${m.type}: ${m.content}`).join('\n');
            const response = await chatWithAI(input, chatHistory);
            
            const aiMessage = {
                type: 'ai',
                content: response.response || response.data,
                timestamp: new Date(),
                source: response._metadata?.source || 'unknown'
            };
            
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error('Chat failed:', err);
            const errorMessage = {
                type: 'error',
                content: 'Sorry, I could not process your message at this time.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) return <div>Initializing chat...</div>;

    return (
        <div className="chat-component">
            <div className="status-bar">
                {isOnline ? '🟢 Online Chat' : '🔴 Offline Chat'}
            </div>
            
            <div className="messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        <div className="content">{message.content}</div>
                        {message.source && (
                            <div className="source">Source: {message.source}</div>
                        )}
                    </div>
                ))}
                
                {chatLoading && <div className="loading">AI is thinking...</div>}
            </div>
            
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about farming..."
                    disabled={chatLoading}
                />
                <button onClick={sendMessage} disabled={chatLoading || !input.trim()}>
                    Send
                </button>
            </div>
        </div>
    );
};
