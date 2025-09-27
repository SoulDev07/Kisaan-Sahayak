import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, TextInput, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';

const PaymentAmountScreen = ({ navigation, route }) => {
  const recipient = route?.params?.recipient || {
    name: 'Kamlesh Yadaw',
    phone: '+91 98765 43210',
    bankingName: 'KAMLESH SO RAMNIWAS',
    initial: 'K',
    color: '#2563eb',
    avatarUri: null, // for now
  };
  // Example for more unique contacts:
  // { name: 'Vivek Bhatia', phone: '+91 91234 56789', bankingName: 'VIVEK PREM BHATIA', initial: 'VB', color: '#f59e42' }
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme?.colors?.background }]}>
      <StatusBar barStyle={theme?.colors?.statusBarStyle || 'light-content'} backgroundColor={theme?.colors?.background} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.headerIconBtn}>
          <IonIcon name="arrow-back" size={26} color={theme?.colors?.text} />
        </TouchableOpacity>
        <View style={[styles.headerAvatar, {backgroundColor: recipient.color}]}> 
          <Text style={[styles.headerAvatarText, { color: theme?.colors?.onSurface }]}>{recipient.initial}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: theme?.colors?.text }]}>Paying {recipient.name}</Text>
          <Text style={[styles.headerBankingName, { color: theme?.colors?.success } ]}>Banking name: {recipient.bankingName}</Text>
          <Text style={[styles.headerPhone, { color: theme?.colors?.textSecondary }]}>{recipient.phone}</Text>
        </View>
      </View>
      {/* Amount Input */}
      <View style={styles.amountSection}>
        <Text style={styles.currency}>₹</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          maxLength={8}
        />
      </View>
      {/* Add Note */}
      <TouchableOpacity style={styles.addNoteBtn} onPress={() => {}}>
        <Text style={styles.addNoteText}>Add note</Text>
      </TouchableOpacity>
      {/* Send Button */}
      <TouchableOpacity
        style={styles.sendBtn}
        onPress={() => navigation.navigate('BankSelectScreen', { recipient, amount, note })}
      >
        <IonIcon name="arrow-forward" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 48 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#18181b' },
  headerIconBtn: { padding: 8 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginHorizontal: 12 },
  headerAvatarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerInfo: { flex: 1 },
  headerName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerBankingName: { color: '#d1fae5', fontSize: 13 },
  headerPhone: { color: '#aaa', fontSize: 13 },
  amountSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 48, marginBottom: 24 },
  currency: { color: '#FFF', fontSize: 36, marginRight: 8 },
  amountInput: { color: '#FFF', fontSize: 48, fontWeight: 'bold', textAlign: 'center', minWidth: 80 },
  addNoteBtn: { alignSelf: 'center', backgroundColor: '#222', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 8, marginBottom: 32 },
  addNoteText: { color: '#FFF', fontSize: 16 },
  sendBtn: { position: 'absolute', bottom: 32, right: 32, backgroundColor: '#2563eb', borderRadius: 32, width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
});

export default PaymentAmountScreen; 