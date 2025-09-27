import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  UIManager,
  LayoutAnimation,
  Animated,
  FlatList,
  TouchableWithoutFeedback,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { NetworkConfig } from '../utils/NetworkConfig';
import { useTheme } from '../context/ThemeContext';


const API_BASE = NetworkConfig.API_BASE;
const CACHE_KEY = 'soilMoistureDataCache';
const FARMER_ID = 'f001';

const SoilMoistureScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [summaryAnim] = useState(new Animated.Value(0));
  const [cardAnims, setCardAnims] = useState([]);
  const [masterStates, setMasterStates] = useState([]);
  const [masterDistricts, setMasterDistricts] = useState([]);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = { top: StatusBar.currentHeight };
  try {
    const { useSafeAreaInsets } = require('react-native-safe-area-context');
    Object.assign(insets, useSafeAreaInsets());
  } catch (e) {}
  const styles = makeStyles(theme);

  // Load cached data on mount, then fetch fresh data in background
  useEffect(() => {
    let isMounted = true;
    const loadCacheAndFetch = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && isMounted) {
          setData(JSON.parse(cached));
        }
      } catch (e) {}
      // Always fetch fresh data in background
      fetchData(true);
    };
    loadCacheAndFetch();
    return () => { isMounted = false; };
  }, []);

  // Modified fetchData to optionally skip loading state and cache result
  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    if (!isBackground) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      let url = `${API_BASE}/soil-moisture?`;
      const params = [];
      url += params.join('&');
      const response = await fetch(url);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to fetch soil moisture data.');
      }
      const result = await response.json();
      setData(result);
      // Save to cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result));
    } catch (e) {
      setError(e.message || 'An error occurred.');
      setData([]);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };
  
  // Fetch farmer profile and set default state
  useEffect(() => {
    const fetchFarmerProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/farmer/f001/profile`);
        if (!response.ok) return;
        const profile = await response.json();
        // setState(profile.state); // Removed as per edit hint
      } catch (e) {}
    };
    fetchFarmerProfile();
  }, []);

  // Fetch master filter options on mount
  useEffect(() => {
    const fetchMasterOptions = async () => {
      try {
        let url = `${API_BASE}/soil-moisture?state=Maharashtra`;
        const response = await fetch(url);
        if (!response.ok) return;
        const result = await response.json();
        setMasterStates([...new Set(result.map(item => item.State).filter(Boolean))]);
        setMasterDistricts([...new Set(result.map(item => item.District).filter(Boolean))]);
      } catch (e) {}
    };
    fetchMasterOptions();
  }, []);

  // Extract unique filter options from data
  useEffect(() => {
    if (data && data.length > 0) {
      // setAllStates([...new Set(data.map(item => item.State).filter(Boolean))]); // Removed as per edit hint
      // setAllDistricts([...new Set(data.map(item => item.District).filter(Boolean))]); // Removed as per edit hint
    }
  }, [data]);

  useEffect(() => {
    // Ensure default language falls back to English
    try {
      if (i18n && i18n.language === undefined) {
        i18n.changeLanguage('en');
      }
      // also ensure at least 'en' is set if nothing present
      if (i18n && !i18n.language) i18n.changeLanguage('en');
    } catch (e) {}
    Animated.timing(summaryAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Set up cardAnims when data changes
  useEffect(() => {
    setCardAnims(data.map(() => new Animated.Value(0)));
  }, [data]);

  // Run animations after cardAnims is set
  useEffect(() => {
    if (cardAnims.length === data.length && data.length > 0) {
      cardAnims.forEach((anim, i) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: 100 + i * 80,
          useNativeDriver: true,
        }).start();
      });
    }
    // eslint-disable-next-line
  }, [cardAnims, data]);

  // Update filteredData whenever data or filters change
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const clearFilters = () => {
    // No filters to clear
  };

  // Handler for AI Assistant button
  const handleAIAssistant = async () => {
    if (!data.length) {
      Alert.alert(
        t('common.no_data', 'No Data'),
        t('soil.no_data_message', 'No soil moisture data available to get AI suggestions.')
      );
      return;
    }
    setAiModalVisible(true);
    setAiLoading(true);
    setAiError('');
    setAiSuggestions([]);
    try {
      // Use state and district from the first data record
      const first = data[0];
      const state = first.State || first.state || '';
      const district = first.District || first.district || '';
      const response = await fetch(`${API_BASE}/soil-moisture/ai-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, district }),
      });
      const result = await response.json();
      if (result.suggestions) {
        setAiSuggestions(result.suggestions);
      } else {
        setAiError('No suggestions received.');
      }
    } catch (e) {
      setAiError('Failed to get AI suggestions.');
    } finally {
      setAiLoading(false);
    }
  };

  const renderDataItem = (item, index) => {
    // Highlight color for Avg_smlvl_at15cm
    const moistureValue = parseFloat(item.Avg_smlvl_at15cm) || 0;
    const colorIntensity = Math.min(255, Math.max(0, moistureValue * 5));
    const moistureColor = `rgb(${255 - colorIntensity}, ${colorIntensity}, 80)`;
    return (
      <Animated.View style={{ opacity: (cardAnims[index] || 1) }} key={index}>
        <View style={[styles.dataCard, { backgroundColor: theme.colors.card }]}>
          <LinearGradient colors={[theme.colors.card, theme.colors.background]} style={styles.dataCardGradient}>
            <View style={styles.cardHeader}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={18} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>{item.District}, {item.State}</Text>
              </View>
            </View>
            
            <View style={styles.cardBody}>
              {/* Agency Section */}
              <View style={styles.agencySection}>
                <View style={styles.fieldRowHeader}>
                  <Ionicons name="business" size={16} color={theme.colors.primary} />
                  <Text style={styles.agencyText}>{item.Agency_name || 'Unknown Agency'}</Text>
                </View>
              </View>

              {/* Moisture Level Highlight */}
              <View style={styles.moistureHighlight}>
                <View style={styles.moistureHeader}>
                  <Ionicons name="water" size={20} color={moistureColor} />
                  <Text style={styles.moistureLabel}>Avg Moisture (15cm)</Text>
                </View>
                <Text style={[styles.moistureValue, { color: moistureColor }]}>
                  {item.Avg_smlvl_at15cm}%
                </Text>
              </View>

              {/* Other Fields */}
              <View style={styles.fieldsContainer}>
                {Object.entries(item).map(([key, value]) => {
                  if (["Agency_name", "Date", "Month", "Year", "State", "District", "Avg_smlvl_at15cm"].includes(key)) return null;
                  return (
                    <View key={key} style={styles.fieldRow}>
                      <Text style={styles.fieldKey}>{key.replace(/_/g, ' ')}</Text>
                      <Text style={styles.fieldValue}>{String(value)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.colors.card }]} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.headerTitle }]} numberOfLines={1}>
          {t('soil.title', 'Soil Moisture')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Summary Section */}
        <View style={styles.section}>
          <Animated.View style={[styles.summaryBar, { opacity: summaryAnim }]}> 
            <LinearGradient 
              colors={[theme.colors.info || theme.colors.primary, theme.colors.primary || theme.colors.info]} 
              style={styles.summaryGradient}
            >
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <Ionicons name="analytics" size={22} color={theme.colors.text} />
                  </View>
                  <View style={styles.summaryTextContainer}>
                    <Text style={styles.summaryLabel}>{t('soil.records', 'Records')}</Text>
                    <Text style={styles.summaryValue}>{filteredData.length}</Text>
                  </View>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    <Ionicons name="water" size={20} color={theme.colors.text} />
                  </View>
                  <View style={styles.summaryTextContainer}>
                    <Text style={styles.summaryLabel}>{t('soil.avg_moisture', 'Avg Moisture')}</Text>
                    <Text style={styles.summaryValue}>
                      {filteredData.length > 0 
                        ? (filteredData.reduce((acc, item) => acc + (parseFloat(item.Avg_smlvl_at15cm) || 0), 0) / filteredData.length).toFixed(2) + '%'
                        : '--'
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
          
          {/* AI Assistant Button */}
          <TouchableOpacity 
            style={[styles.aiButton, { backgroundColor: theme.colors.primary }]} 
            onPress={handleAIAssistant}
          >
            <View style={styles.aiButtonIconContainer}>
              <Ionicons name="chatbubbles" size={20} color={theme.colors.onPrimary || theme.colors.text} />
            </View>
            <Text style={[styles.aiButtonText, { color: theme.colors.onPrimary || theme.colors.text }]}> 
              {t('soil.ai_assistant', 'AI Assistant')}
            </Text>
          </TouchableOpacity>
          
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Data Cards */}
        {loading && filteredData.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading soil moisture data...
            </Text>
          </View>
        ) : filteredData.length > 0 ? (
          <View style={styles.dataContainer}>
            {filteredData.map((item, index) => renderDataItem(item, index))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('soil.no_data', 'No soil moisture data available.')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* AI Assistant Modal */}
      <Modal
        visible={aiModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAiModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay || 'rgba(0,0,0,0.7)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="chatbubbles" size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.primary || theme.colors.text }]}>
                AI Suggestions
              </Text>
            </View>
            
            <View style={styles.modalBody}>
              {aiLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    Generating suggestions...
                  </Text>
                </View>
              ) : aiError ? (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: theme.colors.warning || theme.colors.primary }]}>
                    {aiError}
                  </Text>
                </View>
              ) : (
                aiSuggestions.length > 0 ? (
                  <Markdown style={{ body: { color: theme.colors.text, fontSize: 16, lineHeight: 24 } }}>
                    {aiSuggestions[0]}
                  </Markdown>
                ) : (
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary || theme.colors.muted }]}>
                    {t('no_suggestions_found', 'No suggestions found.')}
                  </Text>
                )
              )}
            </View>
            
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: theme.colors.primary }]} 
              onPress={() => setAiModalVisible(false)}
            >
                <Text style={[styles.closeButtonText, { color: theme.colors.onPrimary || theme.colors.text }]}> 
                {t('common.close', 'Close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const makeStyles = (theme) => {
  const { colors } = theme;
  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background 
    },
    
    // Header Styles
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingHorizontal: 16, 
      paddingVertical: 12,
      paddingTop: 50,
      borderBottomWidth: 1, 
      borderBottomColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    backButton: { 
      width: 44, 
      height: 44, 
      borderRadius: 22, 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: colors.card,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    headerTitle: { 
      position: 'absolute',
      left: 0,
      right: 0,
      textAlign: 'center', 
      fontSize: 20, 
      fontWeight: '700', 
      color: colors.text,
      marginHorizontal: 16,
      alignSelf: 'center',
    },
    headerSpacer: { 
      width: 44 
    },
    
    // Scroll View Styles
    scrollView: { 
      flex: 1, 
      backgroundColor: colors.background 
    },
    scrollContent: { 
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 40 
    },
    
    // Section Styles
    section: { 
      marginBottom: 24 
    },
    
    // Summary Bar Styles
    summaryBar: { 
      marginBottom: 20, 
      borderRadius: 16, 
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    summaryGradient: { 
      padding: 20, 
      borderRadius: 16 
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    summaryIconContainer: {
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    summaryTextContainer: {
      marginLeft: 12,
      alignItems: 'flex-start',
      justifyContent: 'center',
      flex: 1,
    },
    summaryLabel: { 
      color: colors.text, 
      fontSize: 14,
      fontWeight: '500',
      opacity: 0.8,
      lineHeight: 18,
    },
    summaryValue: { 
      color: colors.text, 
      fontWeight: '700', 
      fontSize: 18,
      marginTop: 2,
      lineHeight: 22,
    },
    summaryDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.text,
      opacity: 0.2,
      marginHorizontal: 20,
    },
    
    // AI Button Styles
    aiButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      marginBottom: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    aiButtonIconContainer: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiButtonText: {
      color: colors.onPrimary || colors.text,
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
      lineHeight: 20,
    },
    
    // Data Card Styles
    dataContainer: {
      gap: 16,
    },
    dataCard: { 
      borderRadius: 20, 
      overflow: 'hidden', 
      backgroundColor: colors.card,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    dataCardGradient: { 
      padding: 20 
    },
    cardHeader: { 
      marginBottom: 20 
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    cardTitle: { 
      fontSize: 16, 
      fontWeight: '600', 
      color: colors.text,
      marginLeft: 8,
      lineHeight: 20,
    },
    
    cardBody: {
      gap: 16,
    },
    
    // Agency Section
    agencySection: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
    },
    fieldRowHeader: { 
      flexDirection: 'row', 
      alignItems: 'center',
    },
    agencyText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
      lineHeight: 18,
      flex: 1,
    },
    
    // Moisture Highlight
    moistureHighlight: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    moistureHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    moistureLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginLeft: 8,
      lineHeight: 18,
      flex: 1,
    },
    moistureValue: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 28,
    },
    
    // Fields Container
    fieldsContainer: {
      gap: 12,
    },
    fieldRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      minHeight: 44,
    },
    fieldKey: { 
      color: colors.textSecondary, 
      fontWeight: '500', 
      fontSize: 14,
      flex: 0.6,
      textTransform: 'capitalize',
      lineHeight: 18,
      paddingRight: 8,
    },
    fieldValue: { 
      color: colors.text, 
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'right',
      flex: 0.4,
      lineHeight: 18,
    },
    
    // Loading and Empty States
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 22,
    },
    emptyContainer: { 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 60,
      gap: 16,
    },
    emptyText: { 
      textAlign: 'center', 
      fontSize: 16, 
      lineHeight: 24,
      fontWeight: '500',
    },
    
    // Error Styles
    errorContainer: {
      backgroundColor: colors.surface || colors.card,
      borderRadius: 8,
      padding: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.warning || colors.error,
    },
    errorText: { 
      color: colors.warning || colors.error || colors.text, 
      textAlign: 'center', 
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    
    // Modal Styles
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    modalIconContainer: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    modalTitle: {
      fontWeight: '700',
      fontSize: 20,
      lineHeight: 24,
    },
    modalBody: {
      flex: 1,
      marginBottom: 20,
    },
    modalLoading: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      gap: 16,
    },
    closeButton: {
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    closeButtonText: {
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 20,
    },
  });
};

const pickerSelectStyles = (theme) => {
  const { colors } = theme;
  return StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      color: colors.text,
      backgroundColor: colors.surface || colors.card,
      marginBottom: 8,
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      color: colors.text,
      backgroundColor: colors.surface || colors.card,
      marginBottom: 8,
    },
  });
};

export default SoilMoistureScreen;