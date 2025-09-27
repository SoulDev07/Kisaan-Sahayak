import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
  Modal,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { NetworkConfig } from '../utils/NetworkConfig';
import WasteRecyclingService from '../services/WasteRecyclingService';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const BestOutOfWasteScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [commonPractices, setCommonPractices] = useState([]);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [location, setLocation] = useState('farm');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const practiceFlatListRef = useRef(null);

  const API_BASE = NetworkConfig.API_BASE;

  useEffect(() => {
    fetchCommonPractices();

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
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (practiceFlatListRef.current && commonPractices.length > 0) {
      practiceFlatListRef.current.scrollToIndex({
        index: currentPracticeIndex,
        animated: true,
      });
    }
  }, [currentPracticeIndex, commonPractices]);

  const fetchCommonPractices = async () => {
    try {
      const result = await WasteRecyclingService.getCommonPractices();
      if (result.success) {
        setCommonPractices(result.data.practices || []);
      } else {
        console.log('Error fetching common practices:', result.error);
        setCommonPractices(result.data.practices || []);
      }
    } catch (error) {
      console.log('Error fetching common practices:', error);
      setCommonPractices([]);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('bestout.permission_needed'), t('bestout.permission_message'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const picked = result.assets[0];
        setSelectedImage(picked);
        setAiSuggestions([]);
        // Automatically analyze immediately after picking an image
        // keep manual analyze button as well
        setTimeout(() => {
          analyzeWaste();
        }, 300);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('bestout.pick_image_failed'));
    }
  };

  const analyzeWaste = async () => {
    if (!selectedImage) {
      Alert.alert(t('bestout.no_image_title'), t('bestout.no_image_message'));
      return;
    }

    setAnalyzing(true);
    try {
      const result = await WasteRecyclingService.analyzeWaste(selectedImage, location, 'f001');

      if (result.success) {
        setAiSuggestions(result.data.ai_suggestions || []);
        const newAnalysis = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          location: location,
          suggestions_count: result.data.ai_suggestions?.length || 0,
          image_uri: selectedImage.uri,
        };
        setAnalysisHistory(prev => [newAnalysis, ...prev]);
        Alert.alert(t('common.success'), t('bestout.analysis_complete'));
      } else {
        console.error('Analysis failed:', result.error);
        setAiSuggestions(result.data.ai_suggestions || []);
        Alert.alert(t('common.success'), t('bestout.analysis_fallback'));
      }
    } catch (error) {
      console.error('Error analyzing waste:', error);
      Alert.alert(t('common.error'), t('bestout.analysis_failed'));
    } finally {
      setAnalyzing(false);
    }
  };

  const openPracticeModal = (practice) => {
    setSelectedPractice(practice);
    setShowPracticeModal(true);
  };

  const onPracticeScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = screenWidth - 60 + 15;
    const index = Math.round(contentOffsetX / itemWidth);
    setCurrentPracticeIndex(index);
  };

  const goToNextPractice = () => {
    if (currentPracticeIndex < commonPractices.length - 1) {
      setCurrentPracticeIndex(prev => prev + 1);
    }
  };

  const goToPreviousPractice = () => {
    if (currentPracticeIndex > 0) {
      setCurrentPracticeIndex(prev => prev - 1);
    }
  };

  const renderPracticeCard = ({ item: practice, index }) => (
    <TouchableOpacity
      style={styles.practiceCard}
      onPress={() => openPracticeModal(practice)}
      activeOpacity={0.8}
    >
      <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient colors={['#1C1C1E', '#2C2C2E']} style={styles.practiceCardGradient}>
          <View style={styles.practiceHeader}>
            <Text style={styles.practiceIcon}>{practice.icon}</Text>
            <View style={styles.practiceInfo}>
              <Text style={styles.practiceTitle}>{practice.title}</Text>
              <Text style={styles.practiceDescription}>{practice.description}</Text>
            </View>
          </View>
          <View style={styles.practiceDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('bestout.difficulty')}</Text>
              <Text style={styles.detailValue}>{practice.difficulty}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('bestout.time_required')}</Text>
              <Text style={styles.detailValue}>{practice.time_required}</Text>
            </View>
          </View>
          <View style={styles.practiceButtonsContainer}>
            <View style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>{t('bestout.view_details')}</Text>
              <Ionicons name="chevron-forward" size={16} color="#10B981" />
            </View>
            {practice.youtube_url && (
              <TouchableOpacity
                style={styles.practiceYoutubeButton}
                onPress={(e) => {
                  e.stopPropagation();
                  Linking.openURL(practice.youtube_url);
                }}
              >
                <LinearGradient colors={['#FF0000', '#CC0000']} style={styles.practiceYoutubeGradient}>
                  <Ionicons name="play-circle" size={14} color="#FFFFFF" />
                  <Text style={styles.practiceYoutubeText}>{t('bestout.video')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderAISuggestion = ({ item: suggestion, index }) => {
    let description = '';
    let youtubeUrl = null;
    if (typeof suggestion === 'string') {
      description = suggestion;
    } else if (suggestion && typeof suggestion === 'object') {
      description = suggestion.description || suggestion.text || JSON.stringify(suggestion);
      youtubeUrl = suggestion.youtube_url || suggestion.youtubeUrl || null;
    } else {
      description = t('bestout.no_suggestion');
    }

    return (
      <Animated.View style={[styles.suggestionCard, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.suggestionGradient}>
          <View style={styles.suggestionHeader}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            <Text style={styles.suggestionNumber}>{t('bestout.suggestion_number', { number: index + 1 })}</Text>
          </View>
          <Text style={styles.suggestionText}>{description}</Text>
          {youtubeUrl && (
            <TouchableOpacity style={styles.youtubeButton} onPress={() => Linking.openURL(youtubeUrl)}>
              <LinearGradient colors={['#FF0000', '#CC0000']} style={styles.youtubeGradient}>
                <Ionicons name="play-circle" size={16} color="#FFFFFF" />
                <Text style={styles.youtubeButtonText}>{t('bestout.watch_video')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBarStyle} />
      <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('bestout.header_title')}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{t('bestout.header_subtitle')}</Text>
        </View>
        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(!showHistory)}>
          <Ionicons name="time" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </LinearGradient>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('bestout.upload_title')}</Text>
          <Text style={styles.sectionSubtitle}>{t('bestout.upload_subtitle')}</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={analyzing}>
            <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.uploadGradient}>
              <Ionicons name="camera" size={32} color="#FFFFFF" />
              <Text style={styles.uploadText}>{selectedImage ? t('bestout.change_image') : t('bestout.select_image')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.analyzeButton} onPress={analyzeWaste} disabled={analyzing}>
                <LinearGradient colors={analyzing ? ['#6B7280', '#4B5563'] : ['#10B981', '#059669']} style={styles.analyzeGradient}>
                  {analyzing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.analyzeText}>{analyzing ? t('bestout.analyzing') : t('bestout.analyze_button')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {aiSuggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('bestout.ai_suggestions_title')}</Text>
            <Text style={styles.sectionSubtitle}>{t('bestout.ai_suggestions_subtitle')}</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={aiSuggestions}
              renderItem={renderAISuggestion}
              keyExtractor={(item, index) => `ai-suggestion-${index}`}
              contentContainerStyle={styles.suggestionsCarousel}
              snapToInterval={screenWidth - 40 + 10}
              decelerationRate="fast"
              pagingEnabled
            />
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('bestout.common_practices_title')}</Text>
          <Text style={styles.sectionSubtitle}>{t('bestout.common_practices_subtitle')}</Text>
          {commonPractices.length > 0 ? (
            <>
              <View style={styles.practicesCarouselContainer}>
                <TouchableOpacity onPress={goToPreviousPractice} style={[styles.carouselArrow, currentPracticeIndex === 0 && styles.disabledArrow]} disabled={currentPracticeIndex === 0}>
                  <Ionicons name="chevron-back" size={30} color="#FFF" />
                </TouchableOpacity>
                <FlatList
                  ref={practiceFlatListRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={commonPractices}
                  renderItem={renderPracticeCard}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.practicesCarouselContent}
                  onMomentumScrollEnd={onPracticeScrollEnd}
                  snapToInterval={screenWidth - 60 + 15}
                  decelerationRate="fast"
                  pagingEnabled
                />
                <TouchableOpacity onPress={goToNextPractice} style={[styles.carouselArrow, currentPracticeIndex === commonPractices.length - 1 && styles.disabledArrow]} disabled={currentPracticeIndex === commonPractices.length - 1}>
                  <Ionicons name="chevron-forward" size={30} color="#FFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.paginationDots}>
                {commonPractices.map((_, index) => (
                  <View key={index} style={[styles.dot, index === currentPracticeIndex ? styles.activeDot : null]} />
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>{t('bestout.no_practices')}</Text>
          )}
        </View>
        {showHistory && analysisHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('bestout.history_title')}</Text>
            <Text style={styles.sectionSubtitle}>{t('bestout.history_subtitle')}</Text>
            {analysisHistory.map((analysis) => (
              <View key={analysis.id} style={styles.historyCard}>
                <LinearGradient colors={['#1C1C1E', '#2C2C2E']} style={styles.historyGradient}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>{new Date(analysis.timestamp).toLocaleDateString()}</Text>
                    <Text style={styles.historyLocation}>{analysis.location}</Text>
                  </View>
                  <Text style={styles.historySuggestions}>{t('bestout.suggestions_generated', { count: analysis.suggestions_count })}</Text>
                  {analysis.image_uri && <Image source={{ uri: analysis.image_uri }} style={styles.historyImagePreview} />}
                </LinearGradient>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal visible={showPracticeModal} animationType="slide" transparent={true} onRequestClose={() => setShowPracticeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#000000', '#1C1C1E']} style={styles.modalGradient}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedPractice?.icon} {selectedPractice?.title}</Text>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowPracticeModal(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalDescription}>{selectedPractice?.description}</Text>
                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>{t('bestout.difficulty')}</Text>
                    <Text style={styles.modalDetailValue}>{selectedPractice?.difficulty}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>{t('bestout.time_required')}</Text>
                    <Text style={styles.modalDetailValue}>{selectedPractice?.time_required}</Text>
                  </View>
                </View>
                {selectedPractice?.materials_needed && selectedPractice.materials_needed.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>{t('bestout.materials_needed')}</Text>
                    {selectedPractice.materials_needed.map((material, index) => (
                      <Text key={index} style={styles.modalListItem}>• {material}</Text>
                    ))}
                  </View>
                )}
                {selectedPractice?.steps && selectedPractice.steps.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>{t('bestout.steps')}</Text>
                    {selectedPractice.steps.map((step, index) => (
                      <Text key={index} style={styles.modalListItem}>{index + 1}. {step}</Text>
                    ))}
                  </View>
                )}
                {selectedPractice?.youtube_url && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>{t('bestout.learn_more')}</Text>
                    <TouchableOpacity style={styles.modalYoutubeButton} onPress={() => Linking.openURL(selectedPractice.youtube_url)}>
                      <LinearGradient colors={['#FF0000', '#CC0000']} style={styles.modalYoutubeGradient}>
                        <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.modalYoutubeText}>{t('bestout.watch_youtube_tutorial')}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  historyButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  uploadButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
  },
  uploadGradient: {
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  imagePreview: {
    width: screenWidth - 80,
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  analyzeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '80%',
    alignSelf: 'center',
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  analyzeText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  suggestionsCarousel: {
    paddingRight: 10,
    paddingVertical: 5, // Add some vertical padding for shadow
  },
  suggestionCard: {
    width: screenWidth - 40,
    marginRight: 10,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionGradient: {
    padding: 20,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  suggestionNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  suggestionText: {
    color: '#E0E0E0',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  youtubeButton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  youtubeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  youtubeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  practicesCarouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  carouselArrow: {
    padding: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 50,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  disabledArrow: {
    opacity: 0.5,
  },
  practicesCarouselContent: {
    paddingHorizontal: 5, // Small padding for arrows
    alignItems: 'center',
  },
  practiceCard: {
    width: screenWidth - 60,
    marginHorizontal: 7.5,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  practiceCardGradient: {
    padding: 20,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  practiceIcon: {
    fontSize: 38,
    marginRight: 15,
    color: '#FFD700',
  },
  practiceInfo: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  practiceDescription: {
    fontSize: 15,
    color: '#B0B0B0',
    lineHeight: 22,
  },
  practiceDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  detailValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    flex: 1,
  },
  viewDetailsText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 5,
  },
  practiceButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  practiceYoutubeButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 10,
  },
  practiceYoutubeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  practiceYoutubeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4B5563',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#10B981',
    width: 12,
  },
  noDataText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  historyCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  historyGradient: {
    padding: 18,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyLocation: {
    fontSize: 15,
    color: '#10B981',
    backgroundColor: '#05966930',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historySuggestions: {
    fontSize: 15,
    color: '#B0B0B0',
    marginBottom: 10,
  },
  historyImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: 'cover',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth - 40,
    maxHeight: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  modalCloseButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 50,
  },
  modalBody: {
    padding: 25,
  },
  modalDescription: {
    fontSize: 17,
    color: '#E0E0E0',
    lineHeight: 26,
    marginBottom: 25,
  },
  modalDetails: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalDetailLabel: {
    fontSize: 17,
    color: '#9CA3AF',
  },
  modalDetailValue: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: 25,
  },
  modalSectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
    paddingBottom: 5,
  },
  modalListItem: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 25,
    marginBottom: 8,
    paddingLeft: 10,
  },
  modalYoutubeButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 15,
  },
  modalYoutubeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  modalYoutubeText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
});

export default BestOutOfWasteScreen;