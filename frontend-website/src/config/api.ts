/**
 * API Configuration for Website
 * This file centralizes all backend API endpoints and configuration
 * Should match the mobile app's API configuration for consistency
 */

// Get API base URL from environment variables or use default
const getApiBaseUrl = (): string => {
  // For Vite, use import.meta.env.VITE_API_URL
  // In production, set VITE_API_URL in your .env file
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// API Endpoints - MUST MATCH MOBILE APP ENDPOINTS
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
    UPDATE: '/consultations/:id',
    CANCEL: '/consultations/:id/cancel',
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


