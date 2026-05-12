import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../../shared/components/AppCard';
import { colors } from '../../../shared/constants/colors';
import { ownerBookingsMockData } from '../data/ownerMockData';
import type { BookingStatus, OwnerBooking } from '../types/ownerTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusMap: Record<BookingStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: 'Chờ xác nhận', bg: '#FEF3C7', fg: '#B45309' },
  confirmed: { label: 'Đã xác nhận', bg: '#DBEAFE', fg: colors.primary },
  checked_in: { label: 'Đã check-in', bg: '#DCFCE7', fg: colors.success },
  checked_out: { label: 'Đã check-out', bg: '#F3F4F6', fg: '#6B7280' },
  cancelled_by_customer: { label: 'Khách đã hủy', bg: '#FEE2E2', fg: colors.danger },
  rejected_by_owner: { label: 'KS từ chối', bg: '#FEE2E2', fg: '#991B1B' },
};

type FilterKey = 'all' | BookingStatus;

const filterTabs: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'checked_in', label: 'Đã check-in' },
  { key: 'checked_out', label: 'Đã check-out' },
  { key: 'cancelled_by_customer', label: 'Khách đã hủy' },
  { key: 'rejected_by_owner', label: 'KS từ chối' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type OwnerBookingListProps = {
  onGoHome?: () => void;
  onGoHotels?: () => void;
  onGoBookings?: () => void;
};

export function OwnerBookingListScreen({
  onGoHome,
  onGoHotels,
}: OwnerBookingListProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<OwnerBooking[]>([
    ...ownerBookingsMockData,
  ]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredBookings =
    activeFilter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === activeFilter);

  // ---- KPI ----
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  // Simple revenue sum from totalAmount strings (mock approximation)
  const totalRevenue = bookings
    .filter(
      (b) =>
        b.status === 'confirmed' ||
        b.status === 'checked_in' ||
        b.status === 'checked_out',
    )
    .length;

  // ---- Actions ----
  function handleConfirm(booking: OwnerBooking) {
    Alert.alert(
      'Xác nhận đơn đặt phòng',
      `Bạn có chắc muốn xác nhận đơn ${booking.code} của ${booking.customerName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            setBookings((prev) =>
              prev.map((b) =>
                b.id === booking.id ? { ...b, status: 'confirmed' as const } : b,
              ),
            );
            Alert.alert('Thành công', 'Đã xác nhận đơn đặt phòng.');
          },
        },
      ],
    );
  }

  function handleStartReject(bookingId: string) {
    setRejectingId(bookingId);
    setRejectReason('');
  }

  function handleCancelReject() {
    setRejectingId(null);
    setRejectReason('');
  }

  function handleSubmitReject(booking: OwnerBooking) {
    if (!rejectReason.trim()) {
      Alert.alert('Thiếu lý do', 'Vui lòng nhập lý do từ chối.');
      return;
    }
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? { ...b, status: 'rejected_by_owner' as const }
          : b,
      ),
    );
    setRejectingId(null);
    setRejectReason('');
    Alert.alert('Đã từ chối', 'Đã từ chối đơn đặt phòng.');
  }

  function handleViewDetail(bookingId: string) {
    // TODO: navigate to OwnerBookingDetailScreen
    Alert.alert('Chi tiết', `Sau này chuyển sang chi tiết đơn ${bookingId}`);
  }

  // ---- Bottom nav ----
  const activeTab = 'bookings';

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn đặt phòng</Text>
          <Text style={styles.headerSubtitle}>
            Theo dõi và xử lý các đơn đặt phòng mới nhất.
          </Text>
        </View>

        {/* ===== KPI ===== */}
        <View style={styles.kpiRow}>
          <AppCard style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <Ionicons name="time-outline" size={18} color="#B45309" />
            </View>
            <Text style={[styles.kpiValue, { color: '#B45309' }]}>
              {pendingCount}
            </Text>
            <Text style={styles.kpiLabel}>Chờ xác nhận</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.kpiValue, { color: colors.primary }]}>
              {confirmedCount}
            </Text>
            <Text style={styles.kpiLabel}>Đã xác nhận</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="receipt-outline" size={18} color={colors.success} />
            </View>
            <Text style={[styles.kpiValue, { color: colors.success }]}>
              {totalRevenue}
            </Text>
            <Text style={styles.kpiLabel}>Đơn có doanh thu</Text>
          </AppCard>
        </View>

        {/* ===== FILTER ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ===== RESULT COUNT ===== */}
        <Text style={styles.resultCount}>
          Tổng cộng {filteredBookings.length} đơn
          {activeFilter !== 'all' &&
            ` · ${filterTabs.find((t) => t.key === activeFilter)?.label}`}
        </Text>

        {/* ===== BOOKING LIST ===== */}
        {filteredBookings.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyText}>
              Không có đơn đặt phòng nào trong mục này.
            </Text>
          </AppCard>
        ) : (
          <View style={styles.bookingList}>
            {filteredBookings.map((booking) => {
              const status = statusMap[booking.status];
              const isRejecting = rejectingId === booking.id;
              return (
                <AppCard key={booking.id} style={styles.bookingCard}>
                  {/* Top row: customer + badge */}
                  <View style={styles.cardTop}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.bookingCode}>{booking.code}</Text>
                      <Text style={styles.customerName}>
                        {booking.customerName}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <Text
                        style={[styles.statusBadgeText, { color: status.fg }]}
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={styles.detailRow}>
                    <Ionicons name="business-outline" size={13} color={colors.muted} />
                    <Text style={styles.detailText}>
                      {booking.hotelName} · {booking.roomType}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={13} color={colors.muted} />
                    <Text style={styles.detailText}>
                      {booking.checkInDate} → {booking.checkOutDate} ({booking.nights} đêm)
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="wallet-outline" size={13} color={colors.muted} />
                    <Text style={styles.amountText}>{booking.totalAmount}</Text>
                  </View>

                  {/* Actions for pending */}
                  {booking.status === 'pending' && !isRejecting && (
                    <View style={styles.actionRow}>
                      <Pressable
                        style={styles.btnConfirm}
                        onPress={() => handleConfirm(booking)}
                      >
                        <Ionicons name="checkmark" size={16} color={colors.textLight} />
                        <Text style={styles.btnConfirmText}>Xác nhận</Text>
                      </Pressable>
                      <Pressable
                        style={styles.btnReject}
                        onPress={() => handleStartReject(booking.id)}
                      >
                        <Ionicons name="close" size={16} color={colors.danger} />
                        <Text style={styles.btnRejectText}>Từ chối</Text>
                      </Pressable>
                    </View>
                  )}

                  {/* Reject reason form */}
                  {booking.status === 'pending' && isRejecting && (
                    <View style={styles.rejectForm}>
                      <Text style={styles.rejectLabel}>Lý do từ chối:</Text>
                      <TextInput
                        style={styles.rejectInput}
                        placeholder="Nhập lý do từ chối đơn đặt phòng..."
                        placeholderTextColor={colors.muted}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        value={rejectReason}
                        onChangeText={setRejectReason}
                      />
                      <View style={styles.rejectBtnRow}>
                        <Pressable
                          style={styles.rejectCancelBtn}
                          onPress={handleCancelReject}
                        >
                          <Text style={styles.rejectCancelText}>Hủy</Text>
                        </Pressable>
                        <Pressable
                          style={styles.rejectSubmitBtn}
                          onPress={() => handleSubmitReject(booking)}
                        >
                          <Text style={styles.rejectSubmitText}>
                            Gửi từ chối
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}

                  {/* View detail for non-pending */}
                  {booking.status !== 'pending' && (
                    <Pressable
                      style={styles.viewDetailBtn}
                      onPress={() => handleViewDetail(booking.id)}
                    >
                      <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color={colors.primary}
                      />
                    </Pressable>
                  )}
                </AppCard>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ===== BOTTOM NAVIGATION ===== */}
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
                  if (onGoHome) onGoHome();
                  else router.replace('/owner');
                }
                if (tab.key === 'hotels') {
                  if (onGoHotels) onGoHotels();
                  else router.replace('/owner/hotels');
                }
                if (tab.key === 'reports') {
                  router.replace('/owner/reports');
                }
                // 'bookings' is already active
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
    paddingBottom: 100,
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

  // ---- KPI ----
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  kpiIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  kpiLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  // ---- Filter ----
  filterScroll: {
    marginBottom: 12,
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
    fontSize: 12,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.textLight,
    fontWeight: '600',
  },

  // ---- Result count ----
  resultCount: {
    color: colors.text,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },

  // ---- Empty ----
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },

  // ---- Booking list ----
  bookingList: {
    gap: 12,
  },
  bookingCard: {
    gap: 8,
  },

  // ---- Card top ----
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  bookingCode: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  customerName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  // ---- Status badge ----
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ---- Details ----
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: colors.muted,
    fontSize: 13,
    flex: 1,
  },
  amountText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },

  // ---- Actions ----
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btnConfirm: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnConfirmText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '600',
  },
  btnReject: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnRejectText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },

  // ---- Reject form ----
  rejectForm: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  rejectLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  rejectInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
    minHeight: 60,
  },
  rejectBtnRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  rejectCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectCancelText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  rejectSubmitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
  },
  rejectSubmitText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },

  // ---- View detail ----
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  viewDetailText: {
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
