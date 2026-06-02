import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import { tokenStorage } from '../../../src/shared/storage/tokenStorage';
import { useFocusEffect } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsTab() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lastScaleRef = useRef(1);
  const lastDistanceRef = useRef(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const accessToken = await tokenStorage.getAccessToken();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
      const currentYear = new Date().getFullYear();

      const [statsRes, chartRes] = await Promise.all([
        axios.get(`${apiUrl}/api/hosts/revenue/dashboard`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`${apiUrl}/api/hosts/revenue/chart?year=${currentYear}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      ]);

      if (statsRes.data?.isSuccess) {
        setStats(statsRes.data.data);
      }

      if (chartRes.data?.isSuccess) {
        setChartData(chartRes.data.data);
      }
    } catch (error) {
      console.log('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Calculate distance between two touch points
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        return evt.nativeEvent.touches.length === 2;
      },
      onMoveShouldSetPanResponder: (evt) => {
        return evt.nativeEvent.touches.length === 2;
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const distance = getDistance(
            touches[0].pageX,
            touches[0].pageY,
            touches[1].pageX,
            touches[1].pageY
          );

          if (lastDistanceRef.current > 0) {
            const newScale = Math.max(
              1,
              Math.min(3, lastScaleRef.current * (distance / lastDistanceRef.current))
            );
            setScale(newScale);
            scaleAnim.setValue(newScale);
          }
          lastDistanceRef.current = distance;
        }
      },
      onPanResponderRelease: () => {
        lastDistanceRef.current = 0;
        lastScaleRef.current = scale;
      },
    })
  ).current;

  const getChartConfig = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Fill the empty months with 0
    let fullYearData = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, revenue: 0 }));

    chartData.forEach(d => {
      if (d.month >= 1 && d.month <= 12) {
        fullYearData[d.month - 1].revenue = d.revenue;
      }
    });

    const labels = fullYearData.map(d => monthNames[d.month - 1]);
    const dData = fullYearData.map(d => d.revenue);

    return {
      labels: labels,
      datasets: [
        {
          data: dData,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  const chartWidth = (screenWidth - 64) * scale;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống kê & Doanh thu</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Doanh thu tháng này</Text>
                <Text style={styles.statValue}>
                  {stats?.revenueThisMonth ? stats.revenueThisMonth.toLocaleString('vi-VN') : '0'} đ
                </Text>
              </View>
              <View style={styles.statCardRow}>
                <View style={[styles.statCard, { flex: 1, marginRight: 8, marginBottom: 0 }]}>
                  <Text style={styles.statLabel}>Phòng có khách</Text>
                  <Text style={styles.statValue}>{stats?.occupiedRooms || 0}</Text>
                </View>
                <View style={[styles.statCard, { flex: 1, marginLeft: 8, marginBottom: 0 }]}>
                  <Text style={styles.statLabel}>Đơn đặt h.nay</Text>
                  <Text style={styles.statValue}>{stats?.bookingsToday || 0}</Text>
                </View>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Tăng trưởng doanh thu {new Date().getFullYear()}</Text>
              <LineChart
                data={getChartConfig()}
                width={screenWidth - 64}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#2563EB"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  paddingRight: 32, // fix chart clipping
                }}
                formatYLabel={(val) => {
                  const num = Number(val);
                  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
                  return val;
                }}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  statsContainer: { marginBottom: 24 },
  statCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0
  },
  statLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4, fontWeight: '500' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  chartContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    alignItems: 'center'
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    alignSelf: 'flex-start'
  }
});
