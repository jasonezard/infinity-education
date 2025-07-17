const fs = require('fs');
const path = require('path');

// Test runner configuration
const testFiles = [
  'auth.test.js',
  'admin-dashboard.test.js',
  'teacher-dashboard.test.js',
  'student-profile.test.js',
  'record-creation.test.js',
  'e2e-workflow.test.js'
];

class TestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(testFile) {
    console.log(`\\n🧪 Running test: ${testFile}`);
    console.log('='.repeat(50));
    
    try {
      const testPath = path.join(__dirname, testFile);
      
      if (!fs.existsSync(testPath)) {
        console.log(`❌ Test file not found: ${testFile}`);
        this.results.failed++;
        this.results.tests.push({ name: testFile, status: 'FAILED', error: 'File not found' });
        return false;
      }

      // Clear require cache to ensure fresh test runs
      delete require.cache[require.resolve(testPath)];
      
      const testModule = require(testPath);
      const result = await testModule.run();
      
      this.results.total++;
      
      if (result.success) {
        this.results.passed++;
        this.results.tests.push({ name: testFile, status: 'PASSED', ...result });
        console.log(`✅ ${testFile} - PASSED`);
      } else {
        this.results.failed++;
        this.results.tests.push({ name: testFile, status: 'FAILED', ...result });
        console.log(`❌ ${testFile} - FAILED: ${result.error}`);
      }
      
      return result.success;
    } catch (error) {
      this.results.total++;
      this.results.failed++;
      this.results.tests.push({ name: testFile, status: 'ERROR', error: error.message });
      console.error(`💥 ${testFile} - ERROR: ${error.message}`);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Infinity Education Test Suite');
    console.log('='.repeat(50));
    
    const startTime = Date.now();
    
    for (const testFile of testFiles) {
      await this.runTest(testFile);
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    this.printSummary(duration);
    return this.results.failed === 0;
  }

  async runSpecificTests(testNames) {
    console.log(`🚀 Running specific tests: ${testNames.join(', ')}`);
    console.log('='.repeat(50));
    
    const startTime = Date.now();
    
    for (const testName of testNames) {
      const testFile = testName.endsWith('.test.js') ? testName : `${testName}.test.js`;
      await this.runTest(testFile);
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    this.printSummary(duration);
    return this.results.failed === 0;
  }

  printSummary(duration) {
    console.log('\\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAILED' || test.status === 'ERROR')
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\\n' + '='.repeat(50));
    
    if (this.results.failed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log(`😞 ${this.results.failed} test(s) failed`);
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const runner = new TestRunner();
  
  if (args.length === 0 || args.includes('--all')) {
    await runner.runAllTests();
  } else if (args.includes('--auth')) {
    await runner.runSpecificTests(['auth']);
  } else if (args.includes('--admin')) {
    await runner.runSpecificTests(['admin-dashboard']);
  } else if (args.includes('--teacher')) {
    await runner.runSpecificTests(['teacher-dashboard']);
  } else if (args.includes('--student')) {
    await runner.runSpecificTests(['student-profile']);
  } else if (args.includes('--record')) {
    await runner.runSpecificTests(['record-creation']);
  } else if (args.includes('--e2e')) {
    await runner.runSpecificTests(['e2e-workflow']);
  } else {
    // Custom test names
    const testNames = args.filter(arg => !arg.startsWith('--'));
    await runner.runSpecificTests(testNames);
  }
  
  process.exit(runner.results.failed === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;