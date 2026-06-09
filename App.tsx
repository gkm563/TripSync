import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NotificationBanner from './src/components/NotificationBanner';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <NotificationBanner />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
