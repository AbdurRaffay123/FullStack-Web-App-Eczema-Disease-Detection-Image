# React Native Mobile App - Comprehensive Documentation

## 📱 Overview

This document provides an in-depth overview of the React Native mobile application implementation for the Eczema Care Management System. The app is built using **Expo** framework and provides a native mobile experience for iOS and Android platforms.

**Status**: Implementation Complete - **NOT YET TESTED**

---

## 🛠 Technology Stack & SDKs

### Core Framework
- **Expo SDK**: `^54.0.23`
  - Expo Router for file-based navigation
  - Expo managed workflow
  - Cross-platform compatibility (iOS, Android, Web)

### React & React Native
- **React**: `19.1.0`
- **React Native**: `0.81.5`
- **React DOM**: `19.1.0` (for web support)
- **TypeScript**: `~5.9.2` (Full TypeScript support)

### Navigation
- **Expo Router**: `~6.0.14` (File-based routing system)
- **React Navigation**: `^7.0.14` (Underlying navigation library)
- **React Navigation Bottom Tabs**: `^7.2.0` (Tab navigation)

### UI & Styling
- **React Native StyleSheet** (Native styling)
- **Expo Linear Gradient**: `~15.0.7` (Gradient backgrounds)
- **Expo Blur**: `~15.0.7` (Blur effects)
- **Lucide React Native**: `^0.475.0` (Icon library)
- **@expo/vector-icons**: `^15.0.3` (Additional icons)
- **@expo-google-fonts/open-sans**: `^0.2.3` (Custom fonts)

### Notifications & Alarms
- **Expo Notifications**: `~0.28.19`
  - Local push notifications
  - Background notifications
  - Scheduled notifications
  - Notification permissions handling
  - Sound and badge support

### Secure Storage
- **Expo Secure Store**: `~14.0.0`
  - Secure token storage
  - User data encryption
  - Keychain (iOS) / Keystore (Android) integration

### Media & Camera
- **Expo Camera**: `~17.0.9` (Camera access for image capture)
- **Expo Image Picker**: `~17.0.8` (Image selection from gallery)

### Utilities
- **Expo Constants**: `~18.0.10` (App constants and configuration)
- **Expo Haptics**: `~15.0.7` (Haptic feedback)
- **Expo Linking**: `~8.0.8` (Deep linking support)
- **Expo Status Bar**: `~3.0.8` (Status bar control)
- **Expo Splash Screen**: `~31.0.10` (Splash screen management)
- **Expo System UI**: `~6.0.8` (System UI controls)
- **Expo Web Browser**: `~15.0.9` (In-app browser)

### Additional Libraries
- **React Native Gesture Handler**: `~2.28.0` (Gesture recognition)
- **React Native Reanimated**: `~4.1.1` (Advanced animations)
- **React Native Safe Area Context**: `~5.6.0` (Safe area handling)
- **React Native Screens**: `~4.16.0` (Native screen components)
- **React Native SVG**: `15.12.1` (SVG support)
- **React Native Web**: `^0.21.0` (Web platform support)
- **React Native WebView**: `13.15.0` (WebView component)
- **React Native Worklets Core**: `^1.6.2` (Worklet support)
- **React Native URL Polyfill**: `^2.0.0` (URL polyfill)
- **@react-native-community/slider**: `5.0.1` (Slider component)

### Development Tools
- **Babel Core**: `^7.25.2` (JavaScript compiler)
- **Cross-env**: `^10.1.0` (Cross-platform environment variables)
- **ESLint** (via Expo lint)

---

## 📁 Project Structure

```
frontend-mobile-react-native-app/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout with navigation setup
│   ├── (tabs)/                  # Tab navigation group
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   ├── index.tsx            # Home tab
│   │   ├── logs.tsx             # Symptom logs tab
│   │   ├── ai.tsx                # AI scan tab
│   │   └── profile.tsx           # Profile tab
│   ├── auth.tsx                  # Authentication screen
│   ├── consult.tsx               # Consultation screen
│   ├── progress.tsx               # Progress tracking screen
│   ├── reminders.tsx             # Reminders screen (CRUD)
│   ├── notifications.tsx        # Notifications screen
│   ├── tips.tsx                  # Tips & advice screen
│   ├── index.tsx                  # Initial route handler
│   └── +not-found.tsx            # 404 page
├── assets/
│   └── images/
│       ├── icon.png              # App icon
│       └── favicon.png           # Web favicon
├── config/
│   └── api.ts                    # API configuration & endpoints
├── hooks/
│   └── useFrameworkReady.ts     # Framework initialization hook
├── services/                     # API service layer
│   ├── authService.ts            # Authentication service
│   ├── reminderService.ts        # Reminders service
│   ├── symptomService.ts         # Symptom logs service
│   └── userService.ts            # User profile service
├── utils/                        # Utility functions
│   ├── apiClient.ts              # HTTP client wrapper
│   ├── notificationScheduler.ts  # Local notification scheduling
│   └── reminderSync.ts           # Reminder sync logic
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript configuration
```

---

## ✨ Features Implemented

### 1. Authentication System
- **Sign Up**: User registration with email, password, and name
- **Login**: Email/password authentication
- **Secure Token Storage**: JWT tokens stored in Expo SecureStore
- **User Session Management**: Automatic token retrieval for API calls
- **Logout**: Secure token and user data cleanup

**Files**: `app/auth.tsx`, `services/authService.ts`

### 2. Reminders Module (Full CRUD)
- **Create Reminders**: 
  - Title, type (medication/appointment/custom)
  - Time selection
  - Day selection (Mon-Sun, Daily, Weekdays, Weekends)
  - Custom message/notes
  - Automatic local notification scheduling
- **Read Reminders**: 
  - List all user reminders
  - View reminder details
  - Filter by active/inactive status
- **Update Reminders**: 
  - Edit all reminder fields
  - Toggle active/inactive status
  - Automatic notification rescheduling
- **Delete Reminders**: 
  - Delete with confirmation
  - Automatic notification cancellation
- **Local Notification Scheduling**: 
  - Schedules local alarms when reminders are created/updated
  - Handles recurring reminders (daily, specific days)
  - Cancels notifications when reminders are deleted/deactivated

**Files**: `app/reminders.tsx`, `services/reminderService.ts`, `utils/notificationScheduler.ts`

### 3. Notifications System
- **Notification List**: View all reminder-triggered notifications
- **Mark as Read**: Individual notification read status
- **Mark All as Read**: Bulk read status update
- **Unread Counter**: Badge showing unread count
- **Notification Details**: Title, message, trigger time
- **Backend Sync**: Fetches notifications from backend API

**Files**: `app/notifications.tsx`, `services/reminderService.ts`

### 4. Symptom Logging
- **Create Logs**: Record itchiness level, affected area, triggers, notes
- **View Logs**: List all symptom logs
- **Update Logs**: Edit existing logs
- **Delete Logs**: Remove logs

**Files**: `services/symptomService.ts` (Service ready, UI screens need implementation)

### 5. User Profile Management
- **View Profile**: Display user information
- **Update Profile**: Edit name, phone, date of birth
- **Change Password**: Update password with old password verification
- **Delete Account**: Account deletion

**Files**: `services/userService.ts`, `app/(tabs)/profile.tsx` (Service ready)

### 6. Navigation System
- **Tab Navigation**: Bottom tab bar with 4 tabs (Home, Logs, AI Scan, Profile)
- **Stack Navigation**: Screen-to-screen navigation
- **Deep Linking**: Support for deep links (configured)
- **Route Protection**: Authentication-based routing (needs implementation)

**Files**: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`

### 7. Background Notifications
- **Local Notifications**: Scheduled using expo-notifications
- **Background Execution**: Notifications work when app is closed
- **Sound & Badge**: Audio alerts and badge updates
- **Notification Permissions**: Automatic permission requests
- **Notification Handlers**: Foreground and background handlers configured

**Files**: `utils/notificationScheduler.ts`, `app/_layout.tsx`

---

## 🔧 Services & Utilities

### API Client (`utils/apiClient.ts`)
- Centralized HTTP client
- Automatic token injection
- Request timeout handling (30 seconds)
- Error handling and response parsing
- Support for GET, POST, PUT, DELETE, PATCH methods

### Authentication Service (`services/authService.ts`)
- **Methods**:
  - `signup(data)`: User registration
  - `login(data)`: User authentication
  - `getToken()`: Retrieve stored JWT token
  - `getUser()`: Get stored user data
  - `logout()`: Clear stored data
  - `isAuthenticated()`: Check auth status
- **Storage**: Uses Expo SecureStore for secure token storage

### Reminder Service (`services/reminderService.ts`)
- **Methods**:
  - `createReminder(data)`: Create new reminder
  - `getReminders()`: Fetch all reminders
  - `getReminderById(id)`: Get single reminder
  - `updateReminder(id, data)`: Update reminder
  - `deleteReminder(id)`: Delete reminder
  - `getNotifications(options)`: Fetch notifications
  - `markAsRead(id)`: Mark notification as read
  - `markAllAsRead()`: Mark all as read
- **Interfaces**: Full TypeScript interfaces for Reminder, Notification, CreateReminderData, UpdateReminderData

### Symptom Service (`services/symptomService.ts`)
- **Methods**:
  - `createLog(data)`: Create symptom log
  - `getLogs()`: Fetch all logs
  - `getLogById(id)`: Get single log
  - `updateLog(id, data)`: Update log
  - `deleteLog(id)`: Delete log
- **Interfaces**: SymptomLog, CreateLogData, UpdateLogData

### User Service (`services/userService.ts`)
- **Methods**:
  - `getProfile()`: Get user profile
  - `updateProfile(data)`: Update profile
  - `updatePassword(data)`: Change password
  - `deleteAccount()`: Delete account
- **Interfaces**: UserProfile, UpdateProfileData, UpdatePasswordData

### Notification Scheduler (`utils/notificationScheduler.ts`)
- **Functions**:
  - `requestNotificationPermissions()`: Request notification permissions
  - `scheduleReminderNotification(reminder)`: Schedule single notification
  - `scheduleRecurringReminderNotifications(reminder)`: Schedule recurring notifications
  - `cancelNotification(notificationId)`: Cancel specific notification
  - `cancelReminderNotifications(reminderId)`: Cancel all notifications for a reminder
  - `getScheduledNotifications()`: Get all scheduled notifications
  - `cancelAllNotifications()`: Cancel all notifications
- **Features**:
  - Handles daily reminders (schedules for next 7 days)
  - Handles specific day reminders (calculates next occurrence)
  - Automatic time calculation
  - Notification content customization

### Reminder Sync (`utils/reminderSync.ts`)
- **Functions**:
  - `syncReminders()`: Sync reminders from backend and reconcile local notifications
  - `forceSyncReminders()`: Force refresh all reminders and notifications
- **Logic**:
  - Fetches reminders from backend
  - Compares with local scheduled notifications
  - Cancels notifications for deleted/inactive reminders
  - Schedules notifications for new/active reminders
  - Prevents duplicate notifications

### API Configuration (`config/api.ts`)
- **Base URL**: Configurable via `EXPO_PUBLIC_API_URL` environment variable
- **Default**: `http://localhost:3000/api`
- **Endpoints**: Centralized endpoint definitions for:
  - Authentication (login, signup, logout, refresh, profile)
  - User management (profile, update, password, delete)
  - Symptoms (list, create, get, update, delete, stats)
  - Images (upload, list, delete, analyze)
  - Reminders (list, create, get, update, delete)
  - Notifications (list, mark read, mark all read)
  - Consultations (list, create, update, cancel)
  - Progress (stats, charts, export)
  - Tips (list, categories)
- **Helper**: `buildApiUrl()` function for URL construction with parameters

---

## 📱 Screens/Pages

### 1. Authentication Screen (`app/auth.tsx`)
- **Features**:
  - Toggle between Login and Sign Up
  - Email validation
  - Password strength requirements
  - Password confirmation (sign up)
  - Show/hide password toggle
  - Form validation with error messages
  - Loading states
  - Beautiful gradient UI
- **Status**: ✅ Fully Implemented

### 2. Reminders Screen (`app/reminders.tsx`)
- **Features**:
  - Add/Edit reminder form
  - Reminder type selection (medication, appointment, custom)
  - Time input
  - Day selection (Mon-Sun, Daily)
  - Custom message/notes
  - List of all reminders
  - Active/Inactive toggle switch
  - Edit and Delete actions
  - Empty state
  - Loading states
  - Automatic notification scheduling on create/update
  - Notification cancellation on delete/deactivate
- **Status**: ✅ Fully Implemented

### 3. Notifications Screen (`app/notifications.tsx`)
- **Features**:
  - List of all notifications
  - Unread badge counter
  - Mark individual as read
  - Mark all as read button
  - Notification details (title, message, time)
  - Unread indicator (red dot)
  - Empty state
  - Loading states
- **Status**: ✅ Fully Implemented

### 4. Tab Screens (`app/(tabs)/`)
- **Home** (`index.tsx`): Dashboard/home screen
- **Logs** (`logs.tsx`): Symptom logging interface
- **AI Scan** (`ai.tsx`): AI-powered image analysis
- **Profile** (`profile.tsx`): User profile management
- **Status**: ⚠️ UI Structure exists, needs full implementation

### 5. Additional Screens
- **Consult** (`app/consult.tsx`): Consultation booking
- **Progress** (`app/progress.tsx`): Progress tracking and analytics
- **Tips** (`app/tips.tsx`): Skincare tips and advice
- **Status**: ⚠️ Routes exist, needs implementation

---

## ⚙️ Configuration

### Expo Configuration (`app.json`)
- **App Name**: "bolt-expo-nativewind"
- **Version**: 1.0.0
- **Orientation**: Portrait
- **New Architecture**: Enabled
- **iOS Configuration**:
  - Supports tablet
  - Background modes: `remote-notification`
- **Android Configuration**:
  - Permissions:
    - `RECEIVE_BOOT_COMPLETED` (for notifications after reboot)
    - `VIBRATE` (for notification vibration)
    - `SCHEDULE_EXACT_ALARM` (for precise alarm scheduling)
- **Plugins**:
  - `expo-router`: File-based routing
  - `expo-font`: Custom fonts
  - `expo-web-browser`: In-app browser
  - `expo-notifications`: Notification support with custom icon and color

### TypeScript Configuration (`tsconfig.json`)
- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` maps to root directory
- **Includes**: All `.ts` and `.tsx` files

### Environment Variables
- **EXPO_PUBLIC_API_URL**: Backend API base URL (default: `http://localhost:3000/api`)

---

## 🔔 Notification System Details

### Background Notifications
- **Platform Support**: iOS and Android
- **Background Modes**: Configured for remote notifications
- **Permissions**: Automatic request on first use
- **Scheduling**: Supports one-time and recurring notifications
- **Sound**: Enabled by default
- **Badge**: Updates app badge count
- **Data Payload**: Includes reminder ID and type for navigation

### Notification Flow
1. User creates/updates reminder
2. App schedules local notification(s) using `expo-notifications`
3. Notification triggers at scheduled time (even if app is closed)
4. Backend scheduler also creates notification record
5. Mobile app syncs with backend to show notification history
6. User can view notifications in Notifications screen

### Notification Permissions
- **iOS**: Requires user permission (requested automatically)
- **Android**: Requires notification channel setup (handled by Expo)
- **Handling**: `requestNotificationPermissions()` function

---

## 🔐 Security Features

### Secure Storage
- **Library**: Expo SecureStore
- **Storage Items**:
  - JWT Token (`eczema_token`)
  - User Data (`eczema_user`)
- **Platform Implementation**:
  - iOS: Keychain Services
  - Android: EncryptedSharedPreferences
- **Benefits**:
  - Encrypted at rest
  - Protected by device security
  - Automatically cleared on logout

### Authentication
- **Token-based**: JWT tokens
- **Automatic Injection**: Token added to all API requests
- **Token Validation**: Backend validates tokens
- **Session Management**: Token stored securely, retrieved automatically

---

## 📊 API Integration

### API Client Features
- **Base URL**: Configurable via environment variable
- **Timeout**: 30 seconds default
- **Headers**: 
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer <token>` (when authenticated)
- **Error Handling**: Comprehensive error messages
- **Response Parsing**: Automatic JSON parsing

### API Endpoints Used
- ✅ Authentication: `/auth/login`, `/auth/signup`
- ✅ Reminders: `/reminders` (CRUD operations)
- ✅ Notifications: `/notifications` (list, mark read)
- ⚠️ Symptoms: `/logs` (service ready, UI pending)
- ⚠️ User: `/users/me`, `/users/update-profile` (service ready, UI pending)
- ⚠️ Images: `/images/*` (not implemented)
- ⚠️ Consultations: `/consultations/*` (not implemented)
- ⚠️ Progress: `/progress/*` (not implemented)
- ⚠️ Tips: `/tips/*` (not implemented)

---

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Dark theme with gradient backgrounds
- **Primary Color**: `#6A9FB5` (Teal/Blue)
- **Gradients**: Linear gradients for backgrounds
- **Typography**: Open Sans font family (Regular, SemiBold, Bold)
- **Icons**: Lucide React Native icon library

### Components Used
- **SafeAreaView**: Handles device safe areas
- **ScrollView**: Scrollable content
- **TouchableOpacity**: Touch interactions
- **TextInput**: Form inputs
- **Switch**: Toggle switches
- **ActivityIndicator**: Loading indicators
- **LinearGradient**: Gradient backgrounds
- **Alert**: Native alert dialogs

### User Experience
- **Loading States**: Activity indicators during API calls
- **Error Handling**: Alert dialogs for errors
- **Success Feedback**: Alert dialogs for successful operations
- **Empty States**: Helpful messages when no data
- **Form Validation**: Real-time validation with error messages
- **Confirmation Dialogs**: Delete confirmations

---

## 🧪 Testing Status

### ✅ Implemented & Ready for Testing
1. **Authentication Flow**
   - Sign up
   - Login
   - Token storage
   - Logout

2. **Reminders Module**
   - Full CRUD operations
   - Local notification scheduling
   - Notification cancellation
   - Active/inactive toggle

3. **Notifications Module**
   - List notifications
   - Mark as read
   - Mark all as read
   - Unread counter

4. **API Integration**
   - All service methods implemented
   - Error handling
   - Token management

### ⚠️ Needs Testing
- **Background Notifications**: Verify notifications work when app is closed
- **Notification Permissions**: Test permission flow on iOS and Android
- **Reminder Sync**: Test sync logic on app start
- **Token Refresh**: Test token expiration handling
- **Network Errors**: Test offline/error scenarios
- **Deep Linking**: Test deep link navigation

### ❌ Not Implemented (UI Only)
- Symptom Logging UI (service ready)
- User Profile UI (service ready)
- AI Scan functionality
- Progress tracking UI
- Tips screen UI
- Consultation booking UI

---

## 🐛 Known Issues & TODOs

### Issues
1. **API Client Token Retrieval**: Currently returns `null` in `apiClient.ts` (line 27). Should use `authService.getToken()`
2. **Route Protection**: No authentication guard implemented for protected routes
3. **Token Refresh**: No automatic token refresh mechanism
4. **Offline Support**: No offline data caching
5. **Error Recovery**: Limited error recovery mechanisms

### TODOs
1. **Complete UI Screens**:
   - Symptom logging interface
   - User profile screen
   - Progress tracking screen
   - Tips screen
   - AI scan interface

2. **Enhancements**:
   - Implement route protection
   - Add token refresh logic
   - Add offline support
   - Implement push notifications (FCM/APNS)
   - Add image upload functionality
   - Add consultation booking

3. **Testing**:
   - Unit tests for services
   - Integration tests for API calls
   - E2E tests for critical flows
   - Device testing (iOS and Android)

4. **Performance**:
   - Optimize image loading
   - Implement caching
   - Reduce bundle size

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS testing) or Android Emulator (for Android testing)
- Physical device (recommended for notification testing)

### Installation
```bash
cd frontend-mobile-react-native-app
npm install
```

### Environment Setup
Create a `.env` file in the root directory:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Running the App
```bash
# Start Expo development server
npm run dev

# Or using Expo CLI
expo start
```

### Platform-Specific Commands
```bash
# iOS
expo start --ios

# Android
expo start --android

# Web
expo start --web
```

### Building for Production
```bash
# Build for web
npm run build:web

# Build for iOS (requires Apple Developer account)
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## 📝 Important Notes

### Notification Testing
- **Physical Device Required**: Background notifications may not work properly in simulators/emulators
- **Permissions**: First launch will request notification permissions
- **Background Mode**: Ensure app has background notification permissions enabled

### API Connection
- **Development**: Uses `http://localhost:3000/api` by default
- **Physical Device**: Change to your computer's IP address (e.g., `http://192.168.1.100:3000/api`)
- **Production**: Update `EXPO_PUBLIC_API_URL` to production API URL

### Secure Storage
- **iOS**: Uses Keychain (requires device or simulator with Keychain access)
- **Android**: Uses EncryptedSharedPreferences
- **Testing**: Tokens persist between app restarts

### TypeScript
- **Strict Mode**: Enabled for type safety
- **Path Aliases**: Use `@/` prefix for imports from root
- **Type Definitions**: All services have full TypeScript interfaces

---

## 🔗 Related Documentation

- **Backend API**: See backend documentation for API endpoints
- **Website Frontend**: See frontend-website for web implementation
- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/

---

## 📞 Support & Maintenance

### Key Files to Modify
- **API Configuration**: `config/api.ts`
- **API Client**: `utils/apiClient.ts`
- **Services**: `services/*.ts`
- **Screens**: `app/*.tsx`
- **Navigation**: `app/_layout.tsx`

### Common Tasks
- **Add New API Endpoint**: Add to `config/api.ts`, create service method
- **Add New Screen**: Create file in `app/` directory
- **Modify Navigation**: Update `app/_layout.tsx` or tab layout
- **Change Theme**: Modify color constants in screen files

---

**Last Updated**: Current Date
**Version**: 1.0.0
**Status**: Implementation Complete - Ready for Testing

