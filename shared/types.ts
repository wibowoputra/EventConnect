export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: {
    address: string;
    city: string;
    country: string;
  };
  organizer: string;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  status: 'attending' | 'maybe' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  status?: number;
} 