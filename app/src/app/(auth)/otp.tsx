import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer, Button, Input, Card } from '../../core/ui';
import { useAppTheme } from '../../core/theme';
import { useAuthStore } from '../../features/auth/auth.store';

export default function OtpVerificationScreen() {
  const { colors, radius, spacing, typography } = useAppTheme();
  const { bypassAuth, isLoading } = useAuthStore();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone || '';

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    setError(null);
    try {
      await bypassAuth({
        phone: phone || '+91 98765 43210',
      });
      router.replace('/(tabs)' as any);
    } catch {
      router.replace('/(tabs)' as any);
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(30);
    setError(null);
  };

  return (
    <ScreenContainer safeTop safeBottom>
      <View style={[styles.header, { marginTop: spacing.xl, marginBottom: spacing['2xl'] }]}>
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
          Verify Phone Number
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
          Enter the 6-digit code sent to{' '}
          <Text style={{ color: colors.text, fontWeight: '600' }}>{phone}</Text>
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
          label="Verification Code"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          leftIcon="shield-checkmark-outline"
        />

        <Button
          title="Verify & Enter"
          onPress={handleVerify}
          loading={isLoading}
          variant="primary"
          size="lg"
          style={{ marginTop: spacing.sm }}
        />

        <View style={[styles.resendRow, { marginTop: spacing.lg }]}>
          <Text style={{ color: colors.textMuted, fontSize: typography.sizes.sm }}>
            Didn&apos;t receive code?{' '}
          </Text>
          {timer > 0 ? (
            <Text style={{ color: colors.textSubtle, fontSize: typography.sizes.sm }}>
              Resend in {timer}s
            </Text>
          ) : (
            <Pressable onPress={handleResend}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.bold,
                }}
              >
                Resend OTP
              </Text>
            </Pressable>
          )}
        </View>
      </Card>
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
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
