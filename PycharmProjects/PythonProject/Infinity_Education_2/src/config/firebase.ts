import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC_oar2BqxEZ1fvPTa0CBx9xvWPrqBrMdU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "infinity-education-26e2a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "infinity-education-26e2a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "infinity-education-26e2a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "848919414951",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:848919414951:web:260e7a364ea90e0221f382"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;