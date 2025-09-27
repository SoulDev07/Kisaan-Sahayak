import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ProgressBar = ({ progress, color }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surface }] }>
      <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color || theme.colors.primary }]} />
    </View>
  );
};

const LoadingState = ({ text, progress = 0 }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{text}</Text>
        {progress > 0 && <ProgressBar progress={progress} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#A9A9A9',
    marginTop: 15,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: 200,
    height: 4,
    backgroundColor: '#2C2C2C',
    borderRadius: 2,
    marginTop: 15,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default LoadingState; 