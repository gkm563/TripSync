import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  FlatList,
  TextInput,
  Modal,
  Image,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { calculateSettlement } from '../utils/settlementEngine';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { 
  ChevronLeft, 
  UserPlus, 
  Download, 
  Grid, 
  DollarSign, 
  Users, 
  History, 
  Lock, 
  Check, 
  Plus, 
  AlertCircle,
  FileText,
  Copy,
  Info,
  CheckCircle2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TripDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'TripDetail'>;

const { width } = Dimensions.get('window');

export default function TripDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { tripId } = route.params;

  const { user, usersList } = useAuthStore();
  const { trips, inviteMember, requestEndTrip, cancelEndTrip } = useTripStore();
  const { 
    expenses, 
    personalExpenses, 
    activityLogs, 
    addPersonalExpense,
    deletePersonalExpense,
    voteExpense,
    syncExpenses, 
    syncPersonalExpenses, 
    syncActivityLogs 
  } = useExpenseStore();
  const { addNotification } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'settlement' | 'activity' | 'personal'>('dashboard');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Personal Expense form
  const [personalTitle, setPersonalTitle] = useState('');
  const [personalAmount, setPersonalAmount] = useState('');
  const [personalCategory, setPersonalCategory] = useState('Food');

  const trip = trips.find(t => t.id === tripId);

  useEffect(() => {
    if (user && trip) {
      const unsubExp = syncExpenses(tripId);
      const unsubPers = syncPersonalExpenses(tripId, user.uid);
      const unsubLogs = syncActivityLogs(tripId);
      return () => {
        unsubExp();
        unsubPers();
        unsubLogs();
      };
    }
  }, [tripId, user]);

  if (!trip) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={48} color={COLORS.light.error} />
        <Text style={styles.errorText}>Trip not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const activeMembers = usersList.filter(u => trip.members.includes(u.uid));
  const tripExpenses = expenses.filter(e => e.tripId === tripId);
  const approvedExpenses = tripExpenses.filter(e => e.status === 'approved');
  const pendingExpenses = tripExpenses.filter(e => e.status === 'pending');
  const majorityNeeded = Math.floor(trip.members.length / 2) + 1;

  // Calculate live settlements
  const settlement = calculateSettlement(trip.members, tripExpenses);

  // Custom Category Chart data calculations
  const categories = ['Food', 'Travel', 'Hotel', 'Shopping', 'Other'] as const;
  const categoryTotals = categories.reduce((acc, cat) => {
    acc[cat] = approvedExpenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  const hasChartData = settlement.totalExpense > 0;

  // Invite member submission
  const handleInvite = async () => {
    if (!inviteEmail || !user) return;
    setInviteLoading(true);
    try {
      await inviteMember(tripId, inviteEmail, user);
      
      // Simulate real-time notification to the invited user
      const targetUser = usersList.find(u => u.email.toLowerCase() === inviteEmail.toLowerCase());
      if (targetUser) {
        await addNotification(
          targetUser.uid,
          'Trip Invitation',
          `${user.name} invited you to join "${trip.name}"`,
          'invitation',
          tripId
        );
      }
      
      Alert.alert('Success', `Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Invitation failed');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAddPersonal = async () => {
    if (!personalTitle || !personalAmount || !user) return;
    try {
      await addPersonalExpense(
        user.uid,
        tripId,
        personalTitle,
        parseFloat(personalAmount),
        personalCategory,
        new Date().toISOString().split('T')[0],
        new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
      );
      setPersonalTitle('');
      setPersonalAmount('');
    } catch (e: any) {
      Alert.alert('Error', 'Failed to add personal expense');
    }
  };

  const handleVote = async (expenseId: string, voteValue: 1 | -1) => {
    if (!user) return;
    try {
      if (voteValue === -1) {
        // Reject requires reason. For simplicity in quick-action card, we prompt
        Alert.prompt(
          'Mandatory Reject Reason',
          'Choose a reason:\nWrong Amount, Duplicate Expense, Wrong Category, Other\n(If Other, write min 20 characters)',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Submit',
              onPress: async (reason) => {
                if (!reason) {
                  Alert.alert('Error', 'Reason is required to reject an expense');
                  return;
                }
                if (reason.length < 5) {
                  Alert.alert('Error', 'Please provide a valid reason');
                  return;
                }
                await voteExpense(expenseId, user.uid, user.name, -1, reason, trip.members.length);
              }
            }
          ]
        );
      } else {
        await voteExpense(expenseId, user.uid, user.name, 1, undefined, trip.members.length);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const getUserNameById = (uid: string) => {
    return usersList.find(u => u.uid === uid)?.name || 'Unknown';
  };

  const getUserAvatarById = (uid: string) => {
    return usersList.find(u => u.uid === uid)?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  };

  // Render donut chart dynamically with pure SVG
  const renderDonutChart = () => {
    const data = categories.map(cat => ({
      category: cat,
      value: categoryTotals[cat],
      color: cat === 'Food' ? '#3B82F6' : cat === 'Travel' ? '#10B981' : cat === 'Hotel' ? '#EC4899' : cat === 'Shopping' ? '#F59E0B' : '#8B5CF6'
    })).filter(d => d.value > 0);

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulativePercent = 0;
    const radius = 60;
    const strokeWidth = 16;
    const circ = 2 * Math.PI * radius;

    return (
      <View style={styles.chartContainer}>
        <Svg width={150} height={150} viewBox="0 0 150 150">
          <G rotation={-90} origin="75, 75">
            <Circle
              cx={75}
              cy={75}
              r={radius}
              fill="transparent"
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
            />
            {data.map((item, index) => {
              const percent = item.value / total;
              const strokeDashoffset = circ * (1 - percent);
              const rotation = cumulativePercent * 360;
              cumulativePercent += percent;

              return (
                <Circle
                  key={item.category}
                  cx={75}
                  cy={75}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circ} ${circ}`}
                  strokeDashoffset={strokeDashoffset}
                  rotation={rotation}
                  origin="75, 75"
                />
              );
            })}
          </G>
        </Svg>
        <View style={styles.chartLegends}>
          {data.map(item => (
            <View key={item.category} style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.category}: ₹{item.value} ({Math.round((item.value / total) * 100)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
          <ChevronLeft size={24} color={COLORS.light.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{trip.name}</Text>
          <Text style={styles.headerSubtitle}>
            {trip.startDate} to {trip.expectedEndDate}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerBtn} 
            onPress={() => setInviteModalVisible(true)}
            disabled={trip.status === 'completed'}
          >
            <UserPlus size={22} color={trip.status === 'completed' ? COLORS.light.textMuted : COLORS.light.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => navigation.navigate('ExportConfig', { tripId })}
          >
            <Download size={22} color={COLORS.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'dashboard' && styles.activeTabItem]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Grid size={16} color={activeTab === 'dashboard' ? COLORS.light.primary : COLORS.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'expenses' && styles.activeTabItem]}
            onPress={() => setActiveTab('expenses')}
          >
            <DollarSign size={16} color={activeTab === 'expenses' ? COLORS.light.primary : COLORS.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'settlement' && styles.activeTabItem]}
            onPress={() => setActiveTab('settlement')}
          >
            <Users size={16} color={activeTab === 'settlement' ? COLORS.light.primary : COLORS.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'settlement' && styles.activeTabText]}>Settlement</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'activity' && styles.activeTabItem]}
            onPress={() => setActiveTab('activity')}
          >
            <History size={16} color={activeTab === 'activity' ? COLORS.light.primary : COLORS.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Timeline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'personal' && styles.activeTabItem]}
            onPress={() => setActiveTab('personal')}
          >
            <Lock size={16} color={activeTab === 'personal' ? COLORS.light.primary : COLORS.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>Personal</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <View>
            {/* Total Expense Card */}
            <LinearGradient
              colors={COLORS.light.primaryGradient as any}
              style={styles.dashboardCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.cardHeaderTitle}>Total Shared Group Expense</Text>
              <Text style={styles.mainTotalText}>₹{settlement.totalExpense.toLocaleString()}</Text>
              <View style={styles.cardShareRow}>
                <Text style={styles.shareText}>Per Member: ₹{settlement.perMember.toLocaleString()}</Text>
                <Text style={styles.shareText}>{trip.members.length} Members</Text>
              </View>
            </LinearGradient>

            {/* Spend Breakdown Chart */}
            <View style={styles.whiteCard}>
              <Text style={styles.cardTitle}>Category Breakdown</Text>
              {hasChartData ? (
                renderDonutChart()
              ) : (
                <View style={styles.noDataBreakdown}>
                  <Info size={24} color={COLORS.light.textMuted} />
                  <Text style={styles.noDataText}>No approved expenses to display category chart.</Text>
                </View>
              )}
            </View>

            {/* Contributions progress list */}
            <View style={styles.whiteCard}>
              <Text style={styles.cardTitle}>Member Contributions</Text>
              {activeMembers.map((member) => {
                const contrib = settlement.contributions[member.uid] || 0;
                const percent = settlement.totalExpense > 0 ? (contrib / settlement.totalExpense) * 100 : 0;
                
                return (
                  <View key={member.uid} style={styles.memberProgressRow}>
                    <Image source={{ uri: member.photoURL }} style={styles.memberAvatar} />
                    <View style={styles.memberProgressInfo}>
                      <View style={styles.memberNameAmtRow}>
                        <Text style={styles.memberNameText}>{member.name}</Text>
                        <Text style={styles.memberAmtText}>₹{contrib.toLocaleString()}</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Tab 2: Shared Expenses */}
        {activeTab === 'expenses' && (
          <View>
            {/* Pending Approvals Review Section */}
            {pendingExpenses.length > 0 && (
              <View style={styles.pendingQueueSection}>
                <Text style={styles.subSectionHeader}>Pending Review ({pendingExpenses.length})</Text>
                {pendingExpenses.map((exp) => {
                  const score = Object.values(exp.votes || {}).reduce((a, b) => a + b, 0);
                  const hasVoted = exp.votes && user && exp.votes[user.uid] !== undefined;

                  return (
                    <View key={exp.id} style={styles.pendingExpenseCard}>
                      <View style={styles.pendingMainRow}>
                        <View style={styles.expCategoryBadge}>
                          <Text style={styles.catBadgeText}>{exp.category}</Text>
                        </View>
                        <Text style={styles.pendingExpTitle}>{exp.title}</Text>
                        <Text style={styles.pendingExpAmount}>₹{exp.amount}</Text>
                      </View>
                      
                      <Text style={styles.pendingCreatedBy}>
                        Paid by {getUserNameById(Object.keys(exp.paidBy)[0] || '')} • Created by {getUserNameById(exp.createdBy)}
                      </Text>

                      <View style={styles.pendingVotesRow}>
                        <Text style={styles.votesLabel}>
                          Score: <Text style={styles.boldText}>{score}</Text> / {majorityNeeded} required
                        </Text>
                        
                        {exp.createdBy === user?.uid ? (
                          <View style={styles.autoVoteMiniBadge}>
                            <Text style={styles.autoVoteMiniBadgeText}>✓ Your vote counted automatically</Text>
                          </View>
                        ) : (
                          // Other members
                          exp.votes && user && exp.votes[user.uid] !== undefined ? (
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
                            <View style={styles.votingActionRow}>
                              <TouchableOpacity
                                style={[
                                  styles.voteMiniBtn, 
                                  styles.approveMiniBtn
                                ]}
                                onPress={() => handleVote(exp.id, 1)}
                                disabled={trip.status === 'completed'}
                              >
                                <Text style={styles.voteMiniText}>Approve</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.voteMiniBtn, 
                                  styles.rejectMiniBtn
                                ]}
                                onPress={() => handleVote(exp.id, -1)}
                                disabled={trip.status === 'completed'}
                              >
                                <Text style={styles.voteMiniText}>Reject</Text>
                              </TouchableOpacity>
                            </View>
                          )
                        )}
                      </View>

                      {Object.keys(exp.rejectReasons || {}).length > 0 && (
                        <View style={styles.rejectionReasonsBox}>
                          <Text style={styles.rejectionsTitle}>Rejection Reasons:</Text>
                          {Object.entries(exp.rejectReasons).map(([uid, r]) => (
                            <Text key={uid} style={styles.rejectionText}>
                              • <Text style={styles.boldText}>{getUserNameById(uid)}</Text>: {r}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Approved Feed */}
            <Text style={styles.subSectionHeader}>Approved Expenses ({approvedExpenses.length})</Text>
            {approvedExpenses.length === 0 ? (
              <View style={styles.emptyFeedBox}>
                <DollarSign size={32} color={COLORS.light.textMuted} />
                <Text style={styles.emptyTitle}>No Approved Expenses</Text>
                <Text style={styles.emptySub}>Expenses show here once they pass voting majority.</Text>
              </View>
            ) : (
              approvedExpenses.map((exp) => (
                <TouchableOpacity
                  key={exp.id}
                  style={styles.expenseItemCard}
                  onPress={() => navigation.navigate('ExpenseDetails', { tripId, expenseId: exp.id })}
                >
                  <View style={styles.expLeftInfo}>
                    <Text style={styles.expItemTitle}>{exp.title}</Text>
                    <Text style={styles.expItemSub}>
                      Paid by {getUserNameById(Object.keys(exp.paidBy)[0] || '')} • {exp.date}
                    </Text>
                  </View>
                  <View style={styles.expRightInfo}>
                    <Text style={styles.expItemAmount}>₹{exp.amount}</Text>
                    <View style={styles.approvedIndicator}>
                      <Check size={10} color="#fff" />
                      <Text style={styles.approvedText}>Approved</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Tab 3: Settlement */}
        {activeTab === 'settlement' && (
          trip.status === 'completed' ? (
            <View>
              {/* Finalized Trip Summary Header Banner */}
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.completedHeaderBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <CheckCircle2 size={32} color="#fff" />
                <View style={styles.completedHeaderTextContainer}>
                  <Text style={styles.completedHeaderTitle}>Trip Completed & Finalized!</Text>
                  <Text style={styles.completedHeaderSubtitle}>All expenses locked and final calculations settled.</Text>
                </View>
              </LinearGradient>

              {/* Total Summary Stats Card */}
              <View style={styles.completedStatsCard}>
                <View style={styles.completedStatCol}>
                  <Text style={styles.completedStatLabel}>Total Shared Expense</Text>
                  <Text style={styles.completedStatValue}>₹{settlement.totalExpense.toLocaleString()}</Text>
                </View>
                <View style={styles.completedStatDivider} />
                <View style={styles.completedStatCol}>
                  <Text style={styles.completedStatLabel}>Per Member Share</Text>
                  <Text style={styles.completedStatValue}>₹{settlement.perMember.toLocaleString()}</Text>
                </View>
              </View>

              {/* Section 1: Member Spending Summary (Kiska kitna kharch hua) */}
              <View style={styles.whiteCard}>
                <Text style={styles.completedSectionTitle}>Member Contributions & Balances</Text>
                <Text style={styles.completedSectionSub}>Here is who spent how much and their final standing.</Text>
                
                {activeMembers.map((member) => {
                  const spent = settlement.contributions[member.uid] || 0;
                  const bal = settlement.balances[member.uid] || 0;
                  const isCreditor = bal > 0;
                  const isSettled = Math.abs(bal) < 0.05;

                  return (
                    <View key={member.uid} style={styles.completedMemberRow}>
                      <View style={styles.memberProfile}>
                        <Image source={{ uri: member.photoURL }} style={styles.memberAvatar} />
                        <View style={styles.memberInfoCol}>
                          <Text style={styles.memberName}>{member.name}</Text>
                          <Text style={styles.memberSpentSub}>Spent: ₹{spent.toLocaleString()}</Text>
                        </View>
                      </View>
                      <View style={styles.balanceStatusCol}>
                        {isSettled ? (
                          <View style={[styles.statusBadge, styles.statusBadgeSettled]}>
                            <Text style={styles.statusBadgeTextSettled}>Settled</Text>
                          </View>
                        ) : isCreditor ? (
                          <View style={styles.statusBadgeGets}>
                            <Text style={styles.statusBadgeTextGets}>Gets back ₹{bal.toLocaleString()}</Text>
                          </View>
                        ) : (
                          <View style={styles.statusBadgeOwes}>
                            <Text style={styles.statusBadgeTextOwes}>Owes ₹{Math.abs(bal).toLocaleString()}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Section 2: Final Settlement Steps (Kisko kitna dena hai) */}
              <View style={styles.whiteCard}>
                <Text style={styles.completedSectionTitle}>Payments to Settle (Kitna Kisko Dena Hai)</Text>
                <Text style={styles.completedSectionSub}>Optimized steps to clear all pending payments.</Text>
                
                {settlement.transactions.length === 0 ? (
                  <View style={styles.settledCompleteContainer}>
                    <CheckCircle2 size={36} color={COLORS.light.success} />
                    <Text style={styles.settledCompleteTitle}>Group is Fully Settled!</Text>
                    <Text style={styles.settledCompleteSub}>No debts need transferring.</Text>
                  </View>
                ) : (
                  settlement.transactions.map((tx, idx) => {
                    const creditorUser = usersList.find(u => u.uid === tx.to);
                    const upiId = creditorUser?.email ? `${creditorUser.email.split('@')[0]}@okaxis` : `${getUserNameById(tx.to).toLowerCase().replace(/\s+/g, '')}@okaxis`;
                    
                    return (
                      <View key={idx} style={styles.completedDebtCard}>
                        <View style={styles.debtFlow}>
                          <View style={styles.debtMemberInfo}>
                            <Image source={{ uri: getUserAvatarById(tx.from) }} style={styles.debtAvatar} />
                            <Text style={styles.debtMemberName} numberOfLines={1}>{getUserNameById(tx.from)}</Text>
                          </View>
                          
                          <View style={styles.debtAmountContainer}>
                            <Text style={styles.debtAmountText}>Pay ₹{tx.amount.toLocaleString()}</Text>
                            <Text style={styles.debtArrowText}>────────➔</Text>
                          </View>

                          <View style={styles.debtMemberInfo}>
                            <Image source={{ uri: getUserAvatarById(tx.to) }} style={styles.debtAvatar} />
                            <Text style={styles.debtMemberName} numberOfLines={1}>{getUserNameById(tx.to)}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.debtActionsRow}>
                          <Text style={styles.upiInstructions}>Send ₹{tx.amount.toLocaleString()} to {getUserNameById(tx.to)}</Text>
                          <TouchableOpacity
                            style={styles.completedUpiBtn}
                            onPress={() => {
                              Alert.alert('Copied UPI ID', `UPI ID for ${getUserNameById(tx.to)}:\n${upiId}\ncopied to clipboard!`);
                            }}
                          >
                            <Copy size={12} color="#fff" />
                            <Text style={styles.completedUpiBtnText}>Copy UPI</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          ) : (
            <View>
              {/* Live calculations */}
              <View style={styles.whiteCard}>
                <Text style={styles.cardTitle}>Live Net Balances</Text>
                <Text style={styles.cardSubText}>Positive means owed money, negative means owes money.</Text>
                {activeMembers.map((member) => {
                  const bal = settlement.balances[member.uid] || 0;
                  const isCreditor = bal > 0;
                  
                  return (
                    <View key={member.uid} style={styles.balanceRow}>
                      <View style={styles.balanceProfile}>
                        <Image source={{ uri: member.photoURL }} style={styles.memberAvatar} />
                        <Text style={styles.balanceName}>{member.name}</Text>
                      </View>
                      <Text style={[styles.balanceAmountText, isCreditor ? styles.creditorAmt : styles.debtorAmt]}>
                        {isCreditor ? `+₹${bal}` : `-₹${Math.abs(bal)}`}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Debt Transfer path list */}
              <View style={styles.whiteCard}>
                <Text style={styles.cardTitle}>Debt Settlement Paths</Text>
                <Text style={styles.cardSubText}>Optimized transfer routes to settle all bills in minimum steps.</Text>
                {settlement.transactions.length === 0 ? (
                  <View style={styles.settledCompleteContainer}>
                    <CheckCircle2 size={32} color={COLORS.light.success} />
                    <Text style={styles.settledCompleteTitle}>Group is Fully Settled!</Text>
                    <Text style={styles.settledCompleteSub}>No debts need transferring.</Text>
                  </View>
                ) : (
                  settlement.transactions.map((tx, idx) => (
                    <View key={idx} style={styles.debtCard}>
                      <View style={styles.debtFlow}>
                        <Image source={{ uri: getUserAvatarById(tx.from) }} style={styles.debtAvatar} />
                        <View style={styles.debtFlowTextContainer}>
                          <Text style={styles.debtFlowBold}>{getUserNameById(tx.from)}</Text>
                          <Text style={styles.debtFlowSub}>owes</Text>
                          <Text style={styles.debtFlowBold}>{getUserNameById(tx.to)}</Text>
                        </View>
                        <Image source={{ uri: getUserAvatarById(tx.to) }} style={styles.debtAvatar} />
                      </View>
                      <View style={styles.debtFooter}>
                        <Text style={styles.debtAmountValue}>₹{tx.amount.toLocaleString()}</Text>
                        <TouchableOpacity
                          style={styles.upiCopyBtn}
                          onPress={() => Alert.alert('Copied', 'UPI ID copied to clipboard!')}
                        >
                          <Copy size={14} color={COLORS.light.primary} />
                          <Text style={styles.upiBtnText}>Copy UPI</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Trip Ending Agreement Panel */}
              <View style={styles.whiteCard}>
                <Text style={styles.cardTitle}>Trip End Status</Text>
                <Text style={styles.cardSubText}>Ending a trip locks it permanently and caches final settlements.</Text>

                <View style={styles.endProgressBox}>
                  <Text style={styles.endProgressTitle}>
                    Unanimous Votes: {trip.endRequests?.length || 0} / {trip.members.length} Agreed
                  </Text>
                  {activeMembers.map((member) => {
                    const agreed = trip.endRequests?.includes(member.uid);
                    return (
                      <View key={member.uid} style={styles.memberEndVoteRow}>
                        <Text style={styles.memberNameEnd}>{member.name}</Text>
                        <View style={[styles.voteDot, agreed ? styles.voteDotAgreed : styles.voteDotPending]}>
                          <Text style={styles.voteDotText}>{agreed ? 'AGREED' : 'PENDING'}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {user && (
                  <TouchableOpacity
                    style={[
                      styles.endTripBtn,
                      trip.endRequests?.includes(user.uid) && styles.cancelEndTripBtn
                    ]}
                    onPress={() => {
                      if (trip.endRequests?.includes(user.uid)) {
                        cancelEndTrip(tripId, user.uid);
                      } else {
                        requestEndTrip(tripId, user.uid);
                      }
                    }}
                    disabled={trip.status === 'completed'}
                  >
                    <Text style={styles.endTripBtnText}>
                      {trip.status === 'completed'
                        ? 'Trip is Completed & Locked'
                        : trip.endRequests?.includes(user.uid)
                          ? 'Withdraw Agreement'
                          : 'Agree to End Trip'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )
        )}

        {/* Tab 4: Activity Timeline */}
        {activeTab === 'activity' && (
          <View>
            <View style={styles.whiteCard}>
              <Text style={styles.cardTitle}>Activity Timeline</Text>
              {activityLogs.length === 0 ? (
                <Text style={styles.emptyLogsText}>No actions logged yet.</Text>
              ) : (
                activityLogs.map((log) => (
                  <View key={log.id} style={styles.timelineRow}>
                    <View style={styles.timelinePoint}>
                      <View style={styles.pointDot} />
                      <View style={styles.pointLine} />
                    </View>
                    <View style={styles.timelineContentCard}>
                      <Text style={styles.logText}>{log.action}</Text>
                      <Text style={styles.logTime}>
                        {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Tab 5: Personal Private Expenses */}
        {activeTab === 'personal' && (
          <View>
            {/* Total Personal Expense display */}
            <View style={styles.personalTotalCard}>
              <Text style={styles.persTitle}>Your Private Personal Expenses</Text>
              <Text style={styles.persAmount}>
                ₹{personalExpenses.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </Text>
              <Text style={styles.persNotice}>These numbers are hidden from other trip members.</Text>
            </View>

            {/* Quick Add Form */}
            {trip.status !== 'completed' && (
              <View style={styles.whiteCard}>
                <Text style={styles.cardTitle}>Add Private Expense</Text>
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.miniInput, { flex: 2 }]}
                    placeholder="Expense Title"
                    value={personalTitle}
                    onChangeText={setPersonalTitle}
                  />
                  <TextInput
                    style={[styles.miniInput, { flex: 1 }]}
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={personalAmount}
                    onChangeText={setPersonalAmount}
                  />
                </View>
                <View style={styles.formRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                    {['Food', 'Travel', 'Hotel', 'Shopping', 'Other'].map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.catSelectBtn,
                          personalCategory === cat && styles.catSelectBtnActive
                        ]}
                        onPress={() => setPersonalCategory(cat)}
                      >
                        <Text style={[styles.catSelectText, personalCategory === cat && styles.catSelectTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.persAddBtn} onPress={handleAddPersonal}>
                    <Text style={styles.persAddText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* List */}
            <View style={styles.whiteCard}>
              <Text style={styles.cardTitle}>Private Items</Text>
              {personalExpenses.length === 0 ? (
                <Text style={styles.emptyLogsText}>No private expenses logged.</Text>
              ) : (
                personalExpenses.map((exp) => (
                  <View key={exp.id} style={styles.personalItem}>
                    <View>
                      <Text style={styles.personalItemTitle}>{exp.title}</Text>
                      <Text style={styles.personalItemMeta}>{exp.category} • {exp.date}</Text>
                    </View>
                    <View style={styles.persRight}>
                      <Text style={styles.personalItemAmt}>₹{exp.amount}</Text>
                      {trip.status !== 'completed' && (
                        <TouchableOpacity onPress={() => deletePersonalExpense(exp.id)}>
                          <Text style={styles.delText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Expense Shortcut */}
      {trip.status !== 'completed' && activeTab === 'expenses' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddExpense', { tripId })}
        >
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Member Invite Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Invite Member</Text>
            <Text style={styles.modalSub}>Enter the email address of the user you wish to invite to this trip.</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. rohit@tripsync.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={inviteEmail}
              onChangeText={setInviteEmail}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalCancelBtn]} 
                onPress={() => setInviteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalSubmitBtn]} 
                onPress={handleInvite}
                disabled={inviteLoading}
              >
                {inviteLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Invite</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.light.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  backBtn: {
    backgroundColor: COLORS.light.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitleContainer: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.light.border,
  },
  tabsScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  activeTabItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.light.textSecondary,
  },
  activeTabText: {
    color: COLORS.light.primary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  dashboardCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.light.md,
  },
  cardHeaderTitle: {
    color: '#fff',
    opacity: 0.85,
    fontSize: 13,
  },
  mainTotalText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  cardShareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: SPACING.sm,
  },
  shareText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
    marginBottom: SPACING.xs,
  },
  cardSubText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.md,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  chartLegends: {
    flex: 1,
    marginLeft: SPACING.md,
    gap: SPACING.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.round,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
  },
  noDataBreakdown: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  noDataText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
  },
  memberProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
  },
  memberProgressInfo: {
    flex: 1,
  },
  memberNameAmtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  memberNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  memberAmtText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.light.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.light.background,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.light.primary,
    borderRadius: RADIUS.round,
  },
  subSectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  emptyFeedBox: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginTop: SPACING.sm,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  expenseItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  expLeftInfo: {
    flex: 1,
  },
  expItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  expItemSub: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  expRightInfo: {
    alignItems: 'flex-end',
  },
  expItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  approvedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.success,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    gap: 2,
  },
  approvedText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  pendingQueueSection: {
    marginBottom: SPACING.md,
  },
  pendingExpenseCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    ...SHADOWS.light.sm,
  },
  pendingMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  expCategoryBadge: {
    backgroundColor: COLORS.light.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.light.textSecondary,
  },
  pendingExpTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.light.text,
    flex: 1,
  },
  pendingExpAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  pendingCreatedBy: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: SPACING.xs,
  },
  pendingVotesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
    paddingTop: SPACING.md,
  },
  votesLabel: {
    fontSize: 12,
    color: COLORS.light.text,
  },
  votingActionRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  voteMiniBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  voteMiniText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.light.textSecondary,
  },
  approveMiniBtn: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  rejectMiniBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  votedApproveBtn: {
    backgroundColor: COLORS.light.success,
    borderColor: COLORS.light.success,
  },
  votedRejectBtn: {
    backgroundColor: COLORS.light.error,
    borderColor: COLORS.light.error,
  },
  rejectionReasonsBox: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  rejectionsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.light.error,
    marginBottom: 2,
  },
  rejectionText: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  balanceProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  balanceName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.light.text,
  },
  balanceAmountText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  creditorAmt: {
    color: COLORS.light.success,
  },
  debtorAmt: {
    color: COLORS.light.error,
  },
  settledCompleteContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  settledCompleteTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  settledCompleteSub: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
  },
  debtCard: {
    backgroundColor: COLORS.light.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  debtFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  debtAvatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
  },
  debtFlowTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  debtFlowBold: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  debtFlowSub: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
  },
  debtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
    paddingTop: SPACING.sm,
  },
  debtAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.primary,
  },
  upiCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: RADIUS.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upiBtnText: {
    fontSize: 11,
    color: COLORS.light.primary,
    fontWeight: 'bold',
  },
  endProgressBox: {
    backgroundColor: COLORS.light.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  endProgressTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SPACING.sm,
  },
  memberEndVoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  memberNameEnd: {
    fontSize: 13,
    color: COLORS.light.text,
  },
  voteDot: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  voteDotAgreed: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  voteDotPending: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  voteDotText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.light.textSecondary,
  },
  endTripBtn: {
    backgroundColor: COLORS.light.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelEndTripBtn: {
    backgroundColor: COLORS.light.textSecondary,
  },
  endTripBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timelinePoint: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  pointDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.light.primary,
    marginTop: 6,
  },
  pointLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.light.border,
    minHeight: 40,
  },
  timelineContentCard: {
    flex: 1,
    backgroundColor: COLORS.light.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  logText: {
    fontSize: 13,
    color: COLORS.light.text,
  },
  logTime: {
    fontSize: 10,
    color: COLORS.light.textSecondary,
    marginTop: 4,
  },
  emptyLogsText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  personalTotalCard: {
    backgroundColor: COLORS.light.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  persTitle: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
  },
  persAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginVertical: 4,
  },
  persNotice: {
    fontSize: 10,
    color: COLORS.light.textMuted,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  miniInput: {
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.light.text,
    backgroundColor: COLORS.light.background,
  },
  catScroll: {
    gap: SPACING.xs,
    paddingVertical: 4,
  },
  catSelectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.light.background,
    marginRight: 4,
  },
  catSelectBtnActive: {
    backgroundColor: COLORS.light.primary,
  },
  catSelectText: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
  },
  catSelectTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  persAddBtn: {
    backgroundColor: COLORS.light.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  persAddText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  personalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  personalItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  personalItemMeta: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  persRight: {
    alignItems: 'flex-end',
  },
  personalItemAmt: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  delText: {
    color: COLORS.light.error,
    fontSize: 11,
    marginTop: 2,
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
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    ...SHADOWS.light.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SPACING.xs,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.light.text,
    backgroundColor: COLORS.light.background,
    marginBottom: SPACING.lg,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  modalCancelText: {
    color: COLORS.light.textSecondary,
    fontWeight: '500',
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.light.primary,
  },
  modalSubmitText: {
    color: '#fff',
    fontWeight: 'bold',
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
  completedHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.light.md,
  },
  completedHeaderTextContainer: {
    flex: 1,
  },
  completedHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedHeaderSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  completedStatsCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  completedStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  completedStatLabel: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginBottom: 4,
  },
  completedStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  completedStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.light.border,
  },
  completedSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: 2,
  },
  completedSectionSub: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.lg,
  },
  completedMemberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  memberInfoCol: {
    justifyContent: 'center',
  },
  memberSpentSub: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  balanceStatusCol: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  statusBadgeSettled: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  statusBadgeTextSettled: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.light.textSecondary,
  },
  statusBadgeGets: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusBadgeTextGets: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.light.success,
  },
  statusBadgeOwes: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusBadgeTextOwes: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.light.error,
  },
  completedDebtCard: {
    backgroundColor: COLORS.light.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  debtMemberInfo: {
    alignItems: 'center',
    width: 60,
  },
  debtMemberName: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  debtAmountContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtAmountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.light.primary,
    marginBottom: 2,
  },
  debtArrowText: {
    fontSize: 10,
    color: COLORS.light.textMuted,
    fontWeight: 'bold',
  },
  debtActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
    paddingTop: SPACING.sm,
  },
  upiInstructions: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  completedUpiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.light.primary,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  completedUpiBtnText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
});
