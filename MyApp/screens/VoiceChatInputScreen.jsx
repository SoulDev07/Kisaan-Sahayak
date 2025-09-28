import React, { useState, useEffect, useRef } from 'react';
import { Component } from 'react';

// --- Error Boundary for Debugging ---
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.log('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
          <Text style={{ color: 'red', fontSize: 18, margin: 20 }}>A rendering error occurred:</Text>
          <Text style={{ color: 'white', fontSize: 14 }}>{String(this.state.error)}</Text>
          {this.state.errorInfo && (
            <Text style={{ color: 'gray', fontSize: 12, marginTop: 10 }}>{this.state.errorInfo.componentStack}</Text>
          )}
        </View>
      );
    }
    return this.props.children;
  }
}

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Alert,
  Clipboard,
  Share,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { NetworkConfig } from '../utils/NetworkConfig';
import MicOverlay from '../components/MicOverlay';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

// Interactive Guide Tooltip Component for VoiceChatInputScreen
function InteractiveGuideTooltip({ step, onNext, onSkip }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const getTooltipPosition = () => {
    switch (step.target) {
      case 'profileIcon':
        return { top: 100, right: 4 };
      case 'chatHistory':
        return { top: 100, left: 20 };
      case 'newChatButton':
        return { top: 10, alignSelf: 'center' };
      case 'featuresArea':
        return { top: '40%', alignSelf: 'center' };
      case 'inputArea':
        return { bottom: 120, alignSelf: 'center' };
      case 'attachButtons':
        return { bottom: 120, left: 20 };
      case 'homeButton':
        return { bottom: 60, right: 40 };
      case 'screen':
      default:
        return { top: '35%', alignSelf: 'center' };
    }
  };

  return (
    <View style={[styles.tooltip, getTooltipPosition(), { backgroundColor: theme.colors.surface }]}>
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
            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
              {t('voicechat.onboarding.skip_tour', 'Skip Tour')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.nextButton, { backgroundColor: theme.colors.primary }]} onPress={onNext}>
            <Text style={[styles.nextButtonText, { color: theme.colors.headerTitle }]}>
              {step.id === 'home_navigation'
                ? t('voicechat.onboarding.got_it', 'Got it!')
                : t('voicechat.onboarding.next', 'Next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// --- API Configuration ---
const getKissanAIResponse = async (message, context, t) => {
  // simple sleep helper for retry backoff
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  let session_id = await AsyncStorage.getItem('chat_session_id');
  if (!session_id) {
    session_id = Date.now().toString();
    await AsyncStorage.setItem('chat_session_id', session_id);
  }
  const user_id = 'f001';
  const farmer_id = 'f001';

  const payload = {
    user_prompt: message.type === 'text' ? message.content : message.content?.text || '',
    metadata: {
      extra_context: context || [],
      farmer_id,
    },
    user_id,
    session_id,
  };

  const maxRetries = 2;
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      attempt += 1;
      const response = await axios.post(`http://10.67.206.37:8001/agent`, payload, { timeout: 120000 });
      if (response.data && response.data.response_text) {
        return response.data.response_text;
      }
      if (response.data && response.data.error) {
        console.log('Server returned error:', response.data.error);
        return t('voicechat.errors.processing_issue', 'Sorry, there was an issue processing your request: {{error}}', {
          error: response.data.error,
        });
      }
      return t('voicechat.errors.did_not_understand', "Sorry, I didn't understand. Please try again.");
    } catch (error) {
      // If server sent a 429, try to respect retry-after if provided
      const status = error.response?.status;
      const data = error.response?.data;
      if (status === 429) {
        console.log('Received 429 from API:', data);
        // Try to extract retry seconds
        const retryAfter =
          data?.detail?.retry_after_seconds || data?.retry_after_seconds || error.response?.headers?.['retry-after'];
        const waitMs = retryAfter ? Math.ceil(Number(retryAfter) * 1000) : Math.min(5000 * attempt, 30000);
        if (attempt <= maxRetries) {
          console.log(`Retrying after ${waitMs}ms (attempt ${attempt}/${maxRetries})`);
          await sleep(waitMs);
          continue;
        }
        // Exhausted retries
        if (data?.detail) {
          return t('voicechat.errors.rate_limited', 'The AI service is busy. Please try again after {{seconds}} seconds.', {
            seconds: data.detail.retry_after_seconds || 'a few',
          });
        }
        return t('voicechat.errors.rate_limited', 'The AI service is busy. Please try again later.');
      }
      // Other errors: return friendly messages
      if (error.response) {
        console.log('AI error response:', error.response.data);
        console.log('AI error status:', error.response.status);
        if (error.response.data && error.response.data.detail) {
          return t('voicechat.errors.generic_with_detail', 'Sorry, there was an error: {{detail}}', {
            detail: error.response.data.detail,
          });
        } else if (error.response.data && error.response.data.error) {
          return t('voicechat.errors.generic_with_detail', 'Sorry, there was an error: {{detail}}', {
            detail: error.response.data.error,
          });
        } else if (error.response.status === 500) {
          return t('voicechat.errors.server_error_500', 'Sorry, there was a server error. Please try again or contact support.');
        } else if (error.response.status === 404) {
          return t(
            'voicechat.errors.service_unavailable_404',
            'Sorry, the service is not available. Please check your connection.'
          );
        }
      } else {
        console.log('AI error:', error.message || error);
      }
      return t('voicechat.errors.server_error_generic', 'Server error. Please try again later.');
    }
  }
};

// --- Helper to render bold text ---
const FormattedText = ({ text }) => {
  const { theme } = useTheme();
  if (!text || typeof text !== 'string') {
    return <Text style={[styles.chatMessageText, { color: theme.colors.text }]}></Text>;
  }
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <Text style={[styles.chatMessageText, { color: theme.colors.text }]}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <Text key={index} style={{ fontWeight: 'bold', color: theme.colors.text }}>
            {part}
          </Text>
        ) : (
          <Text key={index} style={{ color: theme.colors.text }}>
            {part}
          </Text>
        )
      )}
    </Text>
  );
};

// --- Chat Message Component ---
const ChatMessage = ({ message, chatHistory }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isUser = message.sender === 'user';
  const isDocument = message.type === 'document';
  const isImage = message.type === 'image';
  const isContext = message.type === 'context';
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleCopy = () => Clipboard.setString(message.content || '');
  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };
  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  const handleShare = async () => {
    try {
      let shareText = t('voicechat.share.header', 'Kisaan Sahayak Chat:\n\n');
      chatHistory.forEach((msg) => {
        const sender =
          msg.sender === 'user' ? t('voicechat.share.user_sender', 'You') : t('voicechat.share.ai_sender', 'Kisaan Sahayak');
        const content =
          msg.type === 'document'
            ? t('voicechat.share.document_placeholder', '[Document: {{name}}]', { name: msg.content?.name || 'Unknown' })
            : msg.content || '';
        shareText += `${sender}: ${content}\n\n`;
      });
      await Share.share({ message: shareText, title: t('voicechat.header_title_default', 'Voice Chat') });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View style={styles.chatMessageWrapper}>
      {!isUser && <MaterialCommunityIcons name="star-four-points" size={24} color={theme.colors.primary} style={styles.aiIcon} />}
      <View
        style={[
          styles.chatMessageContainer,
          isUser ? [styles.userMessageContainer, { backgroundColor: theme.colors.card }] : styles.aiMessageContainer,
          isContext && [styles.contextMessageContainer, { borderColor: theme.colors.border }],
        ]}
      >
        {isDocument ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="file-check" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
            <Text style={[styles.chatMessageText, { color: theme.colors.text }]}>
              {t('voicechat.attached_file', 'Attached: {{name}}', { name: message.content?.name || 'Unknown file' })}
            </Text>
          </View>
        ) : isImage ? (
          <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: message.content?.uri || '' }}
                style={{ width: 120, height: 120, borderRadius: 10, marginRight: 8 }}
              />
              <Text style={[styles.chatMessageText, { color: theme.colors.text }]}>
                {message.content?.name || t('voicechat.image_attached', 'Image attached')}
              </Text>
            </View>
            {message.content?.text && (
              <Text style={[styles.chatMessageText, { marginTop: 6, color: theme.colors.text }]}>{message.content.text}</Text>
            )}
          </View>
        ) : isContext ? (
          <Text style={[styles.contextMessageText, { color: theme.colors.textSecondary }]}>{message.content || ''}</Text>
        ) : isUser ? (
          <FormattedText text={message.content || ''} />
        ) : (
          <View>
            <Markdown style={{ body: [styles.chatMessageText, { color: theme.colors.text }] }}>{message.content || ''}</Markdown>
          </View>
        )}
        {!isUser && !isDocument && !isImage && (
          <View style={styles.actionIconContainer}>
            <TouchableOpacity onPress={handleLike}>
              <MaterialCommunityIcons
                name={liked ? 'thumb-up' : 'thumb-up-outline'}
                size={20}
                color={liked ? theme.colors.primary : theme.colors.textSecondary}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDislike}>
              <MaterialCommunityIcons
                name={disliked ? 'thumb-down' : 'thumb-down-outline'}
                size={20}
                color={disliked ? theme.colors.primary : theme.colors.textSecondary}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <MaterialCommunityIcons
                name="share-variant-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCopy}>
              <MaterialCommunityIcons
                name="content-copy"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

// --- Thinking Indicator Component ---
const ThinkingIndicator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.thinkingContainer}>
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <MaterialCommunityIcons name="star-four-points" size={24} color={theme.colors.primary} />
      </Animated.View>
      <Text style={[styles.thinkingText, { color: theme.colors.textSecondary }]}>{t('voicechat.thinking', 'Just a sec...')}</Text>
    </View>
  );
};

const getFeatureOptions = (theme, t) => [
  {
    icon: <MaterialCommunityIcons name="bank" size={20} color="#f59e0b" />,
    label: t('features.marketplace', 'Marketplace'),
    screen: 'MarketplaceScreen',
    color: '#f59e0b',
  },
  {
    icon: <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#3b82f6" />,
    label: t('features.calendar', 'Calendar'),
    screen: 'CalenderScreen',
    color: '#3b82f6',
  },
  {
    icon: <MaterialCommunityIcons name="cow" size={20} color="#10b981" />,
    label: t('features.cattle', 'Cattle'),
    screen: 'CattleScreen',
    color: '#10b981',
  },
//   {
//     icon: <MaterialCommunityIcons name="recycle-variant" size={20} color="#f59e0b" />,
//     label: t('features.crop_cycle', 'Crop Cycle'),
//     screen: 'CropCycle',
//     color: '#f59e0b',
//   },
  {
    icon: <MaterialCommunityIcons name="water" size={20} color="#38bdf8" />,
    label: t('features.soil_moisture', 'Soil Moisture'),
    screen: 'CropIntelligenceScreenNew',
    color: '#38bdf8',
  },
  {
    icon: <MaterialCommunityIcons name="school" size={20} color={theme?.colors?.primary || '#6366f1'} />,
    label: t('features.education_finance', 'Education & Finance'),
    screen: 'UPI',
    color: theme?.colors?.primary || '#6366f1',
  },
  {
    icon: <MaterialCommunityIcons name="file-document-multiple" size={20} color="#f59e0b" />,
    label: t('features.document_builder', 'Document Builder'),
    screen: 'DocumentAgentScreen',
    color: '#f59e0b',
  },
  {
    icon: <MaterialCommunityIcons name="stethoscope" size={20} color="#10b981" />,
    label: t('features.crop_doctor', 'Crop Doctor'),
    screen: 'CropDoctor',
    color: '#10b981',
  },
  {
    icon: <MaterialCommunityIcons name="tractor-variant" size={20} color="#f59e0b" />,
    label: t('features.equipment_rental', 'Equipment Rental'),
    screen: 'RentalSystemScreen',
    color: '#f59e0b',
  },
//   {
//     icon: <MaterialCommunityIcons name="sprout" size={20} color="#84cc16" />,
//     label: t('features.farm_visualizer', 'Farm Visualizer'),
//     screen: 'FarmVisualizerScreen',
//     color: '#84cc16',
//   },
  {
    icon: <MaterialCommunityIcons name="heart-plus" size={20} color="#ef4444" />,
    label: t('features.mental_health', 'Mental Health Support'),
    screen: 'SuicidePrevention',
    color: '#ef4444',
  },
];

const FeaturesView = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const featureOptions = getFeatureOptions(theme, t);
  const mainOptions = featureOptions.slice(0, 4);
  const extraOptions = featureOptions.slice(4);
  const pillBorderColor = isDark ? '#ffffff' : '#000000';

  const renderIcon = (icon, label) => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    console.warn('Invalid icon for label:', label, icon);
    return <MaterialCommunityIcons name="help-circle-outline" size={20} color={theme.colors.textSecondary} />;
  };

  return (
    <View style={styles.featuresPillContainer}>
      <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>{t('voicechat.quick_features', 'Quick Features')}</Text>
      <View style={styles.pillRow}>
        {mainOptions.map((opt, idx) => {
          if (!opt || typeof opt !== 'object' || typeof opt.label !== 'string') {
            console.warn('Skipping invalid mainOption:', opt);
            return null;
          }
          return (
            <TouchableOpacity
              key={`${opt.label}-${idx}`}
              style={[styles.pillButton, { borderColor: pillBorderColor }]}
              onPress={() => navigation.navigate(opt.screen)}
              activeOpacity={0.85}
            >
              {renderIcon(opt.icon, opt.label)}
              <Text style={[styles.pillLabel, { color: theme.colors.textSecondary }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={[styles.pillButton, { borderColor: pillBorderColor }]} onPress={() => setShowAll((v) => !v)}>
          <MaterialCommunityIcons name="dots-horizontal" size={20} color={theme.colors.text} />
          <Text style={[styles.pillLabel, { color: theme.colors.text }]}>{t('voicechat.more', 'More')}</Text>
        </TouchableOpacity>
      </View>
      {showAll && (
        <View style={styles.pillRowMore}>
          {extraOptions.map((opt, idx) => {
            if (!opt || typeof opt !== 'object' || typeof opt.label !== 'string') {
              console.warn('Skipping invalid extraOption:', opt);
              return null;
            }
            return (
              <TouchableOpacity
                key={`${opt.label}-more-${idx}`}
                style={[styles.pillButton, { borderColor: pillBorderColor }]}
                onPress={() => navigation.navigate(opt.screen)}
                activeOpacity={0.85}
              >
                {renderIcon(opt.icon, opt.label)}
                <Text style={[styles.pillLabel, { color: theme.colors.textSecondary }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

// --- Today's Actions Component ---
const TodayActions = ({ onDismiss, onActionSelect }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [actions, setActions] = useState([]);
  const [error, setError] = useState(null);
  const FARMER_ID = 'f001';
  const cacheKey = `today_actions_${new Date().toISOString().split('T')[0]}`;

  const iconForAction = (label = '') => {
    const l = label.toLowerCase();
    if (/(soil|moisture)/.test(l)) return <MaterialCommunityIcons name="water" size={18} color={theme.colors.primary} />;
    if (/(pest|disease|scan)/.test(l)) return <MaterialCommunityIcons name="bug-outline" size={18} color="#ef4444" />;
    if (/(market|price|sell)/.test(l)) return <MaterialCommunityIcons name="storefront-outline" size={18} color="#f59e0b" />;
    if (/(irrigat|water)/.test(l)) return <MaterialCommunityIcons name="sprinkler-variant" size={18} color="#38bdf8" />;
    if (/(finance|loan|upi)/.test(l)) return <MaterialCommunityIcons name="bank" size={18} color="#6366f1" />;
    if (/(document|paper|form)/.test(l)) return <MaterialCommunityIcons name="file-document" size={18} color="#f59e0b" />;
    if (/(rental|equipment|tractor)/.test(l)) return <MaterialCommunityIcons name="tractor-variant" size={18} color="#f59e0b" />;
    return <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={theme.colors.primary} />;
  };

  const parseActions = (raw) => {
    try {
      if (!raw) return [];
      if (typeof raw === 'string') {
        // Extract first JSON object if model added extra text
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) raw = match[0];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.today_actions)) return parsed.today_actions.slice(0, 3);
      } else if (typeof raw === 'object') {
        if (Array.isArray(raw.today_actions)) return raw.today_actions.slice(0, 3);
      }
    } catch (e) {
      // silent
    }
    return [];
  };

  // Heuristic fallback actions when AI fails or returns empty
  const buildFallbackActions = ({ profile = {}, crops = [], livestock = [], todayEvents = [] }) => {
    const list = [];
    const harvestCrop = crops.find(c => /harvest|flower|mature/i.test(c?.stage || c?.status || ''));
    if (harvestCrop) {
      list.push({
        label: `Check ${harvestCrop.name || harvestCrop.cropName || 'crop'} harvest readiness`,
        reason: 'Avoid quality & yield loss with timely harvest.',
        screen: 'CropDoctor'
      });
    }
    if (todayEvents.length > 0) {
      list.push({
        label: "Review today's scheduled farm tasks",
        reason: `You have ${todayEvents.length} planned task(s) today. Prioritize critical ones.`,
        screen: 'CalenderScreen'
      });
    }
    if (livestock.length > 0) {
      list.push({
        label: 'Inspect livestock health & feed logs',
        reason: 'Early issue detection lowers treatment cost.',
        screen: 'CattleScreen'
      });
    }
    if (list.length < 3) {
      list.push({
        label: 'Record crop growth observations',
        reason: 'Notes improve advisory accuracy & planning.',
        screen: 'CropIntelligenceScreenNew'
      });
    }
    if (list.length < 3) {
      list.push({
        label: 'Check market prices before selling',
        reason: 'Better timing can improve revenue.',
        screen: 'MarketplaceScreen'
      });
    }
    return list.slice(0,3);
  };

  const buildAndFetch = async (opts = { fromRefresh: false }) => {
    try {
      if (!opts.fromRefresh) setLoading(true); else setRegenerating(true);
      setError(null);

      // Attempt cache first
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached && !opts.fromRefresh) {
        const parsed = JSON.parse(cached);
        setActions(parsed);
        setLoading(false);
        return;
      }

      // Parallel fetch context
      const [calRes, profileRes, cropsRes, livestockRes] = await Promise.all([
        fetch(`${NetworkConfig.API_BASE}/farmer/${FARMER_ID}/calendar`).catch(() => null),
        fetch(`${NetworkConfig.API_BASE}/farmer/${FARMER_ID}/profile`).catch(() => null),
        fetch(`${NetworkConfig.API_BASE}/farmer/${FARMER_ID}/crops`).catch(() => null),
        fetch(`${NetworkConfig.API_BASE}/farmer/${FARMER_ID}/livestock`).catch(() => null),
      ]);
      const calendarEvents = calRes?.ok ? await calRes.json() : [];
      const profile = profileRes?.ok ? await profileRes.json() : {};
      const crops = cropsRes?.ok ? await cropsRes.json() : [];
      const livestock = livestockRes?.ok ? await livestockRes.json() : [];

      const todayISO = new Date().toISOString().split('T')[0];
      const todayEvents = calendarEvents.filter(ev => ev.date === todayISO);
      const calendarLines = todayEvents.map(ev => `- ${ev.time || ''} ${ev.task || ''} (${ev.details || ''})`).join('\n') || 'No events';
      const cropSummary = crops.map(c => `${c.name || c.cropName || 'Crop'}:${c.stage || c.status || ''}`).slice(0, 5).join(', ') || 'No crop data';
      const livestockSummary = livestock.map(l => l.type || l.animal || l.name || 'Animal').slice(0, 5).join(', ') || 'None';
      const profileBits = [profile?.village && `Village:${profile.village}`, profile?.farmSize && `FarmSize:${profile.farmSize}`, profile?.language && `Lang:${profile.language}`].filter(Boolean).join(', ') || 'Minimal profile info';

  const instruction = `You are an assistant generating up to 3 HIGH-VALUE, FARM-DAY SPECIFIC TASKS or INSIGHTS the farmer should EXECUTE or BE AWARE OF TODAY (${todayISO}).\nReturn STRICT JSON ONLY in this shape: {"today_actions":[{"label":"Action (<=30 chars, imperative or concise insight)","reason":"Why it matters (<=80 chars)","screen":"OptionalScreenName"}]}\nRules:\n - NO user questions or prompts; only direct actionable tasks or insights\n - Diversity: include operations, risk mitigation, and opportunity if possible\n - Use screen only if it helps accomplish task (CalenderScreen, CropDoctor, MarketplaceScreen, CropIntelligenceScreenNew, UPI, RentalSystemScreen, DocumentAgentScreen, CattleScreen)\n - If context sparse, provide universally valuable farm management tasks\n - Output ONLY JSON. No commentary.\nContext:\nPROFILE: ${profileBits}\nCROPS: ${cropSummary}\nLIVESTOCK: ${livestockSummary}\nTODAY_CALENDAR:\n${calendarLines}`;

      const payload = {
        user_prompt: instruction,
        metadata: { mode: 'today_actions_v2', farmer_id: FARMER_ID },
        user_id: FARMER_ID,
        session_id: `today-${FARMER_ID}`,
      };
  const aiResp = await axios.post(`http://10.100.155.236:8001/agent`, payload, { timeout: 300000 });
      let parsedActions = parseActions(aiResp?.data?.response_text || aiResp?.data);
      parsedActions = (parsedActions || []).map(a => ({
        label: a.label || a.title || a.task || a.name || 'Farm task',
        reason: a.reason || a.why || a.insight || '',
        screen: a.screen
      })).filter(a => a.label).slice(0,3);
      if (!parsedActions || parsedActions.length === 0) {
        parsedActions = buildFallbackActions({ profile, crops, livestock, todayEvents });
      }
      setActions(parsedActions);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(parsedActions));
      setLoading(false); setRegenerating(false);
    } catch (e) {
      // Attempt fallback
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActions(parsed);
          } else {
            setActions(buildFallbackActions({}));
          }
        } else {
          setActions(buildFallbackActions({}));
        }
      } catch(_) {
        setActions(buildFallbackActions({}));
      }
      // setError('Network issue – showing fallback tasks');
      setLoading(false); setRegenerating(false);
    }
  };

  useEffect(() => { buildAndFetch(); }, []);

  const refresh = () => buildAndFetch({ fromRefresh: true });

  const Placeholder = () => (
    <View style={[styles.todayActionCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, opacity: 0.5 }]}>      
      <View style={{ width: 50, height: 12, backgroundColor: theme.colors.border, borderRadius: 6, marginBottom: 4 }} />
      <View style={{ width: 70, height: 10, backgroundColor: theme.colors.border, borderRadius: 6 }} />
    </View>
  );

  return (
    <View style={[styles.todayActionsContainer, { borderColor: theme.colors.border, backgroundColor: isDark ? '#1f1f1f' : theme.colors.card }]}>      
      <View style={styles.todayActionsHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="calendar-today" size={20} color={theme.colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.todayActionsTitle, { color: theme.colors.text }]}>{t('today_actions.title', "Today's Recommendations")}</Text>
          {regenerating && <MaterialCommunityIcons name="loading" size={18} color={theme.colors.textSecondary} style={{ marginLeft: 6 }} />}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={refresh} style={{ marginRight: 12 }} accessibilityLabel="Refresh actions">
            <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDismiss} accessibilityLabel="Dismiss today's actions">
            <MaterialCommunityIcons name="close" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      {error && (
        <Text style={{ color: theme.colors.danger, fontSize: 12, marginBottom: 6 }} numberOfLines={2}>{error}</Text>
      )}
      {loading ? (
        <View style={styles.todayActionsCardsRow}>
          <Placeholder />
          <Placeholder />
          <Placeholder />
        </View>
      ) : actions.length === 0 ? (
        <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
          {t('today_actions.none', 'No specific tasks right now. Explore features below!')}
        </Text>
      ) : (
        <View style={styles.todayActionsCardsRow}>
          {actions.map((a, idx) => {
            const count = actions.length; // 1..3
            // dynamic width: 1 -> full, 2 -> 48% each, 3 -> ~31% each
            const widthPct = count === 1 ? '100%' : count === 2 ? '48%' : '31%';
            return (
              <TouchableOpacity
                key={idx}
                accessibilityLabel={`Today's task ${idx + 1}: ${a.label}`}
                style={[
                  styles.todayActionCard,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    width: widthPct,
                  },
                ]}
                onPress={() => onActionSelect && onActionSelect(a)}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  {iconForAction(a.label || a.title || '')}
                  <Text
                    style={[styles.todayActionLabel, { color: theme.colors.text, marginLeft: 8, flexShrink: 1 }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {a.label || a.title || a.name || t('today_actions.action', 'Action')}
                  </Text>
                </View>
                {!!a.reason && (
                  <Text
                    style={[styles.todayActionReason, { color: theme.colors.textSecondary }]}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {a.reason}
                  </Text>
                )}
                {a.screen && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 10, color: theme.colors.textSecondary }} numberOfLines={1}>
                      {a.screen}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

// --- Main Chat Screen Component ---
export default function VoiceChatInputScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatTitle, setChatTitle] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentContext, setCurrentContext] = useState(null);
  const flatListRef = useRef();
  const [allContext, setAllContext] = useState({ weather: '', soil: '', market: '' });
  const [attachedImage, setAttachedImage] = useState(null);
  const [showTodayActions, setShowTodayActions] = useState(true);

  const [showInteractiveGuide, setShowInteractiveGuide] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const ONBOARDING_STEPS = [
    {
      id: 'welcome',
      title: t('voicechat.onboarding.welcome.title', 'Welcome to Kisaan Sahayak AI!'),
      message: t('voicechat.onboarding.welcome.message', "This is your personal farming assistant. Let's take a quick tour!"),
      target: 'screen',
      position: 'center',
    },
    {
      id: 'profile_access',
      title: t('voicechat.onboarding.profile.title', 'Profile & Settings'),
      message: t('voicechat.onboarding.profile.message', 'Tap here to access your personal profile and app settings.'),
      target: 'profileIcon',
      position: 'bottom',
    },
    {
      id: 'chat_history',
      title: t('voicechat.onboarding.chat_history.title', 'Chat History'),
      message: t('voicechat.onboarding.chat_history.message', 'Access your past conversations here.'),
      target: 'chatHistory',
      position: 'bottom',
    },
    {
      id: 'new_chat',
      title: t('voicechat.onboarding.new_chat.title', 'Start a New Chat'),
      message: t('voicechat.onboarding.new_chat.message', 'Tap here to start a fresh conversation.'),
      target: 'newChatButton',
      position: 'bottom',
    },
    {
      id: 'features_overview',
      title: t('voicechat.onboarding.features.title', 'Quick Features'),
      message: t('voicechat.onboarding.features.message', 'Quickly access key features from here.'),
      target: 'featuresArea',
      position: 'top',
    },
    {
      id: 'text_input',
      title: t('voicechat.onboarding.input.title', 'Type or Speak'),
      message: t('voicechat.onboarding.input.message', 'Type your question or tap the mic icon to speak.'),
      target: 'inputArea',
      position: 'bottom',
    },
    {
      id: 'attachments',
      title: t('voicechat.onboarding.attachments.title', 'Attach Files'),
      message: t('voicechat.onboarding.attachments.message', 'Attach documents or images for more detailed help.'),
      target: 'attachButtons',
      position: 'bottom',
    },
    {
      id: 'home_navigation',
      title: t('voicechat.onboarding.home.title', 'Go Home'),
      message: t('voicechat.onboarding.home.message', 'Tap here to go back to the home screen.'),
      target: 'homeButton',
      position: 'bottom',
    },
  ];

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenGuide = await AsyncStorage.getItem('voiceChatInputScreenOnboardingCompleted');
      if (!hasSeenGuide) {
        setTimeout(() => {
          setShowInteractiveGuide(true);
          setOnboardingStep(0);
        }, 2000);
      }
      setHasSeenOnboarding(!!hasSeenGuide);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setTimeout(() => {
        setShowInteractiveGuide(true);
        setOnboardingStep(0);
      }, 2000);
    }
  };

  const startInteractiveGuide = () => {
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
      await AsyncStorage.setItem('voiceChatInputScreenOnboardingCompleted', 'true');
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('voiceChatInputScreenOnboardingCompleted');
      setHasSeenOnboarding(false);
      Alert.alert(
        t('voicechat.onboarding.reset_complete_title', 'Reset Complete'),
        t('voicechat.onboarding.reset_complete_message', 'Onboarding reset! Restart the app to see it again.')
      );
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  useEffect(() => {
    const context = route.params?.context;
    if (context) {
      setCurrentContext(context);
      setChatTitle(t('voicechat.default_title', 'Kisaan ki Awaaz'));
      setChatHistory([]);
    }

    // If navigated with chatData, load immediately for instant UI
    const chatData = route.params?.chatData;
    const chatId = route.params?.chatId;
    const loadFromCacheOrBackend = async () => {
      if (chatData) {
        // chatData expected to have id, title, date, messages
        setChatTitle(chatData.title || '');
        setChatHistory(chatData.messages || chatData.messages || []);
        return;
      }
      if (chatId) {
        try {
          const cache = await AsyncStorage.getItem('chat-history-cache');
          if (cache) {
            const parsed = JSON.parse(cache);
            const found = parsed.find((c) => c.id === chatId);
            if (found) {
              setChatTitle(found.title || '');
              setChatHistory(found.messages || []);
              return;
            }
          }
          // fallback fetch single chat from backend
          const resp = await fetch(`${NetworkConfig.API_BASE}/farmer/${FARMER_ID}/chat`);
          const all = await resp.json();
          const found = all.find((c) => c.id === chatId);
          if (found) {
            setChatTitle(found.title || '');
            setChatHistory(found.messages || []);
          }
        } catch (e) {
          console.error('Failed to load chat by id', e);
        }
      }
    };
    loadFromCacheOrBackend();
  }, [route.params, t]);

  const saveChatToHistory = async (title, messages) => {
    try {
      const newChat = {
        id: Date.now().toString(),
        title: title || t('voicechat.untitled_chat', 'Untitled Chat'),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        messages,
      };
      let history = await AsyncStorage.getItem('chatHistory');
      history = history ? JSON.parse(history) : [];
      history.unshift(newChat);
      await AsyncStorage.setItem('chatHistory', JSON.stringify(history.slice(0, 20)));
    } catch (e) {
      console.log('Failed to save chat to history', e);
    }
  };

  const handleStartNewChat = async () => {
    if (chatHistory.length > 0) {
      await saveChatToHistory(chatTitle, chatHistory);
    }
    setChatHistory([]);
    setChatTitle('');
    setInputValue('');
    setAttachedImage(null);
    setCurrentContext(null);
  };

  useEffect(() => {
    if (chatHistory.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatHistory]);

  const handleSendMessage = async (message) => {
    let msgToSend = null;
    if (attachedImage && (inputValue.trim() || !inputValue)) {
      msgToSend = {
        type: 'image',
        content: {
          name: attachedImage.name || 'Image',
          uri: attachedImage.uri,
          text: inputValue.trim() ? inputValue : undefined,
        },
      };
    } else if (!message) {
      if (!inputValue.trim()) return;
      msgToSend = { type: 'text', content: inputValue };
    } else {
      msgToSend = message;
    }

    if (!msgToSend) return;

    if (chatHistory.length === 0 && !currentContext) {
      const title = msgToSend.content.text
        ? msgToSend.content.text.length > 25
          ? `${msgToSend.content.text.substring(0, 22)}...`
          : msgToSend.content.text
        : msgToSend.content.length > 25
        ? `${msgToSend.content.substring(0, 22)}...`
        : msgToSend.content;
      setChatTitle(title);
    }

    const userMessage = { sender: 'user', ...msgToSend };
    setChatHistory((prev) => [...prev, userMessage]);
  // Hide today's actions once user begins chatting
  if (showTodayActions) setShowTodayActions(false);
    setInputValue('');
    setAttachedImage(null);
    setIsThinking(true);

    const aiResponseText = await getKissanAIResponse(msgToSend, chatHistory, t);
    const aiMessage = { sender: 'ai', type: 'text', content: aiResponseText };
    setChatHistory((prev) => [...prev, aiMessage]);
    setIsThinking(false);
  };

  const handleAttachDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const doc = result.assets[0];
        const isImage =
          (doc.mimeType && doc.mimeType.startsWith('image/')) || (doc.name && doc.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i));

        if (isImage) {
          const base64 = await FileSystem.readAsStringAsync(doc.uri, { encoding: FileSystem.EncodingType.Base64 });
          const ext = doc.name.split('.').pop().toLowerCase();
          const mime = ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext;
          const dataUrl = `data:image/${mime};base64,${base64}`;
          setAttachedImage({ name: doc.name, uri: dataUrl });
        } else {
          const message = { type: 'document', content: { name: doc.name, uri: doc.uri } };
          handleSendMessage(message);
        }
      }
    } catch (err) {
      Alert.alert(t('common.error', 'Error'), t('voicechat.errors.document_picker_failed', 'Could not open document picker'));
    }
  };

  const handleAttachImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.IMAGE],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const img = result.assets[0];
        const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: FileSystem.EncodingType.Base64 });

        let ext = 'jpeg';
        if (img.fileName && img.fileName.includes('.')) {
          ext = img.fileName.split('.').pop().toLowerCase();
        }
        const mime = ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext;
        const dataUrl = `data:image/${mime};base64,${base64}`;
        setAttachedImage({ name: img.fileName || 'Image', uri: dataUrl });
      }
    } catch (err) {
      Alert.alert(t('common.error', 'Error'), t('voicechat.errors.image_picker_failed', 'Could not open image picker'));
    }
  };

  const FARMER_ID = 'f001';

  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBarStyle} />
        <View style={[styles.topBar, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.navigate('ChatHistory')}>
            <Ionicons name="time-outline" size={34} color={theme.colors.headerTint} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: theme.colors.headerTitle }]} numberOfLines={1}>
            {chatTitle || t('voicechat.header_title_default', 'Voice Chat')}
          </Text>
          <View style={styles.topRightIcons}>
            {/* spacer reserved for external overlay button */}
            <View style={styles.overlaySpacer} />
            <TouchableOpacity onPress={() => navigation.navigate('Featured')} style={styles.topRightIcon}>
              <Ionicons name="star-outline" size={26} color={theme.colors.headerTint} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('FarmerProfile', { farmerId: FARMER_ID })}
              style={styles.topRightIcon}
            >
              <Ionicons name="person-circle-outline" size={42} color={theme.colors.headerTint} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.centeredNewChatRow}>
          <TouchableOpacity
            style={styles.centeredNewChatButton}
            onPress={async () => {
              if (chatHistory.length > 0) {
                try {
                  await saveChatToHistory(chatTitle, chatHistory);
                } catch (e) {
                  Alert.alert(
                    t('common.error', 'Error'),
                    t('voicechat.errors.save_backend_failed', 'Failed to save chat to backend')
                  );
                }
              }
              setChatHistory([]);
              setChatTitle('');
              setInputValue('');
              setAttachedImage(null);
              setCurrentContext(null);
              navigation.navigate('ChatHistory');
            }}
          >
            <Ionicons name="add-circle" size={38} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={{ flex: 1 }}>
            {chatHistory.length === 0 ? (
              <>
                {showTodayActions && (
                  <TodayActions
                    onDismiss={() => setShowTodayActions(false)}
                    onActionSelect={(a) => {
                      if (a.screen) {
                        try {
                          navigation.navigate(a.screen);
                        } catch (e) {
                          console.log('Nav error', e);
                        }
                        setShowTodayActions(false);
                        return;
                      }
                      const prompt = a.prompt || a.label || a.title;
                      if (prompt) {
                        handleSendMessage({ type: 'text', content: prompt });
                      }
                      setShowTodayActions(false);
                    }}
                  />
                )}
                <FeaturesView navigation={navigation} />
              </>
            ) : (
              <FlatList
                ref={flatListRef}
                data={chatHistory}
                renderItem={({ item }) => (
                  <ChatMessage
                    message={item}
                    chatHistory={chatHistory}
                    onQuickAction={handleQuickAction}
                  />
                )}
                keyExtractor={(item, index) => `chat-${index}-${item.type || 'message'}`}
                style={[styles.chatList, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10 }}
                ListFooterComponent={isThinking ? <ThinkingIndicator /> : null}
              />
            )}
          </View>
          <View
            style={[
              styles.inputContainer,
              { marginRight: 70, marginBottom: 10, backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity style={styles.plusButton} onPress={handleAttachDocument}>
              <Ionicons name="add" size={28} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.plusButton} onPress={handleAttachImage}>
              <MaterialCommunityIcons name="image-plus" size={28} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {attachedImage && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                <Image source={{ uri: attachedImage.uri }} style={{ width: 50, height: 50, borderRadius: 8, marginRight: 6 }} />
                <TouchableOpacity onPress={() => setAttachedImage(null)} style={{ marginLeft: 2 }}>
                  <MaterialCommunityIcons name="close-circle" size={24} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              style={[styles.textInput, { color: theme.colors.text }]}
              placeholder={t('voicechat.input_placeholder', 'Type your message...')}
              placeholderTextColor={theme.colors.textSecondary}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={() => handleSendMessage()}
              multiline
            />
            <TouchableOpacity onPress={() => handleSendMessage()}>
              <MaterialCommunityIcons name="send-circle" size={34} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 10,
              right: 13,
              zIndex: 20,
              backgroundColor: theme.colors.surface,
              borderRadius: 32,
              padding: 10,
              elevation: 8,
            }}
            onPress={() => navigation.navigate('ChoiceScreen')}
            activeOpacity={0.85}
          >
            <Ionicons name="home-outline" size={30} color={theme.colors.primary} />
          </TouchableOpacity>
          {/* {hasSeenOnboarding && (
                        <View style={styles.tourButtonsContainer}>
                            <TouchableOpacity style={styles.restartTourButton} onPress={startInteractiveGuide}>
                                <MaterialCommunityIcons name="replay" size={20} color={theme.colors.primary} />
                                <Text style={[styles.restartTourText, { color: theme.colors.primary }]}>{t('voicechat.onboarding.restart_tour_button', 'Tour')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.resetTourButton} onPress={resetOnboarding}>
                                <MaterialCommunityIcons name="refresh" size={16} color={theme.colors.danger} />
                                <Text style={[styles.resetTourText, { color: theme.colors.danger }]}>{t('voicechat.onboarding.reset_button', 'Reset')}</Text>
                            </TouchableOpacity>
                        </View>
                    )} */}
        </KeyboardAvoidingView>
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
    </ErrorBoundary>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  topBarTitle: {
    fontSize: 23,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingRight: -18,
  },
  topRightIcons: {
    flexDirection: 'row',
  },
  topRightIcon: {
    marginRight: -6,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    borderRadius: 20,
  },
  overlaySpacer: {
    width: 8,
    height: 8,
    marginRight: 8,
    marginTop: 6,
  },
  chatList: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 35,
    paddingHorizontal: 20,
    marginHorizontal: '5%',
    marginVertical: 25,
    minHeight: 40,
    paddingVertical: 5,
  },
  plusButton: {
    marginRight: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    marginRight: 10,
    maxHeight: 80,
  },
  voiceButton: {
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 8,
  },
  chatMessageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
    paddingLeft: 10,
  },
  aiIcon: {
    marginRight: 8,
    marginTop: 10,
  },
  chatMessageContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
    borderBottomRightRadius: 5,
  },
  aiMessageContainer: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  contextMessageContainer: {
    borderWidth: 1,
    alignSelf: 'center',
    marginLeft: 0,
  },
  chatMessageText: {
    fontSize: 16,
    lineHeight: 18,
  },
  contextMessageText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  actionIcon: {
    marginRight: 20,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingLeft: 15,
  },
  thinkingText: {
    fontStyle: 'italic',
    marginLeft: 10,
  },
  featuresContainer: {
    marginTop: 30,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyFeatureBox: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginBottom: 22,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 8,
  },
  keyFeatureTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  keyFeatureSubtitle: {
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  featureBox: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    height: 120,
    borderWidth: 1,
  },
  featureText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  newChatButton: {
    marginLeft: 10,
    padding: 4,
  },
  cropDoctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginBottom: 22,
    alignSelf: 'center',
    width: '90%',
    borderWidth: 2,
    elevation: 8,
  },
  cropDoctorIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cropDoctorTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  cropDoctorSubtitle: {
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
  },
  featuresGridContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  featureGridBox: {
    width: 120,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    elevation: 2,
    flexDirection: 'column',
  },
  featureGridLabel: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  featuresPillContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
    gap: 10,
  },
  pillRowMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: 'transparent',
  },
  pillLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 6,
  },
  centeredNewChatRow: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 10,
  },
  centeredNewChatButton: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 2,
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
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1.5,

    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 140,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  restartTourText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  resetTourButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1.5,

    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resetTourText: {
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
  },
  tooltip: {
    position: 'absolute',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 15,
    maxWidth: width - 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipArrowDown: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tooltipArrowUp: {
    position: 'absolute',
    top: -7,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tooltipContent: {
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  tooltipMessage: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  tooltipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  skipButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    marginRight: 6,
    borderRadius: 6,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    marginLeft: 6,
    borderRadius: 6,
  },
  nextButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Quick Actions (AI suggested follow-ups)
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  quickActionCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: 150,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Today's Actions styles
  todayActionsContainer: {
    width: '92%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  todayActionsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  todayActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  todayActionsCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  todayActionCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  todayActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  todayActionReason: {
    fontSize: 10,
    lineHeight: 13,
    marginTop: 2,
  },
});
