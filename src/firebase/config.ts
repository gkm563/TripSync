import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Placeholder firebase credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const isConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY";

export const USE_FIREBASE = isConfigured;

let app: any = null;
let auth: any = null;
let db: any = null;

if (USE_FIREBASE) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } else {
      app = getApp();
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    }
  } catch (error) {
    console.warn("Failed to initialize Firebase:", error);
  }
}

export { app, auth, db };
export const mockUsersList = [
  { uid: 'gautam_uid', name: 'Gautam', email: 'gautam@tripsync.com', photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', joinedAt: new Date().toISOString(), fcmToken: null },
  { uid: 'rohit_uid', name: 'Rohit', email: 'rohit@tripsync.com', photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', joinedAt: new Date().toISOString(), fcmToken: null },
  { uid: 'praveen_uid', name: 'Praveen', email: 'praveen@tripsync.com', photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80', joinedAt: new Date().toISOString(), fcmToken: null },
];
