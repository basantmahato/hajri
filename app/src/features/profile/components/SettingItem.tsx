import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../../core/theme';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onToggleSwitch?: (val: boolean) => void;
  onPress?: () => void;
  isDestructive?: boolean;
}

export function SettingItem({
  icon,
  title,
  subtitle,
  isSwitch = false,
  switchValue = false,
  onToggleSwitch,
  onPress,
  isDestructive = false,
}: SettingItemProps) {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={isSwitch}
      style={({ pressed }) => [
        styles.row,
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceBorder,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: isDestructive ? colors.dangerLight : colors.surfaceSubtle,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={isDestructive ? colors.danger : colors.text}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.title,
            {
              color: isDestructive ? colors.danger : colors.text,
              fontSize: typography.sizes.md,
              fontWeight: typography.weights.medium,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: colors.textMuted, fontSize: typography.sizes.xs },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onToggleSwitch}
          trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {},
  subtitle: {
    marginTop: 2,
  },
});
