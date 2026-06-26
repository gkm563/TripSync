import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { USE_FIREBASE, auth, db, mockUsersList } from '../firebase/config';
import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

interface AuthState {
  user: User | null;
  usersList: User[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (uid: string) => void;
  registerUser: (name: string, email: string, password?: string) => Promise<void>;
  updateProfile: (name: string, photoURL: string, upiId?: string, bio?: string) => Promise<void>;
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
          }, (error) => {
            console.warn("Firestore snapshot listener error (users):", error);
          });
        }

        if (USE_FIREBASE && auth) {
          auth.onAuthStateChanged(async (firebaseUser: any) => {
            if (firebaseUser) {
              const userRef = doc(db, 'users', firebaseUser.uid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const u = userSnap.data() as User;
                set((state) => {
                  const exists = state.usersList.some(user => user.uid === u.uid);
                  return {
                    user: u,
                    usersList: exists ? state.usersList : [...state.usersList, u],
                    loading: false
                  };
                });
              } else {
                // Auto-create profile in Firestore
                const newUser: User = {
                  uid: firebaseUser.uid,
                  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  email: firebaseUser.email || '',
                  photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  joinedAt: new Date().toISOString(),
                  fcmToken: null,
                };
                await setDoc(userRef, newUser);
                set((state) => {
                  const exists = state.usersList.some(user => user.uid === newUser.uid);
                  return {
                    user: newUser,
                    usersList: exists ? state.usersList : [...state.usersList, newUser],
                    loading: false
                  };
                });
              }
            } else {
              set({ user: null, loading: false });
            }
          });
        } else if (!USE_FIREBASE) {
          // Initialize mock: use Gautam if none is logged in
          const current = get().user;
          if (!current) {
            set({ user: mockUsersList[0] });
          }
        }
      },

      login: async (email: string, password?: string) => {
        set({ loading: true, error: null });
        const securePassword = password || 'password123';
        try {
          if (USE_FIREBASE && auth) {
            const credentials = await signInWithEmailAndPassword(auth, email, securePassword);
            const userRef = doc(db, 'users', credentials.user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const u = userSnap.data() as User;
              set((state) => {
                const exists = state.usersList.some(user => user.uid === u.uid);
                return {
                  user: u,
                  usersList: exists ? state.usersList : [...state.usersList, u],
                  loading: false
                };
              });
            } else {
              const newUser: User = {
                uid: credentials.user.uid,
                name: email.split('@')[0],
                email,
                photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                joinedAt: new Date().toISOString(),
                fcmToken: null,
              };
              await setDoc(userRef, newUser);
              set((state) => {
                const exists = state.usersList.some(user => user.uid === newUser.uid);
                return {
                  user: newUser,
                  usersList: exists ? state.usersList : [...state.usersList, newUser],
                  loading: false
                };
              });
            }
          } else {
            // Mock auth flow
            const foundUser = get().usersList.find(u => u.email && email && u.email.toLowerCase() === email.toLowerCase());
            if (foundUser) {
              set({ user: foundUser, loading: false });
            } else {
              // Create new mock user
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
          const errorMsg = err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
            ? "Incorrect email or password. Please try again."
            : err.code === 'auth/user-not-found'
            ? "No user found with this email. Please sign up first."
            : err.message;
          set({ error: errorMsg, loading: false });
          throw new Error(errorMsg);
        }
      },

      loginWithGoogle: async () => {
        if (!USE_FIREBASE || !auth) {
          throw new Error("Firebase Authentication is disabled in mock mode.");
        }
        set({ loading: true, error: null });
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const firebaseUser = result.user;
          
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const u = userSnap.data() as User;
            set({ user: u, loading: false });
          } else {
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
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      logout: async () => {
        if (USE_FIREBASE && auth) {
          try {
            await signOut(auth);
          } catch (e) {
            console.warn("Failed to sign out from Firebase:", e);
          }
        }
        set({ user: null });
      },

      switchUser: (uid: string) => {
        const targetUser = get().usersList.find(u => u.uid === uid);
        if (targetUser) {
          set({ user: targetUser });
        }
      },

      registerUser: async (name: string, email: string, password?: string) => {
        set({ loading: true, error: null });
        const securePassword = password || 'password123';
        try {
          if (USE_FIREBASE && auth) {
            const credentials = await createUserWithEmailAndPassword(auth, email, securePassword);
            const newUser: User = {
              uid: credentials.user.uid,
              name,
              email,
              photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              joinedAt: new Date().toISOString(),
              fcmToken: null,
            };
            await setDoc(doc(db, 'users', newUser.uid), newUser);
            set((state) => {
              const exists = state.usersList.some(user => user.uid === newUser.uid);
              return {
                user: newUser,
                usersList: exists ? state.usersList : [...state.usersList, newUser],
                loading: false
              };
            });
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
          const errorMsg = err.code === 'auth/email-already-in-use'
            ? "This email is already registered. Please sign in instead."
            : err.code === 'auth/weak-password'
            ? "Password should be at least 6 characters long."
            : err.message;
          set({ error: errorMsg, loading: false });
          throw new Error(errorMsg);
        }
      },

      updateProfile: async (name: string, photoURL: string, upiId?: string, bio?: string) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ loading: true, error: null });
        const updatedFields = {
          name,
          photoURL,
          ...(upiId !== undefined && { upiId }),
          ...(bio !== undefined && { bio }),
        };

        const updatedUser = { ...currentUser, ...updatedFields };
        
        try {
          if (USE_FIREBASE && db) {
            await setDoc(doc(db, 'users', currentUser.uid), updatedFields, { merge: true });
          }
          
          const updatedUsersList = get().usersList.map((u) => 
            u.uid === currentUser.uid ? { ...u, ...updatedFields } : u
          );

          set({ 
            user: updatedUser, 
            usersList: updatedUsersList, 
            loading: false 
          });
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },
    }),
    {
      name: 'tripsync-auth-store',
    }
  )
);
