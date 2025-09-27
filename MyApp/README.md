# MyApp - Smart Farming Mobile Application

A comprehensive React Native mobile application designed for farmers, providing AI-powered agricultural assistance, crop management, market insights, and voice-enabled interaction capabilities.

## 🌾 Overview

MyApp is an intelligent farming companion that combines modern technology with agricultural expertise to help farmers make informed decisions. The app features multilingual support, voice interaction, crop intelligence, market analysis, and comprehensive farming tools.

## 🚀 Features

### Core Features
- **🎤 Voice Interaction**: Advanced voice commands and speech-to-text capabilities
- **🌐 Multilingual Support**: 8 languages (English, Hindi, Bengali, Gujarati, Marathi, Tamil, Telugu, Kannada)
- **🧠 AI-Powered Recommendations**: Crop intelligence and farming advice
- **📱 Intuitive UI**: User-friendly interface with interactive onboarding
- **🔄 Offline Support**: Network fallback capabilities

### Main Modules

#### 1. 🗣️ Voice Chat System
- **VoiceChatInputScreen**: Text and voice input interface
- **LiveVoiceScreen**: Real-time voice interaction
- **Speech Recognition**: Multi-language voice commands
- **Audio Processing**: Voice-to-text and text-to-speech

#### 2. 🌱 Crop Management
- **Crop Doctor**: AI-powered disease diagnosis
- **Crop Cycle**: Complete growth cycle management
- **Crop Intelligence**: Smart recommendations based on conditions
- **Farming Calendar**: Seasonal planning and reminders

#### 3. 📊 Market & Financial Tools
- **Market Prices**: Real-time crop pricing
- **Marketplace**: Buy/sell agricultural products
- **UPI Integration**: Digital payment system
- **Earnings Tracker**: Income and expense management

#### 4. 🐄 Livestock Management
- **Cattle Screen**: Livestock tracking and health
- **Best Out of Waste**: Waste management solutions
- **Rental System**: Equipment rental marketplace

#### 5. 🛠️ Utility Features
- **Weather Integration**: Agricultural weather insights
- **Soil Moisture**: Environmental monitoring
- **Document Agent**: Agricultural document processing
- **Farm Visualizer**: Land management visualization

#### 6. 💰 Financial Services
- **UPI Payments**: Integrated payment system
- **Bank Transfer**: Financial transactions
- **Mobile Recharge**: Utility payments
- **Loan Applications**: Agricultural financing

## 🏗️ Project Structure

```
MyApp/
├── 📱 App.jsx                          # Main application entry point
├── 🌐 i18n.js                         # Internationalization configuration
├── 📦 package.json                    # Project dependencies
├── ⚙️ app.json                        # Expo configuration
├── 
├── 📂 screens/                        # All application screens
│   ├── ChoiceScreen.jsx               # Mode selection (Voice/Manual)
│   ├── VoiceChatInputScreen.jsx       # Chat interface
│   ├── LiveVoiceScreen.jsx            # Voice interaction
│   ├── Featured.jsx                   # Featured tools dashboard
│   ├── CropCycle.jsx                  # Crop management
│   ├── CropDoctor.jsx                 # Disease diagnosis
│   ├── CattleScreen.jsx               # Livestock management
│   ├── MarketplaceScreen.jsx          # Product marketplace
│   ├── WeatherScreen.jsx              # Weather information
│   ├── SoilMoistureScreen.jsx         # Environmental data
│   ├── CalenderScreen.jsx             # Farming calendar
│   ├── UPI.jsx                        # Payment gateway
│   └── ... (30+ more screens)
│
├── 📂 components/                     # Reusable UI components
│   ├── AnimatedLoading.js             # Loading animations
│   ├── CustomHeader.js                # Navigation header
│   ├── LanguageSelector.jsx           # Language switcher
│   ├── MicOverlay.jsx                 # Voice input overlay
│   └── ... (10+ components)
│
├── 📂 services/                       # Business logic & API calls
│   ├── CropCycleService.js            # Crop management APIs
│   ├── CropMarketplaceService.js      # Marketplace APIs
│   ├── VoiceCommandAPI.js             # Voice processing
│   ├── NetworkTestService.js          # Connectivity testing
│   └── ... (6+ services)
│
├── 📂 UPI/                           # Payment system screens
│   ├── PayAnyoneScreen.jsx            # Payment interface
│   ├── BankSelectScreen.jsx           # Bank selection
│   ├── PaymentSuccessScreen.jsx       # Transaction confirmation
│   └── ... (9 payment screens)
│
├── 📂 utils/                         # Utility functions
│   └── NetworkConfig.js               # Network configuration
│
├── 📂 context/                       # React Context providers
│   └── ThemeContext.jsx               # Theme management
│
├── 📂 languages_json/                # Translation files
│   ├── en.json                        # English translations
│   ├── hi.json                        # Hindi translations
│   ├── bn.json                        # Bengali translations
│   └── ... (8 language files)
│
├── 📂 assets/                        # Images, icons, fonts
├── 📂 data/                          # Static data files
└── 📂 .expo/                         # Expo configuration
```

## 🛠️ Technology Stack

### Frontend Framework
- **React Native**: 0.79.5
- **Expo**: ^53.0.19
- **React**: 19.0.0
- **React Navigation**: ^6.1.18

### Key Libraries
- **@react-native-voice/voice**: Voice recognition
- **expo-speech**: Text-to-speech
- **expo-av**: Audio/video processing
- **react-i18next**: Internationalization
- **axios**: HTTP client
- **react-native-maps**: Map integration
- **expo-camera**: Camera functionality
- **expo-location**: GPS services

### UI Components
- **@expo/vector-icons**: Icon library
- **react-native-animatable**: Animations
- **expo-linear-gradient**: Gradient backgrounds
- **react-native-toast-message**: Notifications

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: 18.x or higher
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)

### Step 1: Clone the Repository
```bash
cd C:\Users\vinay\OneDrive\Desktop\unoff-google\google-agentic-ai\MyApp
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Environment Configuration

#### 3.1 Network Configuration
Update `utils/NetworkConfig.js` with your backend URL:
```javascript
export const NetworkConfig = {
  API_BASE: 'http://YOUR_BACKEND_IP:8000',
  MODE: 'online', // 'online' or 'offline'
  FALLBACK_URLS: [
    'http://10.123.4.245:8000',
    'http://10.215.221.37:8000',
    // Add your backend URLs
  ],
};
```

#### 3.2 Language Files
Ensure all language files are present in `languages_json/`:
- `en.json` (English)
- `hi.json` (Hindi)
- `bn.json` (Bengali)
- `gu.json` (Gujarati)
- `mr.json` (Marathi)
- `ta.json` (Tamil)
- `te.json` (Telugu)
- `kn.json` (Kannada)

### Step 4: Start Development Server
```bash
npm start
# or
expo start
```

### Step 5: Run on Device/Emulator

#### For Android:
```bash
npm run android
# or
expo start --android
```

#### For iOS:
```bash
npm run ios
# or
expo start --ios
```

#### For Web (Development):
```bash
npm run web
# or
expo start --web
```

## 🔧 Configuration

### App Configuration (`app.json`)
```json
{
  "expo": {
    "name": "MyApp",
    "slug": "MyApp",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android", "web"],
    "plugins": [
      "expo-localization",
      "expo-font",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Location access for farming services"
        }
      ]
    ]
  }
}
```

### Required Permissions
- **Location**: GPS for weather and local services
- **Camera**: Document scanning and crop photography
- **Microphone**: Voice commands and audio recording
- **Storage**: Offline data and cached content

## 🌐 Backend Integration

### API Endpoints
The app connects to multiple backend services:

#### Primary Backend: `http://YOUR_BACKEND_IP:8000`
- `/crop-cycle/*` - Crop management APIs
- `/crop-intelligence/*` - AI recommendations
- `/marketplace/*` - Market data and transactions
- `/weather/*` - Weather information
- `/voice/*` - Voice processing

#### API Testing
Use the included test script:
```bash
node test_api_endpoints.js
```

### Network Fallback
The app includes intelligent network fallback:
1. Primary backend connection
2. Alternative backend URLs
3. Offline mode with cached data
4. Network diagnostics and error handling

## 📱 Usage Guide

### Initial Setup
1. **Language Selection**: Choose preferred language on first launch
2. **Location Permission**: Grant location access for local services
3. **Mode Selection**: Choose Voice or Manual interaction mode
4. **Onboarding**: Complete interactive tutorial

### Main Navigation Flow
```
LanguageSelectScreen → FetchingLocationScreen → LoginScreen → ChoiceScreen
                                                                    ↓
Featured ← VoiceChatInputScreen ← [Voice/Manual Mode] → LiveVoiceScreen
    ↓
[Various Feature Screens: CropCycle, CropDoctor, Marketplace, etc.]
```

### Voice Commands
The app supports natural language voice commands in multiple languages:
- "Show me crop prices" → Market Prices Screen
- "Check weather" → Weather Screen
- "Crop disease help" → Crop Doctor Screen
- "मेरी फसल की जांच करें" (Hindi)
- "আমার ফসলের দাম দেখান" (Bengali)

## 🎨 UI/UX Features

### Interactive Onboarding
Each major screen includes guided tutorials:
- **ChoiceScreen**: Mode selection guidance
- **VoiceChatInputScreen**: Chat interface tutorial
- **Featured**: Tools overview
- **CropDoctor**: Disease diagnosis help

### Responsive Design
- Adaptive layouts for different screen sizes
- Consistent design system across all screens
- Smooth animations and transitions
- Dark/light theme support (via ThemeContext)

### Accessibility
- Screen reader support
- High contrast mode
- Large text options
- Voice navigation for visually impaired users

## 🧪 Testing

### Run Tests
```bash
# API endpoint testing
node test_api_endpoints.js

# Onboarding flow testing
node test-onboarding.js

# Network connectivity testing
node temp-fix.js
```

### Manual Testing Checklist
- [ ] Language switching works correctly
- [ ] Voice commands respond appropriately
- [ ] Network fallback functions properly
- [ ] All screens load without errors
- [ ] Payments process successfully
- [ ] Location services work
- [ ] Camera and audio permissions granted

## 🚨 Troubleshooting

### Common Issues

#### 1. Network Connection Problems
```javascript
// Check NetworkConfig.js settings
// Verify backend is running
// Test with: npm run test-network
```

#### 2. Voice Recognition Not Working
- Ensure microphone permissions are granted
- Check device audio settings
- Verify `@react-native-voice/voice` installation

#### 3. Language Files Missing
```bash
# Verify all language files exist:
ls languages_json/
# Should show: en.json hi.json bn.json gu.json mr.json ta.json te.json kn.json
```

#### 4. Expo/Metro Bundle Issues
```bash
# Clear cache and restart
expo start --clear
# or
npx expo start --clear
```

#### 5. Android Build Issues
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
expo run:android
```

### Debug Mode
Enable debug features in development:
- **Tour Buttons**: Restart onboarding flows
- **Reset Buttons**: Clear AsyncStorage data
- **Network Diagnostics**: Test API connectivity
- **Console Logging**: Monitor app behavior

## 📚 Documentation

### Feature-Specific Documentation
- [`VOICECHAT_ONBOARDING.md`](./VOICECHAT_ONBOARDING.md) - Voice chat tutorial implementation
- [`FEATURED_ONBOARDING.md`](./FEATURED_ONBOARDING.md) - Featured screen guidance
- [`MARKETPLACE_FEATURES.md`](./MARKETPLACE_FEATURES.md) - Marketplace functionality
- [`GOOGLE_MAPS_SETUP.md`](./GOOGLE_MAPS_SETUP.md) - Map integration guide
- [`CATTLE_ONBOARDING.md`](./CATTLE_ONBOARDING.md) - Livestock management
- [`CROPDOCTOR_ONBOARDING.md`](./CROPDOCTOR_ONBOARDING.md) - Disease diagnosis
- [`VOICE_INTEGRATION_DEMO.md`](./VOICE_INTEGRATION_DEMO.md) - Voice features demo

### Technical Documentation
- [`NETWORK_TROUBLESHOOTING.md`](./NETWORK_TROUBLESHOOTING.md) - Network issue resolution
- [`ONBOARDING_FIXES.md`](./ONBOARDING_FIXES.md) - Onboarding system fixes
- [`ONBOARDING_POSITIONING_GUIDE.md`](./ONBOARDING_POSITIONING_GUIDE.md) - UI positioning guide

## 🔮 Future Enhancements

### Planned Features
- **Machine Learning**: On-device crop disease detection
- **Augmented Reality**: AR-based crop analysis
- **Blockchain**: Supply chain transparency
- **IoT Integration**: Sensor data processing
- **Advanced Analytics**: Predictive farming insights

### Performance Optimizations
- Code splitting for faster loading
- Image optimization and caching
- Background sync capabilities
- Reduced bundle size
- Enhanced offline functionality

## 🤝 Contributing

### Development Guidelines
1. Follow React Native best practices
2. Maintain consistent code style
3. Add comments for complex logic
4. Update documentation for new features
5. Test on multiple devices/platforms

### Code Structure
- Use functional components with hooks
- Implement proper error boundaries
- Follow component naming conventions
- Maintain separation of concerns
- Use TypeScript for type safety (future)

## 📄 License

This project is part of the Google Agentic AI farming assistant ecosystem.

## 📞 Support

For technical support or feature requests:
- Create issues in the project repository
- Check existing documentation files
- Review troubleshooting guides
- Test network connectivity first

---

**MyApp** - Empowering farmers with intelligent technology for sustainable agriculture 🌾📱✨
