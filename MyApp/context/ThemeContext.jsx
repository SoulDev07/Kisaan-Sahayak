import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { themes } from '../theme';

const STORAGE_KEY = 'appThemePreference'; // 'light' | 'dark' | 'system'

const ThemeContext = createContext({
	theme: themes.dark,
	isDark: true,
	mode: 'dark', // 'light' | 'dark' | 'system'
	setMode: (m) => {},
	toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
	const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme?.() || 'light');
	const [mode, setMode] = useState('system');

	// Load saved preference
	useEffect(() => {
		(async () => {
			try {
				const saved = await AsyncStorage.getItem(STORAGE_KEY);
				if (saved === 'light' || saved === 'dark' || saved === 'system') {
					setMode(saved);
				}
			} catch {}
		})();
	}, []);

	// Persist mode
	useEffect(() => {
		AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
	}, [mode]);

	const isDark = useMemo(() => {
			if (mode === 'system') return systemScheme === 'dark';
		return mode === 'dark';
		}, [mode, systemScheme]);

	const theme = useMemo(() => (isDark ? themes.dark : themes.light), [isDark]);

	const toggleTheme = useCallback(() => {
		setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
	}, []);

	const value = useMemo(
		() => ({ theme, isDark, mode, setMode, toggleTheme }),
		[theme, isDark, mode, setMode, toggleTheme]
	);

		// Listen to system changes when in system mode
		useEffect(() => {
			const sub = Appearance.addChangeListener?.(({ colorScheme }) => {
				setSystemScheme(colorScheme || 'light');
			});
			return () => {
				try { sub && sub.remove && sub.remove(); } catch {}
			};
		}, []);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
