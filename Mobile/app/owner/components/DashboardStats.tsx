import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashboardStatsProps {
  bookingsToday: number;
  revenueThisMonth: number;
  emptyRooms: number;
  occupiedRooms: number;
}

export function DashboardStats({
  bookingsToday,
  revenueThisMonth,
  emptyRooms,
  occupiedRooms,
}: DashboardStatsProps) {
  return (
    <View style={styles.grid}>
      <View style={[styles.card, { backgroundColor: '#2563EB' }]}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="calendar" size={20} color="#FFF" />
          </View>
        </View>
        <Text style={styles.valueMain}>{bookingsToday}</Text>
        <Text style={styles.labelMain}>Booking hôm nay</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="wallet" size={20} color="#2563EB" />
          </View>
        </View>
        <Text style={styles.value}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueThisMonth)}</Text>
        <Text style={styles.label}>Doanh thu tháng</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="key" size={20} color="#16A34A" />
          </View>
        </View>
        <Text style={styles.value}>{emptyRooms}</Text>
        <Text style={styles.label}>Phòng trống</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF9C3' }]}>
            <Ionicons name="bed" size={20} color="#CA8A04" />
          </View>
        </View>
        <Text style={styles.value}>{occupiedRooms}</Text>
        <Text style={styles.label}>Đang có khách</Text>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueMain: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  labelMain: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  occupancyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  occupancyLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  occupancyValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#9333EA',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#9333EA',
    borderRadius: 4,
  }
});
