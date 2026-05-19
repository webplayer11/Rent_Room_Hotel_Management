import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleAction = (route: string) => {
    setOpen(false);
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {open && (
        <View style={styles.menu}>
          <Pressable style={styles.menuItem} onPress={() => handleAction('/owner/maintenance-form')}>
            <Text style={styles.menuText}>Báo bảo trì</Text>
            <View style={styles.menuIcon}>
              <Ionicons name="construct" size={20} color="#2563EB" />
            </View>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => handleAction('/owner/booking-form')}>
            <Text style={styles.menuText}>Tạo booking</Text>
            <View style={styles.menuIcon}>
              <Ionicons name="calendar" size={20} color="#2563EB" />
            </View>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => handleAction('/owner/room-form')}>
            <Text style={styles.menuText}>Thêm phòng</Text>
            <View style={styles.menuIcon}>
              <Ionicons name="bed" size={20} color="#2563EB" />
            </View>
          </Pressable>
        </View>
      )}

      <Pressable 
        style={[styles.fab, open && styles.fabOpen]} 
        onPress={() => setOpen(!open)}
      >
        <Ionicons name={open ? 'close' : 'add'} size={32} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  menu: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  menuText: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  fabOpen: {
    backgroundColor: '#1D4ED8',
  }
});
