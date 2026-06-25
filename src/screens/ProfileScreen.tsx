import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { LogOut, RefreshCw, User, ShieldAlert, Award, TrendingUp, Edit3, CreditCard, Check } from 'lucide-react-native';
import { USE_FIREBASE, app } from '../firebase/config';
import * as ImagePicker from 'expo-image-picker';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
];

// Helper function to reliably convert file URIs to Blobs on React Native
const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  return await response.blob();
};

export default function ProfileScreen() {
  const { user, usersList, switchUser, logout, updateProfile } = useAuthStore();
  const { trips } = useTripStore();
  const { expenses } = useExpenseStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [editUpiId, setEditUpiId] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  if (!user) return null;

  // Calculate statistics with safe guards against undefined arrays/objects
  const userTrips = trips.filter(t => t.members && t.members.includes(user.uid));
  const activeTripsCount = userTrips.filter(t => t.status === 'active').length;
  
  // Sum user contributions safely in all approved expenses
  let totalContributed = 0;
  expenses.forEach((exp) => {
    if (exp.status === 'approved' && exp.paidBy && exp.paidBy[user.uid]) {
      totalContributed += exp.paidBy[user.uid];
    }
  });

  const handleSwitchUser = (uid: string, name: string) => {
    switchUser(uid);
    Alert.alert('Profile Switched', `Logged in as ${name}`);
  };

  const handleOpenEdit = () => {
    setEditName(user.name);
    setEditPhotoURL(user.photoURL);
    setEditUpiId(user.upiId || '');
    setEditBio(user.bio || '');
    setEditModalVisible(true);
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need photo library access to change your profile picture!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const localUri = result.assets[0].uri;
        const base64Str = result.assets[0].base64;
        const imageType = localUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        const webSafeUri = base64Str ? `data:${imageType};base64,${base64Str}` : localUri;
        
        if (USE_FIREBASE && app) {
          setImageUploading(true);
          try {
            // Dynamically load firebase/storage to prevent import conflicts
            const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
            const storage = getStorage(app);
            
            const blob = await uriToBlob(localUri);
            const fileRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
            await uploadBytes(fileRef, blob);
            
            const downloadURL = await getDownloadURL(fileRef);
            setEditPhotoURL(downloadURL);
          } catch (uploadErr: any) {
            console.warn('Firebase Storage upload failed, using web-safe base64 URI:', uploadErr);
            setEditPhotoURL(webSafeUri);
            Alert.alert(
              'Upload Success',
              'Profile picture saved using backup cloud-compatible format. All members will be able to see it!'
            );
          } finally {
            setImageUploading(false);
          }
        } else {
          setEditPhotoURL(webSafeUri);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to pick image: ' + err.message);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    if (editUpiId.trim()) {
      const upiPattern = /^[\w.\-_]+@[\w\-]+$/;
      if (!upiPattern.test(editUpiId.trim())) {
        Alert.alert('Validation Error', 'Please enter a valid UPI ID (e.g. username@upi or name@okaxis).');
        return;
      }
    }

    setSaving(true);
    try {
      await updateProfile(
        editName.trim(), 
        editPhotoURL.trim(), 
        editUpiId.trim() || undefined, 
        editBio.trim() || undefined
      );
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            <TouchableOpacity style={styles.avatarEditOverlay} onPress={handleOpenEdit}>
              <Edit3 size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          {user.bio ? (
            <Text style={styles.bioText} numberOfLines={2}>"{user.bio}"</Text>
          ) : (
            <Text style={styles.noBioText}>No bio set yet</Text>
          )}

          <View style={styles.upiBadge}>
            <CreditCard size={12} color={COLORS.light.textSecondary} />
            <Text style={styles.upiText} numberOfLines={1}>
              {user.upiId || 'No UPI ID configured'}
            </Text>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={handleOpenEdit}>
            <Edit3 size={14} color={COLORS.light.primary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>

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

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Edit Profile Settings</Text>

              {/* Preview Selected Avatar & Gallery Trigger */}
              <View style={styles.avatarPreviewContainer}>
                <TouchableOpacity style={styles.previewAvatarWrapper} onPress={handlePickImage} disabled={imageUploading}>
                  <Image source={{ uri: editPhotoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' }} style={styles.previewAvatar} />
                  {imageUploading ? (
                    <View style={styles.previewAvatarOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  ) : (
                    <View style={styles.previewAvatarOverlay}>
                      <Edit3 size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.galleryBtn} onPress={handlePickImage} disabled={imageUploading}>
                  <Text style={styles.galleryBtnText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>

              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              {/* Bio Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Short Bio</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  placeholder="Tell others something about you..."
                  value={editBio}
                  onChangeText={setEditBio}
                  multiline={true}
                  numberOfLines={2}
                  maxLength={80}
                />
              </View>

              {/* UPI ID Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>UPI ID (for payments from friends)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. gautam@okaxis"
                  value={editUpiId}
                  onChangeText={setEditUpiId}
                  autoCapitalize="none"
                />
              </View>

              {/* Preset Avatars Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Choose from beautiful presets:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetScroll}
                >
                  {PRESET_AVATARS.map((url, i) => {
                    const isSelected = editPhotoURL === url;
                    return (
                      <TouchableOpacity 
                        key={i} 
                        style={[styles.presetItem, isSelected && styles.selectedPresetItem]}
                        onPress={() => setEditPhotoURL(url)}
                      >
                        <Image source={{ uri: url }} style={styles.presetImg} />
                        {isSelected && (
                          <View style={styles.checkmarkBadge}>
                            <Check size={8} color="#fff" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Custom Image URL Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Or paste custom Profile Image URL</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://example.com/photo.jpg"
                  value={editPhotoURL}
                  onChangeText={setEditPhotoURL}
                  autoCapitalize="none"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setEditModalVisible(false)}
                  disabled={saving || imageUploading}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSaveProfile}
                  disabled={saving || imageUploading}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Profile</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.round,
    borderWidth: 3,
    borderColor: COLORS.light.primary,
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.light.primary,
    borderRadius: RADIUS.round,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    ...SHADOWS.light.sm,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  email: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  bioText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  noBioText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.light.textMuted,
    marginTop: SPACING.sm,
  },
  upiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginTop: SPACING.md,
    maxWidth: '90%',
  },
  upiText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    fontWeight: '500',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.light.primary,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    marginTop: SPACING.lg,
  },
  editBtnText: {
    fontSize: 12,
    color: COLORS.light.primary,
    fontWeight: 'bold',
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '85%',
    padding: SPACING.xl,
    ...SHADOWS.light.lg,
  },
  modalScroll: {
    paddingBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  avatarPreviewContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  previewAvatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.light.primary,
  },
  previewAvatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryBtn: {
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginTop: 6,
  },
  galleryBtnText: {
    fontSize: 11,
    color: COLORS.light.primary,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.light.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.light.text,
    backgroundColor: COLORS.light.background,
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: 60,
  },
  presetScroll: {
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  presetItem: {
    position: 'relative',
    borderRadius: RADIUS.round,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPresetItem: {
    borderColor: COLORS.light.primary,
  },
  presetImg: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.light.primary,
    borderRadius: RADIUS.round,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  modalBtn: {
    flex: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.light.background,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  cancelBtnText: {
    color: COLORS.light.textSecondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: COLORS.light.primary,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
