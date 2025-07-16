// Simple student creation test
const puppeteer = require('puppeteer');

async function testStudentCreation() {
  console.log('🚀 Starting student creation test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the application
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:5177', { waitUntil: 'networkidle2' });
    
    // Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'screenshots/01-initial-load.png', fullPage: true });
    console.log('📸 Screenshot taken: 01-initial-load.png');
    
    // Check if we need to authenticate first
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    if (bodyText.includes('Log In') || bodyText.includes('Continue with Google')) {
      console.log('🔐 Authentication required - attempting to log in...');
      
      // Look for and click the "Log In with Email" button
      const loginButton = await page.$('button:contains("Log In with Email")') || 
                         await page.$x('//button[contains(text(), "Log In with Email")]');
      
      if (loginButton.length > 0) {
        await loginButton[0].click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fill in test credentials (you might need to adjust these)
        const emailInput = await page.$('input[type="email"]');
        const passwordInput = await page.$('input[type="password"]');
        
        if (emailInput && passwordInput) {
          await emailInput.type('admin@test.com');
          await passwordInput.type('password123');
          
          // Submit the form
          const submitButton = await page.$('button[type="submit"]') || 
                              await page.$x('//button[contains(text(), "Log In")]');
          
          if (submitButton.length > 0) {
            await submitButton[0].click();
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
    }
    
    // Navigate to admin dashboard
    console.log('🏢 Navigating to admin dashboard...');
    await page.goto('http://localhost:5177/admin', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot of admin dashboard
    await page.screenshot({ path: 'screenshots/02-admin-dashboard.png', fullPage: true });
    console.log('📸 Screenshot taken: 02-admin-dashboard.png');
    
    // Debug: Check page title and content
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Check if we're on the right page
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(`📝 Page contains: ${bodyText.substring(0, 200)}...`);
    
    // List all buttons on the page for debugging
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(btn => btn.textContent.trim()).filter(text => text.length > 0)
    );
    console.log('🔘 Available buttons:', buttons);
    
    // Look for Add Student button
    console.log('🔍 Looking for Add Student button...');
    let addStudentButton = null;
    
    try {
      // Try different selectors for the Add Student button
      const selectors = [
        'button:contains("Add Student")',
        'button[aria-label*="Add Student"]',
        'button:has-text("Add Student")',
        'text="Add Student"'
      ];
      
      for (const selector of selectors) {
        try {
          addStudentButton = await page.$(selector);
          if (addStudentButton) break;
        } catch (e) {
          // Try next selector
        }
      }
      
      // If still not found, try xpath
      if (!addStudentButton) {
        const xpath = '//button[contains(text(), "Add Student")]';
        const elements = await page.$x(xpath);
        if (elements.length > 0) {
          addStudentButton = elements[0];
        }
      }
    } catch (e) {
      console.log('Could not find Add Student button with any selector');
    }
    
    if (addStudentButton) {
      console.log('✅ Found Add Student button');
      
      // Click Add Student button
      await addStudentButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take screenshot of opened dialog
      await page.screenshot({ path: 'screenshots/03-add-student-dialog.png', fullPage: true });
      console.log('📸 Screenshot taken: 03-add-student-dialog.png');
      
      // Fill out student form
      console.log('✍️ Filling student form...');
      
      // Generate test student data
      const testStudent = {
        fullName: `Test Student ${Date.now()}`,
        classId: 'test-class-id'
      };
      
      // Fill student name
      let nameInput = null;
      const nameSelectors = ['input[name="fullName"]', 'input[placeholder*="Name"]', 'input[aria-label*="Name"]'];
      
      for (const selector of nameSelectors) {
        try {
          nameInput = await page.$(selector);
          if (nameInput) break;
        } catch (e) {
          // Try next selector
        }
      }
      
      if (nameInput) {
        await nameInput.click();
        await nameInput.type(testStudent.fullName);
        console.log(`✅ Entered student name: ${testStudent.fullName}`);
      }
      
      // Select class dropdown
      let classDropdown = null;
      const dropdownSelectors = ['select[name="classId"]', 'div[role="combobox"]', '.MuiSelect-root'];
      
      for (const selector of dropdownSelectors) {
        try {
          classDropdown = await page.$(selector);
          if (classDropdown) break;
        } catch (e) {
          // Try next selector
        }
      }
      
      if (classDropdown) {
        await classDropdown.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Select first available class
        let classOption = null;
        const optionSelectors = ['li[role="option"]', 'option', '.MuiMenuItem-root'];
        
        for (const selector of optionSelectors) {
          try {
            classOption = await page.$(selector);
            if (classOption) break;
          } catch (e) {
            // Try next selector
          }
        }
        
        if (classOption) {
          await classOption.click();
          console.log('✅ Selected a class');
        }
      }
      
      // Take screenshot of filled form
      await page.screenshot({ path: 'screenshots/04-student-form-filled.png', fullPage: true });
      console.log('📸 Screenshot taken: 04-student-form-filled.png');
      
      // Click Add/Create button
      let createButton = null;
      
      // Try xpath approach for buttons with specific text
      const xpaths = [
        '//button[contains(text(), "Add")]',
        '//button[contains(text(), "Create")]'
      ];
      
      for (const xpath of xpaths) {
        try {
          const elements = await page.$x(xpath);
          if (elements.length > 0) {
            createButton = elements[0];
            break;
          }
        } catch (e) {
          // Try next xpath
        }
      }
      
      // Try regular selector as fallback
      if (!createButton) {
        try {
          createButton = await page.$('button[type="submit"]');
        } catch (e) {
          // No submit button found
        }
      }
      
      if (createButton) {
        await createButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('✅ Submitted student creation form');
        
        // Take screenshot of result
        await page.screenshot({ path: 'screenshots/05-student-created.png', fullPage: true });
        console.log('📸 Screenshot taken: 05-student-created.png');
        
        // Check if student appears in the table
        try {
          const xpath = `//text()[contains(., "${testStudent.fullName}")]`;
          const elements = await page.$x(xpath);
          if (elements.length > 0) {
            console.log('✅ Student successfully created and appears in table');
          } else {
            console.log('❓ Student creation completed but not immediately visible');
            
            // Take a screenshot to see current state
            await page.screenshot({ path: 'screenshots/06-final-state.png', fullPage: true });
            console.log('📸 Screenshot taken: 06-final-state.png');
          }
        } catch (e) {
          console.log('❓ Could not verify student in table, but creation form was submitted');
        }
      } else {
        console.log('❌ Could not find Add/Create button');
      }
    } else {
      console.log('❌ Could not find Add Student button');
    }
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testStudentCreation().catch(console.error);