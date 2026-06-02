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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import Toast from 'react-native-toast-message';

// Icons
import {
  Calendar,
  DollarSign,
  Key,
  BedDouble,
  Building,
  PlusCircle,
  LogIn,
  LogOut,
  Users,
  LayoutGrid,
  BarChart3
} from 'lucide-react-native';

import { hotelApi, HotelDto } from '../../../src/shared/api/hotelApi';
import { bookingApi, BookingDto } from '../../../src/shared/api/bookingApi';
import { roomApi } from '../../../src/shared/api/roomApi';
import { tokenStorage } from '../../../src/shared/storage/tokenStorage';
import { apiFetch } from '../../../src/shared/api/apiClient';
const { width } = Dimensions.get('window');

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  Pending: { label: 'Chờ xác nhận', color: '#D97706', bg: '#FEF3C7' },
  Confirmed: { label: 'Đã xác nhận', color: '#2563EB', bg: '#DBEAFE' },
  CheckedIn: { label: 'Đang ở', color: '#7C3AED', bg: '#EDE9FE' },
  CheckedOut: { label: 'Đã trả phòng', color: '#16A34A', bg: '#DCFCE7' },
  Completed: { label: 'Hoàn thành', color: '#16A34A', bg: '#DCFCE7' },
  Cancelled: { label: 'Đã hủy', color: '#DC2626', bg: '#FEE2E2' },
  Rejected: { label: 'Từ chối', color: '#DC2626', bg: '#FEE2E2' },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
};

export default function OwnerHome() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [hostName, setHostName] = useState('');
  const [hotels, setHotels] = useState<HotelDto[]>([]);

  // Stats
  const [bookingsToday, setBookingsToday] = useState(0);
  const [revenueThisMonth, setRevenueThisMonth] = useState(0);
  const [emptyRooms, setEmptyRooms] = useState(0);
  const [occupiedRooms, setOccupiedRooms] = useState(0);

  const [recentBookings, setRecentBookings] = useState<BookingDto[]>([]);

  const formatDateKey = (date?: string) => {
  if (!date) return '';

  return new Date(date).toLocaleDateString('sv-SE');
  }
  const todayISO = new Date().toLocaleDateString('sv-SE');

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
        } catch { }
      }
      setHostName(name || 'Chủ khách sạn');

      // 2. Fetch Data (Hotels, Bookings)
      const [hotelsRes, bookingsRes] = await Promise.all([
        hotelApi.getMyHotels(),
        bookingApi.getHostBookings()
      ]);

      let myHotels: HotelDto[] = [];
      if (hotelsRes.isSuccess && hotelsRes.data) {
        myHotels = hotelsRes.data;
        setHotels(myHotels);
      }

      let allBookings: BookingDto[] = [];
      if (bookingsRes.isSuccess && bookingsRes.data) {
        allBookings = bookingsRes.data;
      }

      // 3. Fetch Rooms for all hotels
      let totalRoomsCount = 0;
      const roomsPromises = myHotels.map(h => roomApi.getRoomsByHotelId(h.id));
      const roomsResults = await Promise.allSettled(roomsPromises);

      roomsResults.forEach(res => {
        if (res.status === 'fulfilled' && res.value.isSuccess && res.value.data) {
          totalRoomsCount += res.value.data.length;
        }
      });

      // 4. Calculate Stats
    
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const todayISO = now.toISOString().split('T')[0];

      let todayCount = 0;
      let monthRevenue = 0;
      const occupiedRoomIds = new Set<string>();

      allBookings.forEach(b => {
  const createdAtISO = formatDateKey(b.createdAt);

  if (createdAtISO === todayISO) {
    todayCount++;
  }

  if (b.status === 'CheckedOut' || b.status === 'Completed') {
    const outDate = new Date(b.checkOutDate);

    if (
      outDate.getFullYear() === currentYear &&
      outDate.getMonth() === currentMonth
    ) {
      monthRevenue += b.finalPrice ?? b.totalPrice ?? 0;
    }
  }

  if (b.status === 'CheckedIn') {
    occupiedRoomIds.add(b.roomId);
  } else if (b.status !== 'Cancelled' && b.status !== 'Rejected') {
    const inDate = formatDateKey(b.checkInDate);
    const outDate = formatDateKey(b.checkOutDate);

    if (todayISO >= inDate && todayISO < outDate) {
      occupiedRoomIds.add(b.roomId);
    }
  }
});

      setBookingsToday(todayCount);
      setRevenueThisMonth(monthRevenue);
      setOccupiedRooms(occupiedRoomIds.size);

      const empty = totalRoomsCount - occupiedRoomIds.size;
      setEmptyRooms(empty > 0 ? empty : 0);

      // 5. Recent Bookings (top 5)
      const sorted = [...allBookings]
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
        .slice(0, 5);
      setRecentBookings(sorted);

    } catch (e) {
      console.log(e);
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

  const handleAction = (action: string) => {
    switch (action) {
      case 'add_hotel':
        router.push('/owner/hotel-form');
        break;
      case 'add_room':
        if (hotels.length === 0) {
          Toast.show({ type: 'error', text1: 'Chưa có khách sạn', text2: 'Vui lòng tạo khách sạn trước.' });
        } else if (hotels.length === 1) {
          router.push(`/owner/room-form?hotelId=${hotels[0].id}` as any);
        } else {
          Toast.show({ type: 'info', text1: 'Chọn khách sạn', text2: 'Vui lòng chọn khách sạn để thêm phòng từ danh sách.' });
          router.push('/owner/hotels' as any);
        }
        break;
      case 'create_booking':
      case 'manage_customer':
        Toast.show({ type: 'info', text1: 'Tính năng', text2: 'Tính năng đang được phát triển.' });
        break;
      case 'check_in':
      case 'check_out':
        router.push('/owner/bookings' as any);
        break;
      case 'manage_room':
        router.push('/owner/hotels' as any);
        break;
      case 'report':
        router.push('/owner/analytics' as any);
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  const QuickActionButton = ({ icon, label, onPress, color }: any) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIconWrapper, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={[styles.actionLabel, { textAlign: 'center' }]} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
       {/* ── HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Xin chào, {hostName} 👋</Text>
          <Text style={styles.dateText}>{todayISO}</Text>
        </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
       
        {/* ── STATS GRID ── */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Calendar size={20} color="#2563EB" />
              </View>
            </View>
            <Text style={styles.statValue}>{bookingsToday}</Text>
            <Text style={styles.statLabel}>Booking hôm nay</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <DollarSign size={20} color="#16A34A" />
              </View>
            </View>
            <Text style={styles.statValue}>{formatCurrency(revenueThisMonth)}</Text>
            <Text style={styles.statLabel}>Doanh thu tháng</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                <Key size={20} color="#DC2626" />
              </View>
            </View>
            <Text style={styles.statValue}>{emptyRooms}</Text>
            <Text style={styles.statLabel}>Phòng trống</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF9C3' }]}>
                <BedDouble size={20} color="#CA8A04" />
              </View>
            </View>
            <Text style={styles.statValue}>{occupiedRooms}</Text>
            <Text style={styles.statLabel}>Đang có khách</Text>
          </View>
        </View>

        {/* ── QUICK ACTIONS ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quản lý nhanh</Text>
          <View style={styles.actionGrid}>
            <QuickActionButton
              icon={<Building size={24} color="#3B82F6" />}
              color="#3B82F6" label="Thêm khách sạn" onPress={() => handleAction('add_hotel')}
            />
            <QuickActionButton
              icon={<BedDouble size={24} color="#10B981" />}
              color="#10B981" label="Thêm phòng" onPress={() => handleAction('add_room')}
            />
            <QuickActionButton
              icon={<LogIn size={24} color="#8B5CF6" />}
              color="#8B5CF6" label="Check-in" onPress={() => handleAction('check_in')}
            />
            <QuickActionButton
              icon={<LogOut size={24} color="#EC4899" />}
              color="#EC4899" label="Check-out" onPress={() => handleAction('check_out')}
            />
  
            <QuickActionButton
              icon={<BarChart3 size={24} color="#F43F5E" />}
              color="#F43F5E" label="Xem báo cáo" onPress={() => handleAction('report')}
            />
          </View>
        </View>

        {/* ── RECENT BOOKINGS ── */}
        <View style={[styles.sectionCard, { marginBottom: 40 }]}>
          <View style={[styles.sectionHeader, { marginBottom: 8 }]}>
            <Text style={styles.sectionTitle}>Booking mới nhất</Text>
            <TouchableOpacity onPress={() => router.push('/owner/bookings' as any)}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {recentBookings.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Calendar size={48} color="#E5E7EB" />
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
                    <Text style={styles.bookingGuest} numberOfLines={1}>
                      {b.roomName || 'Khách'}
                    </Text>
                    <Text style={styles.bookingDates}>
                      {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}
                    </Text>
                  </View>
                  <View style={styles.bookingRight}>
                    <Text style={styles.bookingPrice}>
                      {formatCurrency(b.finalPrice ?? b.totalPrice)}
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
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },

  // Header
  header: {
    marginBottom: 24,
    marginTop: 10,
    marginLeft:20,
  },
  greeting: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  dateText: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 16,
  },
  statCard: {
    width: (width - 40 - 16) / 2, // 40 is padding horizontal, 16 is gap
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '600' },

  // Section card
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  seeAll: { fontSize: 14, fontWeight: '700', color: '#2563EB' },

  // Quick Actions Grid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -8,
    marginTop: 20,
  },
  actionButton: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    lineHeight: 16,
    height: 32,
  },

  // Booking rows
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  bookingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bookingLeft: { flex: 1, marginRight: 12 },
  bookingGuest: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  bookingDates: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  bookingRight: { alignItems: 'flex-end' },
  bookingPrice: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, overflow: 'hidden',
  },
  badgeText: { fontSize: 11, fontWeight: '800' },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: '#94A3B8', marginTop: 12, fontWeight: '500' },
});