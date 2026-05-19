import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  currentHotel: string;
};

export function HotelSwitcher({ currentHotel }: Props) {
  return (
    <Pressable style={styles.container}>
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <Ionicons name="business" size={20} color="#2563EB" />
        </View>
        <Text style={styles.hotelName}>{currentHotel}</Text>
      </View>
      <Ionicons name="chevron-down" size={20} color="#6B7280" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  }
});
