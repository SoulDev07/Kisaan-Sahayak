// Network configuration and debugging utilities for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NetworkConfig = {
  // Primary API base URL
  API_BASE: 'http://10.100.155.236:8000',
  MODE: 'online', // 'online' or 'offline'

  // Alternative URLs to try
  FALLBACK_URLS: [
    'http://10.123.4.245:8000', // Primary
    'http://10.215.221.37:8000', // Alternative backend
    'http://192.168.0.111:8000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://10.0.2.2:8000', // Android emulator
  ],

  // Network timeout settings
  TIMEOUT: 30000, // 30 seconds

  // Test network connectivity
  testConnection: async () => {
    const results = [];

    for (const url of NetworkConfig.FALLBACK_URLS) {
      try {
        console.log(`Testing connection to: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${url}/`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          results.push({ url, status: 'success', data });
          console.log(`✅ Connection successful to: ${url}`);
        } else {
          results.push({ url, status: 'error', error: `HTTP ${response.status}` });
          console.log(`❌ HTTP error ${response.status} for: ${url}`);
        }
      } catch (error) {
        results.push({ url, status: 'error', error: error.message });
        console.log(`❌ Connection failed to: ${url} - ${error.message}`);
      }
    }

    return results;
  },

  // Get the best working URL
  getBestUrl: async () => {
    const results = await NetworkConfig.testConnection();
    const workingUrl = results.find((r) => r.status === 'success');

    if (workingUrl) {
      console.log(`Using working URL: ${workingUrl.url}`);
      return workingUrl.url;
    }

    console.error('No working URLs found!');
    throw new Error('Cannot connect to backend server');
  },

  // Enhanced fetch with better error handling
  safeFetch: async (endpoint, options = {}) => {
    // Check if endpoint is already a full URL
    const url = endpoint.startsWith('http') ? endpoint : `${NetworkConfig.API_BASE}${endpoint}`;

    // For FormData, don't set default headers - let the browser handle it
    const isFormData = options.body instanceof FormData;

    const defaultOptions = {
      timeout: NetworkConfig.TIMEOUT,
      headers: isFormData
        ? {}
        : {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
    };

    // Merge options, but preserve user headers
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    // Add timeout support
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);

    try {
      console.log(`Making request to: ${url}`);

      const response = await fetch(url, {
        ...mergedOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }

      console.error(`Network request failed for ${url}:`, error);
      throw error;
    }
  },

  setMode: async (mode) => {
    if (mode === 'offline') {
      NetworkConfig.API_BASE = 'http://10.123.4.245:8000/hybrid'; // or your offline/hybrid endpoint
      NetworkConfig.MODE = 'offline';
      await AsyncStorage.setItem('api_mode', 'offline');
    } else {
      NetworkConfig.API_BASE = 'http://10.123.4.245:8000';
      NetworkConfig.MODE = 'online';
      await AsyncStorage.setItem('api_mode', 'online');
    }
  },
  getMode: async () => {
    return (await AsyncStorage.getItem('api_mode')) || 'online';
  },
};

export default NetworkConfig;
