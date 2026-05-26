import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookingApi } from '../../../src/shared/api/bookingApi';
import { paymentApi } from '../../../src/shared/api/paymentApi';

const PaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'Cash' | 'Card'>('Cash');

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
        voucherCode: params.voucherCode,
        note: params.note,
      });

      if (!bookingRes.isSuccess || !bookingRes.data) {
        Alert.alert('Lỗi đặt phòng', bookingRes.message || 'Không thể tạo đơn đặt phòng.');
        setLoading(false);
        return;
      }

      const bookingId = bookingRes.data.id;

      // 2. Xử lý thanh toán
      if (method === 'Cash') {
        const payRes = await paymentApi.processPayment({
          bookingId,
          method: 'Cash',
        });
        if (payRes.isSuccess) {
          Alert.alert('Thành công', 'Đặt phòng thành công! Bạn sẽ thanh toán tại khách sạn.', [
            { text: 'OK', onPress: () => router.replace('/customer/(tabs)/history') }
          ]);
        } else {
          Alert.alert('Lỗi thanh toán', payRes.message);
        }
      } else {
        // Thanh toán Online
        const onlinePayRes = await paymentApi.createOnlinePayment({
          idBooking: bookingId,
          price: finalPrice,
        });

        if (onlinePayRes.isSuccess && onlinePayRes.data?.payUrl) {
           // Trong thực tế, bạn sẽ mở WebView hoặc Linking.openURL
           // Tạm thời ở đây chúng ta giả lập thành công
           Alert.alert('Thanh toán trực tuyến', 'Đang chuyển hướng tới cổng thanh toán...', [
            { text: 'OK', onPress: () => router.replace('/customer/(tabs)/history') }
          ]);
        } else {
           Alert.alert('Lỗi', 'Không thể khởi tạo cổng thanh toán.');
        }
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Có lỗi xảy ra khi thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Chọn phương thức thanh toán</Text>

        <TouchableOpacity 
          style={[styles.methodCard, method === 'Cash' && styles.methodActive]}
          onPress={() => setMethod('Cash')}
        >
          <Ionicons name="cash-outline" size={24} color={method === 'Cash' ? '#5392F9' : '#666'} />
          <Text style={[styles.methodText, method === 'Cash' && styles.methodTextActive]}>
            Thanh toán tại khách sạn
          </Text>
          {method === 'Cash' && <Ionicons name="checkmark-circle" size={24} color="#5392F9" style={styles.checkIcon} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.methodCard, method === 'Card' && styles.methodActive]}
          onPress={() => setMethod('Card')}
        >
          <Ionicons name="card-outline" size={24} color={method === 'Card' ? '#5392F9' : '#666'} />
          <Text style={[styles.methodText, method === 'Card' && styles.methodTextActive]}>
            Thanh toán trực tuyến (VNPay / Thẻ)
          </Text>
          {method === 'Card' && <Ionicons name="checkmark-circle" size={24} color="#5392F9" style={styles.checkIcon} />}
        </TouchableOpacity>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tổng thanh toán:</Text>
          <Text style={styles.summaryPrice}>{finalPrice.toLocaleString('vi-VN')} ₫</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.payBtn}
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payBtnText}>Hoàn tất đặt phòng</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE'
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  content: { flex: 1, padding: 15 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EEE'
  },
  methodActive: { borderColor: '#5392F9', backgroundColor: '#F0F5FF' },
  methodText: { flex: 1, marginLeft: 12, fontSize: 15, color: '#333' },
  methodTextActive: { color: '#5392F9', fontWeight: '600' },
  checkIcon: { marginLeft: 'auto' },
  summaryCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginTop: 20,
  },
  summaryLabel: { fontSize: 15, color: '#666' },
  summaryPrice: { fontSize: 20, fontWeight: 'bold', color: '#FF567D' },
  footer: { padding: 15, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  payBtn: {
    backgroundColor: '#5392F9', height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center'
  },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

export default PaymentScreen;
