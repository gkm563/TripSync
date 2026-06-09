import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Image
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { 
  ChevronLeft, 
  CheckCheck, 
  Trash2, 
  Bell, 
  BellOff, 
  Info, 
  CircleAlert, 
  Sparkles, 
  CheckCircle2,
  Check,
  Eye,
  Inbox
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

type FilterType = 'all' | 'approvals' | 'updates';

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearHistory } = useNotificationStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  if (!user) return null;

  const handleMarkAllRead = async () => {
    await markAllAsRead(user.uid);
    Alert.alert('Success', 'All notifications marked as read.');
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearHistory(user.uid) }
      ]
    );
  };

  const handleNotifClick = async (notif: any) => {
    if (notif.status === 'unread') {
      await markAsRead(notif.id);
    }
    
    if (notif.tripId) {
      if (notif.expenseId) {
        navigation.navigate('ExpenseDetails', { tripId: notif.tripId, expenseId: notif.expenseId });
      } else {
        navigation.navigate('TripDetail', { tripId: notif.tripId });
      }
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const handleQuickMarkRead = async (notifId: string) => {
    await markAsRead(notifId);
  };

  // Helper to determine notification categorization
  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    
    const isApproval = 
      notif.type === 'invitation' || 
      notif.type === 'review_required' || 
      notif.type === 'trip_end_request';
      
    if (activeFilter === 'approvals') return isApproval;
    if (activeFilter === 'updates') return !isApproval;
    return true;
  });

  const getStyleForType = (type: string) => {
    switch (type) {
      case 'invitation':
        return {
          icon: <Sparkles size={18} color="#D97706" />,
          bg: '#FEF3C7',
          border: 'rgba(217, 119, 6, 0.2)'
        };
      case 'expense_approved':
      case 'trip_completed':
        return {
          icon: <CheckCircle2 size={18} color="#059669" />,
          bg: '#D1FAE5',
          border: 'rgba(5, 150, 105, 0.2)'
        };
      case 'expense_rejected':
        return {
          icon: <CircleAlert size={18} color="#DC2626" />,
          bg: '#FEE2E2',
          border: 'rgba(220, 38, 38, 0.2)'
        };
      case 'expense_created':
      case 'review_required':
      case 'trip_end_request':
        return {
          icon: <Bell size={18} color="#4F46E5" />,
          bg: '#E0E7FF',
          border: 'rgba(79, 70, 229, 0.2)'
        };
      default:
        return {
          icon: <Info size={18} color="#475569" />,
          bg: '#F1F5F9',
          border: 'rgba(71, 85, 105, 0.2)'
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.light.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerActionBtn, notifications.length === 0 && styles.disabledBtn]} 
            onPress={handleMarkAllRead}
            disabled={notifications.length === 0}
          >
            <CheckCheck size={18} color={notifications.length === 0 ? COLORS.light.textMuted : COLORS.light.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerActionBtn, notifications.length === 0 && styles.disabledBtn]} 
            onPress={handleClearHistory}
            disabled={notifications.length === 0}
          >
            <Trash2 size={18} color={notifications.length === 0 ? COLORS.light.textMuted : COLORS.light.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.filterTabsContainer}>
        {(['all', 'approvals', 'updates'] as FilterType[]).map((filter) => {
          const isActive = activeFilter === filter;
          const label = filter === 'all' ? 'All Alerts' : filter === 'approvals' ? 'Approvals' : 'Updates';
          
          // Count items in each category
          const count = notifications.filter(n => {
            if (filter === 'all') return true;
            const isApproval = n.type === 'invitation' || n.type === 'review_required' || n.type === 'trip_end_request';
            return filter === 'approvals' ? isApproval : !isApproval;
          }).length;

          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, isActive && styles.activeFilterTab]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterTabText, isActive && styles.activeFilterTabText]}>
                {label}
              </Text>
              {count > 0 && (
                <View style={[styles.tabCountBadge, isActive && styles.activeTabCountBadge]}>
                  <Text style={[styles.tabCountText, isActive && styles.activeTabCountText]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Inbox size={40} color={COLORS.light.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Nothing Here</Text>
            <Text style={styles.emptySub}>
              {activeFilter === 'all' 
                ? 'Your notification center is clear!' 
                : activeFilter === 'approvals'
                  ? 'No pending approvals or invitations.'
                  : 'No updates or completion logs found.'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = notif.status === 'unread';
            const design = getStyleForType(notif.type);
            
            // Format nice relative timestamp
            const formattedTime = new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
              ' • ' + 
              new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notifCard, 
                  isUnread && styles.unreadCard,
                  { borderLeftColor: isUnread ? COLORS.light.primary : design.border }
                ]}
                onPress={() => handleNotifClick(notif)}
              >
                {/* Visual Badge Icon */}
                <View style={[styles.iconBadge, { backgroundColor: design.bg }]}>
                  {design.icon}
                </View>
                
                {/* Text Content */}
                <View style={styles.notifContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.notifTitle, isUnread && styles.boldText]} numberOfLines={1}>
                      {notif.title}
                    </Text>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
                  <Text style={styles.notifTime}>{formattedTime}</Text>
                </View>

                {/* Right Interactive Option */}
                <View style={styles.cardRightAction}>
                  {isUnread ? (
                    <TouchableOpacity
                      style={styles.quickMarkReadBtn}
                      onPress={() => handleQuickMarkRead(notif.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Check size={14} color={COLORS.light.primary} />
                    </TouchableOpacity>
                  ) : (
                    <ChevronLeft size={16} color={COLORS.light.textMuted} style={styles.chevronRotate} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.light.border,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light.background,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  unreadCountBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unreadCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.light.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light.background,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.light.border,
    gap: SPACING.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.light.background,
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: COLORS.light.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.light.textSecondary,
  },
  activeFilterTabText: {
    color: '#fff',
  },
  tabCountBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: RADIUS.round,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  activeTabCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabCountText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.light.textSecondary,
  },
  activeTabCountText: {
    color: '#fff',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light.sm,
    marginBottom: SPACING.md,
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
    marginTop: 6,
    lineHeight: 18,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderLeftWidth: 4,
    alignItems: 'center',
    ...SHADOWS.light.sm,
  },
  unreadCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.015)',
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  notifContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  notifTitle: {
    fontSize: 14,
    color: COLORS.light.text,
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.light.primary,
  },
  notifBody: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: COLORS.light.textMuted,
    marginTop: 4,
  },
  cardRightAction: {
    marginLeft: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickMarkReadBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  chevronRotate: {
    transform: [{ rotate: '180deg' }],
  },
});
