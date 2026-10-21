import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  isPassword = false,
  containerStyle,
  style,
  ...rest
}: InputProps) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: error ? colors.danger : colors.text,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.danger
              : isFocused
              ? colors.primary
              : colors.surfaceBorder,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary : colors.textMuted}
            style={{ marginRight: spacing.sm }}
          />
        )}

        <TextInput
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: typography.sizes.md,
            },
            style,
          ]}
          {...rest}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={12}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <Text
          style={[
            styles.errorText,
            {
              color: colors.danger,
              fontSize: typography.sizes.xs,
              marginTop: spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      ) : hint ? (
        <Text
          style={[
            styles.hintText,
            {
              color: colors.textMuted,
              fontSize: typography.sizes.xs,
              marginTop: spacing.xs,
            },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.2,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontWeight: '500',
  },
  hintText: {},
});
