import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useAppTheme } from '../../core/theme';

export default function TabLayout() {
  const { colors, typography } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: typography.weights.medium,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hajri',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={size}
              color={color as string}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="roster"
        options={{
          title: 'Roster',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={size}
              color={color as string}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wages"
        options={{
          title: 'Wages',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'cash' : 'cash-outline'}
              size={size}
              color={color as string}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'business' : 'business-outline'}
              size={size}
              color={color as string}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}
