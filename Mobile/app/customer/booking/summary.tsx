import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, StatusBar, SafeAreaView, Platform, TextInput } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { hotelApi, HotelDto } from '../../../src/shared/api/hotelApi';
import { roomApi, RoomDto } from '../../../src/shared/api/roomApi';
import { voucherApi, VoucherDto } from '../../../src/shared/api/voucherApi';
import { bookingApi } from '../../../src/shared/api/bookingApi';
import { IMAGE_URL } from '../../../src/config';
import { format, parseISO, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import Toast from 'react-native-toast-message';

export default function BookingSummaryScreen() {
  const router = useRouter();
  const { hotelId, roomId, price, checkIn, checkOut, rooms: roomCountStr, adults } = useLocalSearchParams<{
    hotelId: string; roomId: string; price: string; checkIn: string; checkOut: string; rooms: string; adults: string;
  }>();

  const [hotel, setHotel] = useState<HotelDto | null>(null);
  const [room, setRoom] = useState<RoomDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);

  // Voucher
  const [availableVouchers, setAvailableVouchers] = useState<VoucherDto[]>([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherDto | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  useEffect(() => {
    if (hotelId && roomId) {
      loadData();
    }
  }, [hotelId, roomId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [hRes, rRes, sysVRes, hotelVRes] = await Promise.all([
        hotelApi.getHotelById(hotelId!),
        roomApi.getRoomsByHotelId(hotelId!),
        voucherApi.getSystemVouchers(),
        voucherApi.getHotelVouchers(hotelId!),
      ]);
      if (hRes.isSuccess) setHotel(hRes.data);
      if (rRes.isSuccess) {
        const selectedRoom = rRes.data.find(r => r.id === roomId);
        if (selectedRoom) setRoom(selectedRoom);
      }
      // Gộp voucher hệ thống + voucher khách sạn, loại trùng
      const sys = sysVRes.isSuccess ? sysVRes.data : [];
      const hotel = hotelVRes.isSuccess ? hotelVRes.data : [];
      const merged = [...sys, ...hotel].filter(
        (v, i, arr) => v.isActive && arr.findIndex(x => x.id === v.id) === i
      );
      setAvailableVouchers(merged);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const getImg = (url?: string) => !url ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' : url.startsWith('http') ? url : `${IMAGE_URL}/${url}`;

  const nights = (checkIn && checkOut) ? Math.max(1, differenceInDays(parseISO(checkOut), parseISO(checkIn))) : 1;
  const roomQty = roomCountStr ? parseInt(roomCountStr) : 1;

  const dateStrIn = checkIn ? format(parseISO(checkIn), 'EEE, d MMM', { locale: vi }) : '...';
  const dateStrOut = checkOut ? format(parseISO(checkOut), 'EEE, d MMM', { locale: vi }) : '...';

  // Math
  const originalPricePerNight = room?.pricePerNight || 0;
  const finalPricePerNight = room?.discountPrice && room.discountPrice > 0 ? room.discountPrice : originalPricePerNight;

  const originalTotal = originalPricePerNight * nights * roomQty;
  const finalTotalRoomOnly = finalPricePerNight * nights * roomQty;
  const roomDiscount = originalTotal - finalTotalRoomOnly;

  // Voucher discount
  const voucherDiscount = (() => {
    if (!appliedVoucher) return 0;
    const v = appliedVoucher;
    let disc = 0;
    if (v.type === 'Percent') {
      disc = finalTotalRoomOnly * (v.discountValue / 100);
      if (v.maxDiscountAmount && v.maxDiscountAmount > 0) disc = Math.min(disc, v.maxDiscountAmount);
    } else {
      disc = v.discountValue;
    }
    return Math.min(disc, finalTotalRoomOnly);
  })();

  const afterVoucher = finalTotalRoomOnly - voucherDiscount;
  const totalAmount = afterVoucher;

  const selectVoucher = (v: VoucherDto) => {
    setVoucherError(null);
    if (v.minOrderAmount && finalTotalRoomOnly < v.minOrderAmount) {
      setVoucherError(`Đơn hàng tối thiểu ${v.minOrderAmount.toLocaleString('vi-VN')} đ để dùng voucher này.`);
      return;
    }
    if (v.minNights && nights < v.minNights) {
      setVoucherError(`Cần ít nhất ${v.minNights} đêm để áp dụng voucher này.`);
      return;
    }
    if (v.usedCount >= v.usageLimit) {
      setVoucherError('Voucher đã hết lượt sử dụng.');
      return;
    }
    setAppliedVoucher(v);
    setVoucherCode(v.code);
    setShowVoucherList(false);
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError(null);
  };

  const applyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;
    // Thử tìm trong danh sách có sẵn trước
    const found = availableVouchers.find(v => v.code === code);
    if (found) { selectVoucher(found); return; }
    // Không có thì validate qua API
    setVoucherError(null);
    setVoucherLoading(true);
    try {
      const res = await voucherApi.validateVoucher(code);
      if (!res.isSuccess || !res.data?.isValid || !res.data.voucher) {
        setVoucherError(res.data?.message || 'Mã voucher không hợp lệ.');
        return;
      }
      selectVoucher(res.data.voucher);
    } catch {
      setVoucherError('Có lỗi khi kiểm tra voucher. Vui lòng thử lại.');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleGoToPayment = () => {
    if (!roomId || !checkIn || !checkOut) {
      Toast.show({ type: 'error', text1: 'Thiếu thông tin', text2: 'Không tìm thấy thông tin phòng hoặc ngày.' });
      return;
    }
    router.push({
      pathname: '/customer/booking/payment' as any,
      params: {
        roomId: roomId!,
        checkIn: checkIn!,
        checkOut: checkOut!,
        adults: adults || '1',
        selectedRoomCount: String(roomQty),
        voucherCode: appliedVoucher?.code || '',
        finalPrice: String(Math.round(totalAmount)),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết khách</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* TIMER BANNER */}
      <View style={styles.timerBanner}>
        <Text style={styles.timerText}>Giá này được giữ trong...</Text>
        <Ionicons name="time-outline" size={18} color="#DC2626" style={{ marginHorizontal: 6 }} />
        <Text style={styles.timerCountdown}>
          {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* DATES CARD */}
        <View style={styles.card}>
          <View style={styles.dateRow}>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>Nhận phòng</Text>
              <Text style={styles.dateVal}>{dateStrIn}</Text>
            </View>
            <Feather name="arrow-right" size={20} color="#6B7280" />
            <View style={[styles.dateCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.dateLabel}>Trả phòng</Text>
              <Text style={styles.dateVal}>{dateStrOut}</Text>
            </View>
            <View style={styles.nightBadge}>
              <Text style={styles.nightNum}>{nights}</Text>
              <Text style={styles.nightText}>đêm</Text>
            </View>
          </View>
        </View>

        {/* HOTEL CARD */}
        <View style={styles.card}>
          <View style={styles.hotelRow}>
            <Image source={{ uri: getImg(hotel?.images?.[0]?.url) }} style={styles.hotelImg} />
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName} numberOfLines={2}>{hotel?.name}</Text>
              {hotel?.starRating && hotel.starRating > 0 && (
                <View style={styles.starsRow}>
                  {Array.from({ length: Math.round(hotel.starRating) }).map((_, i) => (
                    <Ionicons key={i} name="star" size={12} color="#D97706" />
                  ))}
                </View>
              )}
              <Text style={styles.hotelAddress} numberOfLines={2}>{hotel?.address}</Text>
            </View>
          </View>

        </View>

        {/* ROOM CARD */}
        <View style={styles.roomCard}>
          <View style={styles.roomRow}>
            <Image source={{ uri: getImg(room?.images?.[0]?.url) }} style={styles.roomImgSmall} />
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{roomQty} x {room?.roomType || 'Phòng tiêu chuẩn'}</Text>
              <Text style={styles.roomSpecText}><Text style={{ fontWeight: '600' }}>Diện tích:</Text> {room?.roomSize} m²</Text>
              <Text style={styles.roomSpecText}><Text style={{ fontWeight: '600' }}>Tối đa:</Text> {room?.capacity} người lớn</Text>
              <Text style={styles.roomSpecText}>{room?.bedCount} {room?.bedType}</Text>
            </View>
          </View>
          
          {room?.isSmokingAllowed !== undefined && (
            <View style={styles.roomAmenitiesBox}>
              <View style={styles.amenityItem}>
                <Ionicons
                  name={room.isSmokingAllowed ? 'checkmark-circle-outline' : 'ban-outline'}
                  size={14}
                  color={room.isSmokingAllowed ? '#059669' : '#DC2626'}
                />
                <Text style={[styles.amenityText, { color: room.isSmokingAllowed ? '#059669' : '#DC2626' }]}>
                  {room.isSmokingAllowed ? 'Cho phép hút thuốc' : 'Không hút thuốc'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* VOUCHER CARD */}
        <View style={styles.voucherCard}>
          <TouchableOpacity style={styles.voucherHeader} onPress={() => !appliedVoucher && setShowVoucherList(p => !p)}>
            <Ionicons name="pricetag-outline" size={16} color="#2563EB" />
            <Text style={styles.voucherTitle}>Mã giảm giá</Text>
            {!appliedVoucher && (
              <Ionicons name={showVoucherList ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" style={{ marginLeft: 'auto' }} />
            )}
          </TouchableOpacity>

          {appliedVoucher ? (
            <View style={styles.voucherApplied}>
              <View style={styles.voucherAppliedLeft}>
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.voucherAppliedCode}>{appliedVoucher.code}</Text>
                  <Text style={styles.voucherAppliedDesc}>
                    {appliedVoucher.type === 'Percent'
                      ? `Giảm ${appliedVoucher.discountValue}%${appliedVoucher.maxDiscountAmount ? ` (tối đa ${appliedVoucher.maxDiscountAmount.toLocaleString('vi-VN')} đ)` : ''}`
                      : `Giảm ${appliedVoucher.discountValue.toLocaleString('vi-VN')} đ`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={removeVoucher} style={styles.voucherRemoveBtn}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Danh sách voucher có sẵn */}
              {showVoucherList && (
                <View style={styles.voucherListBox}>
                  {availableVouchers.length === 0 ? (
                    <Text style={styles.voucherEmptyText}>Không có voucher nào khả dụng.</Text>
                  ) : (
                    availableVouchers.map(v => (
                      <TouchableOpacity key={v.id} style={styles.voucherListItem} onPress={() => selectVoucher(v)}>
                        <View style={styles.voucherListItemLeft}>
                          <Text style={styles.voucherListCode}>{v.code}</Text>
                          <Text style={styles.voucherListDesc}>
                            {v.type === 'Percent'
                              ? `Giảm ${v.discountValue}%${v.maxDiscountAmount ? ` (tối đa ${v.maxDiscountAmount.toLocaleString('vi-VN')} đ)` : ''}`
                              : `Giảm ${v.discountValue.toLocaleString('vi-VN')} đ`}
                            {v.minOrderAmount ? ` • ĐH tối thiểu ${v.minOrderAmount.toLocaleString('vi-VN')} đ` : ''}
                            {v.minNights ? ` • Tối thiểu ${v.minNights} đêm` : ''}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {/* Hoặc nhập tay */}
              <View style={styles.voucherInputRow}>
                <TextInput
                  style={styles.voucherInput}
                  placeholder="Hoặc nhập mã voucher"
                  placeholderTextColor="#9CA3AF"
                  value={voucherCode}
                  onChangeText={t => { setVoucherCode(t.toUpperCase()); setVoucherError(null); }}
                  autoCapitalize="characters"
                  returnKeyType="done"
                  onSubmitEditing={applyVoucher}
                />
                <TouchableOpacity
                  style={[styles.voucherApplyBtn, (!voucherCode.trim() || voucherLoading) && styles.voucherApplyBtnDisabled]}
                  onPress={applyVoucher}
                  disabled={!voucherCode.trim() || voucherLoading}
                >
                  {voucherLoading
                    ? <ActivityIndicator size="small" color="#FFF" />
                    : <Text style={styles.voucherApplyText}>Áp dụng</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}

          {voucherError && (
            <View style={styles.voucherErrorRow}>
              <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
              <Text style={styles.voucherErrorText}>{voucherError}</Text>
            </View>
          )}
        </View>

        {/* PRICE SUMMARY */}
        <View style={styles.priceSummaryCard}>
          
          <View style={styles.priceRowLine}>
            <Text style={styles.priceLabel}>Giá gốc ({roomQty} phòng x {nights} đêm)</Text>
            <Text style={styles.priceValStrike}>{originalTotal.toLocaleString('vi-VN')} đ</Text>
          </View>
          
          {roomDiscount > 0 && (
            <View style={styles.priceRowLine}>
              <Text style={styles.priceLabelGreen}>Giảm giá phòng</Text>
              <Text style={styles.priceValGreen}>-{roomDiscount.toLocaleString('vi-VN')} đ</Text>
            </View>
          )}

          <View style={styles.priceRowLine}>
            <Text style={styles.priceLabel}>Giá phòng ({roomQty} phòng x {nights} đêm)</Text>
            <Text style={styles.priceVal}>{finalTotalRoomOnly.toLocaleString('vi-VN')} đ</Text>
          </View>

          {voucherDiscount > 0 && (
            <View style={styles.priceRowLine}>
              <Text style={styles.priceLabelGreen}>Voucher ({appliedVoucher?.code})</Text>
              <Text style={styles.priceValGreen}>-{voucherDiscount.toLocaleString('vi-VN')} đ</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalVal}>{totalAmount.toLocaleString('vi-VN')} đ</Text>
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleGoToPayment}>
          <Text style={styles.nextBtnText}>TIẾP THEO: THANH TOÁN →</Text>
        </TouchableOpacity>
        <Text style={styles.bottomGreenText}>
          Tổng: {totalAmount.toLocaleString('vi-VN')} đ • Chọn phương thức thanh toán
        </Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  timerBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FEE2E2', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#FCA5A5'
  },
  timerText: { fontSize: 13, color: '#374151' },
  timerCountdown: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  scrollContent: { padding: 12 },
  
  card: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateCol: { flex: 1 },
  dateLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  dateVal: { fontSize: 14, fontWeight: '700', color: '#111827' },
  nightBadge: { alignItems: 'flex-end', marginLeft: 10 },
  nightNum: { fontSize: 16, fontWeight: '800', color: '#111' },
  nightText: { fontSize: 11, color: '#6B7280' },

  hotelRow: { flexDirection: 'row' },
  hotelImg: { width: 90, height: 130, borderRadius: 8, marginRight: 12 },
  hotelInfo: { flex: 1 },
  hotelName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  starsRow: { flexDirection: 'row', marginBottom: 6 },
  hotelAddress: { fontSize: 12, color: '#4B5563', marginBottom: 6, lineHeight: 18 },

  roomCard: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  roomRow: { flexDirection: 'row', marginBottom: 16 },
  roomImgSmall: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 },
  roomSpecText: { fontSize: 13, color: '#374151', marginBottom: 2 },
  
  roomAmenitiesBox: { marginBottom: 12 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  amenityText: { fontSize: 13, color: '#059669', marginLeft: 4 },

  voucherCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#DBEAFE'
  },
  voucherHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  voucherTitle: { fontSize: 14, fontWeight: '700', color: '#1D4ED8', marginLeft: 6 },
  voucherInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voucherInput: {
    flex: 1, height: 42, borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 8, paddingHorizontal: 12, fontSize: 14,
    color: '#111827', backgroundColor: '#F9FAFB', letterSpacing: 1
  },
  voucherApplyBtn: {
    backgroundColor: '#2563EB', paddingHorizontal: 16, height: 42,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center'
  },
  voucherApplyBtnDisabled: { backgroundColor: '#93C5FD' },
  voucherApplyText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  voucherApplied: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ECFDF5', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#A7F3D0'
  },
  voucherAppliedLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  voucherAppliedCode: { fontSize: 13, fontWeight: '700', color: '#065F46' },
  voucherAppliedDesc: { fontSize: 12, color: '#059669', marginTop: 2 },
  voucherRemoveBtn: { padding: 4 },
  voucherErrorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  voucherErrorText: { fontSize: 12, color: '#DC2626', marginLeft: 4, flex: 1 },
  voucherListBox: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginBottom: 10, overflow: 'hidden'
  },
  voucherListItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#FAFAFA'
  },
  voucherListItemLeft: { flex: 1, marginRight: 8 },
  voucherListCode: { fontSize: 13, fontWeight: '700', color: '#1D4ED8', marginBottom: 2 },
  voucherListDesc: { fontSize: 11, color: '#6B7280', lineHeight: 16 },
  voucherEmptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: 16 },

  priceSummaryCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB'
  },


  priceRowLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: '#374151' },
  priceValStrike: { fontSize: 14, color: '#6B7280', textDecorationLine: 'line-through' },
  priceVal: { fontSize: 14, color: '#111827' },
  priceLabelGreen: { fontSize: 14, color: '#059669' },
  priceValGreen: { fontSize: 14, color: '#059669', fontWeight: '500' },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalVal: { fontSize: 18, fontWeight: '800', color: '#111827' },
  totalIncText: { fontSize: 11, color: '#6B7280', marginTop: 8 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', padding: 16,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 30 : 16
  },
  nextBtn: {
    backgroundColor: '#2563EB', width: '100%', paddingVertical: 14,
    borderRadius: 30, alignItems: 'center', marginBottom: 8
  },
  nextBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  bottomGreenText: { color: '#059669', fontSize: 12, fontWeight: '600' }
});
