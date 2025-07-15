import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Validate Firebase configuration
const requiredConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check for missing environment variables
const missingKeys = Object.entries(requiredConfig).filter(([_, value]) => !value);
if (missingKeys.length > 0) {
  console.error('Missing Firebase environment variables:', missingKeys.map(([key]) => `VITE_FIREBASE_${key.toUpperCase()}`));
  console.error('Please check your environment variables in Kinsta dashboard');
}

const firebaseConfig = {
  apiKey: requiredConfig.apiKey || "AIzaSyC_oar2BqxEZ1fvPTa0CBx9xvWPrqBrMdU",
  authDomain: requiredConfig.authDomain || "infinity-education-26e2a.firebaseapp.com",
  projectId: requiredConfig.projectId || "infinity-education-26e2a",
  storageBucket: requiredConfig.storageBucket || "infinity-education-26e2a.firebasestorage.app",
  messagingSenderId: requiredConfig.messagingSenderId || "848919414951",
  appId: requiredConfig.appId || "1:848919414951:web:260e7a364ea90e0221f382"
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Initialize with fallback config
  app = initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export default app;