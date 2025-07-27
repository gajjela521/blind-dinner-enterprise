export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile'
  },
  MATCHES: {
    GET: '/matches',
    LIKE: (id: string) => `/matches/${id}/like`,
    PASS: (id: string) => `/matches/${id}/pass`
  },
  RESTAURANTS: {
    SEARCH: '/restaurants/search',
    BOOK: '/bookings'
  }
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;
