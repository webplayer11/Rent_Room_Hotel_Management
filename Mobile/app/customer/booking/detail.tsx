import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { bookingApi, BookingDto } from '../../../src/shared/api/bookingApi';
import Toast from 'react-native-toast-message';

// ─── helpers ────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  Pending: { label: 'Chờ xác nhận', color: '#D97706', bg: '#FEF3C7', icon: 'time-outline' },
  Confirmed: { label: 'Đã xác nhận', color: '#2563EB', bg: '#EFF6FF', icon: 'checkmark-circle-outline' },
  CheckedIn: { label: 'Đang lưu trú', color: '#059669', bg: '#ECFDF5', icon: 'home-outline' },
  CheckedOut: { label: 'Đã trả phòng', color: '#6B7280', bg: '#F3F4F6', icon: 'exit-outline' },
  Completed: { label: 'Hoàn thành', color: '#059669', bg: '#ECFDF5', icon: 'checkmark-done-outline' },
  Cancelled: { label: 'Đã hủy', color: '#EF4444', bg: '#FEF2F2', icon: 'close-circle-outline' },
  Rejected: { label: 'Bị từ chối', color: '#EF4444', bg: '#FEF2F2', icon: 'ban-outline' },
};

const fmt = (d: string) => {
  try { return format(parseISO(d), 'EEE, dd MMM yyyy', { locale: vi }); }
  catch { return d; }
};

const canCancel = (status: string) => status === 'Pending' || status === 'Confirmed';

// ─── component ──────────────────────────────────────────────────────────────
export default function BookingDetailScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await bookingApi.getBookingById(bookingId);
      if (res.isSuccess && res.data) setBooking(res.data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = () => {
    Alert.alert(
      'Xác nhận hủy đơn',
      'Bạn có chắc muốn hủy đơn đặt phòng này không? Hành động này không thể hoàn tác.',
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            if (!booking) return;
            setCancelling(true);
            try {
              const res = await bookingApi.cancelBooking(booking.id);
              // apiFetch throws on non-2xx, so if we get here it succeeded
              Toast.show({
                type: 'success',
                text1: 'Hủy đơn thành công',
                text2: 'Đơn đặt phòng của bạn đã được hủy.',
              });

              setTimeout(() => { router.replace({ pathname: '/customer/(tabs)/history' as any, params: { tab: 'Cancelled' }, }); }, 1200);
            } catch (err: any) {
              const msg = err?.message || 'Không thể kết nối máy chủ.';
              Alert.alert('Không thể hủy', msg);
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  // ── loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorText}>Không tìm thấy đơn đặt phòng</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = STATUS_MAP[booking.status] ?? { label: booking.status, color: '#6B7280', bg: '#F3F4F6', icon: 'help-circle-outline' };
  const finalAmt = booking.finalPrice ?? booking.totalPrice;

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn đặt phòng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* STATUS BANNER */}
        <View style={[styles.statusBanner, { backgroundColor: statusInfo.bg }]}>
          <Ionicons name={statusInfo.icon as any} size={28} color={statusInfo.color} />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            {booking.createdAt && (
              <Text style={styles.statusSub}>
                Đặt lúc {format(parseISO(booking.createdAt), 'HH:mm - dd/MM/yyyy')}
              </Text>
            )}
          </View>
        </View>

        {/* BOOKING CODE */}
        {booking.bookingCode && (
          <View style={styles.codeCard}>
            <Ionicons name="barcode-outline" size={18} color="#6B7280" />
            <Text style={styles.codeLabel}>Mã đặt phòng</Text>
            <Text style={styles.codeValue}>{booking.bookingCode}</Text>
          </View>
        )}

        {/* HOTEL & ROOM */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin phòng</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconWrap}><Ionicons name="business-outline" size={18} color="#2563EB" /></View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Khách sạn</Text>
              <Text style={styles.infoValue}>{booking.hotelName || '—'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconWrap}><Ionicons name="bed-outline" size={18} color="#2563EB" /></View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Loại phòng</Text>
              <Text style={styles.infoValue}>{booking.roomName || '—'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconWrap}><Ionicons name="people-outline" size={18} color="#2563EB" /></View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Số khách</Text>
              <Text style={styles.infoValue}>{booking.guestCount ?? 1} người</Text>
            </View>
          </View>
        </View>

        {/* DATES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thời gian lưu trú</Text>
          <View style={styles.datesRow}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateBlockLabel}>Nhận phòng</Text>
              <Ionicons name="log-in-outline" size={20} color="#059669" />
              <Text style={styles.dateBlockValue}>{fmt(booking.checkInDate)}</Text>
            </View>
            <View style={styles.dateArrow}>
              <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
              <Text style={styles.nightsText}>{booking.numberOfNights ?? '—'} đêm</Text>
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.dateBlockLabel}>Trả phòng</Text>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.dateBlockValue}>{fmt(booking.checkOutDate)}</Text>
            </View>
          </View>
        </View>

        {/* PRICE SUMMARY */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>

          {booking.unitPrice != null && booking.numberOfNights != null && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giá phòng × {booking.numberOfNights} đêm</Text>
              <Text style={styles.priceValue}>{(booking.unitPrice * booking.numberOfNights).toLocaleString('vi-VN')} ₫</Text>
            </View>
          )}

          {booking.discountAmount != null && booking.discountAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: '#059669' }]}>
                Giảm giá{booking.voucherCode ? ` (${booking.voucherCode})` : ''}
              </Text>
              <Text style={[styles.priceValue, { color: '#059669' }]}>-{booking.discountAmount.toLocaleString('vi-VN')} ₫</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{finalAmt?.toLocaleString('vi-VN')} ₫</Text>
          </View>
        </View>

        {/* SPECIAL REQUEST */}
        {booking.specialRequest ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Yêu cầu đặc biệt</Text>
            <Text style={styles.specialText}>{booking.specialRequest}</Text>
          </View>
        ) : null}

        {/* SPACER for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM — CANCEL BUTTON */}
      {canCancel(booking.status) && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cancelBtn, cancelling && { opacity: 0.7 }]}
            onPress={handleCancel}
            disabled={cancelling}
            activeOpacity={0.85}
          >
            {cancelling
              ? <ActivityIndicator color="#fff" />
              : (
                <>
                  <Ionicons name="close-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.cancelBtnText}>Hủy đơn đặt phòng</Text>
                </>
              )}
          </TouchableOpacity>
          <Text style={styles.cancelHint}>Bạn có thể hủy miễn phí trước khi nhận phòng</Text>
        </View>
      )}


    </SafeAreaView>
  );
}

// ─── styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { fontSize: 16, color: '#6B7280', marginTop: 12, marginBottom: 20 },
  backBtn: { backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  backBtnText: { color: '#fff', fontWeight: '700' },

  // header
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 14,
  },
  headerBack: { padding: 4, width: 40 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#111827' },

  scroll: { padding: 16 },

  // status banner
  statusBanner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // booking code
  codeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  codeLabel: { flex: 1, fontSize: 13, color: '#6B7280' },
  codeValue: { fontSize: 15, fontWeight: '800', color: '#111827', letterSpacing: 1 },

  // cards
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 14 },

  // info rows
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  infoText: { flex: 1, justifyContent: 'center' },
  infoLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },

  // dates
  datesRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dateBlock: { flex: 1, alignItems: 'center', gap: 4 },
  dateBlockLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  dateBlockValue: { fontSize: 13, fontWeight: '600', color: '#111827', textAlign: 'center', marginTop: 4 },
  dateArrow: { alignItems: 'center', paddingHorizontal: 8 },
  nightsText: { fontSize: 11, color: '#6B7280', marginTop: 4 },

  // price
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#6B7280' },
  priceValue: { fontSize: 14, color: '#111827' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#2563EB' },

  // special request
  specialText: { fontSize: 14, color: '#374151', lineHeight: 22 },

  // footer / cancel
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 16,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    alignItems: 'center',
  },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EF4444', width: '100%',
    height: 52, borderRadius: 30,
  },
  cancelBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelHint: { fontSize: 11, color: '#9CA3AF', marginTop: 8 },
});
