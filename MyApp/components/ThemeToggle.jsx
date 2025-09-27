import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { toggleTheme, mode, theme, isDark } = useTheme();
  const borderColor = isDark ? (theme.colors.border || '#FFFFFF') : (theme.colors.success || '#080f0cff');
  return (
    <TouchableOpacity onPress={toggleTheme} style={[styles.button, { backgroundColor: theme.colors.background, borderColor }]}> 
      <Text style={[styles.text, { color: theme.colors.text }]}>{mode === 'dark' ? '🌙' : '☀️'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginTop: 35,
    marginRight: 92,
  },
  text: { fontSize: 20 },
});
