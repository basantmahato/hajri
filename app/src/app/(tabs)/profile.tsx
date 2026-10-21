import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer, Card, Avatar } from '../../core/ui';
import { useAppTheme } from '../../core/theme';
import { useAuthStore } from '../../features/auth/auth.store';
import { useHajriStore } from '../../features/hajri/hajri.store';
import { SettingItem } from '../../features/profile/components/SettingItem';

export default function ProfileScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const { user, logout } = useAuthStore();
  const { activeOrg, organizations } = useHajriStore();

  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);

  const handleLogout = async () => {
    const proceed = async () => {
      await logout();
      router.replace('/(auth)/login' as any);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out of Hajri?')) {
        await proceed();
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out of Hajri?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: proceed },
      ]);
    }
  };

  return (
    <ScreenContainer safeTop safeBottom contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Title */}
      <View style={[styles.header, { marginTop: spacing.md, marginBottom: spacing.md }]}>
        <Text
          style={[
            styles.screenTitle,
            { color: colors.text, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
          ]}
        >
          Manager Account
        </Text>
      </View>

      {/* Account Info Card */}
      <Card variant="elevated" style={[styles.accountCard, { padding: spacing.lg, marginBottom: spacing.md }]}>
        <View style={styles.userRow}>
          <Avatar name={user?.name || 'User'} size={60} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold,
              }}
            >
              {user?.name || 'User'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 1 }}>
              {user?.email || ''}
            </Text>
            <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  backgroundColor: colors.primaryLight,
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>
                  BUSINESS OWNER
                </Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs }}>
                {organizations.length} Groups
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Current Active Group Card */}
      <Card variant="subtle" style={[styles.activeOrgCard, { padding: spacing.md, marginBottom: spacing.md }]}>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.sizes.xs,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          CURRENT ACTIVE SITE
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.bold,
            marginTop: 2,
          }}
        >
          {activeOrg?.name || 'No group selected'}
        </Text>
        {activeOrg && (
          <Text style={{ color: colors.primary, fontSize: typography.sizes.xs, fontWeight: '600', marginTop: 2 }}>
            Category: {activeOrg.type} {activeOrg.city ? `• ${activeOrg.city}` : ''}
          </Text>
        )}
      </Card>

      {/* Preferences */}
      <Card variant="elevated" style={[styles.settingsCard, { padding: spacing.md, marginBottom: spacing.md }]}>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.sizes.xs,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: spacing.xs,
          }}
        >
          ATTENDANCE NOTIFICATIONS
        </Text>

        <SettingItem
          icon="time-outline"
          title="Daily Hajri Reminder"
          subtitle="Alert at 6:00 PM to record today's attendance"
          isSwitch
          switchValue={dailyReminder}
          onToggleSwitch={setDailyReminder}
        />

        <SettingItem
          icon="notifications-outline"
          title="Wage Summary Alerts"
          subtitle="Monthly notification when payout calculations are ready"
          isSwitch
          switchValue={notifications}
          onToggleSwitch={setNotifications}
        />
      </Card>

      {/* Sign Out Card */}
      <Card variant="elevated" style={[styles.settingsCard, { padding: spacing.md, marginBottom: spacing.lg }]}>
        <SettingItem
          icon="log-out-outline"
          title="Sign Out"
          subtitle="Log out of Hajri on this device"
          isDestructive
          onPress={handleLogout}
        />
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs }}>
          Hajri Workforce &amp; Wages v1.0.0
        </Text>
        <Text style={{ color: colors.textSubtle, fontSize: typography.sizes.xs, marginTop: 2 }}>
          Connected with Hajri Express &amp; Next.js Backend
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
  },
  screenTitle: {
    letterSpacing: -0.3,
  },
  accountCard: {},
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeOrgCard: {},
  settingsCard: {},
  footer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});
