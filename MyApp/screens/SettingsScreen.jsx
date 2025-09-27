import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Alert, Platform, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { setLanguage, getStoredLanguage } from '../i18n';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SettingRow = ({ icon, label, description, control, theme, hideDivider }) => (
  <View style={[styles.row, !hideDivider && { borderBottomColor: theme.colors.border + '22', borderBottomWidth: StyleSheet.hairlineWidth }]}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.primary + '12' }]}>
        {icon}
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
        {description ? <Text style={[styles.rowDesc, { color: theme.colors.textSecondary }]}>{description}</Text> : null}
      </View>
    </View>
    <View style={styles.rowControl}>{control}</View>
  </View>
);

export default function SettingsScreen({ navigation }) {
  const { theme, mode, setMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

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

  useEffect(() => {
    let mounted = true;
    getStoredLanguage().then((lang) => {
      if (mounted && lang) setSelectedLanguage(lang);
    });
    return () => (mounted = false);
  }, []);

  const onChangeLanguage = async (lang) => {
    try {
      setSelectedLanguage(lang);
      await setLanguage(lang);
      if (i18n && i18n.changeLanguage) {
        i18n.changeLanguage(lang);
      }
      if (Platform.OS === 'web') {
        Alert.alert(t('common.success') || 'Success', t('settings.language_changed') || 'Language changed');
      }
    } catch (e) {
      Alert.alert(t('common.error') || 'Error', t('settings.language_error') || 'Failed to change language');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(t('settings.reset_title') || 'Reset Settings', t('settings.reset_confirm') || 'Reset to default settings?', [
      { text: t('common.cancel') || 'Cancel', style: 'cancel' },
      { text: t('common.ok') || 'OK', style: 'destructive', onPress: () => setMode('light') }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={theme.colors.statusBarStyle} backgroundColor={theme.colors.headerBackground} />
      <View style={[styles.header, { backgroundColor: theme.colors.headerBackground, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 12 : 16 }]}> 
        <TouchableOpacity onPress={() => navigation?.canGoBack() ? navigation.goBack() : null} style={[styles.backBtn, { backgroundColor: theme.colors.card }]} hitSlop={{ top: 30, left: 10, right: 10, bottom: 10 }} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={28} color={theme.colors.headerTitle} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.headerTitle }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 120, paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Appearance Card */}
        <View style={[styles.panelTall, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.panelTitleCenter, { color: theme.colors.text }]}>Appearance</Text>
          <Text style={[styles.panelSub, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>Customize the look and feel of the app</Text>

          <View style={{ height: 12 }} />

          <View style={[styles.appearanceBox, { backgroundColor: theme.colors.backgroundSecondary || '#f2f6ef' }]}>
            <Text style={[styles.smallLabel, { color: theme.colors.textSecondary }]}>Theme</Text>

            <View style={styles.themeRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setMode('light')}
                style={[styles.themePill, mode === 'light' ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.card }]}
              >
                <Text style={[styles.themePillText, mode === 'light' ? { color: theme.colors.headerTitle } : { color: theme.colors.text } ]}>Light Theme</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setMode('dark')}
                style={[styles.themePill, mode === 'dark' ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.card } ]}
              >
                <Text style={[styles.themePillText, mode === 'dark' ? { color: theme.colors.headerTitle } : { color: theme.colors.text } ]}>Dark Theme</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Language Card */}
        <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Language Options</Text>

          <View style={{ height: 8 }} />

          <View style={[styles.languageBox, { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border }]}> 
            <Picker
              selectedValue={selectedLanguage}
              onValueChange={async (val) => { setSelectedLanguage(val); await onChangeLanguage(val); }}
              style={{ flex: 1, color: theme.colors.text }}
              itemStyle={{ color: theme.colors.text }}
              dropdownIconColor={theme.colors.primary}
            >
              {LANGUAGES.map((l) => (
                <Picker.Item key={l.value} label={l.label} value={l.value} />
              ))}
            </Picker>
            <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
          </View>
        </View>

        {/* Privacy Card */}
        <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <SettingRow icon={<Ionicons name="document-text" size={18} color={theme.colors.primary} />} label="Privacy Policy" control={<Ionicons name="lock-closed" size={18} color={theme.colors.primary} />} theme={theme} />
          <SettingRow icon={<Ionicons name="document-outline" size={18} color={theme.colors.primary} />} label="Terms of Service" control={<Ionicons name="lock-closed" size={18} color={theme.colors.primary} />} theme={theme} />
          <SettingRow icon={<Ionicons name="settings" size={18} color={theme.colors.primary} />} label="Data Preferences" control={<Ionicons name="lock-closed" size={18} color={theme.colors.primary} />} theme={theme} hideDivider />
        </View>

        {/* Support Card */}
        <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Support</Text>
          <View style={{ height: 8 }} />
          <View style={styles.supportRow}>
            <TouchableOpacity style={[styles.pillBtn, { backgroundColor: theme.colors.card }]} onPress={() => Alert.alert('Contact', 'Contact Us (not implemented)')}>
              <Text style={[styles.pillText, { color: theme.colors.text }]}>Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pillBtn, { backgroundColor: theme.colors.card }]} onPress={() => Alert.alert('Help', 'Help Center (not implemented)')}>
              <Text style={[styles.pillText, { color: theme.colors.text }]}>Help Center</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={{ alignSelf: 'center', marginTop: 10 }} onPress={() => Alert.alert('About', 'About This App')}>
            <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>About This App</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>v3.1.0</Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    // remove explicit bottom border to make header clean
    borderBottomWidth: 0,
    // subtle elevation
    ...Platform.select({ android: { elevation: 2 }, ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 } }),
  },
  backBtn: { padding: 6, marginRight: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 22, height: 44 },
  actionBtn: { padding: 8, width: 44, alignItems: 'flex-end' },
  title: { fontSize: 24, fontWeight: '800', position: 'absolute', left: 0, right: 0, textAlign: 'center', marginTop: 6 },
  panel: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  panelTall: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  panelTitleCenter: { fontSize: 20, fontWeight: '900' },
  panelTitle: { fontSize: 16, fontWeight: '800' },
  panelSub: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '700' },
  rowDesc: { fontSize: 12, marginTop: 4 },
  rowControl: { marginLeft: 12 },
  cta: { marginTop: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  ctaText: { fontSize: 15, fontWeight: '700' },
  ghostBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
  ghostText: { fontSize: 14 },
  pickerContainer: { marginTop: 8, borderRadius: 8, overflow: 'hidden' },
  appearanceBox: { width: '100%', borderRadius: 12, padding: 14 },
  smallLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  themeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  themePill: { flex: 1, paddingVertical: 12, borderRadius: 24, marginHorizontal: 6, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  themePillText: { fontSize: 15, fontWeight: '800' },
  languageBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12 },
  langText: { fontSize: 15, fontWeight: '700' },
  supportRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pillBtn: { flex: 1, paddingVertical: 12, borderRadius: 30, marginHorizontal: 6, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
  pillText: { fontSize: 15, fontWeight: '700' },
  aboutText: { fontSize: 14 },
  versionText: { textAlign: 'center', marginTop: 18, fontSize: 12 },
});
