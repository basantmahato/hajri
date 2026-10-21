import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Card, Input, Button } from '../../core/ui';
import { useAppTheme } from '../../core/theme';
import { useHajriStore } from '../../features/hajri/hajri.store';
import { GroupSelectorHeader } from '../../features/hajri/components/GroupSelectorHeader';
import { AddWorkerModal } from '../../features/hajri/components/AddWorkerModal';
import type { Member } from '../../features/hajri/types';

export default function RosterScreen() {
  const { colors, radius, spacing, typography } = useAppTheme();
  const {
    activeOrg,
    members,
    addWorker,
    updateWorkerWage,
    removeWorker,
  } = useHajriStore();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editWage, setEditWage] = useState('');

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.userName.toLowerCase().includes(q) ||
      (m.userPhone && m.userPhone.includes(q)) ||
      m.role.toLowerCase().includes(q)
    );
  });

  const totalDailyPayroll = members.reduce(
    (sum, m) => sum + parseFloat(m.dailyWage || '0'),
    0
  );

  const startEditWage = (m: Member) => {
    setEditingMemberId(m.id);
    setEditWage(m.dailyWage || '500');
  };

  const handleSaveWage = async (memberId: number) => {
    if (!editWage || isNaN(Number(editWage)) || Number(editWage) < 0) {
      return;
    }
    await updateWorkerWage(memberId, editWage);
    setEditingMemberId(null);
  };

  const handleRemove = (m: Member) => {
    const proceed = () => removeWorker(m.id);
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to remove ${m.userName} from this group?`)) {
        proceed();
      }
    } else {
      Alert.alert('Remove Worker', `Remove ${m.userName} from this group?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: proceed },
      ]);
    }
  };

  return (
    <ScreenContainer safeTop safeBottom contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Active Group Header */}
      <GroupSelectorHeader />

      {/* Top Banner Stats */}
      <View style={[styles.statsGrid, { marginBottom: spacing.md }]}>
        <Card variant="elevated" style={[styles.statCard, { padding: spacing.md }]}>
          <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, textTransform: 'uppercase', fontWeight: '700' }}>
            TOTAL WORKERS
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.sizes['3xl'],
              fontWeight: typography.weights.bold,
              marginVertical: 2,
            }}
          >
            {members.length}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs }}>
            Active in group
          </Text>
        </Card>

        <Card variant="elevated" style={[styles.statCard, { padding: spacing.md }]}>
          <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, textTransform: 'uppercase', fontWeight: '700' }}>
            DAILY PAYROLL
          </Text>
          <Text
            style={{
              color: colors.primary,
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              marginVertical: 2,
            }}
          >
            ₹{totalDailyPayroll.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs }}>
            Full day capacity
          </Text>
        </Card>
      </View>

      {/* Action Row: Search + Add Worker CTA */}
      <View style={[styles.actionRow, { marginBottom: spacing.md }]}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Input
            placeholder="Search workers by name/phone..."
            value={search}
            onChangeText={setSearch}
            leftIcon="search-outline"
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        <Button
          title="+ Add Worker"
          onPress={() => setIsAddModalOpen(true)}
          variant="primary"
          size="md"
        />
      </View>

      {/* Worker List */}
      <View style={styles.workersList}>
        {filteredMembers.length > 0 ? (
          filteredMembers.map((m) => {
            const isEditing = editingMemberId === m.id;
            return (
              <Card key={m.id} variant="elevated" style={[styles.memberCard, { marginBottom: spacing.sm }]}>
                <View style={styles.memberTop}>
                  <View style={styles.avatarCircle}>
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>
                      {m.userName.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: typography.sizes.md,
                        fontWeight: typography.weights.bold,
                      }}
                    >
                      {m.userName}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 1 }}>
                      {m.role} {m.userPhone ? `• ${m.userPhone}` : ''}
                    </Text>
                  </View>

                  <Pressable onPress={() => handleRemove(m)} hitSlop={10} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>

                {/* Daily Wage Block */}
                <View
                  style={[
                    styles.wageRow,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderRadius: radius.md,
                      padding: spacing.sm,
                      marginTop: spacing.sm,
                    },
                  ]}
                >
                  {isEditing ? (
                    <View style={styles.editWageRow}>
                      <Text style={{ color: colors.text, fontWeight: '700', marginRight: 4 }}>₹</Text>
                      <Input
                        value={editWage}
                        onChangeText={setEditWage}
                        keyboardType="numeric"
                        containerStyle={{ width: 90, marginBottom: 0 }}
                        style={{ height: 32, paddingVertical: 0 }}
                      />
                      <Pressable
                        onPress={() => handleSaveWage(m.id)}
                        style={[styles.smallBtn, { backgroundColor: colors.primary }]}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Save</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setEditingMemberId(null)}
                        style={[styles.smallBtn, { backgroundColor: colors.surfaceBorder }]}
                      >
                        <Text style={{ color: colors.text, fontSize: 11 }}>Cancel</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <View>
                        <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs }}>
                          Daily Salary / Wage:
                        </Text>
                        <Text
                          style={{
                            color: colors.primary,
                            fontSize: typography.sizes.md,
                            fontWeight: typography.weights.bold,
                          }}
                        >
                          ₹{m.dailyWage || '0'} / day
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => startEditWage(m)}
                        style={[styles.editWageBtn, { borderColor: colors.primary }]}
                      >
                        <Ionicons name="pencil-outline" size={12} color={colors.primary} />
                        <Text style={{ color: colors.primary, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                          Edit Rate
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </Card>
            );
          })
        ) : (
          <Card variant="subtle" style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: typography.sizes.sm }}>
              No workers found. Tap &quot;+ Add Worker&quot; to register workers.
            </Text>
          </Card>
        )}
      </View>

      {/* Add Worker Modal */}
      {activeOrg && (
        <AddWorkerModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddWorker={async (data) => {
            await addWorker({
              organizationId: activeOrg.id,
              ...data,
            });
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workersList: {
    width: '100%',
  },
  memberCard: {
    padding: 12,
  },
  memberTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eef5f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editWageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editWageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  smallBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
});
