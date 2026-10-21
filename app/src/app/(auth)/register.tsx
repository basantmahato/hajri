import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer, Button, Input, Card } from '../../core/ui';
import { useAppTheme } from '../../core/theme';
import { useAuthStore } from '../../features/auth/auth.store';
import { GoogleButton } from '../../features/auth/components/GoogleButton';

export default function RegisterScreen() {
  const { colors, radius, spacing, typography } = useAppTheme();
  const { bypassAuth, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    try {
      const emailVal = email.trim() || 'admin@hajri.app';
      const nameVal = name.trim() || 'Dev Manager';
      await bypassAuth({
        name: nameVal,
        email: emailVal,
        phone: phone.trim() || '+91 98765 43210',
      });
      router.replace('/(tabs)' as any);
    } catch {
      router.replace('/(tabs)' as any);
    }
  };

  return (
    <ScreenContainer safeTop safeBottom>
      {/* Back button + Header */}
      <View style={[styles.header, { marginTop: spacing.lg, marginBottom: spacing.xl }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surfaceSubtle,
              borderRadius: radius.md,
            },
          ]}
        >
          <Text style={{ color: colors.text, fontWeight: '600' }}>← Back</Text>
        </Pressable>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              marginTop: spacing.md,
            },
          ]}
        >
          Create Organization Account
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textMuted,
              fontSize: typography.sizes.sm,
              marginTop: spacing.xs,
            },
          ]}
        >
          Start tracking employee attendance and managing shifts in minutes
        </Text>
      </View>

      <Card variant="elevated" style={{ marginBottom: spacing.xl }}>
        {error && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: colors.dangerLight,
                borderRadius: radius.md,
                padding: spacing.sm,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Text
              style={{
                color: colors.danger,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium,
              }}
            >
              {error}
            </Text>
          </View>
        )}

        <Input
          label="Your Full Name"
          placeholder="e.g. Rajesh Sharma"
          value={name}
          onChangeText={setName}
          leftIcon="person-outline"
        />

        <Input
          label="Business / Team Name"
          placeholder="e.g. City Civil Site, Main Branch"
          value={organizationName}
          onChangeText={setOrganizationName}
          leftIcon="business-outline"
        />

        <Input
          label="Work Email Address"
          placeholder="basant@company.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="mail-outline"
        />

        <Input
          label="Phone Number (Optional)"
          placeholder="98765 43210"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIcon="call-outline"
        />

        <Input
          label="Create Password"
          placeholder="Min 6 characters"
          value={password}
          onChangeText={setPassword}
          isPassword
          leftIcon="lock-closed-outline"
        />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          variant="primary"
          size="lg"
          style={{ marginTop: spacing.sm }}
        />
      </Card>

      {/* Divider */}
      <View style={[styles.dividerRow, { marginVertical: spacing.md }]}>
        <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
        <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
      </View>

      <GoogleButton
        onPress={async () => {
          try {
            await bypassAuth({
              name: 'Google User (Dev)',
              email: 'google.dev@hajri.app',
            });
            router.replace('/(tabs)' as any);
          } catch {
            router.replace('/(tabs)' as any);
          }
        }}
      />

      <View style={[styles.footerRow, { marginTop: spacing.lg }]}>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.sizes.sm,
          }}
        >
          Already have an account?{' '}
        </Text>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text
            style={{
              color: colors.primary,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
            }}
          >
            Sign In
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  title: {
    letterSpacing: -0.3,
  },
  subtitle: {
    lineHeight: 20,
  },
  errorBanner: {
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
