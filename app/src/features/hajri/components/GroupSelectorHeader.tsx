import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '../../../core/theme';
import { useHajriStore } from '../hajri.store';

export function GroupSelectorHeader() {
  const { colors, radius, spacing, typography } = useAppTheme();
  const { activeOrg, organizations } = useHajriStore();

  return (
    <View style={[styles.header, { marginBottom: spacing.md }]}>
      <Pressable
        onPress={() => router.push('/(tabs)/groups' as any)}
        style={({ pressed }) => [
          styles.selectorButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
            borderRadius: radius.xl,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            shadowColor: colors.cardShadow,
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.leftRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primaryLight, borderRadius: radius.full },
            ]}
          >
            <Ionicons name="business" size={18} color={colors.primary} />
          </View>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: typography.sizes.xs,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                fontWeight: '600',
              }}
            >
              ACTIVE GROUP ({organizations.length})
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: colors.text,
                fontSize: typography.sizes.md,
                fontWeight: typography.weights.bold,
              }}
            >
              {activeOrg?.name || 'Create / Select Group'}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
  },
  selectorButton: {
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
