import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Platform, StatusBar,
  Image, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookingApi } from '../../../src/shared/api/bookingApi';
import { paymentApi } from '../../../src/shared/api/paymentApi';
import Toast from 'react-native-toast-message';
//import thư viện download ảnh
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

type PayMethod = 'Cash' | 'BankTransfer' | 'Card';

const METHODS: { key: PayMethod; icon: any; label: string; desc: string }[] = [
  {
    key: 'BankTransfer',
    icon: 'qr-code-outline',
    label: 'Thanh toán qua mã QR',
    desc: 'Quét mã QR để thanh toán đơn hàng',
  }
];

const PaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    roomId: string; checkIn: string; checkOut: string;
    adults: string; selectedRoomCount: string;
    voucherCode: string; finalPrice: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<PayMethod>('BankTransfer');
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [bookingIdForQr, setBookingIdForQr] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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

      // 2. Gọi API tạo mã QR thanh toán
      const onlineRes = await paymentApi.createOnlinePayment({
        idBooking: bookingId,
        price: finalPrice,
      });

      if (onlineRes.isSuccess && onlineRes.data?.qrUrl) {
        setQrUrl(onlineRes.data.qrUrl);
        setBookingIdForQr(bookingId);
      } else if (onlineRes.isSuccess && onlineRes.data?.payUrl) {
        Toast.show({
          type: 'success',
          text1: 'Đang chuyển đến cổng thanh toán...',
          text2: 'Vui lòng hoàn tất thanh toán trong trình duyệt.',
          visibilityTime: 2000,
          onHide: () => router.replace('/customer/(tabs)/history' as any),
        });
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể khởi tạo thanh toán.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Lỗi kết nối', text2: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };
  // khai báo hàm download ảnh QR
  const handleDownloadQr = async () => {
    if (!qrUrl) return;
    setDownloading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép ứng dụng lưu ảnh vào thư viện ảnh.');
        setDownloading(false);
        return;
      }

      const fileName = `QR_Payment_${Date.now()}.png`;
      const destFile = new File(Paths.cache, fileName);

      const downloadedFile = await File.downloadFileAsync(qrUrl, destFile);

      await MediaLibrary.saveToLibraryAsync(downloadedFile.uri);

      Toast.show({
        type: 'success',
        text1: 'Đã lưu ảnh QR!',
        text2: 'Ảnh QR đã được lưu vào thư viện ảnh của bạn.',
        visibilityTime: 2500,
      });
    } catch (error: any) {
      console.log('Lỗi tải/ảnh QR:', error);
      Toast.show({
        type: 'error',
        text1: 'Lưu thất bại',
        text2: error?.message || 'Không thể lưu ảnh QR. Vui lòng thử lại.',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!bookingIdForQr) return;
    setLoading(true);
    try {
      // Gọi backend để kích hoạt chuỗi xác nhận:
      // Backend → PaymentGate → callback → cập nhật trạng thái SUCCESS
      const notifyRes = await paymentApi.notifyPaid(bookingIdForQr);

      if (notifyRes.isSuccess && notifyRes.data?.toUpperCase() === 'SUCCESS') {
        setQrUrl(null);
        Toast.show({
          type: 'success',
          text1: 'Thanh toán thành công! 🎉',
          text2: 'Cảm ơn bạn đã đặt phòng.',
          visibilityTime: 2500,
          onHide: () => router.replace('/customer/(tabs)/history' as any),
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Chưa nhận được thanh toán',
          text2: 'Hệ thống chưa ghi nhận tiền vào tài khoản. Vui lòng đợi thêm và kiểm tra lại.',
          visibilityTime: 3000,
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Lỗi kiểm tra thanh toán',
        text2: 'Không thể kết nối hệ thống. Vui lòng thử lại sau giây lát.',
        visibilityTime: 3000,
      });
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

      {/* QR CODE MODAL */}
      <Modal visible={!!qrUrl} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Quét mã để thanh toán</Text>
            {qrUrl ? <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" /> : null}
            <Text style={styles.qrInstruction}>
              Vui lòng sử dụng ứng dụng ngân hàng quét mã QR trên để hoàn tất thanh toán.
            </Text>
            {/* nút tải ảnh QR */}
            <TouchableOpacity
              style={[styles.qrDownloadBtn, downloading && { opacity: 0.7 }]}
              onPress={handleDownloadQr}
              disabled={downloading}
            >
              {downloading
                ? <ActivityIndicator color="#2563EB" />
                : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="download-outline" size={18} color="#2563EB" />
                    <Text style={styles.qrDownloadText}>Tải ảnh QR về máy</Text>
                  </View>
                )
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.qrDoneBtn, loading && { opacity: 0.7 }]}
              onPress={handleCheckPaymentStatus}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.qrDoneText}>Tôi đã thanh toán</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.qrCancelBtn}
              onPress={async () => {
                if (bookingIdForQr) {
                  setLoading(true);
                  try {
                    await bookingApi.deleteBooking(bookingIdForQr);
                  } catch (e) {
                    console.log("Không thể xóa booking", e);
                  }
                  setLoading(false);
                }
                setQrUrl(null);
                Toast.show({
                  type: 'info',
                  text1: 'Đã hủy thanh toán',
                  text2: 'Đơn đặt phòng đã bị xóa do chưa thanh toán.',
                });
                router.replace('/customer/(tabs)/home' as any);
              }}
              disabled={loading}
            >
              <Text style={styles.qrCancelText}>Hủy thanh toán</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Toast />
      </Modal>
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

  modalOverlay: {
    flex: 1, backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 20 : 60,
    paddingHorizontal: 20,
  },
  qrContainer: {
    flex: 1, backgroundColor: '#FFF',
    alignItems: 'center', width: '100%',
  },
  qrTitle: {
    fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12
  },
  qrImage: {
    width: '100%', height: 320, marginBottom: 16, borderRadius: 8
  },
  qrInstruction: {
    fontSize: 13, color: '#4B5563', textAlign: 'center', marginBottom: 24, lineHeight: 20
  },
  qrDoneBtn: {
    backgroundColor: '#2563EB', width: '100%', height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  qrDoneText: {
    color: '#FFF', fontSize: 15, fontWeight: '700'
  },
  qrDownloadBtn: {
    width: '100%', height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5, borderColor: '#2563EB',
    marginBottom: 12,
  },
  qrDownloadText: {
    color: '#2563EB', fontSize: 15, fontWeight: '700',
  },
  qrCancelBtn: {
    width: '100%', height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F3F4F6'
  },
  qrCancelText: {
    color: '#374151', fontSize: 15, fontWeight: '600'
  }
});

export default PaymentScreen;
