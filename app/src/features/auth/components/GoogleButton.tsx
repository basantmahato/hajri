import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../../core/theme';

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleButton({
  onPress,
  loading = false,
  disabled = false,
}: GoogleButtonProps) {
  const { colors, radius, spacing, typography } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
          borderRadius: radius.lg,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          shadowColor: colors.cardShadow,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {/* Google 'G' icon badge */}
          <View style={styles.iconWrap}>
            <Ionicons name="logo-google" size={18} color="#EA4335" />
          </View>
          <Text
            style={[
              styles.text,
              {
                color: colors.text,
                fontSize: typography.sizes.md,
                fontWeight: typography.weights.semibold,
              },
            ]}
          >
            Continue with Google
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    height: 48,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
