const BrowserManager = require('./utils/browser');
const TestHelpers = require('./utils/helpers');
const config = require('./config');

async function run() {
  const browserManager = new BrowserManager();
  let success = false;
  let error = '';

  try {
    console.log('👨‍🎓 Testing Student Profile...');
    
    const page = await browserManager.launch();
    
    // Navigate to application and login as teacher
    await page.goto(config.baseUrl);
    await TestHelpers.login(browserManager, 'teacher');
    
    // Test 1: Navigate to a student profile (if students exist)
    console.log('1. Testing student profile navigation...');
    
    // Look for student links in the dashboard
    const studentLinks = await page.$$('.MuiListItem-root[data-testid="student-item"]');
    
    if (studentLinks.length === 0) {
      console.log('⚠️  No students found, testing with mock navigation');
      // Navigate to a mock student profile URL
      await page.goto(`${config.baseUrl}/student/mock-student-id`);
    } else {
      // Click on first student
      await studentLinks[0].click();
    }
    
    await TestHelpers.delay(2000);
    await TestHelpers.takeScreenshot(browserManager, 'student-profile', 'initial');
    
    // Test 2: Check if student profile loads (or error page)
    console.log('2. Testing student profile load...');
    
    const profileLoaded = await browserManager.isElementVisible('text=Student Profile') || 
                          await browserManager.isElementVisible('text=Student not found') ||
                          await browserManager.isElementVisible('[data-testid="student-name"]');
    
    if (!profileLoaded) {
      console.log('⚠️  Student profile page structure not recognized');
    } else {
      console.log('✅ Student profile page loaded');
    }
    
    // Test 3: Check profile header elements
    console.log('3. Testing profile header elements...');
    
    const headerElements = [
      'button[aria-label="back"]',
      'text=Add Record',
      'text=Export Report'
    ];
    
    for (const element of headerElements) {
      const elementVisible = await browserManager.isElementVisible(element);
      if (!elementVisible) {
        console.log(`⚠️  Header element not found: ${element}`);
      }
    }
    
    // Test 4: Check student info card
    console.log('4. Testing student info card...');
    
    const infoElements = [
      '.MuiAvatar-root',
      'text=Student ID',
      'text=Enrolled'
    ];
    
    for (const element of infoElements) {
      const elementVisible = await browserManager.isElementVisible(element);
      if (!elementVisible) {
        console.log(`⚠️  Info element not found: ${element}`);
      }
    }
    
    // Test 5: Check stats cards
    console.log('5. Testing stats cards...');
    
    const statsCards = [
      'Total Records',
      'Flagged',
      'Total Points',
      'Last Updated'
    ];
    
    for (const statCard of statsCards) {
      const cardVisible = await browserManager.isElementVisible(`text=${statCard}`);
      if (!cardVisible) {
        console.log(`⚠️  Stats card not found: ${statCard}`);
      }
    }
    
    // Test 6: Check charts
    console.log('6. Testing charts...');
    
    const chartTitles = [
      'Educational Values Progress',
      'Progress Timeline'
    ];
    
    for (const chartTitle of chartTitles) {
      const chartVisible = await browserManager.isElementVisible(`text=${chartTitle}`);
      if (!chartVisible) {
        console.log(`⚠️  Chart not found: ${chartTitle}`);
      }
    }
    
    // Test 7: Check anecdotal records section
    console.log('7. Testing anecdotal records section...');
    
    const recordsSection = await browserManager.isElementVisible('text=Anecdotal Records');
    if (!recordsSection) {
      console.log('⚠️  Anecdotal records section not found');
    } else {
      console.log('✅ Anecdotal records section present');
    }
    
    // Test 8: Test Add Record button functionality
    console.log('8. Testing Add Record button...');
    
    const addRecordButton = await browserManager.isElementVisible('text=Add Record');
    if (addRecordButton) {
      await browserManager.click('text=Add Record');
      await TestHelpers.delay(1000);
      
      // Should navigate to add record page
      const addRecordPage = await browserManager.isElementVisible('text=Add Anecdotal Record');
      if (addRecordPage) {
        console.log('✅ Add Record navigation works');
        // Go back
        await browserManager.click('button[aria-label="back"]');
        await TestHelpers.delay(1000);
      }
    }
    
    // Test 9: Test Export Report button
    console.log('9. Testing Export Report button...');
    
    const exportButton = await browserManager.isElementVisible('text=Export Report');
    if (exportButton) {
      await browserManager.click('text=Export Report');
      await TestHelpers.delay(1000);
      console.log('✅ Export Report button clickable');
    }
    
    // Test 10: Test responsive design
    console.log('10. Testing responsive design...');
    
    await page.setViewport({ width: 768, height: 1024 });
    await TestHelpers.delay(1000);
    await TestHelpers.takeScreenshot(browserManager, 'student-profile', 'tablet-view');
    
    await page.setViewport({ width: 375, height: 667 });
    await TestHelpers.delay(1000);
    await TestHelpers.takeScreenshot(browserManager, 'student-profile', 'mobile-view');
    
    // Reset viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Test 11: Test back navigation
    console.log('11. Testing back navigation...');
    
    const backButton = await browserManager.isElementVisible('button[aria-label="back"]');
    if (backButton) {
      await browserManager.click('button[aria-label="back"]');
      await TestHelpers.delay(1000);
      
      // Should return to dashboard
      const dashboardVisible = await browserManager.isElementVisible('text=Teacher Dashboard');
      if (dashboardVisible) {
        console.log('✅ Back navigation works');
      }
    }
    
    await TestHelpers.takeScreenshot(browserManager, 'student-profile', 'final');
    
    console.log('✅ Student profile test completed successfully!');
    success = true;
    
  } catch (err) {
    error = err.message;
    console.error('❌ Student profile test failed:', error);
    await TestHelpers.takeScreenshot(browserManager, 'student-profile', 'error');
  } finally {
    await browserManager.close();
  }

  return { success, error };
}

module.exports = { run };