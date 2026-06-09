import { Platform } from 'react-native';

// Helper to check if notifications are supported and should be enabled (not in Expo Go)
const shouldEnableNotifications = (): boolean => {
  if (Platform.OS === 'web') return false;
  
  try {
    const Constants = require('expo-constants').default;
    // appOwnership is 'expo' when running inside Expo Go
    const isExpoGo = Constants?.appOwnership === 'expo';
    return !isExpoGo;
  } catch (e) {
    return true; // Fallback to true in bare workflows/development clients
  }
};

const getNotificationsModule = () => {
  if (shouldEnableNotifications()) {
    try {
      return require('expo-notifications');
    } catch (e) {
      // Library not loaded or failed
    }
  }
  return null;
};

// Set up standard notification handler behavior if module is active
const Notifications = getNotificationsModule();
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.warn('Failed to set notification handler:', e);
  }
}

/**
 * Configure notifications channels for Android and request permissions.
 * Returns the generated Expo Push Token or null if fails.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const NotificationsInstance = getNotificationsModule();
  if (!NotificationsInstance) {
    // Gracefully skip registration when inside Expo Go
    return null;
  }

  // Setup Android-specific notification channel for high-priority alerts
  if (Platform.OS === 'android') {
    try {
      await NotificationsInstance.setNotificationChannelAsync('default', {
        name: 'default',
        importance: NotificationsInstance.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (e) {
      console.warn('Failed to set notification channel:', e);
    }
  }

  // Request notifications permissions
  const { status: existingStatus } = await NotificationsInstance.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await NotificationsInstance.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return null;
  }

  let token: string | null = null;
  try {
    const Constants = require('expo-constants').default;
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

    if (projectId) {
      const tokenData = await NotificationsInstance.getExpoPushTokenAsync({ projectId });
      token = tokenData.data;
    } else {
      console.log('Push registration info: No EAS projectId config found. Token registration skipped.');
    }
  } catch (err) {
    console.log('Push registration info: EAS config or token retrieval skipped during local test.');
  }

  return token;
}
