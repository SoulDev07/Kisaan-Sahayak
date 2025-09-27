import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ReasonCard = ({ title, children, confidence = null, impact = null }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.reasonCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
      <View style={styles.reasonHeader}>
        <Text style={[styles.reasonCardTitle, { color: theme.colors.primary }]}>{title}</Text>
        {confidence && (
          <View style={[styles.confidenceBadge, { backgroundColor: theme.colors.primary }] }>
            <Text style={[styles.confidenceText, { color: theme.colors.card }]}>{confidence}% confidence</Text>
          </View>
        )}
      </View>
      <Text style={[styles.reasonCardContent, { color: theme.colors.text }]}>{children}</Text>
      {impact && (
        <View style={[styles.impactIndicator, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.impactText, { color: theme.colors.textSecondary }]}>Impact: {impact}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  reasonCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  reasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reasonCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#58D68D',
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: '#58D68D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  reasonCardContent: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    marginBottom: 10,
  },
  impactIndicator: {
    backgroundColor: '#1A1A1A',
    padding: 8,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 12,
    color: '#A9A9A9',
    fontWeight: '600',
  },
});

export default ReasonCard; 