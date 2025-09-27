import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const DetailCard = ({ title, children, color }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.detailCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.detailHeader}>
        <View style={[styles.detailIndicator, { backgroundColor: color || theme.colors.primary }]} />
        <Text style={[styles.detailTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <View style={styles.detailContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: StyleSheet.hairlineWidth,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailContent: {
    paddingLeft: 14,
  },
});

export default DetailCard; 