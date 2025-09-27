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

const CreditSourcesScreen = ({ route }) => {
  const { selectedCrop, landSize } = route.params || { selectedCrop: 'Rice', landSize: '5' };
  
  const [currentView, setCurrentView] = useState('government');
  const [loading, setLoading] = useState(true);
  const [loanSchemes, setLoanSchemes] = useState([]);
  const [cropAnalysis, setCropAnalysis] = useState(null);

  useEffect(() => {
    const loadCache = async () => {
      setLoading(true);
      try {
        const cached = await AsyncStorage.getItem('cropcycle_dashboard_data');
        if (cached) {
          const data = JSON.parse(cached);
          setLoanSchemes(data.loans || []);
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

  const getSchemesByCategory = (category) => {
    return loanSchemes.filter(scheme => scheme.category?.toLowerCase() === category.toLowerCase());
  };

  const renderLoanCard = (scheme, index) => (
    <View key={index} style={styles.loanCard}>
      <View style={styles.loanHeader}>
        <View style={styles.loanInfo}>
          <Text style={styles.loanName}>{scheme.name}</Text>
          <Text style={styles.loanProvider}>{scheme.provider}</Text>
        </View>
        <View style={styles.interestBadge}>
          <Text style={styles.interestText}>{scheme.interest_rate}</Text>
        </View>
      </View>

      <View style={styles.loanDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Loan Amount:</Text>
          <Text style={styles.detailValue}>{scheme.loan_amount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tenure:</Text>
          <Text style={styles.detailValue}>{scheme.tenure}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Processing:</Text>
          <Text style={styles.detailValue}>{scheme.processing_time}</Text>
        </View>
      </View>

      <View style={styles.eligibilitySection}>
        <Text style={styles.sectionTitle}>Eligibility</Text>
        <Text style={styles.eligibilityText}>{scheme.eligibility}</Text>
      </View>

      <View style={styles.documentsSection}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        <Text style={styles.documentsText}>{scheme.documents}</Text>
      </View>

      <TouchableOpacity 
        style={styles.applyButton}
        onPress={() => handlePhoneCall(scheme.contact?.split(': ')[1] || scheme.contact)}
      >
        <Text style={styles.applyButtonText}>📞 Apply Now - {scheme.contact}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCropAnalysis = () => {
    if (!cropAnalysis) return null;

    return (
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Financial Analysis for {selectedCrop}</Text>
        <View style={styles.analysisGrid}>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Estimated Investment</Text>
            <Text style={styles.analysisValue}>₹{cropAnalysis.investment?.toLocaleString() || 'N/A'}</Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Expected Revenue</Text>
            <Text style={styles.analysisValue}>₹{cropAnalysis.revenue?.toLocaleString() || 'N/A'}</Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>Profit Margin</Text>
            <Text style={styles.analysisValue}>{cropAnalysis.profit_margin || 'N/A'}</Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>ROI</Text>
            <Text style={styles.analysisValue}>{cropAnalysis.roi || 'N/A'}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading credit sources...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Credit & Financing</Text>
          <Text style={styles.subtitle}>Find the best loan schemes for {selectedCrop} cultivation</Text>
        </View>

        {renderCropAnalysis()}

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentView === 'government' && styles.activeTab]}
            onPress={() => setCurrentView('government')}
          >
            <Text style={[styles.tabText, currentView === 'government' && styles.activeTabText]}>
              Government
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentView === 'private' && styles.activeTab]}
            onPress={() => setCurrentView('private')}
          >
            <Text style={[styles.tabText, currentView === 'private' && styles.activeTabText]}>
              Private Banks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentView === 'nbfc' && styles.activeTab]}
            onPress={() => setCurrentView('nbfc')}
          >
            <Text style={[styles.tabText, currentView === 'nbfc' && styles.activeTabText]}>
              NBFCs
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewContainer}>
          {currentView === 'government' && (
            <>
              <Text style={styles.sectionTitle}>Government Loan Schemes</Text>
              {getSchemesByCategory('government').length > 0 ? (
                getSchemesByCategory('government').map((scheme, index) => renderLoanCard(scheme, index))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No government schemes available for {selectedCrop}</Text>
                </View>
              )}
            </>
          )}

          {currentView === 'private' && (
            <>
              <Text style={styles.sectionTitle}>Private Bank Loans</Text>
              {getSchemesByCategory('private').length > 0 ? (
                getSchemesByCategory('private').map((scheme, index) => renderLoanCard(scheme, index))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No private bank loans available for {selectedCrop}</Text>
                </View>
              )}
            </>
          )}

          {currentView === 'nbfc' && (
            <>
              <Text style={styles.sectionTitle}>NBFC Financing</Text>
              {getSchemesByCategory('nbfc').length > 0 ? (
                getSchemesByCategory('nbfc').map((scheme, index) => renderLoanCard(scheme, index))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No NBFC financing available for {selectedCrop}</Text>
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

  analysisCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
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
  analysisValue: {
    color: '#4CAF50',
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

  loanCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  loanInfo: { flex: 1 },
  loanName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  loanProvider: { color: '#aaa', fontSize: 14 },
  interestBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  interestText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  loanDetails: { marginBottom: 15 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: { color: '#aaa', fontSize: 14 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: '600' },

  eligibilitySection: { marginBottom: 15 },
  eligibilityText: { color: '#ccc', fontSize: 14, lineHeight: 20 },

  documentsSection: { marginBottom: 15 },
  documentsText: { color: '#ccc', fontSize: 14, lineHeight: 20 },

  applyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

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

export default CreditSourcesScreen;
