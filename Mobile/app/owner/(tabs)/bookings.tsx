import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, ScrollView, RefreshControl,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { bookingApi, BookingDto, UpdateBookingStatusDto } from '../../../src/shared/api/bookingApi';
import Toast from 'react-native-toast-message';

/* ─── Status helpers ──────────────────────────────────────────────── */
type StatusKey = 'Pending' | 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled' | 'Rejected';

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  CheckedIn: 'Đã check-in',
  CheckedOut: 'Đã check-out',
  Cancelled: 'Đã hủy',
  Rejected: 'Đã từ chối',
};

const STATUS_COLOR: Record<string, string> = {
  Pending: '#F59E0B',
  Confirmed: '#2563EB',
  CheckedIn: '#059669',
  CheckedOut: '#6B7280',
  Cancelled: '#EF4444',
  Rejected: '#DC2626',
};

const STATUS_BG: Record<string, string> = {
  Pending: '#FEF3C7',
  Confirmed: '#EFF6FF',
  CheckedIn: '#ECFDF5',
  CheckedOut: '#F3F4F6',
  Cancelled: '#FEF2F2',
  Rejected: '#FEF2F2',
};

/** Trả về các nút hành động host có thể thực hiện */
const getActions = (status: string): { label: string; next: string; color: string }[] => {
  switch (status) {
    case 'Pending':
      return [
        { label: 'Xác nhận', next: 'Confirmed', color: '#2563EB' },
        { label: 'Từ chối', next: 'Rejected', color: '#EF4444' },
      ];
    case 'Confirmed':
      return [{ label: 'Check-in', next: 'CheckedIn', color: '#059669' }];
    case 'CheckedIn':
      return [{ label: 'Check-out', next: 'CheckedOut', color: '#6B7280' }];
    default:
      return [];
  }
};

/* ─── Filter tabs ─────────────────────────────────────────────────── */
const FILTERS: { key: string | null; label: string }[] = [
  { key: null, label: 'Tất cả' },
  { key: 'Pending', label: 'Chờ xác nhận' },
  { key: 'Confirmed', label: 'Đã xác nhận' },
  { key: 'CheckedIn', label: 'Check-in' },
  { key: 'CheckedOut', label: 'Check-out' },
  { key: 'Cancelled', label: 'Đã hủy' },
  { key: 'Rejected', label: 'Từ chối' },
];

/* ─── Formatters ──────────────────────────────────────────────────── */
const fmtDate = (d?: string) => {
  if (!d) return '---';
  const dt = new Date(d);
  return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${dt.getFullYear()}`;
};

const fmtPrice = (n?: number) =>
  n != null ? n.toLocaleString('vi-VN') + ' ₫' : '---';

/* ══════════════════════════════════════════════════════════════════ */
/*  BOOKING CARD                                                      */
/* ══════════════════════════════════════════════════════════════════ */
const BookingCard = ({
  item,
  onPress,
}: {
  item: BookingDto;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    {/* Header */}
    <View style={styles.cardHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardHotel} numberOfLines={1}>
          {item.hotelName ?? 'Khách sạn'}
        </Text>
        <Text style={styles.cardRoom} numberOfLines={1}>
          {item.roomName ?? item.roomId}
        </Text>
      </View>
      <View
        style={[
          styles.badge,
          { backgroundColor: STATUS_BG[item.status] ?? '#F3F4F6' },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: STATUS_COLOR[item.status] ?? '#374151' },
          ]}
        >
          {STATUS_LABEL[item.status] ?? item.status}
        </Text>
      </View>
    </View>

    <View style={styles.divider} />

    {/* Info row */}
    <View style={styles.cardRow}>
      <InfoChip icon="calendar-outline" text={`${fmtDate(item.checkInDate)} → ${fmtDate(item.checkOutDate)}`} />
      <InfoChip icon="people-outline" text={`${item.guestCount ?? 1} khách`} />
    </View>
    <View style={[styles.cardRow, { marginTop: 6 }]}>
      <InfoChip icon="cash-outline" text={fmtPrice(item.finalPrice ?? item.totalPrice)} color="#2563EB" />
      {item.bookingCode ? (
        <InfoChip icon="barcode-outline" text={item.bookingCode} />
      ) : null}
    </View>
  </TouchableOpacity>
);

const InfoChip = ({
  icon,
  text,
  color = '#6B7280',
}: {
  icon: any;
  text: string;
  color?: string;
}) => (
  <View style={styles.chip}>
    <Ionicons name={icon} size={13} color={color} />
    <Text style={[styles.chipText, { color }]} numberOfLines={1}>
      {text}
    </Text>
  </View>
);

/* ══════════════════════════════════════════════════════════════════ */
/*  DETAIL MODAL                                                      */
/* ══════════════════════════════════════════════════════════════════ */
const DetailModal = ({
  booking,
  onClose,
  onStatusUpdate,
}: {
  booking: BookingDto | null;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
}) => {
  const [updating, setUpdating] = useState(false);

  if (!booking) return null;

  const handleAction = (next: string) => {
    Alert.alert(
      'Xác nhận',
      `Bạn muốn chuyển trạng thái sang "${STATUS_LABEL[next] ?? next}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            setUpdating(true);
            try {
              const dto: UpdateBookingStatusDto = { status: next };
              const res = await bookingApi.updateBookingStatus(booking.id, dto);
              if (res.isSuccess) {
                Toast.show({
                  type: 'success',
                  text1: 'Cập nhật thành công',
                  text2: `Trạng thái đã đổi: ${STATUS_LABEL[next]}`,
                });
                onStatusUpdate(booking.id, next);
                onClose();
              } else {
                Toast.show({ type: 'error', text1: 'Thất bại', text2: res.message });
              }
            } catch {
              Toast.show({ type: 'error', text1: 'Lỗi kết nối' });
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  const actions = getActions(booking.status);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Chi tiết booking</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status badge */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadgeLarge,
                { backgroundColor: STATUS_BG[booking.status] ?? '#F3F4F6' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: STATUS_COLOR[booking.status] ?? '#6B7280' },
                ]}
              />
              <Text
                style={[
                  styles.statusTextLarge,
                  { color: STATUS_COLOR[booking.status] ?? '#374151' },
                ]}
              >
                {STATUS_LABEL[booking.status] ?? booking.status}
              </Text>
            </View>
          </View>

          {/* Hotel & Room */}
          <Section title="Thông tin phòng">
            <Row label="Khách sạn" value={booking.hotelName ?? '---'} />
            <Row label="Phòng" value={booking.roomName ?? booking.roomId} />
            {booking.bookingCode ? (
              <Row label="Mã booking" value={booking.bookingCode} bold />
            ) : null}
          </Section>

          {/* Guest info */}
          <Section title="Thông tin khách">
            <Row label="Số khách" value={`${booking.guestCount ?? 1} người`} />
            <Row label="Check-in" value={fmtDate(booking.checkInDate)} />
            <Row label="Check-out" value={fmtDate(booking.checkOutDate)} />
            {booking.numberOfNights ? (
              <Row label="Số đêm" value={`${booking.numberOfNights} đêm`} />
            ) : null}
          </Section>

          {/* Payment */}
          <Section title="Thanh toán">
            <Row label="Giá/đêm" value={fmtPrice(booking.unitPrice)} />
            <Row label="Tổng tiền" value={fmtPrice(booking.totalPrice)} />
            {booking.discountAmount ? (
              <Row label="Giảm giá" value={`- ${fmtPrice(booking.discountAmount)}`} color="#059669" />
            ) : null}
            {booking.voucherCode ? (
              <Row label="Voucher" value={booking.voucherCode} />
            ) : null}
            <Row
              label="Thực thanh toán"
              value={fmtPrice(booking.finalPrice ?? booking.totalPrice)}
              bold
              color="#2563EB"
            />
          </Section>

          {booking.specialRequest ? (
            <Section title="Yêu cầu đặc biệt">
              <Text style={styles.noteText}>{booking.specialRequest}</Text>
            </Section>
          ) : null}

          {booking.createdAt ? (
            <Text style={styles.createdAt}>
              Đặt lúc: {fmtDate(booking.createdAt)}
            </Text>
          ) : null}
        </ScrollView>

        {/* Action buttons */}
        {actions.length > 0 && (
          <View style={styles.actionBar}>
            {actions.map((a) => (
              <TouchableOpacity
                key={a.next}
                style={[
                  styles.actionBtn,
                  { backgroundColor: a.color, opacity: updating ? 0.65 : 1 },
                ]}
                onPress={() => handleAction(a.next)}
                disabled={updating}
                activeOpacity={0.85}
              >
                {updating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.actionBtnText}>{a.label}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const Row = ({
  label,
  value,
  bold = false,
  color = '#111827',
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text
      style={[
        styles.rowValue,
        bold && { fontWeight: '700' },
        { color },
      ]}
    >
      {value}
    </Text>
  </View>
);

/* ══════════════════════════════════════════════════════════════════ */
/*  MAIN SCREEN                                                       */
/* ══════════════════════════════════════════════════════════════════ */
export default function HostBookingsTab() {
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<BookingDto | null>(null);

  const fetchBookings = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await bookingApi.getHostBookings();
      if (res.isSuccess && res.data) {
        setBookings(res.data);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Không thể tải danh sách booking' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings(true);
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
    );
  };

  const filtered = filter
    ? bookings.filter((b) => b.status === filter)
    : bookings;

  /* Sort: newest first */
  const sorted = [...filtered].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Booking</Text>
        <TouchableOpacity onPress={() => fetchBookings()} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Filter bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBarWrapper}
        contentContainerStyle={styles.filterBar}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={String(f.key)}
            style={[
              styles.filterChip,
              filter === f.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterLabel,
                filter === f.key && styles.filterLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={styles.countText}>
        {sorted.length} booking{sorted.length !== 1 ? 's' : ''}
      </Text>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard item={item} onPress={() => setSelected(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyText}>Chưa có booking nào</Text>
              <Text style={styles.emptySubText}>
                {filter ? 'Không có booking với trạng thái này.' : 'Kéo xuống để làm mới.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Detail modal */}
      {selected && (
        <DetailModal
          booking={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      <Toast />
    </SafeAreaView>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  STYLES                                                            */
/* ══════════════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#222' },
  refreshBtn: { padding: 4 },

  filterBarWrapper: {
    flexGrow: 0,
    backgroundColor: '#FFF',
  },
  filterBar: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'center',
  },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterLabelActive: { color: '#2563EB' },

  countText: {
    fontSize: 12,
    color: '#9CA3AF',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  listContent: { padding: 12, paddingBottom: 24 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardHotel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cardRoom: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  cardRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipText: { fontSize: 12, fontWeight: '500' },

  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySubText: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  /* ─── Modal ─── */
  modalSafe: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 4, width: 40 },
  modalTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 17, fontWeight: '700', color: '#111827',
  },
  modalContent: { padding: 16, paddingBottom: 24 },

  statusRow: { alignItems: 'center', marginBottom: 20 },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTextLarge: { fontSize: 14, fontWeight: '700' },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  sectionBody: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rowLabel: { fontSize: 13, color: '#6B7280' },
  rowValue: { fontSize: 13, color: '#111827', textAlign: 'right', flex: 1, marginLeft: 12 },
  noteText: { fontSize: 13, color: '#374151', paddingHorizontal: 14, paddingVertical: 11 },
  createdAt: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },

  actionBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});