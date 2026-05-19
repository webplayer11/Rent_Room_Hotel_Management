import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  hostName: string;
};

export function HomeHeader({ hostName }: Props) {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{hostName.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.greeting}>Xin chào, {hostName} 👋</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
      </View>
      <Pressable style={styles.notificationBtn}>
        <Ionicons name="notifications-outline" size={24} color="#111827" />
        <View style={styles.badge} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  date: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFF',
  }
});
