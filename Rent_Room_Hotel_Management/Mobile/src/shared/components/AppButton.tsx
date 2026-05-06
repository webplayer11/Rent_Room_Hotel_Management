import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';

type AppButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'outline' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  variant = 'primary',
  style,
  ...props
}: AppButtonProps) {
  const variantStyles = {
    primary: {
      container: styles.primaryContainer,
      text: styles.primaryText,
      pressed: styles.primaryPressed,
    },
    outline: {
      container: styles.outlineContainer,
      text: styles.outlineText,
      pressed: styles.outlinePressed,
    },
    danger: {
      container: styles.dangerContainer,
      text: styles.dangerText,
      pressed: styles.dangerPressed,
    },
  };

  const current = variantStyles[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        current.container,
        pressed && current.pressed,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.baseText, current.text]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '600',
    fontSize: 14,
  },

  // Primary
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.textLight,
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark,
  },

  // Outline
  outlineContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },
  outlinePressed: {
    backgroundColor: colors.background,
  },

  // Danger
  dangerContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerText: {
    color: colors.danger,
  },
  dangerPressed: {
    backgroundColor: '#FEE2E2',
  },
});
