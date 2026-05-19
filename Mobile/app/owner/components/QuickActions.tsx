import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const actions = [
  { icon: 'business-outline', label: 'Thêm KS', href: '/owner/hotel-form' },
  { icon: 'bed-outline', label: 'Thêm phòng', href: '/owner/room-form' },
  { icon: 'calendar-outline', label: 'Booking', href: '/owner/(tabs)/bookings' },
  { icon: 'key-outline', label: 'Quản lý phòng', href: '/owner/rooms' },
  { icon: 'bar-chart-outline', label: 'Doanh thu', href: '/owner/(tabs)/analytics' },
  { icon: 'chatbubbles-outline', label: 'Tin nhắn', href: '/owner/notifications' },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thao tác nhanh</Text>
      <View style={styles.grid}>
        {actions.map((action, idx) => (
          <Pressable 
            key={idx} 
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push(action.href as any)}
          >
            <View style={styles.iconBox}>
              <Ionicons name={action.icon as any} size={24} color="#2563EB" />
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  item: {
    width: '33.33%',
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  }
});
