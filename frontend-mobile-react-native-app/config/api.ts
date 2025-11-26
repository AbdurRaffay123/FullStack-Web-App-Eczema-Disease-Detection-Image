/**
 * API Configuration for Mobile App
 * This file centralizes all backend API endpoints and configuration
 */

// Get API base URL from environment variables or use default
const getApiBaseUrl = (): string => {
  // For Expo, use Constants.expoConfig.extra or process.env
  // In production, set EXPO_PUBLIC_API_URL in your .env file
  return process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.34:3000/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    REGISTER: '/auth/signup', // Alias for SIGNUP
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  
  // User Management
  USER: {
    PROFILE: '/users/me',
    UPDATE: '/users/update-profile',
    PASSWORD: '/users/update-password',
    DELETE: '/users/delete-account',
  },
  
  // Eczema Care Features
  SYMPTOMS: {
    LIST: '/logs',
    CREATE: '/logs',
    GET: '/logs/:id',
    UPDATE: '/logs/:id',
    DELETE: '/logs/:id',
    STATS: '/logs/stats',
  },
  
  IMAGES: {
    UPLOAD: '/images/upload',
    LIST: '/images',
    DELETE: '/images/:id',
    ANALYZE: '/images/analyze',
  },
  
  REMINDERS: {
    LIST: '/reminders',
    CREATE: '/reminders',
    GET: '/reminders/:id',
    UPDATE: '/reminders/:id',
    DELETE: '/reminders/:id',
  },
  
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
  },
  
  CONSULTATIONS: {
    LIST: '/consultations',
    CREATE: '/consultations',
    GET: '/consultations/:id',
    DELETE: '/consultations/:id',
  },
  
  PROGRESS: {
    STATS: '/progress/stats',
    CHARTS: '/progress/charts',
    EXPORT: '/progress/export',
  },
  
  TIPS: {
    LIST: '/tips',
    CATEGORIES: '/tips/categories',
  },
} as const;

// Helper function to build full URL
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};


