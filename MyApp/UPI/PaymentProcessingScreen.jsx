import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PaymentProcessingScreen = ({ navigation, route }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('PaymentSuccessScreen', route.params);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  const { theme } = useTheme();

  return ( 
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text }}>{'Paying…'}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20, marginTop: 24 },
});

export default PaymentProcessingScreen; 