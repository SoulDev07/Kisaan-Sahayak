# 🔧 React Native Backend Connection Troubleshooting Guide

## ❌ Error: "Could not connect to backend - Network request failed"

This error occurs when your React Native app cannot reach the FastAPI backend server. Here are comprehensive solutions:

## 🛠️ Solution Steps

### 1. **Verify Backend Server is Running**
```bash
# Check if server is running on port 8000
netstat -an | findstr :8000

# Expected output:
# TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING
```

### 2. **Start Backend Server (if not running)**
```bash
cd backend/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
**Important**: Use `--host 0.0.0.0` not `--host 127.0.0.1` or `localhost`

### 3. **Check Network Configuration**

#### Find Your Computer's IP Address:
```bash
# Windows
ipconfig | findstr "IPv4"

# Expected output:
# IPv4 Address. . . . . . . . . . . : 192.168.1.13
```

#### Update React Native Code:
Make sure your React Native app uses the correct IP address:
```javascript
// In your React Native screens, use your computer's IP:
const API_BASE = 'http://192.168.1.13:8000'; // ✅ Use your actual IP
// NOT localhost or 127.0.0.1 - those won't work from mobile device
```

### 4. **Network Connection Requirements**

#### Same WiFi Network:
- Your computer (running backend) must be on the same WiFi network as your phone/emulator
- Check both devices are connected to the same network name

#### Firewall Settings:
```bash
# Windows: Allow port 8000 through firewall
netsh advfirewall firewall add rule name="FastAPI" dir=in action=allow protocol=TCP localport=8000
```

### 5. **Device-Specific Solutions**

#### Physical Android Device:
- Ensure USB debugging is enabled
- Phone and computer on same WiFi
- Use computer's actual IP address (192.168.x.x)

#### Android Emulator:
```javascript
// Use special emulator IP
const API_BASE = 'http://10.0.2.2:8000';
```

#### iOS Simulator:
```javascript
// Can use localhost
const API_BASE = 'http://localhost:8000';
```

### 6. **Test Backend Accessibility**

#### From Computer Browser:
Visit: `http://192.168.1.13:8000`
Should show: `{"message": "FastAPI backend for Farmer App is running!"}`

#### From Phone Browser:
Visit: `http://192.168.1.13:8000` (same URL)
Should show the same message

### 7. **Enhanced Network Configuration** (Already implemented)

The updated `LiveVoiceScreen.jsx` now includes:
- Automatic network testing on app start
- Multiple fallback URLs
- Better error messages
- Network status indicator
- Retry functionality

## 🧪 **Testing Network Connection**

### Manual Test in React Native:
```javascript
// Test if you can reach the server
const testConnection = async () => {
  try {
    const response = await fetch('http://192.168.1.13:8000/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful:', data);
      Alert.alert('Success', 'Connected to backend!');
    } else {
      console.log('❌ HTTP error:', response.status);
      Alert.alert('Error', `HTTP ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    Alert.alert('Network Error', error.message);
  }
};
```

### Backend Health Check:
```bash
# Test from command line
curl http://192.168.1.13:8000/

# Expected response:
# {"message":"FastAPI backend for Farmer App is running!"}
```

## 🚨 **Common Issues & Solutions**

### Issue 1: "Connection refused"
**Solution**: Backend server not running
```bash
cd backend/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Issue 2: "Timeout" or "Network request failed"
**Solutions**:
- Check WiFi connection on both devices
- Use computer's IP, not localhost
- Disable firewall temporarily to test
- Try different port (8001, 8080)

### Issue 3: "DNS resolution failed"
**Solution**: Use IP address instead of hostname
```javascript
// ❌ Don't use
const API_BASE = 'http://mycomputer.local:8000';

// ✅ Use actual IP
const API_BASE = 'http://192.168.1.13:8000';
```

### Issue 4: Works in browser but not in React Native
**Solutions**:
- Check React Native Metro bundler is running
- Clear React Native cache: `npx react-native start --reset-cache`
- Restart React Native app completely

## 📱 **Platform-Specific Network Settings**

### Android (Physical Device):
```javascript
const API_BASE = 'http://192.168.1.13:8000'; // Use computer's IP
```

### Android (Emulator):
```javascript
const API_BASE = 'http://10.0.2.2:8000'; // Special emulator localhost
```

### iOS (Simulator):
```javascript
const API_BASE = 'http://localhost:8000'; // Can use localhost
```

### Expo Development:
```javascript
// In app.json, add:
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.13:8000"
    }
  }
}

// Then in code:
import Constants from 'expo-constants';
const API_BASE = Constants.expoConfig.extra.apiUrl;
```

## ✅ **Verification Checklist**

- [ ] Backend server running with `--host 0.0.0.0`
- [ ] Computer IP address correctly identified
- [ ] React Native code uses correct IP address
- [ ] Both devices on same WiFi network
- [ ] Firewall allows port 8000
- [ ] Can access backend from phone browser
- [ ] Metro bundler running for React Native
- [ ] Network status shows "Connected" in app

## 🎯 **Quick Fix Commands**

```bash
# 1. Start backend correctly
cd backend/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 2. Check IP address
ipconfig | findstr "IPv4"

# 3. Test from another device browser
# Visit: http://[YOUR_IP]:8000

# 4. Allow through firewall
netsh advfirewall firewall add rule name="FastAPI" dir=in action=allow protocol=TCP localport=8000
```

With these fixes, your React Native app should successfully connect to the backend! 🎉
