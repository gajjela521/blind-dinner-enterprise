// Core Type Definitions for Blind Dinner Enterprise
export interface AppConfig {
  API_BASE_URL: string;
  WEBSOCKET_URL: string;
  STRIPE_PUBLIC_KEY: string;
  GOOGLE_MAPS_API_KEY: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  city: string;
  country: string;
  location: string;
  token?: string;
  verified?: boolean;
  premium?: boolean;
  lastActive?: Date;
  joinedAt?: Date;
}

export interface Match extends User {
  compatibility: number;
  distance?: number;
  commonInterests: string[];
  matchedAt: Date;
  status: 'pending' | 'liked' | 'passed' | 'mutual';
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  city: string;
  country: string;
  location: string;
  coordinates: Coordinates;
  image: string;
  ambiance: string;
  priceRange: string;
  availableSlots: string[];
  distance?: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
}
