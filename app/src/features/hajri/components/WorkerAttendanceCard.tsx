import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../../core/theme';
import { Card } from '../../../core/ui';
import type { Member, AttendanceStatus } from '../types';

interface WorkerAttendanceCardProps {
  member: Member;
  currentStatus: AttendanceStatus;
  currentNotes: string;
  onSetStatus: (status: AttendanceStatus) => void;
  onSetNotes: (notes: string) => void;
}

export function WorkerAttendanceCard({
  member,
  currentStatus,
  currentNotes,
  onSetStatus,
  onSetNotes,
}: WorkerAttendanceCardProps) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const [showNotes, setShowNotes] = useState(Boolean(currentNotes));

  const buttons: { key: AttendanceStatus; label: string; short: string; color: string }[] = [
    { key: 'present', label: 'Present', short: 'P', color: colors.accent },
    { key: 'half_day', label: 'Half Day', short: 'HD', color: colors.warning },
    { key: 'absent', label: 'Absent', short: 'A', color: colors.danger },
    { key: 'leave', label: 'Leave', short: 'L', color: colors.info },
  ];

  return (
    <Card variant="elevated" style={[styles.card, { marginBottom: spacing.sm }]}>
      {/* Top: Worker Info */}
      <View style={styles.topRow}>
        <View style={styles.workerInfo}>
          <Text
            style={[
              styles.name,
              { color: colors.text, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
            ]}
          >
            {member.userName}
          </Text>
          <View style={styles.wageRow}>
            <Text style={{ color: colors.primary, fontSize: typography.sizes.xs, fontWeight: '700' }}>
              ₹{member.dailyWage || '0'}/day
            </Text>
            {member.userPhone && (
              <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs }}>
                • {member.userPhone}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => setShowNotes(!showNotes)}
          hitSlop={8}
          style={[
            styles.noteToggleBtn,
            {
              backgroundColor: currentNotes ? colors.primaryLight : colors.surfaceSubtle,
              borderRadius: radius.full,
            },
          ]}
        >
          <Ionicons
            name="chatbubble-outline"
            size={14}
            color={currentNotes ? colors.primary : colors.textMuted}
          />
        </Pressable>
      </View>

      {/* Status Selector Pills (P, HD, A, L) */}
      <View style={[styles.buttonGrid, { marginTop: spacing.sm }]}>
        {buttons.map((btn) => {
          const isSelected = currentStatus === btn.key;
          return (
            <Pressable
              key={btn.key}
              onPress={() => onSetStatus(btn.key)}
              style={({ pressed }) => [
                styles.statusBtn,
                {
                  backgroundColor: isSelected ? btn.color : colors.surfaceSubtle,
                  borderColor: isSelected ? btn.color : colors.surfaceBorder,
                  borderRadius: radius.md,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={[
                  styles.shortLabel,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {btn.short}
              </Text>
              <Text
                style={[
                  styles.fullLabel,
                  {
                    color: isSelected ? '#FFFFFF' : colors.textMuted,
                    fontSize: typography.sizes.xs - 2,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {btn.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Expandable Notes Input */}
      {showNotes && (
        <View
          style={[
            styles.notesContainer,
            {
              backgroundColor: colors.surfaceSubtle,
              borderRadius: radius.md,
              marginTop: spacing.xs + 2,
              paddingHorizontal: spacing.sm,
            },
          ]}
        >
          <TextInput
            placeholder="Add note (e.g. late 30 mins, overtime 2 hrs)..."
            placeholderTextColor={colors.textSubtle}
            value={currentNotes}
            onChangeText={onSetNotes}
            style={[
              styles.notesInput,
              { color: colors.text, fontSize: typography.sizes.xs },
            ]}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workerInfo: {
    flex: 1,
  },
  name: {
    letterSpacing: -0.2,
  },
  wageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  noteToggleBtn: {
    padding: 6,
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
  },
  shortLabel: {
    fontSize: 14,
  },
  fullLabel: {
    marginTop: 1,
  },
  notesContainer: {
    height: 34,
    justifyContent: 'center',
  },
  notesInput: {
    padding: 0,
    height: '100%',
  },
});
