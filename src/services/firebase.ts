/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, User } from "firebase/auth";

// Enterprise Firebase Configurations with environmental fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKeySmartClusterAI_2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartcluster-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smartcluster-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smartcluster-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "999888777666",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:999888777666:web:123456abcdef"
};

// Check if credentials are placeholders or real
export const isMockFirebase = 
  !import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.VITE_FIREBASE_API_KEY.includes("FakeKey");

let app;
let auth: any;
let googleProvider: any;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  console.warn("Firebase initialization skipped. Operating in SmartCluster Demo mode.", error);
}

export { app, auth, googleProvider };
