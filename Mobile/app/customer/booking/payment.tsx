import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookingApi } from '../../../src/shared/api/bookingApi';
import { paymentApi } from '../../../src/shared/api/paymentApi';
import Toast from 'react-native-toast-message';

type PayMethod = 'Cash' | 'BankTransfer' | 'Card';

const METHODS: { key: PayMethod; icon: any; label: string; desc: string }[] = [
  {
    key: 'Cash',
    icon: 'cash-outline',
    label: 'Thanh toán tại khách sạn',
    desc: 'Trả tiền mặt khi nhận phòng',
  },
  {
    key: 'BankTransfer',
    icon: 'card-outline',
    label: 'Chuyển khoản ngân hàng',
    desc: 'Thanh toán qua QR / chuyển khoản',
  },
  {
    key: 'Card',
    icon: 'globe-outline',
    label: 'Thanh toán trực tuyến',
    desc: 'VNPay / Thẻ nội địa / Quốc tế',
  },
];

const PaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    roomId: string; checkIn: string; checkOut: string;
    adults: string; selectedRoomCount: string;
    voucherCode: string; finalPrice: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<PayMethod>('Cash');

  const finalPrice = params.finalPrice ? Number(params.finalPrice) : 0;

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1. Tạo đơn đặt phòng
      const bookingRes = await bookingApi.createBooking({
        roomId: params.roomId,
        checkInDate: params.checkIn,
        checkOutDate: params.checkOut,
        guestCount: parseInt(params.adults || '1'),
        roomCount: parseInt(params.selectedRoomCount || '1'),
        voucherCode: params.voucherCode || undefined,
      });

      if (!bookingRes.isSuccess || !bookingRes.data) {
        Toast.show({
          type: 'error',
          text1: 'Không thể đặt phòng',
          text2: bookingRes.message || 'Phòng không còn khả dụng hoặc ngày không hợp lệ.',
        });
        return;
      }

      const bookingId = bookingRes.data.id;

      // 2. Xử lý thanh toán theo phương thức
      if (method === 'Cash' || method === 'BankTransfer') {
        const payRes = await paymentApi.processPayment({ bookingId, method });
        if (payRes.isSuccess) {
          Toast.show({
            type: 'success',
            text1: 'Đặt phòng thành công! 🎉',
            text2: method === 'Cash'
              ? 'Bạn sẽ thanh toán tại khách sạn.'
              : 'Vui lòng chuyển khoản theo thông tin được gửi.',
            visibilityTime: 2500,
            onHide: () => router.replace('/customer/(tabs)/history' as any),
          });
        } else {
          Toast.show({ type: 'error', text1: 'Lỗi thanh toán', text2: payRes.message });
        }
      } else {
        // Thanh toán Online (VNPay)
        const onlineRes = await paymentApi.createOnlinePayment({
          idBooking: bookingId,
          price: finalPrice,
        });
        if (onlineRes.isSuccess && onlineRes.data?.payUrl) {
          Toast.show({
            type: 'success',
            text1: 'Đang chuyển đến cổng thanh toán...',
            text2: 'Vui lòng hoàn tất thanh toán trong trình duyệt.',
            visibilityTime: 2000,
            onHide: () => router.replace('/customer/(tabs)/history' as any),
          });
        } else {
          Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể khởi tạo cổng thanh toán.' });
        }
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Lỗi kết nối', text2: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>

        {METHODS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.methodCard, method === m.key && styles.methodActive]}
            onPress={() => setMethod(m.key)}
            activeOpacity={0.8}
          >
            <View style={[styles.methodIconBox, method === m.key && styles.methodIconBoxActive]}>
              <Ionicons name={m.icon} size={22} color={method === m.key ? '#FFF' : '#6B7280'} />
            </View>
            <View style={styles.methodTextBox}>
              <Text style={[styles.methodLabel, method === m.key && styles.methodLabelActive]}>
                {m.label}
              </Text>
              <Text style={styles.methodDesc}>{m.desc}</Text>
            </View>
            {method === m.key && (
              <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
            )}
          </TouchableOpacity>
        ))}

        {/* Tổng tiền */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Tổng thanh toán</Text>
            {params.voucherCode ? (
              <Text style={styles.voucherAppliedNote}>
                <Ionicons name="pricetag" size={11} color="#059669" /> Voucher đã áp dụng
              </Text>
            ) : null}
          </View>
          <Text style={styles.summaryPrice}>{finalPrice.toLocaleString('vi-VN')} ₫</Text>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, loading && { opacity: 0.7 }]}
          onPress={handlePay}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.payBtnText}>Hoàn tất đặt phòng</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 14,
  },
  backBtn: { padding: 4, width: 40 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#111827' },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 14 },

  methodCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', padding: 14, borderRadius: 14,
    marginBottom: 12, borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  methodActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  methodIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  methodIconBoxActive: { backgroundColor: '#2563EB' },
  methodTextBox: { flex: 1 },
  methodLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 2 },
  methodLabelActive: { color: '#1D4ED8' },
  methodDesc: { fontSize: 12, color: '#9CA3AF' },

  summaryCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 16, borderRadius: 14, marginTop: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  summaryLabel: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  voucherAppliedNote: { fontSize: 11, color: '#059669' },
  summaryPrice: { fontSize: 22, fontWeight: '800', color: '#2563EB' },

  footer: {
    padding: 16, backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  payBtn: {
    backgroundColor: '#2563EB', height: 52, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
  },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default PaymentScreen;
