import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';

const AnalysisCard = ({ icon, title, value, details, color, metrics = [] }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.analysisCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
      <View style={styles.analysisCardHeader}>
        <Icon name={icon} style={{ fontSize: 24, color: color || theme.colors.primary }} />
        <Text style={[styles.analysisCardTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.analysisCardValue, { color: color || theme.colors.text }]}>{value}</Text>
      {details && <Text style={[styles.analysisCardDetails, { color: theme.colors.textSecondary }]}>{details}</Text>}
      {metrics.length > 0 && (
        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{metric.label}</Text>
              <Text style={[styles.metricText, { color: metric.color || theme.colors.primary }]}>{metric.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  analysisCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  analysisCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  analysisCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  analysisCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  analysisCardDetails: {
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 10,
  },
  metricsContainer: {
    marginTop: 10,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: '#A9A9A9',
  },
  metricText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AnalysisCard; 