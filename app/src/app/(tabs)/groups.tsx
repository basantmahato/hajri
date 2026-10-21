import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Card, Button } from '../../core/ui';
import { useAppTheme } from '../../core/theme';
import { useHajriStore } from '../../features/hajri/hajri.store';
import { CreateGroupModal } from '../../features/hajri/components/CreateGroupModal';

export default function GroupsScreen() {
  const { colors, radius, spacing, typography } = useAppTheme();
  const {
    organizations,
    activeOrg,
    setActiveOrg,
    createOrganization,
  } = useHajriStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getCategoryIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type.toLowerCase()) {
      case 'construction':
        return 'construct-outline';
      case 'factory':
        return 'cog-outline';
      case 'retail':
        return 'cart-outline';
      case 'restaurant':
        return 'restaurant-outline';
      case 'office':
        return 'business-outline';
      default:
        return 'people-outline';
    }
  };

  return (
    <ScreenContainer safeTop safeBottom contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header Row */}
      <View style={[styles.headerRow, { marginTop: spacing.md, marginBottom: spacing.md }]}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.screenTitle,
              { color: colors.text, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
            ]}
          >
            Attendance Groups
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 2 }}>
            Switch between work sites, shops, or factory units
          </Text>
        </View>

        <Button
          title="+ Create Group"
          onPress={() => setIsCreateModalOpen(true)}
          variant="primary"
          size="sm"
        />
      </View>

      {/* List of Groups */}
      <View style={styles.groupsList}>
        {organizations.map((org) => {
          const isActive = activeOrg?.id === org.id;
          return (
            <Pressable
              key={org.id}
              onPress={() => setActiveOrg(org)}
              style={({ pressed }) => [
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
              ]}
            >
              <Card
                variant="elevated"
                style={[
                  styles.orgCard,
                  {
                    borderColor: isActive ? colors.primary : colors.surfaceBorder,
                    borderWidth: isActive ? 2 : 1,
                    marginBottom: spacing.sm,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor: isActive ? colors.primaryLight : colors.surfaceSubtle,
                        borderRadius: radius.md,
                      },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(org.type)}
                      size={22}
                      color={isActive ? colors.primary : colors.textMuted}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: typography.sizes.md,
                          fontWeight: typography.weights.bold,
                        }}
                      >
                        {org.name}
                      </Text>
                      {isActive && (
                        <View
                          style={{
                            backgroundColor: colors.primary,
                            borderRadius: 4,
                            paddingHorizontal: 6,
                            paddingVertical: 1,
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                            ACTIVE
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={{ color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 2 }}>
                      Category: <Text style={{ textTransform: 'capitalize', fontWeight: '600' }}>{org.type}</Text>
                      {org.city ? ` • ${org.city}` : ''}
                    </Text>
                  </View>

                  <Ionicons
                    name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={isActive ? colors.primary : colors.textSubtle}
                  />
                </View>

                {org.description && (
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: typography.sizes.xs,
                      marginTop: spacing.xs,
                      lineHeight: 16,
                    }}
                  >
                    {org.description}
                  </Text>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGroup={async (data) => {
          await createOrganization(data);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  screenTitle: {
    letterSpacing: -0.3,
  },
  groupsList: {
    width: '100%',
  },
  orgCard: {},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
