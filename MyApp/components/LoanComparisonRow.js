import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const LoanComparisonRow = ({ label, kcc, gold, cooperative }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.loanRow}>
      <Text style={[styles.loanLabel, { color: theme.colors.text }]}>{label}</Text>
      <Text style={[styles.loanValue, { color: theme.colors.primary, fontWeight: '600' }]}>{kcc}</Text>
      <Text style={[styles.loanValue, { color: theme.colors.textSecondary }]}>{gold}</Text>
      <Text style={[styles.loanValue, { color: theme.colors.primary, fontWeight: '600' }]}>{cooperative}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loanRow: { 
    flexDirection: 'row', 
    paddingVertical: 8 
  },
  loanLabel: { 
    flex: 1, 
    fontSize: 14, 
  },
  loanValue: { 
    flex: 1, 
    fontSize: 14, 
    textAlign: 'center' 
  },
});

export default LoanComparisonRow; 