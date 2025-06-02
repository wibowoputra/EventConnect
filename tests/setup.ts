import { afterAll, afterEach, beforeAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock API handlers
const handlers = [
  http.get('*/api/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    });
  }),

  http.post('*/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }
    });
  }),

  http.get('*/api/events', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-03-20T10:00:00Z'
      }
    ]);
  })
];

// Setup MSW server
const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/event_connect_test'; 