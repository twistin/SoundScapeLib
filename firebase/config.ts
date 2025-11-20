
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// For development/demo purposes, we can use placeholders or assume env vars
// In a real app, these would be process.env.REACT_APP_FIREBASE_...
const firebaseConfig = {
  apiKey: process.env.API_KEY || "mock_key", 
  authDomain: "soundscape-app.firebaseapp.com",
  projectId: "soundscape-app",
  storageBucket: "soundscape-app.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, functions, googleProvider };
