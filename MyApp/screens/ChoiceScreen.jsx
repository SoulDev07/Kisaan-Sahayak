import React, { useState, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, Dimensions, Modal, ScrollView, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// --- ASYNC STORAGE IMPORT ---
// You need to install this library to store the user's mode choice
// expo install @react-native-async-storage/async-storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AnimatedLoading from '../components/AnimatedLoading';
import { useTranslation } from 'react-i18next';
import { NetworkConfig } from '../utils/NetworkConfig';
import { useTheme } from '../context/ThemeContext';
import { setLanguage } from '../i18n';

const API_BASE = NetworkConfig.API_BASE;
const FARMER_ID = 'f001';
const { width, height } = Dimensions.get('window');

// Interactive Guide Tooltip Component for ChoiceScreen
function InteractiveGuideTooltip({ step, onNext, onSkip }) {
  const { t } = useTranslation();
  const getTooltipPosition = () => {
    switch (step.target) {
      case 'voiceButton':
        return {
          top: height * 0.35,
          alignSelf: 'center',
        };
      case 'manualButton':
        return {
          top: height * 0.55,
          alignSelf: 'center',
        };
      case 'profileIcon':
        return {
          top: height * 0.15,
          right: 20,
        };
      case 'soilButton':
        return {
          bottom: height * 0.25,
          alignSelf: 'center',
        };
      case 'helpButton':
        return {
          bottom: height * 0.15,
          right: 20,
        };
      case 'screen':
      default:
        return {
          top: height * 0.3,
          alignSelf: 'center',
        };
    }
  };

  return (
    <View style={[styles.tooltip, getTooltipPosition()]}>
      {/* Pointer Arrow */}
      {step.position === 'bottom' && <View style={styles.tooltipArrowDown} />}
      {step.position === 'top' && <View style={styles.tooltipArrowUp} />}
      
      <View style={styles.tooltipContent}>
          <Text style={styles.tooltipTitle}>{step.title}</Text>
        <Text style={styles.tooltipMessage}>{step.message}</Text>
        
        <View style={styles.tooltipButtons}>
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>{t('choice.tour.skip', 'Skip Tour')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>
              {step.id === 'help_features' ? t('choice.tour.got_it', 'Got it!') : t('choice.tour.next', 'Next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function ChoiceScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [showHelp, setShowHelp] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  // Onboarding states
  const [showInteractiveGuide, setShowInteractiveGuide] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  ];

  const handleLanguageChange = async (languageCode) => {
    try {
  // optimistically update selected language then persist & apply
  setSelectedLanguage(languageCode);
  await setLanguage(languageCode);
  setShowLanguageDropdown(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to change language');
    }
  };

  // Interactive onboarding steps for ChoiceScreen
  const ONBOARDING_STEPS = [
    {
      id: 'welcome',
      title: t('choice.onboarding.welcome_title') || 'Welcome!',
      message: t('choice.onboarding.welcome_message') || 'Let\'s take a quick tour of the app features.',
      target: 'screen',
      position: 'center'
    },
    {
      id: 'voice_mode',
      title: t('choice.onboarding.voice_title') || 'Voice Mode',
      message: t('choice.onboarding.voice_message') || 'Use voice commands to interact with the AI assistant.',
      target: 'voiceButton',
      position: 'top'
    },
    {
      id: 'manual_mode',
      title: t('choice.onboarding.manual_title') || 'Manual Mode',
      message: t('choice.onboarding.manual_message') || 'Type your questions and get instant responses.',
      target: 'manualButton',
      position: 'top'
    },
    {
      id: 'profile_access',
      title: t('choice.onboarding.profile_title') || 'Profile',
      message: t('choice.onboarding.profile_message') || 'Access your profile and settings here.',
      target: 'profileIcon',
      position: 'bottom'
    },
    {
      id: 'market_prices',
      title: t('choice.onboarding.market_title') || 'Market Prices',
      message: t('choice.onboarding.market_message') || 'Check current market prices for your crops.',
      target: 'marketButton',
      position: 'bottom'
    },
    {
      id: 'help_features',
      title: t('choice.onboarding.help_title') || 'Help',
      message: t('choice.onboarding.help_message') || 'Get help and support whenever you need it.',
      target: 'helpButton',
      position: 'bottom'
    }
  ];

  // Check if user has seen onboarding before
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenGuide = await AsyncStorage.getItem('choiceScreenOnboardingCompleted');
      console.log('Onboarding status check:', hasSeenGuide);
      
      if (!hasSeenGuide) {
        console.log('First-time user detected, starting onboarding...');
        setTimeout(() => {
          setShowInteractiveGuide(true);
          setOnboardingStep(0);
        }, 500);
      } else {
        console.log('Returning user, onboarding already completed');
      }
      setHasSeenOnboarding(!!hasSeenGuide);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setTimeout(() => {
        setShowInteractiveGuide(true);
        setOnboardingStep(0);
      }, 1500);
    }
  };

  const startInteractiveGuide = () => {
    console.log('Starting interactive guide manually...');
    setShowInteractiveGuide(true);
    setOnboardingStep(0);
  };

  // Debug function to reset onboarding (for testing)
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('choiceScreenOnboardingCompleted');
      setHasSeenOnboarding(false);
      console.log('Onboarding reset - will show on next app start');
  Alert.alert(t('debug.title', 'Debug'), t('onboarding.reset_message', 'Onboarding reset! Restart the app to see it again.'));
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const nextOnboardingStep = () => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const skipOnboarding = async () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    setShowInteractiveGuide(false);
    setOnboardingStep(0);
    setHasSeenOnboarding(true);
    
    try {
      await AsyncStorage.setItem('choiceScreenOnboardingCompleted', 'true');
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  };

  // Debug: log loading state changes
  useEffect(() => {
    console.log('ChoiceScreen mounted');
    return () => {
      console.log('ChoiceScreen unmounted');
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('ChoiceScreen focused');
      return () => {
        console.log('ChoiceScreen unfocused');
      };
    }, [])
  );

  const handleModeSelection = async (mode, screen) => {
    try {
      await AsyncStorage.setItem('userMode', mode);
      // Ensure the selected language is applied before navigating so subsequent screens render
      // in the chosen language. If no change is needed this resolves quickly.
      const currentLang = i18n.language || 'en';
      if (selectedLanguage && selectedLanguage !== currentLang) {
        await setLanguage(selectedLanguage);
      }
      const newChat = {
        id: Date.now().toString(),
        title: t('voicechat.new_chat') || 'New Chat',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        messages: [],
        context: { weather: '', soil: '', market: '' }
      };
      // Navigate immediately
      navigation.navigate(screen, { context: { weather: '', soil: '', market: '' } });
      // Fire and forget the API call
      axios.post(`${API_BASE}/farmer/${FARMER_ID}/chat`, newChat)
        .catch(() => {
          // Optionally show a toast or log error, but don't block navigation
        });
    } catch (e) {
      Alert.alert(t('common.error') || 'Error', t('choice.error_start_chat') || 'Failed to start chat');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={theme.colors.statusBarStyle} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Icons */}
        <View style={styles.headerContainer}>
          {/* Language Menu Button */}
          <TouchableOpacity
            style={[styles.languageButton, { 
              backgroundColor: `${theme.colors.primary}15`, 
              borderColor: `${theme.colors.primary}30` 
            }]}
            onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            accessibilityLabel={t('choice.language_button', 'Change language')}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="globe-outline" size={24} color="#FF6B00" />
          </TouchableOpacity>
          
          {/* Settings Icon */}
          <TouchableOpacity
            style={[styles.settingsButton, { 
              backgroundColor: `${theme.colors.primary}15`, 
              borderColor: `${theme.colors.primary}30` 
            }]}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel={t('choice.settings_button', 'Settings')}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color="#0D47A1" />
          </TouchableOpacity>
        </View>

        {/* App Logo & Title Section */}
        <View style={styles.titleSection}>
          <View style={[styles.logoContainer, { 
            // removed background and border per request
            backgroundColor: 'transparent',
            borderColor: 'transparent'
          }]}>
            {/* App logo image replaces placeholder icon — no border/background */}
            <Image
              source={isDark ? require('../assets/logo_light.png') : require('../assets/logo.png')}
              style={styles.logoImageLarge}
              resizeMode="contain"
            />
          </View>
          {/* <Text style={[styles.title, { color: theme.colors.primary }]}>
            {t('choice.title') || 'FarmBot'}
          </Text> */}
          {/* <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('choice.subtitle') || 'Your Smart Farming Assistant'}
          </Text> */}
        </View>
        
        {/* Main Mode Selection */}
        <View style={styles.modeSelectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('choice.choose_mode', 'Choose Interaction Mode')}
          </Text>
          
          <TouchableOpacity 
            style={[styles.primaryModeButton, { 
              backgroundColor: theme.colors.surface, 
              borderColor: theme.colors.primary,
              shadowColor: theme.colors.primary 
            }]} 
            onPress={() => handleModeSelection('voice', 'LiveVoiceScreen')}
            activeOpacity={0.85}
          >
            <View style={[styles.modeIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
              <MaterialCommunityIcons name="microphone" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.modeTextContainer}>
              <Text style={[styles.modeTitle, { color: theme.colors.text }]}>
                {t('choice.voice_pilot') || 'Voice Mode'}
              </Text>
              <Text style={[styles.modeDescription, { color: theme.colors.textSecondary }]}>
                {t('choice.voice_description', 'Speak naturally to get instant farming advice')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.orText, { color: theme.colors.textSecondary }]}>
              {t('choice.or', 'OR')}
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          </View>
          
          <TouchableOpacity 
            style={[styles.primaryModeButton, { 
              backgroundColor: theme.colors.surface, 
              borderColor: theme.colors.primary,
              shadowColor: theme.colors.primary 
            }]} 
            onPress={() => handleModeSelection('manual', 'VoiceChatInputScreen')}
            activeOpacity={0.85}
          >
            <View style={[styles.modeIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Ionicons name="create-outline" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.modeTextContainer}>
              <Text style={[styles.modeTitle, { color: theme.colors.text }]}>
                {t('choice.manual_mode') || 'Text Mode'}
              </Text>
              <Text style={[styles.modeDescription, { color: theme.colors.textSecondary }]}>
                {t('choice.text_description', 'Type your questions for detailed responses')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Quick Access Features */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('choice.quick_access', 'Quick Access')}
          </Text>
          
          <View style={styles.featuresGrid}>
            <TouchableOpacity 
              style={[styles.featureCard, { 
                backgroundColor: theme.colors.surface, 
                borderColor: theme.colors.border 
              }]} 
              onPress={() => navigation.navigate('BestOutOfWasteScreen')}
              activeOpacity={0.8}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: '#E8F5E8' }]}>
                <Text style={styles.featureEmoji}>♻️</Text>
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                Best Out of Waste
              </Text>
              <Text style={[styles.featureSubtitle, { color: theme.colors.textSecondary }]}>
                Sustainable solutions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureCard, { 
                backgroundColor: theme.colors.surface, 
                borderColor: theme.colors.border 
              }]} 
              onPress={() => navigation.navigate('MarketplaceScreen')}
              activeOpacity={0.8}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="trending-up" size={24} color="#FF9800" />
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t('choice.view_market_prices') || 'Market Prices'}
              </Text>
              <Text style={[styles.featureSubtitle, { color: theme.colors.textSecondary }]}>
                Real-time rates
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Help Button - Fixed Position */}
      <View style={styles.helpContainer}>
        {showHelp && (
          <View style={[styles.helpCard, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border 
          }]}>
            <Text style={[styles.helpCardText, { color: theme.colors.text }]}>
              {t('choice.help_text') || 'Choose voice mode for hands-free interaction or text mode for typing. Access market prices and sustainable farming tips from quick access section.'}
            </Text>
          </View>
        )}
        <TouchableOpacity 
          style={[styles.helpButton, { 
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary 
          }]} 
          onPress={() => setShowHelp(!showHelp)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Language Dropdown Modal */}
      <Modal
        visible={showLanguageDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageDropdown(false)}
        >
          <View style={[styles.languageModal, { 
            backgroundColor: theme.colors.card, 
            borderColor: theme.colors.border 
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {t('choice.select_language', 'Select Language')}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowLanguageDropdown(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    { backgroundColor: theme.colors.surface },
                    i18n.language === language.code && { 
                      borderColor: theme.colors.primary, 
                      backgroundColor: `${theme.colors.primary}15` 
                    }
                  ]}
                  onPress={() => handleLanguageChange(language.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={[
                    styles.languageName,
                    { color: theme.colors.text },
                    i18n.language === language.code && { 
                      color: theme.colors.primary, 
                      fontWeight: '600' 
                    }
                  ]}>
                    {language.name}
                  </Text>
                  {i18n.language === language.code && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Interactive Guide Overlay */}
      {showInteractiveGuide && (
        <View style={styles.guideOverlay}>
          <TouchableOpacity 
            style={styles.guideOverlayBackground}
            onPress={nextOnboardingStep}
            activeOpacity={1}
          />
          <InteractiveGuideTooltip 
            step={ONBOARDING_STEPS[onboardingStep]}
            onNext={nextOnboardingStep}
            onSkip={skipOnboarding}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  
  // Header Section
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  languageButton: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  settingsButton: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 0,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
  },
  logoImageLarge: {
    width: 270,
    height: 280,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },

  // Mode Selection Section
  modeSelectionContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.8,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
    opacity: 0.6,
  },

  // Features Section
  featuresSection: {
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },

  // Help Section
  helpContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  helpButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  helpCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    maxWidth: width * 0.7,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  helpCardText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Language Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  languageModal: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    maxHeight: height * 0.7,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  languageFlag: {
    fontSize: 22,
    marginRight: 16,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },

  // Interactive Guide Styles
  guideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  guideOverlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    maxWidth: width - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  tooltipArrowDown: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  tooltipArrowUp: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  tooltipContent: {
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  tooltipMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  tooltipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});