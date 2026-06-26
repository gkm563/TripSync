import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Trip, TripMemberInvitation, User } from '../types';
import { USE_FIREBASE, db } from '../firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  updateDoc, 
  onSnapshot,
  arrayUnion,
  getDoc
} from 'firebase/firestore';

interface TripState {
  trips: Trip[];
  invitations: TripMemberInvitation[];
  loading: boolean;
  error: string | null;
  databaseWipedWarning: boolean;
  
  createTrip: (
    name: string, 
    description: string, 
    startDate: string, 
    expectedEndDate: string, 
    coverImage: string,
    creator: User
  ) => Promise<Trip>;
  
  inviteMember: (tripId: string, email: string, invitedBy: User) => Promise<void>;
  
  respondToInvitation: (
    invitationId: string, 
    userId: string, 
    accept: boolean
  ) => Promise<void>;
  
  requestEndTrip: (tripId: string, userId: string) => Promise<void>;
  cancelEndTrip: (tripId: string, userId: string) => Promise<void>;
  
  syncTrips: (userId: string) => () => void;
  syncInvitations: (email: string) => () => void;
  addMockInvitation: (inv: TripMemberInvitation) => void;
  confirmResetLocalData: () => void;
  dismissWipedWarning: () => void;
  clearData: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      invitations: [],
      loading: false,
      error: null,
      databaseWipedWarning: false,

      createTrip: async (name, description, startDate, expectedEndDate, coverImage, creator) => {
        set({ loading: true, error: null });
        const initialMembers = (USE_FIREBASE && db)
          ? [creator.uid]
          : Array.from(new Set([creator.uid, 'gautam_uid', 'rohit_uid', 'praveen_uid']));
        const newTrip: Trip = {
          id: `trip_${Date.now()}`,
          name,
          description,
          startDate,
          expectedEndDate,
          coverImage: coverImage || 'gradient_1',
          status: 'active',
          members: initialMembers,
          endRequests: [],
          createdAt: new Date().toISOString(),
          createdBy: creator.uid,
        };

        try {
          if (USE_FIREBASE && db) {
            await setDoc(doc(db, 'trips', newTrip.id), newTrip);
          } else {
            set((state) => ({
              trips: [newTrip, ...state.trips],
            }));
          }
          set({ loading: false });
          return newTrip;
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      inviteMember: async (tripId, email, invitedBy) => {
        set({ loading: true, error: null });
        const safeEmail = (email || '').toLowerCase();
        const invitationId = `${tripId}_${safeEmail.replace(/\./g, '_')}`;
        const newInvitation: TripMemberInvitation = {
          id: invitationId,
          tripId,
          email: safeEmail,
          userId: null,
          status: 'invited',
          invitedBy: invitedBy.name,
          invitedAt: new Date().toISOString(),
        };

        try {
          if (USE_FIREBASE && db) {
            await setDoc(doc(db, 'tripMembers', invitationId), newInvitation);
          } else {
            set((state) => {
              const exists = state.invitations.some(i => i.id === invitationId);
              const updated = exists 
                ? state.invitations.map(i => i.id === invitationId ? newInvitation : i)
                : [...state.invitations, newInvitation];
              return { invitations: updated };
            });
          }
          set({ loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      respondToInvitation: async (invitationId, userId, accept) => {
        set({ loading: true, error: null });
        try {
          const status = (accept ? 'accepted' : 'declined') as 'accepted' | 'declined';
          const respondedAt = new Date().toISOString();

          if (USE_FIREBASE && db) {
            const invRef = doc(db, 'tripMembers', invitationId);
            await updateDoc(invRef, {
              status,
              userId,
              respondedAt,
            });

            if (accept) {
              const invSnap = await getDoc(invRef);
              if (invSnap.exists()) {
                const tripId = invSnap.data().tripId;
                const tripRef = doc(db, 'trips', tripId);
                await updateDoc(tripRef, {
                  members: arrayUnion(userId),
                });
              }
            }
          } else {
            set((state) => {
              const updatedInvitations = state.invitations.map((inv) => {
                if (inv.id === invitationId) {
                  return { ...inv, status, userId, respondedAt };
                }
                return inv;
              });

              let updatedTrips = state.trips;
              if (accept) {
                const invitation = state.invitations.find(inv => inv.id === invitationId);
                if (invitation) {
                  updatedTrips = state.trips.map((trip) => {
                    if (trip.id === invitation.tripId) {
                      const members = trip.members.includes(userId)
                        ? trip.members
                        : [...trip.members, userId];
                      return { ...trip, members };
                    }
                    return trip;
                  });
                }
              }

              return {
                invitations: updatedInvitations,
                trips: updatedTrips,
              };
            });
          }
          set({ loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      requestEndTrip: async (tripId, userId) => {
        try {
          if (USE_FIREBASE && db) {
            const tripRef = doc(db, 'trips', tripId);
            const tripSnap = await getDoc(tripRef);
            if (tripSnap.exists()) {
              const tripData = tripSnap.data() as Trip;
              const currentRequests = tripData.endRequests || [];
              if (!currentRequests.includes(userId)) {
                const updatedRequests = [...currentRequests, userId];
                const shouldComplete = updatedRequests.length === tripData.members.length;
                await updateDoc(tripRef, {
                  endRequests: arrayUnion(userId),
                  status: shouldComplete ? 'completed' : 'active',
                });
              }
            }
          } else {
            set((state) => {
              const trips = state.trips.map((trip) => {
                if (trip.id === tripId) {
                  const endRequests = trip.endRequests.includes(userId)
                    ? trip.endRequests
                    : [...trip.endRequests, userId];
                  const shouldComplete = endRequests.length === trip.members.length;
                  return {
                    ...trip,
                    endRequests,
                    status: (shouldComplete ? 'completed' : 'active') as 'completed' | 'active',
                  };
                }
                return trip;
              });
              return { trips };
            });
          }
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      cancelEndTrip: async (tripId, userId) => {
        try {
          if (USE_FIREBASE && db) {
            const tripRef = doc(db, 'trips', tripId);
            const tripSnap = await getDoc(tripRef);
            if (tripSnap.exists()) {
              const tripData = tripSnap.data() as Trip;
              const endRequests = (tripData.endRequests || []).filter(id => id !== userId);
              await updateDoc(tripRef, {
                endRequests,
                status: 'active',
              });
            }
          } else {
            set((state) => ({
              trips: state.trips.map((trip) => {
                if (trip.id === tripId) {
                  return {
                    ...trip,
                    endRequests: trip.endRequests.filter(id => id !== userId),
                    status: 'active',
                  };
                }
                return trip;
              }),
            }));
          }
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      syncTrips: (userId) => {
        if (!userId) return () => {};
        if (USE_FIREBASE && db) {
          const q = query(collection(db, 'trips'), where('members', 'array-contains', userId));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const tripsList: Trip[] = [];
            snapshot.forEach((docSnap) => {
              tripsList.push(docSnap.data() as Trip);
            });
            
            const hadTrips = get().trips.length > 0;
            if (snapshot.empty && hadTrips) {
              set({ databaseWipedWarning: true });
            } else {
              set({ trips: tripsList, databaseWipedWarning: false });
            }
          }, (error) => {
            console.warn("Firestore snapshot listener error (trips):", error);
          });
          return unsubscribe;
        } else {
          // Mock mode: sync mock users as active members
          const currentTrips = get().trips;
          const mockUids = ['gautam_uid', 'rohit_uid', 'praveen_uid'];
          let changed = false;
          const updatedTrips = currentTrips.map(t => {
            const hasAll = mockUids.every(uid => t.members.includes(uid));
            if (!hasAll) {
              changed = true;
              const newMembers = [...t.members];
              mockUids.forEach(uid => {
                if (!newMembers.includes(uid)) {
                  newMembers.push(uid);
                }
              });
              return { ...t, members: newMembers };
            }
            return t;
          });
          if (changed) {
            set({ trips: updatedTrips });
          }
        }
        return () => {};
      },

      syncInvitations: (email) => {
        if (!email) return () => {};
        if (USE_FIREBASE && db) {
          const q = query(
            collection(db, 'tripMembers'), 
            where('email', '==', email.toLowerCase()), 
            where('status', '==', 'invited')
          );
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const invs: TripMemberInvitation[] = [];
            snapshot.forEach((docSnap) => {
              invs.push(docSnap.data() as TripMemberInvitation);
            });
            set({ invitations: invs });
          }, (error) => {
            console.warn("Firestore snapshot listener error (invitations):", error);
          });
          return unsubscribe;
        }
        return () => {};
      },

      addMockInvitation: (inv) => {
        set((state) => {
          const exists = state.invitations.some(i => i.id === inv.id);
          if (exists) return state;
          return { invitations: [...state.invitations, inv] };
        });
      },

      confirmResetLocalData: () => {
        set({ trips: [], databaseWipedWarning: false });
      },

      dismissWipedWarning: () => {
        set({ databaseWipedWarning: false });
      },

      clearData: () => {
        set({ trips: [], invitations: [], databaseWipedWarning: false });
      },
    }),
    {
      name: 'tripsync-trip-store',
    }
  )
);
