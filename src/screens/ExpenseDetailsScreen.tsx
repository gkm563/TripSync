import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { ChevronLeft, Edit2, Calendar, Clock, Tag, MessageSquare, ShieldCheck, ShieldAlert, History } from 'lucide-react-native';
import { USE_FIREBASE, db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ExpenseVersion } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpenseDetails'>;
type RouteProps = RouteProp<RootStackParamList, 'ExpenseDetails'>;

export default function ExpenseDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { tripId, expenseId } = route.params;

  const { user, usersList } = useAuthStore();
  const { trips } = useTripStore();
  const { expenses, voteExpense, deleteExpense, forceApproveExpense } = useExpenseStore();
  const { addNotification } = useNotificationStore();

  const trip = trips.find(t => t.id === tripId);
  const expense = expenses.find(e => e.id === expenseId);
  
  const [historyVersions, setHistoryVersions] = useState<ExpenseVersion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch historical versions
  useEffect(() => {
    const fetchHistory = async () => {
      if (!expense) return;
      setLoadingHistory(true);
      try {
        if (USE_FIREBASE && db) {
          const q = query(
            collection(db, 'expenseVersions'), 
            where('expenseId', '==', expenseId)
          );
          const snap = await getDocs(q);
          const list: ExpenseVersion[] = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data() as ExpenseVersion);
          });
          list.sort((a, b) => b.version - a.version);
          setHistoryVersions(list);
        } else {
          // Mock mode: fetch from local store
          const { expenseVersions } = useExpenseStore.getState();
          const list = expenseVersions.filter(v => v.expenseId === expenseId);
          list.sort((a, b) => b.version - a.version);
          setHistoryVersions(list);
        }
      } catch (e) {
        console.warn('Failed to load version history:', e);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [expenseId, expense?.version]);

  if (!trip || !expense) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text>Expense details not found.</Text>
      </SafeAreaView>
    );
  }

  const score = Object.values(expense.votes || {}).reduce((a, b) => a + b, 0);
  const majorityNeeded = Math.floor(trip.members.length / 2) + 1;
  const isApproved = expense.status === 'approved';
  const isRejected = expense.status === 'rejected';

  const getUserName = (uid: string) => {
    return usersList.find(u => u.uid === uid)?.name || 'Unknown';
  };

  const getUserAvatar = (uid: string) => {
    return usersList.find(u => u.uid === uid)?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  };

  const handleVoteAction = async (voteValue: 1 | -1) => {
    if (!user) return;
    try {
      if (voteValue === -1) {
        Alert.prompt(
          'Rejection Reason',
          'Choose a reason (Wrong Amount, Duplicate Expense, Wrong Category, Other - min 20 chars for Other):',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reject',
              onPress: async (reason) => {
                if (!reason) {
                  Alert.alert('Error', 'Reason is required to reject an expense');
                  return;
                }
                if (reason.toLowerCase().startsWith('other') && reason.length < 20) {
                  Alert.alert('Error', 'Details for "Other" must be at least 20 characters.');
                  return;
                }
                await voteExpense(expenseId, user.uid, user.name, -1, reason, trip.members.length);
                
                // Notify creator of rejection
                if (expense.createdBy !== user.uid) {
                  await addNotification(
                    expense.createdBy,
                    'Expense Rejected',
                    `${user.name} rejected "${expense.title}" in "${trip.name}"`,
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
        await voteExpense(expenseId, user.uid, user.name, 1, undefined, trip.members.length);
        
        // Notify creator of approval
        if (expense.createdBy !== user.uid) {
          await addNotification(
            expense.createdBy,
            'Expense Approved',
            `${user.name} approved "${expense.title}" (₹${expense.amount})`,
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

  const handleForceApproveAction = async () => {
    if (!user) return;
    try {
      await forceApproveExpense(expenseId, user.uid, user.name);
      
      if (expense.createdBy !== user.uid) {
        await addNotification(
          expense.createdBy,
          'Expense Approved Anyway',
          `${user.name} approved the rejected expense "${expense.title}" (₹${expense.amount})`,
          'expense_approved',
          tripId,
          expenseId
        );
      }
      Alert.alert('Approved', 'Expense approved by group decision.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to approve expense');
    }
  };

  const handleDeleteAction = async () => {
    Alert.alert(
      'Delete Rejected Expense',
      'Are you sure you want to permanently delete this rejected expense from the trip history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
              navigation.goBack();
              Alert.alert('Deleted', 'Rejected expense deleted.');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete expense');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
        {trip.status !== 'completed' ? (
          <TouchableOpacity 
            style={styles.headerBtn} 
            onPress={() => navigation.navigate('EditExpense', { tripId, expenseId })}
          >
            <Edit2 size={20} color={COLORS.light.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isRejected && (
          <View style={styles.disputeBanner}>
            <ShieldAlert size={20} color="#fff" />
            <Text style={styles.disputeBannerText}>
              This expense has been majority rejected and is pending a final group decision.
            </Text>
          </View>
        )}

        {/* Main Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.categoryHeaderRow}>
            <View style={styles.catBadge}>
              <Tag size={14} color={COLORS.light.primary} />
              <Text style={styles.catBadgeText}>{expense.category}</Text>
            </View>
            <Text style={styles.versionBadge}>Version {expense.version}</Text>
          </View>

          <Text style={styles.mainTitle}>{expense.title}</Text>
          <Text style={styles.mainAmount}>₹{expense.amount.toLocaleString()}</Text>

          <View style={styles.metaDivider} />

          <View style={styles.metaGrid}>
            <View style={styles.metaGridCell}>
              <Calendar size={16} color={COLORS.light.textSecondary} />
              <Text style={styles.metaCellText}>{expense.date}</Text>
            </View>
            <View style={styles.metaGridCell}>
              <Clock size={16} color={COLORS.light.textSecondary} />
              <Text style={styles.metaCellText}>{expense.time}</Text>
            </View>
          </View>

          {expense.notes ? (
            <View style={styles.notesContainer}>
              <MessageSquare size={16} color={COLORS.light.textSecondary} style={styles.notesIcon} />
              <Text style={styles.notesText}>{expense.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* Status & Approvals Score Card */}
        <View style={styles.whiteCard}>
          <View style={styles.statusTitleRow}>
            <Text style={styles.cardTitle}>Approval Status</Text>
            <View style={[
              styles.statusIndicator, 
              isApproved ? styles.statusApproved : isRejected ? styles.statusRejected : styles.statusPending
            ]}>
              <Text style={styles.statusIndicatorText}>
                {expense.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreText}>
              Current Score: <Text style={styles.boldText}>{score}</Text> (majority of <Text style={styles.boldText}>{majorityNeeded}</Text> needed)
            </Text>
          </View>

          {/* List of current votes */}
          <Text style={styles.votingSubHeader}>Member Decisions:</Text>
          {trip.members.map((memberId) => {
            const voteVal = expense.votes ? expense.votes[memberId] : undefined;
            const rejectRes = expense.rejectReasons ? expense.rejectReasons[memberId] : undefined;
            
            return (
              <View key={memberId} style={styles.voteMemberRow}>
                <View style={styles.voteMemberProfile}>
                  <Image source={{ uri: getUserAvatar(memberId) }} style={styles.miniAvatar} />
                  <Text style={styles.voteMemberName}>{getUserName(memberId)}</Text>
                  {expense.createdBy === memberId && (
                    <Text style={styles.creatorTag}>Creator</Text>
                  )}
                </View>
                <View style={styles.voteMemberStatus}>
                  {voteVal === 1 ? (
                    <View style={[styles.decisionDot, styles.dotApprove]}>
                      <ShieldCheck size={14} color={COLORS.light.success} />
                      <Text style={[styles.decisionText, styles.textApprove]}>Approved</Text>
                    </View>
                  ) : voteVal === -1 ? (
                    <View style={styles.rejectCell}>
                      <View style={[styles.decisionDot, styles.dotReject]}>
                        <ShieldAlert size={14} color={COLORS.light.error} />
                        <Text style={[styles.decisionText, styles.textReject]}>Rejected</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.decisionPendingText}>No decision</Text>
                  )}
                </View>
                {rejectRes ? (
                  <View style={styles.inlineRejectReason}>
                    <Text style={styles.inlineReasonText}>Reason: {rejectRes}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          {/* Voting Action buttons */}
          {trip.status !== 'completed' && user && (
            expense.status === 'rejected' ? (
              <View style={styles.disputeResolveBox}>
                <Text style={styles.disputeResolveTitle}>Pending Group Decision:</Text>
                <View style={styles.votingActionsRow}>
                  <TouchableOpacity
                    style={[styles.voteBtn, styles.approveBtn, { flex: 1.3 }]}
                    onPress={handleForceApproveAction}
                  >
                    <Text style={[styles.voteBtnText, styles.approveBtnText]}>Approve anyway</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.voteBtn, styles.rejectBtn, { flex: 1 }]}
                    onPress={handleDeleteAction}
                  >
                    <Text style={[styles.voteBtnText, styles.rejectBtnText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : expense.createdBy === user.uid ? (
              <View style={styles.autoVoteBadge}>
                <Text style={styles.autoVoteBadgeText}>✓ Your vote counted automatically</Text>
              </View>
            ) : (
              // Other members
              expense.votes && expense.votes[user.uid] !== undefined ? (
                // Already voted
                <View style={[
                  styles.votedStatusBadge,
                  expense.votes[user.uid] === 1 ? styles.votedApproveBadge : styles.votedRejectBadge
                ]}>
                  <Text style={[
                    styles.votedStatusText,
                    { color: expense.votes[user.uid] === 1 ? COLORS.light.success : COLORS.light.error }
                  ]}>
                    {expense.votes[user.uid] === 1 ? 'Approved by You' : 'Rejected by You'}
                  </Text>
                </View>
              ) : (
                // Not voted yet
                <View style={styles.votingActionsRow}>
                  <TouchableOpacity
                    style={[styles.voteBtn, styles.approveBtn]}
                    onPress={() => handleVoteAction(1)}
                  >
                    <Text style={[styles.voteBtnText, styles.approveBtnText]}>Approve (+1)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.voteBtn, styles.rejectBtn]}
                    onPress={() => handleVoteAction(-1)}
                  >
                    <Text style={[styles.voteBtnText, styles.rejectBtnText]}>Reject (-1)</Text>
                  </TouchableOpacity>
                </View>
              )
            )
          )}
        </View>

        {/* Payer Breakdown */}
        <View style={styles.whiteCard}>
          <Text style={styles.cardTitle}>Payers Breakdown</Text>
          {Object.entries(expense.paidBy).map(([uid, val]) => (
            <View key={uid} style={styles.payerBreakdownRow}>
              <View style={styles.payerProfile}>
                <Image source={{ uri: getUserAvatar(uid) }} style={styles.miniAvatar} />
                <Text style={styles.payerName}>{getUserName(uid)}</Text>
              </View>
              <Text style={styles.payerAmount}>₹{val.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Version Audit Log Timeline */}
        <View style={styles.whiteCard}>
          <View style={styles.versionHeader}>
            <History size={16} color={COLORS.light.text} />
            <Text style={styles.cardTitle}>Audit Trail & Edits History</Text>
          </View>
          
          {loadingHistory ? (
            <ActivityIndicator color={COLORS.light.primary} style={{ margin: SPACING.md }} />
          ) : historyVersions.length === 0 ? (
            <Text style={styles.noHistoryText}>No edits have been made. This is the original version.</Text>
          ) : (
            <View style={styles.historyList}>
              <View key="current" style={styles.historyItem}>
                <View style={styles.historyLineContainer}>
                  <View style={[styles.historyDot, styles.activeHistoryDot]} />
                  <View style={styles.historyLine} />
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyVerTitle}>Active Version {expense.version}</Text>
                  <Text style={styles.historyVerInfo}>
                    Updated by {getUserName(expense.updatedBy)} • {new Date(expense.updatedAt).toLocaleString()}
                  </Text>
                  <Text style={styles.historyChangeDesc}>Current approved details in use.</Text>
                </View>
              </View>

              {historyVersions.map((ver) => (
                <View key={ver.id} style={styles.historyItem}>
                  <View style={styles.historyLineContainer}>
                    <View style={styles.historyDot} />
                    <View style={styles.historyLine} />
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyVerTitle}>Archived Version {ver.version}</Text>
                    <Text style={styles.historyVerInfo}>
                      Edited by {getUserName(ver.updatedBy)} • {new Date(ver.updatedAt).toLocaleString()}
                    </Text>
                    <Text style={styles.historyChangeDesc}>
                      Title: "{ver.title}" • Amount: ₹{ver.amount} • Category: {ver.category}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.light.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.light.primary,
  },
  versionBadge: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    fontWeight: '500',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  mainAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginTop: SPACING.xs,
  },
  metaDivider: {
    height: 1,
    backgroundColor: COLORS.light.border,
    marginVertical: SPACING.md,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  metaGridCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaCellText: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
  },
  notesContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    backgroundColor: COLORS.light.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  notesIcon: {
    marginTop: 2,
    marginRight: SPACING.xs,
  },
  notesText: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  disputeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.error,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.light.sm,
  },
  disputeBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  disputeResolveBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  disputeResolveTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.light.error,
    marginBottom: SPACING.sm,
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  statusTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  statusApproved: {
    backgroundColor: COLORS.light.success,
  },
  statusPending: {
    backgroundColor: COLORS.light.warning,
  },
  statusRejected: {
    backgroundColor: COLORS.light.error,
  },
  statusIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scoreRow: {
    marginBottom: SPACING.md,
  },
  scoreText: {
    fontSize: 13,
    color: COLORS.light.text,
  },
  boldText: {
    fontWeight: 'bold',
  },
  votingSubHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.sm,
  },
  voteMemberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  voteMemberProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.round,
  },
  voteMemberName: {
    fontSize: 13,
    color: COLORS.light.text,
  },
  creatorTag: {
    fontSize: 9,
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    color: COLORS.light.textSecondary,
  },
  voteMemberStatus: {
    alignItems: 'flex-end',
  },
  decisionDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  decisionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textApprove: {
    color: COLORS.light.success,
  },
  textReject: {
    color: COLORS.light.error,
  },
  decisionPendingText: {
    fontSize: 12,
    color: COLORS.light.textMuted,
  },
  rejectCell: {
    alignItems: 'flex-end',
  },
  inlineRejectReason: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
    padding: SPACING.sm,
    borderRadius: RADIUS.xs,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.08)',
  },
  inlineReasonText: {
    fontSize: 11,
    color: COLORS.light.error,
  },
  votingActionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
    paddingTop: SPACING.md,
  },
  voteBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  approveBtn: {
    borderColor: COLORS.light.success,
  },
  approveBtnText: {
    color: COLORS.light.success,
  },
  rejectBtn: {
    borderColor: COLORS.light.error,
  },
  rejectBtnText: {
    color: COLORS.light.error,
  },
  activeApproveBtn: {
    backgroundColor: COLORS.light.success,
  },
  activeRejectBtn: {
    backgroundColor: COLORS.light.error,
  },
  activeVoteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  voteBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  payerBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  payerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  payerName: {
    fontSize: 13,
    color: COLORS.light.text,
  },
  payerAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  noHistoryText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  historyList: {
    marginTop: SPACING.xs,
  },
  historyItem: {
    flexDirection: 'row',
  },
  historyLineContainer: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.light.border,
    marginTop: 6,
  },
  activeHistoryDot: {
    backgroundColor: COLORS.light.primary,
    width: 10,
    height: 10,
  },
  historyLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.light.border,
    minHeight: 50,
  },
  historyDetails: {
    flex: 1,
    paddingBottom: SPACING.md,
  },
  historyVerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  historyVerInfo: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  historyChangeDesc: {
    fontSize: 11,
    color: COLORS.light.textMuted,
    marginTop: 4,
  },
  autoVoteBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    width: '100%',
  },
  autoVoteBadgeText: {
    color: COLORS.light.success,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  votedStatusBadge: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    width: '100%',
  },
  votedApproveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  votedRejectBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  votedStatusText: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
