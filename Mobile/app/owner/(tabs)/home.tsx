import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { hotelApi } from '../../../src/shared/api/hotelApi';
import { hostApi, HostProfileDto } from '../../../src/shared/api/hostApi';
import { bookingApi, BookingDto } from '../../../src/shared/api/bookingApi';
import { apiFetch } from '../../../src/shared/api/apiClient';
import { tokenStorage } from '../../../src/shared/storage/tokenStorage';

type DashboardStats = {
  bookingsToday: number;
  revenueThisMonth: number;
  emptyRooms: number;
  occupiedRooms: number;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  Pending:   { label: 'Chờ xác nhận', color: '#D97706', bg: '#FEF3C7' },
  Confirmed: { label: 'Đã xác nhận',  color: '#2563EB', bg: '#DBEAFE' },
  CheckedIn: { label: 'Đang ở',        color: '#7C3AED', bg: '#EDE9FE' },
  CheckedOut:{ label: 'Đã trả phòng', color: '#16A34A', bg: '#DCFCE7' },
  Completed: { label: 'Hoàn thành',   color: '#16A34A', bg: '#DCFCE7' },
  Cancelled: { label: 'Đã hủy',       color: '#DC2626', bg: '#FEE2E2' },
  Rejected:  { label: 'Từ chối',      color: '#DC2626', bg: '#FEE2E2' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
};

export default function OwnerHome() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);

  const [hostName, setHostName]     = useState('');
  const [hotelCount, setHotelCount] = useState(0);
  const [stats, setStats]           = useState<DashboardStats>({
    bookingsToday: 0,
    revenueThisMonth: 0,
    emptyRooms: 0,
    occupiedRooms: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingDto[]>([]);

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const loadData = async () => {
    try {
      // 1. Host name
      let name = await tokenStorage.getFullName();
      if (!name) {
        try {
          const profileRes = await apiFetch<any>('/api/hosts/me');
          if (profileRes.isSuccess && profileRes.data?.fullName) {
            name = profileRes.data.fullName;
          }
        } catch {}
      }
      setHostName(name || 'Chủ khách sạn');

      // 2. Hotel count
      const hotelsRes = await hotelApi.getMyHotels();
      if (hotelsRes.isSuccess && hotelsRes.data) {
        setHotelCount(hotelsRes.data.length);
      }

      // 3. Dashboard stats
      try {
        const statsRes = await apiFetch<DashboardStats>('/api/hosts/revenue/dashboard');
        if ((statsRes as any).isSuccess && (statsRes as any).data) {
          setStats((statsRes as any).data);
        }
      } catch {}

      // 4. Recent bookings (lấy 5 cái mới nhất)
      const bookRes = await bookingApi.getHostBookings();
      if (bookRes.isSuccess && bookRes.data) {
        const sorted = [...bookRes.data]
          .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
          .slice(0, 5);
        setRecentBookings(sorted);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tải được dữ liệu trang chủ' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  const occupancyRate =
    stats.emptyRooms + stats.occupiedRooms > 0
      ? Math.round((stats.occupiedRooms / (stats.emptyRooms + stats.occupiedRooms)) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {hostName.charAt(0).toUpperCase() || 'H'}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>Xin chào, {hostName} 👋</Text>
              <Text style={styles.dateText}>{today}</Text>
            </View>
          </View>
          <View style={styles.hotelBadge}>
            <Ionicons name="business-outline" size={14} color="#2563EB" />
            <Text style={styles.hotelBadgeText}>{hotelCount} KS</Text>
          </View>
        </View>

        {/* ── STATS GRID ── */}
        <View style={styles.statsGrid}>
          {/* Booking hôm nay */}
          <View style={[styles.statCard, { backgroundColor: '#2563EB' }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="calendar" size={20} color="#FFF" />
            </View>
            <Text style={styles.statValueLight}>{stats.bookingsToday}</Text>
            <Text style={styles.statLabelLight}>Booking hôm nay</Text>
          </View>

          {/* Doanh thu tháng */}
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="wallet" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{fmt(stats.revenueThisMonth)}</Text>
            <Text style={styles.statLabel}>Doanh thu tháng</Text>
          </View>

          {/* Phòng trống */}
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="key" size={20} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>{stats.emptyRooms}</Text>
            <Text style={styles.statLabel}>Phòng trống</Text>
          </View>

          {/* Đang có khách */}
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF9C3' }]}>
              <Ionicons name="bed" size={20} color="#CA8A04" />
            </View>
            <Text style={styles.statValue}>{stats.occupiedRooms}</Text>
            <Text style={styles.statLabel}>Đang có khách</Text>
          </View>
        </View>

        {/* ── OCCUPANCY BAR ── */}
        {stats.emptyRooms + stats.occupiedRooms > 0 && (
          <View style={styles.occupancyCard}>
            <View style={styles.occupancyRow}>
              <Text style={styles.occupancyTitle}>Tỉ lệ lấp đầy</Text>
              <Text style={styles.occupancyRate}>{occupancyRate}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${occupancyRate}%` }]} />
            </View>
            <Text style={styles.occupancySub}>
              {stats.occupiedRooms} / {stats.emptyRooms + stats.occupiedRooms} phòng đang có khách
            </Text>
          </View>
        )}

        {/* ── RECENT BOOKINGS ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Booking mới nhất</Text>
            <TouchableOpacity onPress={() => router.push('/owner/bookings' as any)}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {recentBookings.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>Chưa có đơn đặt phòng nào</Text>
            </View>
          ) : (
            recentBookings.map((b, idx) => {
              const st = STATUS_MAP[b.status] ?? {
                label: b.status, color: '#6B7280', bg: '#F3F4F6'
              };
              return (
                <View
                  key={b.id}
                  style={[
                    styles.bookingRow,
                    idx < recentBookings.length - 1 && styles.bookingBorder,
                  ]}
                >
                  <View style={styles.bookingLeft}>
                    <Text style={styles.bookingRoom} numberOfLines={1}>
                      {b.hotelName || b.roomName || 'Phòng'}
                    </Text>
                    <Text style={styles.bookingDates}>
                      {fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)}
                    </Text>
                  </View>
                  <View style={styles.bookingRight}>
                    <Text style={styles.bookingPrice}>
                      {fmt(b.finalPrice ?? b.totalPrice)}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  center:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content:  { padding: 16, paddingBottom: 100 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  greeting: { fontSize: 16, fontWeight: '700', color: '#111827' },
  dateText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  hotelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  hotelBadgeText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  statValueLight: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  statLabelLight: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '500' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4, fontWeight: '500' },

  // Occupancy
  occupancyCard: {
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
  occupancyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  occupancyTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  occupancyRate:  { fontSize: 18, fontWeight: '800', color: '#7C3AED' },
  progressBg: {
    height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: '#7C3AED', borderRadius: 4,
  },
  occupancySub: { fontSize: 12, color: '#6B7280', marginTop: 8 },

  // Section card
  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  seeAll:       { fontSize: 14, fontWeight: '600', color: '#2563EB' },

  // Booking rows
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  bookingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bookingLeft:  { flex: 1, marginRight: 8 },
  bookingRoom:  { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  bookingDates: { fontSize: 13, color: '#6B7280' },
  bookingRight: { alignItems: 'flex-end' },
  bookingPrice: { fontSize: 14, fontWeight: 'bold', color: '#2563EB', marginBottom: 6 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, overflow: 'hidden',
  },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 10 },
});