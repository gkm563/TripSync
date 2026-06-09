import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  StatusBar
} from 'react-native';
import { useNotificationStore } from '../store/notificationStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Bell, ShieldAlert, Award, Compass, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function NotificationBanner() {
  const { activeBanner, hideBanner } = useNotificationStore();
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (activeBanner) {
      // Slide down
      Animated.spring(slideAnim, {
        toValue: Platform.OS === 'ios' ? 60 : 40,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();

      // Auto hide after 4 seconds
      const timer = setTimeout(() => {
        dismissBanner();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [activeBanner]);

  const dismissBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      hideBanner();
    });
  };

  if (!activeBanner) return null;

  const getIcon = () => {
    switch (activeBanner.type) {
      case 'expense_created':
        return <Compass size={18} color={COLORS.light.primary} />;
      case 'expense_approved':
        return <Award size={18} color={COLORS.light.success} />;
      case 'expense_rejected':
        return <ShieldAlert size={18} color={COLORS.light.error} />;
      default:
        return <Bell size={18} color={COLORS.light.secondary} />;
    }
  };

  const getBannerBorderColor = () => {
    switch (activeBanner.type) {
      case 'expense_created':
        return COLORS.light.primary;
      case 'expense_approved':
        return COLORS.light.success;
      case 'expense_rejected':
        return COLORS.light.error;
      default:
        return COLORS.light.border;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.bannerContainer, 
        { 
          transform: [{ translateY: slideAnim }],
          borderLeftColor: getBannerBorderColor()
        }
      ]}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{activeBanner.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{activeBanner.body}</Text>
      </View>
      <TouchableOpacity style={styles.closeBtn} onPress={dismissBanner}>
        <X size={16} color={COLORS.light.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    zIndex: 9999,
    ...SHADOWS.light.lg,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  body: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  closeBtn: {
    padding: 4,
  },
});
