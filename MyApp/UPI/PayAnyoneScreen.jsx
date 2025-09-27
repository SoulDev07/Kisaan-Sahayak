import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const PayAnyoneScreen = ({ navigation }) => {
  const [payAnyoneInput, setPayAnyoneInput] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { theme } = useTheme();
  
  // Animation refs
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  const payAnyoneRecents = [
    { name: 'Anilkumar Saroj', phone: '+91 99308 04309', color: '#6366f1', initial: 'A', status: 'online' },
  ];

  const payAnyoneAll = [
    { 
      type: 'self', 
      name: 'Self transfer', 
      desc: 'Transfer money between your accounts', 
      color: '#6366f1', 
      icon: 'person',
    },
    { 
      type: 'group', 
      name: 'New group', 
      desc: 'Start group chat or split an expense', 
      color: '#10b981', 
      icon: 'group-add',
    },
    { 
      name: '5B30 viraj verma', 
      phone: '+91 70214 51277', 
      color: '#6b7280', 
      initial: '5', 
      status: 'away',
    },
    { 
      name: 'Aadi Tendulkar', 
      phone: '+91 99205 13049', 
      color: '#8b5cf6', 
      initial: 'A', 
      status: 'online',
    },
  ];

  useEffect(() => {
    // Simple entrance animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Vibration.vibrate(10);
    Animated.timing(searchAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.timing(searchAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleContactPress = (contact) => {
    Vibration.vibrate(15);
    navigation.navigate('ContactUPIDetail', { contact });
  };

  const renderContactItem = (item, index, isRecent = false) => {
    const itemAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        key={index}
        style={[
          {
            opacity: itemAnim,
            transform: [
              {
                translateY: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.contactRowContainer}
          onPress={() => handleContactPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.contactRow}>
            <View style={styles.avatarContainer}>
              {item.type ? (
                <View style={[styles.avatar, { backgroundColor: item.color }]}>
                  <Icon name={item.icon} size={20} color="#FFF" />
                </View>
              ) : (
                <View style={[styles.avatar, { backgroundColor: item.color }]}>
                  <Text style={styles.avatarText}>{item.initial}</Text>
                </View>
              )}
              
              {/* Status indicator */}
              {item.status && (
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: item.status === 'online' ? '#10b981' : '#f59e0b' }
                ]} />
              )}
            </View>
            
            <View style={styles.contactDetails}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactSubtext}>
                {item.desc || item.phone}
              </Text>
            </View>
            
            {/* Arrow icon */}
            <View style={styles.arrowContainer}>
              <Icon name="chevron-right" size={20} color="#6b7280" />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme?.colors?.background }]}>
      <StatusBar barStyle={theme?.colors?.statusBarStyle || 'light-content'} backgroundColor={theme?.colors?.background} translucent={false} />
      
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <IonIcon name="arrow-back" size={24} color={theme?.colors?.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme?.colors?.text } ]}>Pay Anyone</Text>
          <View style={styles.headerSubtitleContainer}>
            <View style={styles.liveDot} />
            <Text style={[styles.headerSubtitle, { color: theme?.colors?.primary } ]}>UPI Enabled</Text>
          </View>
        </View>
      </Animated.View>

      {/* Content */}
  <View style={[styles.content, { backgroundColor: theme?.colors?.background }]}>
        {/* Subtitle */}
        <Animated.View
          style={[
            styles.subtitleContainer,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={[styles.subtitle, { color: theme?.colors?.textSecondary } ]}>
            Pay using UPI ID, mobile number or scan QR code
          </Text>
        </Animated.View>

        {/* Search Input */}
        <Animated.View
            style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              borderColor: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [theme?.colors?.border || '#e5e7eb', theme?.colors?.primary || '#6366f1'],
              }),
              backgroundColor: isSearchFocused ? theme?.colors?.card : theme?.colors?.surface,
            },
          ]}
        >
          <View style={styles.searchInputRow}>
            <Icon 
              name="search" 
              size={20} 
              color={isSearchFocused ? (theme?.colors?.primary || '#6366f1') : (theme?.colors?.textSecondary || '#9ca3af')} 
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter UPI ID, mobile number or name"
              placeholderTextColor={theme?.colors?.textSecondary}
              value={payAnyoneInput}
              onChangeText={setPayAnyoneInput}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            
            {/* QR Scanner button */}
            <TouchableOpacity style={styles.qrButton} activeOpacity={0.7}>
              <Icon name="qr-code-scanner" size={20} color={theme?.colors?.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActionsContainer,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: theme?.colors?.card, borderColor: theme?.colors?.border }]}
            onPress={() => navigation.navigate('BankTransferScreen')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionContent}>
              <Icon name="account-balance" size={20} color={theme?.colors?.primary} />
              <Text style={[styles.quickActionText, { color: theme?.colors?.text }]}>Bank Transfer</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: theme?.colors?.card, borderColor: theme?.colors?.border }]}
            onPress={() => navigation.navigate('MobileRechargeScreen')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionContent}>
              <Icon name="phone-android" size={20} color={theme?.colors?.success} />
              <Text style={[styles.quickActionText, { color: theme?.colors?.text }]}>Recharge</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Contact Lists */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Recents Section */}
          {payAnyoneRecents.length > 0 && (
            <Animated.View
              style={[
                styles.sectionContainer,
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme?.colors?.text }]}>Recent</Text>
                <Text style={styles.sectionCount}>{payAnyoneRecents.length}</Text>
              </View>
              {payAnyoneRecents.map((item, index) => renderContactItem(item, index, true))}
            </Animated.View>
          )}

          {/* All People Section */}
          <Animated.View
            style={[
              styles.sectionContainer,
              { opacity: fadeAnim },
            ]}
          >
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme?.colors?.text }]}>All contacts</Text>
              <Text style={styles.sectionCount}>{payAnyoneAll.length}</Text>
            </View>
            {payAnyoneAll.map((item, index) => renderContactItem(item, index))}
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  headerSubtitle: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
  },
  subtitleContainer: {
    marginBottom: 20,
    paddingTop: 8,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  searchContainer: {
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 20,
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
  },
  qrButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionCount: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  contactRowContainer: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactSubtext: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '400',
  },
  arrowContainer: {
    padding: 4,
  },
});

export default PayAnyoneScreen;