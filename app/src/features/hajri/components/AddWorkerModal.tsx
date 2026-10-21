import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../../core/theme';
import { Button, Input } from '../../../core/ui';

interface AddWorkerModalProps {
  visible: boolean;
  onClose: () => void;
  onAddWorker: (data: {
    name: string;
    dailyWage: string;
    phone?: string;
    age?: number;
    role?: string;
  }) => Promise<void>;
}

export function AddWorkerModal({ visible, onClose, onAddWorker }: AddWorkerModalProps) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const [name, setName] = useState('');
  const [dailyWage, setDailyWage] = useState('500');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [role] = useState('worker');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter the worker's name");
      return;
    }
    if (!dailyWage || isNaN(Number(dailyWage)) || Number(dailyWage) < 0) {
      setError('Please enter a valid daily wage rate in ₹');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onAddWorker({
        name: name.trim(),
        dailyWage: Number(dailyWage).toFixed(2),
        phone: phone.trim() || undefined,
        age: age ? Number(age) : undefined,
        role,
      });

      setName('');
      setDailyWage('500');
      setPhone('');
      setAge('');
      onClose();
    } catch {
      setError('Failed to add worker. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius['2xl'],
              borderTopRightRadius: radius['2xl'],
              padding: spacing.xl,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text
                style={[
                  styles.title,
                  { color: colors.text, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
                ]}
              >
                Add Worker to Group
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 2 }}>
                Workers don&apos;t need the app — you track them here
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.surfaceSubtle, borderRadius: radius.full },
              ]}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>

          {error && (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: colors.dangerLight, borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.md },
              ]}
            >
              <Text style={{ color: colors.danger, fontSize: typography.sizes.xs, fontWeight: '600' }}>
                {error}
              </Text>
            </View>
          )}

          <View style={{ marginTop: spacing.lg }}>
            <Input
              label="Worker Name *"
              placeholder="e.g. Ramesh Kumar, Sunita Devi, Chhotu"
              value={name}
              onChangeText={setName}
              leftIcon="person-outline"
            />

            <Input
              label="Daily Salary / Wage (₹ / Day) *"
              placeholder="500"
              value={dailyWage}
              onChangeText={setDailyWage}
              keyboardType="numeric"
              leftIcon="cash-outline"
              hint="Calculates monthly wages based on attendance"
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1.3 }}>
                <Input
                  label="Phone Number"
                  placeholder="98765 00000"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  leftIcon="call-outline"
                />
              </View>

              <View style={{ flex: 0.7 }}>
                <Input
                  label="Age"
                  placeholder="28"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Button
              title="Add Worker to Roster"
              onPress={handleSubmit}
              loading={isLoading}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.xs }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 6,
  },
  errorBanner: {
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
});
