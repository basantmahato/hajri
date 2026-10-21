import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Card } from '../../core/ui';
import { useAppTheme } from '../../core/theme';
import { useHajriStore } from '../../features/hajri/hajri.store';
import { GroupSelectorHeader } from '../../features/hajri/components/GroupSelectorHeader';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function WagesScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const {
    activeOrg,
    report,
    reportMonth,
    reportYear,
    setReportPeriod,
    loadWageReport,
    isLoadingReport,
  } = useHajriStore();

  useEffect(() => {
    if (activeOrg) {
      loadWageReport();
    }
  }, [activeOrg, loadWageReport]);

  const changeMonth = (delta: number) => {
    let nextMonth = reportMonth + delta;
    let nextYear = reportYear;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    } else if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setReportPeriod(nextMonth, nextYear);
  };

  const totalPayout = report.reduce(
    (sum, item) => sum + parseFloat(item.totalEarnings || '0'),
    0
  );
  const totalDaysPresent = report.reduce(
    (sum, item) => sum + item.totalDaysPresent,
    0
  );
  const totalHalfDays = report.reduce(
    (sum, item) => sum + item.totalHalfDays,
    0
  );

  return (
    <ScreenContainer safeTop safeBottom contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Active Group Header */}
      <GroupSelectorHeader />

      {/* Month / Period Selector Bar */}
      <Card variant="elevated" style={[styles.periodCard, { padding: spacing.sm, marginBottom: spacing.sm }]}>
        <View style={styles.periodRow}>
          <Pressable
            onPress={() => changeMonth(-1)}
            hitSlop={10}
            style={[styles.monthNavBtn, { backgroundColor: colors.surfaceSubtle }]}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </Pressable>

          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.sizes.md,
                fontWeight: typography.weights.bold,
              }}
            >
              {MONTH_NAMES[reportMonth - 1]} {reportYear}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs }}>
              Monthly Wage &amp; Payout Statement
            </Text>
          </View>

          <Pressable
            onPress={() => changeMonth(1)}
            hitSlop={10}
            style={[styles.monthNavBtn, { backgroundColor: colors.surfaceSubtle }]}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </Pressable>
        </View>
      </Card>

      {/* Big Total Payout Banner */}
      <Card
        variant="elevated"
        style={[
          styles.payoutBanner,
          {
            backgroundColor: colors.primary,
            padding: spacing.lg,
            marginBottom: spacing.md,
          },
        ]}
      >
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: typography.sizes.xs,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            fontWeight: '700',
          }}
        >
          TOTAL ESTIMATED PAYOUT
        </Text>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: typography.sizes['3xl'] + 4,
            fontWeight: typography.weights.bold,
            marginVertical: 4,
          }}
        >
          ₹{totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>

        <View style={[styles.payoutSubRow, { borderTopColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: typography.sizes.xs }}>
            Workers: <Text style={{ fontWeight: 'bold' }}>{report.length}</Text>
          </Text>
          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: typography.sizes.xs }}>
            Full Days: <Text style={{ fontWeight: 'bold' }}>{totalDaysPresent}</Text>
          </Text>
          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: typography.sizes.xs }}>
            Half Days: <Text style={{ fontWeight: 'bold' }}>{totalHalfDays}</Text>
          </Text>
        </View>
      </Card>

      {/* Worker-by-Worker Breakdown List */}
      <Text
        style={{
          color: colors.text,
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.bold,
          letterSpacing: 0.4,
          marginBottom: spacing.xs,
          textTransform: 'uppercase',
        }}
      >
        WORKER WAGE BREAKDOWN
      </Text>

      {isLoadingReport ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textMuted, marginTop: 10, fontSize: typography.sizes.sm }}>
            Calculating monthly wages...
          </Text>
        </View>
      ) : report.length === 0 ? (
        <Card variant="subtle" style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: typography.sizes.sm }}>
            No worker records found for {MONTH_NAMES[reportMonth - 1]} {reportYear}.
          </Text>
        </Card>
      ) : (
        report.map((item) => (
          <Card key={item.memberId} variant="elevated" style={[styles.workerWageCard, { marginBottom: spacing.sm }]}>
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes.md,
                    fontWeight: typography.weights.bold,
                  }}
                >
                  {item.userName}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 1 }}>
                  Rate: ₹{item.dailyWage || '0'} / day
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.bold,
                  }}
                >
                  ₹{parseFloat(item.totalEarnings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={{ color: colors.accentDark, fontSize: typography.sizes.xs - 1, fontWeight: '700' }}>
                  Total Earnings
                </Text>
              </View>
            </View>

            {/* Attendance Days Pill Breakdown */}
            <View
              style={[
                styles.daysPillGrid,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: 8,
                  padding: spacing.xs + 2,
                  marginTop: spacing.sm,
                },
              ]}
            >
              <View style={styles.pillStat}>
                <Text style={{ color: colors.accentDark, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                  {item.totalDaysPresent} P
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>Present</Text>
              </View>

              <View style={styles.pillStat}>
                <Text style={{ color: colors.warning, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                  {item.totalHalfDays} HD
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>Half Day</Text>
              </View>

              <View style={styles.pillStat}>
                <Text style={{ color: colors.danger, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                  {item.totalAbsent} A
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>Absent</Text>
              </View>

              <View style={styles.pillStat}>
                <Text style={{ color: colors.info, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                  {item.totalLeave} L
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>Leave</Text>
              </View>
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  periodCard: {
    width: '100%',
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutBanner: {
    borderRadius: 16,
  },
  payoutSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  workerWageCard: {
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  daysPillGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillStat: {
    alignItems: 'center',
    flex: 1,
  },
});
