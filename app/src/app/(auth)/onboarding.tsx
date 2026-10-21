import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer, Button } from '../../core/ui';
import { useAppTheme } from '../../core/theme';
import { useAuthStore } from '../../features/auth/auth.store';
import {
  OnboardingSlide,
  type SlideData,
} from '../../features/auth/components/OnboardingSlide';

const { width } = Dimensions.get('window');

const SLIDES: SlideData[] = [
  {
    id: '1',
    badge: 'Daily Hajri',
    title: 'Track Group Attendance in Seconds',
    subtitle:
      'Mark daily attendance with 1-tap Present, Half Day, Absent, or Leave. Workers do not need smartphones — you manage their roster.',
    icon: 'calendar-outline',
    accentColor: '#1b6b4a',
  },
  {
    id: '2',
    badge: 'Daily Wages',
    title: 'Automatic Wage & Salary Calculation',
    subtitle:
      'Set daily wage rates (₹/day) per worker. Hajri calculates exact monthly earnings, deductions, and payout statements automatically.',
    icon: 'cash-outline',
    accentColor: '#d97706',
  },
  {
    id: '3',
    badge: 'Multi-Site',
    title: 'Manage Multiple Teams & Sites',
    subtitle:
      'Switch between construction sites, factory units, shop staff, and contractor teams seamlessly in one unified app.',
    icon: 'business-outline',
    accentColor: '#1b6b4a',
  },
];

export default function OnboardingScreen() {
  const { colors, radius, spacing, typography } = useAppTheme();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideData>>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const slideWidth = Math.min(width - 32, 480);
    const index = Math.round(offsetX / (slideWidth || 1));
    if (index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      await completeOnboarding();
      router.replace('/(auth)/login' as any);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login' as any);
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <ScreenContainer scrollable={false} safeBottom safeTop>
      {/* Top Header: Brand Name + Skip */}
      <View style={[styles.header, { paddingVertical: spacing.md }]}>
        <View style={styles.brandRow}>
          <View
            style={[
              styles.logoBadge,
              { backgroundColor: colors.primary, borderRadius: radius.md },
            ]}
          >
            <Text
              style={[
                styles.logoLetter,
                { color: '#FFFFFF', fontWeight: typography.weights.bold },
              ]}
            >
              H
            </Text>
          </View>
          <Text
            style={[
              styles.brandText,
              { color: colors.text, fontWeight: typography.weights.bold },
            ]}
          >
            Hajri
          </Text>
        </View>

        {!isLast && (
          <Pressable onPress={handleSkip} hitSlop={12}>
            <Text
              style={[
                styles.skipText,
                {
                  color: colors.textMuted,
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                },
              ]}
            >
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      {/* Center Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          renderItem={({ item }) => <OnboardingSlide item={item} />}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Pagination Dots */}
      <View style={[styles.dotsContainer, { marginVertical: spacing.xl }]}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === currentIndex ? colors.primary : colors.surfaceBorder,
                width: i === currentIndex ? 24 : 8,
                borderRadius: radius.full,
              },
            ]}
          />
        ))}
      </View>

      {/* Bottom Action Area */}
      <View style={[styles.bottomArea, { paddingBottom: spacing.lg }]}>
        <Button
          title={isLast ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          style={{ width: '100%' }}
        />

        <View style={[styles.loginLinkRow, { marginTop: spacing.md }]}>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: typography.sizes.sm,
            }}
          >
            Already have an account?{' '}
          </Text>
          <Pressable onPress={() => router.replace('/(auth)/login' as any)}>
            <Text
              style={{
                color: colors.primary,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.bold,
              }}
            >
              Sign In
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 20,
  },
  brandText: {
    fontSize: 22,
    letterSpacing: -0.3,
  },
  skipText: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
  },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
  },
  loginLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
