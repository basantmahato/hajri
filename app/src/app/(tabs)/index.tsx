import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Button, Card } from '../../core/ui';
import { useAppTheme } from '../../core/theme';
import { useHajriStore } from '../../features/hajri/hajri.store';
import { GroupSelectorHeader } from '../../features/hajri/components/GroupSelectorHeader';
import { WorkerAttendanceCard } from '../../features/hajri/components/WorkerAttendanceCard';
import { CreateGroupModal } from '../../features/hajri/components/CreateGroupModal';
import type { AttendanceStatus } from '../../features/hajri/types';

export default function HajriAttendanceScreen() {
  const { colors, radius, spacing, typography } = useAppTheme();
  const {
    organizations,
    createOrganization,
    members,
    date,
    changeDateBy,
    attendanceMap,
    setStatus,
    setNotes,
    markAll,
    saveAttendance,
    isSavingAttendance,
    isLoadingAttendance,
    isLoadingOrgs,
    lastSaveMessage,
    initialize,
  } = useHajriStore();

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Format date display (e.g. Sun, 18 Oct 2026)
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isToday =
    date === new Date().toISOString().split('T')[0];

  const presentCount = members.filter(
    (m) => (attendanceMap[m.userId]?.status || 'present') === 'present'
  ).length;

  const halfDayCount = members.filter(
    (m) => attendanceMap[m.userId]?.status === 'half_day'
  ).length;

  const absentCount = members.filter(
    (m) => attendanceMap[m.userId]?.status === 'absent'
  ).length;

  if (isLoadingOrgs) {
    return (
      <ScreenContainer safeTop safeBottom contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textMuted, fontSize: typography.sizes.sm, marginTop: 12 }}>
          Loading your attendance groups...
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer safeTop safeBottom contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Active Group Header */}
      {organizations.length > 0 && <GroupSelectorHeader />}

      {organizations.length === 0 ? (
        <Card variant="elevated" style={{ padding: 28, alignItems: 'center', marginTop: 24 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="business-outline" size={32} color={colors.primary} />
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.sizes.xl,
              fontWeight: typography.weights.bold,
              textAlign: 'center',
            }}
          >
            Welcome to Hajri!
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: typography.sizes.sm,
              textAlign: 'center',
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            To start taking attendance and calculating wages, create your first group (e.g. your construction site, shop team, or factory unit).
          </Text>
          <Button
            title="+ Create Your First Group"
            onPress={() => setIsCreateGroupOpen(true)}
            variant="primary"
            size="lg"
            style={{ marginTop: 24, width: '100%' }}
          />
        </Card>
      ) : (
        <>
          {/* Date Navigation Bar */}
          <Card variant="elevated" style={[styles.dateCard, { padding: spacing.sm, marginBottom: spacing.sm }]}>
            <View style={styles.dateRow}>
              <Pressable
                onPress={() => changeDateBy(-1)}
                hitSlop={12}
                style={[styles.dateNavBtn, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>‹ Prev</Text>
              </Pressable>

              <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: typography.sizes.md,
                      fontWeight: typography.weights.bold,
                    }}
                  >
                    {formattedDate}
                  </Text>
                  {isToday && (
                    <View
                      style={{
                        backgroundColor: colors.primaryLight,
                        borderRadius: 4,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>
                        TODAY
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs }}>
                  {members.length} Workers Registered
                </Text>
              </View>

              <Pressable
                onPress={() => changeDateBy(1)}
                hitSlop={12}
                style={[styles.dateNavBtn, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>Next ›</Text>
              </Pressable>
            </View>
          </Card>

          {/* Quick Summary Pill Bar */}
          <View style={[styles.quickSummary, { marginBottom: spacing.sm }]}>
            <View style={[styles.summaryPill, { backgroundColor: colors.accentLight }]}>
              <Text style={{ color: colors.accentDark, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                {presentCount} Present
              </Text>
            </View>
            <View style={[styles.summaryPill, { backgroundColor: colors.warningLight }]}>
              <Text style={{ color: colors.warning, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                {halfDayCount} Half Day
              </Text>
            </View>
            <View style={[styles.summaryPill, { backgroundColor: colors.dangerLight }]}>
              <Text style={{ color: colors.danger, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                {absentCount} Absent
              </Text>
            </View>
          </View>

          {/* Quick Bulk Actions (Mark All) */}
          <View style={[styles.bulkActionsRow, { marginBottom: spacing.md }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, fontWeight: '600' }}>
              MARK ALL:
            </Text>
            <Pressable
              onPress={() => markAll('present')}
              style={[styles.bulkBtn, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}
            >
              <Text style={{ color: colors.accentDark, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                ✓ All Present
              </Text>
            </Pressable>
            <Pressable
              onPress={() => markAll('half_day')}
              style={[styles.bulkBtn, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}
            >
              <Text style={{ color: colors.warning, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                ½ All Half Day
              </Text>
            </Pressable>
            <Pressable
              onPress={() => markAll('absent')}
              style={[styles.bulkBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
            >
              <Text style={{ color: colors.danger, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                ✕ All Absent
              </Text>
            </Pressable>
          </View>

          {/* Save Status Feedback Banner */}
          {lastSaveMessage && (
            <View
              style={[
                styles.saveNotice,
                { backgroundColor: colors.primaryLight, borderRadius: radius.md, marginBottom: spacing.sm },
              ]}
            >
              <Text style={{ color: colors.primary, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                {lastSaveMessage}
              </Text>
            </View>
          )}

          {/* Workers Attendance List */}
          {isLoadingAttendance ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.textMuted, marginTop: 10, fontSize: typography.sizes.sm }}>
                Loading attendance records...
              </Text>
            </View>
          ) : members.length === 0 ? (
            <Card variant="subtle" style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: typography.sizes.md, fontWeight: 'bold' }}>
                No Workers in this Group
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, textAlign: 'center', marginTop: 4 }}>
                Add workers with their daily wage rate to start taking daily Hajri.
              </Text>
              <Button
                title="+ Add Worker to Roster"
                onPress={() => router.push('/(tabs)/roster' as any)}
                variant="primary"
                size="sm"
                style={{ marginTop: 14 }}
              />
            </Card>
          ) : (
            members.map((member) => {
              const entry = attendanceMap[member.userId] || { status: 'present' as AttendanceStatus, notes: '' };
              return (
                <WorkerAttendanceCard
                  key={member.id}
                  member={member}
                  currentStatus={entry.status}
                  currentNotes={entry.notes}
                  onSetStatus={(status) => setStatus(member.userId, status)}
                  onSetNotes={(notes) => setNotes(member.userId, notes)}
                />
              );
            })
          )}

          {/* Floating Save Button */}
          {members.length > 0 && (
            <View style={[styles.floatingSaveBar, { backgroundColor: colors.surface, borderTopColor: colors.surfaceBorder }]}>
              <Button
                title={isSavingAttendance ? 'Saving Attendance...' : `Save Hajri (${members.length} Workers)`}
                onPress={saveAttendance}
                loading={isSavingAttendance}
                variant="primary"
                size="lg"
                style={{ width: '100%' }}
              />
            </View>
          )}
        </>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={async (data) => {
          await createOrganization(data);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateCard: {
    width: '100%',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickSummary: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  bulkActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulkBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  saveNotice: {
    padding: 10,
    alignItems: 'center',
  },
  floatingSaveBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    borderTopWidth: 1,
  },
});
