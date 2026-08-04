import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { useNotificationStore } from '../store/notificationStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { ShieldAlert, Check, X, ClipboardList } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function ApprovalsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, usersList } = useAuthStore();
  const { trips } = useTripStore();
  const { expenses, voteExpense } = useExpenseStore();
  const { addNotification } = useNotificationStore();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Please sign in.</Text>
      </SafeAreaView>
    );
  }

  // Find all pending expenses in active trips where user is a member
  const userTrips = trips.filter(t => t.members.includes(user.uid) && t.status === 'active');
  const userTripIds = userTrips.map(t => t.id);
  const pendingExpenses = expenses.filter(e => userTripIds.includes(e.tripId) && e.status === 'pending');

  const getTripName = (tripId: string) => {
    return trips.find(t => t.id === tripId)?.name || 'Unknown Trip';
  };

  const getTripMembersCount = (tripId: string) => {
    return trips.find(t => t.id === tripId)?.members.length || 1;
  };

  const getUserName = (uid: string) => {
    return usersList.find(u => u.uid === uid)?.name || 'Unknown';
  };

  const handleVote = async (expenseId: string, tripId: string, voteValue: 1 | -1) => {
    const tripMembersCount = getTripMembersCount(tripId);
    
    try {
      if (voteValue === -1) {
        Alert.prompt(
          'Rejection Reason',
          'Choose a reason (Wrong Amount, Duplicate Expense, Wrong Category, Other - min 20 chars for Other):',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Submit',
              onPress: async (reason?: string) => {
                if (!reason) {
                  Alert.alert('Error', 'Reason is required to reject an expense');
                  return;
                }
                if (reason.toLowerCase().startsWith('other') && reason.length < 20) {
                  Alert.alert('Error', 'Details for "Other" must be at least 20 characters.');
                  return;
                }
                await voteExpense(expenseId, user.uid, user.name, -1, reason, tripMembersCount);

                const exp = expenses.find(e => e.id === expenseId);
                if (exp && exp.createdBy !== user.uid) {
                  await addNotification(
                    exp.createdBy,
                    'Expense Rejected',
                    `${user.name} rejected "${exp.title}" in "${getTripName(tripId)}"`,
                    'expense_rejected',
                    tripId,
                    expenseId,
                    { reason }
                  );
                }
              }
            }
          ]
        );
      } else {
        await voteExpense(expenseId, user.uid, user.name, 1, undefined, tripMembersCount);
        const exp = expenses.find(e => e.id === expenseId);
        if (exp && exp.createdBy !== user.uid) {
          await addNotification(
            exp.createdBy,
            'Expense Approved',
            `${user.name} approved "${exp.title}" (₹${exp.amount})`,
            'expense_approved',
            tripId,
            expenseId
          );
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Central Review Queue</Text>
        <Text style={styles.headerSubtitle}>Approve/reject pending expenses across all active trips</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {pendingExpenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ClipboardList size={48} color={COLORS.light.textMuted} />
            <Text style={styles.emptyTitle}>Review Queue is Clean!</Text>
            <Text style={styles.emptySub}>No pending expenses require your vote at the moment.</Text>
          </View>
        ) : (
          pendingExpenses.map((exp) => {
            const score = Object.values(exp.votes || {}).reduce((a, b) => a + b, 0);
            const majority = Math.floor(getTripMembersCount(exp.tripId) / 2) + 1;
            const hasVoted = exp.votes && exp.votes[user.uid] !== undefined;

            return (
              <TouchableOpacity
                key={exp.id}
                style={styles.card}
                onPress={() => navigation.navigate('ExpenseDetails', { tripId: exp.tripId, expenseId: exp.id })}
              >
                <View style={styles.tripBadge}>
                  <Text style={styles.tripBadgeText}>{getTripName(exp.tripId)}</Text>
                </View>

                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  <Text style={styles.expAmount}>₹{exp.amount}</Text>
                </View>

                <Text style={styles.metaText}>
                  Paid by {getUserName(Object.keys(exp.paidBy)[0] || '')} • Created by {getUserName(exp.createdBy)}
                </Text>

                <View style={styles.voteSummaryRow}>
                  <Text style={styles.scoreText}>
                    Score: <Text style={styles.boldText}>{score}</Text> / {majority} needed
                  </Text>
                  
                  {exp.createdBy === user.uid ? (
                    <View style={styles.autoVoteMiniBadge}>
                      <Text style={styles.autoVoteMiniBadgeText}>✓ Your vote counted automatically</Text>
                    </View>
                  ) : (
                    // Other members
                    exp.votes && exp.votes[user.uid] !== undefined ? (
                      <View style={[
                        styles.votedMiniBadge,
                        exp.votes[user.uid] === 1 ? styles.votedMiniApproveBadge : styles.votedMiniRejectBadge
                      ]}>
                        <Text style={[
                          styles.votedMiniStatusText,
                          { color: exp.votes[user.uid] === 1 ? COLORS.light.success : COLORS.light.error }
                        ]}>
                          {exp.votes[user.uid] === 1 ? 'Approved by You' : 'Rejected by You'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={[styles.voteBtn, styles.approveBtn]}
                          onPress={() => handleVote(exp.id, exp.tripId, 1)}
                        >
                          <Check size={14} color={COLORS.light.success} />
                          <Text style={[styles.voteText, { color: COLORS.light.success }]}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.voteBtn, styles.rejectBtn]}
                          onPress={() => handleVote(exp.id, exp.tripId, -1)}
                        >
                          <X size={14} color={COLORS.light.error} />
                          <Text style={[styles.voteText, { color: COLORS.light.error }]}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )
                  )}
                </View>

                {Object.keys(exp.rejectReasons || {}).length > 0 && (
                  <View style={styles.rejectReasons}>
                    <Text style={styles.rejectTitle}>Rejection Comments:</Text>
                    {Object.entries(exp.rejectReasons).map(([uid, r]) => (
                      <Text key={uid} style={styles.rejectReasonText}>
                        • <Text style={styles.boldText}>{getUserName(uid)}</Text>: {r}
                      </Text>
                    ))}
                  </View>
                )}
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
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  tripBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    marginBottom: SPACING.sm,
  },
  tripBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.light.primary,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  expAmount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 4,
  },
  voteSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
    paddingTop: SPACING.md,
  },
  scoreText: {
    fontSize: 12,
    color: COLORS.light.text,
  },
  boldText: {
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  voteText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  votedText: {
    color: '#fff',
  },
  approveBtn: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: COLORS.light.success,
  },
  rejectBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: COLORS.light.error,
  },
  votedApproveBtn: {
    backgroundColor: COLORS.light.success,
    borderColor: COLORS.light.success,
  },
  votedRejectBtn: {
    backgroundColor: COLORS.light.error,
    borderColor: COLORS.light.error,
  },
  rejectReasons: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  rejectTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.light.error,
    marginBottom: 2,
  },
  rejectReasonText: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
  },
  autoVoteMiniBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: RADIUS.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoVoteMiniBadgeText: {
    color: COLORS.light.success,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  votedMiniBadge: {
    borderRadius: RADIUS.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  votedMiniApproveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  votedMiniRejectBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  votedMiniStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
