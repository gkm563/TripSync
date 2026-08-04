import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { Calendar, ChevronLeft, Image as ImageIcon, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';

const tripSchema = zod.object({
  name: zod.string().min(3, 'Trip name must be at least 3 characters'),
  startDate: zod.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  expectedEndDate: zod.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  description: zod.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate).getTime();
  const end = new Date(data.expectedEndDate).getTime();
  return end >= start;
}, {
  message: 'End date cannot be before start date',
  path: ['expectedEndDate'],
});

type TripFormData = zod.infer<typeof tripSchema>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateTrip'>;

export default function CreateTripScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { createTrip, loading, error } = useTripStore();
  const [selectedGradient, setSelectedGradient] = useState('gradient_1');

  const gradients = [
    { id: 'gradient_1', colors: ['#6366F1', '#3B82F6'], label: 'Ocean Indigo' },
    { id: 'gradient_2', colors: ['#14B8A6', '#059669'], label: 'Emerald Mint' },
    { id: 'gradient_3', colors: ['#EC4899', '#BE185D'], label: 'Rose Pink' },
    { id: 'gradient_4', colors: ['#F59E0B', '#D97706'], label: 'Amber Gold' },
  ];

  const [durationPreset, setDurationPreset] = useState<'1' | '2' | '3' | '7' | 'custom'>('7');

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
    }
  });

  const handleDurationPresetChange = (preset: '1' | '2' | '3' | '7' | 'custom') => {
    setDurationPreset(preset);
    if (preset === 'custom') return;

    const startVal = watch('startDate');
    if (!startVal) return;
    const start = new Date(startVal);
    if (isNaN(start.getTime())) return;

    const days = parseInt(preset, 10);
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    setValue('expectedEndDate', end.toISOString().split('T')[0]);
  };

  const onSubmit = async (data: TripFormData) => {
    if (!user) return;
    try {
      await createTrip(
        data.name,
        data.description || '',
        data.startDate,
        data.expectedEndDate,
        selectedGradient,
        user
      );
      navigation.goBack();
    } catch (e) {
      // Handled by store
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={COLORS.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Trip</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Cover Gradient Selector */}
          <Text style={styles.label}>Select Card Theme</Text>
          <View style={styles.gradientSelectorRow}>
            {gradients.map((grad) => (
              <TouchableOpacity
                key={grad.id}
                style={[
                  styles.gradientCard, 
                  selectedGradient === grad.id && styles.selectedGradientCard
                ]}
                onPress={() => setSelectedGradient(grad.id)}
              >
                <LinearGradient
                  colors={grad.colors as [string, string, ...string[]]}
                  style={styles.gradientPreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {selectedGradient === grad.id && (
                    <Sparkles size={16} color="#fff" />
                  )}
                </LinearGradient>
                <Text style={styles.gradientLabel} numberOfLines={1}>{grad.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Trip Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.errorInput]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g. Summer Internship IIT Kanpur"
                    placeholderTextColor={COLORS.light.textMuted}
                  />
                )}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

              {/* Trip Suggestions scroll */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.suggestionsList}
                style={styles.suggestionsScroll}
              >
                {[
                  { emoji: '🏖️', label: 'Goa Getaway' },
                  { emoji: '⛰️', label: 'Manali Trek' },
                  { emoji: '🗼', label: 'Paris Trip' },
                  { emoji: '🍕', label: 'Weekend Outing' },
                  { emoji: '🏢', label: 'Office Party' },
                  { emoji: '🏕️', label: 'Camping Trip' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.suggestionChip}
                    onPress={() => {
                      setValue('name', item.label);
                    }}
                  >
                    <Text style={styles.suggestionChipText}>{item.emoji} {item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.dateRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Start Date</Text>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.dateInputWrapper}>
                      <TextInput
                        style={[styles.input, styles.dateInput, errors.startDate && styles.errorInput]}
                        onBlur={onBlur}
                        onChangeText={(txt) => {
                          onChange(txt);
                          // Re-calculate end date if a preset is active
                          if (durationPreset !== 'custom') {
                            const start = new Date(txt);
                            if (!isNaN(start.getTime())) {
                              const days = parseInt(durationPreset, 10);
                              const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
                              setValue('expectedEndDate', end.toISOString().split('T')[0]);
                            }
                          }
                        }}
                        value={value}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={COLORS.light.textMuted}
                      />
                      <Calendar size={18} color={COLORS.light.textSecondary} style={styles.dateIcon} />
                    </View>
                  )}
                />
                {errors.startDate && <Text style={styles.errorText}>{errors.startDate.message}</Text>}
              </View>

              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={styles.label}>Duration Preset</Text>
                <View style={styles.presetToggleRow}>
                  {[
                    { key: '1', label: '1 Day' },
                    { key: '2', label: 'Wknd' },
                    { key: '3', label: '3 Days' },
                    { key: '7', label: '1 Wk' },
                    { key: 'custom', label: 'Cust' }
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.key}
                      style={[styles.presetToggleBtn, durationPreset === p.key && styles.presetToggleBtnActive]}
                      onPress={() => handleDurationPresetChange(p.key as any)}
                    >
                      <Text style={[styles.presetToggleText, durationPreset === p.key && styles.presetToggleTextActive]}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>End Date</Text>
              <Controller
                control={control}
                name="expectedEndDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.dateInputWrapper}>
                    <TextInput
                      style={[styles.input, styles.dateInput, errors.expectedEndDate && styles.errorInput]}
                      onBlur={onBlur}
                      onChangeText={(txt) => {
                        onChange(txt);
                        setDurationPreset('custom');
                      }}
                      value={value}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={COLORS.light.textMuted}
                      editable={durationPreset === 'custom'}
                    />
                    <Calendar size={18} color={COLORS.light.textSecondary} style={styles.dateIcon} />
                  </View>
                )}
              />
              {errors.expectedEndDate && <Text style={styles.errorText}>{errors.expectedEndDate.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Provide details about the trip destination, goals, and rules."
                    placeholderTextColor={COLORS.light.textMuted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>

            {error && <Text style={[styles.errorText, styles.serverError]}>{error}</Text>}

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Create Trip</Text>
              )}
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
    padding: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  gradientSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
  },
  gradientCard: {
    flex: 1,
    alignItems: 'center',
  },
  selectedGradientCard: {
    transform: [{ scale: 1.05 }],
  },
  gradientPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gradientLabel: {
    fontSize: 10,
    color: COLORS.light.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.light.md,
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.md,
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
  errorInput: {
    borderColor: COLORS.light.error,
  },
  errorText: {
    color: COLORS.light.error,
    fontSize: 12,
    marginTop: 4,
  },
  serverError: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    paddingRight: 36,
  },
  dateIcon: {
    position: 'absolute',
    right: 12,
  },
  textArea: {
    height: 100,
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
  presetToggleRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  presetToggleBtn: {
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    paddingHorizontal: 8,
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
    fontSize: 10,
    color: COLORS.light.textSecondary,
    fontWeight: '500',
  },
  presetToggleTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
