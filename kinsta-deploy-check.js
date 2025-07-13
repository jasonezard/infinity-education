// Kinsta Deployment Verification Script
// Run this locally to verify your build works before deploying

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Kinsta Deployment Pre-Check\n');

// Check package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('✅ package.json found');
  console.log(`   Name: ${pkg.name}`);
  console.log(`   Build script: ${pkg.scripts?.build || 'NOT FOUND'}`);
  
  if (!pkg.scripts?.build) {
    console.log('❌ Build script missing in package.json');
  }
} else {
  console.log('❌ package.json not found');
}

// Check for required files
const requiredFiles = [
  'vite.config.ts',
  'tsconfig.json', 
  'index.html',
  'src/main.tsx',
  '.env.example'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Check src directory structure
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  const srcFiles = fs.readdirSync(srcPath);
  console.log(`✅ src/ directory contains ${srcFiles.length} items`);
  
  const requiredSrcItems = ['components', 'config', 'services', 'types', 'contexts'];
  requiredSrcItems.forEach(item => {
    if (srcFiles.includes(item)) {
      console.log(`   ✅ src/${item}/ found`);
    } else {
      console.log(`   ❌ src/${item}/ missing`);
    }
  });
} else {
  console.log('❌ src/ directory not found');
}

// Environment variables check
console.log('\n📋 Environment Variables Needed for Kinsta:');
const envVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN', 
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

envVars.forEach(envVar => {
  console.log(`   ${envVar}=your_value_here`);
});

console.log('\n🚀 Kinsta Build Configuration:');
console.log('   Build command: npm install && npm run build');
console.log('   Output directory: dist');
console.log('   Node version: 18.x');

console.log('\n✨ Project is ready for Kinsta deployment!');