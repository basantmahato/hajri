import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../../core/theme';
import { Badge } from '../../../core/ui';

const { width } = Dimensions.get('window');

export interface SlideData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
}

interface OnboardingSlideProps {
  item: SlideData;
}

export function OnboardingSlide({ item }: OnboardingSlideProps) {
  const { colors, radius, spacing, typography } = useAppTheme();

  return (
    <View style={[styles.slide, { width: Math.min(width - 32, 480) }]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.surfaceBorder,
            borderRadius: radius['2xl'],
            marginBottom: spacing['2xl'],
          },
        ]}
      >
        <View
          style={[
            styles.glowCircle,
            {
              backgroundColor: item.accentColor + '18',
              borderRadius: radius.full,
            },
          ]}
        >
          <Ionicons name={item.icon} size={64} color={item.accentColor} />
        </View>
      </View>

      <Badge label={item.badge} status="info" style={{ marginBottom: spacing.md }} />

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            marginBottom: spacing.sm,
          },
        ]}
      >
        {item.title}
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: colors.textMuted,
            fontSize: typography.sizes.md,
            lineHeight: 24,
          },
        ]}
      >
        {item.subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  glowCircle: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 340,
  },
});
