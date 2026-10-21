import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useAppTheme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'subtle';
}

export function Card({
  children,
  style,
  onPress,
  variant = 'elevated',
}: CardProps) {
  const { colors, radius, spacing } = useAppTheme();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
        };
      case 'subtle':
        return {
          backgroundColor: colors.surfaceSubtle,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 2,
        };
    }
  };

  const containerStyles = [
    styles.card,
    {
      borderRadius: radius.xl,
      padding: spacing.lg,
    },
    getVariantStyle(),
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          containerStyles,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
