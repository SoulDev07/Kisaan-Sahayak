import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguage } from '../i18n';
import { Picker } from '@react-native-picker/picker';
import { NetworkConfig } from '../utils/NetworkConfig';
import { useTheme } from '../context/ThemeContext';
import * as Location from 'expo-location';
// Simulated recording (no Audio APIs used)

const DEFAULT_PROFILE_IMAGE = 'https://placehold.co/100x100/EFEFEF/333?text=F';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
];

// Profile building steps
const PROFILE_STEPS = [
 
  {
    id: 'farm_location',
    title: 'Farm Location',
    question: 'Where is your farm located?',
    placeholder: 'e.g., Mumbai, Maharashtra',
    field: 'farmLocation'
  },
  {
    id: 'primary_crops',
    title: 'Primary Crops',
    question: 'What are your main crops?',
    placeholder: 'e.g. Wheat, Sugarcane,Onion,Tomato,Chickpea',
    field: 'primaryCrops'
  },
  {
    id: 'livestock',
    title: 'Livestock',
    question: 'Do you have any livestock?',
    placeholder: 'e.g., cows(Gauri),goat(Moti),buffalo(Shyam),hen(Chikki),chikken(Murgi)',
    field: 'livestockSummary'
  },
  {
    id: 'farming_experience',
    title: 'Experience',
    question: 'How many years of farming experience do you have?',
    placeholder: 'e.g., 5 years',
    field: 'farmingExperience'
  }
];

const FarmerProfileScreen = ({ route, navigation }) => {
  const { farmerId } = route.params;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // Profile building states
  const [buildProfileVisible, setBuildProfileVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [buildingComplete, setBuildingComplete] = useState(false);
  const [isPreparingRecording, setIsPreparingRecording] = useState(false);

  // Auto-fill states: when opening the build profile modal, auto-fill first 3 steps
  const [autoFilling, setAutoFilling] = useState(false);
  const [autoFillDone, setAutoFillDone] = useState(false);

  // Simulated voice recording states
  const [recording, setRecording] = useState(null);

  // Animation values
  const recordingAnimation = useState(new Animated.Value(1))[0];
  const progressAnimation = useState(new Animated.Value(0))[0];

  // States from your original code for full profile display
  const [crops, setCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(true);
  const [cropsError, setCropsError] = useState(null);

  const [livestock, setLivestock] = useState([]);
  const [livestockLoading, setLivestockLoading] = useState(true);
  const [livestockError, setLivestockError] = useState(null);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  const [isCacheLoaded, setIsCacheLoaded] = useState(false);

  // Modal states from your original code
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editProfileData, setEditProfileData] = useState({});
  const [editProfileLoading, setEditProfileLoading] = useState(false);

  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [currentCrop, setCurrentCrop] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);

  const [livestockModalVisible, setLivestockModalVisible] = useState(false);
  const [currentLivestock, setCurrentLivestock] = useState(null);
  const [livestockLoadingState, setLivestockLoadingState] = useState(false);

  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventLoadingState, setEventLoadingState] = useState(false);

  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const API_BASE = NetworkConfig.API_BASE;
  const PROFILE_CACHE_KEY = `farmer-profile-cache-${farmerId}`;

  // Helper components from your original code
  const ProfileField = ({ label, value }) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || '-'}</Text>
    </View>
  );

  const EditableField = ({ label, value, onChangeText, keyboardType = 'default', multiline = false, ...props }) => (
    <View style={styles.editableFieldContainer}>
      <Text style={styles.editableFieldLabel}>{label}</Text>
      <TextInput
        style={[styles.editableFieldInput, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        {...props}
      />
    </View>
  );

  const Section = ({ title, children, onEdit, onAdd }) => (
    <View style={styles.sectionOuter}>
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeader}>{title}</Text>
        <View style={styles.sectionHeaderActions}>
          {onAdd && (
            <TouchableOpacity onPress={onAdd} style={styles.sectionActionButton}>
              <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.sectionActionButton}>
              <Ionicons name="create-outline" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.section}>{children}</View>
    </View>
  );

  const CustomButton = ({ title, onPress, color, disabled }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.customButton, { backgroundColor: color || theme.colors.primary }, disabled && styles.disabledButton]}
      disabled={disabled}
    >
      {disabled ? (
        <ActivityIndicator size="small" color={theme.colors.background} />
      ) : (
        <Text style={styles.customButtonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );

  // Fetch initial profile data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE}/farmer/${farmerId}/profile`;
      console.log(`[FarmerProfile] Fetching profile from: ${url}`);
      const res = await axios.get(url, { timeout: 15000 });
      console.log('[FarmerProfile] Received response:', res.status, res.data && Object.keys(res.data).length ? 'payload' : 'empty');
      setProfile(res.data);
      
      // Check if profile is complete
      const isComplete = res.data.farmSize && res.data.primaryCrops && res.data.farmingExperience;
      setIsProfileComplete(isComplete);
      
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(res.data));
    } catch (err) {
      // Log detailed axios error shape so we can debug why request didn't hit backend
      try {
        console.error('[FarmerProfile] Failed to fetch profile. Error details:');
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
        } else if (err.request) {
          console.error('No response - request made but no response received. Request object:', err.request);
        } else {
          console.error('Axios error message:', err.message);
        }
      } catch (logErr) {
        console.error('Error while logging axios error:', logErr);
      }

      // Try to recover by using NetworkConfig.getBestUrl()
      try {
        console.log('[FarmerProfile] Attempting fallback: querying NetworkConfig.getBestUrl()');
        const best = await NetworkConfig.getBestUrl();
        const fallbackUrl = `${best.replace(/\/$/, '')}/farmer/${farmerId}/profile`;
        console.log('[FarmerProfile] Retrying with fallback URL:', fallbackUrl);
        const fallbackRes = await axios.get(fallbackUrl, { timeout: 15000 });
        console.log('[FarmerProfile] Fallback response status:', fallbackRes.status);
        setProfile(fallbackRes.data);
        setError(null);
        // Also update in-memory API_BASE for subsequent calls
        NetworkConfig.API_BASE = best;
        return;
      } catch (fallbackErr) {
        console.error('[FarmerProfile] Fallback attempt failed:', fallbackErr?.message || fallbackErr);
      }

      setError('Failed to load profile. Please check your network or server and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch functions from your original code
  const fetchCrops = async () => {
    setCropsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/farmer/${farmerId}/crops`);
      setCrops(res.data);
    } catch (err) {
      console.error('Failed to fetch crops:', err);
      setCropsError('Failed to load crops. Please try again.');
    } finally {
      setCropsLoading(false);
    }
  };

  const fetchLivestock = async () => {
    setLivestockLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/farmer/${farmerId}/livestock`);
      setLivestock(res.data);
    } catch (err) {
      console.error('Failed to fetch livestock:', err);
      setLivestockError('Failed to load livestock. Please try again.');
    } finally {
      setLivestockLoading(false);
    }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/farmer/${farmerId}/calendar`);
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEventsError('Failed to load events. Please try again.');
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadProfileFromCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
        if (cached && isMounted) {
          setProfile(JSON.parse(cached));
          setIsCacheLoaded(true);
          setLoading(false);
        }
      } catch (e) {}
      fetchProfile();
    };
    loadProfileFromCache();
    
    // Only fetch additional data if profile is complete
    if (isProfileComplete) {
      fetchCrops();
      fetchLivestock();
      fetchEvents();
    }
    
    return () => { isMounted = false; };
  }, [farmerId, isProfileComplete]);

  // Animation for recording button
  const startRecordingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnimation, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRecordingAnimation = () => {
    recordingAnimation.stopAnimation();
    recordingAnimation.setValue(1);
  };

  // Progress animation
  const updateProgress = () => {
    const progress = (currentStep + 1) / PROFILE_STEPS.length;
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    updateProgress();
  }, [currentStep]);

  // When build profile modal opens, auto-fill first 3 steps (if available) once
  useEffect(() => {
    let cancelled = false;
    const autoFillFirstThree = async () => {
      if (!buildProfileVisible || autoFillDone) return;
      if (!PROFILE_STEPS || PROFILE_STEPS.length < 4) return; // need at least 4 steps

      setAutoFilling(true);
      // Fill steps 0..2 sequentially with visible typing
      for (let i = 0; i < 3; i++) {
        if (cancelled) return;
        setCurrentStep(i);

        const step = PROFILE_STEPS[i];
        const field = step.field;
          // For farm_location step try to get live device coordinates and reverse-geocode
          let raw = (profile && profile[field]) ? profile[field] : (step.placeholder || '');
          if (field === 'farmLocation') {
            try {
              // Request permission and attempt to get current position
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status === 'granted') {
                const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                // Try reverse geocoding to get a human readable address
                try {
                  const rev = await Location.reverseGeocodeAsync({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                  });
                  if (Array.isArray(rev) && rev.length > 0) {
                    const r = rev[0];
                    // Prefer name/locality/city/village/address fields
                    const parts = [r.name, r.locality, r.city, r.subregion, r.region, r.postalCode];
                    const readable = parts.filter(Boolean).join(', ');
                    raw = readable || `${coords.lat}, ${coords.lng}`;
                  } else {
                    raw = `${coords.lat}, ${coords.lng}`;
                  }
                } catch (e) {
                  // reverse geocode failed - fall back to coords
                  raw = `${coords.lat}, ${coords.lng}`;
                }
              } else {
                // permission denied - fall back to existing profile or placeholder
                raw = (profile && profile[field]) ? profile[field] : (step.placeholder || '');
              }
            } catch (e) {
              // Any error getting live location - fallback gracefully
              raw = (profile && profile[field]) ? profile[field] : (step.placeholder || '');
            }
          }
        // If the raw value is an object (e.g., {lat, lng} or address object), format it into a readable string
        let value = '';
        try {
          if (raw && typeof raw === 'object') {
            // Prefer readable address-like fields first
            if (raw.address || raw.name || raw.village || raw.city || raw.locality) {
              value = String(raw.address || raw.name || raw.village || raw.city || raw.locality);
            } else if (raw.lat !== undefined && raw.lng !== undefined) {
              // lat/lng object as a fallback
              value = `${raw.lat}, ${raw.lng}`;
            } else {
              // try to join primitive values
              const vals = Object.values(raw).filter(v => v !== null && v !== undefined && (typeof v === 'string' || typeof v === 'number'));
              if (vals.length) value = vals.join(', ');
              else value = JSON.stringify(raw);
            }
          } else {
            value = String(raw || '');
          }

          // Clean placeholder-like text (remove 'e.g.' prefixes)
          value = value.replace(/^\s*(e\.g\.?\s*,?\s*)/i, '').trim();
          value = value.replace(/\b(e\.g\.?\s*,?\s*)/ig, '').trim();
        } catch (e) {
          value = String(raw || '');
        }

        // Simulate typing into the answer field so user can see it filling
        setCurrentAnswer('');
        for (let c = 0; c < value.length; c++) {
          if (cancelled) return;
          setCurrentAnswer((prev) => prev + value[c]);
          // slow typing so it's visible
          // ~80ms per character (adjustable)
          // For long placeholders limit per-char delay slightly
          await new Promise((res) => setTimeout(res, 80));
        }

        // Once typed, persist into profileData
        setProfileData((d) => ({ ...d, [field]: value }));

        // Hold the filled value briefly so it's readable
        await new Promise((res) => setTimeout(res, 650));
      }

      // Move to the 4th question (index 3)
      if (!cancelled) {
        setCurrentStep(3);
        const fourthField = PROFILE_STEPS[3].field;
        setCurrentAnswer((profile && profile[fourthField]) ? profile[fourthField] : '');
        setAutoFilling(false);
        setAutoFillDone(true);
      }
    };

    if (buildProfileVisible && !autoFillDone) {
      autoFillFirstThree();
    }

    return () => { cancelled = true; };
  }, [buildProfileVisible]);

  // Voice recording functions
  const startRecording = () => {
    if (isPreparingRecording || isRecording) return;
    setIsPreparingRecording(true);
    // Simulate a small prepare delay
    setTimeout(() => {
      setIsPreparingRecording(false);
      setIsRecording(true);
      startRecordingAnimation();
    }, 300);
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    stopRecordingAnimation();
    // Simulate transcription using the placeholder cleaned of 'e.g.'
    const raw = PROFILE_STEPS[currentStep] && PROFILE_STEPS[currentStep].placeholder ? PROFILE_STEPS[currentStep].placeholder : '';
    const cleaned = raw.replace(/^\s*(e\.g\.?\s*,?\s*)/i, '').trim();
    const finalText = cleaned.replace(/\b(e\.g\.?\s*,?\s*)/ig, '').trim();
    setCurrentAnswer(finalText);
    setRecording(null);
  };

  // processVoiceInput is unused in simulated recording mode but kept for future integrations
  const processVoiceInput = async (audioUri) => {};

  // Handle voice recording toggle
  const handleRecording = async () => {
    try {
      if (isRecording) {
        await stopRecording();
      } else {
        await startRecording();
      }
    } catch (e) {
      console.error('Recording toggle error:', e);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (!currentAnswer.trim()) {
      Alert.alert('Required', 'Please provide an answer before continuing.');
      return;
    }

    // Save current answer
    const currentStepData = PROFILE_STEPS[currentStep];
    const updatedData = {
      ...profileData,
      [currentStepData.field]: currentAnswer.trim()
    };
    setProfileData(updatedData);

    if (currentStep < PROFILE_STEPS.length - 1) {
      // Move to next step
      setCurrentStep(currentStep + 1);
      setCurrentAnswer('');
    } else {
      // All steps completed
      handleProfileCompletion(updatedData);
    }
  };

  // Handle profile completion
  const handleProfileCompletion = async (finalData) => {
    setIsSaving(true);
    try {
      // Combine with existing profile data
      const updatedProfile = {
        ...profile,
        ...finalData,
        onboardingStatus: 'completed'
      };
  // Update local state (no backend call requested)
  setProfile(updatedProfile);
  setIsProfileComplete(true);
  // Cache updated profile locally
  await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(updatedProfile));
      
      // Show completion state
      setBuildingComplete(true);
      
      // Navigate to the FarmerProfile route and close modal
      setTimeout(() => {
        try {
          navigation.replace && navigation.replace('Profile', { farmerId });
        } catch (navErr) {
          navigation.navigate && navigation.navigate('Profile', { farmerId });
        }
        setBuildProfileVisible(false);
        setBuildingComplete(false);
        setCurrentStep(0);
        setProfileData({});
        setCurrentAnswer('');
      }, 700);
      
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back in modal
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Restore previous answer
      const prevStep = PROFILE_STEPS[currentStep - 1];
      setCurrentAnswer(profileData[prevStep.field] || '');
    }
  };

  // All the handler functions from your original code
  const handleOpenEditProfile = () => {
    setEditProfileData({ ...profile });
    setEditProfileVisible(true);
  };

  const handleSubmitEditProfile = async () => {
    setEditProfileLoading(true);
    try {
      setProfile(editProfileData);
      await axios.put(`${API_BASE}/farmer/${farmerId}`, { ...editProfileData });
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(editProfileData));
      setEditProfileVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      setProfile(profile);
      console.error('Profile update error:', e);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setEditProfileLoading(false);
    }
  };

  const handleOpenCropModal = (crop = null) => {
    setCurrentCrop(crop || { name: '', plantingDate: '', totalDuration: '' });
    setCropModalVisible(true);
  };

  const handleSubmitCrop = async () => {
    setCropLoading(true);
    try {
      if (currentCrop && currentCrop.cropId) {
        await axios.put(`${API_BASE}/farmer/${farmerId}/crops/${currentCrop.cropId}`, currentCrop);
        setCrops(crops.map((c) => (c.cropId === currentCrop.cropId ? currentCrop : c)));
        Alert.alert('Success', 'Crop updated successfully!');
      } else {
        const res = await axios.post(`${API_BASE}/farmer/${farmerId}/crops`, currentCrop);
        setCrops([...crops, res.data]);
        Alert.alert('Success', 'Crop added successfully!');
      }
      setCropModalVisible(false);
    } catch (e) {
      console.error('Crop operation error:', e);
      Alert.alert('Error', `Failed to ${currentCrop && currentCrop.cropId ? 'update' : 'add'} crop. Please try again.`);
    } finally {
      setCropLoading(false);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    Alert.alert(
      'Delete Crop',
      'Are you sure you want to delete this crop?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE}/farmer/${farmerId}/crops/${cropId}`);
              setCrops(crops.filter((c) => c.cropId !== cropId));
              Alert.alert('Success', 'Crop deleted successfully!');
              setCropModalVisible(false);
            } catch (e) {
              console.error('Crop delete error:', e);
              Alert.alert('Error', 'Failed to delete crop. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleOpenLivestockModal = (animal = null) => {
    setCurrentLivestock(animal || { name: '', type: '', breed: '', age: '', health: '' });
    setLivestockModalVisible(true);
  };

  const handleSubmitLivestock = async () => {
    setLivestockLoadingState(true);
    try {
      if (currentLivestock && currentLivestock.id) {
        await axios.put(`${API_BASE}/farmer/${farmerId}/livestock/${currentLivestock.id}`, currentLivestock);
        setLivestock(livestock.map((a) => (a.id === currentLivestock.id ? currentLivestock : a)));
        Alert.alert('Success', 'Livestock updated successfully!');
      } else {
        const res = await axios.post(`${API_BASE}/farmer/${farmerId}/livestock`, currentLivestock);
        setLivestock([...livestock, res.data]);
        Alert.alert('Success', 'Livestock added successfully!');
      }
      setLivestockModalVisible(false);
    } catch (e) {
      console.error('Livestock operation error:', e);
      Alert.alert('Error', `Failed to ${currentLivestock && currentLivestock.id ? 'update' : 'add'} livestock. Please try again.`);
    } finally {
      setLivestockLoadingState(false);
    }
  };

  const handleDeleteLivestock = async (livestockId) => {
    Alert.alert(
      'Delete Livestock',
      'Are you sure you want to delete this livestock?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE}/farmer/${farmerId}/livestock/${livestockId}`);
              setLivestock(livestock.filter((a) => a.id !== livestockId));
              Alert.alert('Success', 'Livestock deleted successfully!');
              setLivestockModalVisible(false);
            } catch (e) {
              console.error('Livestock delete error:', e);
              Alert.alert('Error', 'Failed to delete livestock. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleOpenEventModal = (event = null) => {
    setCurrentEvent(event || { task: '', date: '', time: '', type: '', priority: '', details: '' });
    setEventModalVisible(true);
  };

  const handleSubmitEvent = async () => {
    setEventLoadingState(true);
    try {
      if (currentEvent && currentEvent.task) {
        await axios.put(`${API_BASE}/farmer/${farmerId}/calendar/${currentEvent.task}`, currentEvent);
        setEvents(events.map((e) => (e.task === currentEvent.task ? currentEvent : e)));
        Alert.alert('Success', 'Event updated successfully!');
      } else {
        const res = await axios.post(`${API_BASE}/farmer/${farmerId}/calendar`, currentEvent);
        setEvents([...events, res.data]);
        Alert.alert('Success', 'Event added successfully!');
      }
      setEventModalVisible(false);
    } catch (e) {
      console.error('Event operation error:', e);
      Alert.alert('Error', `Failed to ${currentEvent && currentEvent.task ? 'update' : 'add'} event. Please try again.`);
    } finally {
      setEventLoadingState(false);
    }
  };

  const handleDeleteEvent = async (eventTask) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE}/farmer/${farmerId}/calendar/${eventTask}`);
              setEvents(events.filter((e) => e.task !== eventTask));
              Alert.alert('Success', 'Event deleted successfully!');
              setEventModalVisible(false);
            } catch (e) {
              console.error('Event delete error:', e);
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
  <Text style={styles.loadingText}>{t('farmer.loading_profile', 'Loading profile...')}</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryButtonText}>{t('common.retry', 'Retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
  <Text style={styles.errorText}>{t('farmer.no_profile', 'No profile data found.')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>{t('common.go_back', 'Go Back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle={theme.colors.statusBarStyle || 'light-content'} />
      
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.headerTint || theme.colors.text} />
        </TouchableOpacity>
  <Text style={styles.headerTitle}>{t('farmer.my_profile', 'My Profile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {!isProfileComplete ? (
          // Simple profile view with build profile option
          <>
            {/* Profile Card - Simple */}
            <View style={styles.simpleProfileCard}>
              <Image
                source={{ uri: profile.profileImage || DEFAULT_PROFILE_IMAGE }}
                style={styles.profileImageSimple}
              />
              <Text style={styles.nameSimple}>{profile.name || t('farmer.fallback_name', 'Farmer')}</Text>
              <View style={styles.phoneContainer}>
                <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.phoneText}>{profile.phoneNumber}</Text>
              </View>
            </View>

            {/* Build Profile Card */}
            <View style={styles.buildProfileCard}>
              <Ionicons name="construct-outline" size={48} color={theme.colors.primary} />
              <Text style={styles.buildProfileTitle}>{t('farmer.complete_profile', 'Complete Your Profile')}</Text>
              <Text style={styles.buildProfileSubtitle}>
                {t('farmer.complete_profile_subtitle', 'Help us understand your farming needs better by completing your profile')}
              </Text>
              <TouchableOpacity 
                style={styles.buildProfileButton} 
                onPress={() => setBuildProfileVisible(true)}
              >
                <Text style={styles.buildProfileButtonText}>{t('farmer.build_profile', 'Build Profile')}</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.background} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Complete profile view (your existing detailed view can go here)
          <View style={styles.completeProfileContainer}>
            <View style={styles.profileCard}>
              <Image
                source={{ uri: profile.profileImage || DEFAULT_PROFILE_IMAGE }}
                style={styles.profileImage}
              />
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.village}>{profile.village}</Text>
            </View>

            {/* Profile Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('farmer.profile_information', 'Profile Information')}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('farmer.farm_size', 'Farm Size')}</Text>
                  <Text style={styles.infoValue}>{profile.farmSize}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('farmer.primary_crops', 'Primary Crops')}</Text>
                  <Text style={styles.infoValue}>{profile.primaryCrops}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('farmer.experience', 'Experience')}</Text>
                  <Text style={styles.infoValue}>{profile.farmingExperience}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('farmer.livestock', 'Livestock')}</Text>
                  <Text style={styles.infoValue}>{profile.livestockSummary || 'None'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Profile Building Modal */}
      <Modal visible={buildProfileVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!buildingComplete && !isSaving ? (
              <>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: progressAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                          })
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {currentStep + 1} of {PROFILE_STEPS.length}
                  </Text>
                </View>

                {/* Question (always visible). Input shows live-typing during autofill and is disabled while autofilling */}
                <View style={styles.questionContainer}>
                  <Text style={styles.questionTitle}>
                    {PROFILE_STEPS[currentStep].title}
                  </Text>
                  <Text style={styles.questionText}>
                    {PROFILE_STEPS[currentStep].question}
                  </Text>
                </View>

                {/* Input Field - disabled during autofill but shows live-typing */}
                <View>
                  <TextInput
                    style={[styles.answerInput, autoFilling ? { opacity: 0.9 } : null]}
                    value={currentAnswer}
                    onChangeText={setCurrentAnswer}
                    placeholder={PROFILE_STEPS[currentStep].placeholder}
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    editable={!autoFilling}
                  />
                  {autoFilling && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -16, marginBottom: 12 }}>
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                      <Text style={{ color: theme.colors.textSecondary, marginLeft: 8 }}>{t('farmer.autofilling_profile', 'Auto-filling your profile...')}</Text>
                    </View>
                  )}
                </View>

                {/* Voice Recording Button */}
                <TouchableOpacity 
                  style={[styles.recordButton, isRecording && styles.recordButtonActive, (isPreparingRecording || autoFilling) && styles.disabledButton]}
                  onPress={handleRecording}
                  disabled={isPreparingRecording || autoFilling}
                >
                  <Animated.View style={[styles.micIcon, { opacity: recordingAnimation }]}>
                    <Ionicons 
                      name={isRecording ? "stop" : "mic"} 
                      size={32} 
                      color={theme.colors.background} 
                    />
                  </Animated.View>
                  <Text style={styles.recordButtonText}>
                    {isPreparingRecording ? 'Preparing...' : isRecording ? 'Tap to Stop Recording' : 'Tap to Record'}
                  </Text>
                </TouchableOpacity>

                {/* Navigation Buttons */}
                <View style={styles.modalButtonContainer}>
                  {currentStep > 0 && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={autoFilling}>
                      <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
                      <Text style={styles.backButtonText}>{t('common.back', 'Back')}</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity style={[styles.nextButton, autoFilling && styles.disabledButton]} onPress={handleNext} disabled={autoFilling}>
                    <Text style={styles.nextButtonText}>
                      {currentStep === PROFILE_STEPS.length - 1 ? 'Complete' : 'Next'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.background} />
                  </TouchableOpacity>
                </View>

                {/* Close Button */}
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setBuildProfileVisible(false)}
                >
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </>
            ) : (
              // Loading or Success State
              <View style={styles.completionContainer}>
                {isSaving ? (
                  <>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.completionText}>{t('farmer.saving_profile', 'Saving your profile...')}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={80} color={theme.colors.success || '#22c55e'} />
                    <Text style={styles.completionText}>{t('farmer.profile_complete', 'Profile Complete!')}</Text>
                    <Text style={styles.completionSubtext}>
                      Your farming profile has been successfully created
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* All the original modals from your code */}
      
      {/* Edit Profile Modal */}
      <Modal visible={editProfileVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('farmer.edit_profile', 'Edit Profile')}</Text>
            <EditableField label="Name" value={editProfileData.name} onChangeText={(v) => setEditProfileData((d) => ({ ...d, name: v }))} />
            <EditableField label="Village" value={editProfileData.village} onChangeText={(v) => setEditProfileData((d) => ({ ...d, village: v }))} />
            <EditableField label="Phone Number" value={editProfileData.phoneNumber} onChangeText={(v) => setEditProfileData((d) => ({ ...d, phoneNumber: v }))} keyboardType="phone-pad" />
            <EditableField label="Language" value={editProfileData.language} onChangeText={(v) => setEditProfileData((d) => ({ ...d, language: v }))} />
            <EditableField label="Farm Size" value={editProfileData.farmSize} onChangeText={(v) => setEditProfileData((d) => ({ ...d, farmSize: v }))} />
            <EditableField label="Preferred Mode" value={editProfileData.preferredInteractionMode} onChangeText={(v) => setEditProfileData((d) => ({ ...d, preferredInteractionMode: v }))} />

            <View style={styles.modalButtonContainer}>
              <CustomButton title="Cancel" onPress={() => setEditProfileVisible(false)} color={theme.colors.card} />
              <CustomButton title="Save Changes" onPress={handleSubmitEditProfile} disabled={editProfileLoading} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Crop Modal (Add/Edit) */}
      <Modal visible={cropModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentCrop && currentCrop.cropId ? t('farmer.edit_crop', 'Edit Crop') : t('farmer.add_crop', 'Add New Crop')}</Text>
            <EditableField label="Name" value={currentCrop?.name} onChangeText={(v) => setCurrentCrop((d) => ({ ...d, name: v }))} />
            <EditableField label="Planting Date (YYYY-MM-DD)" value={currentCrop?.plantingDate} onChangeText={(v) => setCurrentCrop((d) => ({ ...d, plantingDate: v }))} />
            <EditableField label="Total Duration (e.g., '90 days')" value={currentCrop?.totalDuration} onChangeText={(v) => setCurrentCrop((d) => ({ ...d, totalDuration: v }))} />

            <View style={styles.modalButtonContainer}>
              {currentCrop && currentCrop.cropId && (
                <CustomButton
                  title="Delete"
                  onPress={() => handleDeleteCrop(currentCrop.cropId)}
                  color={'#f87171'}
                  disabled={cropLoading}
                />
              )}
              <CustomButton title="Cancel" onPress={() => setCropModalVisible(false)} color={theme.colors.card} />
              <CustomButton
                title={cropLoading ? 'Saving...' : 'Save'}
                onPress={handleSubmitCrop}
                disabled={cropLoading}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Livestock Modal (Add/Edit) */}
      <Modal visible={livestockModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentLivestock && currentLivestock.id ? t('farmer.edit_livestock', 'Edit Livestock') : t('farmer.add_livestock', 'Add New Livestock')}</Text>
            <EditableField label="Name" value={currentLivestock?.name} onChangeText={(v) => setCurrentLivestock((d) => ({ ...d, name: v }))} />
            <EditableField label="Type" value={currentLivestock?.type} onChangeText={(v) => setCurrentLivestock((d) => ({ ...d, type: v }))} />
            <EditableField label="Breed" value={currentLivestock?.breed} onChangeText={(v) => setCurrentLivestock((d) => ({ ...d, breed: v }))} />
            <EditableField label="Age" value={currentLivestock?.age} onChangeText={(v) => setCurrentLivestock((d) => ({ ...d, age: v }))} keyboardType="numeric" />
            <EditableField label="Health Status" value={currentLivestock?.health} onChangeText={(v) => setCurrentLivestock((d) => ({ ...d, health: v }))} multiline />

            <View style={styles.modalButtonContainer}>
              {currentLivestock && currentLivestock.id && (
                <CustomButton
                  title="Delete"
                  onPress={() => handleDeleteLivestock(currentLivestock.id)}
                  color={'#f87171'}
                  disabled={livestockLoadingState}
                />
              )}
              <CustomButton title="Cancel" onPress={() => setLivestockModalVisible(false)} color={theme.colors.card} />
              <CustomButton
                title={livestockLoadingState ? 'Saving...' : 'Save'}
                onPress={handleSubmitLivestock}
                disabled={livestockLoadingState}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Modal (Add/Edit) */}
      <Modal visible={eventModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentEvent && currentEvent.task ? t('farmer.edit_event', 'Edit Event') : t('farmer.add_event', 'Add New Event')}</Text>
            <EditableField label="Task" value={currentEvent?.task} onChangeText={(v) => setCurrentEvent((d) => ({ ...d, task: v }))} />
            <EditableField label="Date (YYYY-MM-DD)" value={currentEvent?.date} onChangeText={(v) => setCurrentEvent((d) => ({ ...d, date: v }))} />
            <EditableField label="Time (HH:MM)" value={currentEvent?.time} onChangeText={(v) => setCurrentEvent((d) => ({ ...d, time: v }))} />
            <EditableField label="Type" value={currentEvent?.type} onChangeText={(v) => setCurrentEvent((d) => ({ ...d, type: v }))} />
            <EditableField label="Priority" value={currentEvent?.priority} onChangeText={(v) => setCurrentEvent((d) => ({ ...d, priority: v }))} />
            <EditableField label="Details" value={currentEvent?.details} onChangeText={(v) => setCurrentEvent((d) => ({ ...d, details: v }))} multiline />

            <View style={styles.modalButtonContainer}>
              {currentEvent && currentEvent.task && (
                <CustomButton
                  title="Delete"
                  onPress={() => handleDeleteEvent(currentEvent.task)}
                  color={'#f87171'}
                  disabled={eventLoadingState}
                />
              )}
              <CustomButton title="Cancel" onPress={() => setEventModalVisible(false)} color={theme.colors.card} />
              <CustomButton
                title={eventLoadingState ? 'Saving...' : 'Save'}
                onPress={handleSubmitEvent}
                disabled={eventLoadingState}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.headerBackground || theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backBtn: {
      padding: 6,
      marginRight: 12,
    },
    headerTitle: {
      color: theme.colors.headerTitle || theme.colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      color: theme.colors.textSecondary,
      marginTop: 10,
      fontSize: 16,
    },
    errorText: {
      color: '#f87171',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: '600',
    },

    // Simple Profile Styles
    simpleProfileCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      alignItems: 'center',
      padding: 32,
      marginBottom: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    profileImageSimple: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: theme.colors.primary,
      marginBottom: 16,
    },
    nameSimple: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    phoneContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    phoneText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginLeft: 8,
    },

    // Build Profile Card
    buildProfileCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      alignItems: 'center',
      padding: 32,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    buildProfileTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    buildProfileSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    buildProfileButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
    },
    buildProfileButtonText: {
      color: theme.colors.background,
      fontSize: 18,
      fontWeight: '600',
      marginRight: 8,
    },

    // Complete Profile Styles
    originalContainer: {
      padding: 20,
      backgroundColor: theme.colors.background,
      paddingBottom: 40,
    },
    profileCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      alignItems: 'center',
      padding: 24,
      marginBottom: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: theme.colors.primary,
      marginBottom: 16,
    },
    name: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    village: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    sectionOuter: {
      marginTop: 28,
    },
    sectionHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    sectionHeader: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    sectionHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionActionButton: {
      marginLeft: 15,
      padding: 2,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 18,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    fieldRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    fieldLabel: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    fieldValue: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
      flexShrink: 1,
      textAlign: 'right',
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: '600',
    },
    itemType: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: 'normal',
    },
    itemSub: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginTop: 2,
    },
    emptyStateText: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      textAlign: 'center',
      paddingVertical: 10,
    },
    editableFieldContainer: {
      marginBottom: 16,
    },
    editableFieldLabel: {
      color: theme.colors.textSecondary,
      marginBottom: 6,
      fontSize: 14,
    },
    editableFieldInput: {
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 12 : 10,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    multilineInput: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    customButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      minWidth: 100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    customButtonText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    disabledButton: {
      opacity: 0.6,
    },
    pickerWrapper: { 
      backgroundColor: theme.colors.card, 
      borderRadius: 8, 
      marginTop: 4 
    },
    languagePicker: { 
      color: theme.colors.text, 
      height: 54, 
      width: '100%' 
    },
    modalTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 24,
      width: '90%',
      maxHeight: '85%',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        android: {
          elevation: 15,
        },
      }),
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      padding: 8,
    },
    progressContainer: {
      marginBottom: 32,
      alignItems: 'center',
    },
    progressBar: {
      width: '100%',
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    questionContainer: {
      marginBottom: 24,
      alignItems: 'center',
    },
    questionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    questionText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    answerInput: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 24,
    },
    recordButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 50,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      marginBottom: 32,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    recordButtonActive: {
      backgroundColor: '#f87171',
    },
    micIcon: {
      marginRight: 8,
    },
    recordButtonText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.card,
    },
    backButtonText: {
      color: theme.colors.text,
      fontSize: 16,
      marginLeft: 4,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
    },
    nextButtonText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: '600',
      marginRight: 4,
    },
    completionContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    completionText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    completionSubtext: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

export default FarmerProfileScreen;