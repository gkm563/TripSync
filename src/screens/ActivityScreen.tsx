import React, { useEffect, useState } from 'react';
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
import { 
  Activity, 
  Calendar, 
  Compass, 
  Plus, 
  Check, 
  X, 
  Edit, 
  AlertCircle, 
  Filter,
  Clock
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityLog } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
type FilterType = 'all' | 'added' | 'approved' | 'rejected' | 'edited';

export default function ActivityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, usersList } = useAuthStore();
  const { trips } = useTripStore();
  const { activityLogs, syncActivityLogs } = useExpenseStore();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

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

  // Filter based on selected filter category
  const filteredLogs = logs.filter(log => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'added') return log.type === 'expense_added';
    if (selectedFilter === 'approved') return log.type === 'expense_approved';
    if (selectedFilter === 'rejected') return log.type === 'expense_rejected';
    if (selectedFilter === 'edited') return log.type === 'expense_edited';
    return true;
  });

  const getTripName = (tripId: string) => {
    return trips.find(t => t.id === tripId)?.name || 'Unknown Trip';
  };

  const getUserAvatar = (uid: string) => {
    return usersList.find(u => u.uid === uid)?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  };

  // Parsing utilities for cleaner UI representation
  const parseAmount = (actionText: string) => {
    const match = actionText.match(/₹\d+/);
    return match ? match[0] : null;
  };

  const parseExpenseTitle = (actionText: string, type: ActivityLog['type']) => {
    if (type === 'expense_added') {
      const match = actionText.match(/added expense:\s*(.*?)\s*\(₹/);
      return match ? match[1] : null;
    }
    if (type === 'expense_approved' || type === 'expense_rejected') {
      const match = actionText.match(/(?:approved|rejected)\s+expense:\s*["'](.*?)["']/i);
      return match ? match[1] : null;
    }
    if (type === 'expense_edited') {
      const match = actionText.match(/edited expense:\s*(.*?)\s*to version/);
      return match ? match[1] : null;
    }
    return null;
  };

  const parseRejectionReason = (actionText: string, type: ActivityLog['type']) => {
    if (type === 'expense_rejected') {
      const match = actionText.match(/\(([^)]+)\)$/);
      // Skip if matched amount representation (e.g. ₹600)
      if (match && !match[1].startsWith('₹')) {
        return match[1];
      }
    }
    return null;
  };

  const getLogIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'expense_added':
        return <Plus size={12} color="#FFFFFF" />;
      case 'expense_approved':
        return <Check size={12} color="#FFFFFF" />;
      case 'expense_rejected':
        return <X size={12} color="#FFFFFF" />;
      case 'expense_edited':
        return <Edit size={12} color="#FFFFFF" />;
      default:
        return <Activity size={12} color="#FFFFFF" />;
    }
  };

  const getLogColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'expense_added':
        return COLORS.light.success;
      case 'expense_approved':
        return COLORS.light.secondary;
      case 'expense_rejected':
        return COLORS.light.error;
      case 'expense_edited':
        return COLORS.light.warning;
      default:
        return COLORS.light.primary;
    }
  };

  const getLogBadgeText = (type: ActivityLog['type']) => {
    switch (type) {
      case 'expense_added':
        return 'ADDED';
      case 'expense_approved':
        return 'APPROVED';
      case 'expense_rejected':
        return 'REJECTED';
      case 'expense_edited':
        return 'EDITED';
      default:
        return 'ACTION';
    }
  };

  // Grouping logs by date
  const groupLogsByDate = (logsList: ActivityLog[]) => {
    const groups: { [key: string]: ActivityLog[] } = {};
    logsList.forEach(log => {
      const dateObj = new Date(log.createdAt);
      let dateStr = '';
      
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      if (dateObj.toDateString() === today.toDateString()) {
        dateStr = 'Today';
      } else if (dateObj.toDateString() === yesterday.toDateString()) {
        dateStr = 'Yesterday';
      } else {
        dateStr = dateObj.toLocaleDateString([], { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(log);
    });
    return groups;
  };

  const groupedLogs = groupLogsByDate(filteredLogs);
  const dateKeys = Object.keys(groupedLogs);

  // Flattened logs list size
  const totalItemCount = filteredLogs.length;
  let runningIndex = 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Timeline</Text>
        <Text style={styles.headerSubtitle}>Real-time updates across your active trips</Text>
      </View>

      {/* Filter Row */}
      <View style={styles.filterWrapper}>
        <View style={styles.filterHeader}>
          <Filter size={14} color={COLORS.light.textSecondary} />
          <Text style={styles.filterTitle}>Filter Timeline</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'added', label: 'Additions' },
            { id: 'approved', label: 'Approvals' },
            { id: 'rejected', label: 'Rejections' },
            { id: 'edited', label: 'Edits' },
          ].map(f => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterPill,
                selectedFilter === f.id && styles.filterPillActive
              ]}
              onPress={() => setSelectedFilter(f.id as FilterType)}
            >
              <Text 
                style={[
                  styles.filterLabel,
                  selectedFilter === f.id && styles.filterLabelActive
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Timeline Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {totalItemCount === 0 ? (
          <View style={styles.emptyContainer}>
            <Compass size={56} color={COLORS.light.textMuted} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Activities Found</Text>
            <Text style={styles.emptySub}>
              {selectedFilter === 'all' 
                ? 'Timeline is quiet. Try adding, editing, or voting on expenses inside your active trips.'
                : 'No activities match the selected filter.'}
            </Text>
            {selectedFilter !== 'all' && (
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={styles.resetButtonText}>View All Activities</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.timeline}>
            {dateKeys.map((dateKey) => {
              const dayLogs = groupedLogs[dateKey];
              return (
                <View key={dateKey} style={styles.dateGroup}>
                  {/* Date Heading */}
                  <View style={styles.dateHeaderContainer}>
                    <Text style={styles.dateHeader}>{dateKey}</Text>
                    <View style={styles.dateDivider} />
                  </View>

                  {/* Day's Activities */}
                  {dayLogs.map((log) => {
                    const tripName = getTripName(log.tripId);
                    const color = getLogColor(log.type);
                    const badgeText = getLogBadgeText(log.type);
                    const icon = getLogIcon(log.type);
                    const amount = parseAmount(log.action);
                    const expenseTitle = parseExpenseTitle(log.action, log.type);
                    const rejectionReason = parseRejectionReason(log.action, log.type);
                    
                    const isLastItem = runningIndex === totalItemCount - 1;
                    runningIndex++;

                    return (
                      <View key={log.id} style={styles.timelineItem}>
                        {/* Left Side: Avatar, Connection Line, and overlay Icon */}
                        <View style={styles.leftCol}>
                          <View style={styles.avatarContainer}>
                            <Image source={{ uri: getUserAvatar(log.userId) }} style={styles.avatar} />
                            <View style={[styles.statusIconContainer, { backgroundColor: color }]}>
                              {icon}
                            </View>
                          </View>
                          {!isLastItem && <View style={styles.verticalLine} />}
                        </View>

                        {/* Right Side: Professional Timeline Card */}
                        <TouchableOpacity
                          style={styles.bubbleCard}
                          activeOpacity={0.7}
                          onPress={() => navigation.navigate('TripDetail', { tripId: log.tripId })}
                        >
                          {/* Card Header */}
                          <View style={styles.cardHeader}>
                            <View style={styles.headerTextGroup}>
                              <Text style={styles.userName}>{log.userName}</Text>
                              <View style={[styles.typeBadge, { backgroundColor: color + '15' }]}>
                                <Text style={[styles.typeBadgeText, { color: color }]}>{badgeText}</Text>
                              </View>
                            </View>
                            <View style={styles.timeGroup}>
                              <Clock size={10} color={COLORS.light.textMuted} />
                              <Text style={styles.timeText}>
                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            </View>
                          </View>

                          {/* Card Body */}
                          <View style={styles.cardBody}>
                            <View style={styles.actionDetails}>
                              {expenseTitle ? (
                                <Text style={styles.actionTextMain}>
                                  {log.type === 'expense_added' && 'Added '}
                                  {log.type === 'expense_approved' && 'Approved '}
                                  {log.type === 'expense_rejected' && 'Rejected '}
                                  {log.type === 'expense_edited' && 'Edited '}
                                  expense <Text style={styles.expenseTitleHighlight}>"{expenseTitle}"</Text>
                                </Text>
                              ) : (
                                <Text style={styles.actionTextFallback}>{log.action}</Text>
                              )}
                              
                              {/* Rejection Detail Block */}
                              {rejectionReason && (
                                <View style={styles.disputeCallout}>
                                  <AlertCircle size={12} color={COLORS.light.error} />
                                  <Text style={styles.disputeText}>
                                    Reason: <Text style={styles.disputeReasonHighlight}>{rejectionReason}</Text>
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Extract amount value side-display */}
                            {amount && (
                              <View style={[styles.amountContainer, { borderColor: color + '30' }]}>
                                <Text style={[styles.amountText, { color: color }]}>{amount}</Text>
                              </View>
                            )}
                          </View>

                          {/* Card Footer */}
                          <View style={styles.cardFooter}>
                            <View style={styles.tripBadgeContainer}>
                              <Calendar size={11} color={COLORS.light.textSecondary} />
                              <Text style={styles.tripBadge}>{tripName}</Text>
                            </View>
                            <Text style={styles.tapToView}>View details →</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  filterWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.light.border,
    paddingVertical: SPACING.sm,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: 6,
    gap: 4,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    paddingHorizontal: SPACING.xl - 4,
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.light.textSecondary,
  },
  filterLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: SPACING.xl,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    marginTop: SPACING.md,
    ...SHADOWS.light.sm,
  },
  emptyIcon: {
    marginBottom: SPACING.md,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 19,
  },
  resetButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.light.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  timeline: {
    marginTop: SPACING.xs,
  },
  dateGroup: {
    marginBottom: SPACING.xl,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  dateHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateDivider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.light.border,
    marginLeft: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  leftCol: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 44,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.round,
    borderWidth: 2,
    borderColor: '#fff',
    ...SHADOWS.light.sm,
  },
  statusIconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light.sm,
  },
  verticalLine: {
    width: 2.5,
    flex: 1,
    backgroundColor: COLORS.light.border,
    marginTop: SPACING.xs,
    borderRadius: 1,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: RADIUS.xs,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.light.textMuted,
    fontWeight: '500',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 4,
    gap: 8,
  },
  actionDetails: {
    flex: 1,
  },
  actionTextMain: {
    fontSize: 13.5,
    color: COLORS.light.textSecondary,
    lineHeight: 18.5,
  },
  expenseTitleHighlight: {
    fontWeight: '600',
    color: COLORS.light.text,
  },
  actionTextFallback: {
    fontSize: 13.5,
    color: COLORS.light.textSecondary,
    lineHeight: 18.5,
  },
  disputeCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.error + '08',
    borderColor: COLORS.light.error + '20',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    marginTop: 6,
    gap: 6,
  },
  disputeText: {
    fontSize: 11,
    color: COLORS.light.error,
    fontWeight: '500',
    flex: 1,
  },
  disputeReasonHighlight: {
    fontWeight: '700',
  },
  amountContainer: {
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#fff',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.light.border + '50',
    paddingTop: SPACING.sm,
  },
  tripBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripBadge: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    fontWeight: '500',
  },
  tapToView: {
    fontSize: 10.5,
    color: COLORS.light.primary,
    fontWeight: '600',
  },
});

