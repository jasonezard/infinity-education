const puppeteer = require('puppeteer');

const config = {
  // Test configuration
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  kinstaUrl: 'https://infinity-education-eyixv.kinsta.page',
  timeout: 30000,
  
  // Browser configuration
  browser: {
    headless: process.env.HEADLESS !== 'false',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    defaultViewport: {
      width: 1280,
      height: 720
    }
  },
  
  // Test users
  testUsers: {
    admin: {
      email: 'admin@infinityeducation.com',
      password: 'AdminPass123!',
      role: 'ADMIN'
    },
    teacher: {
      email: 'teacher@infinityeducation.com',
      password: 'TeacherPass123!',
      role: 'TEACHER'
    }
  },
  
  // Test data
  testData: {
    className: 'Test Class',
    studentName: 'Test Student',
    recordNote: 'This is a test anecdotal record for automated testing purposes.',
    educationalValue: 'Communication'
  }
};

module.exports = config;