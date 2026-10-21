import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../theme';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  enableHaptic?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  enableHaptic = true,
}: ButtonProps) {
  const { colors, radius, spacing, typography } = useAppTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    if (enableHaptic && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; loaderColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.textInverse },
          loaderColor: colors.textInverse,
        };
      case 'accent':
        return {
          container: { backgroundColor: colors.accent },
          text: { color: '#FFFFFF' },
          loaderColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          container: { backgroundColor: colors.surfaceSubtle },
          text: { color: colors.text },
          loaderColor: colors.text,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.surfaceBorder,
          },
          text: { color: colors.text },
          loaderColor: colors.primary,
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.primary },
          loaderColor: colors.primary,
        };
      case 'danger':
        return {
          container: { backgroundColor: colors.danger },
          text: { color: '#FFFFFF' },
          loaderColor: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md, height: 36 },
          text: { fontSize: typography.sizes.sm },
        };
      case 'lg':
        return {
          container: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, height: 54 },
          text: { fontSize: typography.sizes.lg },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, height: 46 },
          text: { fontSize: typography.sizes.md },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { borderRadius: radius.lg },
        variantStyles.container,
        sizeStyles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.loaderColor} size="small" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              styles.textBase,
              variantStyles.text,
              sizeStyles.text,
              { fontWeight: typography.weights.semibold },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
  textBase: {
    textAlign: 'center',
  },
});
