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

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateGroup: (data: {
    name: string;
    type: string;
    city?: string;
    description?: string;
  }) => Promise<void>;
}

export function CreateGroupModal({ visible, onClose, onCreateGroup }: CreateGroupModalProps) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState('construction');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { key: 'construction', label: 'Construction' },
    { key: 'factory', label: 'Factory' },
    { key: 'retail', label: 'Retail & Shop' },
    { key: 'restaurant', label: 'Restaurant' },
    { key: 'office', label: 'Office' },
    { key: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onCreateGroup({
        name: name.trim(),
        type,
        city: city.trim() || undefined,
        description: description.trim() || undefined,
      });

      setName('');
      setCity('');
      setDescription('');
      onClose();
    } catch {
      setError('Failed to create group. Please try again.');
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
                Create Attendance Group
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 2 }}>
                e.g. Site team, shop branch, or factory shift
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
              label="Group / Team Name *"
              placeholder="e.g. Site Alpha Workers, Shop Staff"
              value={name}
              onChangeText={setName}
              leftIcon="business-outline"
            />

            <Text
              style={{
                color: colors.text,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium,
                marginBottom: spacing.xs,
              }}
            >
              Category
            </Text>

            <View style={[styles.categoriesRow, { marginBottom: spacing.md }]}>
              {categories.map((c) => {
                const active = type === c.key;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setType(c.key)}
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: active ? colors.primary : colors.surfaceSubtle,
                        borderRadius: radius.md,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? '#FFFFFF' : colors.text,
                        fontSize: typography.sizes.xs,
                        fontWeight: active ? '700' : '500',
                      }}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Input
              label="City / Location"
              placeholder="e.g. Ranchi, Patna, Delhi"
              value={city}
              onChangeText={setCity}
              leftIcon="location-outline"
            />

            <Button
              title="Create Group"
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
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
