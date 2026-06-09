import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ApprovalsScreen from '../screens/ApprovalsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList } from './types';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { Home, Calendar, PlusCircle, CheckSquare, User } from 'lucide-react-native';
import { View, Alert, StyleSheet } from 'react-native';
import { useTripStore } from '../store/tripStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Dummy screen since tabPress is intercepted
const QuickAddPlaceholder = () => null;

export default function MainTabs() {
  const { trips } = useTripStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.light.primary,
        tabBarInactiveTintColor: COLORS.light.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderColor: COLORS.light.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#fff',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="QuickAdd"
        component={QuickAddPlaceholder}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color }) => (
            <View style={styles.quickAddContainer}>
              <PlusCircle size={44} color={COLORS.light.primary} />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            const activeTrips = trips.filter(t => t.status === 'active');
            if (activeTrips.length === 0) {
              Alert.alert('No Active Trips', 'You must create or join an active trip first to add shared expenses!');
              return;
            }
            // Add expense to the most recently created active trip
            navigation.navigate('AddExpense', { tripId: activeTrips[0].id });
          },
        })}
      />
      <Tab.Screen
        name="Approvals"
        component={ApprovalsScreen}
        options={{
          tabBarLabel: 'Approvals',
          tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  quickAddContainer: {
    top: -4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
