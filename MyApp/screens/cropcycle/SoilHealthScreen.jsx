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

const SoilHealthScreen = ({ route }) => {
  const { selectedCrop, landSize } = route.params || { selectedCrop: 'Rice', landSize: '5' };
  
  const [currentView, setCurrentView] = useState('analysis');
  const [loading, setLoading] = useState(true);
  const [soilTestingLabs, setSoilTestingLabs] = useState([]);
  const [cropAnalysis, setCropAnalysis] = useState(null);

  useEffect(() => {
    const loadCache = async () => {
      setLoading(true);
      try {
        const cached = await AsyncStorage.getItem('cropcycle_dashboard_data');
        if (cached) {
          const data = JSON.parse(cached);
          setSoilTestingLabs(data.soil_labs || []);
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

  const renderSoilAnalysis = () => {
    if (!cropAnalysis) return null;

    const soilScore = cropAnalysis.soil_score || 75;
    const targetScore = 85;
    const scoreColor = soilScore >= 80 ? '#4CAF50' : soilScore >= 60 ? '#FF9800' : '#F44336';

    return (
      <View style={styles.analysisContainer}>
        <View style={styles.scoreCard}>
          <Text style={styles.cardTitle}>Soil Health Score</Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{soilScore}/100</Text>
            <Text style={styles.targetText}>Target: {targetScore}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${soilScore}%`, backgroundColor: scoreColor }]} />
          </View>
        </View>

        <View style={styles.parametersCard}>
          <Text style={styles.cardTitle}>Soil Parameters</Text>
          <View style={styles.parametersGrid}>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>pH Level</Text>
              <Text style={styles.parameterValue}>{cropAnalysis.soil_ph || '6.5'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Nitrogen</Text>
              <Text style={styles.parameterValue}>{cropAnalysis.nitrogen || 'Medium'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Phosphorus</Text>
              <Text style={styles.parameterValue}>{cropAnalysis.phosphorus || 'Low'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Potassium</Text>
              <Text style={styles.parameterValue}>{cropAnalysis.potassium || 'High'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Organic Matter</Text>
              <Text style={styles.parameterValue}>{cropAnalysis.organic_matter || '2.1%'}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>Soil Type</Text>
              <Text style={styles.parameterValue}>{cropAnalysis.soil_type || 'Loam'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.recommendationsCard}>
          <Text style={styles.cardTitle}>Soil Improvement Recommendations</Text>
          <Text style={styles.recommendationsText}>
            {cropAnalysis.soil_recommendations || 
            `For ${selectedCrop} cultivation:
1. Add organic compost to improve soil structure
2. Apply balanced NPK fertilizer based on soil test
3. Maintain optimal pH level for better nutrient absorption
4. Consider lime application if pH is too acidic
5. Regular soil testing every 6 months`}
          </Text>
        </View>
      </View>
    );
  };

  const renderSoilTestingLab = (lab, index) => (
    <View key={index} style={styles.labCard}>
      <View style={styles.labHeader}>
        <View style={styles.labInfo}>
          <Text style={styles.labName}>{lab.name}</Text>
          <Text style={styles.labLocation}>{lab.location}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{lab.distance || '15 km'}</Text>
        </View>
      </View>

      <View style={styles.labDetails}>
        <View style={styles.labRow}>
          <Text style={styles.labLabel}>Test Cost:</Text>
          <Text style={styles.labValue}>{lab.cost}</Text>
        </View>
        <View style={styles.labRow}>
          <Text style={styles.labLabel}>Report Time:</Text>
          <Text style={styles.labValue}>{lab.report_time}</Text>
        </View>
        <View style={styles.labRow}>
          <Text style={styles.labLabel}>Parameters:</Text>
          <Text style={styles.labValue}>{lab.parameters}</Text>
        </View>
      </View>

      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Services</Text>
        <Text style={styles.servicesText}>{lab.services}</Text>
      </View>

      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => handlePhoneCall(lab.contact?.split(': ')[1] || lab.contact)}
      >
        <Text style={styles.bookButtonText}>📞 Book Test - {lab.contact}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNutrientTips = () => {
    return (
      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Nutrient Management Tips</Text>
        
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>🌱 Nitrogen Management</Text>
          <Text style={styles.tipText}>
            • Apply nitrogen in splits during active growth phases
            • Use organic sources like FYM and compost
            • Monitor leaf color for nitrogen deficiency
            • Avoid excess nitrogen during flowering
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>🦴 Phosphorus Boost</Text>
          <Text style={styles.tipText}>
            • Apply phosphatic fertilizers during land preparation
            • Use bone meal for organic phosphorus
            • Ensure proper pH for phosphorus availability
            • Apply during root development stage
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>🍌 Potassium Care</Text>
          <Text style={styles.tipText}>
            • Apply potash during fruit/grain filling stage
            • Use wood ash as organic potassium source
            • Monitor for potassium deficiency symptoms
            • Balance with calcium and magnesium
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>🌿 Organic Matter</Text>
          <Text style={styles.tipText}>
            • Add 2-3 tons of compost per acre annually
            • Practice crop rotation with legumes
            • Use cover crops during fallow periods
            • Apply green manure before main crop
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
          <Text style={styles.loadingText}>Analyzing soil health...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Soil Health Management</Text>
          <Text style={styles.subtitle}>Optimize soil conditions for {selectedCrop} growth</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentView === 'analysis' && styles.activeTab]}
            onPress={() => setCurrentView('analysis')}
          >
            <Text style={[styles.tabText, currentView === 'analysis' && styles.activeTabText]}>
              Analysis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentView === 'testing' && styles.activeTab]}
            onPress={() => setCurrentView('testing')}
          >
            <Text style={[styles.tabText, currentView === 'testing' && styles.activeTabText]}>
              Testing Labs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentView === 'tips' && styles.activeTab]}
            onPress={() => setCurrentView('tips')}
          >
            <Text style={[styles.tabText, currentView === 'tips' && styles.activeTabText]}>
              Tips
            </Text>
          </TouchableOpacity>
        </View>

        {currentView === 'analysis' && renderSoilAnalysis()}
        {currentView === 'testing' && (
          <View style={styles.viewContainer}>
            <Text style={styles.sectionTitle}>Nearby Soil Testing Labs</Text>
            {soilTestingLabs.length > 0 ? (
              soilTestingLabs.map((lab, index) => renderSoilTestingLab(lab, index))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No soil testing labs found</Text>
                <Text style={styles.noDataSubtext}>Check back later for updates</Text>
              </View>
            )}
          </View>
        )}
        {currentView === 'tips' && renderNutrientTips()}
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

  viewContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, color: '#2196F3', fontWeight: 'bold', marginBottom: 15 },

  // Analysis Styles
  analysisContainer: { marginBottom: 20 },
  scoreCard: {
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
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  targetText: {
    color: '#aaa',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  parametersCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  parameterItem: {
    width: '48%',
    marginBottom: 10,
  },
  parameterLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  parameterValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  recommendationsCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  recommendationsText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },

  // Testing Labs Styles
  labCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  labInfo: { flex: 1 },
  labName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  labLocation: { color: '#aaa', fontSize: 14 },
  distanceBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  labDetails: { marginBottom: 15 },
  labRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labLabel: { color: '#aaa', fontSize: 14 },
  labValue: { color: '#fff', fontSize: 14, fontWeight: '600' },

  servicesSection: { marginBottom: 15 },
  servicesText: { color: '#ccc', fontSize: 14, lineHeight: 20 },

  bookButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Tips Styles
  tipsContainer: { marginBottom: 20 },
  tipCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
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

export default SoilHealthScreen;
