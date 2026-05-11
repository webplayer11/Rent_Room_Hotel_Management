import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

function handleAlertPress(action: AlertAction, router: any) {
  switch (action) {
    case 'pending_bookings': router.push('/owner/bookings'); break;
    case 'new_reviews': router.push('/owner/reviews'); break;
    case 'update_hotel_docs': router.push('/owner/hotels'); break;
  }
}

const alertIconMap: Record<AlertAction, keyof typeof Ionicons.glyphMap> = {
  pending_bookings: 'document-text-outline',
  new_reviews: 'star-outline',
  update_hotel_docs: 'alert-circle-outline',
};

const alertColorMap: Record<string, string> = {
  warning: '#B45309',
  info: colors.primary,
  danger: colors.danger,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type OwnerDashboardProps = {
  onAddHotel?: () => void;
  onGoHotels?: () => void;
  onGoBookings?: () => void;
  onGoReports?: () => void;
};

export function OwnerDashboardScreen({ onAddHotel, onGoHotels, onGoBookings, onGoReports }: OwnerDashboardProps) {
  const router = useRouter();
  const {
    ownerName,
    companyName,
    unreadNotifications,
    stats,
    alerts,
    recentBookings,
    hotels,
  } = ownerDashboardMockData;

  const activeTab = 'home';

  // Quick actions grid
  const quickActions = [
    { icon: 'add-circle-outline' as const, label: 'Thêm KS', onPress: () => { if (onAddHotel) onAddHotel(); else router.push('/owner/hotel-form'); } },
    { icon: 'bed-outline' as const, label: 'Phòng', onPress: () => router.push('/owner/rooms') },
    { icon: 'document-text-outline' as const, label: 'Đơn đặt', onPress: () => { if (onGoBookings) onGoBookings(); else router.replace('/owner/bookings'); } },
    { icon: 'bar-chart-outline' as const, label: 'Báo cáo', onPress: () => { if (onGoReports) onGoReports(); else router.replace('/owner/reports'); } },
    { icon: 'pricetag-outline' as const, label: 'Khuyến mãi', onPress: () => router.push('/owner/promotions') },
    { icon: 'star-outline' as const, label: 'Đánh giá', onPress: () => router.push('/owner/reviews') },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 1. HEADER ===== */}
        <View style={styles.header}>
          <Pressable style={styles.headerLeft} onPress={() => router.push('/owner/profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{ownerName.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>Xin chào, {ownerName}</Text>
              <Text style={styles.companyName} numberOfLines={1}>{companyName}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.bellWrapper} onPress={() => router.push('/owner/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* ===== 2. COMPACT BANNER ===== */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Quản lý khách sạn dễ dàng</Text>
          <Text style={styles.bannerSub}>Theo dõi đơn, phòng và doanh thu trong một nơi.</Text>
        </View>

        {/* ===== 3. KPI 2x2 ===== */}
        <View style={styles.kpiGrid}>
          <Pressable
            style={styles.kpiCell}
            onPress={() => { if (onGoHotels) onGoHotels(); else router.replace('/owner/hotels'); }}
          >
            <AppCard style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="business-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.kpiValue}>{stats.totalHotels}</Text>
              <Text style={styles.kpiLabel}>Khách sạn</Text>
            </AppCard>
          </Pressable>

          <Pressable
            style={styles.kpiCell}
            onPress={() => { if (onGoBookings) onGoBookings(); else router.replace('/owner/bookings'); }}
          >
            <AppCard style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="receipt-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.kpiValue}>{stats.totalBookings}</Text>
              <Text style={styles.kpiLabel}>Đơn đặt</Text>
            </AppCard>
          </Pressable>

          <Pressable
            style={styles.kpiCell}
            onPress={() => { if (onGoReports) onGoReports(); else router.replace('/owner/reports'); }}
          >
            <AppCard style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="wallet-outline" size={20} color={colors.success} />
              </View>
              <Text style={[styles.kpiValue, { color: colors.success }]}>{stats.monthlyRevenue}</Text>
              <Text style={styles.kpiLabel}>Doanh thu</Text>
            </AppCard>
          </Pressable>

          <Pressable
            style={styles.kpiCell}
            onPress={() => { if (onGoHotels) onGoHotels(); else router.replace('/owner/hotels'); }}
          >
            <AppCard style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="time-outline" size={20} color="#B45309" />
              </View>
              <Text style={[styles.kpiValue, { color: '#B45309' }]}>{stats.pendingHotelApprovals}</Text>
              <Text style={styles.kpiLabel}>Chờ duyệt</Text>
            </AppCard>
          </Pressable>
        </View>

        {/* ===== 4. CẦN XỬ LÝ HÔM NAY ===== */}
        {alerts.length > 0 && (
          <AppCard style={styles.section}>
            <Text style={styles.sectionTitle}>Cần xử lý hôm nay</Text>
            <View style={styles.alertList}>
              {alerts.map((alert, idx) => {
                const iconColor = alertColorMap[alert.type] || colors.muted;
                const iconName = alertIconMap[alert.action];
                return (
                  <Pressable
                    key={alert.id}
                    style={[styles.alertRow, idx < alerts.length - 1 && styles.alertRowBorder]}
                    onPress={() => handleAlertPress(alert.action, router)}
                  >
                    <View style={[styles.alertIconWrap, { backgroundColor: iconColor + '18' }]}>
                      <Ionicons name={iconName} size={16} color={iconColor} />
                    </View>
                    <Text style={styles.alertText}>{alert.message}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                  </Pressable>
                );
              })}
            </View>
          </AppCard>
        )}

        {/* ===== 5. THAO TÁC NHANH ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action) => (
              <Pressable
                key={action.label}
                style={styles.actionItem}
                onPress={action.onPress}
              >
                <View style={styles.actionIconWrap}>
                  <Ionicons name={action.icon} size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </AppCard>

        {/* ===== 6. DOANH THU MINI ===== */}
        <Pressable onPress={() => { if (onGoReports) onGoReports(); else router.replace('/owner/reports'); }}>
          <AppCard style={styles.revenueMiniCard}>
            <View style={styles.revenueMiniLeft}>
              <Text style={styles.revenueMiniLabel}>Doanh thu tháng này</Text>
              <Text style={styles.revenueMiniValue}>{stats.monthlyRevenue}</Text>
              <Text style={styles.revenueMiniTrend}>↑ +12% so với kỳ trước</Text>
            </View>
            <View style={styles.revenueMiniRight}>
              <Ionicons name="bar-chart" size={36} color={colors.primary} style={{ opacity: 0.15 }} />
              <Text style={styles.revenueMiniBtn}>Xem báo cáo</Text>
            </View>
          </AppCard>
        </Pressable>

        {/* ===== 7. ĐƠN ĐẶT GẦN ĐÂY ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Đơn đặt gần đây</Text>
            <Pressable onPress={() => { if (onGoBookings) onGoBookings(); else router.replace('/owner/bookings'); }}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </Pressable>
          </View>
          {recentBookings.slice(0, 2).map((booking, idx) => {
            const status = bookingStatusMap[booking.status];
            return (
              <View key={booking.id} style={[styles.bookingRow, idx < Math.min(recentBookings.length, 2) - 1 && styles.bookingRowBorder]}>
                <View style={styles.bookingLeft}>
                  <Text style={styles.bookingCustomer}>{booking.customerName}</Text>
                  <Text style={styles.bookingDetail} numberOfLines={1}>{booking.hotelName} · {booking.roomType}</Text>
                  <Text style={styles.bookingDate}>{booking.checkInDate} · {booking.totalAmount}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: status.fg }]}>{status.label}</Text>
                </View>
              </View>
            );
          })}
        </AppCard>

        {/* ===== 8. KHÁCH SẠN CỦA BẠN ===== */}
        <AppCard style={styles.sectionLast}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Khách sạn của bạn</Text>
            <Pressable onPress={() => { if (onGoHotels) onGoHotels(); else router.replace('/owner/hotels'); }}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </Pressable>
          </View>
          {hotels.slice(0, 2).map((hotel, idx) => {
            const status = hotelStatusMap[hotel.status];
            return (
              <Pressable
                key={hotel.id}
                style={[styles.hotelRow, idx < Math.min(hotels.length, 2) - 1 && styles.hotelRowBorder]}
                onPress={() => router.push(`/owner/hotel-detail?id=${hotel.id}`)}
              >
                <View style={styles.hotelIconWrap}>
                  <Ionicons name="business" size={20} color={colors.primary} />
                </View>
                <View style={styles.hotelInfo}>
                  <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>
                  <Text style={styles.hotelAddress} numberOfLines={1}>{hotel.address}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: status.fg }]}>{status.label}</Text>
                </View>
              </Pressable>
            );
          })}
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
                if (tab.key === 'hotels') {
                  if (onGoHotels) onGoHotels();
                  else router.replace('/owner/hotels');
                }
                if (tab.key === 'bookings') {
                  if (onGoBookings) onGoBookings();
                  else router.replace('/owner/bookings');
                }
                if (tab.key === 'reports') {
                  router.replace('/owner/reports');
                }
              }}
            >
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
    paddingBottom: 100,
  },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 15,
  },
  headerInfo: {
    flex: 1,
  },
  greeting: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  companyName: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 1,
  },
  bellWrapper: {
    position: 'relative',
    padding: 6,
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.textLight,
    fontSize: 9,
    fontWeight: '700',
  },

  // ---- Banner ----
  banner: {
    backgroundColor: colors.primaryDark,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  bannerTitle: {
    color: colors.textLight,
    fontSize: 17,
    fontWeight: '700',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },

  // ---- KPI ----
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCell: {
    width: '48%',
  },
  kpiCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },

  // ---- Section ----
  section: {
    marginBottom: 14,
    padding: 14,
  },
  sectionLast: {
    marginBottom: 0,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },

  // ---- Alerts ----
  alertList: {
    gap: 0,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  alertRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },

  // ---- Quick Actions ----
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionItem: {
    width: '30%',
    alignItems: 'center',
    gap: 6,
  },
  actionIconWrap: {
    width: 50,
    height: 50,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ---- Revenue Mini ----
  revenueMiniCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: colors.primaryDark,
    padding: 16,
  },
  revenueMiniLeft: {
    flex: 1,
  },
  revenueMiniLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  revenueMiniValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textLight,
    marginTop: 4,
  },
  revenueMiniTrend: {
    fontSize: 12,
    color: '#86EFAC',
    marginTop: 4,
    fontWeight: '600',
  },
  revenueMiniRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  revenueMiniBtn: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  // ---- Booking rows ----
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  bookingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bookingLeft: {
    flex: 1,
    gap: 2,
    marginRight: 8,
  },
  bookingCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bookingDetail: {
    fontSize: 12,
    color: colors.muted,
  },
  bookingDate: {
    fontSize: 12,
    color: colors.muted,
  },

  // ---- Hotel rows ----
  hotelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  hotelRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hotelIconWrap: {
    width: 38,
    height: 38,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotelInfo: {
    flex: 1,
    gap: 2,
  },
  hotelName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  hotelAddress: {
    fontSize: 12,
    color: colors.muted,
  },

  // ---- Status badge ----
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
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