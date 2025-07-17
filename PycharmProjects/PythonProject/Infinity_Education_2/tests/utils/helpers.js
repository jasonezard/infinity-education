const fs = require('fs');
const path = require('path');
const config = require('../config');

class TestHelpers {
  static async login(browserManager, userType = 'admin') {
    const user = config.testUsers[userType];
    const page = browserManager.getPage();
    
    console.log(`Attempting to login as ${userType}: ${user.email}`);
    
    // Wait for login form
    await browserManager.waitForSelector('input[type="email"]');
    
    // Fill login form
    await browserManager.clearAndType('input[type="email"]', user.email);
    await browserManager.clearAndType('input[type="password"]', user.password);
    
    // Click login button
    await browserManager.click('button[type="submit"]');
    
    // Wait for successful login (dashboard should appear)
    await browserManager.waitForText('Dashboard', 15000);
    
    console.log(`Successfully logged in as ${userType}`);
    return true;
  }

  static async logout(browserManager) {
    const page = browserManager.getPage();
    
    try {
      // Click profile avatar
      await browserManager.click('[data-testid="profile-avatar"], .MuiAvatar-root', { timeout: 5000 });
      
      // Click logout option
      await browserManager.click('text=Sign Out', { timeout: 5000 });
      
      // Wait for login page
      await browserManager.waitForText('Infinity Education', 10000);
      
      console.log('Successfully logged out');
      return true;
    } catch (error) {
      console.log('Logout failed, might already be logged out');
      return false;
    }
  }

  static async createClass(browserManager, className) {
    console.log(`Creating class: ${className}`);
    
    // Click Add Class button
    await browserManager.click('text=Add Class');
    
    // Wait for dialog
    await browserManager.waitForSelector('input[label="Class Name"]');
    
    // Fill class name
    await browserManager.clearAndType('input[label="Class Name"]', className);
    
    // Select teacher (assuming first teacher in dropdown)
    await browserManager.click('[data-testid="teacher-select"]');
    await browserManager.click('[data-value][data-testid="teacher-option"]:first-child');
    
    // Click create button
    await browserManager.click('text=Create');
    
    // Wait for success message or class to appear in table
    await browserManager.waitForText(className, 10000);
    
    console.log(`Successfully created class: ${className}`);
    return true;
  }

  static async createStudent(browserManager, studentName, className) {
    console.log(`Creating student: ${studentName} in class: ${className}`);
    
    // Navigate to students page
    await browserManager.click('text=Students');
    
    // Click Add Student button
    await browserManager.click('text=Add Student');
    
    // Wait for dialog
    await browserManager.waitForSelector('input[label="Student Name"]');
    
    // Fill student name
    await browserManager.clearAndType('input[label="Student Name"]', studentName);
    
    // Select class
    await browserManager.click('[data-testid="class-select"]');
    await browserManager.click(`text=${className}`);
    
    // Click create button
    await browserManager.click('text=Create');
    
    // Wait for success message or student to appear
    await browserManager.waitForText(studentName, 10000);
    
    console.log(`Successfully created student: ${studentName}`);
    return true;
  }

  static async createAnecdotalRecord(browserManager, studentName, note) {
    console.log(`Creating anecdotal record for: ${studentName}`);
    
    // Navigate to add record page
    await browserManager.click('text=Add Record');
    
    // Wait for form
    await browserManager.waitForSelector('[data-testid="student-select"]');
    
    // Select student
    await browserManager.click('[data-testid="student-select"]');
    await browserManager.click(`text=${studentName}`);
    
    // Fill observation note
    await browserManager.clearAndType('textarea[label="Observation Note"]', note);
    
    // Select educational value
    await browserManager.click('[data-testid="value-select"]');
    await browserManager.click('text=Communication');
    
    // Click save button
    await browserManager.click('text=Save Record');
    
    // Wait for success message
    await browserManager.waitForText('Successfully created', 10000);
    
    console.log(`Successfully created anecdotal record for: ${studentName}`);
    return true;
  }

  static async takeScreenshot(browserManager, testName, step = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${testName}${step ? '-' + step : ''}-${timestamp}`;
    
    await this.ensureScreenshotDir();
    await browserManager.screenshot(filename);
    
    console.log(`Screenshot saved: ${filename}.png`);
  }

  static async ensureScreenshotDir() {
    const screenshotDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  }

  static async waitForPageLoad(browserManager, expectedText = 'Dashboard') {
    try {
      await browserManager.waitForText(expectedText, 15000);
      return true;
    } catch (error) {
      console.log(`Page load failed, expected text "${expectedText}" not found`);
      return false;
    }
  }

  static async checkElementExists(browserManager, selector) {
    return await browserManager.isElementVisible(selector);
  }

  static async getElementText(browserManager, selector) {
    try {
      return await browserManager.getText(selector);
    } catch (error) {
      console.log(`Failed to get text from element: ${selector}`);
      return '';
    }
  }

  static generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static logTestResult(testName, success, message = '') {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${testName}${message ? ': ' + message : ''}`);
  }

  static async handleErrorGracefully(browserManager, error, testName) {
    console.error(`Error in ${testName}:`, error.message);
    await this.takeScreenshot(browserManager, testName, 'error');
    return false;
  }
}

module.exports = TestHelpers;