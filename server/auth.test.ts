import { login } from './auth.js';
import { storage } from './storage.js';

async function testAuth() {
  console.log('Starting authentication tests...');

  try {
    // Test admin login
    console.log('\nTesting admin login...');
    const adminResult = await login('admin', 'admin123');
    console.log('Admin login successful:', {
      token: adminResult.token ? 'Token received' : 'No token',
      user: {
        id: adminResult.user.id,
        username: adminResult.user.username,
        role: adminResult.user.role
      }
    });

    // Test invalid password
    console.log('\nTesting invalid password...');
    try {
      await login('admin', 'wrongpassword');
      console.log('❌ Test failed: Should have rejected invalid password');
    } catch (error) {
      console.log('✅ Test passed: Correctly rejected invalid password');
    }

    // Test invalid username
    console.log('\nTesting invalid username...');
    try {
      await login('nonexistent', 'admin123');
      console.log('❌ Test failed: Should have rejected invalid username');
    } catch (error) {
      console.log('✅ Test passed: Correctly rejected invalid username');
    }

    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run tests after storage initialization is complete
storage.onInitializationComplete(() => {
  console.log('Storage initialization complete, running tests...');
  testAuth();
}); 