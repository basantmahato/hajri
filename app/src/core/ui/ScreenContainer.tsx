import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  type ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  safeTop?: boolean;
  safeBottom?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  safeTop = true,
  safeBottom = true,
}: ScreenContainerProps) {
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();

  const containerPadding: ViewStyle = {
    paddingTop: safeTop ? insets.top : 0,
    paddingBottom: safeBottom ? insets.bottom : 0,
    backgroundColor: colors.background,
  };

  const innerContent = (
    <View
      style={[
        styles.responsiveWrapper,
        {
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, containerPadding]}
    >
      {scrollable ? (
        <ScrollView
          style={styles.root}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {innerContent}
        </ScrollView>
      ) : (
        <View style={[styles.root, styles.nonScrollContent]}>{innerContent}</View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  nonScrollContent: {
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 520, // Clean centered mobile frame on desktop web view
    flex: 1,
  },
});
