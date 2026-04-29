/**
 * BookingFormScreen.tsx
 * Chọn ngày, số phòng, thông tin khách, xác nhận đặt phòng.
 */

import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors as COLORS } from '../../shared/constants/colors';
import { AppButton } from '../../shared/components/AppButton';

// ── Types ─────────────────────────────────────────────────────────────────────
type RoomType = { id: string; name: string; bed: string; price: number; available: boolean };

// ── Mock room types ──────────────────────────────────────────────────────────
const ROOM_TYPES: RoomType[] = [
  { id: '1', name: 'Phòng Standard', bed: 'Giường đôi', price: 4200000, available: true },
  { id: '2', name: 'Phòng Deluxe',   bed: '2 giường đơn', price: 5400000, available: true },
  { id: '3', name: 'Suite Ocean',    bed: 'Giường King', price: 8800000, available: true },
  { id: '4', name: 'Villa Riêng',    bed: 'Giường King + Extra', price: 14500000, available: false },
];

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
const NIGHTS = 2;

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  hotelId?: string;
  onNavigate?: (screen: string, params?: object) => void;
}

export default function BookingFormScreen({ hotelId = '1', onNavigate }: Props) {
  // Dates
  const [checkIn,  setCheckIn]  = useState('10/05/2025');
  const [checkOut, setCheckOut] = useState('12/05/2025');
  const [nights, setNights]     = useState(NIGHTS);

  // Room
  const [selectedRoom, setSelectedRoom] = useState(ROOM_TYPES[0].id);
  const [roomCount, setRoomCount]       = useState(1);

  // Guests
  const [adults, setAdults]     = useState(2);
  const [children, setChildren] = useState(0);

  // Guest info
  const [name, setName]     = useState('');
  const [phone, setPhone]   = useState('');
  const [email, setEmail]   = useState('');
  const [note, setNote]     = useState('');

  // Payment
  const [payMethod, setPayMethod] = useState<'online' | 'hotel'>('online');

  const [loading, setLoading] = useState(false);

  const room = ROOM_TYPES.find(r => r.id === selectedRoom)!;
  const subtotal = room.price * roomCount * nights;
  const tax      = Math.round(subtotal * 0.1);
  const total    = subtotal + tax;

  const handleConfirm = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ họ tên, số điện thoại và email.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // simulate API
    setLoading(false);
    onNavigate?.('BookingSuccess', { bookingId: 'BK' + Date.now() });
  };

  const Counter = ({
    value, onInc, onDec, min = 0, max = 10,
  }: { value: number; onInc: () => void; onDec: () => void; min?: number; max?: number }) => (
    <View style={styles.counter}>
      <Pressable style={[styles.counterBtn, value <= min && styles.counterBtnDisabled]} onPress={onDec} disabled={value <= min}>
        <Text style={styles.counterBtnText}>−</Text>
      </Pressable>
      <Text style={styles.counterValue}>{value}</Text>
      <Pressable style={[styles.counterBtn, value >= max && styles.counterBtnDisabled]} onPress={onInc} disabled={value >= max}>
        <Text style={styles.counterBtnText}>+</Text>
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => onNavigate?.('HotelDetail', { hotelId })}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Đặt phòng</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Dates ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Ngày lưu trú</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <TextInput
                style={styles.dateInput}
                value={checkIn}
                onChangeText={setCheckIn}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={COLORS.muted}
              />
            </View>
            <View style={styles.dateSep}>
              <Text style={styles.dateSepText}>{nights} đêm →</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <TextInput
                style={styles.dateInput}
                value={checkOut}
                onChangeText={setCheckOut}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={COLORS.muted}
              />
            </View>
          </View>
        </View>

        {/* ── Room type ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛏️ Loại phòng</Text>
          {ROOM_TYPES.map(room => (
            <Pressable
              key={room.id}
              style={[styles.roomCard, selectedRoom === room.id && styles.roomCardSelected, !room.available && styles.roomCardDisabled]}
              onPress={() => room.available && setSelectedRoom(room.id)}
            >
              <View style={styles.roomInfo}>
                <Text style={[styles.roomName, !room.available && { color: COLORS.muted }]}>{room.name}</Text>
                <Text style={styles.roomBed}>🛏 {room.bed}</Text>
                {!room.available && <Text style={styles.roomUnavail}>Hết phòng</Text>}
              </View>
              <View style={styles.roomPriceBlock}>
                <Text style={[styles.roomPrice, !room.available && { color: COLORS.muted }]}>{fmt(room.price)}</Text>
                <Text style={styles.roomPriceNight}>/đêm</Text>
              </View>
              {selectedRoom === room.id && room.available && (
                <View style={styles.roomCheck}><Text style={{ color: '#fff', fontWeight: '700' }}>✓</Text></View>
              )}
            </Pressable>
          ))}
        </View>

        {/* ── Room count & guests ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Số phòng & khách</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Số phòng</Text>
            <Counter value={roomCount} onInc={() => setRoomCount(v => v + 1)} onDec={() => setRoomCount(v => v - 1)} min={1} max={5} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Người lớn</Text>
            <Counter value={adults} onInc={() => setAdults(v => v + 1)} onDec={() => setAdults(v => v - 1)} min={1} max={6} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Trẻ em</Text>
            <Counter value={children} onInc={() => setChildren(v => v + 1)} onDec={() => setChildren(v => v - 1)} min={0} max={4} />
          </View>
        </View>

        {/* ── Guest info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Thông tin khách</Text>
          <TextInput style={styles.input} placeholder="Họ và tên *" placeholderTextColor={COLORS.muted} value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Số điện thoại *" placeholderTextColor={COLORS.muted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Email *" placeholderTextColor={COLORS.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={[styles.input, styles.textarea]} placeholder="Yêu cầu đặc biệt (không bắt buộc)" placeholderTextColor={COLORS.muted} value={note} onChangeText={setNote} multiline numberOfLines={3} />
        </View>

        {/* ── Payment method ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Phương thức thanh toán</Text>
          {(['online', 'hotel'] as const).map(m => (
            <Pressable key={m} style={[styles.payOption, payMethod === m && styles.payOptionActive]} onPress={() => setPayMethod(m)}>
              <Text style={styles.payIcon}>{m === 'online' ? '💳' : '🏨'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.payLabel}>{m === 'online' ? 'Thanh toán trực tuyến' : 'Thanh toán tại khách sạn'}</Text>
                <Text style={styles.paySub}>{m === 'online' ? 'Thẻ, Momo, ZaloPay...' : 'Tiền mặt hoặc thẻ khi nhận phòng'}</Text>
              </View>
              <View style={[styles.radioOuter, payMethod === m && styles.radioOuterActive]}>
                {payMethod === m && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── Price summary ── */}
        <View style={styles.summary}>
          <Text style={styles.sectionTitle}>🧾 Tổng cộng</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{room.name} × {roomCount} phòng × {nights} đêm</Text><Text style={styles.summaryVal}>{fmt(subtotal)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Thuế & phí (10%)</Text><Text style={styles.summaryVal}>{fmt(tax)}</Text></View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalVal}>{fmt(total)}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <AppButton title="Xác nhận đặt phòng" onPress={handleConfirm} />
        </View>
        <Text style={styles.notice}>* Bạn có thể huỷ miễn phí trước 24h check-in</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  backIcon: { fontSize: 20, color: COLORS.text },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.text },

  scroll: { paddingBottom: 48 },

  section: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 16 },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 11, fontWeight: '600', color: COLORS.muted, marginBottom: 6 },
  dateInput: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    paddingHorizontal: 14, height: 48, fontSize: 14,
    color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
  },
  dateSep: { alignItems: 'center', paddingHorizontal: 6 },
  dateSepText: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },

  roomCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
    marginBottom: 10, position: 'relative',
  },
  roomCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  roomCardDisabled: { opacity: 0.5 },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  roomBed: { fontSize: 12, color: COLORS.muted },
  roomUnavail: { fontSize: 11, color: COLORS.danger, marginTop: 4, fontWeight: '600' },
  roomPriceBlock: { alignItems: 'flex-end' },
  roomPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  roomPriceNight: { fontSize: 10, color: COLORS.muted },
  roomCheck: {
    position: 'absolute', top: -8, right: -8,
    width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: {
    width: 36, height: 36, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  counterBtnDisabled: { borderColor: COLORS.border },
  counterBtnText: { fontSize: 20, color: COLORS.primary, lineHeight: 24 },
  counterValue: { fontSize: 16, fontWeight: '700', color: COLORS.text, minWidth: 24, textAlign: 'center' },

  input: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    paddingHorizontal: 16, height: 52, fontSize: 14,
    color: COLORS.text, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  textarea: { height: 90, paddingTop: 14, textAlignVertical: 'top' },

  payOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
    marginBottom: 10,
  },
  payOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  payIcon: { fontSize: 24 },
  payLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  paySub: { fontSize: 11, color: COLORS.muted },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  summary: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: COLORS.muted, flex: 1, marginRight: 8 },
  summaryVal: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  summaryTotal: {
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingTop: 12, marginTop: 4, marginBottom: 0,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  totalVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

  notice: { fontSize: 12, color: COLORS.muted, textAlign: 'center', paddingHorizontal: 24, marginBottom: 16 },
});
