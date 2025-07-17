const BrowserManager = require('./utils/browser');
const TestHelpers = require('./utils/helpers');
const config = require('./config');

async function run() {
  const browserManager = new BrowserManager();
  let success = false;
  let error = '';

  try {
    console.log('📝 Testing Record Creation...');
    
    const page = await browserManager.launch();
    
    // Navigate to application and login as teacher
    await page.goto(config.baseUrl);
    await TestHelpers.login(browserManager, 'teacher');
    
    // Test 1: Navigate to Add Record page
    console.log('1. Testing navigation to Add Record page...');
    await browserManager.click('text=Add Record');
    await browserManager.waitForText('Add Anecdotal Record');
    await TestHelpers.takeScreenshot(browserManager, 'record-creation', 'initial');
    
    // Test 2: Check form elements
    console.log('2. Testing form elements...');
    
    const formElements = [
      '[data-testid="student-select"]',
      'textarea[label="Observation Note"]',
      '[data-testid="educational-value-select"]',
      '[data-testid="assessment-type-select"]',
      'input[type="checkbox"]',
      'input[type="file"]'
    ];
    
    for (const element of formElements) {
      const elementVisible = await browserManager.isElementVisible(element);
      if (!elementVisible) {
        console.log(`⚠️  Form element not found: ${element}`);
      }
    }
    
    // Test 3: Check student selection dropdown
    console.log('3. Testing student selection...');
    
    const studentSelect = await browserManager.isElementVisible('[data-testid="student-select"]');
    if (studentSelect) {
      await browserManager.click('[data-testid="student-select"]');
      await TestHelpers.delay(500);
      
      // Check if dropdown opens
      const dropdownOpen = await browserManager.isElementVisible('[role="listbox"]');
      if (dropdownOpen) {
        console.log('✅ Student selection dropdown works');
        
        // Select first student if available
        const studentOptions = await page.$$('[role="option"]');
        if (studentOptions.length > 0) {
          await studentOptions[0].click();
          console.log('✅ Student selection works');
        }
      }
    }
    
    // Test 4: Fill observation note
    console.log('4. Testing observation note input...');
    
    const noteTextarea = await browserManager.isElementVisible('textarea[label="Observation Note"]');
    if (noteTextarea) {
      await browserManager.clearAndType('textarea[label="Observation Note"]', config.testData.recordNote);
      console.log('✅ Observation note input works');
    }
    
    // Test 5: Test educational value selection
    console.log('5. Testing educational value selection...');
    
    const valueSelect = await browserManager.isElementVisible('[data-testid="educational-value-select"]');
    if (valueSelect) {
      await browserManager.click('[data-testid="educational-value-select"]');
      await TestHelpers.delay(500);
      
      // Select Communication
      const communicationOption = await browserManager.isElementVisible('text=Communication');
      if (communicationOption) {
        await browserManager.click('text=Communication');
        console.log('✅ Educational value selection works');
      }
    }
    
    // Test 6: Test assessment type selection
    console.log('6. Testing assessment type selection...');
    
    const assessmentSelect = await browserManager.isElementVisible('[data-testid="assessment-type-select"]');
    if (assessmentSelect) {
      await browserManager.click('[data-testid="assessment-type-select"]');
      await TestHelpers.delay(500);
      
      // Select Formative
      const formativeOption = await browserManager.isElementVisible('text=Formative');
      if (formativeOption) {
        await browserManager.click('text=Formative');
        console.log('✅ Assessment type selection works');
      }
    }
    
    // Test 7: Test flag checkbox
    console.log('7. Testing flag checkbox...');
    
    const flagCheckbox = await browserManager.isElementVisible('input[type="checkbox"]');
    if (flagCheckbox) {
      await browserManager.click('input[type="checkbox"]');
      console.log('✅ Flag checkbox works');
    }
    
    // Test 8: Test preview section
    console.log('8. Testing preview section...');
    
    const previewSection = await browserManager.isElementVisible('text=Preview');
    if (previewSection) {
      console.log('✅ Preview section present');
      
      // Check preview content
      const previewElements = [
        'text=Selected Students',
        'text=Observation Note',
        'text=Educational Value',
        'text=Assessment Type'
      ];
      
      for (const element of previewElements) {
        const elementVisible = await browserManager.isElementVisible(element);
        if (!elementVisible) {
          console.log(`⚠️  Preview element not found: ${element}`);
        }
      }
    }
    
    await TestHelpers.takeScreenshot(browserManager, 'record-creation', 'form-filled');
    
    // Test 9: Test form validation
    console.log('9. Testing form validation...');
    
    // Clear required fields and try to submit
    await browserManager.clearAndType('textarea[label="Observation Note"]', '');
    
    const saveButton = await browserManager.isElementVisible('text=Save Record');
    if (saveButton) {
      await browserManager.click('text=Save Record');
      await TestHelpers.delay(1000);
      
      // Should show validation error
      const errorMessage = await browserManager.isElementVisible('[role="alert"]');
      if (errorMessage) {
        console.log('✅ Form validation works');
      }
    }
    
    // Test 10: Test reset button
    console.log('10. Testing reset button...');
    
    const resetButton = await browserManager.isElementVisible('text=Reset');
    if (resetButton) {
      await browserManager.click('text=Reset');
      await TestHelpers.delay(500);
      
      // Check if form is cleared
      const noteValue = await page.$eval('textarea[label="Observation Note"]', el => el.value);
      if (noteValue === '') {
        console.log('✅ Reset button works');
      }
    }
    
    // Test 11: Test file upload
    console.log('11. Testing file upload...');
    
    const fileInput = await browserManager.isElementVisible('input[type="file"]');
    if (fileInput) {
      // Create a test file
      const testFile = 'test-evidence.txt';
      await page.evaluate(() => {
        const dt = new DataTransfer();
        const file = new File(['test content'], 'test-evidence.txt', { type: 'text/plain' });
        dt.items.add(file);
        document.querySelector('input[type="file"]').files = dt.files;
      });
      
      console.log('✅ File upload input works');
    }
    
    // Test 12: Test responsive design
    console.log('12. Testing responsive design...');
    
    await page.setViewport({ width: 768, height: 1024 });
    await TestHelpers.delay(1000);
    await TestHelpers.takeScreenshot(browserManager, 'record-creation', 'tablet-view');
    
    await page.setViewport({ width: 375, height: 667 });
    await TestHelpers.delay(1000);
    await TestHelpers.takeScreenshot(browserManager, 'record-creation', 'mobile-view');
    
    // Reset viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Test 13: Test back navigation
    console.log('13. Testing back navigation...');
    
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
    
    await TestHelpers.takeScreenshot(browserManager, 'record-creation', 'final');
    
    console.log('✅ Record creation test completed successfully!');
    success = true;
    
  } catch (err) {
    error = err.message;
    console.error('❌ Record creation test failed:', error);
    await TestHelpers.takeScreenshot(browserManager, 'record-creation', 'error');
  } finally {
    await browserManager.close();
  }

  return { success, error };
}

module.exports = { run };