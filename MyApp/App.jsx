// ----- External libraries -----
import React, { Suspense, useEffect, useRef, useState } from 'react';

// Ensure React is globally accessible for any legacy transpiled modules that
// still reference the global symbol (pre-new JSX transform) and are loaded
// before our custom index shim executes (e.g. via Expo's default AppEntry).
if (!globalThis.React) {
  // eslint-disable-next-line no-console
  console.log('[App] attaching React to globalThis');
  globalThis.React = React;
}

import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';

// ----- i18n -----
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n, { getStoredLanguage } from './i18n';

// ----- Theme / app-wide context -----
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { buildNavigationTheme } from './theme';

// ----- Screens -----
import ChoiceScreen from './screens/ChoiceScreen';
import VoiceChatInputScreen from './screens/VoiceChatInputScreen';
import LiveVoiceScreen from './screens/LiveVoiceScreen';
import FeaturedScreen from './screens/Featured';
import ChatHistoryScreen from './screens/ChatHistoryScreen';
import CropCycleScreen from './screens/CropCycle';
import SmartCalendar from './screens/CalenderScreen';
import CattleScreen from './screens/CattleScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import UPIScreen from './screens/UPI';
import CropDoctorScreen from './screens/CropDoctor';
import FollowUpScreen from './screens/FollowUpScreen';

// UPI sub-flows
import PayAnyoneScreen from './UPI/PayAnyoneScreen';
import ContactUPIDetailScreen from './UPI/ContactUPIDetailScreen';
import PaymentAmountScreen from './UPI/PaymentAmountScreen';
import BankSelectScreen from './UPI/BankSelectScreen';
import EnterPinScreen from './UPI/EnterPinScreen';
import PaymentSuccessScreen from './UPI/PaymentSuccessScreen';
import PaymentProcessingScreen from './UPI/PaymentProcessingScreen';
import BankTransferScreen from './UPI/BankTransferScreen';
import MobileRechargeScreen from './UPI/MobileRechargeScreen';

// Utility / misc screens
import LanguageSelectScreen from './screens/LanguageSelectScreen';
import FetchingLocationScreen from './screens/FetchingLocationScreen';
import DocumentAgentScreen from './screens/DocumentAgentScreen';
import WeatherScreen from './screens/WeatherScreen';
import NewMarketPricesScreen from './screens/NewMarketPricesScreen';
import SoilMoistureScreen from './screens/SoilMoistureScreen';
import FarmerProfileScreen from './screens/FarmerProfileScreen';
import ProfileScreen from './screens/Profile';
import LoginScreen from './screens/LoginScreen';
import RentalScreen from './screens/RentalScreen';
import MyBookings from './screens/MyBookings';
import Earnings from './screens/Earnings';
import ListingDetails from './screens/ListingDetails';
import SpeechToTextScreen from './screens/SpeechToTextScreen';
import CropIntelligenceScreenNew from './screens/CropIntelligenceScreenNew';

// Crop-cycle deep screens
import MarketStrategyScreen from './screens/cropcycle/MarketStrategyScreen';
import PowerSupplyScreen from './screens/cropcycle/PowerSupplyScreen';
import ContractFarmingScreen from './screens/cropcycle/ContractFarmingScreen';
import CropInsuranceScreen from './screens/cropcycle/CropInsuranceScreen';
import CreditSourcesScreen from './screens/cropcycle/CreditSourcesScreen';
import SoilHealthScreen from './screens/cropcycle/SoilHealthScreen';

// Other features
import BestOutOfWasteScreen from './screens/BestOutOfWasteScreen';
import SuicidePrevention from './screens/SuicidePrevention';
import SettingsScreen from './screens/SettingsScreen';
import FarmVisualizerScreen from './screens/FarmVisualizerScreen';

// Components
import ThemeToggle from './components/ThemeToggle';
const Stack = createStackNavigator();

function AppInner() {
  const { theme } = useTheme();
  const navigationRef = useRef(null);
  const [currentRoute, setCurrentRoute] = useState(null);

  useEffect(() => {
    getStoredLanguage().then((lang) => {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    });
  }, []);

  const SCREENS = [
    { name: 'LanguageSelectScreen', component: LanguageSelectScreen },
    { name: 'FetchingLocationScreen', component: FetchingLocationScreen },
    { name: 'LoginScreen', component: LoginScreen },
    {
      name: 'ChoiceScreen',
      component: ChoiceScreen,
      options: {
        headerShown: false,
        animationEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      },
    },
    { name: 'VoiceChatInputScreen', component: VoiceChatInputScreen },
    { name: 'LiveVoiceScreen', component: LiveVoiceScreen },
    { name: 'Featured', component: FeaturedScreen },
    { name: 'ChatHistory', component: ChatHistoryScreen },
    { name: 'CropCycle', component: CropCycleScreen },
    { name: 'CalenderScreen', component: SmartCalendar },
    { name: 'CattleScreen', component: CattleScreen },
    { name: 'MarketplaceScreen', component: MarketplaceScreen },
    { name: 'UPI', component: UPIScreen },
    { name: 'CropDoctor', component: CropDoctorScreen },
    {
      name: 'FollowUpScreen',
      component: FollowUpScreen,
      options: { presentation: 'transparentModal', animationEnabled: true },
    },
    { name: 'PayAnyone', component: PayAnyoneScreen },
    { name: 'ContactUPIDetail', component: ContactUPIDetailScreen },
    { name: 'PaymentAmountScreen', component: PaymentAmountScreen },
    { name: 'BankSelectScreen', component: BankSelectScreen },
    { name: 'EnterPinScreen', component: EnterPinScreen },
    { name: 'PaymentSuccessScreen', component: PaymentSuccessScreen },
    { name: 'PaymentProcessingScreen', component: PaymentProcessingScreen },
    { name: 'BankTransferScreen', component: BankTransferScreen },
    { name: 'MobileRechargeScreen', component: MobileRechargeScreen },
    { name: 'DocumentAgentScreen', component: DocumentAgentScreen },
    { name: 'WeatherScreen', component: WeatherScreen },
    { name: 'NewMarketPrices', component: NewMarketPricesScreen },
    { name: 'SoilMoisture', component: SoilMoistureScreen },
    { name: 'FarmerProfile', component: FarmerProfileScreen },
    { name: 'Profile', component: ProfileScreen },
    { name: 'RentalSystemScreen', component: RentalScreen },
    { name: 'ListingDetails', component: ListingDetails },
    { name: 'MyBookings', component: MyBookings },
    { name: 'Earnings', component: Earnings },
    { name: 'SpeechToTextScreen', component: SpeechToTextScreen },
    { name: 'CropIntelligenceScreenNew', component: CropIntelligenceScreenNew },
    { name: 'MarketStrategyScreen', component: MarketStrategyScreen },
    { name: 'PowerSupplyScreen', component: PowerSupplyScreen },
    { name: 'ContractFarmingScreen', component: ContractFarmingScreen },
    { name: 'CropInsuranceScreen', component: CropInsuranceScreen },
    { name: 'CreditSourcesScreen', component: CreditSourcesScreen },
    { name: 'SoilHealthScreen', component: SoilHealthScreen },
    { name: 'BestOutOfWasteScreen', component: BestOutOfWasteScreen },
    { name: 'FarmVisualizerScreen', component: FarmVisualizerScreen },
    { name: 'SuicidePrevention', component: SuicidePrevention },
    { name: 'Settings', component: SettingsScreen },
  ];

  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={null}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <NavigationContainer
            ref={navigationRef}
            theme={buildNavigationTheme(theme)}
            onReady={() => {
              const routeName = navigationRef.current?.getCurrentRoute?.()?.name ?? null;
              setCurrentRoute(routeName);
            }}
            onStateChange={() => {
              const routeName = navigationRef.current?.getCurrentRoute?.()?.name ?? null;
              setCurrentRoute(routeName);
            }}
          >
            <Stack.Navigator initialRouteName="ChoiceScreen" screenOptions={{ headerShown: false }}>
              {SCREENS.map((s) => (
                <Stack.Screen
                  key={s.name}
                  name={s.name}
                  component={s.component}
                  options={s.options}
                />
              ))}
            </Stack.Navigator>
          </NavigationContainer>

          {/* Theme toggle ONLY on VoiceChatInputScreen */}
          {currentRoute === 'VoiceChatInputScreen' && (
            <View style={styles.toggleContainer} pointerEvents="box-none">
              <ThemeToggle />
            </View>
          )}

          <Toast />
        </View>
      </Suspense>
    </I18nextProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    position: 'absolute',
    top: 45,
    right: 6,
    zIndex: 999,
  },
});
