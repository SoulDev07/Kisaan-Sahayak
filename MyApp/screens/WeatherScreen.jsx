import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import { NetworkConfig } from '../utils/NetworkConfig';
import MicOverlay from '../components/MicOverlay';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const API_BASE = NetworkConfig.API_BASE;
const FARMER_ID = 'f001';

const WEATHER_CACHE_KEY = 'weather-cache';
const FORECAST_CACHE_KEY = 'forecast-cache';
const FARMER_PROFILE_CACHE_KEY = 'farmer-profile-cache';
const AIR_QUALITY_CACHE_KEY = 'air-quality-cache';
const WEATHER_ANALYSIS_CACHE_KEY = 'weather-ai-analysis-f001';

const WeatherScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const farmLocationRef = useRef(null);
  const farmProfileRef = useRef(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [weatherAnalysis, setWeatherAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);

  const isCustomLocation = !!searchValue.trim();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Fetch air quality data
  const fetchAirQuality = async (lat, lon) => {
    try {
      const res = await fetch(`${API_BASE}/weather/air_quality?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setAirQuality(data);
      await AsyncStorage.setItem(AIR_QUALITY_CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  };

  // Fetch or load cached AI weather analysis
  const loadWeatherAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const cached = await AsyncStorage.getItem(WEATHER_ANALYSIS_CACHE_KEY);
      if (cached) {
        setWeatherAnalysis(cached);
        setAnalysisLoading(false);
        return;
      }
      // If not cached, fetch from backend
      const res = await fetch(`${API_BASE}/weather/ai-analysis?farmer_id=${FARMER_ID}`);
      const data = await res.json();
      setWeatherAnalysis(data.analysis);
      await AsyncStorage.setItem(WEATHER_ANALYSIS_CACHE_KEY, data.analysis);
      setAnalysisLoading(false);
    } catch (e) {
      setWeatherAnalysis('Failed to load AI analysis.');
      setAnalysisLoading(false);
    }
  };

  const updateWeatherAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const res = await fetch(`${API_BASE}/weather/ai-analysis?farmer_id=${FARMER_ID}`);
      const data = await res.json();
      setWeatherAnalysis(data.analysis);
      await AsyncStorage.setItem(WEATHER_ANALYSIS_CACHE_KEY, data.analysis);
      setAnalysisLoading(false);
    } catch (e) {
      setWeatherAnalysis('Failed to update AI analysis.');
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherAnalysis();
  }, []);

  // Only fetch from cache on mount and farm restore
  useEffect(() => {
    let isMounted = true;
    const loadFromCacheAndBackground = async () => {
      setLoading(true);
      setProfileLoading(true);
      setError(null);
      // 1. Load from cache instantly
      let cachedProfile = null;
      let cachedWeather = null;
      let cachedForecast = null;
      let cachedAirQuality = null;
      try {
        cachedProfile = await AsyncStorage.getItem(FARMER_PROFILE_CACHE_KEY);
        if (cachedProfile) {
          const prof = JSON.parse(cachedProfile);
          setProfile(prof);
          farmProfileRef.current = prof;
          const { farmLocation } = prof;
          farmLocationRef.current = farmLocation;
        }
        setProfileLoading(false);
        [cachedWeather, cachedForecast, cachedAirQuality] = await Promise.all([
          AsyncStorage.getItem(WEATHER_CACHE_KEY),
          AsyncStorage.getItem(FORECAST_CACHE_KEY),
          AsyncStorage.getItem(AIR_QUALITY_CACHE_KEY),
        ]);
        if (cachedWeather) setWeather(JSON.parse(cachedWeather));
        if (cachedForecast) setForecast(JSON.parse(cachedForecast));
        if (cachedAirQuality) setAirQuality(JSON.parse(cachedAirQuality));
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load weather');
      }
      setLoading(false);

      // 2. In background, fetch latest from backend and update if changed
      try {
        // Fetch profile
        const profRes = await fetch(`${API_BASE}/farmer/${FARMER_ID}/profile`);
        const prof = await profRes.json();
        if (!isMounted) return;
        const { farmLocation } = prof;
        if (!farmLocation || !farmLocation.lat || !farmLocation.lng) return;
        // Compare and update profile if changed
        if (!cachedProfile || JSON.stringify(prof) !== cachedProfile) {
          setProfile(prof);
          farmProfileRef.current = prof;
          farmLocationRef.current = farmLocation;
          await AsyncStorage.setItem(FARMER_PROFILE_CACHE_KEY, JSON.stringify(prof));
        }
        // Fetch weather, forecast, air quality
        const [wRes, fRes] = await Promise.all([
          fetch(`${API_BASE}/weather/coords?lat=${farmLocation.lat}&lon=${farmLocation.lng}`),
          fetch(`${API_BASE}/weather/forecast/coords?lat=${farmLocation.lat}&lon=${farmLocation.lng}`),
        ]);
        const w = await wRes.json();
        const f = await fRes.json();
        await fetchAirQuality(farmLocation.lat, farmLocation.lng);

        // Compare and update weather if changed
        if (!cachedWeather || JSON.stringify(w) !== cachedWeather) {
          setWeather(w);
          await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(w));
        }
        if (!cachedForecast || JSON.stringify(f) !== cachedForecast) {
          setForecast(f);
          await AsyncStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify(f));
        }
      } catch (e) {
        // Silently ignore background errors
      }
    };
    loadFromCacheAndBackground();
    return () => { isMounted = false; };
  }, []);

  // --- Update Handler (fetches latest and updates cache) ---
  const handleUpdate = async () => {
    setLoading(true);
    setProfileLoading(true);
    setError(null);
    try {
      // Fetch profile from backend and update cache
      const profRes = await fetch(`${API_BASE}/farmer/${FARMER_ID}/profile`);
      const prof = await profRes.json();
      setProfile(prof);
      farmProfileRef.current = prof;
      const { farmLocation } = prof;
      farmLocationRef.current = farmLocation;
      await AsyncStorage.setItem(FARMER_PROFILE_CACHE_KEY, JSON.stringify(prof));
      setProfileLoading(false);
      if (!farmLocation || !farmLocation.lat || !farmLocation.lng) throw new Error('No farm location set');
      // Fetch weather, forecast, air quality and update cache
      const [wRes, fRes] = await Promise.all([
        fetch(`${API_BASE}/weather/coords?lat=${farmLocation.lat}&lon=${farmLocation.lng}`),
        fetch(`${API_BASE}/weather/forecast/coords?lat=${farmLocation.lat}&lon=${farmLocation.lng}`),
      ]);
      const w = await wRes.json();
      const f = await fRes.json();
      await fetchAirQuality(farmLocation.lat, farmLocation.lng);
      setWeather(w);
      setForecast(f);
      await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(w));
      await AsyncStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify(f));
    } catch (e) {
      setError(e.message || 'Failed to update weather');
      setProfileLoading(false);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE}/weather/city?city=${encodeURIComponent(searchValue)}`);
      const data = await res.json();
      setWeather(data);
    } catch (e) {
      setError('Failed to fetch weather for the searched city.');
    }
    setSearching(false);
  };

  // Helper: get weather icon url
  const getWeatherIcon = (icon) => `https://openweathermap.org/img/wn/${icon}@4x.png`;

  // Helper: format date
  const formatDate = (dt) => {
    const d = new Date(dt * 1000);
    return d.toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Helper: group forecast by day
  const groupForecastByDay = (list) => {
    if (!list) return [];
    const days = {};
    list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const key = date.toISOString().split('T')[0];
      if (!days[key]) days[key] = [];
      days[key].push(item);
    });
    return Object.values(days).slice(0, 5); // 5 days
  };

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.colors.statusBarStyle} backgroundColor={theme.colors.background} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface, theme.colors.background]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>  
        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 0 }}>
          <TextInput
            style={{ flex: 1, backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, color: theme.colors.text, fontSize: 15, borderWidth: 1, borderColor: theme.colors.border, marginRight: 8 }}
            placeholder={t('weather.search_placeholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={searchValue}
            onChangeText={setSearchValue}
            editable={!searching && !loading}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch} disabled={searching || loading} style={{ backgroundColor: theme.colors.info, borderRadius: 10, padding: 12, opacity: searching || loading ? 0.6 : 1 }}>
            <Ionicons name="search" size={22} color={theme.colors.onPrimary} />
          </TouchableOpacity>
          {isCustomLocation && (
            <TouchableOpacity onPress={handleBackToFarm} style={{ backgroundColor: theme.colors.primary, borderRadius: 10, padding: 12, marginLeft: 8 }}>
              <Ionicons name="home" size={22} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          )}
          {!isCustomLocation && (
            <TouchableOpacity onPress={handleUpdate} disabled={loading} style={{ backgroundColor: theme.colors.card, borderRadius: 10, padding: 12, marginLeft: 8, opacity: loading ? 0.6 : 1, borderWidth: 1, borderColor: theme.colors.border }}>
              <Ionicons name="refresh" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>  
          <BlurView intensity={20} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <LinearGradient
                  colors={[theme.colors.card, theme.colors.surface]}
                  style={styles.backButtonGradient}
                >
                  <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <View style={styles.headerTitleContainer}>
                  <Ionicons name="cloudy-night" size={20} color={theme.colors.info} />
                  <Text style={styles.headerTitle}>{t('weather.title')}</Text>
                </View>
                <Text style={styles.headerSubtitle}>{t('weather.subtitle')}</Text>
              </View>
              <View style={styles.syncIndicator}>
                <Animated.View style={[styles.syncDot, { transform: [{ scale: fadeAnim }] }]} />
                <Text style={styles.syncText}>{t('weather.live')}</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>
        {/* AI Weather Analysis Section (above weather card) */}
        <View style={{
          backgroundColor: theme.colors.card,
          borderRadius: 16,
          padding: 16,
          marginHorizontal: 16,
          marginTop: 4,
          marginBottom: 0,
          borderWidth: 1,
          borderColor: theme.colors.border,
          elevation: 10,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons name="robot-excited" size={22} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 17 }}>{t('weather.ai_insights_title')}</Text>
            <TouchableOpacity onPress={updateWeatherAnalysis} style={{ marginLeft: 12, backgroundColor: theme.colors.info, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>{t('weather.update_analysis')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 250 }}>
            {analysisLoading ? (
              <Text style={{ color: theme.colors.text }}>{t('weather.loading_analysis')}</Text>
            ) : (
              (() => {
                const lines = weatherAnalysis.split(/\n|\r/).filter(l => l.trim() !== '');
                const previewLines = lines.slice(0, 4);
                const isLong = lines.length > 4;
                return (
                  <>
                    <Markdown style={{ body: { color: theme.colors.text, fontSize: 15} }}>
                      {showFullAnalysis ? weatherAnalysis : previewLines.join('\n')}
                    </Markdown>
                    {isLong && (
                      <TouchableOpacity onPress={() => setShowFullAnalysis(v => !v)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                        <Text style={{ color: theme.colors.info, fontWeight: 'bold' }}>{showFullAnalysis ? t('weather.show_less') : t('weather.show_more')}</Text>
                      </TouchableOpacity>
                    )}
                  </>
                );
              })()
            )}
          </ScrollView>
        </View>
        {/* Main Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {(loading && !weather && !forecast) ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
              <ActivityIndicator size="large" color={theme.colors.info} />
              <Text style={{ color: theme.colors.text, marginTop: 16 }}>{t('weather.loading')}</Text>
            </View>
          ) : error ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
              <Text style={{ color: theme.colors.danger }}>{t('weather.error')}</Text>
            </View>
          ) : (
            <>
              {/* Current Weather Card */}
              <Animated.View style={[styles.weatherCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>  
                <LinearGradient colors={[theme.colors.card, theme.colors.surface]} style={styles.weatherCardGradient}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {weather?.weather && weather.weather[0] && (
                      <Image source={{ uri: getWeatherIcon(weather.weather[0].icon) }} style={styles.weatherIcon} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.weatherMain}>{weather?.weather?.[0]?.main ? t(`weather.${weather.weather[0].main.toLowerCase()}`) : '--'}</Text>
                      <Text style={styles.weatherDesc}>{weather?.weather?.[0]?.description ? t(`weather.${weather.weather[0].description.toLowerCase().replace(/ /g, '_')}`) : ''}</Text>
                      <Text style={styles.weatherTemp}>{Math.round(weather?.main?.temp || 0)}°C</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.weatherLabel}>{t('weather.humidity')}</Text>
                      <Text style={styles.weatherValue}>{weather?.main?.humidity}%</Text>
                      <Text style={styles.weatherLabel}>{t('weather.wind')}</Text>
                      <Text style={styles.weatherValue}>{weather?.wind?.speed} m/s</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' }}>
                    <Text style={styles.weatherLocation}>{profile?.village || t('weather.your_farm')}</Text>
                    <Text style={styles.weatherLocation}>{profile?.farmLocation ? `${profile.farmLocation.lat?.toFixed(3)}, ${profile.farmLocation.lng?.toFixed(3)}` : ''}</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
              {/* Forecast Section */}
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="weather-partly-cloudy" size={22} color={theme.colors.info} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>{t('weather.5_day_forecast')}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                {forecast && forecast.list && groupForecastByDay(forecast.list).map((day, idx) => {
                  // Pick the midday forecast for icon/temp
                  const midday = day[Math.floor(day.length / 2)];
                  return (
                    <LinearGradient key={idx} colors={[theme.colors.card, theme.colors.surface]} style={styles.forecastCard}>
                      <Text style={styles.forecastDate}>{formatDate(midday.dt)}</Text>
                      <Image source={{ uri: getWeatherIcon(midday.weather[0].icon) }} style={styles.forecastIcon} />
                      <Text style={styles.forecastTemp}>{Math.round(midday.main.temp)}°C</Text>
                      <Text style={styles.forecastDesc}>{midday.weather[0].main}</Text>
                      <Text style={styles.forecastLabel}>{t('weather.rain')}</Text>
                      <Text style={styles.forecastValue}>{midday.rain?.['3h'] ? `${midday.rain['3h']} mm` : '0 mm'}</Text>
                    </LinearGradient>
                  );
                })}
              </ScrollView>
              {/* --- Air Quality Section --- */}
              {airQuality && airQuality.list && airQuality.list[0] && (
                <View style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.border }}>
                  <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{t('weather.air_quality')}</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 13 }}>{t('weather.aqi')}: {airQuality.list[0].main.aqi}</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 13 }}>{t('weather.co')}: {airQuality.list[0].components.co} | {t('weather.no2')}: {airQuality.list[0].components.no2} | {t('weather.o3')}: {airQuality.list[0].components.o3}</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 13 }}>{t('weather.pm25')}: {airQuality.list[0].components.pm2_5} | {t('weather.pm10')}: {airQuality.list[0].components.pm10}</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      
      {/* Mic Overlay - UI only for now */}
      <MicOverlay 
        onPress={() => {
          // For now, just navigate to LiveVoiceScreen
          navigation.navigate('LiveVoiceScreen');
        }}
        isVisible={true}
        isActive={false}
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  headerBlur: { borderRadius: 20, overflow: 'hidden' },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  backButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: theme.colors.text, fontSize: 25, fontWeight: '700' },
  headerSubtitle: { color: theme.colors.textSecondary, fontSize: 15, marginTop: 2 },
  syncIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: theme.colors.overlay, borderRadius: 12 },
  syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.info },
  syncText: { color: theme.colors.info, fontSize: 10, fontWeight: '600' },
  weatherCard: { margin: 16, borderRadius: 20, elevation: 8 },
  weatherCardGradient: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.colors.border },
  weatherIcon: { width: 80, height: 80, marginRight: 16 },
  weatherMain: { color: theme.colors.text, fontSize: 22, fontWeight: 'bold' },
  weatherDesc: { color: theme.colors.info, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  weatherTemp: { color: theme.colors.primary, fontSize: 38, fontWeight: '900', marginTop: 2 },
  weatherLabel: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 },
  weatherValue: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  weatherLocation: { color: theme.colors.textSecondary, fontSize: 13 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 18, marginBottom: 8 },
  sectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: 'bold' },
  forecastCard: { width: 120, borderRadius: 16, marginHorizontal: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  forecastDate: { color: theme.colors.text, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  forecastIcon: { width: 48, height: 48, marginBottom: 4 },
  forecastTemp: { color: theme.colors.primary, fontSize: 22, fontWeight: 'bold' },
  forecastDesc: { color: theme.colors.info, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  forecastLabel: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  forecastValue: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
});

export default WeatherScreen; 