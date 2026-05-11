import React, { useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../shared/components/AppCard';
import { AppButton } from '../../shared/components/AppButton';
import { colors } from '../../shared/constants/colors';
import { adminReportMockData } from './adminMockData';
import type { AdminReportFilter } from './adminTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FILTERS: { key: AdminReportFilter; label: string }[] = [
  { key: '7_days', label: '7 ngày' },
  { key: '30_days', label: '30 ngày' },
  { key: 'this_month', label: 'Tháng này' },
  { key: 'last_month', label: 'Tháng trước' },
  { key: 'custom', label: 'Tùy chỉnh' },
];

function parseDate(str: string): Date | null {
  // Expected format: DD/MM/YYYY
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminReportScreen() {
  const router = useRouter();
  const data = adminReportMockData;

  const [activeFilter, setActiveFilter] = useState<AdminReportFilter>('this_month');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const maxChart = Math.max(...data.revenueChart.map((p) => p.value));
  const maxTransaction = Math.max(...data.topHotels.map((h) => h.totalTransactionNum));

  const isTrendPos = data.periodComparison >= 0;

  function handleFilterPress(key: AdminReportFilter) {
    if (key === 'custom') {
      setActiveFilter('custom');
      setShowCustomPicker(true);
    } else {
      setActiveFilter(key);
      setShowCustomPicker(false);
      setCustomLabel('');
      // TODO (Backend): gọi API báo cáo theo filter: key
    }
  }

  function handleApplyCustom() {
    if (!startDateStr.trim() || !endDateStr.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày bắt đầu và ngày kết thúc.');
      return;
    }
    const start = parseDate(startDateStr.trim());
    const end = parseDate(endDateStr.trim());
    if (!start) { Alert.alert('Lỗi', 'Ngày bắt đầu không hợp lệ. Định dạng: DD/MM/YYYY'); return; }
    if (!end) { Alert.alert('Lỗi', 'Ngày kết thúc không hợp lệ. Định dạng: DD/MM/YYYY'); return; }
    if (end < start) { Alert.alert('Lỗi', 'Ngày kết thúc không được trước ngày bắt đầu.'); return; }

    const label = `${startDateStr.trim()} - ${endDateStr.trim()}`;
    setCustomLabel(label);
    setShowCustomPicker(false);
    // TODO (Backend): gọi API báo cáo với startDate=startDateStr, endDate=endDateStr
    Alert.alert('Đã áp dụng', `Xem báo cáo từ ${label}\n(Tính năng sẽ lấy dữ liệu thật khi nối backend.)`);
  }

  function handleExport(type: 'pdf' | 'excel') {
    Alert.alert('Xuất báo cáo', 'Tính năng xuất báo cáo sẽ được xử lý khi nối backend.');
  }

  const activeFilterLabel = activeFilter === 'custom' && customLabel
    ? customLabel
    : FILTERS.find(f => f.key === activeFilter)?.label ?? '';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Báo cáo & Doanh thu</Text>
          <Text style={styles.headerSub}>Tổng quan tài chính toàn hệ thống.</Text>
        </View>

        {/* ===== TIME FILTER ===== */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <Pressable key={f.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => handleFilterPress(f.key)}>
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {f.key === 'custom' && customLabel ? customLabel : f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ===== CUSTOM DATE PICKER ===== */}
        {showCustomPicker && (
          <AppCard style={styles.customPickerCard}>
            <Text style={styles.customPickerTitle}>Chọn khoảng ngày</Text>
            <Text style={styles.customPickerHint}>Định dạng: DD/MM/YYYY</Text>
            <View style={styles.dateInputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dateInputLabel}>Từ ngày</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="01/05/2026"
                  placeholderTextColor={colors.muted}
                  value={startDateStr}
                  onChangeText={setStartDateStr}
                  keyboardType="numeric"
                />
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.muted} style={{ marginTop: 28 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.dateInputLabel}>Đến ngày</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="06/05/2026"
                  placeholderTextColor={colors.muted}
                  value={endDateStr}
                  onChangeText={setEndDateStr}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.customBtnRow}>
              <AppButton title="Hủy" variant="outline" style={{ flex: 1 }}
                onPress={() => { setShowCustomPicker(false); if (!customLabel) setActiveFilter('this_month'); }} />
              <AppButton title="Áp dụng" style={{ flex: 1 }} onPress={handleApplyCustom} />
            </View>
          </AppCard>
        )}

        {/* ===== KPI 2x2 ===== */}
        <View style={styles.kpiGrid}>
          <AppCard style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="swap-horizontal-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.kpiValue, { color: colors.primary }]}>{data.totalTransaction}</Text>
            <Text style={styles.kpiLabel}>Tổng GD</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="wallet-outline" size={20} color={colors.success} />
            </View>
            <Text style={[styles.kpiValue, { color: colors.success }]}>{data.platformCommission}</Text>
            <Text style={styles.kpiLabel}>Hoa hồng</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.kpiValue}>{data.totalBookings.toLocaleString()}</Text>
            <Text style={styles.kpiLabel}>Tổng đơn</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="close-circle-outline" size={20} color="#B45309" />
            </View>
            <Text style={[styles.kpiValue, { color: '#B45309' }]}>{data.cancellationRate}</Text>
            <Text style={styles.kpiLabel}>Tỷ lệ hủy</Text>
          </AppCard>
        </View>

        {/* ===== PERIOD COMPARISON ===== */}
        <AppCard style={styles.section}>
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>So với kỳ trước ({activeFilterLabel}):</Text>
            <View style={[styles.trendBadge, { backgroundColor: isTrendPos ? '#DCFCE7' : '#FEE2E2' }]}>
              <Ionicons name={isTrendPos ? 'trending-up' : 'trending-down'} size={14}
                color={isTrendPos ? colors.success : colors.danger} />
              <Text style={[styles.trendVal, { color: isTrendPos ? colors.success : colors.danger }]}>
                {isTrendPos ? '+' : ''}{data.periodComparison}%
              </Text>
            </View>
          </View>
        </AppCard>

        {/* ===== CƠ CẤU DOANH THU ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Cơ cấu doanh thu</Text>
          <BreakdownRow label="Tổng tiền giao dịch" value={data.breakdown.totalTransaction} />
          <BreakdownRow label="Voucher / giảm giá" value={data.breakdown.totalVouchers} valueColor={colors.danger} />
          <View style={styles.divider} />
          <BreakdownRow label="Doanh thu Owner" value={data.breakdown.ownerRevenue} />
          <BreakdownRow label={`Hoa hồng hệ thống (${data.breakdown.commissionRate}%)`}
            value={data.breakdown.platformCommission} valueColor={colors.success} bold />
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              Hoa hồng = Tổng GD × {data.breakdown.commissionRate}% hoa hồng
            </Text>
          </View>
        </AppCard>

        {/* ===== BIỂU ĐỒ 7 NGÀY ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng GD 7 ngày gần nhất (Triệu VND)</Text>
          <View style={styles.chart}>
            {data.revenueChart.map((p, idx) => {
              const heightPct = maxChart > 0 ? (p.value / maxChart) * 100 : 0;
              const isMax = p.value === maxChart;
              return (
                <View key={idx} style={styles.barCol}>
                  <Text style={styles.barVal}>{p.value}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${heightPct}%` as any },
                      isMax && { backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={styles.barLabel}>{p.label}</Text>
                </View>
              );
            })}
          </View>
        </AppCard>

        {/* ===== TOP KHÁCH SẠN ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Top khách sạn theo GD</Text>
          {data.topHotels.map((h, idx) => {
            const prog = maxTransaction > 0 ? (h.totalTransactionNum / maxTransaction) : 0;
            return (
              <View key={h.id} style={[styles.hotelRow, idx < data.topHotels.length - 1 && styles.hotelRowBorder]}>
                <View style={styles.hotelRank}>
                  <Text style={styles.hotelRankText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.hotelMeta}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hotelName} numberOfLines={1}>{h.hotelName}</Text>
                      <Text style={styles.hotelCompany} numberOfLines={1}>{h.companyName}</Text>
                    </View>
                    <Text style={styles.hotelTxn}>{h.totalTransaction}</Text>
                  </View>
                  <View style={styles.hotelStats}>
                    <Text style={styles.hotelStat}>HC: {h.commission}</Text>
                    <Text style={styles.hotelStat}>{h.bookings} đơn</Text>
                    <Text style={[styles.hotelStat, { color: colors.muted }]}>Hủy: {h.cancellationRate}</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${prog * 100}%` as any }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </AppCard>

        {/* ===== EXPORT ===== */}
        <View style={styles.exportRow}>
          <AppButton title="Xuất PDF" variant="outline" style={{ flex: 1 }} onPress={() => handleExport('pdf')} />
          <AppButton title="Xuất Excel" variant="outline" style={{ flex: 1 }} onPress={() => handleExport('excel')} />
        </View>
      </ScrollView>

      {/* ===== BOTTOM NAV ===== */}
      <View style={styles.bottomNav}>
        {([
          { key: 'home', icon: 'home' as const, label: 'Tổng quan', route: '/admin' },
          { key: 'hotels', icon: 'business' as const, label: 'Khách sạn', route: '/admin/hotels' },
          { key: 'accounts', icon: 'people' as const, label: 'Tài khoản', route: '/admin/accounts' },
          { key: 'reports', icon: 'bar-chart' as const, label: 'Báo cáo', route: '/admin/reports' },
        ]).map((tab) => {
          const isActive = tab.key === 'reports';
          const iconName: keyof typeof Ionicons.glyphMap = isActive
            ? tab.icon : (`${tab.icon}-outline` as keyof typeof Ionicons.glyphMap);
          return (
            <Pressable key={tab.key} style={styles.navTab}
              onPress={() => { if (!isActive) router.replace(tab.route as any); }}>
              <Ionicons name={iconName} size={22} color={isActive ? colors.primary : colors.muted} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
              {isActive && <View style={styles.navIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BreakdownRow({ label, value, valueColor, bold }:
  { label: string; value: string; valueColor?: string; bold?: boolean }) {
  return (
    <View style={bStyles.row}>
      <Text style={bStyles.label}>{label}</Text>
      <Text style={[bStyles.value, valueColor ? { color: valueColor } : {}, bold ? { fontWeight: '700' } : {}]}>
        {value}
      </Text>
    </View>
  );
}

const bStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  label: { fontSize: 13, color: colors.text, flex: 1 },
  value: { fontSize: 14, color: colors.text, fontWeight: '500' },
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 52, paddingBottom: 100 },

  header: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.primaryDark },
  headerSub: { fontSize: 13, color: colors.muted, marginTop: 4 },

  filterScroll: { marginBottom: 14 },
  filterContainer: { gap: 8, paddingRight: 4 },
  filterTab: {
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  filterTabTextActive: { color: colors.textLight, fontWeight: '600' },

  customPickerCard: { marginBottom: 14, padding: 16 },
  customPickerTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  customPickerHint: { fontSize: 12, color: colors.muted, marginBottom: 12 },
  dateInputRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 14 },
  dateInputLabel: { fontSize: 12, color: colors.muted, marginBottom: 6, fontWeight: '600' },
  dateInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: 10, fontSize: 14, color: colors.text, backgroundColor: colors.surface,
  },
  customBtnRow: { flexDirection: 'row', gap: 10 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  kpiCard: { width: '48%', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8 },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  kpiValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  kpiLabel: { fontSize: 12, color: colors.muted, marginTop: 2, fontWeight: '500' },

  section: { marginBottom: 14, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },

  trendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendLabel: { fontSize: 13, color: colors.text, fontWeight: '500', flex: 1 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  trendVal: { fontSize: 13, fontWeight: '700' },

  formulaBox: { marginTop: 10, backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8 },
  formulaText: { fontSize: 11, color: colors.muted, textAlign: 'center' },

  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, marginTop: 8 },
  barCol: { flex: 1, alignItems: 'center' },
  barVal: { fontSize: 10, color: colors.muted, marginBottom: 4 },
  barTrack: {
    width: 24, height: 100, backgroundColor: '#F3F4F6',
    borderRadius: 4, justifyContent: 'flex-end', marginBottom: 6,
  },
  barFill: { width: '100%', backgroundColor: '#93C5FD', borderRadius: 4 },
  barLabel: { fontSize: 10, color: colors.text, textAlign: 'center' },

  hotelRow: { paddingVertical: 12, flexDirection: 'row', gap: 10 },
  hotelRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  hotelRank: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  hotelRankText: { fontSize: 12, fontWeight: '700', color: colors.textLight },
  hotelMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  hotelName: { fontSize: 14, fontWeight: '600', color: colors.text },
  hotelCompany: { fontSize: 11, color: colors.muted, marginTop: 2 },
  hotelTxn: { fontSize: 14, fontWeight: '700', color: colors.primary },
  hotelStats: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  hotelStat: { fontSize: 12, color: colors.muted },
  progressBg: { height: 5, backgroundColor: '#E5E7EB', borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },

  exportRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },

  bottomNav: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingBottom: 20, paddingTop: 8,
  },
  navTab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  navLabel: { fontSize: 11, color: colors.muted, fontWeight: '500', marginTop: 2 },
  navLabelActive: { color: colors.primary, fontWeight: '700' },
  navIndicator: { width: 20, height: 3, borderRadius: 2, backgroundColor: colors.primary, marginTop: 4 },
});
