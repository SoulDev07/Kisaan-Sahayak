import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NetworkConfig } from '../utils/NetworkConfig';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const API_BASE = NetworkConfig.API_BASE;

// Action button mapping for different AI actions — labels are localized via i18n keys
const ACTION_BUTTONS = {
  get_current_temperature: { icon: 'thermometer', labelKey: 'livevoice.action.temperature', color: '#4FC3F7' },
  get_forecast: { icon: 'cloud', labelKey: 'livevoice.action.weather', color: '#4FC3F7' },
  get_agri_price: { icon: 'trending-up', labelKey: 'livevoice.action.prices', color: '#FF9800' },
  get_farmer: { icon: 'person', labelKey: 'livevoice.action.profile', color: '#9C27B0' },
  get_farmer_profile: { icon: 'person-circle', labelKey: 'livevoice.action.farmer_info', color: '#9C27B0' },
  get_farmer_livestock: { icon: 'paw', labelKey: 'livevoice.action.livestock', color: '#FF9800' },
  get_farmer_crops: { icon: 'leaf', labelKey: 'livevoice.action.crops', color: '#4CAF50' },
  get_farmer_calendar: { icon: 'calendar', labelKey: 'livevoice.action.calendar', color: '#2196F3' },
  get_farmer_market: { icon: 'storefront', labelKey: 'livevoice.action.market', color: '#FFC107' },
  add_livestock: { icon: 'add-circle', labelKey: 'livevoice.action.add_livestock', color: '#FF9800' },
  add_crop: { icon: 'add', labelKey: 'livevoice.action.add_crop', color: '#4CAF50' },
  add_calendar_event: { icon: 'calendar-outline', labelKey: 'livevoice.action.add_event', color: '#2196F3' },
  generate_response: { icon: 'chatbubble', labelKey: 'livevoice.action.chat', color: '#03DAC6' },
  weather: { icon: 'cloud', labelKey: 'livevoice.action.weather', color: '#4FC3F7' },
  soil_moisture: { icon: 'water', labelKey: 'livevoice.action.soil_check', color: '#8BC34A' },
  crop_intelligence: { icon: 'leaf', labelKey: 'livevoice.action.crop_intelligence', color: '#4CAF50' },
  cattle_management: { icon: 'paw', labelKey: 'livevoice.action.livestock', color: '#FF9800' },
  profile: { icon: 'person', labelKey: 'livevoice.action.profile', color: '#9C27B0' },
  capture_image: { icon: 'camera', labelKey: 'livevoice.action.camera', color: '#FF5722' },
  chat: { icon: 'chatbubble', labelKey: 'livevoice.action.chat', color: '#03DAC6' },
  do_nothing: { icon: 'help-circle', labelKey: 'livevoice.action.help', color: '#757575' },
};

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;
const isLargeScreen = width >= 414;

function VoiceWaveform({ isActive }) {
  const barCount = 20;
  const { t } = useTranslation();
  const animatedValues = useRef(Array.from({ length: barCount }, () => new Animated.Value(0.5))).current;

  React.useEffect(() => {
    let animations = [];
    if (isActive) {
      animations = animatedValues.map((val, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(val, {
              toValue: Math.random() * 1.5 + 0.5,
              duration: 120 + Math.random() * 80,
              useNativeDriver: true,
            }),
            Animated.timing(val, {
              toValue: 0.5,
              duration: 120 + Math.random() * 80,
              useNativeDriver: true,
            }),
          ])
        )
      );
      Animated.stagger(30, animations).start();
    } else {
      animatedValues.forEach((val) => val.setValue(0.5));
    }
    return () => {
      animatedValues.forEach((val) => val.stopAnimation());
    };
  }, [isActive]);

  return (
    <View style={styles.waveformContainer}>
      {animatedValues.map((val, i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              transform: [{ scaleY: val }, { translateY: val.interpolate({ inputRange: [0, 2], outputRange: [0, -10] }) }],
              backgroundColor: i % 2 === 0 ? '#90caf9' : '#b3e5fc',
            },
          ]}
        />
      ))}
    </View>
  );
}

// Interactive Guide Tooltip Component
function InteractiveGuideTooltip({ step, onNext, onSkip }) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const getTooltipPosition = () => {
    switch (step.target) {
      case 'voiceButton':
        return {
          bottom: step.position === 'bottom' ? 200 : undefined,
          top: step.position === 'top' ? height * 0.15 : undefined,
          alignSelf: 'center',
        };
      case 'response':
        return {
          top: height * 0.25,
          alignSelf: 'center',
        };
      default:
        return {
          top: height * 0.4,
          alignSelf: 'center',
        };
    }
  };

  return (
    <View style={[styles.tooltip, getTooltipPosition(), { backgroundColor: theme.colors.surface }]}>
      {/* Pointer Arrow */}
      {step.position === 'bottom' && <View style={[styles.tooltipArrowDown, { borderTopColor: theme.colors.surface }]} />}
      {step.position === 'top' && <View style={[styles.tooltipArrowUp, { borderBottomColor: theme.colors.surface }]} />}

      <View style={styles.tooltipContent}>
        <Text style={[styles.tooltipTitle, { color: theme.colors.text }]}>{step.title}</Text>
        <Text style={[styles.tooltipMessage, { color: theme.colors.textSecondary }]}>{step.message}</Text>

        <View style={styles.tooltipButtons}>
          <TouchableOpacity
            style={[
              styles.skipButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 },
            ]}
            onPress={onSkip}
          >
            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.nextButton, { backgroundColor: theme.colors.primary }]} onPress={onNext}>
            <Text style={[styles.nextButtonText, { color: theme.colors.headerTitle }]}>
              {step.id === 'continue_conversation' || step.id === 'first_question' ? 'Got it!' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function LiveVoiceScreen({ navigation }) {
  const { theme } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [recording, setRecording] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('checking'); // checking, connected, error
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showInteractiveGuide, setShowInteractiveGuide] = useState(false);
  const [hasAskedFirstQuestion, setHasAskedFirstQuestion] = useState(false);
  const { t } = useTranslation();

  // Audio response state
  const [audioBase64, setAudioBase64] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sound, setSound] = useState(null);

  // Test network connection on component mount
  useEffect(() => {
    testNetworkConnection();
  }, []);

  const testNetworkConnection = async () => {
    try {
      setNetworkStatus('checking');

      // First, test if the server is reachable
      console.log(`Testing connection to: http://10.100.155.236:8001`);

      // Test a simple endpoint that exists - we'll try the /agent endpoint with a basic request
      const testPayload = {
        user_prompt: 'test connection',
        metadata: { farmer_id: 'f001' },
        user_id: 'f001',
        session_id: 'test_session',
      };

      const response = await axios.post(`http://10.100.155.236:8001/agent`, testPayload, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        console.log('Network connection established to KisanKiAwaaz-Backend-V2');
        setNetworkStatus('connected');

        // Also test if audio_agent endpoint is available by trying a POST with minimal data
        try {
          const testFormData = new FormData();
          testFormData.append('audio_file', {
            uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            name: 'test.wav',
            type: 'audio/wav',
          });
          testFormData.append('user_id', 'test');
          testFormData.append('session_id', 'test');
          testFormData.append('metadata', JSON.stringify({ farmer_id: 'test' }));

          const audioTestResponse = await axios.post(`http://10.100.155.236:8001/audio_agent`, testFormData, {
            timeout: 120000,
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('Audio agent endpoint is available and working');
        } catch (audioError) {
          console.log('Audio agent endpoint test failed:', audioError.message);
        }
      } else {
        setNetworkStatus('error');
        Alert.alert(
          t('network.connection_error_title') || 'Connection Error',
          t('network.connection_error_message') || 'Cannot connect to backend. Please check your network and server.',
          [
            { text: 'Retry', onPress: testNetworkConnection },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      setNetworkStatus('error');
    }
  };

  // Interactive onboarding steps
  const ONBOARDING_STEPS = [
    {
      id: 'welcome',
      title: 'Welcome to Voice Assistant!',
      message: 'Let me show you how to use this app. Tap anywhere to continue.',
      target: 'screen',
      position: 'center',
    },
    {
      id: 'voice_button',
      title: 'Tap the microphone',
      message: 'Press and hold this button to start recording your question.',
      target: 'voiceButton',
      position: 'bottom',
    },
    {
      id: 'first_question',
      title: 'Ask your first question',
      message: 'Try asking: "What\'s the weather like?" or "Tell me about farming tips"',
      target: 'voiceButton',
      position: 'top',
    },
  ];

  const FOLLOWUP_STEPS = [
    {
      id: 'followup_info',
      title: 'Great! You got a response',
      message: 'You can now ask follow-up questions or start a new topic. The AI remembers our conversation!',
      target: 'response',
      position: 'top',
    },
    {
      id: 'continue_conversation',
      title: 'Keep the conversation going',
      message: 'Press the microphone again to ask more questions or continue the discussion.',
      target: 'voiceButton',
      position: 'bottom',
    },
  ];

  const startInteractiveGuide = () => {
    setShowInteractiveGuide(true);
    setOnboardingStep(0);
  };

  const nextOnboardingStep = () => {
    const currentSteps = hasAskedFirstQuestion ? FOLLOWUP_STEPS : ONBOARDING_STEPS;
    if (onboardingStep < currentSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setShowInteractiveGuide(false);
      setOnboardingStep(0);
    }
  };

  const skipOnboarding = () => {
    setShowInteractiveGuide(false);
    setOnboardingStep(0);
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error') || 'Permission required',
          t('livevoice.permission_audio') || 'Audio recording permission is needed'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      setRecording(recording);
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert(t('common.error') || 'Error', t('livevoice.recording_start_failed') || 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsListening(false);
    setIsProcessing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Process the audio with backend
      await processVoiceCommand(uri);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert(t('common.error') || 'Error', t('livevoice.recording_processing_failed') || 'Failed to process recording');
    }

    setIsProcessing(false);
  };

  // Process voice command with backend
  const processVoiceCommand = async (audioUri) => {
    if (!audioUri) return;

    try {
      console.log('Processing voice command with audio URI:', audioUri);

      // Determine file type from URI and ensure it's compatible
      const fileExtension = audioUri.split('.').pop() || '3gp';
      const fileName = `recording.${fileExtension}`;

      const formData = new FormData();
      formData.append('audio_file', {
        uri: audioUri,
        name: fileName,
        type:
          fileExtension === '3gp'
            ? 'audio/3gpp'
            : fileExtension === 'wav'
            ? 'audio/wav'
            : fileExtension === 'm4a'
            ? 'audio/m4a'
            : fileExtension === 'mp3'
            ? 'audio/mpeg'
            : 'audio/3gpp', // Default for mobile recordings - backend can handle .3gp
      });

      // Add required form fields for audio_agent endpoint
      const user_id = 'f001'; // Farmer ID
      let session_id = await AsyncStorage.getItem('audio_session_id');
      if (!session_id) {
        session_id = Date.now().toString();
        await AsyncStorage.setItem('audio_session_id', session_id);
      }

      formData.append('user_id', user_id);
      formData.append('session_id', session_id);
      formData.append(
        'metadata',
        JSON.stringify({
          farmer_id: user_id,
          extra_context: [],
        })
      );

      console.log(`Sending ${fileExtension} audio file to audio_agent endpoint...`);

      // Use axios like other working screens
      console.log(`Making request to: http://10.100.155.236:8001/audio_agent`);
      console.log(`Form data keys:`, Array.from(formData.keys()));

      const response = await axios.post(`http://10.100.155.236:8001/audio_agent`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 minutes timeout
      });

      const result = response.data;
      console.log('Audio agent response:', result);
      console.log('Audio field present:', !!result.audio);
      console.log('Audio length:', result.audio ? result.audio.length : 0);

      // Handle transcription errors
      if (result.error) {
        console.error('Backend transcription error:', result.error);

        if (result.error === 'Could not transcribe audio') {
          Alert.alert(
            'Audio Processing Error',
            'Could not understand the audio. Please try:\n• Speaking more clearly\n• Getting closer to the microphone\n• Reducing background noise\n• Checking if audio was recorded properly',
            [
              { text: 'Try Again', onPress: () => {} },
              { text: 'OK', style: 'cancel' },
            ]
          );
          return;
        }

        throw new Error(result.error);
      }

      // Extract response data from the audio_agent response structure
      const transcribedText = result.transcribed_text || '';
      const responseText = result.response_text || 'No response received';
      const invokedTool = result.invoked_tool || 'do_nothing';
      const toolResult = result.tool_result || null;

      // Update state with AI response and question
      setCurrentQuestion(transcribedText);
      setCurrentResponse(responseText);
      setCurrentAction(invokedTool);

      // Store audio data for playback
      if (result.audio) {
        setAudioBase64(result.audio);
        console.log('Audio response received, ready for playback');

        // Auto-play the audio response only if not muted
        if (!isMuted) {
          setTimeout(() => {
            playAudioResponse(result.audio);
          }, 500); // Small delay to let UI update first
        } else {
          console.log('Audio auto-play skipped - muted');
        }
      } else {
        console.log('No audio response received from backend');
        setAudioBase64('');
      }

      // Trigger follow-up onboarding after first question
      if (!hasAskedFirstQuestion) {
        setHasAskedFirstQuestion(true);
        // Start follow-up guide after a short delay
        setTimeout(() => {
          setShowInteractiveGuide(true);
          setOnboardingStep(0);
        }, 2000);
      }

      // Add to conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai_response',
          action: invokedTool,
          summary: responseText,
          transcribed: transcribedText,
          audioData: result.audio || '', // Store audio data
          toolResult: toolResult,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      console.error('Voice command processing error:', error);

      // Handle rate-limiting / quota (429) specially by using Retry-After if provided
      const status = error.response?.status;
      if (status === 429) {
        const detail = error.response?.data?.detail || error.response?.data || {};
        // retry_after_seconds may be nested in detail
        const retryAfter = detail?.retry_after_seconds || detail?.retry_after || error.response?.headers?.['retry-after'];
        const waitSec = retryAfter ? Number(retryAfter) : 5; // default to 5s if not present

        Alert.alert(
          t('livevoice.rate_limited_title', 'Service Busy'),
          t(
            'livevoice.rate_limited_message',
            'The AI service is busy right now. Would you like to retry in {{seconds}} seconds?',
            { seconds: waitSec }
          ),
          [
            {
              text: t('common.retry', 'Retry'),
              onPress: () => setTimeout(() => processVoiceCommand(audioUri), Math.ceil(waitSec * 1000)),
            },
            { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          ]
        );
        return;
      }

      // If it's a 404 error, try the regular /agent endpoint as fallback
      if (error.response && error.response.status === 404) {
        console.log('Audio agent endpoint not found, trying regular agent endpoint...');
        try {
          // Try with regular agent endpoint
          const fallbackPayload = {
            user_prompt: 'Voice command received but transcription failed',
            metadata: {
              farmer_id: 'f001',
              voice_command: true,
              audio_uri: audioUri,
            },
            user_id: 'f001',
            session_id: Date.now().toString(),
          };

          const fallbackResponse = await axios.post(`http://10.100.155.236:8001/agent`, fallbackPayload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 120000,
          });

          const fallbackResult = fallbackResponse.data;
          console.log('Fallback agent response:', fallbackResult);

          // Process the fallback response
          setCurrentQuestion('Voice command (transcription unavailable)');
          setCurrentResponse(fallbackResult.response_text || 'No response received');
          setCurrentAction(fallbackResult.invoked_tool || 'do_nothing');
          setAudioBase64('');

          // Add to conversation history
          setConversationHistory((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'ai_response',
              action: fallbackResult.invoked_tool || 'do_nothing',
              summary: fallbackResult.response_text || 'No response',
              transcribed: 'Voice command (transcription unavailable)',
              audioData: '',
              toolResult: fallbackResult.tool_result,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);

          return;
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }

      let errorMessage = 'Failed to process voice command';
      if (error.response) {
        console.error('Server response:', error.response.data);
        errorMessage = `Server error: ${error.response.status} - ${
          error.response.data?.detail || error.response.data?.error || error.response.statusText
        }`;
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Server may be slow or busy.';
      } else if (error.message && (error.message.includes('network') || error.message.includes('Network Error'))) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(t('livevoice.processing_error_title', 'Processing Error'), errorMessage, [
        { text: t('common.retry', 'Retry'), onPress: () => processVoiceCommand(audioUri) },
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
      ]);
    }
  };

  // Handle action button press
  const handleActionPress = (action) => {
    switch (action) {
      // Tool-based actions from the agent
      case 'get_current_temperature':
      case 'get_forecast':
        navigation.navigate('WeatherScreen');
        break;
      case 'get_agri_price':
        Alert.alert(
          t('livevoice.price_data_title', 'Price Data'),
          t('livevoice.price_data_message', 'Agricultural price information has been retrieved.')
        );
        break;
      case 'get_farmer':
      case 'get_farmer_profile':
        navigation.navigate('FarmerProfileScreen');
        break;
      case 'get_farmer_livestock':
      case 'add_livestock':
        navigation.navigate('CattleScreen');
        break;
      case 'get_farmer_crops':
      case 'add_crop':
        navigation.navigate('CropIntelligenceScreen');
        break;
      case 'get_farmer_calendar':
      case 'add_calendar_event':
        Alert.alert(
          t('livevoice.calendar_title', 'Calendar'),
          t('livevoice.calendar_message', 'Calendar functionality is available in the main app.')
        );
        break;
      case 'get_farmer_market':
        Alert.alert(
          t('livevoice.market_title', 'Market'),
          t('livevoice.market_message', 'Market information has been retrieved.')
        );
        break;
      case 'generate_response':
        navigation.navigate('VoiceChatInputScreen');
        break;
      // Legacy actions for backward compatibility
      case 'weather':
        navigation.navigate('SoilMoistureScreen');
        break;
      case 'soil_moisture':
        navigation.navigate('SoilMoistureScreen');
        break;
      case 'crop_intelligence':
        navigation.navigate('CropIntelligenceScreen');
        break;
      case 'cattle_management':
        navigation.navigate('CattleScreen');
        break;
      case 'profile':
        navigation.navigate('FarmerProfileScreen');
        break;
      case 'capture_image':
        // Handle image capture
        handleImageCapture();
        break;
      case 'chat':
        navigation.navigate('VoiceChatInputScreen');
        break;
      default:
        if (action !== 'do_nothing') {
          Alert.alert(
            t('livevoice.tool_result_title', 'Tool Result'),
            t('livevoice.tool_result_message', `The AI used "${action}" tool to process your request.`)
          );
        }
    }
  };

  const handleImageCapture = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        Alert.alert(
          t('livevoice.image_selected_title', 'Image Selected'),
          t('livevoice.image_selected_message', `Selected: ${result.name}`)
        );
        // You can process the image here
      }
    } catch (error) {
      console.error('Image selection error:', error);
    }
  };

  // Audio playback functions
  const playAudioResponse = async (audioBase64Data) => {
    if (!audioBase64Data || isMuted) {
      console.log('Audio playback skipped - no audio data or muted');
      return;
    }

    try {
      setIsPlayingAudio(true);

      // Stop any currently playing audio
      if (sound) {
        await sound.unloadAsync();
      }

      // Convert base64 to audio URI
      const audioUri = `data:audio/mp3;base64,${audioBase64Data}`;

      // Load and play the audio
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });

      setSound(newSound);

      // Set up event listeners
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });

      console.log('Audio playback started');
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlayingAudio(false);
      Alert.alert(t('common.error', 'Audio Error'), t('livevoice.audio_playback_failed', 'Failed to play audio response'));
    }
  };

  const stopAudioPlayback = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setIsPlayingAudio(false);
      console.log('Audio playback stopped');
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isPlayingAudio) {
      stopAudioPlayback();
    }
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Button handlers
  const handleEndSession = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setSessionActive(false);
  };

  const handlePause = () => setIsPaused((p) => !p);

  const handleMic = async () => {
    if (isListening) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleExit = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
    if (navigation && navigation.navigate) {
      navigation.navigate('VoiceChatInputScreen');
    }
  };

  if (!sessionActive) {
    return (
      <View style={styles.outerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.container, styles.sessionEndedContainer]}>
            <View style={styles.sessionEndedContent}>
              <Text style={[styles.sessionEndedTitle, { color: theme.colors.text }]}>
                {t('livevoice.session_ended', 'Session Ended')}
              </Text>
              <Text style={[styles.sessionEndedSubtitle, { color: theme.colors.textSecondary }]}>
                {conversationHistory.length > 0
                  ? t('livevoice.processed_commands', {
                      count: conversationHistory.length,
                      defaultValue: `Processed ${conversationHistory.length} voice command${
                        conversationHistory.length > 1 ? 's' : ''
                      }`,
                    })
                  : t('livevoice.no_commands', 'No voice commands processed')}
              </Text>
              <TouchableOpacity
                style={styles.restartButton}
                onPress={() => {
                  setSessionActive(true);
                  setCurrentResponse('');
                  setCurrentAction('');
                }}
              >
                <Ionicons name="mic" size={32} color="white" />
              </TouchableOpacity>
              <Text style={[styles.restartText, { color: theme.colors.textSecondary }]}>
                {t('livevoice.start_new_session', 'Start New Session')}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.text }]}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {/* Header with Network Status and Help */}
          <View style={styles.headerContainer}>
            <View style={styles.networkStatusContainer}>
              <View
                style={[styles.networkIndicator, { backgroundColor: networkStatus === 'connected' ? '#4CAF50' : '#FF9800' }]}
              />
              <Text style={[styles.networkStatusText, { color: theme.colors.text }]}>
                {networkStatus === 'connected'
                  ? t('livevoice.connected', 'Connected')
                  : t('livevoice.connecting', 'Connecting...')}
              </Text>
              {networkStatus !== 'connected' && (
                <TouchableOpacity onPress={testNetworkConnection} style={styles.retryButton}>
                  <Ionicons name="refresh" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.helpButton, { backgroundColor: `${theme.colors.primary}20` }]}
              onPress={() => {
                Alert.alert(
                  t('help.options_title', 'Help Options'),
                  t('help.options_message', 'How would you like to learn about this app?'),
                  [
                    { text: t('help.interactive_guide', 'Interactive Guide'), onPress: startInteractiveGuide },
                    { text: t('help.manual', 'Help Manual'), onPress: () => setShowOnboarding(true) },
                    { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                  ]
                );
              }}
            >
              <Ionicons name="help-circle-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Voice Waveform Animation */}
          <View style={styles.waveformSection}>
            <VoiceWaveform isActive={isListening && !isPaused} />
          </View>

          {/* AI Response and Action Area */}
          <View style={styles.contentContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
            >
              {isProcessing && (
                <View style={[styles.processingContainer, { backgroundColor: `${theme.colors.warning || '#FFC107'}20` }]}>
                  <Text style={[styles.processingText, { color: theme.colors.warning || '#FFC107' }]}>
                    {t('livevoice.processing', 'Processing voice command...')}
                  </Text>
                </View>
              )}

              {(currentQuestion || currentResponse) && (
                <View style={styles.conversationContainer}>
                  {currentQuestion && (
                    <View style={[styles.questionContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                      <Text style={[styles.questionTitle, { color: theme.colors.primary }]}>
                        {t('livevoice.you_asked', 'You asked:')}
                      </Text>
                      <Text style={[styles.questionText, { color: theme.colors.text }]}>"{currentQuestion}"</Text>
                    </View>
                  )}

                  {currentResponse && (
                    <View style={[styles.responseContainer, { backgroundColor: `${theme.colors.primary}10` }]}>
                      <Text style={[styles.responseTitle, { color: theme.colors.primary }]}>
                        {t('livevoice.ai_response', 'AI Response:')}
                      </Text>
                      <Text style={[styles.responseText, { color: theme.colors.text }]}>{currentResponse}</Text>

                      {/* Audio Controls */}
                      {audioBase64 && (
                        <View style={styles.audioControlsContainer}>
                          <TouchableOpacity
                            style={[
                              styles.audioButton,
                              { borderColor: theme.colors.primary },
                              isPlayingAudio && {
                                backgroundColor: `${theme.colors.error || '#FF5722'}20`,
                                borderColor: theme.colors.error || '#FF5722',
                              },
                            ]}
                            onPress={() => (isPlayingAudio ? stopAudioPlayback() : playAudioResponse(audioBase64))}
                          >
                            <Ionicons
                              name={isPlayingAudio ? 'stop' : 'play'}
                              size={16}
                              color={isPlayingAudio ? theme.colors.error || '#FF5722' : theme.colors.primary}
                            />
                            <Text
                              style={[
                                styles.audioButtonText,
                                { color: isPlayingAudio ? theme.colors.error || '#FF5722' : theme.colors.primary },
                              ]}
                            >
                              {isPlayingAudio ? t('livevoice.stop_audio', 'Stop') : t('livevoice.play_audio', 'Play')}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.muteButton,
                              { borderColor: theme.colors.primary },
                              isMuted && {
                                backgroundColor: `${theme.colors.error || '#FF5722'}20`,
                                borderColor: theme.colors.error || '#FF5722',
                              },
                            ]}
                            onPress={toggleMute}
                          >
                            <Ionicons
                              name={isMuted ? 'volume-mute' : 'volume-high'}
                              size={16}
                              color={isMuted ? theme.colors.error || '#FF5722' : theme.colors.primary}
                            />
                            <Text
                              style={[
                                styles.muteButtonText,
                                { color: isMuted ? theme.colors.error || '#FF5722' : theme.colors.primary },
                              ]}
                            >
                              {isMuted ? t('livevoice.unmute', 'Unmute') : t('livevoice.mute', 'Mute')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {!audioBase64 && currentResponse && (
                        <View style={[styles.noAudioContainer, { backgroundColor: `${theme.colors.textSecondary}10` }]}>
                          <Ionicons name="volume-mute" size={16} color={theme.colors.textSecondary} />
                          <Text style={[styles.noAudioText, { color: theme.colors.textSecondary }]}>
                            {t('livevoice.no_audio_available', 'Audio not available')}
                          </Text>
                        </View>
                      )}

                      {currentAction && currentAction !== 'do_nothing' && (
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: ACTION_BUTTONS[currentAction]?.color || theme.colors.primary },
                          ]}
                          onPress={() => handleActionPress(currentAction)}
                        >
                          <Ionicons name={ACTION_BUTTONS[currentAction]?.icon || 'help-circle'} size={20} color="white" />
                          <Text style={styles.actionButtonText}>
                            {t(ACTION_BUTTONS[currentAction]?.labelKey) || currentAction}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )}

              {conversationHistory.length > 0 && !currentResponse && (
                <View style={[styles.historyContainer, { backgroundColor: `${theme.colors.primary}08` }]}>
                  <Text style={[styles.historyTitle, { color: theme.colors.primary }]}>
                    {t('livevoice.recent_commands', 'Recent Commands:')}
                  </Text>
                  {conversationHistory.slice(-3).map((item) => (
                    <View key={item.id} style={[styles.historyItem, { borderBottomColor: `${theme.colors.border}50` }]}>
                      <Text style={[styles.historyTime, { color: theme.colors.textSecondary }]}>{item.timestamp}</Text>
                      {item.transcribed && (
                        <Text style={[styles.historyQuestion, { color: theme.colors.textSecondary }]}>"{item.transcribed}"</Text>
                      )}
                      <Text style={[styles.historyAction, { color: theme.colors.text }]}>
                        Tool: {t(ACTION_BUTTONS[item.action]?.labelKey) || item.action}
                      </Text>
                      {item.audioData && (
                        <TouchableOpacity
                          style={[styles.historyAudioButton, { backgroundColor: `${theme.colors.primary}15` }]}
                          onPress={() => playAudioResponse(item.audioData)}
                        >
                          <Ionicons name="play" size={12} color={theme.colors.primary} />
                          <Text style={[styles.historyAudioText, { color: theme.colors.primary }]}>
                            {t('livevoice.replay_audio', 'Replay')}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {!currentResponse && !isProcessing && conversationHistory.length === 0 && (
                <View style={[styles.welcomeContainer, { backgroundColor: `${theme.colors.primary}12` }]}>
                  <Text style={[styles.welcomeText, { color: theme.colors.primary }]}>
                    {t('livevoice.ready_to_listen', 'Ready to Listen')}
                  </Text>
                  <Text style={[styles.welcomeSubtext, { color: theme.colors.text }]}>
                    {t('livevoice.tap_and_ask', 'Tap the microphone and ask about:')}
                    {'\n\n'}• {t('livevoice.examples.weather', 'Weather forecasts & temperatures')}
                    {'\n'}• {t('livevoice.examples.prices', 'Agricultural commodity prices')}
                    {'\n'}• {t('livevoice.examples.profile', 'Your farm profile & livestock')}
                    {'\n'}• {t('livevoice.examples.crop_management', 'Crop management & calendar')}
                    {'\n'}• {t('livevoice.examples.market', 'Market information')}
                    {'\n'}• {t('livevoice.examples.tips', 'Farming tips & advice')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.quickHelpButton,
                      { backgroundColor: `${theme.colors.primary}20`, borderColor: theme.colors.primary },
                    ]}
                    onPress={() => setShowOnboarding(true)}
                  >
                    <Ionicons name="help-circle" size={18} color={theme.colors.primary} />
                    <Text style={[styles.quickHelpText, { color: theme.colors.primary }]}>
                      {t('livevoice.need_help', 'Need help getting started?')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            <LinearGradient colors={['transparent', theme.colors.background]} style={styles.gradientOverlay} locations={[0, 1]} />
          </View>

          {/* Bottom Controls */}
          <View style={styles.controlsSection}>
            <LinearGradient
              colors={['#2b526f', '#2b9fdeff', '#4cabd9']}
              style={styles.controlsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <View style={styles.controlsContainer}>
              <TouchableOpacity style={[styles.controlButton, styles.endButton]} onPress={handleEndSession}>
                <MaterialCommunityIcons name="square" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={handlePause}>
                <MaterialCommunityIcons name={isPaused ? 'play' : 'pause'} size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.micButton, isListening && styles.micButtonActive, isProcessing && styles.micButtonProcessing]}
                onPress={handleMic}
                disabled={isProcessing}
              >
                <Ionicons
                  name={isProcessing ? 'sync' : isListening ? 'stop' : 'mic'}
                  size={isSmallScreen ? 32 : 36}
                  color="black"
                />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.controlButton, styles.exitButton]} onPress={handleExit}>
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Interactive Guide Overlay */}
          {showInteractiveGuide && (
            <View style={styles.guideOverlay}>
              <TouchableOpacity
                style={[styles.guideOverlayBackground, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                onPress={nextOnboardingStep}
                activeOpacity={1}
              />
              <InteractiveGuideTooltip
                step={hasAskedFirstQuestion ? FOLLOWUP_STEPS[onboardingStep] : ONBOARDING_STEPS[onboardingStep]}
                onNext={nextOnboardingStep}
                onSkip={skipOnboarding}
              />
            </View>
          )}

          {/* Onboarding Modal */}
          {showOnboarding && (
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <View style={[styles.onboardingModal, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.onboardingHeader, { borderBottomColor: theme.colors.border }]}>
                  <Text style={[styles.onboardingTitle, { color: theme.colors.text }]}>Voice Assistant Guide</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setShowOnboarding(false)}>
                    <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.onboardingContent}>
                  <View style={styles.guideSection}>
                    <Text style={[styles.guideSectionTitle, { color: theme.colors.text }]}>How to Use:</Text>
                    <Text style={[styles.guideText, { color: theme.colors.textSecondary }]}>1. Tap the microphone button</Text>
                    <Text style={[styles.guideText, { color: theme.colors.textSecondary }]}>2. Speak your question clearly</Text>
                    <Text style={[styles.guideText, { color: theme.colors.textSecondary }]}>3. Wait for AI response</Text>
                    <Text style={[styles.guideText, { color: theme.colors.textSecondary }]}>
                      4. Tap action buttons to navigate
                    </Text>
                  </View>

                  <View style={styles.guideSection}>
                    <Text style={[styles.guideSectionTitle, { color: theme.colors.text }]}>Sample Questions:</Text>
                    <Text style={[styles.guideExample, { color: theme.colors.primary }]}>"What's the weather today?"</Text>
                    <Text style={[styles.guideExample, { color: theme.colors.primary }]}>"What crops should I grow now?"</Text>
                    <Text style={[styles.guideExample, { color: theme.colors.primary }]}>
                      "Show me modern farming techniques"
                    </Text>
                    <Text style={[styles.guideExample, { color: theme.colors.primary }]}>"Check soil moisture levels"</Text>
                    <Text style={[styles.guideExample, { color: theme.colors.primary }]}>"Find equipment for rent"</Text>
                  </View>

                  <View style={styles.guideSection}>
                    <Text style={[styles.guideSectionTitle, { color: theme.colors.text }]}>Follow-up Questions:</Text>
                    <Text style={[styles.guideText, { color: theme.colors.textSecondary }]}>
                      You can ask follow-up questions and the AI will remember the context of your conversation!
                    </Text>
                    <Text style={[styles.guideExample, { color: theme.colors.primary }]}>
                      Example: "What's the weather?" → "Should I water my crops?"
                    </Text>
                  </View>

                  <View style={styles.guideSection}>
                    <Text style={[styles.guideSectionTitle, { color: theme.colors.text }]}>Action Buttons:</Text>
                    <View style={styles.actionExamples}>
                      <View style={styles.actionExample}>
                        <Ionicons name="cloud" size={18} color="#4FC3F7" />
                        <Text style={[styles.actionExampleText, { color: theme.colors.textSecondary }]}>Weather</Text>
                      </View>
                      <View style={styles.actionExample}>
                        <Ionicons name="leaf" size={18} color="#4CAF50" />
                        <Text style={[styles.actionExampleText, { color: theme.colors.textSecondary }]}>Crop Intelligence</Text>
                      </View>
                      <View style={styles.actionExample}>
                        <Ionicons name="water" size={18} color="#8BC34A" />
                        <Text style={[styles.actionExampleText, { color: theme.colors.textSecondary }]}>Soil Check</Text>
                      </View>
                      <View style={styles.actionExample}>
                        <Ionicons name="paw" size={18} color="#FF9800" />
                        <Text style={[styles.actionExampleText, { color: theme.colors.textSecondary }]}>Livestock</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.gotItButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setShowOnboarding(false)}
                >
                  <Text style={[styles.gotItText, { color: 'white' }]}>Got it! Let's start</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  sessionEndedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sessionEndedContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  sessionEndedTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  sessionEndedSubtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  restartButton: {
    backgroundColor: '#03DAC6',
    borderRadius: 50,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  restartText: {
    fontSize: 14,
    textAlign: 'center',
  },

  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  networkStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  networkIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  networkStatusText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
  },
  retryButton: {
    marginLeft: 8,
    padding: 4,
  },
  helpButton: {
    padding: 8,
    borderRadius: 20,
  },

  // Waveform Styles
  waveformSection: {
    paddingVertical: isSmallScreen ? 15 : 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    height: isSmallScreen ? 40 : 50,
  },
  waveBar: {
    width: isSmallScreen ? 6 : 8,
    height: isSmallScreen ? 20 : 30,
    borderRadius: isSmallScreen ? 3 : 4,
    marginHorizontal: 1,
    backgroundColor: '#90caf9',
  },

  // Content Styles
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
    minHeight: '100%',
  },

  // Processing Styles
  processingContainer: {
    padding: isSmallScreen ? 16 : 20,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  processingText: {
    fontSize: isSmallScreen ? 16 : 18,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Conversation Styles
  conversationContainer: {
    width: '100%',
  },
  questionContainer: {
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#03DAC6',
  },
  questionTitle: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  questionText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  responseContainer: {
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#03DAC6',
  },
  responseTitle: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  responseText: {
    fontSize: isSmallScreen ? 14 : 16,
    lineHeight: isSmallScreen ? 20 : 24,
    marginBottom: 12,
  },

  // Audio Control Styles
  audioControlsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  audioButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  muteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  noAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  noAudioText: {
    fontSize: 12,
    marginLeft: 6,
  },

  // Action Button Styles
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 25,
    marginTop: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // History Styles
  historyContainer: {
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#90CAF9',
  },
  historyTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  historyTime: {
    fontSize: 10,
    marginBottom: 2,
  },
  historyQuestion: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  historyAction: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  historyAudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyAudioText: {
    fontSize: 10,
    marginLeft: 4,
  },

  // Welcome Styles
  welcomeContainer: {
    padding: isSmallScreen ? 20 : 24,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(3, 218, 198, 0.3)',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: isSmallScreen ? 13 : 14,
    lineHeight: isSmallScreen ? 18 : 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  quickHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickHelpText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },

  // Gradient Overlay
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    pointerEvents: 'none',
  },

  // Controls Section
  controlsSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: isSmallScreen ? 140 : 160,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  controlsGradient: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 40 : 50,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    height: '100%',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: isSmallScreen ? 45 : 50,
    height: isSmallScreen ? 45 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  endButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
  },
  pauseButton: {
    backgroundColor: 'rgba(96, 125, 139, 0.8)',
  },
  exitButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  micButton: {
    backgroundColor: 'white',
    borderRadius: isSmallScreen ? 35 : 40,
    width: isSmallScreen ? 70 : 80,
    height: isSmallScreen ? 70 : 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  micButtonActive: {
    backgroundColor: '#FF5722',
    transform: [{ scale: 1.1 }],
    borderColor: '#FF8A65',
  },
  micButtonProcessing: {
    backgroundColor: '#FFC107',
    borderColor: '#FFD54F',
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
  },
  tooltip: {
    position: 'absolute',
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
  },
  tooltipContent: {
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tooltipMessage: {
    fontSize: isSmallScreen ? 13 : 14,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  tooltipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Onboarding Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  onboardingModal: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  onboardingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  onboardingTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  onboardingContent: {
    padding: 20,
    maxHeight: height * 0.6,
  },
  guideSection: {
    marginBottom: 20,
  },
  guideSectionTitle: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  guideText: {
    fontSize: isSmallScreen ? 13 : 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  guideExample: {
    fontSize: isSmallScreen ? 13 : 14,
    fontStyle: 'italic',
    marginBottom: 4,
    paddingLeft: 10,
  },
  actionExamples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 12,
  },
  actionExample: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionExampleText: {
    fontSize: 11,
    marginLeft: 4,
  },
  gotItButton: {
    margin: 20,
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, y: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gotItText: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: 'bold',
  },
});
