# Eczema Care - React Native Mobile App

A comprehensive mobile application for eczema care management built with React Native and Expo.

## 📱 Features

- **AI Skin Analysis**: Upload images for AI-powered eczema detection
- **Symptom Logging**: Track and monitor eczema symptoms over time
- **Doctor Consultations**: Book consultations with dermatologists
- **Reminders**: Set medication and appointment reminders
- **Progress Tracking**: View symptom trends and progress charts
- **Personalized Tips**: Get skincare tips based on your condition
- **Image Gallery**: Store and manage skin condition images

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Expo CLI** (optional, but recommended)
   - Install globally: `npm install -g expo-cli`
   - Or use npx (no installation needed)

4. **Expo Go App** (for testing on physical device)
   - **iOS**: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - **Android**: Download from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Optional (for development)

5. **Android Studio** (for Android emulator)
   - Download from: https://developer.android.com/studio

6. **Xcode** (for iOS simulator - macOS only)
   - Download from: https://developer.apple.com/xcode/

## 🚀 Step-by-Step Setup Instructions

### Step 1: Navigate to Project Directory

```bash
cd frontend-mobile-react-native-app
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

**Note**: This may take a few minutes as it downloads all dependencies including React Native and Expo packages.

**Expected Output**: You should see packages being installed. Wait for the process to complete.

### Step 3: Configure API Endpoint

The app needs to connect to the backend server. You need to update the API URL in the configuration file.

#### Option A: Update API URL in Code (Quick Method)

1. Open `config/api.ts`
2. Find the line with the API URL (around line 12):
   ```typescript
   return process.env.EXPO_PUBLIC_API_URL || 'http://192.168.18.224:3000/api';
   ```
3. Replace `192.168.18.224` with your computer's local IP address

#### Option B: Use Environment Variable (Recommended)

1. Create a `.env` file in the project root:
   ```bash
   touch .env
   ```

2. Add your API URL to the `.env` file:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000/api
   ```

   **To find your IP address:**
   - **Linux/Mac**: Run `hostname -I | awk '{print $1}'` or `ipconfig getifaddr en0`
   - **Windows**: Run `ipconfig` and look for IPv4 Address
   - **Example**: If your IP is `192.168.1.100`, use `http://192.168.1.100:3000/api`

### Step 4: Ensure Backend Server is Running

Before starting the mobile app, make sure the backend server is running:

1. Navigate to the backend directory:
   ```bash
   cd ../backend
   ```

2. Start the backend server:
   ```bash
   npm run dev
   ```

3. Verify it's running by checking:
   - Server should show: `🚀 Server running on 0.0.0.0:3000`
   - MongoDB should be connected

4. Keep this terminal window open (backend must stay running)

### Step 5: Start the React Native Development Server

1. Open a **new terminal window** (keep backend running in the first terminal)

2. Navigate back to the mobile app directory:
   ```bash
   cd frontend-mobile-react-native-app
   ```

3. Start the Expo development server:
   ```bash
   npm run dev
   ```

   Or alternatively:
   ```bash
   npx expo start
   ```

**Expected Output**: You should see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

### Step 6: Run the App

You have three options to run the app:

#### Option A: Run on Physical Device (Recommended for Testing)

1. **For Android**:
   - Open Expo Go app on your Android device
   - Scan the QR code shown in the terminal
   - The app will load on your device

2. **For iOS**:
   - Open the Camera app on your iPhone
   - Point it at the QR code shown in the terminal
   - Tap the notification that appears
   - The app will open in Expo Go

**Important**: Your phone and computer must be on the same Wi-Fi network.

#### Option B: Run on Android Emulator

1. Make sure Android Studio is installed and an emulator is set up
2. In the Expo terminal, press `a` to open Android emulator
3. Wait for the emulator to start and the app to load

#### Option C: Run on iOS Simulator (macOS only)

1. Make sure Xcode is installed
2. In the Expo terminal, press `i` to open iOS simulator
3. Wait for the simulator to start and the app to load

#### Option D: Run on Web Browser

1. In the Expo terminal, press `w` to open in web browser
2. The app will open at `http://localhost:8081`

**Note**: Some features (like camera) may not work in web browser.

## 📱 Using the App

### First Time Setup

1. **Create an Account**:
   - Open the app
   - Tap "Sign Up" on the login screen
   - Fill in your details (Name, Email, Password)
   - Tap "Sign Up"

2. **Complete Your Profile**:
   - After signing up, complete your profile
   - Add your phone number and date of birth
   - This information is required for booking consultations

3. **Grant Permissions**:
   - **Camera**: Required for taking photos of skin conditions
   - **Notifications**: Required for reminders and alerts
   - Grant these permissions when prompted

### Key Features

- **AI Skin Scan**: Tap "AI Skin Scan" tab → Take or upload a photo → Get AI analysis
- **Symptom Logs**: Track your symptoms, itchiness level, and triggers
- **Consult Doctor**: Browse available doctors and book consultations
- **Reminders**: Set medication and appointment reminders
- **Progress**: View your symptom trends and progress over time

## 🔧 Troubleshooting

### Issue: "Cannot connect to server" or API errors

**Solution**:
1. Verify backend server is running on port 3000
2. Check your IP address in `config/api.ts` matches your current network IP
3. Ensure your phone and computer are on the same Wi-Fi network
4. Try restarting both backend and mobile app servers

### Issue: "Module not found" errors

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Expo Go app can't connect

**Solution**:
1. Check firewall settings - allow port 8081
2. Try using tunnel mode:
   ```bash
   npx expo start --tunnel
   ```
3. Ensure both devices are on the same network

### Issue: Camera not working

**Solution**:
1. Grant camera permissions in device settings
2. For Android: Settings → Apps → Expo Go → Permissions → Camera → Allow
3. For iOS: Settings → Expo Go → Camera → Allow

### Issue: App crashes on startup

**Solution**:
1. Clear Expo cache:
   ```bash
   npx expo start -c
   ```
2. Restart the development server
3. Reinstall dependencies if needed

### Issue: Fonts not loading

**Solution**:
1. The app uses OpenSans fonts which should load automatically
2. If fonts don't appear, restart the app
3. Check that `@expo-google-fonts/open-sans` is installed

## 📂 Project Structure

```
frontend-mobile-react-native-app/
├── app/                    # App screens and routes
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx     # Home/Dashboard
│   │   ├── ai.tsx        # AI Skin Scan
│   │   ├── logs.tsx      # Symptom Logs
│   │   └── profile.tsx   # User Profile
│   ├── auth.tsx          # Authentication screen
│   ├── consult.tsx        # Doctor consultation
│   ├── images.tsx        # Image gallery
│   ├── reminders.tsx     # Reminders management
│   └── ...
├── components/            # Reusable components
│   ├── AppHeader.tsx
│   ├── CustomModal.tsx
│   └── DrawerContent.tsx
├── config/               # Configuration files
│   └── api.ts           # API endpoints and base URL
├── context/             # React Context providers
│   ├── DrawerContext.tsx
│   ├── ModalContext.tsx
│   └── NotificationContext.tsx
├── services/            # API service functions
│   ├── authService.ts
│   ├── imageService.ts
│   └── ...
├── utils/               # Utility functions
│   └── apiClient.ts
├── package.json         # Dependencies and scripts
└── app.json            # Expo configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start the Expo development server
- `npm run build:web` - Build for web platform
- `npm run lint` - Run ESLint to check code quality

## 🌐 API Configuration

The app connects to the backend API. Default configuration:

- **Base URL**: `http://YOUR_IP:3000/api`
- **Backend Port**: `3000`
- **AI Service Port**: `8000` (handled by backend)

Update the API URL in `config/api.ts` or set `EXPO_PUBLIC_API_URL` environment variable.

## 📱 Platform Support

- ✅ **iOS** (via Expo Go or build)
- ✅ **Android** (via Expo Go or build)
- ⚠️ **Web** (limited functionality - camera features won't work)

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000/api
```

Replace `YOUR_IP_ADDRESS` with your computer's local IP address.

## 📦 Dependencies

Key dependencies:
- **Expo SDK 54**: React Native framework
- **Expo Router**: File-based routing
- **React Navigation**: Navigation library
- **Lucide React Native**: Icon library
- **Expo Camera**: Camera functionality
- **Expo Image Picker**: Image selection
- **Expo Linear Gradient**: Gradient components

## 🚨 Important Notes

1. **Network Requirements**:
   - Backend server must be running before using the app
   - Phone and computer must be on the same Wi-Fi network
   - Firewall may block connections - allow port 3000 and 8081

2. **Development vs Production**:
   - This setup is for development
   - For production builds, use `expo build` or EAS Build

3. **API Endpoints**:
   - Backend API: `http://localhost:3000/api` (or your IP)
   - AI Service: `http://localhost:8000` (handled by backend)

4. **Database**:
   - Backend requires MongoDB to be running
   - Ensure MongoDB is installed and running

## 🆘 Getting Help

If you encounter issues:

1. Check the terminal output for error messages
2. Verify all prerequisites are installed
3. Ensure backend server is running
4. Check network connectivity
5. Try clearing cache: `npx expo start -c`
6. Reinstall dependencies: `rm -rf node_modules && npm install`

## 📝 Development Tips

1. **Hot Reload**: Changes to code automatically reload the app
2. **Debug Menu**: Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
3. **Reload App**: Press `r` in the Expo terminal
4. **Clear Cache**: Press `Shift+R` in the Expo terminal

## 🔄 Updating Dependencies

To update packages:

```bash
npm update
```

To update Expo:

```bash
npx expo install --fix
```

## 📄 License

This project is part of the Eczema Care Application Final Year Project.

---

**Happy Coding! 🚀**

For more information about Expo, visit: https://docs.expo.dev/

