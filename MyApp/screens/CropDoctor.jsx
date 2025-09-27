import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { NetworkConfig } from '../utils/NetworkConfig';
import { useTranslation } from 'react-i18next';


// Simplified Animated Wrapper with clean effect
const AnimatedView = ({ children, style, delay = 0, direction = 'up' }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 400,
      delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = direction === 'up' ? 20 : -20;

  return (
    <Animated.View
      style={[
        {
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [translateY, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Simplified Loader with optimized animations
const LoadingAnimator = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [loadingText, setLoadingText] = useState(0);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(theme);

  const loadingSteps = [
    t('cropdoctor.analyzing_image', 'Analyzing image...'),
    t('cropdoctor.detecting_patterns', 'Detecting patterns...'),
    t('cropdoctor.identifying_disease', 'Identifying disease...'),
    t('cropdoctor.generating_report', 'Generating report...')
  ];

  useEffect(() => {
    // Simple rotation animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Text cycling
    const textInterval = setInterval(() => {
      setLoadingText(prev => (prev + 1) % loadingSteps.length);
    }, 1500);

    return () => clearInterval(textInterval);
  }, []);

  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        {/* Simple Circle Background */}
        <View style={styles.backgroundCircles}>
          <View style={[styles.backgroundCircle, styles.circle1]} />
        </View>
        
        {/* Main Loading Icon with optimized animation */}
        <Animated.View
          style={[
            styles.loadingIconContainer,
            { transform: [{ rotate: rotation }] },
          ]}
        >
          <MaterialCommunityIcons name="leaf" size={72} color={theme.colors.primary} />
        </Animated.View>

        <View style={styles.loadingTextContainer}>
          <Text style={styles.loadingTitle}>{t('cropdoctor.analyzing_title', 'Analyzing Your Crop')}</Text>
          <Text style={styles.loadingSubtitle}>{loadingSteps[loadingText]}</Text>
          
          {/* Progress Dots with simplified animation */}
          <View style={styles.progressDots}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= loadingText ? theme.colors.primary : theme.colors.surface,
                    width: index === loadingText ? 24 : 8,
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// Simplified Accordion with optimized animations
const Accordion = ({ title, children, initialExpanded = false, icon }) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const rotateAnim = useRef(new Animated.Value(initialExpanded ? 1 : 0)).current;
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const toggleExpansion = () => {
    // Using LayoutAnimation for height changes (simpler and more efficient)
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 250,
    });
    setExpanded(!expanded);
    
    // Animate just the rotation
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 250,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity 
        onPress={toggleExpansion} 
        style={styles.accordionHeader} 
        activeOpacity={0.7}
      >
        <View style={styles.accordionHeaderLeft}>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={20} 
              color={theme.colors.primary} 
              style={styles.accordionIcon} 
            />
          )}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Feather name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>
      
      {/* Content with layout animation */}
      {expanded && (
        <View style={styles.accordionContent}>
          <View style={styles.accordionDivider} />
          {children}
        </View>
      )}
    </View>
  );
};

// Enhanced Bounding Box with better visualization
const imageDisplayWidth = 320;
const imageDisplayHeight = 320;
const getBoxStyle = (box) => {
  if (!box) return {};
  const x = parseFloat(box.x);
  const y = parseFloat(box.y);
  const width = parseFloat(box.width);
  const height = parseFloat(box.height);
  return {
    top: (y / 100) * imageDisplayHeight,
    left: (x / 100) * imageDisplayWidth,
    width: (width / 100) * imageDisplayWidth,
    height: (height / 100) * imageDisplayHeight,
  };
};

// Main Screen Component
export default function CropDoctorScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = makeStyles(theme, insets);
  const { t } = useTranslation();

  const [status, setStatus] = useState('upload');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    return () => Speech.stop();
  }, []);

  const speakAnalysis = (analysisData) => {
    if (!analysisData?.diseaseName) return;
    const summary = t('cropdoctor.speech_summary', { 
      diseaseName: analysisData.diseaseName, 
      confidence: analysisData.confidence 
    }, `Analysis complete. The detected disease is ${analysisData.diseaseName} with a confidence of ${analysisData.confidence}.`);
    Speech.speak(summary, { language: 'en-US' });
  };

  const handleImageResult = async (result) => {
    if (!result?.canceled) {
      const userImageUri = result.assets[0].uri;
      setStatus('loading');
      try {
        const formData = new FormData();
        formData.append('image', {
          uri: userImageUri,
          name: 'crop.jpg',
          type: 'image/jpeg',
        });

        const response = await axios.post(`${NetworkConfig.API_BASE}/crop-disease/detect`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const backendAnalysis = response.data || {};
        const analysisWithUserImage = {
          diseaseName: backendAnalysis.diseaseName || 'Unknown',
          confidence: backendAnalysis.confidence || 'N/A',
          description: backendAnalysis.description || 'No description available.',
          symptoms: backendAnalysis.symptoms || [],
          solutions: backendAnalysis.solutions || [],
          boundingBoxes: backendAnalysis.boundingBoxes || [],
          userImageUri,
          processedImageUrl: backendAnalysis.processedImageUrl || userImageUri,
        };

        setAnalysis(analysisWithUserImage);
        setStatus('result');
        speakAnalysis(analysisWithUserImage);
      } catch (error) {
        console.error('Analysis Error:', error.message);
        setStatus('upload');
        Alert.alert(
          t('common.error', 'Error'),
          t('cropdoctor.analyze_failed', 'Failed to analyze image. Please try again.')
        );
      }
    }
  };

  const pickFromGallery = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    handleImageResult(result);
  };

  const takePhoto = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    handleImageResult(result);
  };

  const handleReset = () => {
    Speech.stop();
    setStatus('upload');
    setAnalysis(null);
  };

  const promptFollowUp = () => {
    Speech.stop();
    navigation.navigate('FollowUpScreen', { context: analysis });
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <LoadingAnimator />;
      case 'result':
        return (
          <View style={styles.resultContainer}>
            <ScrollView
              style={styles.resultScrollView}
              contentContainerStyle={styles.resultScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Enhanced Result Image */}
              <AnimatedView delay={0} style={styles.resultImageWrapper}>
                <View style={styles.resultImageContainer}>
                  <View style={styles.imageFrame}>
                    <ImageBackground
                      source={{ uri: analysis.processedImageUrl }}
                      style={styles.resultImage}
                      imageStyle={styles.resultImageStyle}
                    >
                      {/* Enhanced Bounding Boxes */}
                      {Array.isArray(analysis.boundingBoxes) &&
                        analysis.boundingBoxes.map((box, idx) => (
                          <View key={idx}>
                            <View style={[styles.boundingBox, getBoxStyle(box)]} />
                            <View style={[styles.boundingBoxCorner, styles.topLeft, getBoxStyle(box)]} />
                            <View style={[styles.boundingBoxCorner, styles.topRight, getBoxStyle(box)]} />
                            <View style={[styles.boundingBoxCorner, styles.bottomLeft, getBoxStyle(box)]} />
                            <View style={[styles.boundingBoxCorner, styles.bottomRight, getBoxStyle(box)]} />
                          </View>
                        ))}
                    </ImageBackground>
                  </View>
                  <View style={styles.imageOverlay}>
                    <View style={styles.analysisCompleteBadge}>
                      <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                      <Text style={styles.analysisCompleteBadgeText}>{t('cropdoctor.analysis_complete', 'Analysis Complete')}</Text>
                    </View>
                  </View>
                </View>
              </AnimatedView>

              {/* Improved Analysis Info */}
              <View style={styles.analysisContainer}>
                {/* Disease Card with highlighted information */}
                <View style={styles.diseaseCard}>
                  <View style={styles.diseaseCardHeader}>
                    <MaterialCommunityIcons 
                      name="virus" 
                      size={28} 
                      color={theme.colors.primary} 
                    />
                    <Text style={styles.diseaseLabel}>
                      {t('cropdoctor.detected_disease', 'Detected Disease')}
                    </Text>
                  </View>
                  <Text style={styles.diseaseTitle}>{analysis.diseaseName}</Text>
                  <View style={styles.confidenceBadge}>
                    <MaterialCommunityIcons name="target" size={16} color={theme.colors.primary} />
                    <Text style={styles.confidenceText}>
                      {t('cropdoctor.confidence', 'Confidence')}: {analysis.confidence}
                    </Text>
                  </View>
                </View>

                <Accordion 
                  title={t('cropdoctor.description', 'Description')} 
                  initialExpanded={true}
                  icon="information-outline"
                >
                  <Text style={styles.accordionBodyText}>{analysis.description}</Text>
                </Accordion>

                <Accordion 
                  title={t('cropdoctor.symptoms', 'Symptoms')}
                  icon="alert-circle-outline"
                >
                  <View style={styles.symptomsContainer}>
                    {analysis.symptoms.map((symptom, index) => (
                      <View key={index} style={styles.symptomItem}>
                        <MaterialCommunityIcons 
                          name="check-circle" 
                          size={16} 
                          color={theme.colors.primary} 
                        />
                        <Text style={styles.listItemText}>{symptom}</Text>
                      </View>
                    ))}
                  </View>
                </Accordion>

                <Accordion 
                  title={t('cropdoctor.solutions', 'Solutions')}
                  icon="lightbulb-outline"
                >
                  <View style={styles.solutionsContainer}>
                    {analysis.solutions.map((solution, index) => (
                      <View key={index} style={styles.solutionCard}>
                        <View style={styles.solutionHeader}>
                          <MaterialCommunityIcons 
                            name="check-circle" 
                            size={18} 
                            color={theme.colors.primary} 
                          />
                          <Text style={styles.solutionTitle}>{solution.title}</Text>
                        </View>
                        <Text style={styles.accordionBodyText}>{solution.details}</Text>
                      </View>
                    ))}
                  </View>
                </Accordion>
              </View>
            </ScrollView>

            {/* Enhanced Chat Input */}
            <SafeAreaView style={styles.chatInputSafeArea} edges={['bottom']}>
              <TouchableOpacity style={styles.chatButton} onPress={promptFollowUp} activeOpacity={0.8}>
                <View style={styles.chatButtonContent}>
                  <MaterialCommunityIcons name="microphone" size={24} color={theme.colors.background} />
                  <Text style={styles.chatButtonText}>{t('cropdoctor.ask_follow_up', 'Ask a follow-up question')}</Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={20} color={theme.colors.background} />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        );
      default:
        return (
          <ScrollView
            style={styles.uploadScrollView}
            contentContainerStyle={styles.uploadScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.uploadContainer}>
              <AnimatedView delay={0}>
                <View style={styles.uploadCard}>
                  <View style={styles.uploadIconContainer}>
                    <MaterialCommunityIcons name="cloud-upload" size={80} color={theme.colors.primary} />
                    <View style={styles.uploadIconOverlay}>
                      <MaterialCommunityIcons name="leaf" size={24} color={theme.colors.background} />
                    </View>
                  </View>
                  <Text style={styles.uploadTitle}>{t('cropdoctor.upload_title', 'Upload Crop Image')}</Text>
                  <Text style={styles.uploadSubtitle}>
                    {t('cropdoctor.upload_subtitle', 'Get instant AI-powered diagnosis for crop diseases and expert recommendations')}
                  </Text>
                  
                  <View style={styles.featuresContainer}>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="lightning-bolt" size={20} color={theme.colors.primary} />
                      <Text style={styles.featureText}>Instant Analysis</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="brain" size={20} color={theme.colors.primary} />
                      <Text style={styles.featureText}>AI-Powered</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="shield-check" size={20} color={theme.colors.primary} />
                      <Text style={styles.featureText}>Expert Solutions</Text>
                    </View>
                  </View>

                  <View style={styles.uploadButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.button, styles.primaryButton]} 
                      onPress={takePhoto}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="camera" size={24} color={theme.colors.background} />
                      <Text style={[styles.buttonText, { color: theme.colors.background }]}>
                        {t('cropdoctor.take_photo', 'Take Photo')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.secondaryButton]}
                      onPress={pickFromGallery}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="image" size={24} color={theme.colors.primary} />
                      <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                        {t('cropdoctor.pick_image', 'Choose from Gallery')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.supportedFormatsContainer}>
                    <MaterialCommunityIcons name="file-image" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.supportedFormatsText}>{t('cropdoctor.supported_formats', 'Supported: JPG, PNG, HEIC')}</Text>
                  </View>
                </View>
              </AnimatedView>
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="medical-bag" size={24} color={theme.colors.primary} />
              <Text style={styles.headerTitle}>{t('cropdoctor.title', 'Crop Doctor')}</Text>
            </View>
            <Text style={styles.headerSubtitle}>AI-Powered Disease Detection</Text>
          </View>
          <View style={styles.headerRightContainer}>
            {status === 'result' && (
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="refresh" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Main Content */}
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

// Enhanced Styles
const makeStyles = (theme, insets = {}) =>
  StyleSheet.create({
    safeArea: { 
      flex: 1, 
      backgroundColor: theme.colors.background 
    },
    container: { 
      flex: 1, 
      backgroundColor: theme.colors.background 
    },

    // Enhanced Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface,
      backgroundColor: theme.colors.background,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    headerButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 16,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: { 
      fontSize: 20, 
      fontWeight: '700', 
      color: theme.colors.text,
      marginLeft: 8,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginTop: 2,
    },
    headerRightContainer: {
      width: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Enhanced Upload Screen
    uploadScrollView: { flex: 1 },
    uploadScrollContainer: { 
      flexGrow: 1, 
      justifyContent: 'center',
      padding: 20,
    },
    uploadContainer: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    uploadCard: { 
      padding: 32, 
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      maxWidth: 400,
      width: '100%',
    },
    uploadIconContainer: {
      position: 'relative',
      marginBottom: 24,
    },
    uploadIconOverlay: {
      position: 'absolute',
      bottom: -8,
      right: -8,
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
    },
    uploadTitle: { 
      fontSize: 24, 
      fontWeight: '700', 
      marginBottom: 12, 
      color: theme.colors.text,
      textAlign: 'center',
    },
    uploadSubtitle: { 
      fontSize: 16, 
      textAlign: 'center', 
      marginBottom: 24, 
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    featuresContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 32,
      paddingHorizontal: 16,
    },
    featureItem: {
      alignItems: 'center',
      flex: 1,
    },
    featureText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      marginTop: 4,
      textAlign: 'center',
    },
    uploadButtonsContainer: { 
      width: '100%',
      gap: 16,
      marginBottom: 20,
    },
    button: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 16, 
      borderRadius: 16,
      minHeight: 56,
    },
    primaryButton: { 
      backgroundColor: theme.colors.primary,
      elevation: 3,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    secondaryButton: { 
      borderWidth: 2, 
      borderColor: theme.colors.primary,
      backgroundColor: 'transparent',
    },
    buttonText: { 
      marginLeft: 12, 
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButtonText: { 
      color: theme.colors.primary 
    },
    supportedFormatsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    supportedFormatsText: { 
      marginLeft: 8, 
      fontSize: 14, 
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },

    // Simplified Loader
    loadingContainer: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 20,
    },
    loadingContent: { 
      alignItems: 'center',
      position: 'relative',
    },
    backgroundCircles: {
      position: 'absolute',
      width: 200,
      height: 200,
    },
    backgroundCircle: {
      position: 'absolute',
      borderRadius: 100,
      opacity: 0.1,
    },
    circle1: {
      width: 160,
      height: 160,
      backgroundColor: theme.colors.primary,
      top: 20,
      left: 20,
    },
    loadingIconContainer: { 
      marginBottom: 32,
      position: 'relative',
      backgroundColor: theme.colors.surface,
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    loadingTextContainer: {
      alignItems: 'center',
      marginTop: 24,
    },
    loadingTitle: { 
      fontSize: 22, 
      fontWeight: '700', 
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    loadingSubtitle: { 
      fontSize: 16, 
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      height: 24, // Fixed height to prevent layout shifts
    },
    progressDots: {
      flexDirection: 'row',
      gap: 6,
      height: 8,
      alignItems: 'center',
    },
    progressDot: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.surface,
      transition: 'width 0.3s ease',
    },

    // Enhanced Result Screen
    resultContainer: { flex: 1 },
    resultScrollView: { flex: 1 },
    resultScrollContent: { 
      padding: 20,
      paddingBottom: 100,
    },
    resultImageWrapper: { 
      alignItems: 'center',
      marginBottom: 24,
    },
    resultImageContainer: { 
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    imageFrame: {
      padding: 4,
      backgroundColor: theme.colors.background,
      borderRadius: 20,
    },
    resultImage: { 
      width: imageDisplayWidth, 
      height: imageDisplayHeight,
      borderRadius: 16,
      overflow: 'hidden',
    },
    resultImageStyle: { 
      resizeMode: 'cover',
      borderRadius: 16,
    },
    boundingBox: { 
      position: 'absolute', 
      borderWidth: 2, 
      borderColor: '#FF4444',
      borderStyle: 'dashed',
      backgroundColor: 'rgba(255, 68, 68, 0.1)',
    },
    boundingBoxCorner: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderColor: '#FF4444',
      backgroundColor: '#FF4444',
      borderRadius: 6,
    },
    topLeft: { top: -6, left: -6 },
    topRight: { top: -6, right: -6 },
    bottomLeft: { bottom: -6, left: -6 },
    bottomRight: { bottom: -6, right: -6 },
    imageOverlay: { 
      position: 'absolute', 
      top: 12, 
      right: 12,
    },
    analysisCompleteBadge: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
      paddingHorizontal: 12,
      paddingVertical: 8, 
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#10B981',
    },
    analysisCompleteBadgeText: { 
      marginLeft: 6, 
      color: '#10B981', 
      fontWeight: '600',
      fontSize: 12,
    },

    // Improved Analysis Section
    analysisContainer: { 
      flex: 1,
    },
    diseaseCard: {
      marginBottom: 24,
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    diseaseCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    diseaseLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      marginLeft: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    diseaseTitle: { 
      fontSize: 26, 
      fontWeight: '700', 
      color: theme.colors.text,
      marginBottom: 16,
      lineHeight: 32,
    },
    confidenceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '15',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    confidenceText: { 
      fontSize: 14, 
      color: theme.colors.primary,
      fontWeight: '700',
      marginLeft: 8,
    },

    // Improved Accordion
    accordionContainer: { 
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    accordionHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 18,
      backgroundColor: theme.colors.surface,
    },
    accordionHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    accordionIcon: {
      marginRight: 12,
      opacity: 0.9,
    },
    accordionContent: { 
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    accordionDivider: {
      height: 1,
      backgroundColor: theme.colors.background,
      marginBottom: 16,
    },
    sectionTitle: { 
      fontSize: 17, 
      fontWeight: '600', 
      color: theme.colors.text,
      flex: 1,
    },
    accordionBodyText: { 
      fontSize: 15, 
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },

    // Improved Symptoms
    symptomsContainer: {
      gap: 12,
    },
    symptomItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.04)',
      paddingBottom: 12,
    },
    listItemText: { 
      fontSize: 15, 
      color: theme.colors.textSecondary,
      marginLeft: 12,
      flex: 1,
      lineHeight: 22,
    },

    // Improved Solutions
    solutionsContainer: {
      gap: 16,
    },
    solutionCard: { 
      padding: 16, 
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      marginBottom: 4,
    },
    solutionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    solutionTitle: { 
      fontSize: 16, 
      fontWeight: '600', 
      color: theme.colors.text,
      marginLeft: 10,
      flex: 1,
    },

    // Enhanced Chat Input
    chatInputSafeArea: { 
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
      borderTopWidth: 1, 
      borderTopColor: theme.colors.surface,
      backgroundColor: theme.colors.background,
    },
    chatButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      backgroundColor: theme.colors.primary, 
      paddingHorizontal: 20,
      paddingVertical: 16, 
      borderRadius: 16,
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    chatButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    chatButtonText: { 
      marginLeft: 12, 
      fontSize: 16, 
      color: theme.colors.background, 
      fontWeight: '600',
      flex: 1,
    },
  });