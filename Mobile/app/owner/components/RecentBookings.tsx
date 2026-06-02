import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { tokenStorage } from '../../../src/shared/storage/tokenStorage';

export function RecentBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentBookings = async () => {
    try {
      setLoading(true);
      const accessToken = await tokenStorage.getAccessToken();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

      const response = await axios.get(`${apiUrl}/api/bookings/host-bookings`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data?.isSuccess && response.data?.data) {
        // Sort by created at descending and take newest 3
        const sorted = response.data.data
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        setBookings(sorted);
      }
    } catch (error) {
      console.log('Error fetching recent bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecentBookings();
    }, [])
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Confirmed': return { text: 'Đã xác nhận', color: '#16A34A', bg: '#DCFCE7' };
      case 'CheckedIn': return { text: 'Đang ở', color: '#2563EB', bg: '#DBEAFE' };
      case 'CheckedOut': return { text: 'Đã trả phòng', color: '#6B7280', bg: '#F3F4F6' };
      case 'Cancelled': return { text: 'Đã hủy', color: '#DC2626', bg: '#FEE2E2' };
      default: return { text: status, color: '#D97706', bg: '#FEF3C7' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking mới nhất</Text>
        <TouchableOpacity onPress={() => router.push('/owner/(tabs)/bookings')}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 20 }} />
      ) : bookings.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có booking nào</Text>
      ) : (
        bookings.map((b, idx) => {
          const statusInfo = getStatusDisplay(b.status);
          return (
            <View key={b.id} style={[styles.bookingCard, idx < bookings.length - 1 && styles.borderBottom]}>
              <View style={styles.left}>
                <Text style={styles.guestName}>{b.roomName || b.bookingCode || 'Đơn đặt phòng'}</Text>
                <Text style={styles.dates}>{formatDate(b.checkInDate)} - {formatDate(b.checkOutDate)}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.price}>{b.finalPrice?.toLocaleString('vi-VN')}đ</Text>
                <Text style={[
                  styles.status,
                  { color: statusInfo.color, backgroundColor: statusInfo.bg }
                ]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>
          );
        })
      )}
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
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 20,
  }
});
