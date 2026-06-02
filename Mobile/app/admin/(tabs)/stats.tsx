import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { adminApi } from '../../../src/shared/api/adminApi';
import { BookingDto } from '../../../src/shared/api/bookingApi';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, Calendar, BarChart2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Lấy % tăng trưởng (tránh chia cho 0)
const calculateGrowth = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Định dạng tiền VNĐ
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function AdminStatsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<BookingDto[]>([]);

  const fetchData = async () => {
    try {
      const bookingsRes = await adminApi.getAllBookings();
      if (bookingsRes.isSuccess && bookingsRes.data) {
        setBookings(bookingsRes.data as unknown as BookingDto[]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang phân tích dữ liệu...</Text>
      </View>
    );
  }

  // Tiền xử lý dữ liệu doanh thu
  const checkoutBookings = bookings.filter(b => b.status === 'CheckedOut');
  const adminCommissionRate = 0.1;

  const getRevenue = (booking: BookingDto) => {
    const amount = booking.finalPrice ?? booking.totalPrice ?? 0;
    return amount * adminCommissionRate;
  };

  const totalAdminRevenue = checkoutBookings.reduce((sum, b) => sum + getRevenue(b), 0);
  const totalCheckoutOrders = checkoutBookings.length;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let todayRevenue = 0;
  let yesterdayRevenue = 0;
  let thisMonthRevenue = 0;
  let lastMonthRevenue = 0;
  let thisYearRevenue = 0;

  // Doanh thu 7 ngày gần nhất
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const revenue7Days = new Array(7).fill(0);

  // Doanh thu 12 tháng
  const revenue12Months = new Array(12).fill(0);

  checkoutBookings.forEach(b => {
    const date = b.createdAt ? new Date(b.createdAt) : new Date(b.checkOutDate);
    if (isNaN(date.getTime())) return;

    const dateStr = date.toISOString().split('T')[0];
    const month = date.getMonth();
    const year = date.getFullYear();
    const revenue = getRevenue(b);

    if (dateStr === todayStr) todayRevenue += revenue;
    if (dateStr === yesterdayStr) yesterdayRevenue += revenue;

    if (year === currentYear) {
      thisYearRevenue += revenue;
      if (month === currentMonth) thisMonthRevenue += revenue;
      if (month === currentMonth - 1 || (currentMonth === 0 && month === 11 && year === currentYear - 1)) {
        lastMonthRevenue += revenue;
      }
      revenue12Months[month] += revenue;
    }

    const dayIndex = last7Days.indexOf(dateStr);
    if (dayIndex !== -1) {
      revenue7Days[dayIndex] += revenue;
    }
  });

  const dailyGrowth = calculateGrowth(todayRevenue, yesterdayRevenue);
  const monthlyGrowth = calculateGrowth(thisMonthRevenue, lastMonthRevenue);

  const monthLabels = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
  const dayLabels = last7Days.map(d => d.split('-')[2] + '/' + d.split('-')[1]);

  // Biểu đồ tăng trưởng (So với tháng trước)
  const growth12Months = revenue12Months.map((rev, idx) => {
    if (idx === 0) return 0; // Tháng 1 không so sánh với tháng 12 năm trước cho đơn giản
    return calculateGrowth(rev, revenue12Months[idx - 1]);
  });

  const GrowthIndicator = ({ value, label }: { value: number, label: string }) => (
    <View style={styles.growthContainer}>
      <Text style={styles.growthLabel}>{label}: </Text>
      <View style={[styles.badge, { backgroundColor: value >= 0 ? '#DCFCE7' : '#FEE2E2' }]}>
        {value >= 0 ? <TrendingUp size={14} color="#16A34A" /> : <TrendingDown size={14} color="#DC2626" />}
        <Text style={[styles.growthValue, { color: value >= 0 ? '#16A34A' : '#DC2626' }]}>
          {Math.abs(value).toFixed(1)}%
        </Text>
      </View>
    </View>
  );

  const KpiCard = ({ title, value, icon, color }: any) => (
    <View style={styles.kpiCard}>
      <View style={[styles.iconWrapper, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <View style={styles.kpiContent}>
        <Text style={styles.kpiTitle}>{title}</Text>
        <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      </View>
    </View>
  );

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    barPercentage: 0.6,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Admin</Text>
        <Text style={styles.headerSub}>Thống kê doanh thu (Hoa hồng 10%)</Text>
      </View>

      <View style={styles.kpiGrid}>
        <KpiCard
          title="Doanh thu hôm nay"
          value={formatCurrency(todayRevenue)}
          icon={<DollarSign size={24} color="#10B981" />}
          color="#10B981"
        />
        <KpiCard
          title="Doanh thu tháng này"
          value={formatCurrency(thisMonthRevenue)}
          icon={<Calendar size={24} color="#3B82F6" />}
          color="#3B82F6"
        />
        <KpiCard
          title="Doanh thu năm nay"
          value={formatCurrency(thisYearRevenue)}
          icon={<BarChart2 size={24} color="#8B5CF6" />}
          color="#8B5CF6"
        />
        <KpiCard
          title="Tổng doanh thu"
          value={formatCurrency(totalAdminRevenue)}
          icon={<DollarSign size={24} color="#F59E0B" />}
          color="#F59E0B"
        />
        <KpiCard
          title="Tổng đơn đã Checkout"
          value={totalCheckoutOrders.toString()}
          icon={<CheckCircle size={24} color="#14B8A6" />}
          color="#14B8A6"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chỉ số tăng trưởng</Text>
        <View style={styles.growthRow}>
          <GrowthIndicator value={dailyGrowth} label="Hôm nay vs Hôm qua" />
          <GrowthIndicator value={monthlyGrowth} label="Tháng này vs Tháng trước" />
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Doanh thu 7 ngày gần nhất (VNĐ)</Text>
        <BarChart
          data={{
            labels: dayLabels,
            datasets: [{ data: revenue7Days }]
          }}
          width={width - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Doanh thu 12 tháng năm {currentYear} (VNĐ)</Text>
        <BarChart
          data={{
            labels: monthLabels,
            datasets: [{ data: revenue12Months }]
          }}
          width={width - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})` }}
          style={styles.chart}
        />
      </View>

      <View style={[styles.chartCard, { marginBottom: 40 }]}>
        <Text style={styles.chartTitle}>Tăng trưởng doanh thu theo tháng (%)</Text>
        <BarChart
          data={{
            labels: monthLabels.slice(1),
            datasets: [{ data: growth12Months.slice(1) }]
          }}
          width={width - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  kpiContent: {
    flex: 1,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  growthRow: {
    flexDirection: 'column',
    gap: 12,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
  },
  growthLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  growthValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
  },
});
