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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const BankTransferScreen = ({ navigation, route }) => {
  const contact = route?.params?.contact;
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [name, setName] = useState(contact?.name || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const floatingElements = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  
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

    // Floating background elements animation
    floatingElements.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + index * 500,
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
      navigation.navigate('BankTransferProcessingScreen', {
        accountNumber,
        ifsc,
        name,
        amount,
        note,
      });
    });
  };

  const isFormValid = accountNumber && ifsc && name && amount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Animated Background Elements */}
      <View style={styles.backgroundContainer}>
        {floatingElements.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.floatingElement,
              {
                left: `${20 + index * 15}%`,
                top: `${10 + index * 12}%`,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -30],
                    }),
                  },
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.2, 0.8],
                    }),
                  },
                ],
                opacity: anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.1, 0.3, 0.1],
                }),
              },
            ]}
          />
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
              <Icon name="arrow-back" size={24} color="#FFF" />
            </BlurView>
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Bank Transfer</Text>
            <View style={styles.headerSubtitleContainer}>
              <View style={styles.securityDot} />
              <Text style={styles.headerSubtitle}>Secure & Instant</Text>
            </View>
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
              colors={['rgba(59, 130, 246, 0.1)', 'rgba(147, 51, 234, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactGradient}
            >
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>
                  {contact.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Icon name="verified" size={16} color="#10b981" />
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
            placeholder="Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            onFocus={() => handleInputFocus('account')}
            onBlur={() => setFocusedField(null)}
            keyboardType="numeric"
            icon="account-balance"
            focused={focusedField === 'account'}
            maxLength={18}
          />

          <InputField
            placeholder="IFSC Code"
            value={ifsc}
            onChangeText={setIfsc}
            onFocus={() => handleInputFocus('ifsc')}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="characters"
            icon="location-on"
            focused={focusedField === 'ifsc'}
            maxLength={11}
          />

          <InputField
            placeholder="Recipient Name"
            value={name}
            onChangeText={setName}
            onFocus={() => handleInputFocus('name')}
            onBlur={() => setFocusedField(null)}
            icon="person"
            focused={focusedField === 'name'}
          />

          <InputField
            placeholder="Amount"
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
                  ? ['#3b82f6', '#1d4ed8', '#1e40af']
                  : ['#374151', '#4b5563', '#6b7280']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proceedGradient}
            >
              <Text style={styles.proceedBtnText}>
                {isFormValid ? 'Proceed to Transfer' : 'Fill Required Fields'}
              </Text>
              {isFormValid && (
                <Icon name="arrow-forward" size={20} color="#FFF" style={styles.proceedIcon} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Security Footer */}
        <Animated.View style={[styles.securityFooter, { opacity: fadeAnim }]}>
          <View style={styles.securityRow}>
            <Icon name="security" size={16} color="#10b981" />
            <Text style={styles.securityText}>256-bit SSL encrypted</Text>
          </View>
          <View style={styles.securityRow}>
            <Icon name="verified-user" size={16} color="#10b981" />
            <Text style={styles.securityText}>RBI approved gateway</Text>
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
  autoCapitalize,
  icon,
  focused,
  maxLength,
  isAmount,
  multiline,
}) => {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

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
            outputRange: ['rgba(55, 65, 81, 0.3)', '#3b82f6'],
          }),
          backgroundColor: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(24, 24, 27, 0.8)', 'rgba(59, 130, 246, 0.05)'],
          }),
          transform: [
            {
              translateX: shakeAnim.interpolate({
                inputRange: [0, 0.25, 0.75, 1],
                outputRange: [0, -5, 5, 0],
              }),
            },
          ],
        },
      ]}
    >
      <BlurView intensity={focused ? 30 : 10} style={styles.inputBlur}>
        <View style={styles.inputContent}>
          <Icon
            name={icon}
            size={20}
            color={focused ? '#3b82f6' : '#6b7280'}
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
            autoCapitalize={autoCapitalize}
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
  floatingElement: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
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
  securityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  headerSubtitle: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
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
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
  verifiedBadge: {
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
  buttonContainer: {
    marginBottom: 24,
  },
  proceedBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#3b82f6',
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
  },
  proceedIcon: {
    marginLeft: 8,
  },
  securityFooter: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.3)',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityText: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default BankTransferScreen;