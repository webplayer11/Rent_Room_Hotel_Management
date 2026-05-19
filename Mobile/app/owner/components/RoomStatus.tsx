import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RoomStatusType = 'available' | 'occupied' | 'cleaning' | 'maintenance';

const statuses = {
  available: { label: 'Ready for Check-in', color: '#16A34A', bg: '#DCFCE7' },
  occupied: { label: 'Checked In', color: '#2563EB', bg: '#DBEAFE' },
  cleaning: { label: 'Cleaning', color: '#EA580C', bg: '#FFEDD5' },
  maintenance: { label: 'Maintenance', color: '#DC2626', bg: '#FEE2E2' }
};

const rooms = [
  { id: '204', type: 'Deluxe Double', status: 'available', time: '10 mins ago' },
  { id: '101', type: 'Standard', status: 'occupied', guest: 'Nguyen Van A', time: '2 hours ago' },
  { id: '102', type: 'Standard', status: 'cleaning', time: '15 mins ago' },
  { id: '305', type: 'Suite', status: 'maintenance', time: '1 day ago' },
];

export function RoomStatus() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trạng thái phòng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {rooms.map(room => {
          const statusInfo = statuses[room.status as RoomStatusType];
          return (
            <View key={room.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomNumber}>P.{room.id}</Text>
                  <Text style={styles.roomType}>{room.type}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
              </View>
              {room.guest ? (
                <View style={styles.guestInfo}>
                  <Ionicons name="person-outline" size={16} color="#6B7280" />
                  <Text style={styles.guestName}>{room.guest}</Text>
                </View>
              ) : <View style={styles.placeholder} />}
              <Text style={styles.updateTime}>Cập nhật: {room.time}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  card: {
    width: 260,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  roomType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  guestName: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '600',
  },
  placeholder: {
    height: 38,
    marginBottom: 12,
  },
  updateTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  }
});
