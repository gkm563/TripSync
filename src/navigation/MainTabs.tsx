import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ApprovalsScreen from '../screens/ApprovalsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList } from './types';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { Home, Calendar, PlusCircle, CheckSquare, User } from 'lucide-react-native';
import { View, Alert, StyleSheet, PanResponder } from 'react-native';
import { useTripStore } from '../store/tripStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Swipe threshold configuration
const SWIPE_THRESHOLD = 40;

// Gesture wrapper component to switch tabs via swipe
interface SwipeWrapperProps {
  children: React.ReactNode;
  currentTab: string;
  navigation: any;
}

const SwipeTabWrapper = ({ children, currentTab, navigation }: SwipeWrapperProps) => {
  const tabs = ['Home', 'Activity', 'Approvals', 'Profile'];

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        // Intercept horizontal gestures (horizontal displacement > 3.5x vertical)
        // that exceed a click-prevention limit (20px)
        return Math.abs(dx) > Math.abs(dy) * 3.5 && Math.abs(dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;
        const currentIndex = tabs.indexOf(currentTab);
        if (currentIndex === -1) return;

        if (dx < -SWIPE_THRESHOLD) {
          // Swipe Left -> Go to Next Tab
          if (currentIndex < tabs.length - 1) {
            navigation.navigate(tabs[currentIndex + 1]);
          }
        } else if (dx > SWIPE_THRESHOLD) {
          // Swipe Right -> Go to Previous Tab
          if (currentIndex > 0) {
            navigation.navigate(tabs[currentIndex - 1]);
          }
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

// Wrapped Tab Screen components
const SwipeHome = (props: any) => (
  <SwipeTabWrapper currentTab="Home" navigation={props.navigation}>
    <HomeScreen {...props} />
  </SwipeTabWrapper>
);

const SwipeActivity = (props: any) => (
  <SwipeTabWrapper currentTab="Activity" navigation={props.navigation}>
    <ActivityScreen {...props} />
  </SwipeTabWrapper>
);

const SwipeApprovals = (props: any) => (
  <SwipeTabWrapper currentTab="Approvals" navigation={props.navigation}>
    <ApprovalsScreen {...props} />
  </SwipeTabWrapper>
);

const SwipeProfile = (props: any) => (
  <SwipeTabWrapper currentTab="Profile" navigation={props.navigation}>
    <ProfileScreen {...props} />
  </SwipeTabWrapper>
);

// Dummy screen since tabPress is intercepted
const QuickAddPlaceholder = () => null;

export default function MainTabs() {
  const { trips } = useTripStore();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.light.primary,
        tabBarInactiveTintColor: COLORS.light.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderColor: COLORS.light.border,
          height: 60 + (insets.bottom > 0 ? insets.bottom - 4 : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 8,
          paddingTop: 8,
          backgroundColor: '#fff',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={SwipeHome}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Activity"
        component={SwipeActivity}
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
        component={SwipeApprovals}
        options={{
          tabBarLabel: 'Approvals',
          tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SwipeProfile}
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
