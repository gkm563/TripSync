import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { useNotificationStore } from '../store/notificationStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { ChevronLeft, User } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const expenseSchema = zod.object({
  title: zod.string().min(3, 'Title must be at least 3 characters'),
  amount: zod.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  category: zod.enum(['Food', 'Travel', 'Hotel', 'Shopping', 'Other']),
  date: zod.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  time: zod.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format'),
  notes: zod.string().optional(),
});

type ExpenseFormData = zod.infer<typeof expenseSchema>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditExpense'>;
type RouteProps = RouteProp<RootStackParamList, 'EditExpense'>;

export default function EditExpenseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { tripId, expenseId } = route.params;

  const { user, usersList } = useAuthStore();
  const { trips } = useTripStore();
  const { expenses, editExpense } = useExpenseStore();
  const { addNotification } = useNotificationStore();

  const trip = trips.find(t => t.id === tripId);
  const expense = expenses.find(e => e.id === expenseId);
  const activeMembers = usersList.filter(u => trip?.members.includes(u.uid));

  const [payerMode, setPayerMode] = useState<'single' | 'multiple'>('single');
  const [singlePayerId, setSinglePayerId] = useState('');
  const [multiplePayers, setMultiplePayers] = useState<Record<string, string>>({});

  // Custom Split Participants
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState('');

  // Date and Time Presets
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'custom'>('custom');
  const [timePreset, setTimePreset] = useState<'now' | '15m' | '30m' | '1h' | 'custom'>('custom');

  const toggleParticipant = (uid: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(uid)
        ? prev.filter((id) => id !== uid)
        : [...prev, uid]
    );
  };

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  const watchAmount = watch('amount');

  const handleDatePresetChange = (preset: 'today' | 'yesterday' | 'custom') => {
    setDatePreset(preset);
    if (preset === 'today') {
      setValue('date', new Date().toISOString().split('T')[0]);
    } else if (preset === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setValue('date', yesterday.toISOString().split('T')[0]);
    }
  };

  const handleTimePresetChange = (preset: 'now' | '15m' | '30m' | '1h' | 'custom') => {
    setTimePreset(preset);
    let timeVal = '';
    const now = new Date();
    if (preset === 'now') {
      timeVal = now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
    } else if (preset === '15m') {
      const t = new Date(now.getTime() - 15 * 60 * 1000);
      timeVal = t.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
    } else if (preset === '30m') {
      const t = new Date(now.getTime() - 30 * 60 * 1000);
      timeVal = t.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
    } else if (preset === '1h') {
      const t = new Date(now.getTime() - 60 * 60 * 1000);
      timeVal = t.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
    }
    if (preset !== 'custom') {
      setValue('time', timeVal);
    }
  };

  const handleSplitEqually = () => {
    const total = parseFloat(watchAmount || '0');
    if (isNaN(total) || total <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid total amount first.');
      return;
    }
    const splitAmt = (total / activeMembers.length).toFixed(2);
    const equalRecord: Record<string, string> = {};
    activeMembers.forEach((m) => {
      equalRecord[m.uid] = splitAmt;
    });
    setMultiplePayers(equalRecord);
  };

  // Load initial data
  useEffect(() => {
    if (expense) {
      setValue('title', expense.title);
      setValue('amount', expense.amount.toString());
      setValue('category', expense.category);
      setValue('date', expense.date);
      setValue('time', expense.time);
      setValue('notes', expense.notes || '');

      // Determine payer mode
      const payers = Object.entries(expense.paidBy).filter(([_, val]) => val > 0);
      if (payers.length === 1) {
        setPayerMode('single');
        setSinglePayerId(payers[0][0]);
      } else {
        setPayerMode('multiple');
        const multipleRecord: Record<string, string> = {};
        payers.forEach(([uid, val]) => {
          multipleRecord[uid] = val.toString();
        });
        setMultiplePayers(multipleRecord);
      }

      // Initialize participants split selection
      if (expense.participants && expense.participants.length > 0) {
        setSelectedParticipants(expense.participants);
      } else if (trip) {
        setSelectedParticipants(trip.members);
      }
    }
  }, [expenseId, expense, trip]);

  if (!trip || !expense) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Expense or Trip not found.</Text>
      </SafeAreaView>
    );
  }

  const handleMultiplePayerChange = (uid: string, text: string) => {
    setMultiplePayers(prev => ({
      ...prev,
      [uid]: text
    }));
  };

  const onSubmit = async (data: ExpenseFormData) => {
    if (!user) return;

    // Calculate Payer Record
    const totalAmount = parseFloat(data.amount);
    let paidBy: Record<string, number> = {};

    if (payerMode === 'single') {
      paidBy[singlePayerId] = totalAmount;
    } else {
      let calculatedSum = 0;
      activeMembers.forEach((m) => {
        const amt = parseFloat(multiplePayers[m.uid] || '0');
        if (amt > 0) {
          paidBy[m.uid] = amt;
          calculatedSum += amt;
        }
      });

      if (Math.abs(calculatedSum - totalAmount) > 0.01) {
        Alert.alert(
          'Payer Total Mismatch', 
          `The sum of member contributions (₹${calculatedSum}) does not equal the total expense amount (₹${totalAmount}).`
        );
        return;
      }
    }

    if (selectedParticipants.length === 0) {
      Alert.alert('Validation Error', 'You must select at least one participant to split this expense with.');
      return;
    }

    try {
      await editExpense(
        expenseId,
        data.title,
        totalAmount,
        data.category,
        paidBy,
        user.uid,
        user.name,
        data.date,
        data.time,
        data.notes || '',
        trip.members.length,
        selectedParticipants
      );

      // Notify other members of edit and restarted approval cycle
      const otherMembers = trip.members.filter(uid => uid !== user.uid);
      otherMembers.forEach(async (memberId) => {
        await addNotification(
          memberId,
          'Expense Edited (Approval Reset)',
          `${user.name} edited "${data.title}". Status was reset to pending review.`,
          'expense_created',
          tripId,
          expenseId
        );
      });

      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to edit expense');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={COLORS.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Expense (v{expense.version})</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expense Name / Title</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.errorInput]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g. Train Ticket, Hotel Dinner"
                    placeholderTextColor={COLORS.light.textMuted}
                  />
                )}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

              {/* Suggestions chips */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.suggestionsList}
                style={styles.suggestionsScroll}
              >
                {[
                  { emoji: '🍕', label: 'Dinner', category: 'Food' },
                  { emoji: '🍔', label: 'Lunch', category: 'Food' },
                  { emoji: '☕', label: 'Coffee', category: 'Food' },
                  { emoji: '🚕', label: 'Uber/Cab', category: 'Travel' },
                  { emoji: '⛽', label: 'Fuel', category: 'Travel' },
                  { emoji: '🏨', label: 'Hotel Stay', category: 'Hotel' },
                  { emoji: '🛖', label: 'Airbnb', category: 'Hotel' },
                  { emoji: '🛒', label: 'Groceries', category: 'Shopping' },
                  { emoji: '🍿', label: 'Cinema', category: 'Other' },
                  { emoji: '🎟️', label: 'Tickets', category: 'Other' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.suggestionChip}
                    onPress={() => {
                      setValue('title', item.label);
                      setValue('category', item.category as any);
                    }}
                  >
                    <Text style={styles.suggestionChipText}>{item.emoji} {item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Amount & Category */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Total Amount (₹)</Text>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.amount && styles.errorInput]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="numeric"
                      placeholder="e.g. 1500"
                      placeholderTextColor={COLORS.light.textMuted}
                    />
                  )}
                />
                {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
              </View>

              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={styles.label}>Category</Text>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.categoryPickerRow}>
                      {['Food', 'Travel', 'Hotel', 'Shopping', 'Other'].slice(0, 3).map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.pickerTag, value === cat && styles.pickerTagActive]}
                          onPress={() => onChange(cat)}
                        >
                          <Text style={[styles.pickerTagText, value === cat && styles.pickerTagTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[styles.pickerTag, (value === 'Shopping' || value === 'Other') && styles.pickerTagActive]}
                        onPress={() => onChange(value === 'Shopping' ? 'Other' : 'Shopping')}
                      >
                        <Text style={[styles.pickerTagText, (value === 'Shopping' || value === 'Other') && styles.pickerTagTextActive]}>
                          {value === 'Shopping' ? 'Shop' : value === 'Other' ? 'Other' : 'More'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            </View>

            {/* Payer Configuration */}
            <View style={styles.payerHeader}>
              <View>
                <Text style={styles.label}>Paid By</Text>
                {payerMode === 'multiple' && (
                  <TouchableOpacity style={styles.splitEquallyBtn} onPress={handleSplitEqually}>
                    <Text style={styles.splitEquallyText}>⚡ Auto split equally</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.payerModeToggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, payerMode === 'single' && styles.toggleBtnActive]}
                  onPress={() => setPayerMode('single')}
                >
                  <Text style={[styles.toggleBtnText, payerMode === 'single' && styles.toggleBtnTextActive]}>Single</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, payerMode === 'multiple' && styles.toggleBtnActive]}
                  onPress={() => setPayerMode('multiple')}
                >
                  <Text style={[styles.toggleBtnText, payerMode === 'multiple' && styles.toggleBtnTextActive]}>Multiple</Text>
                </TouchableOpacity>
              </View>
            </View>

            {payerMode === 'single' ? (
              <View style={styles.singlePayerBox}>
                <Text style={styles.descriptionLabel}>Select Who Paid:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.payerList}>
                  {activeMembers.map((member) => (
                    <TouchableOpacity
                      key={member.uid}
                      style={[
                        styles.payerCard, 
                        singlePayerId === member.uid && styles.payerCardActive
                      ]}
                      onPress={() => setSinglePayerId(member.uid)}
                    >
                      <User size={18} color={singlePayerId === member.uid ? '#fff' : COLORS.light.textSecondary} />
                      <Text style={[styles.payerCardText, singlePayerId === member.uid && styles.payerCardTextActive]}>
                        {member.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.multiplePayerBox}>
                <Text style={styles.descriptionLabel}>Enter Contribution for each member (Total sum must be ₹{watchAmount || '0'}):</Text>
                {activeMembers.map((member) => (
                  <View key={member.uid} style={styles.multiplePayerRow}>
                    <Text style={styles.memberNameLabel}>{member.name}</Text>
                    <TextInput
                      style={styles.multiplePayerInput}
                      placeholder="₹0"
                      keyboardType="numeric"
                      value={multiplePayers[member.uid] || ''}
                      onChangeText={(txt) => handleMultiplePayerChange(member.uid, txt)}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Split Participants (Custom Split Selection) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Split Participants (By default, splits with everyone)</Text>
              
              {activeMembers.length > 4 && (
                <TextInput
                  style={styles.searchInput}
                  placeholder="🔍 Search members..."
                  placeholderTextColor={COLORS.light.textMuted}
                  value={participantSearch}
                  onChangeText={setParticipantSearch}
                />
              )}

              <View style={styles.participantsContainer}>
                {activeMembers
                  .filter(m => m.name.toLowerCase().includes(participantSearch.toLowerCase()))
                  .map((member) => {
                    const isSelected = selectedParticipants.includes(member.uid);
                    return (
                      <TouchableOpacity
                        key={member.uid}
                        style={[
                          styles.participantTag,
                          isSelected && styles.participantTagActive
                        ]}
                        onPress={() => toggleParticipant(member.uid)}
                      >
                        <View style={styles.participantTagContent}>
                          <User size={14} color={isSelected ? '#fff' : COLORS.light.textSecondary} />
                          <Text style={[
                            styles.participantTagText,
                            isSelected && styles.participantTagTextActive
                          ]}>
                            {member.name}
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={styles.participantCheck}>
                            <Text style={styles.participantCheckText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </View>
              {selectedParticipants.length === 0 && (
                <Text style={styles.errorText}>* You must select at least one member to split the expense.</Text>
              )}
            </View>

            {/* Date Preset Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <View style={styles.presetToggleRow}>
                <TouchableOpacity
                  style={[styles.presetToggleBtn, datePreset === 'today' && styles.presetToggleBtnActive]}
                  onPress={() => handleDatePresetChange('today')}
                >
                  <Text style={[styles.presetToggleText, datePreset === 'today' && styles.presetToggleTextActive]}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.presetToggleBtn, datePreset === 'yesterday' && styles.presetToggleBtnActive]}
                  onPress={() => handleDatePresetChange('yesterday')}
                >
                  <Text style={[styles.presetToggleText, datePreset === 'yesterday' && styles.presetToggleTextActive]}>Yesterday</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.presetToggleBtn, datePreset === 'custom' && styles.presetToggleBtnActive]}
                  onPress={() => handleDatePresetChange('custom')}
                >
                  <Text style={[styles.presetToggleText, datePreset === 'custom' && styles.presetToggleTextActive]}>Custom</Text>
                </TouchableOpacity>
              </View>

              {datePreset === 'custom' && (
                <Controller
                  control={control}
                  name="date"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, styles.customInputMargin, errors.date && styles.errorInput]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={COLORS.light.textMuted}
                    />
                  )}
                />
              )}
              {errors.date && datePreset === 'custom' && <Text style={styles.errorText}>{errors.date.message}</Text>}
            </View>

            {/* Time Preset Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time</Text>
              <View style={styles.presetToggleRow}>
                <TouchableOpacity
                  style={[styles.presetToggleBtn, timePreset === 'now' && styles.presetToggleBtnActive]}
                  onPress={() => handleTimePresetChange('now')}
                >
                  <Text style={[styles.presetToggleText, timePreset === 'now' && styles.presetToggleTextActive]}>Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.presetToggleBtn, timePreset === '15m' && styles.presetToggleBtnActive]}
                  onPress={() => handleTimePresetChange('15m')}
                >
                  <Text style={[styles.presetToggleText, timePreset === '15m' && styles.presetToggleTextActive]}>15m ago</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.presetToggleBtn, timePreset === '30m' && styles.presetToggleBtnActive]}
                  onPress={() => handleTimePresetChange('30m')}
                >
                  <Text style={[styles.presetToggleText, timePreset === '30m' && styles.presetToggleTextActive]}>30m ago</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.presetToggleBtn, timePreset === '1h' && styles.presetToggleBtnActive]}
                  onPress={() => handleTimePresetChange('1h')}
                >
                  <Text style={[styles.presetToggleText, timePreset === '1h' && styles.presetToggleTextActive]}>1h ago</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.presetToggleBtn, timePreset === 'custom' && styles.presetToggleBtnActive]}
                  onPress={() => handleTimePresetChange('custom')}
                >
                  <Text style={[styles.presetToggleText, timePreset === 'custom' && styles.presetToggleTextActive]}>Custom</Text>
                </TouchableOpacity>
              </View>

              {timePreset === 'custom' && (
                <Controller
                  control={control}
                  name="time"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, styles.customInputMargin, errors.time && styles.errorInput]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="HH:mm"
                      placeholderTextColor={COLORS.light.textMuted}
                    />
                  )}
                />
              )}
              {errors.time && timePreset === 'custom' && <Text style={styles.errorText}>{errors.time.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.submitBtnText}>Save Changes</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  keyboardView: {
    flex: 1,
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
  backButton: {
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
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.light.md,
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.light.text,
    backgroundColor: COLORS.light.background,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  errorInput: {
    borderColor: COLORS.light.error,
  },
  errorText: {
    color: COLORS.light.error,
    fontSize: 12,
    marginTop: 4,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pickerTag: {
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: RADIUS.xs,
  },
  pickerTagActive: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  pickerTagText: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    fontWeight: '500',
  },
  pickerTagTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  payerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  payerModeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.light.background,
    borderRadius: RADIUS.xs,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  toggleBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.light.primary,
  },
  toggleBtnText: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
  },
  toggleBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  singlePayerBox: {
    backgroundColor: COLORS.light.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  descriptionLabel: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.sm,
  },
  payerList: {
    gap: SPACING.xs,
  },
  payerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 4,
  },
  payerCardActive: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  payerCardText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
  },
  payerCardTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  multiplePayerBox: {
    backgroundColor: COLORS.light.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  multiplePayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  memberNameLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.light.text,
  },
  multiplePayerInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.xs,
    width: 100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    textAlign: 'right',
    fontSize: 13,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: COLORS.light.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.light.md,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: 13,
    backgroundColor: '#fff',
    marginBottom: SPACING.sm,
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    backgroundColor: COLORS.light.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  participantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    gap: 4,
  },
  participantTagActive: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  participantTagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantTagText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
  },
  participantTagTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  participantCheck: {
    marginLeft: 2,
  },
  participantCheckText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  suggestionsScroll: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  suggestionsList: {
    gap: SPACING.xs,
    paddingVertical: 2,
  },
  suggestionChip: {
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
  },
  suggestionChipText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
  },
  splitEquallyBtn: {
    marginTop: 2,
  },
  splitEquallyText: {
    fontSize: 12,
    color: COLORS.light.primary,
    fontWeight: '600',
  },
  presetToggleRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  presetToggleBtn: {
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    flex: 1,
    alignItems: 'center',
  },
  presetToggleBtnActive: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  presetToggleText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    fontWeight: '500',
  },
  presetToggleTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  customInputMargin: {
    marginTop: SPACING.xs,
  },
});
