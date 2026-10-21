import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer, Button, Input, Card } from '../../core/ui';
import { useAppTheme } from '../../core/theme';
import { useAuthStore } from '../../features/auth/auth.store';
import { GoogleButton } from '../../features/auth/components/GoogleButton';

type LoginMode = 'email' | 'phone';

export default function LoginScreen() {
  const { colors, radius, spacing, typography } = useAppTheme();
  const { bypassAuth, isLoading } = useAuthStore();

  const [mode, setMode] = useState<LoginMode>('email');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    try {
      const emailVal = email.trim() || 'admin@hajri.app';
      const phoneVal = phone.trim() || '+91 98765 43210';
      await bypassAuth({
        email: emailVal,
        name: emailVal.includes('@') ? emailVal.split('@')[0] : 'Dev Manager',
        phone: phoneVal,
      });
      router.replace('/(tabs)' as any);
    } catch {
      router.replace('/(tabs)' as any);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await bypassAuth({
        name: 'Google User (Dev)',
        email: 'google.dev@hajri.app',
      });
      router.replace('/(tabs)' as any);
    } catch {
      router.replace('/(tabs)' as any);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <ScreenContainer safeTop safeBottom contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={[styles.header, { marginTop: spacing.lg, marginBottom: spacing.xl }]}>
        <View
          style={[
            styles.brandIcon,
            { backgroundColor: colors.primary, borderRadius: radius.xl },
          ]}
        >
          <Text
            style={[
              styles.brandIconLetter,
              { color: '#FFFFFF', fontWeight: typography.weights.bold },
            ]}
          >
            H
          </Text>
        </View>

        <Text
          style={[
            styles.welcomeTitle,
            {
              color: colors.text,
              fontSize: typography.sizes['3xl'],
              fontWeight: typography.weights.bold,
              marginTop: spacing.md,
            },
          ]}
        >
          Welcome to Hajri
        </Text>
        <Text
          style={[
            styles.welcomeSubtitle,
            {
              color: colors.textMuted,
              fontSize: typography.sizes.sm,
              marginTop: spacing.xs,
            },
          ]}
        >
          Manage group attendance, daily wages and monthly payouts
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1b6b4a18',
            borderColor: '#1b6b4a40',
            borderWidth: 1,
            borderRadius: radius.full,
            paddingHorizontal: 12,
            paddingVertical: 5,
            marginTop: spacing.sm,
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>
            ⚡ DEV MODE:
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>
            Click Sign In to directly bypass to dashboard
          </Text>
        </View>
      </View>

      {/* Mode Switcher Pills */}
      <View
        style={[
          styles.pillContainer,
          {
            backgroundColor: colors.surfaceSubtle,
            borderRadius: radius.lg,
            padding: spacing.xs,
            marginBottom: spacing.lg,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            setMode('email');
            setError(null);
          }}
          style={[
            styles.pill,
            {
              borderRadius: radius.md,
              backgroundColor: mode === 'email' ? colors.surface : 'transparent',
              shadowColor: mode === 'email' ? colors.cardShadow : 'transparent',
            },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              {
                color: mode === 'email' ? colors.primary : colors.textMuted,
                fontWeight:
                  mode === 'email'
                    ? typography.weights.semibold
                    : typography.weights.normal,
              },
            ]}
          >
            Email &amp; Password
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setMode('phone');
            setError(null);
          }}
          style={[
            styles.pill,
            {
              borderRadius: radius.md,
              backgroundColor: mode === 'phone' ? colors.surface : 'transparent',
              shadowColor: mode === 'phone' ? colors.cardShadow : 'transparent',
            },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              {
                color: mode === 'phone' ? colors.primary : colors.textMuted,
                fontWeight:
                  mode === 'phone'
                    ? typography.weights.semibold
                    : typography.weights.normal,
              },
            ]}
          >
            Mobile OTP
          </Text>
        </Pressable>
      </View>

      {/* Form Card */}
      <Card variant="elevated" style={{ marginBottom: spacing.md }}>
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

        {mode === 'email' ? (
          <>
            <Input
              label="Work Email"
              placeholder="you@company.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
            />
            <Button
              title="Sign In"
              onPress={handleSubmit}
              loading={isLoading}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </>
        ) : (
          <>
            <Input
              label="Phone Number"
              placeholder="98765 43210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon="call-outline"
              hint="An OTP will be sent via SMS for verification"
            />
            <Button
              title="Get OTP"
              onPress={handleSubmit}
              loading={isLoading}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </>
        )}
      </Card>

      {/* Divider */}
      <View style={[styles.dividerRow, { marginVertical: spacing.md }]}>
        <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
        <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
      </View>

      {/* Google Login Button */}
      <GoogleButton
        onPress={handleGoogleSignIn}
        loading={isGoogleLoading}
      />

      {/* Register Link */}
      <View style={[styles.footerRow, { marginTop: spacing.xl }]}>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.sizes.sm,
          }}
        >
          New to Hajri?{' '}
        </Text>
        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text
            style={{
              color: colors.primary,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
            }}
          >
            Create Account
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    textAlign: 'center',
  },
  brandIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  brandIconLetter: {
    fontSize: 28,
  },
  welcomeTitle: {
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    textAlign: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  pillText: {
    fontSize: 14,
  },
  errorBanner: {
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
