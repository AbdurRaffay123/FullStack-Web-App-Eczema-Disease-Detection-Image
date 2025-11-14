# EczemaCare - Skin Disease Management Application

A comprehensive full-stack application for managing eczema symptoms, tracking progress, and providing health insights.

## Project Structure

```
Junaid-Skin-Disease-Image-FYP/
├── backend/                    # Node.js/Express backend API
├── frontend-website/           # React + Vite website
└── frontend-mobile-react-native-app/  # React Native mobile app (Expo)
```

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Expo CLI** (for mobile app development)

## Getting Started

### 1. Backend Server

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/eczema-care
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
MOBILE_URL=http://localhost:8080
```

4. Start the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:3000`

### 2. Frontend Website

1. Navigate to the frontend-website directory:
```bash
cd frontend-website
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend-website/` directory:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The website will run on `http://localhost:5173`

### 3. Mobile App (React Native with Expo)

1. Navigate to the mobile app directory:
```bash
cd frontend-mobile-react-native-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend-mobile-react-native-app/` directory:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

4. Start the Expo development server:
```bash
npm run dev
```

This will:
- Start the Expo development server
- Display a QR code in the terminal
- Open the Expo DevTools in your browser

**To run on a device:**
- **iOS**: Scan the QR code with the Camera app (requires Expo Go app)
- **Android**: Scan the QR code with the Expo Go app
- **Web**: Press `w` in the terminal to open in web browser
- **iOS Simulator**: Press `i` in the terminal (requires Xcode)
- **Android Emulator**: Press `a` in the terminal (requires Android Studio)

## Quick Start (All Servers)

To start all three servers, open three separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Website:**
```bash
cd frontend-website && npm run dev
```

**Terminal 3 - Mobile App:**
```bash
cd frontend-mobile-react-native-app && npm run dev
```

## API Endpoints

The backend API is available at `http://localhost:3000/api`

### Main Endpoints:
- **Authentication**: `/api/auth/login`, `/api/auth/signup`
- **User Management**: `/api/users/me`, `/api/users/update-profile`
- **Symptom Logs**: `/api/logs` (GET, POST, PUT, DELETE)

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 3000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `JWT_EXPIRES_IN` - Token expiration time (default: 7d)
- `FRONTEND_URL` - Website URL for CORS
- `MOBILE_URL` - Mobile app URL for CORS

### Frontend Website (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000/api)

### Mobile App (.env)
- `EXPO_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000/api)

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs

### Frontend Website
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Mobile App
- React Native
- Expo
- TypeScript
- Expo Router

## Development

- Backend uses `nodemon` for auto-reload during development
- Frontend website uses Vite's HMR (Hot Module Replacement)
- Mobile app uses Expo's Fast Refresh

## License

ISC

