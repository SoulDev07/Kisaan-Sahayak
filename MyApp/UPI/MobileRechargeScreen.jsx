import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  Vibration,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const operators = [
  { 
    label: 'Jio', 
    value: 'jio',
    color: '#0066FF',
    gradient: ['#0066FF', '#0099FF']
  },
  { 
    label: 'Airtel', 
    value: 'airtel',
    color: '#FF0000',
    gradient: ['#FF0000', '#FF4444']
  },
  { 
    label: 'Vi', 
    value: 'vi',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#E91E63']
  },
  { 
    label: 'BSNL', 
    value: 'bsnl',
    color: '#FF9800',
    gradient: ['#FF9800', '#FFC107']
  },
];

const quickAmounts = [99, 199, 299, 499, 699, 999];

const MobileRechargeScreen = ({ navigation, route }) => {
  const contact = route?.params?.contact;
  const [mobile, setMobile] = useState(contact?.phone || '');
  const [operator, setOperator] = useState(operators[0].value);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [showOperatorPicker, setShowOperatorPicker] = useState(false);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const phoneWaves = useRef([...Array(3)].map(() => new Animated.Value(0))).current;
  const floatingSignals = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
  
  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Phone signal waves animation
    phoneWaves.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1500 + index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1500 + index * 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Floating signal indicators
    floatingSignals.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + index * 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000 + index * 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handleInputFocus = (field) => {
    setFocusedField(field);
    Vibration.vibrate(10);
  };

  const handleProceedPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Vibration.vibrate(50);
      navigation.navigate('MobileRechargeProcessingScreen', {
        mobile,
        operator,
        amount,
        note,
      });
    });
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
    Vibration.vibrate(10);
  };

  const formatMobileNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,5})(\d{0,5})$/);
    if (match) {
      return !match[2] ? match[1] : `${match[1]} ${match[2]}`;
    }
    return text;
  };

  const selectedOperator = operators.find(op => op.value === operator);
  const isFormValid = mobile.replace(/\s/g, '').length === 10 && operator && amount;
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme?.colors?.background }]}>
      <StatusBar barStyle={theme?.colors?.statusBarStyle || 'light-content'} backgroundColor={'transparent'} translucent />
      
      {/* Animated Background Elements */}
      <View style={styles.backgroundContainer}>
        {/* Phone Signal Waves */}
        {phoneWaves.map((anim, index) => (
          <Animated.View
            key={`wave-${index}`}
            style={[
              styles.signalWave,
              {
                right: 30 + index * 20,
                top: 100,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 2],
                    }),
                  },
                ],
                opacity: anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 0.3, 0],
                }),
              },
            ]}
          />
        ))}
        
        {/* Floating Signal Icons */}
        {floatingSignals.map((anim, index) => (
          <Animated.View
            key={`signal-${index}`}
            style={[
              styles.floatingSignal,
              {
                left: `${10 + index * 25}%`,
                top: `${20 + index * 15}%`,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -40],
                    }),
                  },
                  {
                    rotate: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '15deg'],
                    }),
                  },
                ],
                opacity: anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.1, 0.4, 0.1],
                }),
              },
            ]}
          >
            <Icon name="signal-cellular-4-bar" size={24} color="#3b82f6" />
          </Animated.View>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
              <BlurView intensity={20} style={styles.blurButton}>
                <Icon name="arrow-back" size={24} color={theme?.colors?.text} />
              </BlurView>
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Mobile Recharge</Text>
            <View style={styles.headerSubtitleContainer}>
              <Icon name="flash-on" size={16} color="#f59e0b" />
              <Text style={styles.headerSubtitle}>Instant Recharge</Text>
            </View>
          </View>

          <View style={styles.signalStrength}>
            <Icon name="signal-cellular-4-bar" size={20} color="#10b981" />
          </View>
        </Animated.View>

        {/* Contact Info Card */}
        {contact && (
          <Animated.View
            style={[
              styles.contactCard,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(34, 197, 94, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactGradient}
            >
              <View style={styles.contactAvatar}>
                <Icon name="person" size={24} color="#FFF" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <View style={styles.contactStatus}>
                <Icon name="smartphone" size={20} color="#10b981" />
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Input Fields */}
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <InputField
            placeholder="Mobile Number"
            value={formatMobileNumber(mobile)}
            onChangeText={(text) => setMobile(text.replace(/\s/g, '').replace(/\D/g, ''))}
            onFocus={() => handleInputFocus('mobile')}
            onBlur={() => setFocusedField(null)}
            keyboardType="numeric"
            icon="phone"
            focused={focusedField === 'mobile'}
            maxLength={12}
          />

          {/* Operator Selector */}
          <Animated.View
            style={[
              styles.operatorContainer,
              {
                borderColor: showOperatorPicker ? '#3b82f6' : 'rgba(55, 65, 81, 0.3)',
                backgroundColor: showOperatorPicker ? 'rgba(59, 130, 246, 0.05)' : 'rgba(24, 24, 27, 0.8)',
              },
            ]}
          >
            <BlurView intensity={showOperatorPicker ? 30 : 10} style={styles.operatorBlur}>
              <View style={styles.operatorContent}>
                <Icon name="network-cell" size={20} color={selectedOperator.color} style={styles.operatorIcon} />
                <View style={styles.operatorInfo}>
                  <Text style={styles.operatorLabel}>Operator</Text>
                  <TouchableOpacity
                    onPress={() => setShowOperatorPicker(!showOperatorPicker)}
                    style={styles.operatorSelector}
                  >
                    <View style={styles.operatorChip}>
                      <LinearGradient
                        colors={selectedOperator.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.operatorChipGradient}
                      >
                        <Text style={styles.operatorText}>{selectedOperator.label}</Text>
                      </LinearGradient>
                    </View>
                    <Icon 
                      name={showOperatorPicker ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={24} 
                      color="#9ca3af" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* Operator Picker */}
          {showOperatorPicker && (
            <Animated.View style={styles.operatorPicker}>
              {operators.map((op) => (
                <TouchableOpacity
                  key={op.value}
                  style={[styles.operatorOption, operator === op.value && styles.operatorOptionSelected]}
                  onPress={() => {
                    setOperator(op.value);
                    setShowOperatorPicker(false);
                    Vibration.vibrate(10);
                  }}
                >
                  <LinearGradient
                    colors={operator === op.value ? op.gradient : ['rgba(24, 24, 27, 0.8)', 'rgba(24, 24, 27, 0.8)']}
                    style={styles.operatorOptionGradient}
                  >
                    <View style={[styles.operatorDot, { backgroundColor: op.color }]} />
                    <Text style={[styles.operatorOptionText, operator === op.value && styles.operatorOptionTextSelected]}>
                      {op.label}
                    </Text>
                    {operator === op.value && <Icon name="check" size={20} color="#FFF" />}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}

          {/* Quick Amount Selection */}
          <View style={styles.quickAmountContainer}>
            <Text style={styles.quickAmountTitle}>Quick Recharge</Text>
            <View style={styles.quickAmountGrid}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountBtn,
                    amount === quickAmount.toString() && styles.quickAmountBtnSelected
                  ]}
                  onPress={() => handleQuickAmount(quickAmount)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      amount === quickAmount.toString() 
                        ? ['#3b82f6', '#1d4ed8'] 
                        : ['rgba(24, 24, 27, 0.8)', 'rgba(55, 65, 81, 0.8)']
                    }
                    style={styles.quickAmountGradient}
                  >
                    <Text style={[
                      styles.quickAmountText,
                      amount === quickAmount.toString() && styles.quickAmountTextSelected
                    ]}>
                      ₹{quickAmount}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <InputField
            placeholder="Custom Amount"
            value={amount}
            onChangeText={setAmount}
            onFocus={() => handleInputFocus('amount')}
            onBlur={() => setFocusedField(null)}
            keyboardType="numeric"
            icon="currency-rupee"
            focused={focusedField === 'amount'}
            isAmount
          />

          <InputField
            placeholder="Add note (optional)"
            value={note}
            onChangeText={setNote}
            onFocus={() => handleInputFocus('note')}
            onBlur={() => setFocusedField(null)}
            icon="notes"
            focused={focusedField === 'note'}
            multiline
          />
        </Animated.View>

        {/* Proceed Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [{ scale: buttonScale }],
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.proceedBtn, !isFormValid && styles.proceedBtnDisabled]}
            onPress={handleProceedPress}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isFormValid
                  ? ['#10b981', '#059669', '#047857']
                  : ['#374151', '#4b5563', '#6b7280']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proceedGradient}
            >
              <Icon name="flash-on" size={20} color="#FFF" style={styles.proceedIcon} />
              <Text style={styles.proceedBtnText}>
                {isFormValid ? 'Recharge Now' : 'Complete Details'}
              </Text>
              {isFormValid && (
                <Icon name="arrow-forward" size={20} color="#FFF" style={styles.proceedIcon} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Benefits Footer */}
        <Animated.View style={[styles.benefitsFooter, { opacity: fadeAnim }]}>
          <View style={styles.benefitRow}>
            <Icon name="flash-on" size={16} color="#f59e0b" />
            <Text style={styles.benefitText}>Instant recharge within 5 seconds</Text>
          </View>
          <View style={styles.benefitRow}>
            <Icon name="verified-user" size={16} color="#10b981" />
            <Text style={styles.benefitText}>100% secure transactions</Text>
          </View>
          <View style={styles.benefitRow}>
            <Icon name="support-agent" size={16} color="#3b82f6" />
            <Text style={styles.benefitText}>24/7 customer support</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Custom Input Field Component
const InputField = ({
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  keyboardType,
  icon,
  focused,
  maxLength,
  isAmount,
  multiline,
}) => {
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const formatAmount = (text) => {
    if (!isAmount) return text;
    const numericValue = text.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          borderColor: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(55, 65, 81, 0.3)', '#10b981'],
          }),
          backgroundColor: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(24, 24, 27, 0.8)', 'rgba(16, 185, 129, 0.05)'],
          }),
        },
      ]}
    >
      <BlurView intensity={focused ? 30 : 10} style={styles.inputBlur}>
        <View style={styles.inputContent}>
          <Icon
            name={icon}
            size={20}
            color={focused ? '#10b981' : '#6b7280'}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, multiline && styles.inputMultiline]}
            placeholder={placeholder}
            placeholderTextColor="#6b7280"
            value={isAmount ? formatAmount(value) : value}
            onChangeText={isAmount ? (text) => onChangeText(text.replace(/,/g, '')) : onChangeText}
            onFocus={onFocus}
            onBlur={onBlur}
            keyboardType={keyboardType}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            textAlignVertical={multiline ? 'top' : 'center'}
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
              <Icon name="clear" size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  signalWave: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  floatingSignal: {
    position: 'absolute',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 10,
  },
  headerIconBtn: {
    marginRight: 16,
  },
  blurButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  headerSubtitle: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  signalStrength: {
    padding: 8,
  },
  contactCard: {
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactPhone: {
    color: '#9ca3af',
    fontSize: 14,
  },
  contactStatus: {
    padding: 8,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  inputBlur: {
    borderRadius: 14,
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  clearButton: {
    padding: 4,
  },
  operatorContainer: {
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  operatorBlur: {
    borderRadius: 14,
  },
  operatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  operatorIcon: {
    marginRight: 12,
  },
  operatorInfo: {
    flex: 1,
  },
  operatorLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  operatorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  operatorChip: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  operatorChipGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  operatorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  operatorPicker: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  operatorOption: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  operatorOptionSelected: {
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  operatorOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  operatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  operatorOptionText: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
  operatorOptionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  quickAmountContainer: {
    marginBottom: 24,
  },
  quickAmountTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountBtn: {
    width: (width - 72) / 3,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickAmountBtnSelected: {
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  quickAmountGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickAmountText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  quickAmountTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  proceedBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  proceedBtnDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  proceedGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  proceedBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginHorizontal: 8,
  },
  proceedIcon: {
    marginHorizontal: 4,
  },
  benefitsFooter: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.3)',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default MobileRechargeScreen;