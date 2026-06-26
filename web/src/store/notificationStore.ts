import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '../types';
import { USE_FIREBASE, db } from '../firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  onSnapshot,
  writeBatch,
  getDoc
} from 'firebase/firestore';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  activeBanner: Notification | null;

  addNotification: (
    userId: string,
    title: string,
    body: string,
    type: Notification['type'],
    tripId?: string,
    expenseId?: string,
    metadata?: Record<string, any>
  ) => Promise<void>;

  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  clearHistory: (userId: string) => Promise<void>;
  syncNotifications: (userId: string) => () => void;
  hideBanner: () => void;
  clearData: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      activeBanner: null,

      hideBanner: () => set({ activeBanner: null }),

      addNotification: async (userId, title, body, type, tripId, expenseId, metadata = {}) => {
        const newNotif: Notification = {
          id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          userId,
          tripId,
          expenseId,
          title,
          body,
          type,
          status: 'unread',
          createdAt: new Date().toISOString(),
          metadata,
        };

        try {
          if (USE_FIREBASE && db) {
            await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
          } else {
            set((state) => {
              const list = [newNotif, ...state.notifications];
              return {
                notifications: list,
                unreadCount: list.filter((n) => n.status === 'unread').length,
                activeBanner: newNotif,
              };
            });
          }

          // Fetch the recipient's push token from Firestore to send push notification to mobile
          let recipientToken: string | null = null;
          if (USE_FIREBASE && db) {
            try {
              const userSnap = await getDoc(doc(db, 'users', userId));
              if (userSnap.exists()) {
                recipientToken = userSnap.data()?.fcmToken || null;
              }
            } catch (e) {
              console.warn('Failed to fetch recipient token from Firestore:', e);
            }
          }

          if (!recipientToken) {
            try {
              // Try to find token in mock auth store list
              const authStore = (await import('./authStore')).useAuthStore;
              const recipientUser = authStore.getState().usersList.find((u: any) => u.uid === userId);
              if (recipientUser) {
                recipientToken = recipientUser.fcmToken || null;
              }
            } catch (err) {
              // Ignore
            }
          }

          // If a token exists, deliver push notification via Expo Push API so user's mobile device wakes up
          if (recipientToken) {
            try {
              await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Accept-encoding': 'gzip, deflate',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: recipientToken,
                  sound: 'default',
                  title: title,
                  body: body,
                  data: { tripId, expenseId, type },
                }),
              });
            } catch (pushErr) {
              console.warn('Failed to send push notification from Web:', pushErr);
            }
          }

        } catch (err: any) {
          console.warn('Failed to save notification:', err);
        }
      },

      markAsRead: async (notificationId) => {
        try {
          if (USE_FIREBASE && db) {
            await updateDoc(doc(db, 'notifications', notificationId), { status: 'read' });
          } else {
            set((state) => {
              const list = state.notifications.map((n) =>
                n.id === notificationId ? { ...n, status: 'read' as const } : n
              );
              return {
                notifications: list,
                unreadCount: list.filter((n) => n.status === 'unread').length,
              };
            });
          }
        } catch (err: any) {
          console.warn('Failed to mark notification as read:', err);
        }
      },

      markAllAsRead: async (userId) => {
        try {
          if (USE_FIREBASE && db) {
            const q = query(
              collection(db, 'notifications'),
              where('userId', '==', userId),
              where('status', '==', 'unread')
            );
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.forEach((docSnap) => {
              batch.update(docSnap.ref, { status: 'read' });
            });
            await batch.commit();
          } else {
            set((state) => {
              const list = state.notifications.map((n) => ({ ...n, status: 'read' as const }));
              return {
                notifications: list,
                unreadCount: 0,
              };
            });
          }
        } catch (err: any) {
          console.warn('Failed to mark all notifications as read:', err);
        }
      },

      clearHistory: async (userId) => {
        if (!userId) return;
        try {
          if (USE_FIREBASE && db) {
            const q = query(collection(db, 'notifications'), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.forEach((docSnap) => {
              batch.delete(docSnap.ref);
            });
            await batch.commit();
          } else {
            set({ notifications: [], unreadCount: 0 });
          }
        } catch (err: any) {
          console.warn('Failed to clear notifications:', err);
        }
      },

      syncNotifications: (userId) => {
        if (!userId) return () => {};
        if (USE_FIREBASE && db) {
          const q = query(collection(db, 'notifications'), where('userId', '==', userId));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: Notification[] = [];
            snapshot.forEach((docSnap) => {
              docSnap.exists() && list.push(docSnap.data() as Notification);
            });
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            const oldList = get().notifications;
            const newUnreads = list.filter(n => n.status === 'unread' && !oldList.some(old => old.id === n.id));
            
            set({
              notifications: list,
              unreadCount: list.filter((n) => n.status === 'unread').length,
              activeBanner: newUnreads.length > 0 ? newUnreads[0] : get().activeBanner,
            });
          }, (error) => {
            console.warn("Firestore snapshot listener error (notifications):", error);
          });
          return unsubscribe;
        }
        return () => {};
      },

      clearData: () => {
        set({ notifications: [], unreadCount: 0, activeBanner: null });
      },
    }),
    {
      name: 'tripsync-notification-store',
    }
  )
);
