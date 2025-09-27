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

const CropInsuranceScreen = ({ route }) => {
  const { selectedCrop, landSize } = route.params || { selectedCrop: 'Rice', landSize: '5' };
  
  const [currentView, setCurrentView] = useState('schemes');
  const [loading, setLoading] = useState(true);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [cropAnalysis, setCropAnalysis] = useState(null);

  useEffect(() => {
    const loadCache = async () => {
      setLoading(true);
      try {
        const cached = await AsyncStorage.getItem('cropcycle_dashboard_data');
        if (cached) {
          const data = JSON.parse(cached);
          setInsurancePlans(data.insurance || []);
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

  const getSchemesByType = (type) => {
    return insurancePlans.filter(plan => plan.type?.toLowerCase() === type.toLowerCase());
  };

  const renderInsuranceCard = (plan, index) => (
    <View key={index} style={styles.insuranceCard}>
      <View style={styles.insuranceHeader}>
        <View style={styles.insuranceInfo}>
          <Text style={styles.insuranceName}>{plan.name}</Text>
          <Text style={styles.insuranceProvider}>{plan.provider}</Text>
        </View>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>{plan.premium_rate}</Text>
        </View>
      </View>

      <View style={styles.coverageSection}>
        <Text style={styles.sectionTitle}>Coverage Details</Text>
        <View style={styles.coverageRow}>
          <Text style={styles.coverageLabel}>Sum Insured:</Text>
          <Text style={styles.coverageValue}>{plan.sum_insured}</Text>
        </View>
        <View style={styles.coverageRow}>
          <Text style={styles.coverageLabel}>Coverage:</Text>
          <Text style={styles.coverageValue}>{plan.coverage}</Text>
        </View>
        <View style={styles.coverageRow}>
          <Text style={styles.coverageLabel}>Duration:</Text>
          <Text style={styles.coverageValue}>{plan.duration}</Text>
        </View>
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>Key Benefits</Text>
        <Text style={styles.benefitsText}>{plan.benefits}</Text>
      </View>

      <View style={styles.claimsSection}>
        <Text style={styles.sectionTitle}>Claims Process</Text>
        <Text style={styles.claimsText}>{plan.claims_process}</Text>
      </View>

      <TouchableOpacity 
        style={styles.enrollButton}
        onPress={() => handlePhoneCall(plan.contact?.split(': ')[1] || plan.contact)}
      >
        <Text style={styles.enrollButtonText}>📞 Enroll Now - {plan.contact}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRiskAnalysis = () => {
    if (!cropAnalysis) return null;

    return (
      <View style={styles.riskCard}>
        <Text style={styles.riskTitle}>Risk Analysis for {selectedCrop}</Text>
        <View style={styles.riskGrid}>
          <View style={styles.riskItem}>
            <Text style={styles.riskLabel}>Risk Level</Text>
            <Text style={[styles.riskValue, { color: getRiskColor(cropAnalysis.risk_level) }]}>
              {cropAnalysis.risk_level || 'Medium'}
            </Text>
          </View>
          <View style={styles.riskItem}>
            <Text style={styles.riskLabel}>Insurance Premium</Text>
            <Text style={styles.riskValue}>{cropAnalysis.insurance_premium || '2.5%'}</Text>
          </View>
          <View style={styles.riskItem}>
            <Text style={styles.riskLabel}>Claim Settlement</Text>
            <Text style={styles.riskValue}>{cropAnalysis.claim_settlement || '90%'}</Text>
          </View>
          <View style={styles.riskItem}>
            <Text style={styles.riskLabel}>Season</Text>
            <Text style={styles.riskValue}>{cropAnalysis.season || 'Kharif'}</Text>
          </View>
        </View>
        {cropAnalysis.risk_factors && (
          <View style={styles.riskFactorsSection}>
            <Text style={styles.sectionTitle}>Major Risk Factors</Text>
            <Text style={styles.riskFactorsText}>{cropAnalysis.risk_factors}</Text>
          </View>
        )}
      </View>
    );
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#FF9800';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading insurance plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Crop Insurance</Text>
          <Text style={styles.subtitle}>Protect your {selectedCrop} investment with comprehensive coverage</Text>
        </View>

        {renderRiskAnalysis()}

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentView === 'schemes' && styles.activeTab]}
            onPress={() => setCurrentView('schemes')}
          >
            <Text style={[styles.tabText, currentView === 'schemes' && styles.activeTabText]}>
              Government
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentView === 'private' && styles.activeTab]}
            onPress={() => setCurrentView('private')}
          >
            <Text style={[styles.tabText, currentView === 'private' && styles.activeTabText]}>
              Private
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewContainer}>
          {currentView === 'schemes' && (
            <>
              <Text style={styles.sectionTitle}>Government Insurance Schemes</Text>
              {getSchemesByType('government').length > 0 ? (
                getSchemesByType('government').map((plan, index) => renderInsuranceCard(plan, index))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No government insurance schemes available for {selectedCrop}</Text>
                </View>
              )}
            </>
          )}

          {currentView === 'private' && (
            <>
              <Text style={styles.sectionTitle}>Private Insurance Plans</Text>
              {getSchemesByType('private').length > 0 ? (
                getSchemesByType('private').map((plan, index) => renderInsuranceCard(plan, index))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No private insurance plans available for {selectedCrop}</Text>
                </View>
              )}
            </>
          )}
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

  riskCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  riskTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  riskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  riskItem: {
    width: '48%',
    marginBottom: 10,
  },
  riskLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  riskValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  riskFactorsSection: { marginTop: 15 },
  riskFactorsText: { color: '#ccc', fontSize: 14, lineHeight: 20 },

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

  insuranceCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  insuranceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  insuranceInfo: { flex: 1 },
  insuranceName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  insuranceProvider: { color: '#aaa', fontSize: 14 },
  premiumBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  coverageSection: { marginBottom: 15 },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coverageLabel: { color: '#aaa', fontSize: 14 },
  coverageValue: { color: '#fff', fontSize: 14, fontWeight: '600' },

  benefitsSection: { marginBottom: 15 },
  benefitsText: { color: '#ccc', fontSize: 14, lineHeight: 20 },

  claimsSection: { marginBottom: 15 },
  claimsText: { color: '#ccc', fontSize: 14, lineHeight: 20 },

  enrollButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrollButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

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

export default CropInsuranceScreen;
