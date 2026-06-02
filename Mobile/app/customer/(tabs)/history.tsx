import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookingApi, BookingDto } from '../../../src/shared/api/bookingApi';

type Tab = 'Upcoming' | 'Completed' | 'Cancelled';

const HistoryScreen = () => {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Upcoming');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings();
      if (res.isSuccess && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Khi quay lại từ detail sau khi hủy → chuyển tab + reload
  useEffect(() => {
    if (tab === 'Cancelled' || tab === 'Upcoming' || tab === 'Completed') {
      setActiveTab(tab as Tab);
      loadData();
    }
  }, [tab]);

  const isPastCheckOut = (dateStr: string) => {
    try {
      const checkOut = parseISO(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return checkOut < today;
    } catch {
      return false;
    }
  };

  const isUpcoming = (b: BookingDto) => 
    (b.status === 'Pending' || b.status === 'Confirmed') && !isPastCheckOut(b.checkOutDate);

  const isCompleted = (b: BookingDto) => 
    b.status === 'Completed' || b.status === 'CheckedOut' || b.status === 'CheckedIn' || 
    ((b.status === 'Pending' || b.status === 'Confirmed') && isPastCheckOut(b.checkOutDate));

  const isCancelled = (b: BookingDto) => 
    b.status === 'Cancelled' || b.status === 'Rejected';

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Upcoming') return isUpcoming(b);
    if (activeTab === 'Completed') return isCompleted(b);
    if (activeTab === 'Cancelled') return isCancelled(b);
    return false;
  });

  const countOf = (tab: Tab) => bookings.filter(b => {
    if (tab === 'Upcoming') return isUpcoming(b);
    if (tab === 'Completed') return isCompleted(b);
    if (tab === 'Cancelled') return isCancelled(b);
    return false;
  }).length;

  const getStatusText = (status: string) => {
    switch(status) {
      case 'Pending': return 'Chờ duyệt';
      case 'Confirmed': return 'Đã xác nhận';
      case 'CheckedIn': return 'Đang lưu trú';
      case 'CheckedOut': return 'Đã trả phòng';
      case 'Completed': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      case 'Rejected': return 'Bị từ chối';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return '#F59E0B';
      case 'Confirmed': return '#3B82F6';
      case 'CheckedIn': return '#10B981';
      case 'CheckedOut': return '#6B7280';
      case 'Completed': return '#10B981';
      case 'Cancelled': 
      case 'Rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderHistoryItem = ({ item }: { item: BookingDto }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => router.push({ pathname: '/customer/booking/detail' as any, params: { bookingId: item.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.hotelName} numberOfLines={1}>{item.hotelName || 'Khách sạn'}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}1A` }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.roomName}>{item.roomName || 'Phòng'}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.infoText}>
            {format(parseISO(item.checkInDate), 'dd/MM/yyyy')} - {format(parseISO(item.checkOutDate), 'dd/MM/yyyy')}
          </Text>
        </View>

        {item.bookingCode && (
          <View style={styles.infoRow}>
            <Ionicons name="barcode-outline" size={14} color="#666" />
            <Text style={styles.infoText}>Mã đơn: {item.bookingCode}</Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalValue}>{(item.finalPrice ?? item.totalPrice)?.toLocaleString('vi-VN')} ₫</Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({ pathname: '/customer/booking/detail' as any, params: { bookingId: item.id } })}
        >
          <Text style={styles.actionButtonText}>Xem chi tiết </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn đặt của tôi</Text>
      </View>

      <View style={styles.tabBar}>
        {(['Upcoming', 'Completed', 'Cancelled'] as Tab[]).map((tab) => {
          const count = countOf(tab);
          const label = tab === 'Upcoming' ? 'Sắp tới' : tab === 'Completed' ? 'Hoàn thành' : 'Đã hủy';
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <View style={styles.tabInner}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, activeTab === tab && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5392F9" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={80} color="#CCC" />
              <Text style={styles.emptyText}>Bạn chưa có đơn đặt phòng nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#222' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  tabItem: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#5392F9' },
  tabInner: { flexDirection: 'row', alignItems: 'center' },
  tabBadge: { marginLeft: 6, backgroundColor: '#EEE', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  tabBadgeActive: { backgroundColor: '#5392F9' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#5392F9', fontWeight: 'bold' },
  tabBadgeText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  tabBadgeTextActive: { color: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 15 },
  historyCard: {
    backgroundColor: '#FFF', borderRadius: 12, marginBottom: 15, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  cardContent: { padding: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hotelName: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  roomName: { fontSize: 13, color: '#666', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 13, color: '#666', marginLeft: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F2F5' },
  totalLabel: { fontSize: 13, color: '#999' },
  totalValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  actionButton: { marginTop: 15, backgroundColor: '#E6F4FE', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#5392F9', fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { marginTop: 20, fontSize: 16, color: '#999' },
});

export default HistoryScreen;
