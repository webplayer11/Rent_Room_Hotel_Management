import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, StatusBar, Platform, Dimensions, FlatList,
  Animated,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { hotelApi, HotelDto } from '../../../src/shared/api/hotelApi';
import { roomApi, RoomDto } from '../../../src/shared/api/roomApi';
import { favoriteApi } from '../../../src/shared/api/favoriteApi';
import { format, parseISO, differenceInDays } from 'date-fns';
import { IMAGE_URL } from '../../../src/config';
import { tokenStorage } from '../../../src/shared/storage/tokenStorage';
import AppDatePicker from '../../../src/shared/components/AppDatePicker';
import RoomGuestPicker from '../../../src/shared/components/RoomGuestPicker';

const { width } = Dimensions.get('window');

const getAmenityIcon = (name: string, iconFromDb?: string) => {
  const n = name.toLowerCase();
  if (iconFromDb) {
    return { name: iconFromDb, library: 'Ionicons' as const };
  }
  if (n.includes('wifi')) return { name: 'wifi', library: 'Ionicons' as const };
  if (n.includes('bể bơi') || n.includes('hồ bơi') || n.includes('pool')) return { name: 'pool', library: 'MaterialCommunityIcons' as const };
  if (n.includes('gym') || n.includes('thể hình') || n.includes('fitness')) return { name: 'dumbbell', library: 'MaterialCommunityIcons' as const };
  if (n.includes('nhà hàng') || n.includes('ăn uống') || n.includes('restaurant')) return { name: 'restaurant', library: 'Ionicons' as const };
  if (n.includes('đỗ xe') || n.includes('bãi xe') || n.includes('parking')) return { name: 'car', library: 'Ionicons' as const };
  if (n.includes('điều hòa') || n.includes('máy lạnh') || n.includes('air')) return { name: 'air-conditioner', library: 'MaterialCommunityIcons' as const };
  if (n.includes('bar') || n.includes('rượu')) return { name: 'glass-cocktail', library: 'MaterialCommunityIcons' as const };
  if (n.includes('thang máy') || n.includes('elevator')) return { name: 'elevator', library: 'MaterialCommunityIcons' as const };
  if (n.includes('spa') || n.includes('massage')) return { name: 'spa', library: 'MaterialCommunityIcons' as const };
  
  return { name: 'help-circle-outline', library: 'Ionicons' as const };
};

export default function HotelDetailScreen() {
  const router = useRouter();
  const { id, checkIn, checkOut, rooms: roomCount, adults } = useLocalSearchParams<{
    id: string; checkIn?: string; checkOut?: string; rooms?: string; adults?: string;
  }>();

  const [hotel, setHotel] = useState<HotelDto | null>(null);
  const [roomList, setRoomList] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [policyExpanded, setPolicyExpanded] = useState(false);

  const [localCheckIn, setLocalCheckIn] = useState<Date>(checkIn ? parseISO(checkIn) : new Date());
  const [localCheckOut, setLocalCheckOut] = useState<Date>(checkOut ? parseISO(checkOut) : new Date(Date.now() + 86400000));
  const [localRooms, setLocalRooms] = useState<number>(roomCount ? Number(roomCount) : 1);
  const [localAdults, setLocalAdults] = useState<number>(adults ? Number(adults) : 2);
  const [localChildren, setLocalChildren] = useState<number>(0);
  const [localChildAges, setLocalChildAges] = useState<number[]>([]);

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      loadHotelData();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadRooms();
    }
  }, [id, localCheckIn, localCheckOut]);

  const loadHotelData = async () => {
    try {
      const hotelRes = await hotelApi.getHotelById(id!);
      if (hotelRes.isSuccess) setHotel(hotelRes.data);

      const token = await tokenStorage.getAccessToken();
      if (token) {
        try {
          const favRes = await favoriteApi.checkFavoriteStatus(id!);
          if (favRes.isSuccess) setIsFav(favRes.data.isFavorited);
        } catch (_) { }
      }
    } catch (e) {
      console.warn('Lỗi load hotel:', e);
    }
  };

  const loadRooms = async () => {
    setLoading(true);
    try {
      const inStr = format(localCheckIn, 'yyyy-MM-dd');
      const outStr = format(localCheckOut, 'yyyy-MM-dd');
      const roomRes = await roomApi.getRoomsByHotelId(id!, inStr, outStr);
      if (roomRes.isSuccess) setRoomList(roomRes.data.filter(r => r.isActive));
    } catch (e) {
      console.warn('Lỗi load rooms:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) { router.push('/auth/login'); return; }
      const res = await favoriteApi.toggleFavorite(id!);
      if (res.isSuccess) setIsFav(res.data.isFavorited);
    } catch (_) {}
  };

  const getImg = (url?: string) =>
    !url ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
         : url.startsWith('http') ? url : `${IMAGE_URL}/${url}`;

  const imgUrls = hotel?.images?.length
    ? hotel.images.map(i => getImg(i.url))
    : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];

  let nights = 1;
  try {
    const d = differenceInDays(localCheckOut, localCheckIn);
    if (d > 0) nights = d;
  } catch (e) {}

  // Giá khởi điểm = giá thấp nhất của phòng còn trống (loại SoldOut, Maintenance)
  const availableRooms = roomList.filter(r => r.status !== 'SoldOut' && r.status !== 'Maintenance');
  const minPrice = availableRooms.length > 0
    ? Math.min(...availableRooms.map(r => r.discountPrice && r.discountPrice > 0 && r.discountPrice < r.pricePerNight ? r.discountPrice : r.pricePerNight)) * nights
    : 0;

  const headerDateStr = (() => {
    let dateRange = '';
    try {
      dateRange = `${format(localCheckIn, 'dd MMM')} - ${format(localCheckOut, 'dd MMM')}`;
    } catch (e) {}
    const guests = localChildren > 0 
      ? `${localAdults} người lớn, ${localChildren} trẻ em` 
      : `${localAdults} người lớn`;
    const roomStr = `${localRooms} phòng`;
    return dateRange ? `${dateRange} • ${roomStr}, ${guests}` : guests;
  })();

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.searchPill}
          onPress={() => setDateModalVisible(true)}
        >
          <Ionicons name="search" size={15} color="#6B7280" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pillTitle} numberOfLines={1}>{hotel?.name || 'Chi tiết khách sạn'}</Text>
            <Text style={styles.pillSub} numberOfLines={1}>{headerDateStr}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerIconBtn} onPress={toggleFav}>
          <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color={isFav ? '#FF567D' : '#111'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View>
          <FlatList
            data={imgUrls}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={e => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => <Image source={{ uri: item }} style={styles.galleryImg} />}
          />
          <View style={styles.imgCountBadge}>
            <Text style={styles.imgCountText}>{activeImg + 1}/{imgUrls.length}</Text>
          </View>
        </View>

        {hotel?.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mô tả cơ sở lưu trú</Text>
              <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)}>
                <Text style={styles.seeAll}>{descExpanded ? 'Thu gọn' : 'Xem hết'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.descText} numberOfLines={descExpanded ? undefined : 3}>
              {hotel.description}
            </Text>
          </View>
        )}
        {hotel?.amenities && hotel.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện ích cơ sở lưu trú</Text>
            <View style={styles.amenitiesGrid}>
              {hotel.amenities.map((item: any) => {
                const iconInfo = getAmenityIcon(item.name || '', item.icon);
                return (
                  <View key={item.id} style={styles.amenityItem}>
                    {iconInfo.library === 'Ionicons' ? (
                      <Ionicons name={iconInfo.name as any} size={20} color="#2563EB" />
                    ) : (
                      <MaterialCommunityIcons name={iconInfo.name as any} size={22} color="#2563EB" />
                    )}
                    <Text style={styles.amenityText} numberOfLines={1}>{item.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vài thông tin hữu ích</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-clock-outline" size={22} color="#374151" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nhận phòng/ Trả phòng</Text>
              <Text style={styles.infoValue}>Nhận phòng từ: <Text style={{ fontWeight: '700' }}>{hotel?.checkInTime || '14:00'}</Text></Text>
              <Text style={styles.infoValue}>Trả phòng đến: <Text style={{ fontWeight: '700' }}>{hotel?.checkOutTime || '12:00'}</Text></Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="door-open" size={22} color="#374151" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Về khách sạn</Text>
              <Text style={styles.infoValue}>Số lượng phòng: <Text style={{ fontWeight: '700' }}>{roomList.length}</Text></Text>
            </View>
          </View>

          {hotel?.address && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={22} color="#374151" style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa chỉ</Text>
                <Text style={styles.infoValue}>{hotel.address}</Text>
              </View>
            </View>
          )}
        </View>

        {hotel?.starRating && hotel.starRating > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Xếp hạng khách sạn</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              {Array.from({ length: Math.round(hotel.starRating) }).map((_, i) => (
                <Ionicons key={i} name="star" size={22} color="#D97706" />
              ))}
              <Text style={{ marginLeft: 8, color: '#374151', fontSize: 14, fontWeight: '600' }}>
                {hotel.starRating} sao
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chính sách Cơ sở lưu trú</Text>
            <TouchableOpacity onPress={() => setPolicyExpanded(!policyExpanded)}>
              <Text style={styles.seeAll}>{policyExpanded ? 'Thu gọn' : 'Xem hết'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.policyBlock}>
            <Text style={styles.policyTitle}>Trẻ em và giường phụ</Text>
            <Text style={styles.policyText}>Trẻ sơ sinh 0 tuổi</Text>
            <Text style={styles.policyDesc}>Lưu trú miễn phí khi sử dụng giường có sẵn.</Text>
          </View>

          {policyExpanded && (
            <>
              <View style={styles.policyBlock}>
                <Text style={styles.policyTitle}>Trẻ em 1-9 tuổi</Text>
                <Text style={styles.policyDesc}>Ở miễn phí nếu sử dụng giường có sẵn.</Text>
              </View>
              <View style={styles.policyBlock}>
                <Text style={styles.policyTitle}>Hủy phòng</Text>
                <Text style={styles.policyDesc}>Vui lòng liên hệ khách sạn để biết chính sách hủy phòng.</Text>
              </View>
            </>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          {minPrice > 0 ? (
            <>
              <Text style={styles.bottomPriceLabel}>Khởi điểm</Text>
              <Text style={styles.bottomPrice}>đ {minPrice.toLocaleString('vi-VN')}</Text>
              <Text style={styles.bottomPriceNight}>/{nights} đêm, 1 phòng</Text>
            </>
          ) : (
            <Text style={styles.bottomNoPriceText}>Liên hệ để biết giá</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.chooseRoomBtn}
          onPress={() => router.push({
            pathname: '/customer/hotel/chose-room',
            params: { 
              hotelId: hotel?.id, 
              hotelName: hotel?.name, 
              checkIn: format(localCheckIn, 'yyyy-MM-dd'), 
              checkOut: format(localCheckOut, 'yyyy-MM-dd'), 
              adults: localAdults.toString(), 
              rooms: localRooms.toString() 
            },
          })}
        >
          <Text style={styles.chooseRoomText}>Chọn phòng</Text>
        </TouchableOpacity>
      </View>

      <AppDatePicker
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        onConfirm={(start, end) => {
          setLocalCheckIn(start);
          setLocalCheckOut(end);
          setDateModalVisible(false);
          // Optional: After picking dates, prompt for guests or just close
          setTimeout(() => setGuestModalVisible(true), 300);
        }}
        initialCheckIn={localCheckIn}
        initialCheckOut={localCheckOut}
      />

      <RoomGuestPicker
        visible={guestModalVisible}
        onClose={() => setGuestModalVisible(false)}
        onConfirm={(r, a, c, ages) => {
          setLocalRooms(r);
          setLocalAdults(a);
          setLocalChildren(c);
          setLocalChildAges(ages);
          setGuestModalVisible(false);
        }}
        initialRooms={localRooms}
        initialAdults={localAdults}
        initialChildren={localChildren}
        initialChildAges={localChildAges}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 50,
    gap: 8,
  },
  backBtn: { padding: 4 },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  pillSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  headerIconBtn: { padding: 4 },
  galleryImg: { width, height: 240, resizeMode: 'cover' },
  imgCountBadge: {
    position: 'absolute', bottom: 10, right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  imgCountText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  section: {
    backgroundColor: '#FFF', marginBottom: 8, padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 13, color: '#2563EB', fontWeight: '600' },

  // Description
  descText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },

  // Info rows
  infoRow: { flexDirection: 'row', marginBottom: 16 },
  infoIcon: { marginRight: 12, marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  infoValue: { fontSize: 13, color: '#4B5563', lineHeight: 20 },

  // Policy
  policyBlock: { marginBottom: 14 },
  policyTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  policyText: { fontSize: 13, color: '#4B5563', fontStyle: 'italic', marginBottom: 2 },
  policyDesc: { fontSize: 13, color: '#4B5563', lineHeight: 20 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
  },
  bottomPriceLabel: { fontSize: 11, color: '#6B7280' },
  bottomPrice: { fontSize: 22, fontWeight: '800', color: '#DC2626' },
  bottomPriceNight: { fontSize: 11, color: '#DC2626' },
  bottomNoPriceText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  chooseRoomBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 30,
  },
  chooseRoomText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  amenityText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
});
