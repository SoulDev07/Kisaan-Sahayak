import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import ModalDropdown from 'react-native-modal-dropdown';
import { useTranslation } from 'react-i18next';
import { setLanguage, getStoredLanguage } from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'हिन्दी (Hindi)', value: 'hi' },
  { label: 'বাংলা (Bengali)', value: 'bn' },
  { label: 'తెలుగు (Telugu)', value: 'te' },
  { label: 'मराठी (Marathi)', value: 'mr' },
  { label: 'தமிழ் (Tamil)', value: 'ta' },
  { label: 'ગુજરાતી (Gujarati)', value: 'gu' },
  { label: 'ಕನ್ನಡ (Kannada)', value: 'kn' },
];

const LanguageSelectScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const { theme } = useTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    getStoredLanguage().then((lang) => setSelectedLanguage(lang));
  }, []);

  const handleNext = async () => {
    await setLanguage(selectedLanguage);
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme.colors.statusBarStyle || (theme.isDark ? 'light-content' : 'dark-content')} />
      <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.greeting}>{t('languageselect.greeting')}</Text>
        <Text style={styles.subtext}>{t('languageselect.subtext')}</Text>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.value}
            style={[
              styles.langButton,
              selectedLanguage === lang.value && styles.langButtonSelected,
            ]}
            onPress={() => setSelectedLanguage(lang.value)}
          >
            <Text
              style={[
                styles.langButtonText,
                selectedLanguage === lang.value && styles.langButtonTextSelected,
              ]}
            >
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{t('languageselect.next')}</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 32,
      width: '100%',
      maxWidth: 380,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    greeting: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtext: {
      color: theme.colors.textSecondary,
      fontSize: 18,
      marginBottom: 18,
      textAlign: 'center',
    },
    pickerContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      width: '100%',
      marginBottom: 28,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    picker: {
      color: theme.colors.text,
      width: '100%',
      height: 48,
    },
    pickerItem: {
      color: theme.colors.text,
      fontSize: 16,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 24,
      paddingVertical: 10,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      flexDirection: 'row',
    },
    buttonText: {
      color: theme.colors.background,
      fontSize: 20,
      fontWeight: '700',
    },
    dropdown: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 14,
      paddingHorizontal: 18,
      marginBottom: 28,
      marginTop: 8,
    },
    dropdownText: {
      color: theme.colors.text,
      fontSize: 18,
      textAlign: 'left',
    },
    dropdownList: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      width: '80%',
      alignSelf: 'center',
      maxHeight: 320,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dropdownOption: {
      color: theme.colors.text,
      fontSize: 18,
      paddingVertical: 12,
      paddingHorizontal: 18,
      textAlign: 'left',
      backgroundColor: theme.colors.surface,
    },
    dropdownOptionHighlight: {
      color: theme.colors.background,
      backgroundColor: theme.colors.primary,
      fontWeight: 'bold',
    },
    searchBar: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      fontSize: 16,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginBottom: 14,
      marginTop: 4,
    },
    langButton: {
      width: '100%',
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 10,
      alignItems: 'center',
    },
    langButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    langButtonText: {
      color: theme.colors.text,
      fontSize: 18,
    },
    langButtonTextSelected: {
      color: theme.colors.background,
      fontWeight: 'bold',
    },
  });

export default LanguageSelectScreen; 