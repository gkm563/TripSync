import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Activity: undefined;
  QuickAdd: undefined; // Floating Quick Add shortcut
  Approvals: undefined; // Review Queue across all trips
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
  AddExpense: { tripId: string };
  EditExpense: { tripId: string; expenseId: string };
  ExpenseDetails: { tripId: string; expenseId: string };
  PersonalExpenses: { tripId: string };
  Notifications: undefined;
  ExportConfig: { tripId: string };
};
