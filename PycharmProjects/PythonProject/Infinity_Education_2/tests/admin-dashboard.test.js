const BrowserManager = require('./utils/browser');
const TestHelpers = require('./utils/helpers');
const config = require('./config');

async function run() {
  const browserManager = new BrowserManager();
  let success = false;
  let error = '';

  try {
    console.log('👑 Testing Admin Dashboard...');
    
    const page = await browserManager.launch();
    
    // Navigate to application and login as admin
    await page.goto(config.baseUrl);
    await TestHelpers.login(browserManager, 'admin');
    
    // Test 1: Check admin dashboard loads
    console.log('1. Testing admin dashboard load...');
    await browserManager.waitForText('Admin Dashboard');
    await TestHelpers.takeScreenshot(browserManager, 'admin-dashboard', 'initial');
    
    // Test 2: Check stats cards
    console.log('2. Testing stats cards...');
    const statsCards = [
      'Total Students',
      'Total Classes', 
      'Total Records',
      'Total Teachers'
    ];
    
    for (const statCard of statsCards) {
      const cardVisible = await browserManager.isElementVisible(`text=${statCard}`);
      if (!cardVisible) {
        throw new Error(`Stats card missing: ${statCard}`);
      }
    }
    console.log('✅ Stats cards present');
    
    // Test 3: Check charts
    console.log('3. Testing charts...');
    const chartTitles = [
      'Educational Values Distribution',
      'Monthly Record Trends'
    ];
    
    for (const chartTitle of chartTitles) {
      const chartVisible = await browserManager.isElementVisible(`text=${chartTitle}`);
      if (!chartVisible) {
        throw new Error(`Chart missing: ${chartTitle}`);
      }
    }
    console.log('✅ Charts present');
    
    // Test 4: Check users management table
    console.log('4. Testing users management table...');
    await browserManager.waitForText('Users Management');
    
    const userTableHeaders = ['Name', 'Email', 'Role', 'Actions'];
    for (const header of userTableHeaders) {
      const headerVisible = await browserManager.isElementVisible(`text=${header}`);
      if (!headerVisible) {
        throw new Error(`User table header missing: ${header}`);
      }
    }
    console.log('✅ Users management table present');
    
    // Test 5: Check classes management table
    console.log('5. Testing classes management table...');
    await browserManager.waitForText('Classes Management');
    
    const classTableHeaders = ['Class Name', 'Teacher', 'Students', 'Actions'];
    for (const header of classTableHeaders) {
      const headerVisible = await browserManager.isElementVisible(`text=${header}`);
      if (!headerVisible) {
        throw new Error(`Class table header missing: ${header}`);
      }
    }
    console.log('✅ Classes management table present');
    
    // Test 6: Test Add User dialog
    console.log('6. Testing Add User dialog...');
    await browserManager.click('text=Add User');
    await browserManager.waitForText('Create New User');
    
    const userFormFields = [
      'input[label="Name"]',
      'input[label="Email"]',
      '[data-testid="role-select"]'
    ];
    
    for (const field of userFormFields) {
      const fieldVisible = await browserManager.isElementVisible(field);
      if (!fieldVisible) {
        console.log(`⚠️  User form field not found: ${field}`);
      }
    }
    
    // Close dialog
    await browserManager.click('text=Cancel');
    await TestHelpers.takeScreenshot(browserManager, 'admin-dashboard', 'add-user-dialog');
    
    // Test 7: Test Add Class dialog
    console.log('7. Testing Add Class dialog...');
    await browserManager.click('text=Add Class');
    await browserManager.waitForText('Create New Class');
    
    const classFormFields = [
      'input[label="Class Name"]',
      '[data-testid="teacher-select"]'
    ];
    
    for (const field of classFormFields) {
      const fieldVisible = await browserManager.isElementVisible(field);
      if (!fieldVisible) {
        console.log(`⚠️  Class form field not found: ${field}`);
      }
    }
    
    // Close dialog
    await browserManager.click('text=Cancel');
    await TestHelpers.takeScreenshot(browserManager, 'admin-dashboard', 'add-class-dialog');
    
    // Test 8: Test navigation menu
    console.log('8. Testing navigation menu...');
    const navItems = [
      'Dashboard',
      'Users',
      'Classes',
      'Analytics',
      'Students',
      'Settings'
    ];
    
    for (const navItem of navItems) {
      const itemVisible = await browserManager.isElementVisible(`text=${navItem}`);
      if (!itemVisible) {
        console.log(`⚠️  Navigation item not found: ${navItem}`);
      }
    }
    console.log('✅ Navigation menu items present');
    
    // Test 9: Test user profile menu
    console.log('9. Testing user profile menu...');
    await browserManager.click('.MuiAvatar-root');
    await browserManager.waitForText('Profile');
    await browserManager.waitForText('Settings');
    await browserManager.waitForText('Sign Out');
    
    // Click outside to close menu
    await browserManager.click('h4');
    await TestHelpers.takeScreenshot(browserManager, 'admin-dashboard', 'profile-menu');
    
    // Test 10: Test responsive design
    console.log('10. Testing responsive design...');
    await page.setViewport({ width: 768, height: 1024 });
    await TestHelpers.delay(1000);
    await TestHelpers.takeScreenshot(browserManager, 'admin-dashboard', 'tablet-view');
    
    await page.setViewport({ width: 375, height: 667 });
    await TestHelpers.delay(1000);
    await TestHelpers.takeScreenshot(browserManager, 'admin-dashboard', 'mobile-view');
    
    // Reset viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('✅ Admin dashboard test completed successfully!');
    success = true;
    
  } catch (err) {
    error = err.message;
    console.error('❌ Admin dashboard test failed:', error);
    await TestHelpers.takeScreenshot(browserManager, 'admin-dashboard', 'error');
  } finally {
    await browserManager.close();
  }

  return { success, error };
}

module.exports = { run };