import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

// Firebase configuration — uses environment variables with validation
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Validate config — warn on missing values instead of silently using placeholders
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(
  (key) => !firebaseConfig[key] || firebaseConfig[key].startsWith('YOUR_')
);
if (missingKeys.length > 0) {
  console.error(
    `[Firebase] Missing required config keys: ${missingKeys.join(', ')}. ` +
    'Set VITE_FIREBASE_* environment variables in your .env file.'
  );
}

const app = initializeApp(firebaseConfig);

// Conditionally initialize analytics — only in browser environments that support it
let analytics = null;
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch(() => {
    // Analytics not available — silently skip
  });

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  analytics,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
};

export default app;
