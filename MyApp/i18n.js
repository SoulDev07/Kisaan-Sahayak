import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './languages_json/en.json';
import hi from './languages_json/hi.json';
import bn from './languages_json/bn.json';
import gu from './languages_json/gu.json';
import mr from './languages_json/mr.json';
import ta from './languages_json/ta.json';
import te from './languages_json/te.json';
import kn from './languages_json/kn.json';

const LANGUAGES = {
  en,
  hi,
  bn,
  gu,
  mr,
  ta,
  te,
  kn,
};

const LANGUAGE_CODES = Object.keys(LANGUAGES);

const LANGUAGE_STORAGE_KEY = 'appLanguage';

export const setLanguage = async (lang) => {
  if (LANGUAGE_CODES.includes(lang)) {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  // wait for i18n to finish changing language before returning
  await i18n.changeLanguage(lang);
  }
};

export const getStoredLanguage = async () => {
  const lang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  return lang && LANGUAGE_CODES.includes(lang) ? lang : 'en';
};

// i18n initialization
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      resources: Object.fromEntries(
        LANGUAGE_CODES.map((code) => [code, { translation: LANGUAGES[code] }])
      ),
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
}

export default i18n; 