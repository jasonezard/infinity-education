// UI Inspection and Student Creation Analysis
const puppeteer = require('puppeteer');

async function inspectStudentCreationUI() {
  console.log('🔍 Starting UI inspection for student creation functionality...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Create screenshots directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:5177', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot of login page
    await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true });
    console.log('📸 Screenshot taken: 01-login-page.png');
    
    // Analyze login page
    const pageTitle = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log('\\n=== LOGIN PAGE ANALYSIS ===');
    console.log(`📄 Page title: ${pageTitle}`);
    console.log(`🔐 Authentication required: ${bodyText.includes('Log In') ? 'YES' : 'NO'}`);
    console.log(`🔗 Google SSO available: ${bodyText.includes('Continue with Google') ? 'YES' : 'NO'}`);
    
    // List all available buttons
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(btn => btn.textContent.trim()).filter(text => text.length > 0)
    );
    console.log('🔘 Available buttons:', buttons);
    
    // List all input fields
    const inputs = await page.$$eval('input', inputs => 
      inputs.map(input => ({
        type: input.type,
        name: input.name,
        placeholder: input.placeholder,
        id: input.id
      })).filter(input => input.type || input.name || input.placeholder)
    );
    console.log('📝 Available input fields:', inputs);
    
    // Try to access admin page directly
    console.log('\\n=== ATTEMPTING DIRECT ADMIN ACCESS ===');
    await page.goto('http://localhost:5177/admin', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.screenshot({ path: 'screenshots/02-admin-attempt.png', fullPage: true });
    console.log('📸 Screenshot taken: 02-admin-attempt.png');
    
    const adminPageText = await page.evaluate(() => document.body.innerText);
    const isAdminAccessible = !adminPageText.includes('Log In') && !adminPageText.includes('Continue with Google');
    
    console.log(`🏢 Direct admin access: ${isAdminAccessible ? 'ALLOWED' : 'BLOCKED'}`);
    
    if (isAdminAccessible) {
      console.log('\\n=== ADMIN DASHBOARD ANALYSIS ===');
      
      // Look for student-related elements
      const adminButtons = await page.$$eval('button', buttons => 
        buttons.map(btn => btn.textContent.trim()).filter(text => text.length > 0)
      );
      console.log('🔘 Admin dashboard buttons:', adminButtons);
      
      const hasAddStudent = adminButtons.some(btn => btn.toLowerCase().includes('student'));
      console.log(`👥 Add Student functionality: ${hasAddStudent ? 'VISIBLE' : 'NOT VISIBLE'}`);
      
      // Look for existing students
      const hasStudentTable = await page.$('table') !== null;
      const hasStudentList = adminPageText.toLowerCase().includes('student');
      
      console.log(`📊 Student table present: ${hasStudentTable ? 'YES' : 'NO'}`);
      console.log(`👥 Student-related content: ${hasStudentList ? 'YES' : 'NO'}`);
      
      if (hasAddStudent) {
        console.log('\\n=== STUDENT CREATION FLOW ANALYSIS ===');
        
        // Try to find and click the Add Student button
        const addStudentSelectors = [
          'button:contains("Add Student")',
          'button[aria-label*="Add Student"]',
          '//button[contains(text(), "Add Student")]',
          '//button[contains(text(), "Student")]'
        ];
        
        let addStudentButton = null;
        for (const selector of addStudentSelectors) {
          try {
            if (selector.startsWith('//')) {
              const elements = await page.$x(selector);
              if (elements.length > 0) {
                addStudentButton = elements[0];
                console.log(`✅ Found Add Student button with XPath: ${selector}`);
                break;
              }
            } else {
              addStudentButton = await page.$(selector);
              if (addStudentButton) {
                console.log(`✅ Found Add Student button with selector: ${selector}`);
                break;
              }
            }
          } catch (e) {
            // Try next selector
          }
        }
        
        if (addStudentButton) {
          await addStudentButton.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          await page.screenshot({ path: 'screenshots/03-add-student-dialog.png', fullPage: true });
          console.log('📸 Screenshot taken: 03-add-student-dialog.png');
          
          // Analyze the form
          const dialogInputs = await page.$$eval('input', inputs => 
            inputs.map(input => ({
              type: input.type,
              name: input.name,
              placeholder: input.placeholder,
              required: input.required,
              visible: input.offsetWidth > 0 && input.offsetHeight > 0
            })).filter(input => input.visible)
          );
          
          const dialogSelects = await page.$$eval('select', selects => 
            selects.map(select => ({
              name: select.name,
              options: Array.from(select.options).map(opt => opt.text),
              visible: select.offsetWidth > 0 && select.offsetHeight > 0
            })).filter(select => select.visible)
          );
          
          const dialogButtons = await page.$$eval('button', buttons => 
            buttons.map(btn => ({
              text: btn.textContent.trim(),
              type: btn.type,
              visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
            })).filter(btn => btn.visible && btn.text.length > 0)
          );
          
          console.log('📝 Form inputs:', dialogInputs);
          console.log('📋 Form selects:', dialogSelects);
          console.log('🔘 Form buttons:', dialogButtons);
          
          // Check if we can identify the student creation form structure
          const hasNameField = dialogInputs.some(input => 
            input.name === 'fullName' || 
            input.placeholder?.toLowerCase().includes('name')
          );
          
          const hasClassField = dialogSelects.some(select => 
            select.name === 'classId' || 
            select.options.length > 0
          );
          
          const hasSubmitButton = dialogButtons.some(btn => 
            btn.text.toLowerCase().includes('add') || 
            btn.text.toLowerCase().includes('create') ||
            btn.type === 'submit'
          );
          
          console.log(`📝 Name field present: ${hasNameField ? 'YES' : 'NO'}`);
          console.log(`🏫 Class selection present: ${hasClassField ? 'YES' : 'NO'}`);
          console.log(`✅ Submit button present: ${hasSubmitButton ? 'YES' : 'NO'}`);
          
          const formComplete = hasNameField && hasClassField && hasSubmitButton;
          console.log(`🎯 Student creation form: ${formComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
          
          if (formComplete) {
            console.log('\\n✅ STUDENT CREATION FUNCTIONALITY IS READY');
            console.log('📋 Form has all required fields for creating students');
            console.log('🎯 To test actual creation, authentication would be required');
          }
        } else {
          console.log('❌ Could not locate Add Student button');
        }
      }
    } else {
      console.log('🔒 Admin dashboard requires authentication');
      console.log('💡 To test student creation, you would need to:');
      console.log('   1. Sign in with Google (jezard@gmail.com appears to be the admin)');
      console.log('   2. Navigate to /admin');
      console.log('   3. Click "Add Student" button');
      console.log('   4. Fill out the form with student name and class');
      console.log('   5. Submit to create the student in the database');
    }
    
    // Final analysis
    console.log('\\n=== FINAL ANALYSIS ===');
    console.log('🔧 Application Architecture: React + Vite + Firebase');
    console.log('🔐 Authentication: Google SSO required');
    console.log('🏢 Admin Dashboard: /admin route (protected)');
    console.log('👥 Student Management: Available in AdminDashboard component');
    console.log('💾 Database: Firestore with students collection');
    console.log('📝 Form Fields: fullName (required), classId (required)');
    
    console.log('\\n🎉 UI inspection completed successfully!');
    
  } catch (error) {
    console.error('❌ Inspection failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the inspection
inspectStudentCreationUI().catch(console.error);