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

const ContractFarmingScreen = ({ route }) => {
  const { selectedCrop, landSize } = route.params || { selectedCrop: 'Rice', landSize: '5' };
  
  const [currentView, setCurrentView] = useState('buyers');
  const [loading, setLoading] = useState(true);
  const [corporateBuyers, setCorporateBuyers] = useState([]);
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    const loadCache = async () => {
      setLoading(true);
      try {
        const cached = await AsyncStorage.getItem('cropcycle_dashboard_data');
        if (cached) {
          const data = JSON.parse(cached);
          setCorporateBuyers(data.buyers || []);
          setCertifications(data.certifications || []);
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

  const renderBuyerCard = (buyer, index) => (
    <View key={index} style={styles.buyerCard}>
      <View style={styles.buyerHeader}>
        <View style={styles.buyerInfo}>
          <Text style={styles.buyerLogo}>{buyer.logo || '🏢'}</Text>
          <View style={styles.buyerDetails}>
            <Text style={styles.buyerName}>{buyer.name}</Text>
            <Text style={styles.buyerRating}>⭐ {buyer.rating} ({buyer.farmers?.toLocaleString()} farmers)</Text>
          </View>
        </View>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>{buyer.premium}% premium</Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Contract Price</Text>
          <Text style={styles.contractPrice}>₹{buyer.contractPrice?.toLocaleString()}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Market Price</Text>
          <Text style={styles.marketPrice}>₹{buyer.marketPrice?.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.requirementsSection}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        <Text style={styles.requirementsText}>{buyer.requirements}</Text>
      </View>

      <View style={styles.termsSection}>
        <View style={styles.termItem}>
          <Text style={styles.termLabel}>Payment:</Text>
          <Text style={styles.termValue}>{buyer.payment}</Text>
        </View>
        <View style={styles.termItem}>
          <Text style={styles.termLabel}>Contract:</Text>
          <Text style={styles.termValue}>{buyer.contract}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.contactButton}
        onPress={() => handlePhoneCall(buyer.contact)}
      >
        <Text style={styles.contactButtonText}>📞 Call {buyer.contact}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCertificationCard = (cert, index) => (
    <View key={index} style={styles.certCard}>
      <Text style={styles.certName}>{cert.name}</Text>
      <View style={styles.certDetails}>
        <View style={styles.certDetailRow}>
          <Text style={styles.certLabel}>Cost:</Text>
          <Text style={styles.certValue}>{cert.cost}</Text>
        </View>
        <View style={styles.certDetailRow}>
          <Text style={styles.certLabel}>Duration:</Text>
          <Text style={styles.certValue}>{cert.duration}</Text>
        </View>
        <View style={styles.certDetailRow}>
          <Text style={styles.certLabel}>Benefits:</Text>
          <Text style={styles.certValue}>{cert.benefits}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.certContactButton}
        onPress={() => handlePhoneCall(cert.contact?.split(': ')[1] || cert.contact)}
      >
        <Text style={styles.certContactText}>📞 Contact for Application</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading contract farming opportunities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Corporate Partnerships</Text>
          <Text style={styles.subtitle}>Connect with Fortune 500 agri-buyers for {selectedCrop}</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentView === 'buyers' && styles.activeTab]}
            onPress={() => setCurrentView('buyers')}
          >
            <Text style={[styles.tabText, currentView === 'buyers' && styles.activeTabText]}>
              Corporate Buyers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentView === 'certifications' && styles.activeTab]}
            onPress={() => setCurrentView('certifications')}
          >
            <Text style={[styles.tabText, currentView === 'certifications' && styles.activeTabText]}>
              Certifications
            </Text>
          </TouchableOpacity>
        </View>

        {currentView === 'buyers' && (
          <View style={styles.viewContainer}>
            <Text style={styles.sectionTitle}>Available Buyers for {selectedCrop}</Text>
            {corporateBuyers.length > 0 ? (
              corporateBuyers.map((buyer, index) => renderBuyerCard(buyer, index))
            ) : (
              <View style={styles.noBuyersContainer}>
                <Text style={styles.noBuyersText}>No corporate buyers found for {selectedCrop}</Text>
                <Text style={styles.noBuyersSubtext}>Try searching for other crops or check back later</Text>
              </View>
            )}
          </View>
        )}

        {currentView === 'certifications' && (
          <View style={styles.viewContainer}>
            <Text style={styles.sectionTitle}>Required Certifications</Text>
            {certifications.length > 0 ? (
              certifications.map((cert, index) => renderCertificationCard(cert, index))
            ) : (
              <View style={styles.noBuyersContainer}>
                <Text style={styles.noBuyersText}>No certification data available</Text>
                <Text style={styles.noBuyersSubtext}>Please check back later for updates</Text>
              </View>
            )}
          </View>
        )}
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

  tabContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#181818', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#2196F3' },
  tabText: { color: '#aaa', fontWeight: '600', fontSize: 14 },
  activeTabText: { color: '#fff' },

  viewContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, color: '#2196F3', fontWeight: 'bold', marginBottom: 15 },

  buyerCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  buyerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  buyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buyerLogo: { fontSize: 24, marginRight: 12 },
  buyerDetails: { flex: 1 },
  buyerName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  buyerRating: { color: '#FFC107', fontSize: 14 },
  premiumBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 12,
    backgroundColor: '#232323',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  priceItem: { alignItems: 'center' },
  priceLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  contractPrice: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },
  marketPrice: { color: '#FF6B6B', fontSize: 18, fontWeight: 'bold' },

  requirementsSection: { marginBottom: 15 },
  requirementsText: { color: '#ccc', fontSize: 14, lineHeight: 20 },

  termsSection: { marginBottom: 15 },
  termItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  termLabel: { color: '#aaa', fontSize: 14 },
  termValue: { color: '#fff', fontSize: 14, fontWeight: '600' },

  contactButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  certCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  certName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  certDetails: { marginBottom: 15 },
  certDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  certLabel: { color: '#aaa', fontSize: 14 },
  certValue: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' },
  certContactButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  certContactText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  noBuyersContainer: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  noBuyersText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  noBuyersSubtext: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ContractFarmingScreen;
