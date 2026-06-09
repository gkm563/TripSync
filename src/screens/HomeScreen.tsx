import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { useNotificationStore } from '../store/notificationStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { Plus, Bell, Calendar, Users, ChevronRight, Compass, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, usersList } = useAuthStore();
  const { 
    trips, 
    invitations, 
    syncTrips, 
    syncInvitations, 
    respondToInvitation,
    databaseWipedWarning,
    confirmResetLocalData,
    dismissWipedWarning
  } = useTripStore();
  const { unreadCount, syncNotifications } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (user) {
      const unsubTrips = syncTrips(user.uid);
      const unsubInvitations = syncInvitations(user.email);
      const unsubNotifs = syncNotifications(user.uid);
      return () => {
        unsubTrips();
        unsubInvitations();
        unsubNotifs();
      };
    }
  }, [user]);

  const filteredTrips = trips.filter(t => t.status === activeTab);

  const getCreatorName = (createdByUid: string) => {
    return usersList.find(u => u.uid === createdByUid)?.name || 'Someone';
  };

  const getGradientForCard = (index: number) => {
    const gradients = [
      ['#6366F1', '#3B82F6'],
      ['#14B8A6', '#059669'],
      ['#EC4899', '#BE185D'],
      ['#F59E0B', '#D97706'],
    ];
    return gradients[index % gradients.length];
  };

  const renderTripCard = ({ item, index }: { item: any; index: number }) => {
    const gradientColors = getGradientForCard(index);

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.tripCardHeader}>
            <Text style={styles.tripName} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.statusBadge, item.status === 'completed' && styles.completedBadge]}>
              <Text style={styles.statusText}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.tripDesc} numberOfLines={2}>
            {item.description || 'No description provided.'}
          </Text>

          <View style={styles.tripMetaRow}>
            <View style={styles.metaItem}>
              <Calendar size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{item.startDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{item.members.length} Members</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.light.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: user?.photoURL }} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.notifButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Bell size={24} color={COLORS.light.text} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Database Wipe Alert Card */}
        {databaseWipedWarning && (
          <View style={styles.warningAlertCard}>
            <View style={styles.warningAlertHeader}>
              <AlertCircle size={22} color="#DC2626" />
              <Text style={styles.warningAlertTitle}>Empty Database Sync Alert</Text>
            </View>
            <Text style={styles.warningAlertDesc}>
              The cloud database returned no trips, but you have local trip caches. To prevent data loss, please select your trips below and click **Export Backup** first.
            </Text>
            <View style={styles.warningAlertActions}>
              <TouchableOpacity
                style={[styles.warningAlertBtn, styles.warningConfirmBtn]}
                onPress={() => {
                  Alert.alert(
                    'Confirm Cloud Reset',
                    'Are you sure you want to reset and clear all local trip caches? This cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Reset Local Cache', style: 'destructive', onPress: () => confirmResetLocalData() }
                    ]
                  );
                }}
              >
                <Text style={styles.warningConfirmBtnText}>Confirm Wipe</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.warningAlertBtn, styles.warningDismissBtn]}
                onPress={dismissWipedWarning}
              >
                <Text style={styles.warningDismissBtnText}>Dismiss Warning</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Invitations Alert Banner */}
        {invitations.length > 0 && (
          <View style={styles.invitationSection}>
            <Text style={styles.sectionTitle}>Trip Invitations ({invitations.length})</Text>
            {invitations.map((inv) => (
              <View key={inv.id} style={styles.invitationCard}>
                <View style={styles.invitationInfo}>
                  <Text style={styles.invitationText}>
                    <Text style={styles.boldText}>{inv.invitedBy}</Text> invited you to join a trip.
                  </Text>
                  <Text style={styles.invitationSubtext}>Join to synchronize group expenses.</Text>
                </View>
                <View style={styles.invitationActionRow}>
                  <TouchableOpacity
                    style={[styles.invButton, styles.acceptButton]}
                    onPress={() => respondToInvitation(inv.id, user!.uid, true)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.invButton, styles.declineButton]}
                    onPress={() => respondToInvitation(inv.id, user!.uid, false)}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Dashboard Quick Stats Card */}
        <LinearGradient
          colors={COLORS.light.primaryGradient as any}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.statsTitle}>Overview Dashboard</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{trips.length}</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {trips.filter(t => t.status === 'active').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {trips.filter(t => t.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'active' && styles.activeTabItem]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Active Trips
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'completed' && styles.activeTabItem]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Compass size={48} color={COLORS.light.textMuted} />
            <Text style={styles.emptyTitle}>No Trips Found</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'active' 
                ? 'Create a new trip or accept an invite to get started!' 
                : "You don't have any completed trips yet."}
            </Text>
            {activeTab === 'active' && (
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => navigation.navigate('CreateTrip')}
              >
                <Plus size={16} color="#fff" />
                <Text style={styles.createBtnText}>Create Your First Trip</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredTrips}
            renderItem={renderTripCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.tripsList}
          />
        )}
      </ScrollView>

      {/* Floating Add Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTrip')}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.light.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.light.primary,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light.background,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.light.error,
    borderRadius: RADIUS.round,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100, // Space for FAB and tabbar
  },
  invitationSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SPACING.sm,
  },
  invitationCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  invitationInfo: {
    marginBottom: SPACING.md,
  },
  invitationText: {
    fontSize: 14,
    color: COLORS.light.text,
  },
  boldText: {
    fontWeight: 'bold',
  },
  invitationSubtext: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  invitationActionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  invButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.light.primary,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  declineButtonText: {
    color: COLORS.light.textSecondary,
    fontSize: 13,
  },
  statsCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.light.md,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderColor: COLORS.light.border,
  },
  tabItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.md,
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderColor: COLORS.light.primary,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.light.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.light.primary,
    fontWeight: 'bold',
  },
  tripsList: {
    gap: SPACING.md,
  },
  tripCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.light.md,
  },
  cardGradient: {
    padding: SPACING.lg,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  completedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  tripDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginVertical: SPACING.sm,
  },
  tripMetaRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.light.border,
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 80,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light.lg,
    zIndex: 10,
  },
  warningAlertCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.light.sm,
  },
  warningAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  warningAlertTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#9B2C2C',
  },
  warningAlertDesc: {
    fontSize: 12,
    color: '#C53030',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  warningAlertActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  warningAlertBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningConfirmBtn: {
    backgroundColor: '#E53E3E',
  },
  warningConfirmBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  warningDismissBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  warningDismissBtnText: {
    color: COLORS.light.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});
