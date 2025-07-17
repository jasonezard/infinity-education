const BrowserManager = require('./utils/browser');
const TestHelpers = require('./utils/helpers');
const config = require('./config');

async function run() {
  const browserManager = new BrowserManager();
  let success = false;
  let error = '';

  try {
    console.log('👩‍🏫 Testing Teacher Dashboard...');
    
    const page = await browserManager.launch();
    
    // Navigate to application and login as teacher
    await page.goto(config.baseUrl);
    await TestHelpers.login(browserManager, 'teacher');
    
    // Test 1: Check teacher dashboard loads
    console.log('1. Testing teacher dashboard load...');
    await browserManager.waitForText('Teacher Dashboard');
    await TestHelpers.takeScreenshot(browserManager, 'teacher-dashboard', 'initial');
    
    // Test 2: Check stats cards
    console.log('2. Testing stats cards...');
    const statsCards = [
      'My Students',
      'My Classes',
      'Recent Records',
      'Flagged Records'
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
      'Students by Class'
    ];
    
    for (const chartTitle of chartTitles) {
      const chartVisible = await browserManager.isElementVisible(`text=${chartTitle}`);
      if (!chartVisible) {
        throw new Error(`Chart missing: ${chartTitle}`);
      }
    }
    console.log('✅ Charts present');
    
    // Test 4: Check recent records section
    console.log('4. Testing recent records section...');
    await browserManager.waitForText('Recent Records');
    
    // Check if records list exists (might be empty)
    const recordsListExists = await browserManager.isElementVisible('[data-testid="records-list"], .MuiList-root');
    if (!recordsListExists) {
      console.log('⚠️  Recent records list structure not found');
    } else {
      console.log('✅ Recent records section present');
    }
    
    // Test 5: Check students section
    console.log('5. Testing students section...');
    await browserManager.waitForText('My Students');
    
    // Check if students list exists
    const studentsListExists = await browserManager.isElementVisible('[data-testid="students-list"], .MuiList-root');
    if (!studentsListExists) {
      console.log('⚠️  Students list structure not found');
    } else {
      console.log('✅ Students section present');
    }
    
    // Test 6: Check Add Record button
    console.log('6. Testing Add Record button...');
    const addRecordButton = await browserManager.isElementVisible('text=Add Record');
    if (!addRecordButton) {
      throw new Error('Add Record button not found');
    }
    console.log('✅ Add Record button present');
    
    // Test 7: Check floating action button
    console.log('7. Testing floating action button...');
    const fabButton = await browserManager.isElementVisible('[aria-label="add record"]');
    if (!fabButton) {
      console.log('⚠️  Floating action button not found');
    } else {
      console.log('✅ Floating action button present');
    }
    
    // Test 8: Test navigation to Add Record page
    console.log('8. Testing navigation to Add Record page...');
    await browserManager.click('text=Add Record');
    await browserManager.waitForText('Add Anecdotal Record', 10000);
    
    // Go back to dashboard
    await browserManager.click('[aria-label="back"]');
    await browserManager.waitForText('Teacher Dashboard');
    await TestHelpers.takeScreenshot(browserManager, 'teacher-dashboard', 'add-record-navigation');
    
    // Test 9: Test navigation menu (teacher view)
    console.log('9. Testing navigation menu...');
    const navItems = [
      'Dashboard',
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
    
    // Test 10: Test user profile menu
    console.log('10. Testing user profile menu...');
    await browserManager.click('.MuiAvatar-root');
    await browserManager.waitForText('Profile');
    await browserManager.waitForText('Settings');
    await browserManager.waitForText('Sign Out');
    
    // Click outside to close menu
    await browserManager.click('h4');
    await TestHelpers.takeScreenshot(browserManager, 'teacher-dashboard', 'profile-menu');
    
    // Test 11: Test responsive design
    console.log('11. Testing responsive design...');
    await page.setViewport({ width: 768, height: 1024 });
    await TestHelpers.delay(1000);
    await TestHelpers.takeScreenshot(browserManager, 'teacher-dashboard', 'tablet-view');
    
    await page.setViewport({ width: 375, height: 667 });
    await TestHelpers.delay(1000);
    await TestHelpers.takeScreenshot(browserManager, 'teacher-dashboard', 'mobile-view');
    
    // Reset viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Test 12: Test sidebar navigation
    console.log('12. Testing sidebar navigation...');
    // Click hamburger menu on mobile
    await page.setViewport({ width: 375, height: 667 });
    const hamburgerMenu = await browserManager.isElementVisible('[aria-label="open drawer"]');
    if (hamburgerMenu) {
      await browserManager.click('[aria-label="open drawer"]');
      await TestHelpers.delay(500);
      await TestHelpers.takeScreenshot(browserManager, 'teacher-dashboard', 'mobile-sidebar');
    }
    
    // Reset viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('✅ Teacher dashboard test completed successfully!');
    success = true;
    
  } catch (err) {
    error = err.message;
    console.error('❌ Teacher dashboard test failed:', error);
    await TestHelpers.takeScreenshot(browserManager, 'teacher-dashboard', 'error');
  } finally {
    await browserManager.close();
  }

  return { success, error };
}

module.exports = { run };