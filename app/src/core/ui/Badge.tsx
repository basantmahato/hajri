import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useAppTheme } from '../theme';

export type BadgeStatus =
  | 'present'
  | 'absent'
  | 'half_day'
  | 'leave'
  | 'holiday'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'info';

interface BadgeProps {
  label: string;
  status?: BadgeStatus;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ label, status = 'info', size = 'sm', style }: BadgeProps) {
  const { colors, radius, spacing, typography } = useAppTheme();

  const getStatusColors = (): { bg: string; text: string } => {
    switch (status) {
      case 'present':
      case 'approved':
        return { bg: colors.accentLight, text: colors.accentDark };
      case 'absent':
      case 'rejected':
        return { bg: colors.dangerLight, text: colors.danger };
      case 'half_day':
      case 'pending':
        return { bg: colors.warningLight, text: colors.warning };
      case 'leave':
      case 'holiday':
        return { bg: colors.infoLight, text: colors.info };
      case 'info':
      default:
        return { bg: colors.primaryLight, text: colors.primary };
    }
  };

  const { bg, text } = getStatusColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderRadius: radius.full,
          paddingHorizontal: isSm ? spacing.sm + 2 : spacing.md,
          paddingVertical: isSm ? spacing.xs - 1 : spacing.xs + 2,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: isSm ? typography.sizes.xs : typography.sizes.sm,
            fontWeight: typography.weights.semibold,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
});
