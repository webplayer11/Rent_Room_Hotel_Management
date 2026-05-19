import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const bookings = [
  { id: '1', name: 'Trần Thị B', dates: '12/10 - 14/10', status: 'Confirmed', price: '1,200,000đ' },
  { id: '2', name: 'Lê Văn C', dates: '13/10 - 15/10', status: 'Pending', price: '850,000đ' },
];

export function RecentBookings() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking mới nhất</Text>
        <Text style={styles.seeAll}>Xem tất cả</Text>
      </View>
      
      {bookings.map((b, idx) => (
        <View key={b.id} style={[styles.bookingCard, idx < bookings.length - 1 && styles.borderBottom]}>
          <View style={styles.left}>
            <Text style={styles.guestName}>{b.name}</Text>
            <Text style={styles.dates}>{b.dates}</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.price}>{b.price}</Text>
            <Text style={[
              styles.status, 
              { color: b.status === 'Confirmed' ? '#16A34A' : '#D97706' },
              { backgroundColor: b.status === 'Confirmed' ? '#DCFCE7' : '#FEF3C7' }
            ]}>
              {b.status === 'Confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  left: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  dates: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  }
});
