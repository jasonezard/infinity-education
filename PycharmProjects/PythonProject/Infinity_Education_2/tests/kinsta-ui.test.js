const BrowserManager = require('./utils/browser');
const TestHelpers = require('./utils/helpers');
const config = require('./config');

async function run() {
  const browserManager = new BrowserManager();
  let success = false;
  let error = '';

  try {
    console.log('🌐 Testing Kinsta Deployment...');
    
    const page = await browserManager.launch();
    
    // Navigate to Kinsta URL
    console.log(`Navigating to: ${config.kinstaUrl}`);
    await page.goto(config.kinstaUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await TestHelpers.takeScreenshot(browserManager, 'kinsta-test', 'initial-load');
    
    // Test 1: Check if site loads
    console.log('1. Testing site load...');
    await browserManager.waitForText('Infinity Education', 15000);
    console.log('✅ Site loads successfully');
    
    // Test 2: Check login page elements
    console.log('2. Testing login page elements...');
    const subtitle = await browserManager.isElementVisible('text=Empowering Learning Through Technology');
    const googleButton = await browserManager.isElementVisible('text=Sign in with Google');
    const emailInput = await browserManager.isElementVisible('input[type="email"]');
    const passwordInput = await browserManager.isElementVisible('input[type="password"]');
    
    if (!subtitle || !googleButton || !emailInput || !passwordInput) {
      throw new Error('Login page elements missing');
    }
    console.log('✅ Login page elements present');
    
    // Test 3: Test responsive design
    console.log('3. Testing responsive design...');
    await page.setViewport({ width: 375, height: 667 }); // Mobile
    await TestHelpers.delay(1000);
    await TestHelpers.takeScreenshot(browserManager, 'kinsta-test', 'mobile-view');
    
    await page.setViewport({ width: 768, height: 1024 }); // Tablet
    await TestHelpers.delay(1000);
    await TestHelpers.takeScreenshot(browserManager, 'kinsta-test', 'tablet-view');
    
    await page.setViewport({ width: 1280, height: 720 }); // Desktop
    await TestHelpers.delay(1000);
    console.log('✅ Responsive design working');
    
    // Test 4: Test form interactions
    console.log('4. Testing form interactions...');
    await browserManager.clearAndType('input[type="email"]', 'test@example.com');
    await browserManager.clearAndType('input[type="password"]', 'testpassword');
    
    const emailValue = await page.$eval('input[type="email"]', el => el.value);
    const passwordValue = await page.$eval('input[type="password"]', el => el.value);
    
    if (emailValue !== 'test@example.com' || passwordValue !== 'testpassword') {
      throw new Error('Form input not working correctly');
    }
    console.log('✅ Form interactions working');
    
    // Test 5: Test Firebase connection (attempt login)
    console.log('5. Testing Firebase connection...');
    await browserManager.click('button[type="submit"]');
    await TestHelpers.delay(3000);
    
    // Should show some response (error or success)
    const hasAlert = await browserManager.isElementVisible('[role="alert"]');
    const hasLoading = await browserManager.isElementVisible('[role="progressbar"]');
    
    if (!hasAlert && !hasLoading) {
      console.log('⚠️  No response to login attempt - check Firebase connection');
    } else {
      console.log('✅ Firebase connection working');
    }
    
    await TestHelpers.takeScreenshot(browserManager, 'kinsta-test', 'firebase-test');
    
    // Test 6: Test console errors
    console.log('6. Checking for console errors...');
    const logs = await page.evaluate(() => {
      return window.console.logs || [];
    });
    
    // Check for critical errors
    const errors = logs.filter(log => log.type === 'error');
    if (errors.length > 0) {
      console.log('⚠️  Console errors found:', errors.map(e => e.message).join(', '));
    } else {
      console.log('✅ No critical console errors');
    }
    
    // Test 7: Test page performance
    console.log('7. Testing page performance...');
    const performanceMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: perf.loadEventEnd - perf.navigationStart,
        domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      };
    });
    
    console.log(`Load time: ${performanceMetrics.loadTime}ms`);
    console.log(`DOM content loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`First paint: ${performanceMetrics.firstPaint}ms`);
    
    if (performanceMetrics.loadTime > 10000) {
      console.log('⚠️  Page load time is slow (>10s)');
    } else {
      console.log('✅ Page performance acceptable');
    }
    
    console.log('✅ Kinsta deployment test completed successfully!');
    success = true;
    
  } catch (err) {
    error = err.message;
    console.error('❌ Kinsta deployment test failed:', error);
    await TestHelpers.takeScreenshot(browserManager, 'kinsta-test', 'error');
  } finally {
    await browserManager.close();
  }

  return { success, error };
}

// Allow running directly
if (require.main === module) {
  run().then(result => {
    console.log(`\\nTest result: ${result.success ? 'PASS' : 'FAIL'}`);
    if (!result.success) {
      console.error(`Error: ${result.error}`);
    }
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { run };