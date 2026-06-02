import React, { useState, useCallback, useEffect } from 'react';
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
import { useLocalSearchParams, router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import { hostApi, HotelRevenueDetailDto } from '../../../src/shared/api/hostApi';

export default function HotelRevenueDetailScreen() {
  const { hotelId } = useLocalSearchParams<{ hotelId: string }>();
  const [data, setData] = useState<HotelRevenueDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!hotelId) return;
    try {
      setLoading(true);
      setError('');
      const res = await hostApi.getHotelRevenue(hotelId);
      const result = (res as any)?.data ?? res;
      setData(result);
    } catch (e) {
      setError('Không tải được chi tiết doanh thu');
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tải được chi tiết doanh thu khách sạn',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hotelId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [hotelId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {data?.hotelName || 'Chi tiết doanh thu'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
      >
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : data ? (
          <>
            {/* OVERVIEW */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tổng doanh thu</Text>
              <Text style={styles.cardValueSuccess}>{formatCurrency(data.totalRevenue)}</Text>
            </View>

            <View style={styles.row}>
              <View style={[styles.card, { flex: 1, marginRight: 4, backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.cardLabel}>Booking</Text>
                <Text style={styles.cardValueBlue}>{data.totalBookings}</Text>
              </View>

              <View style={[styles.card, { flex: 1, marginHorizontal: 4, backgroundColor: '#ECFDF5' }]}>
                <Text style={styles.cardLabel}>Hoàn thành</Text>
                <Text style={styles.cardValueGreen}>{data.completedBookings}</Text>
              </View>

              <View style={[styles.card, { flex: 1, marginLeft: 4, backgroundColor: '#FEF2F2' }]}>
                <Text style={styles.cardLabel}>Huỷ</Text>
                <Text style={styles.cardValueRed}>{data.cancelledBookings}</Text>
              </View>
            </View>

            {/* FINANCIAL */}
            <Text style={styles.sectionTitle}>💰 Chi tiết tài chính</Text>
            <View style={styles.financialCard}>
              <View style={styles.finRow}>
                <Text style={styles.finLabel}>Doanh thu</Text>
                <Text style={styles.finValue}>{formatCurrency(data.totalRevenue)}</Text>
              </View>
              <View style={styles.finRow}>
                <Text style={styles.finLabel}>Hoa hồng (Commission)</Text>
                <Text style={[styles.finValue, { color: '#EF4444' }]}>
                  - {formatCurrency(data.commission)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.finRow}>
                <Text style={styles.finLabelBold}>Thực nhận (Net Revenue)</Text>
                <Text style={styles.finValueBold}>{formatCurrency(data.netRevenue)}</Text>
              </View>
            </View>

            {/* MONTH */}
            <Text style={styles.sectionTitle}>📅 Theo tháng</Text>
            {data.byMonth?.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.itemTitle}>Tháng {item.period}</Text>
                <Text style={styles.money}>{formatCurrency(item.revenue)}</Text>
              </View>
            ))}

            {/* YEAR */}
            <Text style={styles.sectionTitle}>📅 Theo năm</Text>
            {data.byYear?.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.itemTitle}>Năm {item.period}</Text>
                <Text style={styles.money}>{formatCurrency(item.revenue)}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', flex: 1, textAlign: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 20 },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  cardValueSuccess: { fontSize: 28, fontWeight: 'bold', color: '#10B981' },
  cardLabel: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  cardValueBlue: { fontSize: 20, fontWeight: 'bold', color: '#2563EB' },
  cardValueGreen: { fontSize: 20, fontWeight: 'bold', color: '#10B981' },
  cardValueRed: { fontSize: 20, fontWeight: 'bold', color: '#EF4444' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12, marginTop: 8 },
  listItem: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemTitle: { fontSize: 16, fontWeight: '500', color: '#374151' },
  money: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  financialCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  finRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  finLabel: { fontSize: 14, color: '#4B5563' },
  finValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  finLabelBold: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  finValueBold: { fontSize: 18, fontWeight: 'bold', color: '#10B981' },
});
