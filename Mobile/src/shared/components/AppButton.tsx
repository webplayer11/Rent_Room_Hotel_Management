import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../constants/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
}

export const AppButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary',
  disabled = false 
}: AppButtonProps) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButton;
      case 'ghost':
        return styles.ghostButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <Pressable 
      onPress={onPress} 
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        getButtonStyle(),
        style,
        (pressed || disabled) && { opacity: 0.7 }
      ]}
    >
      <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },
});
