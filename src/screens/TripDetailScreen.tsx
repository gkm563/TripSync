import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  FlatList,
  TextInput,
  Modal,
  Image,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
  Clipboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  CheckCircle2,
  User,
  CreditCard,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  TrendingUp
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
    deleteExpense,
    forceApproveExpense,
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
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

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

  // Resolve active members robustly by mapping trip.members and falling back if not found in usersList
  const activeMembers = trip.members.map(uid => {
    const found = usersList.find(u => u.uid === uid);
    if (found) return found;
    if (uid === user?.uid) return user;
    return {
      uid,
      name: uid === user?.uid ? user.name : `Member (${uid.slice(0, 4)})`,
      email: '',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    };
  });
  const tripExpenses = expenses.filter(e => e.tripId === tripId);
  const approvedExpenses = tripExpenses.filter(e => e.status === 'approved');
  const pendingExpenses = tripExpenses.filter(e => e.status === 'pending');
  const rejectedExpenses = tripExpenses.filter(e => e.status === 'rejected');
  const tripPersonalExpenses = personalExpenses.filter(p => p.tripId === tripId && p.userId === (user?.uid || ''));
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

  // Daily spending timeline helpers
  const getGroupedExpensesByDay = () => {
    const groups: Record<string, {
      dateStr: string;
      formattedDate: string;
      totalGroupAmount: number;
      myPaidAmount: number;
      expenses: typeof approvedExpenses;
    }> = {};

    // Sort approved expenses by date and time ascending
    const sorted = [...approvedExpenses].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    sorted.forEach(exp => {
      const dateKey = exp.date; // YYYY-MM-DD
      if (!groups[dateKey]) {
        let formattedDate = '';
        try {
          const expDate = new Date(dateKey);
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);

          const expDateStr = expDate.toDateString();
          const todayStr = today.toDateString();
          const yesterdayStr = yesterday.toDateString();

          if (expDateStr === todayStr) {
            formattedDate = 'Today';
          } else if (expDateStr === yesterdayStr) {
            formattedDate = 'Yesterday';
          } else {
            formattedDate = expDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          }
        } catch {
          formattedDate = dateKey;
        }

        groups[dateKey] = {
          dateStr: dateKey,
          formattedDate,
          totalGroupAmount: 0,
          myPaidAmount: 0,
          expenses: []
        };
      }

      groups[dateKey].totalGroupAmount += exp.amount;
      const myPaid = exp.paidBy[user?.uid || ''] || 0;
      groups[dateKey].myPaidAmount += myPaid;
      groups[dateKey].expenses.push(exp);
    });

    // Convert to array and sort descending (newest day first)
    return Object.values(groups).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  };

  const toggleDayExpand = (dateStr: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  // Invite member submission
  const handleInvite = async () => {
    if (!inviteEmail || !user) return;
    setInviteLoading(true);
    try {
      await inviteMember(tripId, inviteEmail, user);
      
      // Simulate real-time notification to the invited user
      const targetUser = usersList.find(u => u.email && inviteEmail && u.email.toLowerCase() === inviteEmail.toLowerCase());
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

  const handleForceApprove = async (expenseId: string) => {
    if (!user) return;
    try {
      await forceApproveExpense(expenseId, user.uid, user.name);
      
      const exp = expenses.find(e => e.id === expenseId);
      if (exp && exp.createdBy !== user.uid) {
        await addNotification(
          exp.createdBy,
          'Expense Approved Anyway',
          `${user.name} approved the rejected expense "${exp.title}" (₹${exp.amount})`,
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

  const handleDeleteRejected = async (expenseId: string) => {
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
              Alert.alert('Deleted', 'Rejected expense deleted.');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete expense');
            }
          }
        }
      ]
    );
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
            <Grid size={16} color={activeTab === 'dashboard' ? '#fff' : COLORS.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'expenses' && styles.activeTabItem]}
            onPress={() => setActiveTab('expenses')}
          >
            <DollarSign size={16} color={activeTab === 'expenses' ? '#fff' : COLORS.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'settlement' && styles.activeTabItem]}
            onPress={() => setActiveTab('settlement')}
          >
            <Users size={16} color={activeTab === 'settlement' ? '#fff' : COLORS.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'settlement' && styles.activeTabText]}>Settlement</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'activity' && styles.activeTabItem]}
            onPress={() => setActiveTab('activity')}
          >
            <History size={16} color={activeTab === 'activity' ? '#fff' : COLORS.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Timeline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'personal' && styles.activeTabItem]}
            onPress={() => setActiveTab('personal')}
          >
            <Lock size={16} color={activeTab === 'personal' ? '#fff' : COLORS.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>Personal</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <View>
            {/* Horizontal Active Members Tray */}
            <View style={styles.membersTrayCard}>
              <Text style={styles.membersTrayTitle}>Trip Members ({activeMembers.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersTrayScroll}>
                {activeMembers.map((member) => (
                  <TouchableOpacity
                    key={member.uid}
                    style={styles.memberTrayItem}
                    onPress={() => setSelectedProfile(member)}
                  >
                    <Image source={{ uri: member.photoURL }} style={styles.memberTrayAvatar} />
                    <Text style={styles.memberTrayName} numberOfLines={1}>{member.name.split(' ')[0]}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

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

            {/* Daily Spending Timeline Card */}
            <View style={styles.whiteCard}>
              <View style={styles.timelineHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>📅 Daily Spending Timeline</Text>
                  <Text style={styles.timelineSubtitle}>Track hourly progress & manage your budget</Text>
                </View>
                <View style={styles.timelineHeaderBadge}>
                  <TrendingUp size={12} color={COLORS.light.primary} />
                  <Text style={styles.timelineHeaderBadgeText}>Live</Text>
                </View>
              </View>

              {getGroupedExpensesByDay().length === 0 ? (
                <View style={styles.noDataBreakdown}>
                  <Info size={20} color={COLORS.light.textMuted} />
                  <Text style={styles.noDataText}>No approved expenses logged for this trip yet.</Text>
                </View>
              ) : (
                getGroupedExpensesByDay().map((dayGroup, index) => {
                  const isExpanded = expandedDays[dayGroup.dateStr] ?? (index === 0);
                  const totalSpent = dayGroup.totalGroupAmount;
                  const myPaid = dayGroup.myPaidAmount;
                  
                  return (
                    <View key={dayGroup.dateStr} style={styles.dayGroupContainer}>
                      {/* Day Header Trigger */}
                      <TouchableOpacity 
                        style={styles.dayGroupHeader}
                        onPress={() => toggleDayExpand(dayGroup.dateStr)}
                      >
                        <View style={styles.dayHeaderLeft}>
                          <View style={styles.calendarIconContainer}>
                            <Calendar size={16} color={COLORS.light.primary} />
                          </View>
                          <View>
                            <Text style={styles.dayTitleText}>
                              {dayGroup.formattedDate}
                            </Text>
                            <Text style={styles.daySubText}>
                              {dayGroup.expenses.length} expense{dayGroup.expenses.length > 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.dayHeaderRight}>
                          <View style={styles.dayAmtContainer}>
                            <Text style={styles.dayGroupTotal}>₹{totalSpent.toLocaleString()}</Text>
                            <Text style={styles.dayUserPaid}>I Paid: ₹{myPaid.toLocaleString()}</Text>
                          </View>
                          {isExpanded ? (
                            <ChevronUp size={18} color={COLORS.light.textSecondary} />
                          ) : (
                            <ChevronDown size={18} color={COLORS.light.textSecondary} />
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Day Timeline Expenses List */}
                      {isExpanded && (
                        <View style={styles.timelineBody}>
                          {dayGroup.expenses.map((exp, expIdx) => {
                            const expPaid = exp.paidBy[user?.uid || ''] || 0;
                            const creator = activeMembers.find(m => m.uid === exp.createdBy);
                            const creatorName = creator ? (creator.uid === user?.uid ? 'You' : creator.name.split(' ')[0]) : 'Unknown';
                            
                            return (
                              <View key={exp.id} style={styles.timelineItem}>
                                {/* Left Time Column */}
                                <View style={styles.timelineTimeCol}>
                                  <Clock size={12} color={COLORS.light.textSecondary} style={{ marginRight: 4 }} />
                                  <Text style={styles.timelineTimeText}>{exp.time}</Text>
                                </View>

                                {/* Middle Line Node */}
                                <View style={styles.timelineLineContainer}>
                                  <View style={[
                                    styles.timelineNode,
                                    expPaid > 0 ? styles.timelineNodeActive : null
                                  ]} />
                                  {expIdx < dayGroup.expenses.length - 1 && (
                                    <View style={styles.timelineLine} />
                                  )}
                                </View>

                                {/* Right Content Column */}
                                <View style={styles.timelineContentCard}>
                                  <View style={styles.timelineContentHeader}>
                                    <Text style={styles.timelineItemTitle} numberOfLines={1}>{exp.title}</Text>
                                    <Text style={styles.timelineItemAmt}>₹{exp.amount.toLocaleString()}</Text>
                                  </View>
                                  <View style={styles.timelineContentFooter}>
                                    <Text style={styles.timelineItemMeta}>
                                      {exp.category} • Paid by {creatorName}
                                    </Text>
                                    {expPaid > 0 && (
                                      <Text style={styles.timelineMyPaid}>
                                        You paid ₹{expPaid.toLocaleString()}
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })
              )}

              {/* Daily Budget Decision Insight Box */}
              {getGroupedExpensesByDay().length > 0 && (
                <View style={styles.decisionInsightBox}>
                  <Info size={16} color={COLORS.light.primary} style={{ marginRight: 8, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.decisionInsightTitle}>Daily Budget Insight</Text>
                    {(() => {
                      const todayGroup = getGroupedExpensesByDay().find(g => g.formattedDate === 'Today');
                      if (!todayGroup) {
                        return <Text style={styles.decisionInsightText}>No expenses logged today. Your budget is completely clear for any upcoming travel plans!</Text>;
                      }
                      const todaySpent = todayGroup.totalGroupAmount;
                      if (todaySpent > 5000) {
                        return <Text style={styles.decisionInsightText}>⚠️ High Spend Alert: Today's group spend is ₹{todaySpent.toLocaleString()}. Consider review before scheduling further major spends tonight.</Text>;
                      } else if (todaySpent > 2000) {
                        return <Text style={styles.decisionInsightText}>💡 Moderate Spend Alert: Group spend is ₹{todaySpent.toLocaleString()} today. You are pacing normally for a typical day out.</Text>;
                      } else {
                        return <Text style={styles.decisionInsightText}>✅ Light Spend Alert: Group spend is just ₹{todaySpent.toLocaleString()} today. Excellent cost control, feel free to proceed with planned activities!</Text>;
                      }
                    })()}
                  </View>
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
                  <TouchableOpacity 
                    key={member.uid} 
                    style={styles.memberProgressRow}
                    onPress={() => setSelectedProfile(member)}
                  >
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
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Tab 2: Shared Expenses */}
        {activeTab === 'expenses' && (
          <View>
            {/* Rejected / Disputed Section */}
            {rejectedExpenses.length > 0 && (
              <View style={[styles.pendingQueueSection, { backgroundColor: 'rgba(239, 68, 68, 0.02)', borderColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Text style={[styles.subSectionHeader, { color: COLORS.light.error }]}>
                  Pending Decision / Disputed ({rejectedExpenses.length})
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.light.textSecondary, marginBottom: SPACING.md, marginTop: -4 }}>
                  These expenses were majority rejected. Any member can force-approve or permanently delete them.
                </Text>
                {rejectedExpenses.map((exp) => {
                  return (
                    <View key={exp.id} style={[styles.pendingExpenseCard, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
                      <View style={styles.pendingMainRow}>
                        <View style={[styles.expCategoryBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                          <Text style={[styles.catBadgeText, { color: COLORS.light.error }]}>{exp.category}</Text>
                        </View>
                        <Text style={styles.pendingExpTitle}>{exp.title}</Text>
                        <Text style={[styles.pendingExpAmount, { color: COLORS.light.error }]}>₹{exp.amount}</Text>
                      </View>
                      
                      <Text style={styles.pendingCreatedBy}>
                        Paid by {getUserNameById(Object.keys(exp.paidBy)[0] || '')} • Created by {getUserNameById(exp.createdBy)}
                      </Text>

                      <View style={[styles.pendingVotesRow, { marginTop: SPACING.sm }]}>
                        <View style={styles.votingActionRow}>
                          <TouchableOpacity
                            style={[
                              styles.voteMiniBtn, 
                              { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 12 }
                            ]}
                            onPress={() => handleForceApprove(exp.id)}
                            disabled={trip.status === 'completed'}
                          >
                            <Text style={[styles.voteMiniText, { color: COLORS.light.success, fontSize: 11 }]}>Approve Anyway</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.voteMiniBtn, 
                              { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)', paddingHorizontal: 12 }
                            ]}
                            onPress={() => handleDeleteRejected(exp.id)}
                            disabled={trip.status === 'completed'}
                          >
                            <Text style={[styles.voteMiniText, { color: COLORS.light.error, fontSize: 11 }]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {Object.keys(exp.rejectReasons || {}).length > 0 && (
                        <View style={styles.rejectionReasonsBox}>
                          <Text style={styles.rejectionsTitle}>Rejection Comments:</Text>
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
                    <TouchableOpacity 
                      key={member.uid} 
                      style={styles.completedMemberRow}
                      onPress={() => setSelectedProfile(member)}
                    >
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
                    </TouchableOpacity>
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
                    const upiId = creditorUser?.upiId || (creditorUser?.email ? `${creditorUser.email.split('@')[0]}@okaxis` : `${(getUserNameById(tx.to) || 'user').toLowerCase().replace(/\s+/g, '')}@okaxis`);
                    
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
                              Clipboard.setString(upiId);
                              Alert.alert('UPI ID Copied', `UPI ID for ${getUserNameById(tx.to)}: "${upiId}" has been copied to clipboard.`);
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
                          onPress={() => {
                            const creditorUser = usersList.find(u => u.uid === tx.to);
                            const upiId = creditorUser?.upiId || (creditorUser?.email ? `${creditorUser.email.split('@')[0]}@okaxis` : `${(getUserNameById(tx.to) || 'user').toLowerCase().replace(/\s+/g, '')}@okaxis`);
                            Clipboard.setString(upiId);
                            Alert.alert('UPI ID Copied', `UPI ID for ${getUserNameById(tx.to)}: "${upiId}" has been copied to clipboard.`);
                          }}
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
                ₹{tripPersonalExpenses.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
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
              {tripPersonalExpenses.length === 0 ? (
                <Text style={styles.emptyLogsText}>No private expenses logged.</Text>
              ) : (
                tripPersonalExpenses.map((exp) => (
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

      {/* User Profile Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={selectedProfile !== null}
        onRequestClose={() => setSelectedProfile(null)}
      >
        <View style={styles.profileModalBg}>
          <View style={styles.profileModalCard}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.profileModalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                style={styles.profileModalCloseBtn}
                onPress={() => setSelectedProfile(null)}
              >
                <Text style={styles.profileModalCloseText}>✕</Text>
              </TouchableOpacity>
              <Image
                source={{ uri: selectedProfile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' }}
                style={styles.profileModalAvatar}
              />
              <Text style={styles.profileModalName}>{selectedProfile?.name}</Text>
              <Text style={styles.profileModalEmail}>{selectedProfile?.email || 'No email shared'}</Text>
            </LinearGradient>

            <View style={styles.profileModalBody}>
              {/* Bio Section */}
              <View style={styles.profileSection}>
                <Text style={styles.profileSectionLabel}>About / Bio</Text>
                <Text style={styles.profileBioText}>
                  {selectedProfile?.bio || 'No bio added yet.'}
                </Text>
              </View>

              {/* UPI ID Section */}
              <View style={styles.profileSection}>
                <Text style={styles.profileSectionLabel}>UPI ID</Text>
                {selectedProfile?.upiId ? (
                  <TouchableOpacity
                    style={styles.profileUpiCapsule}
                    onPress={() => {
                      Clipboard.setString(selectedProfile.upiId);
                      Alert.alert('Copied', `UPI ID "${selectedProfile.upiId}" has been copied to clipboard!`);
                    }}
                  >
                    <CreditCard size={16} color={COLORS.light.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.profileUpiText}>{selectedProfile.upiId}</Text>
                    <Copy size={14} color={COLORS.light.textSecondary} style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.profileUpiCapsule, styles.profileUpiCapsuleDisabled]}>
                    <CreditCard size={16} color={COLORS.light.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.profileUpiTextDisabled}>No UPI ID linked</Text>
                  </View>
                )}
              </View>

              {/* Trip Statistics Section */}
              <View style={styles.profileSection}>
                <Text style={styles.profileSectionLabel}>Trip Stats</Text>
                <View style={styles.profileStatsRow}>
                  <View style={styles.profileStatBox}>
                    <User size={20} color={COLORS.light.primary} />
                    <Text style={styles.profileStatVal}>
                      {selectedProfile ? trips.filter(t => t.members.includes(selectedProfile.uid)).length : 0}
                    </Text>
                    <Text style={styles.profileStatLbl}>Total Trips</Text>
                  </View>
                  <View style={styles.profileStatBox}>
                    <DollarSign size={20} color="#10b981" />
                    <Text style={styles.profileStatVal}>
                      ₹{selectedProfile ? (settlement.contributions[selectedProfile.uid] || 0).toLocaleString() : 0}
                    </Text>
                    <Text style={styles.profileStatLbl}>Contributed</Text>
                  </View>
                </View>

                {/* Outstanding Standing in current trip */}
                {selectedProfile && (
                  <View style={styles.profileStandingContainer}>
                    <Text style={styles.profileStandingTitle}>Current Trip Standing</Text>
                    {Math.abs(settlement.balances[selectedProfile.uid] || 0) < 0.05 ? (
                      <View style={[styles.statusBadge, styles.statusBadgeSettled, { alignSelf: 'flex-start', marginTop: 4 }]}>
                        <Text style={styles.statusBadgeTextSettled}>Fully Settled</Text>
                      </View>
                    ) : (settlement.balances[selectedProfile.uid] || 0) > 0 ? (
                      <View style={[styles.statusBadgeGets, { alignSelf: 'flex-start', marginTop: 4 }]}>
                        <Text style={styles.statusBadgeTextGets}>
                          Gets back ₹{(settlement.balances[selectedProfile.uid] || 0).toLocaleString()}
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadgeOwes, { alignSelf: 'flex-start', marginTop: 4 }]}>
                        <Text style={styles.statusBadgeTextOwes}>
                          Owes ₹{Math.abs(settlement.balances[selectedProfile.uid] || 0).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
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
    backgroundColor: '#F8FAFC',
    paddingVertical: SPACING.sm,
  },
  tabsScroll: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.round,
    backgroundColor: '#E2E8F0',
  },
  activeTabItem: {
    backgroundColor: COLORS.light.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.light.textSecondary,
  },
  activeTabText: {
    color: '#fff',
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
  membersTrayCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
  },
  membersTrayTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SPACING.sm,
  },
  membersTrayScroll: {
    gap: SPACING.md,
  },
  memberTrayItem: {
    alignItems: 'center',
    width: 60,
  },
  memberTrayAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.light.primary,
  },
  memberTrayName: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  profileModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  profileModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.light.lg,
  },
  profileModalHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
  },
  profileModalCloseBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 28,
    height: 28,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileModalCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileModalAvatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.round,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: SPACING.sm,
  },
  profileModalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  profileModalEmail: {
    fontSize: 12,
    color: '#94a3b8',
  },
  profileModalBody: {
    padding: SPACING.xl,
  },
  profileSection: {
    marginBottom: SPACING.lg,
  },
  profileSectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: COLORS.light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  profileBioText: {
    fontSize: 13,
    color: COLORS.light.text,
    lineHeight: 18,
    backgroundColor: '#f8fafc',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  profileUpiCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  profileUpiCapsuleDisabled: {
    backgroundColor: '#f8fafc',
    opacity: 0.8,
  },
  profileUpiText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  profileUpiTextDisabled: {
    fontSize: 13,
    color: COLORS.light.textMuted,
    fontStyle: 'italic',
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  profileStatBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  profileStatVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginTop: 4,
    marginBottom: 2,
  },
  profileStatLbl: {
    fontSize: 10,
    color: COLORS.light.textSecondary,
  },
  profileStandingContainer: {
    backgroundColor: '#f8fafc',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  profileStandingTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.light.textSecondary,
    marginBottom: 2,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timelineSubtitle: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  timelineHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  timelineHeaderBadgeText: {
    fontSize: 10,
    color: COLORS.light.primary,
    fontWeight: 'bold',
  },
  dayGroupContainer: {
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.lg,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dayGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#f8fafc',
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  calendarIconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  daySubText: {
    fontSize: 10,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dayAmtContainer: {
    alignItems: 'flex-end',
  },
  dayGroupTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  dayUserPaid: {
    fontSize: 10,
    color: COLORS.light.success,
    marginTop: 2,
  },
  timelineBody: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
    backgroundColor: '#fff',
    paddingBottom: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    minHeight: 50,
  },
  timelineTimeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    justifyContent: 'flex-end',
    paddingRight: SPACING.xs,
  },
  timelineTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.light.textSecondary,
  },
  timelineLineContainer: {
    alignItems: 'center',
    width: 24,
  },
  timelineNode: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.round,
    backgroundColor: '#e2e8f0',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginTop: 6,
  },
  timelineNodeActive: {
    backgroundColor: COLORS.light.primary,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 4,
    marginBottom: -16,
  },
  timelineContentCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    marginLeft: 4,
  },
  timelineContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.light.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  timelineItemAmt: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  timelineContentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timelineItemMeta: {
    fontSize: 10,
    color: COLORS.light.textSecondary,
  },
  timelineMyPaid: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.light.success,
  },
  decisionInsightBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    marginTop: SPACING.sm,
  },
  decisionInsightTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  decisionInsightText: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
