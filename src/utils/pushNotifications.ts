import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up standard notification handler behavior (when app is in foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Configure notifications channels for Android and request permissions.
 * Returns the generated Expo Push Token or null if fails.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  // Setup Android-specific notification channel for high-priority alerts
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (e) {
      console.warn('Failed to set notification channel:', e);
    }
  }

  // Request notifications permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to get notification permissions!');
    return null;
  }

  let token: string | null = null;
  try {
    // Attempt to require expo-constants dynamically to get the EAS project ID
    let projectId: string | undefined;
    try {
      const Constants = require('expo-constants').default;
      projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
    } catch (constErr) {
      // expo-constants not available, which is fine
    }

    if (projectId) {
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      token = tokenData.data;
    } else {
      // Fallback: try without explicit projectId (can use cached app config if configured)
      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData.data;
    }
  } catch (err) {
    console.warn('Could not retrieve Expo Push Token (requires a development build or EAS configuration):', err);
  }

  return token;
}
