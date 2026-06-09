import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import AuthScreen from '../screens/AuthScreen';
import MainTabs from './MainTabs';
import CreateTripScreen from '../screens/CreateTripScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import ExpenseDetailsScreen from '../screens/ExpenseDetailsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ExportConfigScreen from '../screens/ExportConfigScreen';
import { RootStackParamList } from './types';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading, initialize, updateFcmToken } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user) {
      // Request notifications permission and register token
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          updateFcmToken(token);
        }
      });

      // Load expo-notifications dynamically if not inside Expo Go
      let NotificationsInstance: any = null;
      try {
        const Constants = require('expo-constants').default;
        const isExpoGo = Constants?.appOwnership === 'expo';
        if (!isExpoGo) {
          NotificationsInstance = require('expo-notifications');
        }
      } catch (e) {
        // Ignore
      }

      let foregroundSubscription: any = null;
      let responseSubscription: any = null;

      if (NotificationsInstance) {
        // Listener for foreground notifications
        foregroundSubscription = NotificationsInstance.addNotificationReceivedListener((notification: any) => {
          console.log('Foreground notification received:', notification.request.content.title);
        });

        // Listener for background/tapped notifications
        responseSubscription = NotificationsInstance.addNotificationResponseReceivedListener((response: any) => {
          console.log('Notification tapped:', response.notification.request.content.title);
        });
      }

      return () => {
        if (foregroundSubscription) foregroundSubscription.remove();
        if (responseSubscription) responseSubscription.remove();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user === null ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
          <Stack.Screen name="TripDetail" component={TripDetailScreen} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
          <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
          <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="ExportConfig" component={ExportConfigScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
  },
});
