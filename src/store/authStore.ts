import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { USE_FIREBASE, auth, db, mockUsersList } from '../firebase/config';
import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';

interface AuthState {
  user: User | null;
  usersList: User[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (uid: string) => void;
  registerUser: (name: string, email: string) => Promise<void>;
  updateFcmToken: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      usersList: mockUsersList,
      loading: false,
      error: null,

      initialize: async () => {
        if (USE_FIREBASE && db) {
          // Subscribe to all users in Firestore to keep usersList populated
          onSnapshot(collection(db, 'users'), (snapshot) => {
            const users: User[] = [];
            snapshot.forEach((docSnap) => {
              users.push(docSnap.data() as User);
            });
            if (users.length > 0) {
              set({ usersList: users });
            }
          });
        }

        if (USE_FIREBASE && auth) {
          auth.onAuthStateChanged(async (firebaseUser: any) => {
            if (firebaseUser) {
              const userRef = doc(db, 'users', firebaseUser.uid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                set({ user: userSnap.data() as User, loading: false });
              } else {
                // Fallback / auto-create
                const newUser: User = {
                  uid: firebaseUser.uid,
                  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  email: firebaseUser.email || '',
                  photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  joinedAt: new Date().toISOString(),
                  fcmToken: null,
                };
                await setDoc(userRef, newUser);
                set({ user: newUser, loading: false });
              }
            } else {
              set({ user: null, loading: false });
            }
          });
        } else if (!USE_FIREBASE) {
          // Initialize mock: use the first mock user (Gautam) if none is logged in
          const current = get().user;
          if (!current) {
            set({ user: mockUsersList[0] });
          }
        }
      },

      login: async (email: string) => {
        set({ loading: true, error: null });
        try {
          if (USE_FIREBASE && auth) {
            // Standard credential flow in production
            // For email login without password (e.g. sign in with email link or default pwd)
            const mockPassword = 'password123';
            try {
              const credentials = await signInWithEmailAndPassword(auth, email, mockPassword);
              const userRef = doc(db, 'users', credentials.user.uid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                set({ user: userSnap.data() as User, loading: false });
              }
            } catch (err: any) {
              // Auto-register on login failure in Firebase if email is not found
              if (err.code === 'auth/user-not-found') {
                const credentials = await createUserWithEmailAndPassword(auth, email, mockPassword);
                const newUser: User = {
                  uid: credentials.user.uid,
                  name: email.split('@')[0],
                  email,
                  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  joinedAt: new Date().toISOString(),
                  fcmToken: null,
                };
                await setDoc(doc(db, 'users', newUser.uid), newUser);
                set({ user: newUser, loading: false });
              } else {
                throw err;
              }
            }
          } else {
            // Mock authentication flow
            const foundUser = get().usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (foundUser) {
              set({ user: foundUser, loading: false });
            } else {
              // Create a new mock user
              const newUser: User = {
                uid: `mock_${Date.now()}`,
                name: email.split('@')[0],
                email,
                photoURL: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&q=80`,
                joinedAt: new Date().toISOString(),
                fcmToken: null,
              };
              set({
                usersList: [...get().usersList, newUser],
                user: newUser,
                loading: false,
              });
            }
          }
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },

      logout: async () => {
        if (USE_FIREBASE && auth) {
          await signOut(auth);
        }
        set({ user: null });
      },

      switchUser: (uid: string) => {
        const targetUser = get().usersList.find(u => u.uid === uid);
        if (targetUser) {
          set({ user: targetUser });
        }
      },

      registerUser: async (name: string, email: string) => {
        set({ loading: true, error: null });
        try {
          if (USE_FIREBASE && auth) {
            const credentials = await createUserWithEmailAndPassword(auth, email, 'password123');
            const newUser: User = {
              uid: credentials.user.uid,
              name,
              email,
              photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              joinedAt: new Date().toISOString(),
              fcmToken: null,
            };
            await setDoc(doc(db, 'users', newUser.uid), newUser);
            set({ user: newUser, loading: false });
          } else {
            const newUser: User = {
              uid: `mock_${Date.now()}`,
              name,
              email,
              photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              joinedAt: new Date().toISOString(),
              fcmToken: null,
            };
            set({
              usersList: [...get().usersList, newUser],
              user: newUser,
              loading: false,
            });
          }
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },

      updateFcmToken: async (token: string) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, fcmToken: token };
        set({ user: updatedUser });

        if (USE_FIREBASE) {
          try {
            await setDoc(doc(db, 'users', currentUser.uid), { fcmToken: token }, { merge: true });
          } catch (e) {
            console.warn("Failed to save FCM token to Firebase:", e);
          }
        }
      },
    }),
    {
      name: 'tripsync-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
