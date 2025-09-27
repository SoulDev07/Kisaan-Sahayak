// API service for Voice Command integration
import { NetworkConfig } from '../utils/NetworkConfig';

const API_BASE = NetworkConfig.API_BASE;

export const VoiceCommandAPI = {
  // Process voice command with audio file
  processVoiceCommand: async (audioUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      });

      const response = await fetch(`${API_BASE}/voice-command/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Voice command API error:', error);
      throw error;
    }
  },

  // Test transcription only
  transcribeAudio: async (audioUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      });

      const response = await fetch(`${API_BASE}/speech-to-text/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Transcription API error:', error);
      throw error;
    }
  },

  // Send text query to RAG chat
  sendChatQuery: async (query, chatHistory = '', section = 'crops') => {
    try {
      const response = await fetch(`${API_BASE}/chat/rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_query: query,
          chat_history: chatHistory,
          section: section,
          top_k: 3
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  },

  // Get farmer data
  getFarmerData: async (farmerId) => {
    try {
      const response = await fetch(`${API_BASE}/farmer/${farmerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Farmer data API error:', error);
      throw error;
    }
  },

  // Get weather data
  getWeatherData: async (city = 'Pune,IN') => {
    try {
      const response = await fetch(`${API_BASE}/weather/city?city=${encodeURIComponent(city)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Weather API error:', error);
      throw error;
    }
  },

  // Get soil moisture data
  getSoilMoistureData: async () => {
    try {
      const response = await fetch(`${API_BASE}/soil-moisture`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Soil moisture API error:', error);
      throw error;
    }
  },

  // Get market prices
  getMarketPrices: async () => {
    try {
      const response = await fetch(`${API_BASE}/market/prices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Market prices API error:', error);
      throw error;
    }
  }
};

export default VoiceCommandAPI;
