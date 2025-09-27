import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import CropCycleService from '../../services/CropCycleService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const MarketStrategyScreen = ({ route }) => {
  const { selectedCrop, landSize } = route.params || { selectedCrop: 'Rice', landSize: '5' };
  
  const [currentView, setCurrentView] = useState('pricing');
  const [loading, setLoading] = useState(true);
  const [marketInsights, setMarketInsights] = useState(null);
  const [mandiInfo, setMandiInfo] = useState([]);

  useEffect(() => {
    const loadCache = async () => {
      setLoading(true);
      try {
        const cached = await AsyncStorage.getItem('cropcycle_dashboard_data');
        if (cached) {
          const data = JSON.parse(cached);
          setMarketInsights({
            insights: data.insights || [],
            // You can add more fields if backend provides
          });
          setMandiInfo(data.mandi || []);
        }
      } catch (e) {}
      setLoading(false);
    };
    loadCache();
  }, [selectedCrop]);

  const handlePhoneCall = async (phoneNumber) => {
    try {
      const callData = await CropCycleService.initiateCall(phoneNumber);
      const phoneUrl = callData.call_url;
      
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Phone app is not available on this device');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      Alert.alert('Error', 'Failed to initiate call');
    }
  };

  const renderPricingAnalysis = () => {
    if (!marketInsights) return null;

    return (
      <View style={styles.analysisContainer}>
        <View style={styles.priceCard}>
          <Text style={styles.cardTitle}>Market Price Analysis</Text>
          <View style={styles.priceGrid}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Current Price</Text>
              <Text style={styles.currentPrice}>₹{marketInsights.current_price || '2,200'}/quintal</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Predicted Price</Text>
              <Text style={styles.predictedPrice}>₹{marketInsights.predicted_price || '2,450'}/quintal</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Best Season</Text>
              <Text style={styles.seasonText}>{marketInsights.best_season || 'Kharif'}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Market Trend</Text>
              <Text style={styles.trendText}>{marketInsights.trend || 'Upward'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.insightsCard}>
          <Text style={styles.cardTitle}>Market Insights</Text>
          <Text style={styles.insightsText}>
            {marketInsights.insights || 
            `Based on current market conditions and seasonal trends, ${selectedCrop} prices are expected to rise by 10-15% in the coming months. Consider storing your produce for better returns.`}
          </Text>
        </View>

        <View style={styles.recommendationsCard}>
          <Text style={styles.cardTitle}>Selling Recommendations</Text>
          <Text style={styles.recommendationsText}>
            {marketInsights.recommendations || 
            `1. Wait for peak season pricing (${marketInsights.best_season || 'Peak season'})
2. Focus on quality grading for premium prices
3. Consider direct buyer contracts
4. Monitor weekly price trends`}
          </Text>
        </View>
      </View>
    );
  };

  const renderMandiInfo = () => {
    return (
      <View style={styles.mandiContainer}>
        <Text style={styles.sectionTitle}>Best Mandi Options</Text>
        {mandiInfo.length > 0 ? (
          mandiInfo.map((mandi, index) => (
            <View key={index} style={styles.mandiCard}>
              <View style={styles.mandiHeader}>
                <Text style={styles.mandiName}>{mandi.name || `${selectedCrop} Mandi ${index + 1}`}</Text>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>{mandi.distance || '45 km'}</Text>
                </View>
              </View>
              
              <View style={styles.mandiDetails}>
                <View style={styles.mandiRow}>
                  <Text style={styles.mandiLabel}>Current Rate:</Text>
                  <Text style={styles.mandiValue}>₹{mandi.current_rate || '2,200'}/quintal</Text>
                </View>
                <View style={styles.mandiRow}>
                  <Text style={styles.mandiLabel}>Commission:</Text>
                  <Text style={styles.mandiValue}>{mandi.commission || '2.5%'}</Text>
                </View>
                <View style={styles.mandiRow}>
                  <Text style={styles.mandiLabel}>Transport Cost:</Text>
                  <Text style={styles.mandiValue}>₹{mandi.transport_cost || '150'}/quintal</Text>
                </View>
                <View style={styles.mandiRow}>
                  <Text style={styles.mandiLabel}>Best Time:</Text>
                  <Text style={styles.mandiValue}>{mandi.best_time || 'Morning 6-10 AM'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.contactMandiButton}
                onPress={() => handlePhoneCall(mandi.contact || '+91 9876543210')}
              >
                <Text style={styles.contactMandiText}>📞 Contact Mandi - {mandi.contact || '+91 9876543210'}</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No mandi information available.</Text>
          </View>
        )}
      </View>
    );
  };

  const renderQualityTips = () => {
    return (
      <View style={styles.qualityContainer}>
        <Text style={styles.sectionTitle}>Quality Enhancement Tips</Text>
        
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>🌾 Pre-Harvest</Text>
          <Text style={styles.tipText}>
            • Monitor moisture content regularly
            • Ensure proper field drainage
            • Time harvesting for optimal maturity
            • Avoid harvesting during rain
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>📦 Post-Harvest</Text>
          <Text style={styles.tipText}>
            • Clean and dry to 12-14% moisture
            • Remove foreign matter and damaged grains
            • Store in proper ventilated containers
            • Use fumigation if storing long-term
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💰 Value Addition</Text>
          <Text style={styles.tipText}>
            • Get quality certification
            • Brand your produce with origin
            • Consider organic certification
            • Direct marketing to premium buyers
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Analyzing market strategy...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Market Strategy</Text>
          <Text style={styles.subtitle}>Maximize profits for your {selectedCrop} crop</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentView === 'pricing' && styles.activeTab]}
            onPress={() => setCurrentView('pricing')}
          >
            <Text style={[styles.tabText, currentView === 'pricing' && styles.activeTabText]}>
              Pricing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentView === 'mandi' && styles.activeTab]}
            onPress={() => setCurrentView('mandi')}
          >
            <Text style={[styles.tabText, currentView === 'mandi' && styles.activeTabText]}>
              Mandis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentView === 'quality' && styles.activeTab]}
            onPress={() => setCurrentView('quality')}
          >
            <Text style={[styles.tabText, currentView === 'quality' && styles.activeTabText]}>
              Quality
            </Text>
          </TouchableOpacity>
        </View>

        {currentView === 'pricing' && renderPricingAnalysis()}
        {currentView === 'mandi' && renderMandiInfo()}
        {currentView === 'quality' && renderQualityTips()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101613' },
  scrollContainer: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2196F3', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#aaa' },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },

  tabContainer: { 
    flexDirection: 'row', 
    marginBottom: 20, 
    backgroundColor: '#181818', 
    borderRadius: 12, 
    padding: 4 
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#2196F3' },
  tabText: { color: '#aaa', fontWeight: '600', fontSize: 14 },
  activeTabText: { color: '#fff' },

  sectionTitle: { fontSize: 20, color: '#2196F3', fontWeight: 'bold', marginBottom: 15 },

  // Pricing Analysis Styles
  analysisContainer: { marginBottom: 20 },
  priceCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  priceItem: {
    width: '48%',
    marginBottom: 10,
  },
  priceLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  currentPrice: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: 'bold',
  },
  predictedPrice: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seasonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: 'bold',
  },

  insightsCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  insightsText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },

  recommendationsCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  recommendationsText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },

  // Mandi Info Styles
  mandiContainer: { marginBottom: 20 },
  mandiCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  mandiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  mandiName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mandiDetails: { marginBottom: 15 },
  mandiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mandiLabel: { color: '#aaa', fontSize: 14 },
  mandiValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  contactMandiButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactMandiText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Quality Tips Styles
  qualityContainer: { marginBottom: 20 },
  tipCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  tipTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },

  noDataContainer: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MarketStrategyScreen;
