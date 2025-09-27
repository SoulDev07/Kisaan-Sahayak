// app.config.js
// Dynamic Expo config that reads the incoming static config and injects environment variables..

// Export a function that receives the resolved static config: ({ config }) => ExpoConfig
module.exports = ({ config }) => {
  const key = process.env.EXPO_GOOGLE_MAPS_API_KEY || '';

  return {
    ...config,
    ios: {
      ...(config.ios || {}),
      config: {
        ...(config.ios?.config || {}),
        ...(key ? { googleMapsApiKey: key } : {}),
      },
    },
    android: {
      ...(config.android || {}),
      config: {
        ...(config.android?.config || {}),
        googleMaps: {
          ...(config.android?.config?.googleMaps || {}),
          ...(key ? { apiKey: key } : {}),
        },
      },
    },
  };
};
