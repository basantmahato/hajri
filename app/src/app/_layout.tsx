import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../features/auth/auth.store';
import { Colors } from '../core/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const { isAuthenticated, hasCompletedOnboarding, isLoading, initialize } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) return;

    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === '(auth)';

    if (!hasCompletedOnboarding) {
      if (segments[1] !== 'onboarding') {
        router.replace('/(auth)/onboarding' as any);
      }
    } else if (!isAuthenticated) {
      if (!inAuthGroup || segments[1] === 'onboarding') {
        router.replace('/(auth)/login' as any);
      }
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, hasCompletedOnboarding, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
