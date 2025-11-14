# API Configuration Guide

This document explains how both frontend projects (mobile app and website) are configured to work with a single backend API without conflicts.

## 📁 Structure

Both projects have identical API configuration structures:

- **Mobile App**: `frontend-mobile-react-native-app/config/api.ts`
- **Website**: `frontend-website/src/config/api.ts`

Both projects use the same:
- API endpoint definitions
- Request/response interfaces
- Error handling patterns

## 🔧 Environment Variables

### Mobile App (Expo)
Create a `.env` file in `frontend-mobile-react-native-app/`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Website (Vite)
Create a `.env` file in `frontend-website/`:
```env
VITE_API_URL=http://localhost:3000/api
```

**Important**: Both should point to the same backend URL!

## 📡 API Endpoints

All endpoints are defined in `API_ENDPOINTS` constant and are identical in both projects:

- **Authentication**: `/auth/login`, `/auth/register`, etc.
- **User Management**: `/users/profile`, `/users/update`, etc.
- **Symptoms**: `/symptoms`, `/symptoms/stats`, etc.
- **Images**: `/images/upload`, `/images/analyze`, etc.
- **Reminders**: `/reminders`, etc.
- **Consultations**: `/consultations`, etc.
- **Progress**: `/progress/stats`, etc.
- **Tips**: `/tips`, etc.

## 🚀 Usage

### Mobile App Example
```typescript
import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

// Login
const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
  email: 'user@example.com',
  password: 'password123'
});

// Get symptoms
const symptoms = await apiClient.get(API_ENDPOINTS.SYMPTOMS.LIST);
```

### Website Example
```typescript
import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api';

// Login
const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
  email: 'user@example.com',
  password: 'password123'
});

// Get symptoms
const symptoms = await apiClient.get(API_ENDPOINTS.SYMPTOMS.LIST);
```

## ✅ Benefits

1. **No Conflicts**: Both projects use the same endpoint definitions
2. **Easy Updates**: Change endpoints in one place, update both files
3. **Type Safety**: TypeScript ensures consistency
4. **Centralized**: All API logic is in one place per project

## 🔄 Backend Requirements

Your backend should:
1. Support CORS for web requests
2. Accept JSON in request bodies
3. Return JSON responses
4. Use Bearer token authentication (JWT recommended)
5. Follow RESTful conventions

## 📝 Notes

- Both API clients handle authentication tokens automatically
- Error handling is consistent across both platforms
- Timeout is set to 30 seconds by default
- All requests include proper headers

## 🔐 Security

- Never commit `.env` files (already in `.gitignore`)
- Use environment variables for different environments (dev, staging, prod)
- Store auth tokens securely:
  - Mobile: Use `expo-secure-store` (to be implemented)
  - Website: Consider httpOnly cookies for better security


