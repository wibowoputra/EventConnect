import { User, Event, EventParticipant } from '../../shared/types';

export const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
    preferences: {
      notifications: true,
      theme: 'light' as const
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Test Event 1',
    description: 'Test Description 1',
    date: new Date('2024-03-20T10:00:00Z'),
    location: {
      address: '123 Test St',
      city: 'Test City',
      country: 'Test Country'
    },
    organizer: '1',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Test Event 2',
    description: 'Test Description 2',
    date: new Date('2024-03-21T10:00:00Z'),
    location: {
      address: '456 Test Ave',
      city: 'Test City',
      country: 'Test Country'
    },
    organizer: '2',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockParticipants: EventParticipant[] = [
  {
    id: '1',
    eventId: '1',
    userId: '1',
    status: 'attending',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    eventId: '1',
    userId: '2',
    status: 'maybe',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockAuth = {
  token: 'mock-jwt-token'
};

export const mockError = {
  error: 'Invalid credentials'
}; 