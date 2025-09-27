import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';

const ContactUPIDetailScreen = ({ navigation, route }) => {
  const defaultContact = {
    name: 'VinnayAk',
    phone: '+91 99306 79651',
    bankingName: 'VINAYAK PREM BHATIA',
    joined: 'September 2020',
    initial: 'V',
    color: '#059669',
    payment: {
      type: 'Payment to you',
      amount: '₹1',
      date: '6 May 2023',
      time: '2:24 pm',
      status: 'Paid',
    },
  };
  // Example for more contacts:
  const contacts = [
    { name: 'Kamlesh Yadaw', phone: '+91 98765 43210', bankingName: 'KAMLESH SO RAMNIWAS', joined: 'Jan 2021', initial: 'K', color: '#2563eb' },
    { name: 'Vivek Bhatia', phone: '+91 91234 56789', bankingName: 'VIVEK PREM BHATIA', joined: 'Feb 2022', initial: 'VB', color: '#f59e42' },
  ];
  const contact = route?.params?.contact ? { ...defaultContact, ...route.params.contact, payment: { ...defaultContact.payment, ...route.params.contact.payment } } : defaultContact;

  const handlePay = () => {
    navigation.navigate('PaymentAmountScreen', { recipient: contact, type: 'pay' });
  };

  const handleRequest = () => {
    navigation.navigate('PaymentAmountScreen', { recipient: contact, type: 'request' });
  };

  const handleMessage = () => {
    Alert.alert('Message', `Send message to ${contact.name}?`);
  };

  const handleCall = () => {
    Alert.alert('Call', `Call ${contact.name} at ${contact.phone}?`);
  };

  const handleMore = () => {
    Alert.alert('More Options', 'Additional options menu');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.headerIconBtn}>
          <IonIcon name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <View style={[styles.headerAvatar, {backgroundColor: contact.color}]}> 
          <Text style={styles.headerAvatarText}>{contact.initial}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{contact.name}</Text>
          <Text style={styles.headerPhone}>{contact.phone}</Text>
        </View>
        <TouchableOpacity style={styles.headerIconBtn} onPress={handleCall}>
          <Icon name="call" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIconBtn} onPress={handleMore}>
          <Icon name="more-vert" size={22} color="#FFF" />
        </TouchableOpacity>
        {/* Bank Transfer icon */}
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('BankTransferScreen', { contact })}>
          <Icon name="account-balance" size={22} color="#FFF" />
        </TouchableOpacity>
        {/* Mobile Recharge icon */}
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('MobileRechargeScreen', { contact })}>
          <Icon name="phone-android" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Avatar and Info */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, {backgroundColor: contact.color}]}> 
            <Text style={styles.avatarInitial}>{contact.initial}</Text>
          </View>
          <Text style={styles.contactName}>{contact.name}</Text>
          <View style={styles.verifiedRow}>
            <Icon name="verified" size={18} color="#22c55e" style={styles.verifiedIcon} />
            <Text style={styles.bankingName}>Banking name: {contact.bankingName}</Text>
          </View>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
          <Text style={styles.joinedText}>Joined {contact.joined}</Text>
        </View>

        {/* Payment Card */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentDate}>{contact.payment.date}, {contact.payment.time}</Text>
          <View style={styles.paymentCard}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <View style={{flex: 1}}>
                <Text style={styles.paymentType}>{contact.payment.type}</Text>
                <Text style={styles.paymentAmount}>{contact.payment.amount}</Text>
                <View style={styles.paymentStatusRow}>
                  <Icon name="check-circle" size={18} color="#22c55e" style={styles.statusIcon} />
                  <Text style={styles.paymentStatus}>Paid • {contact.payment.date}</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={28} color="#6b7280" />
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomSection}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handlePay}>
            <Text style={styles.actionBtnText}>Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleRequest}>
            <Text style={styles.actionBtnText}>Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnMsg} onPress={handleMessage}>
            <Text style={styles.actionBtnMsgText}>Message...</Text>
            <IonIcon name="send" size={16} color="#60a5fa" style={styles.sendIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 48,
  },
  
  // Status Bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    marginRight: 8,
  },
  statusIcon: {
    width: 16,
    height: 12,
    backgroundColor: '#666',
    borderRadius: 2,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconText: {
    color: '#FFF',
    fontSize: 8,
  },
  nfcIcon: {
    backgroundColor: '#f97316',
  },
  nfcText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  signalBars: {
    flexDirection: 'row',
    marginHorizontal: 4,
  },
  bar: {
    width: 3,
    height: 12,
    marginRight: 1,
    borderRadius: 1,
  },
  barActive: {
    backgroundColor: '#FFF',
  },
  barInactive: {
    backgroundColor: '#666',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  battery: {
    width: 24,
    height: 12,
    backgroundColor: '#FFF',
    borderRadius: 2,
    marginRight: 4,
  },
  batteryText: {
    color: '#FFF',
    fontSize: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#18181b',
  },
  headerIconBtn: {
    padding: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerPhone: {
    color: '#aaa',
    fontSize: 13,
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  contactName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  verifiedIcon: {
    marginRight: 8,
  },
  bankingName: {
    color: '#d1fae5',
    fontSize: 13,
  },
  contactPhone: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  joinedText: {
    color: '#aaa',
    fontSize: 13,
  },

  // Payment Section
  paymentSection: {
    marginBottom: 24,
  },
  paymentDate: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  paymentCard: {
    backgroundColor: '#696969',
    borderRadius: 42,
    width: '65%',
    alignSelf: 'flex-start',
    paddingVertical: 18,
    paddingHorizontal: 26,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentType: {
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 8,
  },
  paymentAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paymentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
     marginLeft: 10,
  },
  paymentStatus: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 20,
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionBtn: {
    backgroundColor: '#dbeafe',
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 12,
    minWidth: 120,
    marginBottom:20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  actionBtnText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtnMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#60a5fa',
    marginBottom:20,
  },
  actionBtnMsgText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  sendIcon: {
    marginLeft: 8,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  navLine: {
    width: 24,
    height: 4,
    backgroundColor: '#FFF',
    borderRadius: 2,
    marginHorizontal: 16,
  },
  navCircle: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  navTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFF',
    marginHorizontal: 16,
  },
});

export default ContactUPIDetailScreen;