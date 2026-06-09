export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  joinedAt: Date | any; // Firebase Timestamp or Date
  fcmToken: string | null;
}

export interface Trip {
  id: string;
  name: string;
  coverImage: string;
  startDate: string; // ISO String or YYYY-MM-DD
  expectedEndDate: string; // ISO String or YYYY-MM-DD
  description?: string;
  status: 'active' | 'completed';
  members: string[]; // User UIDs
  endRequests: string[]; // User UIDs who agreed to end the trip
  createdAt: Date | any;
  createdBy: string;
}

export interface TripMemberInvitation {
  id: string; // tripId_email
  tripId: string;
  email: string;
  userId: string | null;
  status: 'invited' | 'accepted' | 'declined';
  invitedBy: string;
  invitedAt: Date | any;
  respondedAt?: Date | any;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: 'Food' | 'Travel' | 'Hotel' | 'Shopping' | 'Other';
  paidBy: Record<string, number>; // userId -> amount paid
  createdBy: string;
  createdAt: Date | any;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  status: 'pending' | 'approved';
  votes: Record<string, number>; // userId -> 1 (approve) or -1 (reject)
  rejectReasons: Record<string, string>; // userId -> reason text
  version: number;
  updatedAt: Date | any;
  updatedBy: string;
}

export interface ExpenseVersion {
  id: string;
  expenseId: string;
  version: number;
  title: string;
  amount: number;
  category: 'Food' | 'Travel' | 'Hotel' | 'Shopping' | 'Other';
  paidBy: Record<string, number>;
  notes?: string;
  date: string;
  time: string;
  status: 'pending' | 'approved';
  votes: Record<string, number>;
  rejectReasons: Record<string, string>;
  updatedBy: string;
  updatedAt: Date | any;
}

export interface Vote {
  expenseId: string;
  userId: string;
  vote: 1 | -1;
  rejectReason?: string;
  createdAt: Date | any;
}

export interface Notification {
  id: string;
  userId: string; // recipient
  tripId?: string;
  expenseId?: string;
  title: string;
  body: string;
  type:
    | 'invitation'
    | 'expense_created'
    | 'expense_approved'
    | 'expense_rejected'
    | 'review_required'
    | 'trip_end_request'
    | 'trip_completed';
  status: 'unread' | 'read';
  createdAt: Date | any;
  metadata?: Record<string, any>;
}

export interface PersonalExpense {
  id: string;
  userId: string;
  tripId: string;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  createdAt: Date | any;
}

export interface SettlementTransaction {
  from: string; // userId
  to: string; // userId
  amount: number;
}

export interface SettlementSnapshot {
  tripId: string;
  totalExpense: number;
  perMember: number;
  contributions: Record<string, number>; // userId -> total contributed
  settlements: SettlementTransaction[];
  createdAt: Date | any;
}

export interface ActivityLog {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  action: string; // Message like "Gautam added Train Ticket"
  type:
    | 'expense_added'
    | 'expense_approved'
    | 'expense_rejected'
    | 'expense_edited'
    | 'trip_end_requested'
    | 'trip_completed';
  metadata?: Record<string, any>;
  createdAt: Date | any;
}
