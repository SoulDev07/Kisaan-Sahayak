import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  TextInput,
  Animated,
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { NetworkConfig } from '../utils/NetworkConfig';
import { useTheme } from '../context/ThemeContext';


const API_BASE = NetworkConfig.API_BASE;
const MARKET_CACHE_KEY = 'market-prices-cache';

const AnimatedListItem = ({ children, index }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
      {children}
    </Animated.View>
  );
};

const NewMarketPricesScreen = ({ navigation, embedded = false }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [marketData, setMarketData] = useState([]);
  const [error, setError] = useState(null);
  const [searchCommodity, setSearchCommodity] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // --- Data Processing ---
  const processAndFilterPrices = (records) => {
    if (!records || records.length === 0) {
      return [];
    }
    const latestPrices = new Map();
    
    records.forEach(item => {
      const key = `${item.Market}-${item.Commodity}-${item.Variety}`;
      // Date format is DD/MM/YYYY, need to parse carefully
      const dateParts = item.Arrival_Date.split('/');
      const arrivalDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);

      const existingEntry = latestPrices.get(key);
      if (!existingEntry || arrivalDate > existingEntry.arrivalDate) {
        latestPrices.set(key, { ...item, arrivalDate });
      }
    });

    return Array.from(latestPrices.values());
  };

  // --- API Fetching ---
  const fetchMarketPrices = async (state, commodity, district) => {
    let url = `${API_BASE}/market/prices?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}`;
    if (district) {
      url += `&district=${encodeURIComponent(district)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || `Failed for ${commodity}`);
    }
    return response.json();
  };

  const fetchTopCommodities = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    if (!forceRefresh) {
        try {
            const cachedData = await AsyncStorage.getItem(MARKET_CACHE_KEY);
            if (cachedData) {
                setMarketData(JSON.parse(cachedData));
                setLoading(false);
                return; // Exit if we have cached data
            }
        } catch (e) {
            console.error("Failed to load from cache", e);
        }
    }

    const topCommodities = ['Wheat', 'Paddy(Dhan)', 'Cotton', 'Soyabean', 'Gram', 'Maize'];
    try {
      const allPromises = topCommodities.map(commodity =>
        fetchMarketPrices(null, commodity, null) // Fetch without state and district
      );
      const results = await Promise.allSettled(allPromises);
      const successfulResults = results
        .filter(p => p.status === 'fulfilled')
        .flatMap(p => p.value);
      
      const processedData = processAndFilterPrices(successfulResults);
      setMarketData(processedData);
      await AsyncStorage.setItem(MARKET_CACHE_KEY, JSON.stringify(processedData));

    } catch (e) {
      setError(e.message || 'An error occurred fetching top commodities.');
      setMarketData([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchCommodity.trim()) {
      // If no commodity is entered, fetch top commodities (like refresh)
      await fetchTopCommodities(true);
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
        const results = await fetchMarketPrices(null, searchCommodity, null); // Fetch without state and district
        const processedData = processAndFilterPrices(results);
        setMarketData(processedData);
    } catch(e) {
        setError(e.message);
        setMarketData([]);
    } finally {
        setIsSearching(false);
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/market/prices`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Failed to fetch market prices.');
        }
        const result = await response.json();
        setMarketData(result);
      } catch (e) {
        setError(e.message || 'An error occurred.');
        setMarketData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // Filter by commodity if searchCommodity is set
  const filteredData = !searchCommodity.trim() ? marketData : marketData.filter(item => (item.Commodity || item.commodity || '').toLowerCase().includes(searchCommodity.toLowerCase()));

  const renderMarketItem = (item, index) => {
    const minPrice = parseFloat(item.Min_Price) || 0;
    const maxPrice = parseFloat(item.Max_Price) || 0;
    const modalPrice = parseFloat(item.Modal_Price) || 0;
    const key = `${item.Arrival_Date}-${item.Market}-${item.Variety}-${index}`;
    return (
      <AnimatedListItem index={index} key={key}>
        <View style={styles.marketCard}>
          <LinearGradient colors={[theme.colors.surface, theme.colors.surface]} style={styles.marketCardGradient}>
            <View style={styles.marketHeader}>
              <View style={styles.marketInfo}>
                <Text style={styles.cropEmoji}>🌾</Text>
                <View>
                  <Text style={styles.cropName}>{item.Commodity}</Text>
                  <Text style={styles.volume}>{t('marketprices.market')}: {item.Market}</Text>
                </View>
              </View>
              <View style={styles.priceInfo}>
                <Text style={styles.price}>₹{modalPrice.toFixed(2)}</Text>
                <Text style={styles.volume}>{t('marketprices.per_quintal')}</Text>
              </View>
            </View>
            <View style={styles.marketStats}>
              <View style={styles.statItem}><Text style={styles.statLabel}>{t('marketprices.variety')}</Text><Text style={styles.statValue}>{item.Variety}</Text></View>
              <View style={styles.statItem}><Text style={styles.statLabel}>{t('marketprices.min_price')}</Text><Text style={styles.statValue}>₹{minPrice.toFixed(2)}</Text></View>
              <View style={styles.statItem}><Text style={styles.statLabel}>{t('marketprices.max_price')}</Text><Text style={styles.statValue}>₹{maxPrice.toFixed(2)}</Text></View>
            </View>
          </LinearGradient>
        </View>
      </AnimatedListItem>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {!embedded && <StatusBar barStyle={theme.colors.statusBarStyle || 'light-content'} />}
      {!embedded && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.headerTint || theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('marketprices.title')}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => fetchTopCommodities(true)} disabled={loading}>
              <Ionicons name="refresh" size={24} color={loading ? theme.colors.textSecondary : theme.colors.headerTint || theme.colors.text} />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingTop: embedded ? 0 : 32, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <TextInput style={styles.searchInput} value={searchCommodity} onChangeText={setSearchCommodity} placeholder={t('market.placeholder_commodity', 'Commodity')} placeholderTextColor={theme.colors.textSecondary} />
          </View>
          <TouchableOpacity style={[styles.searchButton, isSearching && styles.disabledButton]} onPress={handleSearch} disabled={isSearching}>
            {isSearching ? <ActivityIndicator color={theme.colors.background} /> : <Text style={styles.searchButtonText}>Search Prices</Text>}
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {loading ? (
             <ActivityIndicator color={theme.colors.text} style={{ marginTop: 40 }} size="large" />
          ) : filteredData.length > 0 ? (
            filteredData.map((item, index) => renderMarketItem(item, index))
          ) : (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                No market data found. Try refreshing or searching.
                </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 62, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom:10 },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.card},
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
    refreshButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    scrollView: { flex: 1, paddingHorizontal: 16 },
    section: { marginBottom: 24 },
    searchContainer: { flexDirection: 'column', marginBottom: 16, gap: 12 },
    searchInput: { backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
    searchButton: { paddingVertical: 14, backgroundColor: theme.colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    searchButtonText: { color: theme.colors.background, fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: theme.colors.card },
    errorText: { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 12, fontSize: 14 },
    marketCard: { borderRadius: 16, marginBottom: 12, overflow: 'hidden', backgroundColor: theme.colors.surface},
    marketCardGradient: { padding: 16, borderWidth: 1, borderColor: theme.colors.border },
    marketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    marketInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
    cropEmoji: { fontSize: 28, marginRight: 12 },
    cropName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    volume: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    priceInfo: { alignItems: 'flex-end' },
    price: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
    marketStats: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
    statItem: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
    statValue: { fontSize: 14, fontWeight: '500', color: theme.colors.text },
    emptyContainer: { marginTop: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    emptyText: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 16, lineHeight: 24 },
  });
  
export default NewMarketPricesScreen; 