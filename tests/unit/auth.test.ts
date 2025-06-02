import { describe, it, expect, beforeAll } from 'vitest';
import { login } from '../../server/auth.js';
import { storage } from '../../server/storage.js';

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Wait for storage initialization to complete
    await new Promise<void>((resolve) => {
      storage.onInitializationComplete(() => {
        resolve();
      });
    });
  });

  it('should successfully login with admin credentials', async () => {
    const result = await login('admin', 'admin123');
    
    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.user).toEqual({
      id: expect.any(Number),
      username: 'admin',
      email: 'admin@eventhub.com',
      role: 'admin'
    });
  });

  it('should reject login with invalid password', async () => {
    await expect(login('admin', 'wrongpassword')).rejects.toThrow('Invalid username or password');
  }, 1000);

  it('should reject login with invalid username', async () => {
    await expect(login('nonexistent', 'admin123')).rejects.toThrow('Invalid username or password');
  });
}); 