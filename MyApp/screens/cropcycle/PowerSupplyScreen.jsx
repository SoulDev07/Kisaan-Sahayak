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

const PowerSupplyScreen = ({ route }) => {
  const { selectedCrop, landSize } = route.params || { selectedCrop: 'Rice', landSize: '5' };
  
  const [currentView, setCurrentView] = useState('solar');
  const [loading, setLoading] = useState(true);
  const [solarSchemes, setSolarSchemes] = useState([]);
  const [cropAnalysis, setCropAnalysis] = useState(null);

  useEffect(() => {
    const loadCache = async () => {
      setLoading(true);
      try {
        const cached = await AsyncStorage.getItem('cropcycle_dashboard_data');
        if (cached) {
          const data = JSON.parse(cached);
          setSolarSchemes(data.solar || []);
          setCropAnalysis(data.analysis || null);
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

  const renderSolarSchemeCard = (scheme, index) => (
    <View key={index} style={styles.schemeCard}>
      <View style={styles.schemeHeader}>
        <View style={styles.schemeInfo}>
          <Text style={styles.schemeName}>{scheme.name}</Text>
          <Text style={styles.schemeProvider}>{scheme.provider}</Text>
        </View>
        <View style={styles.subsidyBadge}>
          <Text style={styles.subsidyText}>{scheme.subsidy}</Text>
        </View>
      </View>

      <View style={styles.schemeDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>System Size:</Text>
          <Text style={styles.detailValue}>{scheme.system_size}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cost:</Text>
          <Text style={styles.detailValue}>{scheme.cost}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Annual Savings:</Text>
          <Text style={styles.detailValue}>{scheme.annual_savings}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payback Period:</Text>
          <Text style={styles.detailValue}>{scheme.payback_period}</Text>
        </View>
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        <Text style={styles.benefitsText}>{scheme.benefits}</Text>
      </View>

      <View style={styles.eligibilitySection}>
        <Text style={styles.sectionTitle}>Eligibility</Text>
        <Text style={styles.eligibilityText}>{scheme.eligibility}</Text>
      </View>

      <TouchableOpacity 
        style={styles.applyButton}
        onPress={() => handlePhoneCall(scheme.contact?.split(': ')[1] || scheme.contact)}
      >
        <Text style={styles.applyButtonText}>📞 Apply Now - {scheme.contact}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPowerAnalysis = () => {
    if (!cropAnalysis) return null;

    const powerCost = cropAnalysis.power_cost || 15000;
    const solarSavings = Math.round(powerCost * 0.7);
    const systemSize = Math.round(parseInt(landSize) * 2) + 'kW';

    return (
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Power Analysis for {selectedCrop}</Text>
        <View style={styles.analysisGrid}>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Current Power Cost</Text>
            <Text style={styles.currentCost}>₹{powerCost.toLocaleString()}/year</Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Solar Savings</Text>
            <Text style={styles.savingsValue}>₹{solarSavings.toLocaleString()}/year</Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Recommended Size</Text>
            <Text style={styles.systemValue}>{systemSize}</Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>ROI Period</Text>
            <Text style={styles.roiValue}>4-5 years</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTraditionaOptions = () => {
    return (
      <View style={styles.traditionalContainer}>
        <Text style={styles.sectionTitle}>Traditional Power Options</Text>
        
        <View style={styles.optionCard}>
          <Text style={styles.optionTitle}>🔌 Grid Connection</Text>
          <View style={styles.optionDetails}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Monthly Cost:</Text>
              <Text style={styles.optionValue}>₹1,200 - ₹2,500</Text>
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Reliability:</Text>
              <Text style={styles.optionValue}>Medium (6-8 hrs/day)</Text>
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Best For:</Text>
              <Text style={styles.optionValue}>Small farms</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.inquireButton}
            onPress={() => handlePhoneCall('+91 1912345678')}
          >
            <Text style={styles.inquireButtonText}>📞 Contact DISCOM - +91 1912345678</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionCard}>
          <Text style={styles.optionTitle}>⛽ Diesel Generator</Text>
          <View style={styles.optionDetails}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Fuel Cost:</Text>
              <Text style={styles.optionValue}>₹2,000 - ₹4,000/month</Text>
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Reliability:</Text>
              <Text style={styles.optionValue}>High (24/7 available)</Text>
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Best For:</Text>
              <Text style={styles.optionValue}>Emergency backup</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.inquireButton}
            onPress={() => handlePhoneCall('+91 9876543210')}
          >
            <Text style={styles.inquireButtonText}>📞 Generator Dealers - +91 9876543210</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionCard}>
          <Text style={styles.optionTitle}>🔋 Battery Storage</Text>
          <View style={styles.optionDetails}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Setup Cost:</Text>
              <Text style={styles.optionValue}>₹50,000 - ₹2,00,000</Text>
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Backup:</Text>
              <Text style={styles.optionValue}>4-8 hours</Text>
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Best For:</Text>
              <Text style={styles.optionValue}>Solar + grid hybrid</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.inquireButton}
            onPress={() => handlePhoneCall('+91 8765432109')}
          >
            <Text style={styles.inquireButtonText}>📞 Battery Suppliers - +91 8765432109</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading power supply options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Power Supply Solutions</Text>
          <Text style={styles.subtitle}>Sustainable energy options for {selectedCrop} cultivation</Text>
        </View>

        {renderPowerAnalysis()}

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentView === 'solar' && styles.activeTab]}
            onPress={() => setCurrentView('solar')}
          >
            <Text style={[styles.tabText, currentView === 'solar' && styles.activeTabText]}>
              Solar Schemes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentView === 'traditional' && styles.activeTab]}
            onPress={() => setCurrentView('traditional')}
          >
            <Text style={[styles.tabText, currentView === 'traditional' && styles.activeTabText]}>
              Traditional
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewContainer}>
          {currentView === 'solar' && (
            <>
              <Text style={styles.sectionTitle}>Solar Power Schemes</Text>
              {solarSchemes.length > 0 ? (
                solarSchemes.map((scheme, index) => renderSolarSchemeCard(scheme, index))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No solar schemes available</Text>
                  <Text style={styles.noDataSubtext}>Check back later for updates</Text>
                </View>
              )}
            </>
          )}

          {currentView === 'traditional' && renderTraditionaOptions()}
        </View>
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

  analysisCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  analysisTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analysisItem: {
    width: '48%',
    marginBottom: 10,
  },
  analysisLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  currentCost: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savingsValue: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  systemValue: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roiValue: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: 'bold',
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

  viewContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, color: '#2196F3', fontWeight: 'bold', marginBottom: 15 },

  schemeCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  schemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  schemeInfo: { flex: 1 },
  schemeName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  schemeProvider: { color: '#aaa', fontSize: 14 },
  subsidyBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subsidyText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  schemeDetails: { marginBottom: 15 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: { color: '#aaa', fontSize: 14 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: '600' },

  benefitsSection: { marginBottom: 15 },
  benefitsText: { color: '#ccc', fontSize: 14, lineHeight: 20 },

  eligibilitySection: { marginBottom: 15 },
  eligibilityText: { color: '#ccc', fontSize: 14, lineHeight: 20 },

  applyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Traditional Options Styles
  traditionalContainer: { marginBottom: 20 },
  optionCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  optionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionDetails: { marginBottom: 15 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionLabel: { color: '#aaa', fontSize: 14 },
  optionValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  inquireButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  inquireButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  noDataContainer: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataSubtext: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PowerSupplyScreen;
