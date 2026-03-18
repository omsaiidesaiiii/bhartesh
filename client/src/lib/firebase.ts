'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log warning if config is missing (only in development)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log("--- Firebase Diagnostics ---");
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (!value) {
      console.warn(`❌ Firebase config: ${key} is missing from environment variables.`);
    } else {
      console.log(`✅ Firebase config: ${key} is loaded (length: ${value.length})`);
      if (key === 'apiKey' && !value.startsWith('AIza')) {
        console.warn(`⚠️ Firebase config: apiKey does not start with "AIza". Make sure you're using a Client API Key, not a Service Account key.`);
      }
    }
  });
  console.log("---------------------------");
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Messaging is only supported in the browser
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;
export { isSupported };
