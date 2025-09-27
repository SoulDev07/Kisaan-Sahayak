import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomHeader = ({ title = 'Plantix', small = false }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.headerContainer,
        small && styles.headerContainerSmall,
        { backgroundColor: theme.colors.headerBackground, shadowColor: theme.colors.text, borderBottomColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.headerTitle, small && styles.headerTitleSmall, { color: theme.colors.headerTitle }]}>{title}</Text>
      <TouchableOpacity style={styles.menuButton}>
        <Text style={[styles.menuIcon, small && styles.menuIconSmall, { color: theme.colors.headerTint }]}>⋮</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 6,
    elevation: 2,
    // shadowColor via theme
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContainerSmall: {
    paddingTop: 32,
    paddingBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerTitleSmall: {
    fontSize: 18,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  menuIconSmall: {
    fontSize: 20,
  },
});

export default CustomHeader; 