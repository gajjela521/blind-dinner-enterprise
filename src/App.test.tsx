import React, { useState, useEffect, useContext, createContext, useCallback, useRef, ReactNode } from 'react';
import { Heart, MapPin, Clock, Star, User, Calendar, Check, ArrowLeft, Users, Bell, MessageCircle, Settings, CreditCard, Shield, Zap, Globe, Phone, Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// ========================= TYPE DEFINITIONS =========================

// Base Types
interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  city: string;
  country: string;
  coordinates?: Coordinates;
}

// User Types
interface User {
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
  
  // Social Media
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  
  // Profile Data
  hobbies: string[];
  lifestyle: string[];
  diningStyle: string[];
  personality: string[];
  interests: string[];
  communicationStyle: string[];
  values: string[];
  lifeGoals: string[];
  idealWeekend: string[];
  exercisePreference: string[];
  musicTaste: string[];
  pets: string[];
  smokingDrinking: string[];
  politicalViews: string[];
  religiousViews: string[];
  relationshipGoals: string[];
  idealDateType: string[];
  loveLanguage: string[];
  dealBreakers: string[];
  dreamDestinations: string[];
  honeymoonDream: string[];
  futureDreams: string[];
  livingPreference: string[];
  
  // Metadata
  verified?: boolean;
  premium?: boolean;
  lastActive?: Date;
  joinedAt?: Date;
}

interface UserRegistration extends Omit<User, 'id' | 'name' | 'location' | 'token'> {
  password: string;
  confirmPassword: string;
}

interface UserLogin {
  email: string;
  password: string;
}

// Match Types
interface Match extends User {
  compatibility: number;
  distance?: number;
  commonInterests: string[];
  matchedAt: Date;
  status: 'pending' | 'liked' | 'passed' | 'mutual';
}

// Restaurant Types
interface Restaurant {
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
  
  // Additional restaurant data
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  features?: string[];
  photos?: string[];
  averagePrice?: number;
  bookingFee?: number;
}

// Booking Types
interface Booking {
  id: string;
  restaurantId: string;
  restaurant: string;
  userId: string;
  matchId?: string;
  matchName?: string;
  date: string;
  time: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  location?: string;
  distance?: number;
  specialRequests?: string;
  totalAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'location' | 'restaurant' | 'system';
  timestamp: Date;
  read: boolean;
  delivered: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  details?: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// API Types
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface APIError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Service Types
interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  token?: string;
}

interface SearchFilters {
  minAge?: number;
  maxAge?: number;
  gender?: string;
  interests?: string[];
  location?: string;
  radius?: number;
}

// Context Types
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (userData: UserRegistration) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<AuthResult>;
  loading: boolean;
  isAuthenticated: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  notify: NotificationService;
}

interface RealtimeContextType {
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  onlineUsers: number;
  realtime: RealtimeService;
}

// Configuration Types
interface AppConfig {
  API_BASE_URL: string;
  WEBSOCKET_URL: string;
  STRIPE_PUBLIC_KEY: string;
  GOOGLE_MAPS_API_KEY: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  FEATURES: {
    REALTIME_MATCHING: boolean;
    LIVE_CHAT: boolean;
    VIDEO_VERIFICATION: boolean;
    PAYMENT_PROCESSING: boolean;
    RESTAURANT_INTEGRATIONS: boolean;
    PUSH_NOTIFICATIONS: boolean;
  };
}

// Component Props Types
interface ComponentProps {
  setCurrentView: (view: string) => void;
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  label?: string;
}

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

// ========================= CONFIGURATION =========================

const CONFIG: AppConfig = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://api.blinddinner.com/v1',
  WEBSOCKET_URL: process.env.REACT_APP_WEBSOCKET_URL || 'wss://realtime.blinddinner.com',
  STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_live_...',
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIza...',
  ENVIRONMENT: (process.env.REACT_APP_ENVIRONMENT as 'development' | 'staging' | 'production') || 'development',
  FEATURES: {
    REALTIME_MATCHING: true,
    LIVE_CHAT: true,
    VIDEO_VERIFICATION: true,
    PAYMENT_PROCESSING: true,
    RESTAURANT_INTEGRATIONS: true,
    PUSH_NOTIFICATIONS: true
  }
};

// ========================= SERVICES =========================

class APIService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token ? `Bearer ${this.token}` : '',
        'X-Client-Version': '2.1.0',
        'X-Request-ID': this.generateRequestId(),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new APIError(data.message || 'Request failed', response.status, data);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<APIResponse<{token: string; user: User}>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData: UserRegistration): Promise<APIResponse<{token: string; user: User}>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async refreshToken(): Promise<APIResponse<{token: string}>> {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  // User endpoints
  async getProfile(): Promise<User> {
    return this.request('/users/profile');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Matching endpoints
  async getMatches(filters: SearchFilters = {}): Promise<Match[]> {
    const params = new URLSearchParams(filters as any);
    return this.request(`/matches?${params}`);
  }

  async likeProfile(profileId: string): Promise<APIResponse> {
    return this.request(`/matches/${profileId}/like`, { method: 'POST' });
  }

  async passProfile(profileId: string): Promise<APIResponse> {
    return this.request(`/matches/${profileId}/pass`, { method: 'POST' });
  }

  // Restaurant endpoints
  async searchRestaurants(location: Coordinates, radius: number, filters: any = {}): Promise<Restaurant[]> {
    const params = new URLSearchParams({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      radius: radius.toString(),
      ...filters
    });
    return this.request(`/restaurants/search?${params}`);
  }

  async bookRestaurant(restaurantId: string, dateTime: string, partySize: number, specialRequests = ''): Promise<Booking> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        restaurantId,
        dateTime,
        partySize,
        specialRequests
      })
    });
  }

  async getBookings(): Promise<Booking[]> {
    return this.request('/bookings');
  }

  // Payment endpoints
  async createPaymentIntent(amount: number, currency = 'usd'): Promise<{clientSecret: string}> {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency })
    });
  }

  async processPayment(paymentMethodId: string, paymentIntentId: string): Promise<APIResponse> {
    return this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId, paymentIntentId })
    });
  }

  // Messaging endpoints
  async getConversations(): Promise<Conversation[]> {
    return this.request('/messages/conversations');
  }

  async sendMessage(conversationId: string, content: string, type: Message['type'] = 'text'): Promise<Message> {
    return this.request(`/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ content, type })
    });
  }

  setToken(token: string): void {
    this.token = token;
  }
}

class APIError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private subscribers = new Map<string, Set<(data: any) => void>>();

  connect(token: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${CONFIG.WEBSOCKET_URL}?token=${token}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.onEvent('connection', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onEvent(data.type, data.payload);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
        // Note: Would need token to reconnect
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);

    return () => {
      this.subscribers.get(eventType)?.delete(callback);
    };
  }

  private onEvent(eventType: string, data: any): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  send(type: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

class NotificationService {
  private notifications: Notification[] = [];
  private subscribers = new Set<(notifications: Notification[]) => void>();

  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    const id = Date.now().toString();
    const newNotification: Notification = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    this.notifySubscribers();
    
    // Auto-remove after 5 seconds for non-persistent notifications
    if (!notification.persistent) {
      setTimeout(() => this.remove(id), 5000);
    }
    
    return id;
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifySubscribers();
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifySubscribers();
    }
  }

  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.notifications));
  }

  success(message: string, options: Partial<Notification> = {}): string {
    return this.add({ type: 'success', message, ...options });
  }

  error(message: string, options: Partial<Notification> = {}): string {
    return this.add({ type: 'error', message, persistent: true, ...options });
  }

  warning(message: string, options: Partial<Notification> = {}): string {
    return this.add({ type: 'warning', message, ...options });
  }

  info(message: string, options: Partial<Notification> = {}): string {
    return this.add({ type: 'info', message, ...options });
  }
}

// ========================= CONTEXTS =========================

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// ========================= CONTEXT PROVIDERS =========================

const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const apiService = useRef(new APIService());

  useEffect(() => {
    if (token) {
      apiService.current.setToken(token);
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async (): Promise<void> => {
    try {
      const userData = await apiService.current.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await apiService.current.login(email, password);
      const { data } = response;
      
      if (data) {
        const { token: newToken, user: userData } = data;
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData, token: newToken };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const register = async (userData: UserRegistration): Promise<AuthResult> => {
    try {
      const response = await apiService.current.register(userData);
      const { data } = response;
      
      if (data) {
        const { token: newToken, user: newUser } = data;
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        setUser(newUser);
        return { success: true, user: newUser, token: newToken };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = (): void => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<AuthResult> => {
    try {
      const updatedUser = await apiService.current.updateProfile(updates);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const NotificationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationService = useRef(new NotificationService());

  useEffect(() => {
    const unsubscribe = notificationService.current.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      notify: notificationService.current
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

const RealtimeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const realtimeService = useRef(new RealtimeService());
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext?.user?.token) {
      realtimeService.current.connect(authContext.user.token);
      
      const unsubscribeConnection = realtimeService.current.subscribe('connection', (data: any) => {
        setConnectionStatus(data.status);
      });

      const unsubscribeUsers = realtimeService.current.subscribe('online_users', (data: any) => {
        setOnlineUsers(data.count);
      });

      return () => {
        unsubscribeConnection();
        unsubscribeUsers();
        realtimeService.current.disconnect();
      };
    }
  }, [authContext?.user]);

  return (
    <RealtimeContext.Provider value={{
      connectionStatus,
      onlineUsers,
      realtime: realtimeService.current
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};

// ========================= CUSTOM HOOKS =========================

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

// ========================= UI COMPONENTS =========================

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'rose' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <Loader className={`${sizeClasses[size]} text-${color}-500 animate-spin`} />
  );
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  const statusConfig = {
    online: { color: 'green', icon: '🟢' },
    offline: { color: 'gray', icon: '⚫' },
    away: { color: 'yellow', icon: '🟡' },
    busy: { color: 'red', icon: '🔴' }
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full bg-${config.color}-500`}></span>
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
};

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const typeStyles = {
    success: 'bg-green-500 border-green-600 text-white',
    error: 'bg-red-500 border-red-600 text-white',
    warning: 'bg-yellow-500 border-yellow-600 text-white',
    info: 'bg-blue-500 border-blue-600 text-white'
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Bell
  };

  const Icon = icons[notification.type] || Bell;

  return (
    <div className={`${typeStyles[notification.type]} p-4 rounded-lg shadow-lg border-l-4 max-w-sm`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">{notification.message}</p>
          {notification.details && (
            <p className="text-sm opacity-90 mt-1">{notification.details}</p>
          )}
        </div>
        <button onClick={onClose} className="opacity-70 hover:opacity-100">
          ×
        </button>
      </div>
    </div>
  );
};

// ========================= MAIN COMPONENTS =========================

const BlindDinnerEnterprise: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('welcome');
  const { user, isAuthenticated, loading } = useAuth();
  const { notifications, notify } = useNotifications();
  const { connectionStatus, onlineUsers } = useRealtime();

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else if (!loading) {
      setCurrentView('welcome');
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading Blind Dinner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => notify.remove(notification.id)}
          />
        ))}
      </div>

      {/* Status Bar */}
      {isAuthenticated && (
        <div className="bg-gray-800 text-white px-4 py-2 text-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusIndicator 
                status={connectionStatus === 'connected' ? 'online' : 'offline'} 
                label={`${connectionStatus}`} 
              />
              <span>{onlineUsers} users online</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Enterprise • v2.1.0 • TypeScript</span>
              <Shield className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <MainContent currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

const MainContent: React.FC<{currentView: string; setCurrentView: (view: string) => void}> = ({ currentView, setCurrentView }) => {
  const renderView = (): JSX.Element => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeScreen setCurrentView={setCurrentView} />;
      case 'login':
        return <LoginScreen setCurrentView={setCurrentView} />;
      case 'register':
        return <RegisterScreen setCurrentView={setCurrentView} />;
      case 'dashboard':
        return <Dashboard setCurrentView={setCurrentView} />;
      case 'matches':
        return <MatchingInterface setCurrentView={setCurrentView} />;
      case 'restaurants':
        return <RestaurantBooking setCurrentView={setCurrentView} />;
      case 'messages':
        return <MessagingInterface setCurrentView={setCurrentView} />;
      case 'profile':
        return <ProfileManagement setCurrentView={setCurrentView} />;
      case 'settings':
        return <SettingsPanel setCurrentView={setCurrentView} />;
      default:
        return <WelcomeScreen setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderView()}
    </div>
  );
};

const WelcomeScreen: React.FC<ComponentProps> = ({ setCurrentView }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="text-8xl mb-8">🍽️💕</div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Blind Dinner
            <span className="text-rose-500"> Enterprise</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            The world's most sophisticated AI-powered dating platform. Connect with verified professionals 
            over curated dining experiences. Real-time matching, enterprise security, global reach.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/70 backdrop-blur rounded-xl p-6 shadow-lg">
              <Zap className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Real-time Matching</h3>
              <p className="text-gray-600">AI-powered compatibility using 50+ data points</p>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-xl p-6 shadow-lg">
              <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Enterprise Security</h3>
              <p className="text-gray-600">Bank-level encryption and verification</p>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-xl p-6 shadow-lg">
              <Globe className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Global Network</h3>
              <p className="text-gray-600">50,000+ restaurants in 200+ cities</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setCurrentView('register')}
              className="w-full max-w-md bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => setCurrentView('login')}
              className="w-full max-w-md bg-white/80 backdrop-blur hover:bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-xl text-lg font-semibold transition-all"
            >
              Welcome Back
            </button>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>Trusted by professionals at</p>
            <div className="flex items-center justify-center gap-8 mt-4 opacity-50">
              <span>Google</span> • <span>Microsoft</span> • <span>Apple</span> • <span>Meta</span> • <span>Tesla</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginScreen: React.FC<ComponentProps> = ({ setCurrentView }) => {
  const [formData, setFormData] = useState<UserLogin>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { notify } = useNotifications();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        notify.success('Welcome back! Setting up your dashboard...');
        setCurrentView('dashboard');
      } else {
        notify.error(result.error || 'Login failed');
      }
    } catch (error) {
      notify.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🍽️💕</div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" color="white" /> : <Shield className="w-4 h-4" />}
            {loading ? 'Signing in...' : 'Sign In Securely'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            New to Blind Dinner?{' '}
            <button
              onClick={() => setCurrentView('register')}
              className="text-rose-500 hover:text-rose-600 font-semibold"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<ComponentProps> = ({ setCurrentView }) => {
  const { user, logout } = useAuth();
  const { notify } = useNotifications();
  const [stats] = useState({
    matches: 24,
    messages: 8,
    bookings: 3,
    compatibility: 89
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-600">Your next perfect dinner awaits</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button
                onClick={logout}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Matches</p>
                <p className="text-3xl font-bold text-rose-500">{stats.matches}</p>
              </div>
              <Heart className="w-8 h-8 text-rose-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-3xl font-bold text-blue-500">{stats.messages}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bookings</p>
                <p className="text-3xl font-bold text-green-500">{stats.bookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compatibility</p>
                <p className="text-3xl font-bold text-purple-500">{stats.compatibility}%</p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setCurrentView('matches')}
            className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6 rounded-xl text-left hover:shadow-lg transition-all"
          >
            <Heart className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Discover Matches</h3>
            <p className="opacity-90">Find your perfect dinner companion</p>
          </button>
          <button
            onClick={() => setCurrentView('restaurants')}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-xl text-left hover:shadow-lg transition-all"
          >
            <MapPin className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Book Restaurant</h3>
            <p className="opacity-90">Reserve your perfect dining spot</p>
          </button>
          <button
            onClick={() => setCurrentView('messages')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl text-left hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chat with Matches</h3>
            <p className="opacity-90">Continue your conversations</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other views
const RegisterScreen: React.FC<ComponentProps> = ({ setCurrentView }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">TypeScript Registration</h2>
      <p className="text-gray-600 mb-4">Enterprise registration flow with TypeScript would be here</p>
      <button
        onClick={() => setCurrentView('welcome')}
        className="bg-rose-500 text-white px-6 py-2 rounded-lg"
      >
        Back to Welcome
      </button>
    </div>
  </div>
);

const MatchingInterface: React.FC<ComponentProps> = ({ setCurrentView }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">AI Matching Engine</h2>
      <p className="text-gray-600 mb-4">Real-time matching interface with TypeScript would be here</p>
      <button
        onClick={() => setCurrentView('dashboard')}
        className="bg-rose-500 text-white px-6 py-2 rounded-lg"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

const RestaurantBooking: React.FC<ComponentProps> = ({ setCurrentView }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Restaurant Booking Engine</h2>
      <p className="text-gray-600 mb-4">Type-safe booking system would be here</p>
      <button
        onClick={() => setCurrentView('dashboard')}
        className="bg-rose-500 text-white px-6 py-2 rounded-lg"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

const MessagingInterface: React.FC<ComponentProps> = ({ setCurrentView }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Real-time Messaging</h2>
      <p className="text-gray-600 mb-4">WebSocket-powered chat with TypeScript would be here</p>
      <button
        onClick={() => setCurrentView('dashboard')}
        className="bg-rose-500 text-white px-6 py-2 rounded-lg"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

const ProfileManagement: React.FC<ComponentProps> = ({ setCurrentView }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Profile Management</h2>
      <p className="text-gray-600 mb-4">Type-safe profile editor would be here</p>
      <button
        onClick={() => setCurrentView('dashboard')}
        className="bg-rose-500 text-white px-6 py-2 rounded-lg"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

const SettingsPanel: React.FC<ComponentProps> = ({ setCurrentView }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Enterprise Settings</h2>
      <p className="text-gray-600 mb-4">Privacy, security, and preferences with TypeScript would be here</p>
      <button
        onClick={() => setCurrentView('dashboard')}
        className="bg-rose-500 text-white px-6 py-2 rounded-lg"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

// Main App with Providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RealtimeProvider>
          <BlindDinnerEnterprise />
        </RealtimeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;