import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { LogOut, RefreshCw, User, ShieldAlert, Award, TrendingUp } from 'lucide-react-native';
import { USE_FIREBASE } from '../firebase/config';

export default function ProfileScreen() {
  const { user, usersList, switchUser, logout } = useAuthStore();
  const { trips } = useTripStore();
  const { expenses } = useExpenseStore();

  if (!user) return null;

  // Calculate statistics
  const userTrips = trips.filter(t => t.members.includes(user.uid));
  const activeTripsCount = userTrips.filter(t => t.status === 'active').length;
  
  // Sum user contributions in all approved expenses
  let totalContributed = 0;
  expenses.forEach((exp) => {
    if (exp.status === 'approved' && exp.paidBy[user.uid]) {
      totalContributed += exp.paidBy[user.uid];
    }
  });

  const handleSwitchUser = (uid: string, name: string) => {
    switchUser(uid);
    Alert.alert('Profile Switched', `Logged in as ${name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Award size={12} color={COLORS.light.primary} />
              <Text style={styles.badgeText}>Verified Member</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <TrendingUp size={22} color={COLORS.light.primary} />
            <Text style={styles.statValue}>₹{totalContributed.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Paid</Text>
          </View>
          <View style={styles.statBox}>
            <User size={22} color={COLORS.light.secondary} />
            <Text style={styles.statValue}>{userTrips.length}</Text>
            <Text style={styles.statLabel}>Trips Count</Text>
          </View>
          <View style={styles.statBox}>
            <ShieldAlert size={22} color={COLORS.light.success} />
            <Text style={styles.statValue}>{activeTripsCount}</Text>
            <Text style={styles.statLabel}>Active Trips</Text>
          </View>
        </View>

        {/* Local Simulator switching helper */}
        {!USE_FIREBASE && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <RefreshCw size={18} color={COLORS.light.text} />
              <Text style={styles.sectionTitle}>Simulator User Switcher</Text>
            </View>
            <Text style={styles.sectionSub}>
              Switch between member profiles to vote approve/reject from their perspectives on this single device.
            </Text>
            
            {usersList.map((mockUser) => {
              const isCurrent = mockUser.uid === user.uid;
              return (
                <TouchableOpacity
                  key={mockUser.uid}
                  style={[styles.switchUserItem, isCurrent && styles.activeSwitchItem]}
                  onPress={() => handleSwitchUser(mockUser.uid, mockUser.name)}
                  disabled={isCurrent}
                >
                  <View style={styles.switchProfileLeft}>
                    <Image source={{ uri: mockUser.photoURL }} style={styles.miniAvatar} />
                    <View>
                      <Text style={[styles.switchName, isCurrent && styles.boldText]}>{mockUser.name}</Text>
                      <Text style={styles.switchEmail}>{mockUser.email}</Text>
                    </View>
                  </View>
                  {isCurrent ? (
                    <View style={styles.currentIndicator}>
                      <Text style={styles.currentText}>ACTIVE</Text>
                    </View>
                  ) : (
                    <Text style={styles.switchActionText}>Switch</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Options */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color={COLORS.light.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.light.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  email: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.light.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  switchUserItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  activeSwitchItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
  },
  switchProfileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
  },
  switchName: {
    fontSize: 13,
    color: COLORS.light.text,
  },
  boldText: {
    fontWeight: 'bold',
  },
  switchEmail: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
  },
  currentIndicator: {
    backgroundColor: COLORS.light.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  currentText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  switchActionText: {
    fontSize: 12,
    color: COLORS.light.primary,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  logoutText: {
    color: COLORS.light.error,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
