import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Icon = ({ name, style, color }) => {
	const { theme } = useTheme();
	return <Text style={[{ color: color || theme.colors.text }, style]}>{name}</Text>;
};

export default Icon; 