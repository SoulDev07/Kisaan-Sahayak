import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';

const MetricCard = ({ icon, title, value, subtitle, trend, color }) => {
  const { theme } = useTheme();
  const trendColor = trend && trend.includes('+') ? theme.colors.success : theme.colors.danger;
  return (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.metricHeader}>
        <Icon name={icon} style={[styles.metricIcon, { color: color || theme.colors.primary }]} />
        <View style={styles.metricContent}>
          <Text style={[styles.metricTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
          <Text style={[styles.metricValue, { color: color || theme.colors.text }]}>{value}</Text>
          {subtitle && <Text style={[styles.metricSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
          {trend && <Text style={[styles.metricTrend, { color: trendColor }]}>{trend}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  metricCard: { 
    flex: 1, 
    borderRadius: 10, 
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metricHeader: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  metricIcon: { 
    fontSize: 20, 
    marginRight: 8 
  },
  metricContent: { 
    flex: 1 
  },
  metricTitle: { 
    fontSize: 12, 
    marginBottom: 2 
  },
  metricValue: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  metricSubtitle: { 
    fontSize: 10, 
    marginTop: 2 
  },
  metricTrend: { 
    fontSize: 12, 
    fontWeight: '600', 
    marginTop: 2 
  },
});

export default MetricCard; 