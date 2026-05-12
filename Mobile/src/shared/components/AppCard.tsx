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
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
    width: '100%',
  },
});