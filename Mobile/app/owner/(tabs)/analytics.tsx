import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import {
  hostApi,
  HostRevenueDto,
} from '../../../src/shared/api/hostApi';

export default function AnalyticsTab() {
  const [data, setData] = useState<HostRevenueDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ================= LOAD DATA =================
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await hostApi.getMyRevenue();
      const result = (res as any)?.data ?? res;
      setData(result);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tải được thống kê',
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0);

  // ================= LOADING =================
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê doanh thu</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!data ? (
          <Text style={styles.empty}>Không có dữ liệu</Text>
        ) : (
          <>
            {/* TOTAL */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Tổng doanh thu</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.totalRevenue)}
              </Text>
            </View>

            {/* STATS */}
            <View style={styles.row}>
              <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.statLabel}>Booking</Text>
                <Text style={[styles.statValue, { color: '#2563EB' }]}>
                  {data.totalBookings}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
                <Text style={styles.statLabel}>Hoàn thành</Text>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {data.completedBookings}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
                <Text style={styles.statLabel}>Huỷ</Text>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>
                  {data.cancelledBookings}
                </Text>
              </View>
            </View>

            {/* HOTELS */}
            <Text style={styles.sectionTitle}>🏨 Khách sạn của bạn</Text>
            <Text style={styles.hint}>
              Nhấn vào khách sạn để xem chi tiết
            </Text>

            {data.byHotel && data.byHotel.length > 0 ? (
              data.byHotel.map((item) => (
                <TouchableOpacity
                  key={item.hotelId}
                  style={styles.hotelCard}
                  activeOpacity={0.7}
                  
                  onPress={() =>
                    router.push(`/owner/hotel-revenue/${item.hotelId}`)
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hotelName}>
                      {item.hotelName || 'Khách sạn'}
                    </Text>
                    <Text style={styles.hotelSub}>
                      Booking: {item.bookingCount}
                    </Text>
                  </View>

                  <View style={styles.hotelRight}>
                    <Text style={styles.money}>
                      {formatCurrency(item.revenue)}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.empty}>Chưa có khách sạn nào</Text>
            )}

            {/* MONTH */}
            {data.byMonth?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📅 Theo tháng</Text>
                {data.byMonth.map((item, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.period}>{item.period}</Text>
                    <Text style={styles.money}>
                      {formatCurrency(item.revenue)}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* YEAR */}
            {data.byYear?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📆 Theo năm</Text>
                {data.byYear.map((item, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.period}>{item.period}</Text>
                    <Text style={styles.money}>
                      {formatCurrency(item.revenue)}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= STYLE =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },

  content: { padding: 15, paddingBottom: 40 },

  totalCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },
  totalLabel: { color: '#6B7280', fontSize: 13 },
  totalValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 6,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statValue: { fontSize: 18, fontWeight: 'bold' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },

  hint: { fontSize: 12, color: '#9CA3AF', marginBottom: 10 },

  hotelCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  hotelName: { fontSize: 15, fontWeight: '600' },
  hotelSub: { fontSize: 12, color: '#6B7280' },

  hotelRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  listItem: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  period: { color: '#6B7280' },
  money: { color: '#2563EB', fontWeight: 'bold' },

  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6B7280',
  },
});