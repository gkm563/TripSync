import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, ExpenseVersion, PersonalExpense, ActivityLog } from '../types';
import { getRequiredMajority, calculateNetScore, determineStatus } from '../utils/approvalEngine';
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
  getDoc,
  deleteDoc
} from 'firebase/firestore';

interface ExpenseState {
  expenses: Expense[];
  personalExpenses: PersonalExpense[];
  expenseVersions: ExpenseVersion[];
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;

  addExpense: (
    tripId: string,
    title: string,
    amount: number,
    category: Expense['category'],
    paidBy: Record<string, number>,
    createdBy: string,
    creatorName: string,
    date: string,
    time: string,
    notes?: string,
    totalMembersCount?: number
  ) => Promise<{ expense: Expense; duplicateWarning: boolean }>;

  editExpense: (
    expenseId: string,
    title: string,
    amount: number,
    category: Expense['category'],
    paidBy: Record<string, number>,
    updatedBy: string,
    updaterName: string,
    date: string,
    time: string,
    notes?: string,
    totalMembersCount?: number
  ) => Promise<void>;

  voteExpense: (
    expenseId: string,
    userId: string,
    userName: string,
    vote: 1 | -1,
    rejectReason?: string,
    totalMembersCount?: number
  ) => Promise<void>;

  addPersonalExpense: (
    userId: string,
    tripId: string,
    title: string,
    amount: number,
    category: string,
    date: string,
    time: string,
    notes?: string
  ) => Promise<void>;

  deletePersonalExpense: (id: string) => Promise<void>;

  logActivity: (
    tripId: string,
    userId: string,
    userName: string,
    action: string,
    type: ActivityLog['type']
  ) => Promise<void>;

  checkForDuplicates: (
    tripId: string,
    title: string,
    amount: number,
    category: string
  ) => boolean;

  syncExpenses: (tripId: string) => () => void;
  syncPersonalExpenses: (tripId: string, userId: string) => () => void;
  syncActivityLogs: (tripId: string) => () => void;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      personalExpenses: [],
      expenseVersions: [],
      activityLogs: [],
      loading: false,
      error: null,

      checkForDuplicates: (tripId, title, amount, category) => {
        const checkTimeLimit = 10 * 60 * 1000; // 10 minutes
        const now = Date.now();
        
        return get().expenses.some((exp) => {
          if (exp.tripId !== tripId || exp.amount !== amount || exp.category !== category) {
            return false;
          }
          // Time diff check
          const expTime = new Date(exp.createdAt).getTime();
          if (now - expTime > checkTimeLimit) {
            return false;
          }
          // Fuzzy title check
          const t1 = title.toLowerCase().trim();
          const t2 = exp.title.toLowerCase().trim();
          return t1.includes(t2) || t2.includes(t1);
        });
      },

      addExpense: async (
        tripId,
        title,
        amount,
        category,
        paidBy,
        createdBy,
        creatorName,
        date,
        time,
        notes = '',
        totalMembersCount = 1
      ) => {
        set({ loading: true, error: null });

        // Check for duplicates
        const hasDuplicate = get().checkForDuplicates(tripId, title, amount, category);

        const majority = getRequiredMajority(totalMembersCount);
        // Creator automatically gets +1 vote
        const votes = { [createdBy]: 1 };
        // If 1 member, it's instantly approved
        const status = totalMembersCount <= 1 ? 'approved' : 'pending';

        const newExpense: Expense = {
          id: `exp_${Date.now()}`,
          tripId,
          title,
          amount,
          category,
          paidBy,
          createdBy,
          createdAt: new Date().toISOString(),
          date,
          time,
          notes,
          status,
          votes,
          rejectReasons: {},
          version: 1,
          updatedAt: new Date().toISOString(),
          updatedBy: createdBy,
        };

        try {
          if (USE_FIREBASE && db) {
            await setDoc(doc(db, 'expenses', newExpense.id), newExpense);
          } else {
            set((state) => ({
              expenses: [newExpense, ...state.expenses],
            }));
          }

          // Add to activity logs
          await get().logActivity(
            tripId,
            createdBy,
            creatorName,
            `${creatorName} added expense: ${title} (₹${amount})`,
            'expense_added'
          );

          set({ loading: false });
          return { expense: newExpense, duplicateWarning: hasDuplicate };
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      editExpense: async (
        expenseId,
        title,
        amount,
        category,
        paidBy,
        updatedBy,
        updaterName,
        date,
        time,
        notes = '',
        totalMembersCount = 1
      ) => {
        set({ loading: true, error: null });
        try {
          let currentExpense = get().expenses.find((e) => e.id === expenseId);
          
          if (USE_FIREBASE && db) {
            const expSnap = await getDoc(doc(db, 'expenses', expenseId));
            if (expSnap.exists()) {
              currentExpense = expSnap.data() as Expense;
            }
          }

          if (!currentExpense) {
            throw new Error('Expense not found');
          }

          // 1. Archive the current version
          const archivedVersion: ExpenseVersion = {
            id: `ver_${expenseId}_${currentExpense.version}`,
            expenseId: currentExpense.id,
            version: currentExpense.version,
            title: currentExpense.title,
            amount: currentExpense.amount,
            category: currentExpense.category,
            paidBy: currentExpense.paidBy,
            notes: currentExpense.notes,
            date: currentExpense.date,
            time: currentExpense.time,
            status: currentExpense.status,
            votes: currentExpense.votes,
            rejectReasons: currentExpense.rejectReasons,
            updatedBy: currentExpense.updatedBy,
            updatedAt: currentExpense.updatedAt,
          };

          // 2. Prepare the updated fields
          const majority = getRequiredMajority(totalMembersCount);
          
          // Reset votes to only include updatedBy's +1 vote
          const votes = { [updatedBy]: 1 };
          const status = totalMembersCount <= 1 ? 'approved' : 'pending';

          const updatedExpense: Expense = {
            ...currentExpense,
            title,
            amount,
            category,
            paidBy,
            notes,
            date,
            time,
            status,
            votes,
            rejectReasons: {}, // Clear reasons on edit
            version: currentExpense.version + 1,
            updatedAt: new Date().toISOString(),
            updatedBy,
          };

          if (USE_FIREBASE && db) {
            // Write archive version
            await setDoc(doc(db, 'expenseVersions', archivedVersion.id), archivedVersion);
            // Update active expense
            await setDoc(doc(db, 'expenses', expenseId), updatedExpense);
          } else {
            set((state) => ({
              expenseVersions: [archivedVersion, ...state.expenseVersions],
              expenses: state.expenses.map((e) => (e.id === expenseId ? updatedExpense : e)),
            }));
          }

          // Log edit
          await get().logActivity(
            currentExpense.tripId,
            updatedBy,
            updaterName,
            `${updaterName} edited expense: ${title} to version ${updatedExpense.version}`,
            'expense_edited'
          );

          set({ loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      voteExpense: async (
        expenseId,
        userId,
        userName,
        vote,
        rejectReason = '',
        totalMembersCount = 1
      ) => {
        try {
          let currentExpense = get().expenses.find((e) => e.id === expenseId);

          if (USE_FIREBASE && db) {
            const expSnap = await getDoc(doc(db, 'expenses', expenseId));
            if (expSnap.exists()) {
              currentExpense = expSnap.data() as Expense;
            }
          }

          if (!currentExpense) {
            throw new Error('Expense not found');
          }

          if (currentExpense.updatedBy === userId) {
            throw new Error('As the creator/updater of this version, you cannot vote on this expense.');
          }

          const votes = { ...currentExpense.votes, [userId]: vote };
          const rejectReasons = { ...currentExpense.rejectReasons };

          if (vote === -1 && rejectReason) {
            rejectReasons[userId] = rejectReason;
          } else {
            delete rejectReasons[userId];
          }

          // Net vote score
          const netScore = calculateNetScore(votes);
          const majority = getRequiredMajority(totalMembersCount);
          const status = determineStatus(netScore, majority);

          const updatedExpense: Expense = {
            ...currentExpense,
            votes,
            rejectReasons,
            status,
            updatedAt: new Date().toISOString(),
          };

          if (USE_FIREBASE && db) {
            await setDoc(doc(db, 'expenses', expenseId), updatedExpense);
          } else {
            set((state) => ({
              expenses: state.expenses.map((e) => (e.id === expenseId ? updatedExpense : e)),
            }));
          }

          // Log vote
          const voteType = vote === 1 ? 'approved' : 'rejected';
          await get().logActivity(
            currentExpense.tripId,
            userId,
            userName,
            `${userName} ${voteType} expense: "${currentExpense.title}"${vote === -1 ? ` (${rejectReason})` : ''}`,
            vote === 1 ? 'expense_approved' : 'expense_rejected'
          );
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      addPersonalExpense: async (userId, tripId, title, amount, category, date, time, notes = '') => {
        const newPers: PersonalExpense = {
          id: `pers_${Date.now()}`,
          userId,
          tripId,
          title,
          amount,
          category,
          date,
          time,
          notes,
          createdAt: new Date().toISOString(),
        };

        try {
          if (USE_FIREBASE && db) {
            await setDoc(doc(db, 'personalExpenses', newPers.id), newPers);
          } else {
            set((state) => ({
              personalExpenses: [newPers, ...state.personalExpenses],
            }));
          }
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      deletePersonalExpense: async (id) => {
        try {
          if (USE_FIREBASE && db) {
            await deleteDoc(doc(db, 'personalExpenses', id));
          } else {
            set((state) => ({
              personalExpenses: state.personalExpenses.filter((p) => p.id !== id),
            }));
          }
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      logActivity: async (tripId, userId, userName, action, type) => {
        const newLog: ActivityLog = {
          id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          tripId,
          userId,
          userName,
          action,
          type,
          createdAt: new Date().toISOString(),
        };

        try {
          if (USE_FIREBASE && db) {
            await setDoc(doc(db, 'activityLogs', newLog.id), newLog);
          } else {
            set((state) => ({
              activityLogs: [newLog, ...state.activityLogs],
            }));
          }
        } catch (err: any) {
          console.warn('Failed to save activity log:', err);
        }
      },

      syncExpenses: (tripId) => {
        if (USE_FIREBASE && db) {
          const q = query(collection(db, 'expenses'), where('tripId', '==', tripId));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: Expense[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as Expense);
            });
            set({ expenses: list });
          });
          return unsubscribe;
        }
        return () => {};
      },

      syncPersonalExpenses: (tripId, userId) => {
        if (USE_FIREBASE && db) {
          const q = query(
            collection(db, 'personalExpenses'), 
            where('tripId', '==', tripId),
            where('userId', '==', userId)
          );
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: PersonalExpense[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as PersonalExpense);
            });
            set({ personalExpenses: list });
          });
          return unsubscribe;
        }
        return () => {};
      },

      syncActivityLogs: (tripId) => {
        if (USE_FIREBASE && db) {
          const q = query(collection(db, 'activityLogs'), where('tripId', '==', tripId));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: ActivityLog[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as ActivityLog);
            });
            // Sort by createdAt descending
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            set({ activityLogs: list });
          });
          return unsubscribe;
        }
        return () => {};
      },
    }),
    {
      name: 'tripsync-expense-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
