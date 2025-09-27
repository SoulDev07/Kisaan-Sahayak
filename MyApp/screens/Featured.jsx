import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Dimensions, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const FARMER_ID = 'f001';
const { width } = Dimensions.get('window');

// Interactive Guide Tooltip Component for FeaturedScreen
function InteractiveGuideTooltip({ step, onNext, onSkip }) {
  const { theme } = useTheme();
  const getTooltipPosition = () => {
    switch (step.target) {
      case 'backButton':
        return {
          top: 110, // Below the back button
          left: 20,
        };
      case 'profileIcon':
        return {
          top: 110, // Below the profile icon
          right: 20,
        };
      case 'cropDoctor':
        return {
          top: 200, // Below the crop doctor card
          alignSelf: 'center',
        };
      case 'cropCycle':
        return {
          top: 280, // Below the crop cycle card
          alignSelf: 'center',
        };
      case 'weather':
        return {
          top: 360, // Below the weather card
          alignSelf: 'center',
        };
      case 'quickActions':
        return {
          top: '55%', // Above the quick actions section
          alignSelf: 'center',
        };
      case 'marketCard':
        return {
          top: '65%', // Above the market card
          left: 30,
        };
      case 'calendarCard':
        return {
          top: '65%', // Above the calendar card
          right: 30,
        };
      case 'toolsList':
        return {
          bottom: 150, // Above the tools list
          alignSelf: 'center',
        };
      case 'screen':
      default:
        return {
          top: '35%', // Center of screen for welcome message
          alignSelf: 'center',
        };
    }
  };

  return (
    <View style={[styles.tooltip, getTooltipPosition(), { backgroundColor: theme.colors.surface }]}>
      {/* Pointer Arrow */}
      {step.position === 'bottom' && <View style={[styles.tooltipArrowDown, { borderTopColor: theme.colors.surface }]} />}
      {step.position === 'top' && <View style={[styles.tooltipArrowUp, { borderBottomColor: theme.colors.surface }]} />}
      {/* No arrow for center position */}
      
      <View style={styles.tooltipContent}>
        <Text style={[styles.tooltipTitle, { color: theme.colors.text }]}>{step.title}</Text>
        <Text style={[styles.tooltipMessage, { color: theme.colors.textSecondary }]}>{step.message}</Text>
        
        <View style={styles.tooltipButtons}>
          <TouchableOpacity style={[styles.skipButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]} onPress={onSkip}>
            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>Skip Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.nextButton, { backgroundColor: theme.colors.primary }]} onPress={onNext}>
            <Text style={[styles.nextButtonText, { color: theme.colors.headerTitle }]}>
              {step.id === 'tools_exploration' ? 'Got it!' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const tools = [
  {
    id: 'cattle-care',
    icon: <MaterialCommunityIcons name="paw" size={24} color="#f59e42" />, bg: '#78350f',
    titleKey: 'featured.cattle_care', subtitleKey: 'featured.cattle_care_subtitle', screen: 'CattleScreen',
  },
  {
    id: 'agrifinance',
    icon: <MaterialCommunityIcons name="wallet-outline" size={24} color="#6366f1" />, bg: '#1e40af',
    titleKey: 'featured.agrifinance', subtitleKey: 'featured.agrifinance_subtitle', screen: 'UPI',
  },
  {
    id: 'rental-system',
    icon: <FontAwesome5 name="car" size={22} color="#fbbf24" />, bg: '#78350f',
    titleKey: 'featured.rental_system', subtitleKey: 'featured.rental_system_subtitle', screen: 'RentalScreen',
  },
  {
    id: 'document-builder',
    icon: <MaterialCommunityIcons name="file-document-outline" size={24} color="#38bdf8" />, bg: '#0e7490',
    titleKey: 'featured.document_builder', subtitleKey: 'featured.document_builder_subtitle', screen: 'DocumentAgentScreen',
  },
];

export default function Featured({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // Onboarding states
  const [showInteractiveGuide, setShowInteractiveGuide] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Interactive onboarding steps for FeaturedScreen
  const ONBOARDING_STEPS = [
    {
      id: 'welcome',
      title: 'Welcome to Featured Tools! ⭐',
      message: 'Discover all the powerful farming tools and features available to help you succeed in agriculture.',
      target: 'screen',
      position: 'center'
    },
    {
      id: 'navigation',
      title: 'Easy Navigation 🔙',
      message: 'Use this back button to return to the previous screen anytime.',
      target: 'backButton',
      position: 'bottom'
    },
    {
      id: 'profile_access',
      title: 'Your Profile 👤',
      message: 'Access your farmer profile and personal settings from here.',
      target: 'profileIcon',
      position: 'bottom'
    },
    {
      id: 'crop_doctor',
      title: 'Crop Doctor 🌱',
      message: 'Get AI-powered diagnosis for crop diseases and health issues. Upload photos for instant analysis.',
      target: 'cropDoctor',
      position: 'bottom'
    },
    {
      id: 'crop_cycle',
      title: 'Crop Cycle Management 🔄',
      message: 'Track your crop growth cycles, planting schedules, and harvest planning.',
      target: 'cropCycle',
      position: 'bottom'
    },
    {
      id: 'weather_info',
      title: 'Weather Insights 🌤️',
      message: 'Get detailed weather forecasts and agricultural weather advisories for your location.',
      target: 'weather',
      position: 'bottom'
    },
    {
      id: 'quick_actions',
      title: 'Quick Actions ⚡',
      message: 'Access frequently used features quickly from these convenient shortcuts.',
      target: 'quickActions',
      position: 'top'
    },
    {
      id: 'market_prices',
      title: 'Market Prices 📈',
      message: 'Check current market rates for your crops to make informed selling decisions.',
      target: 'marketCard',
      position: 'bottom'
    },
    {
      id: 'farming_calendar',
      title: 'Farming Calendar 📅',
      message: 'Plan your farming activities with seasonal calendars and important agricultural dates.',
      target: 'calendarCard',
      position: 'bottom'
    },
    {
      id: 'tools_exploration',
      title: 'Explore All Tools 🛠️',
      message: 'Browse through all available farming tools including finance, rentals, document builder, and cattle management.',
      target: 'toolsList',
      position: 'bottom'
    }
  ];

  // Check if user has seen onboarding before
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenGuide = await AsyncStorage.getItem('featuredScreenOnboardingCompleted');
      console.log('FeaturedScreen onboarding status:', hasSeenGuide);
      
      if (!hasSeenGuide) {
        console.log('First-time user detected, starting onboarding...');
        // Start onboarding after a short delay
        setTimeout(() => {
          setShowInteractiveGuide(true);
          setOnboardingStep(0);
        }, 1500); // Delay to ensure UI is ready
      } else {
        console.log('Returning user, onboarding already completed');
      }
      setHasSeenOnboarding(!!hasSeenGuide);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // If there's an error, show onboarding anyway for first-time experience
      setTimeout(() => {
        setShowInteractiveGuide(true);
        setOnboardingStep(0);
      }, 1500);
    }
  };

  const startInteractiveGuide = () => {
    console.log('Starting FeaturedScreen interactive guide manually...');
    setShowInteractiveGuide(true);
    setOnboardingStep(0);
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
      await AsyncStorage.setItem('featuredScreenOnboardingCompleted', 'true');
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  };

  // Debug function to reset onboarding (for testing)
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('featuredScreenOnboardingCompleted');
      setHasSeenOnboarding(false);
      console.log('FeaturedScreen onboarding reset - will show on next app start');
      Alert.alert('Debug', 'Onboarding reset! Restart the app to see it again.');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={theme.colors.statusBarStyle} />
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerBackBtn, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="arrow-back" size={26} color={theme.colors.headerTint} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.headerTitle }]}>{t('featured.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FarmerProfile', { farmerId: FARMER_ID })} style={{ marginLeft: 'auto', marginRight: 2 }}>
          <Ionicons name="person-circle-outline" size={45} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Crop Doctor Card */}
        <TouchableOpacity style={[styles.cropDoctorCard, { backgroundColor: theme.colors.surface }]} activeOpacity={0.9} onPress={() => navigation.navigate('CropDoctor')}>
          <View style={styles.cropDoctorIcon}><MaterialCommunityIcons name="leaf" size={32} color="#22c55e" /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cropDoctorTitle, { color: theme.colors.text }]}>{t('featured.crop_doctor')}</Text>
            <Text style={[styles.cropDoctorSubtitle, { color: theme.colors.textSecondary }]}>{t('featured.crop_doctor_subtitle')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        {/* Crop Cycle Card */}
        <TouchableOpacity style={[styles.cropDoctorCard, { backgroundColor: theme.colors.surface }]} activeOpacity={0.9} onPress={() => navigation.navigate('CropCycle')}>
          <View style={styles.cropDoctorIcon}><MaterialCommunityIcons name="progress-clock" size={32} color="#a78bfa" /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cropDoctorTitle, { color: theme.colors.text }]}>{t('featured.crop_cycle')}</Text>
            <Text style={[styles.cropDoctorSubtitle, { color: theme.colors.textSecondary }]}>{t('featured.crop_cycle_subtitle')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        {/* Weather Card */}
        <TouchableOpacity style={[styles.cropDoctorCard, { backgroundColor: theme.colors.surface }]} activeOpacity={0.9} onPress={() => navigation.navigate('WeatherScreen')}>
          <View style={styles.cropDoctorIcon}><MaterialCommunityIcons name="weather-partly-cloudy" size={32} color="#3b82f6" /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cropDoctorTitle, { color: theme.colors.text }]}>{t('featured.weather')}</Text>
            <Text style={[styles.cropDoctorSubtitle, { color: theme.colors.textSecondary }]}>{t('featured.weather_subtitle')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{t('featured.quick_actions')}</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('MarketplaceScreen')}>
            <MaterialCommunityIcons name="trending-up" size={28} color="#60a5fa" />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>{t('featured.market_prices')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('CalenderScreen')}>
            <MaterialCommunityIcons name="calendar" size={28} color="#f472b6" />
            <Text style={[styles.quickActionText, { color: theme.colors.text }]}>{t('featured.farming_calendar')}</Text>
          </TouchableOpacity>
        </View>
        {/* All Farming Tools */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{t('featured.all_tools')}</Text>
        <View style={styles.toolsList}>
          {tools.map(tool => (
            <TouchableOpacity key={tool.id} style={[styles.toolCard, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate(tool.id === 'rental-system' ? 'Rental' : tool.screen)}>
              <View style={[styles.toolIcon, { backgroundColor: tool.bg }]}>{tool.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toolTitle, { color: theme.colors.text }]}>{t(tool.titleKey)}</Text>
                <Text style={[styles.toolSubtitle, { color: theme.colors.textSecondary }]}>{t(tool.subtitleKey)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Onboarding debug buttons for testing */}
      {/* {hasSeenOnboarding && (
        <View style={styles.tourButtonsContainer}>
          <TouchableOpacity 
            style={styles.restartTourButton} 
            onPress={startInteractiveGuide}
          >
            <MaterialCommunityIcons name="replay" size={20} color={theme.colors.primary} />
            <Text style={[styles.restartTourText, { color: theme.colors.primary }]}>Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.resetTourButton} 
            onPress={resetOnboarding}
          >
            <MaterialCommunityIcons name="refresh" size={16} color="#FF5722" />
            <Text style={styles.resetTourText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )} */}

      {/* Interactive Guide Overlay */}
      {showInteractiveGuide && (
        <View style={styles.guideOverlay}>
          <TouchableOpacity 
            style={[styles.guideOverlayBackground, { backgroundColor: theme.colors.overlay }]}
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
    backgroundColor: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    marginBottom: 10,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  cropDoctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    marginTop: 8,
    shadowColor: '#22c55e',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cropDoctorIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#22c55e20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cropDoctorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cropDoctorSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#a1a1aa',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 18,
    marginBottom: 8,
    marginTop: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 18,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    marginHorizontal: 6,
    shadowColor: '#fff',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  toolsList: {
    marginHorizontal: 10,
    marginTop: 2,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#fff',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  toolTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  toolSubtitle: {
    color: '#a1a1aa',
    fontSize: 13,
    marginTop: 2,
  },

  // Onboarding Tour Buttons
  tourButtonsContainer: {
    position: 'absolute',
    bottom: 85,
    left: 15,
    flexDirection: 'row',
    gap: 10,
    zIndex: 15,
  },
  restartTourButton: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft:140,
    marginBottom:20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  restartTourText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  resetTourButton: {
    backgroundColor: 'rgba(255,87,34,0.1)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF5722',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom:20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resetTourText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    maxWidth: width - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  tooltipMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  tooltipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  skipButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
