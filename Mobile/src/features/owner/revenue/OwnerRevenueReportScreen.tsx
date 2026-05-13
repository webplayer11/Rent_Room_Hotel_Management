import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../../shared/components/AppCard';
import { AppButton } from '../../../shared/components/AppButton';
import { colors } from '../../../shared/constants/colors';
import { revenueReportMockData } from '../data/ownerMockData';
import type { RevenueTimeFilter } from '../types/ownerTypes';

export function OwnerRevenueReportScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<RevenueTimeFilter>('this_month');

  const {
    netRevenue,
    totalBookings,
    completedBookings,
    occupancyRate,
    periodComparison,
    breakdown,
    revenue7Days,
    hotelSummaries,
    insights,
  } = revenueReportMockData;

  const filters: { key: RevenueTimeFilter; label: string }[] = [
    { key: '7_days', label: '7 ngày' },
    { key: '30_days', label: '30 ngày' },
    { key: 'this_month', label: 'Tháng này' },
    { key: 'last_month', label: 'Tháng trước' },
    { key: 'custom', label: 'Tùy chỉnh' },
  ];

  function handleFilterPress(key: RevenueTimeFilter) {
    if (key === 'custom') {
      Alert.alert(
        'Tùy chỉnh thời gian',
        'Tính năng chọn khoảng ngày sẽ được xử lý khi nối backend.'
      );
    } else {
      setActiveFilter(key);
      // TODO (Backend Integration): Gọi API lấy báo cáo theo khoảng thời gian tương ứng
      // - '7_days': doanh thu 7 ngày gần nhất
      // - '30_days': doanh thu 30 ngày gần nhất
      // - 'this_month': từ đầu tháng đến nay
      // - 'last_month': doanh thu tháng trước
    }
  }

  function handleExport(type: 'pdf' | 'excel') {
    Alert.alert(
      'Xuất báo cáo',
      `Tính năng xuất ${type.toUpperCase()} sẽ được xử lý khi nối backend.`
    );
  }

  const isTrendPositive = periodComparison >= 0;
  
  // Find max value in 7 days for bar chart relative height
  const maxRevenue = Math.max(...revenue7Days.map((d) => d.value));
  
  // Find max hotel revenue for progress bar relative width
  const maxHotelRevenue = Math.max(...hotelSummaries.map(h => parseFloat(h.netRevenue.replace('M', '')) || 0), 1);

  const activeTab = 'reports';

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Báo cáo doanh thu</Text>
          <Text style={styles.headerSubtitle}>
            Theo dõi doanh thu, đơn đặt phòng và hiệu suất khách sạn.
          </Text>
        </View>

        {/* ===== TIME FILTER ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => handleFilterPress(f.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ===== KPI 2x2 GRID ===== */}
        <View style={styles.kpiGrid}>
          <AppCard style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="wallet-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.kpiLabel}>Doanh thu Owner</Text>
            <Text style={[styles.kpiValue, { color: colors.primary }]}>{netRevenue}</Text>
            <Text style={styles.kpiSubText}>Sau khi trừ hoa hồng</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="documents-outline" size={18} color="#4B5563" />
            </View>
            <Text style={styles.kpiLabel}>Tổng đơn</Text>
            <Text style={styles.kpiValue}>{totalBookings}</Text>
            <Text style={styles.kpiSubText}>Trong kỳ hiện tại</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-done-outline" size={18} color={colors.success} />
            </View>
            <Text style={styles.kpiLabel}>Đơn hoàn tất</Text>
            <Text style={styles.kpiValue}>{completedBookings}</Text>
            <Text style={styles.kpiSubText}>Đã check-out</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="bed-outline" size={18} color="#B45309" />
            </View>
            <Text style={styles.kpiLabel}>Tỷ lệ lấp đầy</Text>
            <Text style={styles.kpiValue}>{occupancyRate}</Text>
            <Text style={styles.kpiSubText}>Tổng phòng đã bán</Text>
          </AppCard>
        </View>

        {/* ===== PERIOD COMPARISON ===== */}
        <AppCard style={styles.trendCard}>
          <View style={styles.trendInfo}>
            <Text style={styles.trendTitle}>Doanh thu kỳ này so với kỳ trước:</Text>
            <View style={[styles.trendBadge, isTrendPositive ? styles.trendBadgePos : styles.trendBadgeNeg]}>
              <Ionicons
                name={isTrendPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={isTrendPositive ? colors.success : colors.danger}
              />
              <Text style={[styles.trendText, { color: isTrendPositive ? colors.success : colors.danger }]}>
                {isTrendPositive ? '+' : ''}{periodComparison}%
              </Text>
            </View>
          </View>
        </AppCard>

        {/* ===== REVENUE BREAKDOWN ===== */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cơ cấu doanh thu</Text>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Giá gốc:</Text>
            <Text style={styles.breakdownValue}>{breakdown.grossRevenue}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Voucher / Giảm giá:</Text>
            <Text style={[styles.breakdownValue, { color: colors.danger }]}>{breakdown.vouchers}</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Tiền khách trả:</Text>
            <Text style={[styles.breakdownValue, { fontWeight: '700' }]}>{breakdown.paidAmount}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Hoa hồng hệ thống ({breakdown.commissionRate}%):</Text>
            <Text style={[styles.breakdownValue, { color: colors.danger }]}>{breakdown.commissionAmount}</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.primaryDark, fontWeight: '700' }]}>
              Owner thực nhận:
            </Text>
            <Text style={[styles.breakdownValue, { color: colors.primary, fontWeight: '700', fontSize: 16 }]}>
              {breakdown.netRevenue}
            </Text>
          </View>
          
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              Owner thực nhận = Tiền khách trả - Hoa hồng hệ thống
            </Text>
          </View>
        </AppCard>

        {/* ===== 7-DAY REVENUE CHART ===== */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Doanh thu 7 ngày gần nhất (Triệu VNĐ)</Text>
          <View style={styles.chartContainer}>
            {revenue7Days.map((d, index) => {
              const heightPercent = maxRevenue > 0 ? (d.value / maxRevenue) * 100 : 0;
              const isMax = d.value === maxRevenue;
              return (
                <View key={index} style={styles.barCol}>
                  <Text style={styles.barValue}>{d.value}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPercent}%` },
                        isMax && { backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{d.label}</Text>
                </View>
              );
            })}
          </View>
        </AppCard>

        {/* ===== REVENUE BY HOTEL ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Doanh thu theo khách sạn</Text>
          {hotelSummaries.map((h) => {
            const progressVal = parseFloat(h.netRevenue.replace('M', '')) || 0;
            const progressPercent = (progressVal / maxHotelRevenue) * 100;
            
            return (
              <AppCard key={h.id} style={styles.hotelRow}>
                <View style={styles.hotelRowTop}>
                  <Text style={styles.hotelName}>{h.name}</Text>
                  <Text style={styles.hotelRevenue}>{h.netRevenue}</Text>
                </View>
                <View style={styles.hotelStats}>
                  <Text style={styles.hotelStatText}>{h.bookings} đơn</Text>
                  <Text style={styles.hotelStatText}>Lấp đầy {h.occupancyRate}%</Text>
                  {h.trend !== undefined && (
                    <Text style={[styles.hotelStatText, { color: h.trend >= 0 ? colors.success : colors.danger }]}>
                      {h.trend >= 0 ? '↑' : '↓'} {Math.abs(h.trend)}%
                    </Text>
                  )}
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
              </AppCard>
            );
          })}
        </View>

        {/* ===== BUSINESS INSIGHTS & WARNINGS ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Cảnh báo & Gợi ý</Text>
          {insights.map((insight) => {
            let bgColor = '#F3F4F6';
            let iconColor = '#4B5563';
            let iconName: keyof typeof Ionicons.glyphMap = 'information-circle';
            
            if (insight.type === 'warning') {
              bgColor = '#FEF3C7';
              iconColor = '#B45309';
              iconName = 'warning';
            } else if (insight.type === 'danger') {
              bgColor = '#FEE2E2';
              iconColor = colors.danger;
              iconName = 'alert-circle';
            } else if (insight.type === 'success') {
              bgColor = '#DCFCE7';
              iconColor = colors.success;
              iconName = 'checkmark-circle';
            } else if (insight.type === 'info') {
              bgColor = '#DBEAFE';
              iconColor = colors.primary;
            }

            return (
              <View key={insight.id} style={[styles.insightRow, { backgroundColor: bgColor }]}>
                <Ionicons name={iconName} size={20} color={iconColor} style={styles.insightIcon} />
                <Text style={styles.insightText}>{insight.message}</Text>
              </View>
            );
          })}
        </View>

        {/* ===== EXPORT OPTIONS ===== */}
        <View style={styles.exportRow}>
          <AppButton
            title="Xuất PDF"
            variant="outline"
            style={styles.exportBtn}
            onPress={() => handleExport('pdf')}
          />
          <AppButton
            title="Xuất Excel"
            variant="outline"
            style={styles.exportBtn}
            onPress={() => handleExport('excel')}
          />
        </View>

        {/* ===== BUSINESS NOTE ===== */}
        <View style={styles.noteBox}>
          <Ionicons name="bulb-outline" size={16} color={colors.muted} />
          <Text style={styles.noteText}>
            Doanh thu chỉ tính từ các đơn đã xác nhận, đã check-in hoặc đã check-out. Các đơn bị hủy hoặc bị từ chối không được tính vào doanh thu.
          </Text>
        </View>
      </ScrollView>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <View style={styles.bottomNav}>
        {([
          { key: 'home', icon: 'home' as const, label: 'Trang chủ', route: '/owner' },
          { key: 'hotels', icon: 'business' as const, label: 'Khách sạn', route: '/owner/hotels' },
          { key: 'bookings', icon: 'document-text' as const, label: 'Đơn đặt', route: '/owner/bookings' },
          { key: 'reports', icon: 'bar-chart' as const, label: 'Báo cáo', route: '/owner/reports' },
        ]).map((tab) => {
          const isActive = activeTab === tab.key;
          const iconName: keyof typeof Ionicons.glyphMap = isActive
            ? tab.icon
            : (`${tab.icon}-outline` as keyof typeof Ionicons.glyphMap);
          return (
            <Pressable
              key={tab.key}
              style={styles.navTab}
              onPress={() => {
                if (!isActive) {
                  router.replace(tab.route as any);
                }
              }}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isActive ? colors.primary : colors.muted}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.navIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 52,
    paddingBottom: 40,
  },

  // ---- Header ----
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },

  // ---- Filter ----
  filterScroll: {
    marginBottom: 16,
  },
  filterContainer: {
    gap: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.textLight,
    fontWeight: '600',
  },

  // ---- KPI Grid ----
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flexBasis: '48%',
    padding: 14,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  kpiSubText: {
    fontSize: 10,
    color: colors.muted,
  },

  // ---- Trend ----
  trendCard: {
    marginBottom: 16,
  },
  trendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendTitle: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendBadgePos: {
    backgroundColor: '#DCFCE7',
  },
  trendBadgeNeg: {
    backgroundColor: '#FEE2E2',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ---- Section Generic ----
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },

  // ---- Breakdown ----
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.text,
  },
  breakdownValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  formulaBox: {
    marginTop: 12,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
  },
  formulaText: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
  },

  // ---- Chart ----
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    marginTop: 10,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 4,
  },
  barTrack: {
    width: 24,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  barFill: {
    width: '100%',
    backgroundColor: '#93C5FD',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },

  // ---- Hotel List ----
  hotelRow: {
    marginBottom: 10,
    padding: 14,
  },
  hotelRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  hotelName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  hotelRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  hotelStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  hotelStatText: {
    fontSize: 12,
    color: colors.muted,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  // ---- Insights ----
  insightRow: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  insightIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },

  // ---- Export ----
  exportRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  exportBtn: {
    flex: 1,
  },

  // ---- Note ----
  noteBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
  },

  // ---- Bottom Nav ----
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
    paddingTop: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 2,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  navIndicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
});
