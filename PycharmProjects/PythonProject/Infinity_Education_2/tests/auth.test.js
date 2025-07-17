const BrowserManager = require('./utils/browser');
const TestHelpers = require('./utils/helpers');
const config = require('./config');

async function run() {
  const browserManager = new BrowserManager();
  let success = false;
  let error = '';

  try {
    console.log('🔐 Testing Authentication System...');
    
    const page = await browserManager.launch();
    
    // Navigate to application
    await page.goto(config.baseUrl);
    await TestHelpers.takeScreenshot(browserManager, 'auth-test', 'initial-load');
    
    // Test 1: Check login page loads
    console.log('1. Testing login page load...');
    await browserManager.waitForText('Infinity Education');
    await browserManager.waitForText('Empowering Learning Through Technology');
    
    // Test 2: Test Google Sign-In button exists
    console.log('2. Testing Google Sign-In button...');
    const googleButton = await browserManager.isElementVisible('text=Sign in with Google');
    if (!googleButton) {
      throw new Error('Google Sign-In button not found');
    }
    
    // Test 3: Test email/password form
    console.log('3. Testing email/password form...');
    const emailInput = await browserManager.isElementVisible('input[type="email"]');
    const passwordInput = await browserManager.isElementVisible('input[type="password"]');
    const submitButton = await browserManager.isElementVisible('button[type="submit"]');
    
    if (!emailInput || !passwordInput || !submitButton) {
      throw new Error('Email/password form elements not found');
    }
    
    // Test 4: Test login with invalid credentials
    console.log('4. Testing login with invalid credentials...');
    await browserManager.clearAndType('input[type="email"]', 'invalid@example.com');
    await browserManager.clearAndType('input[type="password"]', 'wrongpassword');
    await browserManager.click('button[type="submit"]');
    
    // Should show error message
    await TestHelpers.delay(2000);
    const errorVisible = await browserManager.isElementVisible('[role="alert"]');
    if (!errorVisible) {
      console.log('Warning: Error message not displayed for invalid credentials');
    }
    
    await TestHelpers.takeScreenshot(browserManager, 'auth-test', 'invalid-login');
    
    // Test 5: Test login with valid admin credentials
    console.log('5. Testing login with valid admin credentials...');
    await browserManager.clearAndType('input[type="email"]', config.testUsers.admin.email);
    await browserManager.clearAndType('input[type="password"]', config.testUsers.admin.password);
    await browserManager.click('button[type="submit"]');
    
    // Should redirect to admin dashboard
    await browserManager.waitForText('Admin Dashboard', 15000);
    await TestHelpers.takeScreenshot(browserManager, 'auth-test', 'admin-dashboard');
    
    // Test 6: Test logout
    console.log('6. Testing logout...');
    await TestHelpers.logout(browserManager);
    await browserManager.waitForText('Infinity Education');
    
    // Test 7: Test login with valid teacher credentials
    console.log('7. Testing login with valid teacher credentials...');
    await browserManager.clearAndType('input[type="email"]', config.testUsers.teacher.email);
    await browserManager.clearAndType('input[type="password"]', config.testUsers.teacher.password);
    await browserManager.click('button[type="submit"]');
    
    // Should redirect to teacher dashboard
    await browserManager.waitForText('Teacher Dashboard', 15000);
    await TestHelpers.takeScreenshot(browserManager, 'auth-test', 'teacher-dashboard');
    
    // Test 8: Test session persistence
    console.log('8. Testing session persistence...');
    await page.reload();
    await browserManager.waitForText('Teacher Dashboard', 10000);
    
    console.log('✅ All authentication tests passed!');
    success = true;
    
  } catch (err) {
    error = err.message;
    console.error('❌ Authentication test failed:', error);
    await TestHelpers.takeScreenshot(browserManager, 'auth-test', 'error');
  } finally {
    await browserManager.close();
  }

  return { success, error };
}

module.exports = { run };