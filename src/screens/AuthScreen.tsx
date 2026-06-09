import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import { USE_FIREBASE } from '../firebase/config';

export default function AuthScreen() {
  const { login, registerUser, usersList, error, loading } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    Alert.prompt(
      'Google Sign In',
      'Please enter your Google Email address:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign In',
          onPress: async (googleEmail) => {
            if (!googleEmail || !googleEmail.includes('@')) {
              Alert.alert('Error', 'Please enter a valid Google email address.');
              return;
            }
            try {
              await login(googleEmail);
            } catch (e: any) {
              Alert.alert('Sign In Failed', e.message || 'Failed to sign in with Google');
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!email) {
      setValidationError('Email is required');
      return;
    }
    if (isRegister && !name) {
      setValidationError('Name is required');
      return;
    }
    setValidationError(null);

    try {
      if (isRegister) {
        await registerUser(name, email);
      } else {
        await login(email);
      }
    } catch (e: any) {
      // Errors handled by store
    }
  };

  const handleQuickLogin = async (mockEmail: string) => {
    setValidationError(null);
    await login(mockEmail);
  };

  return (
    <LinearGradient
      colors={COLORS.dark.primaryGradient as any}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>TS</Text>
            </View>
            <Text style={styles.appName}>TripSync</Text>
            <Text style={styles.appTagline}>Accurate Group Contribution Tracker</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isRegister ? 'Sign up to track group expenses' : 'Sign in to sync your trips'}
            </Text>

            {(error || validationError) && (
              <View style={styles.errorContainer}>
                <AlertCircle size={18} color={COLORS.light.error} />
                <Text style={styles.errorText}>{validationError || error}</Text>
              </View>
            )}

            {isRegister && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Gautam"
                  placeholderTextColor={COLORS.light.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. gautam@tripsync.com"
                placeholderTextColor={COLORS.light.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {isRegister ? 'Create Account' : 'Sign In'}
                  </Text>
                  {isRegister ? <UserPlus size={18} color="#fff" /> : <LogIn size={18} color="#fff" />}
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.toggleTextContainer}
              onPress={() => {
                setIsRegister(!isRegister);
                setValidationError(null);
              }}
            >
              <Text style={styles.toggleText}>
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Mock Login Profiles */}
          {!USE_FIREBASE && (
            <View style={styles.mockSection}>
              <Text style={styles.mockHeaderTitle}>Simulator Quick Login</Text>
              <Text style={styles.mockHeaderSub}>Tap a profile to log in instantly on this simulator</Text>
              
              <View style={styles.mockProfilesContainer}>
                {usersList.slice(0, 3).map((user) => (
                  <TouchableOpacity
                    key={user.uid}
                    style={styles.mockProfileCard}
                    onPress={() => handleQuickLogin(user.email)}
                  >
                    <Image source={{ uri: user.photoURL }} style={styles.mockAvatar} />
                    <Text style={styles.mockName}>{user.name}</Text>
                    <Text style={styles.mockRole}>
                      {user.uid === 'gautam_uid' ? 'Creator' : user.uid === 'rohit_uid' ? 'Reviewer' : 'Payer'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {USE_FIREBASE && (
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png' }} 
                style={styles.googleIcon} 
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.dark.md,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.light.primary,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.light.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.h2.fontSize,
    fontWeight: TYPOGRAPHY.h2.fontWeight,
    color: COLORS.light.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  errorText: {
    fontSize: 13,
    color: COLORS.light.error,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
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
  submitButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.light.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.light.md,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleTextContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  toggleText: {
    color: COLORS.light.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  mockSection: {
    marginTop: SPACING.xxl,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mockHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  mockHeaderSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  mockProfilesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  mockProfileCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.light.sm,
  },
  mockAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.xs,
  },
  mockName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  mockRole: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.light.sm,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
