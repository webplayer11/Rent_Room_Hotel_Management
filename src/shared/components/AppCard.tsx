import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const AppCard = ({ children, style }: AppCardProps) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
});
