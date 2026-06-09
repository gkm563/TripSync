import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { Activity, Calendar, Award, Compass } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function ActivityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, usersList } = useAuthStore();
  const { trips } = useTripStore();
  const { activityLogs, syncActivityLogs } = useExpenseStore();

  if (!user) return null;

  const userTrips = trips.filter(t => t.members.includes(user.uid));
  const userTripIds = userTrips.map(t => t.id);

  // Synchronize logs for all user trips
  useEffect(() => {
    const unsubscribes = userTripIds.map(tripId => syncActivityLogs(tripId));
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [trips, user.uid]);

  // Filter and sort all logs across user trips
  const logs = activityLogs
    .filter(log => userTripIds.includes(log.tripId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getTripName = (tripId: string) => {
    return trips.find(t => t.id === tripId)?.name || 'Unknown Trip';
  };

  const getUserAvatar = (uid: string) => {
    return usersList.find(u => u.uid === uid)?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timeline Activity Feed</Text>
        <Text style={styles.headerSubtitle}>Real-time updates on what members are contributing</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Compass size={48} color={COLORS.light.textMuted} />
            <Text style={styles.emptyTitle}>Feed is Quiet</Text>
            <Text style={styles.emptySub}>Activities will display here as people add and approve expenses.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {logs.map((log, index) => {
              const tripName = getTripName(log.tripId);
              
              return (
                <View key={log.id} style={styles.timelineItem}>
                  {/* Left avatar and line */}
                  <View style={styles.leftCol}>
                    <Image source={{ uri: getUserAvatar(log.userId) }} style={styles.avatar} />
                    {index < logs.length - 1 && <View style={styles.verticalLine} />}
                  </View>

                  {/* Right bubble card */}
                  <TouchableOpacity
                    style={styles.bubbleCard}
                    onPress={() => navigation.navigate('TripDetail', { tripId: log.tripId })}
                  >
                    <View style={styles.bubbleHeader}>
                      <Text style={styles.boldText}>{log.userName}</Text>
                      <Text style={styles.timeText}>
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>

                    <Text style={styles.actionText}>{log.action}</Text>

                    <View style={styles.bubbleFooter}>
                      <Calendar size={12} color={COLORS.light.textMuted} />
                      <Text style={styles.tripBadge}>{tripName}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.light.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  timeline: {
    marginTop: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  leftCol: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
    borderColor: COLORS.light.border,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.light.border,
    marginTop: SPACING.xs,
  },
  bubbleCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  boldText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.light.textMuted,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
    lineHeight: 18,
    marginVertical: 4,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  tripBadge: {
    fontSize: 11,
    color: COLORS.light.textMuted,
    fontWeight: '500',
  },
});
