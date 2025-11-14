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
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  
  // User Management
  USER: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    PASSWORD: '/users/password',
  },
  
  // Eczema Care Features
  SYMPTOMS: {
    LIST: '/symptoms',
    CREATE: '/symptoms',
    UPDATE: '/symptoms/:id',
    DELETE: '/symptoms/:id',
    STATS: '/symptoms/stats',
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
    UPDATE: '/reminders/:id',
    DELETE: '/reminders/:id',
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


