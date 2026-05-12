import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { bookingService } from '../../services/bookingService';
import { hotelService } from '../../services/hotelService';
import { roomService } from '../../services/roomService';
import { HotelDetail } from '../../types/hotel';
import { Room } from '../../types/room';

const { width } = Dimensions.get('window');

const BookingSummaryScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams() as any;

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: 'Việt Nam',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(1181); // 19:41 in seconds

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [hotelData, roomsData] = await Promise.all([
        hotelService.getHotelDetail(params.hotelId),
        roomService.getRoomsByHotelId(params.hotelId, {})
      ]);
      setHotel(hotelData);
      const selectedRoom = roomsData.find(r => r.id.toString() === params.roomId?.toString());
      if (selectedRoom) setRoom(selectedRoom);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const { checkIn, checkOut, nights: paramsNights } = params;
  
  const nights = useMemo(() => {
    if (paramsNights) return parseInt(paramsNights as string);
    if (!checkIn || !checkOut) return 1;
    try {
      const start = new Date(checkIn as string);
      const end = new Date(checkOut as string);
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch (e) {
      return 1;
    }
  }, [checkIn, checkOut, paramsNights]);

  const roomCount = parseInt(params.selectedRoomCount) || 1;

  const priceDetail = useMemo(() => {
    if (!room) return null;
    return bookingService.calculateBookingPrice(
      room.basePrice,
      nights,
      roomCount,
      room.discountPercent,
      room.voucher?.discountValue || 0,
      room.voucher?.discountType || 'fixed'
    );
  }, [room, nights, roomCount]);

  const handleNext = () => {
    const validation = bookingService.validateBooking(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      Alert.alert('Thông tin thiếu', 'Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    
    // Logic to move to payment
    router.push({
      pathname: '/booking/payment',
      params: { ...params, ...form, finalPrice: priceDetail?.finalPrice }
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết khách</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Countdown Banner */}
        <View style={styles.timerBanner}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#FFF" />
          <Text style={styles.timerText}>
            Chúng tôi đang giữ giá cho quý khách trong {formatTime(timeLeft)}
          </Text>
        </View>

        {/* Date Info */}
        <View style={styles.dateCard}>
          <View style={styles.dateMainRow}>
            {/* Check-in */}
            <View style={styles.dateSection}>
              <Text style={styles.dateSectionLabel}>Nhận phòng</Text>
              <Text style={styles.dateSectionValue}>
                {format(new Date(params.checkIn || Date.now()), "EEEEEE, 'ngày' d, 'tháng' M", { locale: vi })}
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={16} color="#666" style={styles.dateArrow} />

            {/* Check-out */}
            <View style={styles.dateSection}>
              <Text style={styles.dateSectionLabel}>Trả phòng</Text>
              <Text style={styles.dateSectionValue}>
                {format(new Date(params.checkOut || Date.now() + 86400000), "EEEEEE, 'ngày' d, 'tháng' M", { locale: vi })}
              </Text>
            </View>

            {/* Nights */}
            <View style={styles.nightsSection}>
              <Text style={styles.nightsValue}>{nights}</Text>
              <Text style={styles.nightsLabel}>đêm</Text>
            </View>
          </View>
        </View>

        {/* Hotel Info */}
        <View style={styles.card}>
          <View style={styles.hotelHeader}>
            <Image source={{ uri: hotel?.images[0] }} style={styles.hotelThumb} />
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName} numberOfLines={1}>{hotel?.name}</Text>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBox}><Text style={styles.ratingText}>{hotel?.rating}</Text></View>
                <Text style={styles.ratingLabel}>Tuyệt vời</Text>
                <Text style={styles.reviewCount}>({hotel?.reviewCount} nhận xét)</Text>
              </View>
              <Text style={styles.hotelAddress} numberOfLines={1}>{hotel?.address}</Text>
            </View>
          </View>
        </View>

        {/* Room Info */}
        <View style={styles.card}>
          <View style={styles.roomHeader}>
            <Image source={{ uri: room?.images[0] }} style={styles.roomThumb} />
            <View style={styles.roomMainInfo}>
              <Text style={styles.roomTitle}>{room?.name}</Text>
              <View style={styles.roomDetailRow}>
                <Ionicons name="people-outline" size={14} color="#666" />
                <Text style={styles.roomDetailText}>{params.adults} người lớn, {params.children} trẻ em</Text>
              </View>
              <View style={styles.roomDetailRow}>
                <Ionicons name="bed-outline" size={14} color="#666" />
                <Text style={styles.roomDetailText}>{room?.bedInfo}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.checkPolicy}>
            <Ionicons name="time-outline" size={16} color="#00A651" />
            <Text style={styles.checkPolicyText}>Nhận phòng 24h</Text>
          </View>

        </View>



        {/* Guest Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ai là khách chính?</Text>
          <View style={styles.formRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Tên *</Text>
              <TextInput 
                style={[styles.input, errors.firstName && styles.inputError]} 
                placeholder="Ví dụ: Văn" 
                value={form.firstName}
                onChangeText={t => {
                  setForm({...form, firstName: t});
                  if (errors.firstName) setErrors({...errors, firstName: ''});
                }}
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Họ *</Text>
              <TextInput 
                style={[styles.input, errors.lastName && styles.inputError]} 
                placeholder="Ví dụ: Nguyễn" 
                value={form.lastName}
                onChangeText={t => {
                  setForm({...form, lastName: t});
                  if (errors.lastName) setErrors({...errors, lastName: ''});
                }}
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Địa chỉ email *</Text>
            <TextInput 
              style={[styles.input, errors.email && styles.inputError]} 
              placeholder="Ví dụ: van.nguyen@gmail.com" 
              keyboardType="email-address"
              value={form.email}
              onChangeText={t => {
                setForm({...form, email: t});
                if (errors.email) setErrors({...errors, email: ''});
              }}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : (
              <Text style={styles.inputHint}>Email xác nhận sẽ được gửi đến địa chỉ này</Text>
            )}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Quốc gia cư trú *</Text>
            <TouchableOpacity style={styles.pickerTrigger}>
              <Text style={styles.pickerText}>{form.country}</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Số điện thoại (tùy chọn)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ví dụ: 0912345678" 
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={t => setForm({...form, phone: t})}
            />
          </View>
        </View>

        {/* Pricing Detail */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin giá tiền</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá gốc ({roomCount} phòng x {nights} đêm)</Text>
            <Text style={styles.priceVal}>{priceDetail?.totalBasePrice.toLocaleString()} đ</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá của chúng tôi</Text>
            <Text style={styles.priceVal}>{(priceDetail?.totalBasePrice! - priceDetail?.discountAmount!).toLocaleString()} đ</Text>
          </View>
          {priceDetail?.voucherDiscountAmount! > 0 && (
            <View style={styles.priceRow}>
              <View style={styles.voucherLabelRow}>
                <Ionicons name="gift-outline" size={16} color="#666" />
                <Text style={[styles.priceLabel, { marginLeft: 5 }]}>Coupon đã sử dụng</Text>
              </View>
              <Text style={styles.priceVal}>- {priceDetail?.voucherDiscountAmount.toLocaleString()} đ</Text>
            </View>
          )}

          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalVal}>{priceDetail?.finalPrice.toLocaleString()} đ</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerPrice}>{priceDetail?.finalPrice.toLocaleString()} đ</Text>
          <Text style={styles.footerSubtitle}>Có liền xác nhận đặt phòng!</Text>
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>KẾ TIẾP: BƯỚC CUỐI CÙNG</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F2F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 5 : 5,
    paddingBottom: 15,
  },
  headerIcon: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  container: { flex: 1 },
  timerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 12,
    justifyContent: 'center',
  },
  timerText: { color: '#FFF', fontSize: 13, marginLeft: 8, fontWeight: '500' },
  card: { backgroundColor: '#FFF', marginHorizontal: 12, marginTop: 12, borderRadius: 12, padding: 15, elevation: 1 },
  dateCard: {
    backgroundColor: '#F1F5F9', // Light grey/blue background
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    padding: 15,
  },
  dateMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSection: {
    flex: 1,
  },
  dateSectionLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  dateSectionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    textTransform: 'capitalize',
  },
  dateArrow: {
    marginHorizontal: 10,
  },
  nightsSection: {
    alignItems: 'center',
    marginLeft: 10,
    minWidth: 40,
  },
  nightsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  nightsLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  hotelHeader: { flexDirection: 'row', alignItems: 'center' },
  hotelThumb: { width: 70, height: 70, borderRadius: 8 },
  hotelInfo: { flex: 1, marginLeft: 12 },
  hotelName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  ratingBox: { backgroundColor: '#5392F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ratingText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  ratingLabel: { fontSize: 12, color: '#5392F9', fontWeight: 'bold', marginLeft: 6 },
  reviewCount: { fontSize: 11, color: '#888', marginLeft: 4 },
  hotelAddress: { fontSize: 12, color: '#666' },
  roomHeader: { flexDirection: 'row', marginBottom: 10 },
  roomThumb: { width: 60, height: 60, borderRadius: 8 },
  roomMainInfo: { flex: 1, marginLeft: 12 },
  roomTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  roomDetailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  roomDetailText: { fontSize: 12, color: '#666', marginLeft: 6 },
  successAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', marginHorizontal: 12, marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  successAlertText: { flex: 1, fontSize: 12, color: '#16A34A', fontWeight: 'bold', marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  formRow: { flexDirection: 'row', marginBottom: 15 },
  formGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 13, color: '#666', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, fontSize: 14, color: '#333' },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 11, color: '#EF4444', marginTop: 4, fontWeight: '500' },
  inputHint: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  pickerTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10 },
  pickerText: { fontSize: 14, color: '#333' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: '#666' },
  priceVal: { fontSize: 14, color: '#333', fontWeight: '500' },
  voucherLabelRow: { flexDirection: 'row', alignItems: 'center' },
  totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalVal: { fontSize: 18, fontWeight: 'bold', color: '#FF567D' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
  },
  footerInfo: { flex: 1 },
  footerPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF567D' },
  footerSubtitle: { fontSize: 11, color: '#888' },
  nextBtn: { backgroundColor: '#5392F9', paddingHorizontal: 20, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  nextBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
});

export default BookingSummaryScreen;
