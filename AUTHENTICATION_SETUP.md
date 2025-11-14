# Complete Authentication Setup Guide

This guide covers the complete MongoDB + JWT authentication system for both frontend applications.

## 📋 Table of Contents

1. [Backend Setup](#backend-setup)
2. [Frontend Website Setup](#frontend-website-setup)
3. [Frontend Mobile App Setup](#frontend-mobile-app-setup)
4. [Testing](#testing)
5. [API Endpoints](#api-endpoints)

---

## 🔧 Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/eczema-care
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/eczema-care

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration (Optional)
FRONTEND_URL=http://localhost:5173
MOBILE_URL=http://localhost:8080
```

**Important**: 
- Replace `MONGO_URI` with your MongoDB connection string
- Change `JWT_SECRET` to a strong, random string in production

### Step 3: Start MongoDB

**Local MongoDB:**
```bash
# Make sure MongoDB is running
mongod
```

**MongoDB Atlas:**
- Use the connection string from your Atlas dashboard
- Format: `mongodb+srv://username:password@cluster.mongodb.net/eczema-care`

### Step 4: Start Backend Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3000`

---

## 🌐 Frontend Website Setup

### Step 1: Install Dependencies

```bash
cd frontend-website
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `frontend-website/` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### Step 3: Start Development Server

```bash
npm run dev
```

Website will start on `http://localhost:5173`

### Step 4: Usage in Components

The authentication is already integrated into:
- `src/pages/Login.tsx` - Login page
- `src/pages/SignUp.tsx` - Signup page
- `src/context/AuthContext.tsx` - Auth context provider

**Example Usage:**

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, signup, logout, isLoading } = useAuth();

  const handleLogin = async () => {
    const success = await login('user@example.com', 'password123');
    if (success) {
      // Navigate to dashboard
    }
  };

  return (
    <div>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

---

## 📱 Frontend Mobile App Setup

### Step 1: Install Dependencies

```bash
cd frontend-mobile-react-native-app
npm install
```

**Note**: `expo-secure-store` is already added to `package.json`

### Step 2: Configure Environment Variables

Create a `.env` file in the `frontend-mobile-react-native-app/` directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

**For physical device testing**, use your computer's IP address:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

### Step 3: Start Expo Development Server

```bash
npm run dev
```

### Step 4: Usage

The authentication is already integrated into:
- `app/auth.tsx` - Login/Signup screen

**Example Usage:**

```typescript
import { authService } from '../services/authService';

// Signup
const result = await authService.signup({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Login
const result = await authService.login({
  email: 'john@example.com',
  password: 'password123'
});

// Check authentication
const isAuth = await authService.isAuthenticated();

// Get current user
const user = await authService.getUser();

// Logout
await authService.logout();
```

---

## 🧪 Testing

### Test Signup

**Website:**
1. Navigate to `http://localhost:5173/signup`
2. Fill in name, email, and password
3. Submit form
4. Should redirect to dashboard on success

**Mobile App:**
1. Open app and navigate to auth screen
2. Fill in signup form
3. Submit
4. Should show success alert

### Test Login

**Website:**
1. Navigate to `http://localhost:5173/login`
2. Enter email and password
3. Submit
4. Should redirect to dashboard

**Mobile App:**
1. Switch to login mode on auth screen
2. Enter credentials
3. Submit
4. Should navigate to tabs

### Test Protected Routes

Both frontends should:
- Store token securely
- Include token in Authorization header for API calls
- Redirect to login if token is invalid/expired

---

## 📡 API Endpoints

### POST `/api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### GET `/api/auth/profile` (Protected)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 🔐 Security Features

### Backend
- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens with expiration
- ✅ CORS configured for both frontends
- ✅ Input validation
- ✅ Error handling middleware

### Frontend Website
- ✅ Token stored in localStorage
- ✅ User data stored in localStorage
- ✅ Automatic token inclusion in API requests

### Frontend Mobile
- ✅ Token stored in SecureStore (encrypted)
- ✅ User data stored in SecureStore
- ✅ Secure token management

---

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Use MongoDB Atlas or managed MongoDB
4. Configure CORS with production URLs
5. Use environment variables for all secrets

### Frontend Website
1. Set `VITE_API_URL` to production API URL
2. Build: `npm run build`
3. Deploy `dist/` folder

### Frontend Mobile
1. Set `EXPO_PUBLIC_API_URL` to production API URL
2. Build: `expo build` or `eas build`
3. Deploy to app stores

---

## 📝 Notes

- Both frontends use the same backend API
- Token format: `Bearer <token>` in Authorization header
- Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
- All API responses follow consistent format: `{ success, message, data }`
- Error responses include appropriate HTTP status codes

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running
- Verify `MONGO_URI` in `.env`
- Check network connectivity for Atlas

### CORS Errors
- Verify CORS configuration in `backend/src/middleware/cors.middleware.js`
- Check frontend URLs match allowed origins
- Ensure credentials are enabled

### Token Issues
- Verify `JWT_SECRET` is set
- Check token expiration
- Ensure token is included in Authorization header

### Frontend Connection Issues
- Verify `VITE_API_URL` or `EXPO_PUBLIC_API_URL` is correct
- Check backend is running
- For mobile on physical device, use computer's IP address

---

## ✅ Checklist

- [ ] MongoDB installed/running
- [ ] Backend `.env` configured
- [ ] Backend dependencies installed
- [ ] Backend server running
- [ ] Website `.env` configured
- [ ] Website dependencies installed
- [ ] Mobile app `.env` configured
- [ ] Mobile app dependencies installed
- [ ] Test signup on both frontends
- [ ] Test login on both frontends
- [ ] Verify tokens are stored securely

