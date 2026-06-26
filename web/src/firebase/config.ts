import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase credentials for Vite web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.apiKey !== "";

export const USE_FIREBASE = !!isConfigured;

let app: any = null;
let auth: any = null;
let db: any = null;

if (USE_FIREBASE) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Failed to initialize Firebase App in Web:", error);
  }
}

export { app, auth, db };

export const mockUsersList = [
  { uid: 'gautam_uid', name: 'Gautam', email: 'gautam@tripsync.com', photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', joinedAt: new Date().toISOString(), fcmToken: null },
  { uid: 'rohit_uid', name: 'Rohit', email: 'rohit@tripsync.com', photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', joinedAt: new Date().toISOString(), fcmToken: null },
  { uid: 'praveen_uid', name: 'Praveen', email: 'praveen@tripsync.com', photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80', joinedAt: new Date().toISOString(), fcmToken: null },
];
