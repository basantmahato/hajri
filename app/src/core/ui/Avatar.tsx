import React from 'react';
import { View, Text, StyleSheet, Image, type ViewStyle } from 'react-native';
import { useAppTheme } from '../theme';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  style?: ViewStyle;
}

export function Avatar({
  name,
  imageUrl,
  size = 44,
  showOnlineStatus = false,
  isOnline = false,
  style,
}: AvatarProps) {
  const { colors, typography } = useAppTheme();

  const getInitials = (fullName: string): string => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <View style={[{ width: size, height: size }, styles.container, style]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.primaryLight,
              borderColor: colors.surfaceBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                color: colors.primary,
                fontSize: size * 0.38,
                fontWeight: typography.weights.bold,
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {showOnlineStatus && (
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: isOnline ? colors.accent : colors.textSubtle,
              borderColor: colors.surface,
              width: Math.max(10, size * 0.28),
              height: Math.max(10, size * 0.28),
              borderRadius: 999,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  initials: {
    letterSpacing: 0.5,
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
  },
});
