import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const EnterPinScreen = ({ navigation, route }) => {
  const { recipient, amount, note, bank } = route.params || {};
  const [pin, setPin] = useState(['', '', '', '']);
  const handlePinChange = (val, idx) => {
    if (/^\d?$/.test(val)) {
      const newPin = [...pin];
      newPin[idx] = val;
      setPin(newPin);
      if (val && idx < 3) {
        pinInputs[idx + 1]?.focus();
      }
      if (newPin.join('').length === 4) {
        setTimeout(() => navigation.navigate('PaymentProcessingScreen', { recipient, amount, note, bank }), 500);
      }
    }
  };
  let pinInputs = [];
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.bankName}>{bank?.name} XXXX{bank?.last4}</Text>
        <Text style={styles.toText}>To: <Text style={styles.recipient}>{recipient?.name}</Text></Text>
        <Text style={styles.amount}>₹ {amount}</Text>
      </View>
      <Text style={styles.enterPin}>ENTER 4-DIGIT UPI PIN</Text>
      <View style={styles.pinRow}>
        {[0,1,2,3].map((i) => (
          <TextInput
            key={i}
            ref={ref => pinInputs[i] = ref}
            style={styles.pinInput}
            value={pin[i]}
            onChangeText={val => handlePinChange(val, i)}
            keyboardType="numeric"
            maxLength={1}
            secureTextEntry
          />
        ))}
      </View>
      <Text style={styles.warning}>You are transferring money from your account to {recipient?.name?.toUpperCase()}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 48 },
  header: { alignItems: 'center', marginBottom: 32 },
  bankName: { color: '#222', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  toText: { color: '#222', fontSize: 15 },
  recipient: { fontWeight: 'bold' },
  amount: { color: '#222', fontSize: 28, fontWeight: 'bold', marginVertical: 12 },
  enterPin: { color: '#222', fontSize: 16, marginBottom: 16 },
  pinRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  pinInput: { width: 48, height: 48, borderWidth: 1, borderColor: '#aaa', borderRadius: 8, fontSize: 24, textAlign: 'center', marginHorizontal: 8, backgroundColor: '#f3f4f6' },
  warning: { color: '#b45309', backgroundColor: '#fef3c7', padding: 10, borderRadius: 8, fontSize: 14, textAlign: 'center', marginTop: 16 },
});

export default EnterPinScreen; 