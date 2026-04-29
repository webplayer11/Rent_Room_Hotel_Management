import React from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton } from '../../shared/components/AppButton';
import { AppCard } from '../../shared/components/AppCard';
import { colors } from '../../shared/constants/colors';
import { ownerDashboardMockData } from './ownerMockData';
import type { AlertAction, BookingStatus, HotelStatus } from './ownerTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hotelStatusMap: Record<HotelStatus, { label: string; bg: string; fg: string }> = {
  approved: { label: 'Đã duyệt', bg: '#DCFCE7', fg: colors.success },
  pending: { label: 'Chờ duyệt', bg: '#FEF3C7', fg: '#B45309' },
  need_update: { label: 'Cần bổ sung', bg: '#FEE2E2', fg: colors.danger },
};

const bookingStatusMap: Record<BookingStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: 'Chờ xác nhận', bg: '#FEF3C7', fg: '#B45309' },
  confirmed: { label: 'Đã xác nhận', bg: '#DBEAFE', fg: colors.primary },
  checked_in: { label: 'Đã check-in', bg: '#DCFCE7', fg: colors.success },
  checked_out: { label: 'Đã check-out', bg: '#F3F4F6', fg: '#6B7280' },
  cancelled_by_customer: { label: 'Khách đã hủy', bg: '#FEE2E2', fg: colors.danger },
  rejected_by_owner: { label: 'KS từ chối', bg: '#FEE2E2', fg: '#991B1B' },
};

const alertStyleMap: Record<string, { bg: string; iconColor: string }> = {
  warning: { bg: '#FEF3C7', iconColor: '#B45309' },
  info: { bg: '#DBEAFE', iconColor: colors.primary },
  danger: { bg: '#FEE2E2', iconColor: colors.danger },
};

const alertIconMap: Record<AlertAction, keyof typeof Ionicons.glyphMap> = {
  pending_bookings: 'document-text-outline',
  new_reviews: 'star-outline',
  update_hotel_docs: 'alert-circle-outline',
};

// ---------------------------------------------------------------------------
// Alert action handler (placeholder until navigation is wired)
// ---------------------------------------------------------------------------

function handleAlertPress(action: AlertAction) {
  switch (action) {
    case 'pending_bookings':
      // TODO: navigate to OwnerBookingListScreen with filter = 'pending'
      Alert.alert('Đơn chờ xác nhận', 'Điều hướng đến danh sách đơn chờ xác nhận.');
      break;
    case 'new_reviews':
      // TODO: navigate to reviews screen
      Alert.alert('Đánh giá mới', 'Điều hướng đến danh sách đánh giá.');
      break;
    case 'update_hotel_docs':
      // TODO: navigate to hotel form / legal docs section
      Alert.alert('Bổ sung hồ sơ', 'Điều hướng đến bổ sung hồ sơ pháp lý.');
      break;
  }
}

function handleHotelManage(hotelId: string) {
  // TODO: navigate to OwnerHotelDetailScreen
  Alert.alert('Quản lý', `Mở chi tiết khách sạn ${hotelId}`);
}

function handleHotelViewStatus(hotelId: string) {
  // TODO: navigate to hotel approval status screen
  Alert.alert('Xem trạng thái', `Xem trạng thái phê duyệt khách sạn ${hotelId}`);
}

function handleHotelUpdateDocs(hotelId: string) {
  // TODO: navigate to hotel form / legal docs section
  Alert.alert('Bổ sung hồ sơ', `Bổ sung hồ sơ cho khách sạn ${hotelId}`);
}

// ---------------------------------------------------------------------------
// KPI icon component
// ---------------------------------------------------------------------------

type KpiIconName = 'business-outline' | 'receipt-outline' | 'wallet-outline' | 'time-outline';

function KpiIcon({ name, color }: { name: KpiIconName; color: string }) {
  return (
    <View style={[styles.kpiIconWrap, { backgroundColor: color + '18' }]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type OwnerDashboardProps = {
  onAddHotel?: () => void;
  onGoHotels?: () => void;
  onGoBookings?: () => void;
};

export function OwnerDashboardScreen({ onAddHotel, onGoHotels, onGoBookings }: OwnerDashboardProps) {
  const router = useRouter();
  const {
    ownerName,
    companyName,
    unreadNotifications,
    stats,
    alerts,
    revenue7Days,
    recentBookings,
    hotels,
  } = ownerDashboardMockData;

  const maxRevenue = Math.max(...revenue7Days.map((r) => r.value));

  // ---- Tab state (UI-only) ----
  const activeTab = 'home';

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 1. HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AN</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>Xin chào, {ownerName} 👋</Text>
              <Text style={styles.companyName} numberOfLines={1}>
                {companyName}
              </Text>
            </View>
          </View>

          <Pressable style={styles.bellWrapper}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* ===== 2. WELCOME BANNER ===== */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Quản lý khách sạn dễ dàng</Text>
          <Text style={styles.bannerSubtitle}>
            Theo dõi đặt phòng, doanh thu và trạng thái phê duyệt ngay trên
            điện thoại.
          </Text>
        </View>

        {/* ===== 3. KPI CARDS ===== */}
        <View style={styles.kpiGrid}>
          <AppCard style={styles.kpiCard}>
            <KpiIcon name="business-outline" color={colors.primary} />
            <Text style={styles.kpiValue}>{stats.totalHotels}</Text>
            <Text style={styles.kpiLabel}>Tổng khách sạn</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <KpiIcon name="receipt-outline" color={colors.primary} />
            <Text style={styles.kpiValue}>{stats.totalBookings}</Text>
            <Text style={styles.kpiLabel}>Tổng đơn đặt</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <KpiIcon name="wallet-outline" color={colors.success} />
            <Text style={styles.kpiValue}>{stats.monthlyRevenue}</Text>
            <Text style={styles.kpiLabel}>Doanh thu tháng</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <KpiIcon name="time-outline" color={colors.warning} />
            <Text style={[styles.kpiValue, { color: colors.warning }]}>
              {stats.pendingHotelApprovals}
            </Text>
            <Text style={styles.kpiLabel}>Chờ admin duyệt</Text>
          </AppCard>
        </View>

        {/* ===== 4. ALERTS ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={18} color={colors.warning} />
            <Text style={styles.sectionTitle}>Cảnh báo nhanh</Text>
          </View>
          <View style={styles.alertList}>
            {alerts.map((alert) => {
              const alertStyle = alertStyleMap[alert.type];
              const iconName = alertIconMap[alert.action];
              return (
                <Pressable
                  key={alert.id}
                  style={({ pressed }) => [
                    styles.alertItem,
                    { backgroundColor: alertStyle?.bg || colors.background },
                    pressed && styles.alertPressed,
                  ]}
                  onPress={() => handleAlertPress(alert.action)}
                >
                  <Ionicons
                    name={iconName}
                    size={18}
                    color={alertStyle?.iconColor || colors.muted}
                  />
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              );
            })}
          </View>
        </AppCard>

        {/* ===== 5. QUICK ACTIONS ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          </View>
          <View style={styles.actionGrid}>
            <AppButton title="Thêm khách sạn" style={styles.actionBtn} onPress={() => {
              if (onAddHotel) onAddHotel();
              else router.push('/owner/hotel-form');
            }} />
            <AppButton
              title="Quản lý phòng"
              variant="outline"
              style={styles.actionBtn}
            />
            <AppButton
              title="Xem đơn đặt phòng"
              variant="outline"
              style={styles.actionBtn}
              onPress={() => {
                if (onGoBookings) onGoBookings();
                else router.push('/owner/bookings');
              }}
            />
            <AppButton
              title="Báo cáo doanh thu"
              variant="outline"
              style={styles.actionBtn}
            />
          </View>
        </AppCard>

        {/* ===== 6. REVENUE CHART ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={18} color={colors.success} />
            <Text style={styles.sectionTitle}>Doanh thu 7 ngày</Text>
          </View>
          <View style={styles.chart}>
            {revenue7Days.map((point) => {
              const barHeight =
                maxRevenue > 0 ? (point.value / maxRevenue) * 120 : 0;
              return (
                <View key={point.label} style={styles.chartCol}>
                  <Text style={styles.chartValue}>{point.value}M</Text>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: barHeight,
                        backgroundColor:
                          point.value === maxRevenue
                            ? colors.primary
                            : '#93C5FD',
                      },
                    ]}
                  />
                  <Text style={styles.chartLabel}>{point.label}</Text>
                </View>
              );
            })}
          </View>
        </AppCard>

        {/* ===== 7. RECENT BOOKINGS ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Đơn đặt phòng gần đây</Text>
          </View>
          <View style={styles.bookingList}>
            {recentBookings.map((booking) => {
              const status = bookingStatusMap[booking.status];
              return (
                <View key={booking.id} style={styles.bookingItem}>
                  <View style={styles.bookingRow}>
                    <Text style={styles.bookingCustomer}>
                      {booking.customerName}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <Text style={[styles.statusBadgeText, { color: status.fg }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.bookingDetail}>
                    {booking.hotelName} · {booking.roomType}
                  </Text>
                  <View style={styles.bookingRow}>
                    <View style={styles.bookingDateRow}>
                      <Ionicons name="calendar-outline" size={13} color={colors.muted} />
                      <Text style={styles.bookingDate}>{booking.checkInDate}</Text>
                    </View>
                    <Text style={styles.bookingAmount}>
                      {booking.totalAmount}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </AppCard>

        {/* ===== 8. HOTEL LIST ===== */}
        <AppCard style={styles.sectionLast}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="office-building-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Khách sạn của bạn</Text>
          </View>
          <View style={styles.hotelList}>
            {hotels.map((hotel) => {
              const status = hotelStatusMap[hotel.status];
              return (
                <View key={hotel.id} style={styles.hotelItem}>
                  <View style={styles.hotelTop}>
                    <View style={styles.hotelInfo}>
                      <Text style={styles.hotelName}>{hotel.name}</Text>
                      <View style={styles.hotelAddressRow}>
                        <Ionicons name="location-outline" size={13} color={colors.muted} />
                        <Text style={styles.hotelAddress}>{hotel.address}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <Text style={[styles.statusBadgeText, { color: status.fg }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.hotelMeta}>
                    <View style={styles.hotelRoomRow}>
                      <MaterialCommunityIcons
                        name="bed-outline"
                        size={14}
                        color={colors.muted}
                      />
                      <Text style={styles.hotelRoomCount}>
                        {hotel.roomCount} phòng
                      </Text>
                    </View>

                    {/* Actions based on status */}
                    {hotel.status === 'approved' && (
                      <Pressable
                        style={styles.hotelActionBtn}
                        onPress={() => handleHotelManage(hotel.id)}
                      >
                        <Ionicons name="settings-outline" size={14} color={colors.primary} />
                        <Text style={styles.hotelActionText}>Quản lý</Text>
                      </Pressable>
                    )}
                    {hotel.status === 'pending' && (
                      <Pressable
                        style={[styles.hotelActionBtn, styles.hotelActionWarning]}
                        onPress={() => handleHotelViewStatus(hotel.id)}
                      >
                        <Ionicons name="eye-outline" size={14} color="#B45309" />
                        <Text style={[styles.hotelActionText, { color: '#B45309' }]}>
                          Xem trạng thái
                        </Text>
                      </Pressable>
                    )}
                    {hotel.status === 'need_update' && (
                      <Pressable
                        style={[styles.hotelActionBtn, styles.hotelActionDanger]}
                        onPress={() => handleHotelUpdateDocs(hotel.id)}
                      >
                        <Ionicons name="create-outline" size={14} color={colors.danger} />
                        <Text style={[styles.hotelActionText, { color: colors.danger }]}>
                          Bổ sung hồ sơ
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </AppCard>
      </ScrollView>

      {/* ===== 9. BOTTOM NAVIGATION ===== */}
      <View style={styles.bottomNav}>
        {([
          { key: 'home', icon: 'home' as const, label: 'Trang chủ' },
          { key: 'hotels', icon: 'business' as const, label: 'Khách sạn' },
          { key: 'bookings', icon: 'document-text' as const, label: 'Đơn đặt' },
          { key: 'reports', icon: 'bar-chart' as const, label: 'Báo cáo' },
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
                if (tab.key === 'home') {
                  // No action needed if already home
                }
                if (tab.key === 'hotels') {
                  if (onGoHotels) onGoHotels();
                  else router.push('/owner/hotels');
                }
                if (tab.key === 'bookings') {
                  if (onGoBookings) onGoBookings();
                  else router.push('/owner/bookings');
                }
                if (tab.key === 'reports') {
                  router.push('/owner/reports');
                }
              }}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isActive ? colors.primary : colors.muted}
              />
              <Text
                style={[
                  styles.navLabel,
                  isActive && styles.navLabelActive,
                ]}
              >
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
    paddingBottom: 100, // enough clearance for bottom nav
  },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 16,
  },
  headerInfo: {
    flex: 1,
  },
  greeting: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  companyName: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  bellWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: '700',
  },

  // ---- Banner ----
  banner: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  bannerTitle: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 19,
  },

  // ---- KPI Grid ----
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  kpiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  kpiLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },

  // ---- Sections ----
  section: {
    marginBottom: 14,
  },
  sectionLast: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  // ---- Alerts ----
  alertList: {
    gap: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  alertPressed: {
    opacity: 0.7,
  },
  alertMessage: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // ---- Quick Actions ----
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionBtn: {
    width: '47%',
  },

  // ---- Revenue Chart ----
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 170,
    paddingTop: 16,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartValue: {
    color: colors.muted,
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '600',
  },
  chartBar: {
    width: 28,
    borderRadius: 6,
    minHeight: 4,
  },
  chartLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },

  // ---- Bookings ----
  bookingList: {
    gap: 10,
  },
  bookingItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: colors.background,
    gap: 6,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookingCustomer: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  bookingDetail: {
    color: colors.muted,
    fontSize: 13,
  },
  bookingDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingDate: {
    color: colors.muted,
    fontSize: 12,
  },
  bookingAmount: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },

  // ---- Status Badge (shared) ----
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ---- Hotels ----
  hotelList: {
    gap: 10,
  },
  hotelItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: colors.background,
    gap: 10,
  },
  hotelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hotelInfo: {
    flex: 1,
    gap: 2,
  },
  hotelName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  hotelAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hotelAddress: {
    color: colors.muted,
    fontSize: 13,
  },
  hotelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hotelRoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hotelRoomCount: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  hotelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  hotelActionDanger: {
    borderColor: colors.danger,
  },
  hotelActionWarning: {
    borderColor: '#B45309',
  },
  hotelActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
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