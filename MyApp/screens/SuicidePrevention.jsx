import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import suicidePreventionService from '../services/SuicidePreventionService';

const { width, height } = Dimensions.get('window');

const SuicidePrevention = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [helplineData, setHelplineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('checking');

  // Default helpline data (fallback) with translation keys
  const defaultHelplineData = [
    {
      id: 1,
      t_key: 'national_crisis',
      name: 'National Crisis Helpline',
      number: '988',
      description: '24/7 Suicide Prevention Lifeline',
      icon: 'phone',
      color: '#ef4444',
    },
    {
      id: 2,
      t_key: 'crisis_text',
      name: 'Crisis Text Line',
      number: '741741',
      description: 'Text HOME to connect with a counselor',
      icon: 'message-text',
      color: '#3b82f6',
    },
    {
      id: 3,
      t_key: 'vandrevala',
      name: 'Vandrevala Foundation',
      number: '1860-266-2345',
      description: 'Mental health support in India',
      icon: 'heart',
      color: '#10b981',
    },
    {
      id: 4,
      t_key: 'icall',
      name: 'iCall Helpline',
      number: '022-25521111',
      description: 'Professional counseling support',
      icon: 'account-tie',
      color: '#8b5cf6',
    },
    {
      id: 5,
      t_key: 'sneha',
      name: 'Sneha Foundation',
      number: '044-24640050',
      description: '24/7 emotional support',
      icon: 'hand-heart',
      color: '#f59e0b',
    },
    {
      id: 6,
      t_key: 'aasra',
      name: 'AASRA',
      number: '9820466726',
      description: 'Suicide prevention and counseling',
      icon: 'shield',
      color: '#ec4899',
    },
  ];

  const handleCall = async (number, name) => {
    setLoading(true);
    try {
      await suicidePreventionService.handleEmergencyCall(number, name);
    } catch (error) {
      console.error('Backend call failed, falling back to direct call:', error);
      Alert.alert(
        t('suicide.call_title', 'Make a Call'),
        t('suicide.call_confirm', { name, number }, `Call ${name} at ${number}?`),
        [
          {
            text: t('common.cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: t('common.call', 'Call'),
            onPress: () => {
              Linking.openURL(`tel:${number}`);
            },
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHelplineData();
    checkServiceStatus();
  }, []);

  const loadHelplineData = async () => {
    try {
      const response = await suicidePreventionService.getHelplines();
      if (response.success && response.helplines) {
        setHelplineData(response.helplines);
      } else {
        setHelplineData(defaultHelplineData);
      }
    } catch (error) {
      console.error('Error loading helpline data:', error);
      setHelplineData(defaultHelplineData);
    }
  };

  const checkServiceStatus = async () => {
    try {
      await suicidePreventionService.healthCheck();
      setServiceStatus('connected');
    } catch (error) {
      console.error('Service health check failed:', error);
      setServiceStatus('disconnected');
    }
  };

  const handleEmergencyCall = async () => {
    setLoading(true);
    try {
      await suicidePreventionService.handleEmergencyCall('100', 'Emergency Services');
    } catch (error) {
      console.error('Emergency call failed:', error);
      Alert.alert(
        t('suicide.emergency_title', 'Emergency Call'),
        t('suicide.emergency_confirm', 'Call emergency services (100)?'),
        [
          {
            text: t('common.cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: t('suicide.call_emergency', 'Call Emergency'),
            style: 'destructive',
            onPress: () => {
              Linking.openURL('tel:100');
            },
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const HelplineCard = ({ item }) => {
    const { theme } = useTheme();
    const iconBg = item.color || theme.colors.primary;
    const name = t(`suicide.helplines.${item.t_key}.name`, item.name);
    const description = t(`suicide.helplines.${item.t_key}.description`, item.description);

    return (
      <TouchableOpacity
        style={[styles.helplineCard, { borderLeftColor: iconBg, backgroundColor: theme.colors.card }]}
        onPress={() => handleCall(item.number, name)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
            {/* CORRECTED: Wrapped icon in a Text component */}
            <Text><MaterialCommunityIcons name={item.icon} size={24} color={theme.colors.onPrimary || '#fff'} /></Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{name}</Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>{description}</Text>
          </View>
          <TouchableOpacity
            style={[styles.callButton, { backgroundColor: iconBg }]}
            onPress={() => handleCall(item.number, name)}
          >
            <Text><Ionicons name="call" size={20} color={theme.colors.onPrimary || '#fff'} /></Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardFooter}>
          <Text style={[styles.phoneNumber, { color: theme.colors.text }]}>{item.number}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text><Ionicons name="arrow-back" size={24} color={theme.colors.primary} /></Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('suicide.header', 'Suicide Prevention')}</Text>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyCall}
          disabled={loading}
        >
          {loading ? (
            <Text><ActivityIndicator size="small" color={theme.colors.primary} /></Text>
          ) : (
            <Text><Ionicons name="call" size={24} color={theme.colors.primary} /></Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Banner */}
        <View style={[styles.emergencyBanner, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}>
          {/* CORRECTED: Wrapped icon in a Text component */}
          <Text><MaterialCommunityIcons name="alert-circle" size={32} color={theme.colors.primary} /></Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{t('suicide.banner_title', 'Need Immediate Help?')}</Text>
            <Text style={styles.bannerSubtitle}>
              {t('suicide.banner_subtitle', 'Call 988 for 24/7 crisis support')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bannerCallButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleCall('988', 'Crisis Helpline')}
          >
            <Text><Ionicons name="call" size={20} color={theme.colors.onPrimary || '#fff'} /></Text>
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t('suicide.you_not_alone', "You're Not Alone")}</Text>
          <Text style={styles.infoText}>
            {t('suicide.info_text', "If you're having thoughts of suicide or need emotional support, these helplines are here to help you 24/7. All conversations are confidential and free of charge.")}
          </Text>
        </View>

        {/* Service Status Indicator */}
        <View style={styles.statusSection}>
          <View style={[styles.statusIndicator, { backgroundColor: serviceStatus === 'connected' ? theme.colors.success : theme.colors.danger }]}>
            <Text style={[styles.statusText, { color: theme.colors.card }]}>
              {serviceStatus === 'connected' ? t('suicide.connected', 'Connected to Emergency Services') : t('suicide.unavailable', 'Emergency Services Unavailable')}
            </Text>
          </View>
        </View>

        {/* Helpline Cards */}
        <View style={styles.helplinesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('suicide.professional_helplines', 'Professional Helplines')}</Text>
          {helplineData.map((item) => (
            <HelplineCard key={item.id} item={item} />
          ))}
        </View>

        {/* Resources Section */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>{t('suicide.additional_resources', 'Additional Resources')}</Text>
          
          <TouchableOpacity style={[styles.resourceCard, { backgroundColor: theme.colors.card }] }>
            {/* CORRECTED: Wrapped icon in a Text component */}
            <Text><MaterialCommunityIcons name="web" size={24} color={theme.colors.primary} /></Text>
            <View style={styles.resourceInfo}>
              <Text style={[styles.resourceTitle, { color: theme.colors.text }]}>{t('suicide.online_support_title', 'Online Support Groups')}</Text>
              <Text style={[styles.resourceDescription, { color: theme.colors.textSecondary }]}>
                {t('suicide.online_support_desc', 'Connect with others who understand')}
              </Text>
            </View>
            {/* CORRECTED: Wrapped icon in a Text component */}
            <Text><Ionicons name="chevron-forward" size={20} color={theme.colors.primary} /></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            {/* CORRECTED: Wrapped icon in a Text component */}
            <Text><MaterialCommunityIcons name="book-open-variant" size={24} color={theme.colors.primary} /></Text>
            <View style={styles.resourceInfo}>
              <Text style={[styles.resourceTitle, { color: theme.colors.text }]}>{t('suicide.mental_health_title', 'Mental Health Resources')}</Text>
              <Text style={[styles.resourceDescription, { color: theme.colors.textSecondary }]}>
                {t('suicide.mental_health_desc', 'Educational materials and guides')}
              </Text>
            </View>
            {/* CORRECTED: Wrapped icon in a Text component */}
            <Text><Ionicons name="chevron-forward" size={20} color={theme.colors.primary} /></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            {/* CORRECTED: Wrapped icon in a Text component */}
            <Text><MaterialCommunityIcons name="hospital-building" size={24} color={theme.colors.primary} /></Text>
            <View style={styles.resourceInfo}>
              <Text style={[styles.resourceTitle, { color: theme.colors.text }]}>{t('suicide.find_local_title', 'Find Local Services')}</Text>
              <Text style={[styles.resourceDescription, { color: theme.colors.textSecondary }]}>
                {t('suicide.find_local_desc', 'Mental health professionals near you')}
              </Text>
            </View>
            {/* CORRECTED: Wrapped icon in a Text component */}
            <Text><Ionicons name="chevron-forward" size={20} color={theme.colors.primary} /></Text>
          </TouchableOpacity>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeSection}>
          {/* CORRECTED: Wrapped icon in a Text component */}
          <Text><MaterialCommunityIcons name="information" size={24} color={theme.colors.primary} /></Text>
          <Text style={[styles.noticeText, { color: theme.colors.textSecondary }]}>
            {t('suicide.immediate_danger_notice', "If you're in immediate danger, please call emergency services (100) or go to the nearest emergency room.")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme) => StyleSheet.create({ 
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.headerBackground || theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emergencyButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  bannerText: {
    flex: 1,
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  bannerCallButton: {
    backgroundColor: theme.colors.danger,
    padding: 12,
    borderRadius: 24, // Make it circular
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  helplinesSection: {
    marginBottom: 24,
  },
  helplineCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  callButton: {
    padding: 12,
    borderRadius: 24,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: 1,
  },
  resourcesSection: {
    marginBottom: 24,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  noticeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  statusSection: {
    marginBottom: 24,
  },
  statusIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SuicidePrevention;