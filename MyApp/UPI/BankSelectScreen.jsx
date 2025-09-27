import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const BankSelectScreen = ({ navigation, route }) => {
  const { recipient, amount, note } = route.params || {};
  const bank = {
    name: 'HDFC Bank',
    last4: '2315',
    balance: 'Check now',
    logo: null, // placeholder
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sheet}>
        <Text style={styles.chooseText}>Choose account to pay with</Text>
        <View style={styles.bankRow}>
          <View style={styles.bankLogo} />
          <View style={{flex:1}}>
            <Text style={styles.bankName}>{bank.name} ••••{bank.last4}</Text>
            <Text style={styles.bankBalance}>Balance: <Text style={styles.checkNow}>{bank.balance}</Text></Text>
          </View>
        </View>
        <TouchableOpacity style={styles.payBtn} onPress={() => navigation.navigate('EnterPinScreen', { recipient, amount, note, bank })}>
          <Text style={styles.payBtnText}>Pay ₹{amount}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#18181b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  chooseText: { color: '#FFF', fontSize: 16, marginBottom: 16 },
  bankRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 16, padding: 16, marginBottom: 24 },
  bankLogo: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#e5e7eb', marginRight: 16 },
  bankName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  bankBalance: { color: '#aaa', fontSize: 13 },
  checkNow: { color: '#60a5fa' },
  payBtn: { backgroundColor: '#dbeafe', borderRadius: 22, paddingVertical: 14, alignItems: 'center' },
  payBtnText: { color: '#2563eb', fontSize: 18, fontWeight: '700' },
});

export default BankSelectScreen; 