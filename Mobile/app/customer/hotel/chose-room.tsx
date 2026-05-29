import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, StatusBar, Platform, Dimensions
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { roomApi, RoomDto } from '../../../src/shared/api/roomApi';
import { IMAGE_URL } from '../../../src/config';
import { format, parseISO, differenceInDays } from 'date-fns';

const { width } = Dimensions.get('window');

const getImg = (url?: string) =>
  !url ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    : url.startsWith('http') ? url : `${IMAGE_URL}/${url}`;

// ─── RoomCardItem tách ra ngoài để tránh re-define mỗi lần render ───
type RoomCardProps = {
  room: RoomDto;
  nights: number;
  roomCount: string | undefined;
  hotelId: string;
  hotelName: string | undefined;
  checkIn: string | undefined;
  checkOut: string | undefined;
  adults: string | undefined;
  onBook: (roomId: string, roomType: string, price: number) => void;
};

function RoomCardItem({ room, nights, roomCount, onBook }: RoomCardProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = room.images?.length ? room.images : [{ url: undefined }];
  const imgUrl = getImg(images[imgIdx]?.url);

  const handleNextImg = () => {
    setImgIdx((prev) => (prev + 1) % images.length);
  };

  const basePricePerNight = room.pricePerNight;
  const finalPricePerNight =
    room.discountPrice && room.discountPrice > 0 && room.discountPrice < room.pricePerNight
      ? room.discountPrice
      : room.pricePerNight;

  const hasDiscount = finalPricePerNight < basePricePerNight;
  const oldPrice = basePricePerNight * nights;
  const price = finalPricePerNight * nights;
  const discountPercent = hasDiscount
    ? Math.round((1 - finalPricePerNight / basePricePerNight) * 100)
    : 0;
  const discountAmount = hasDiscount ? oldPrice - price : 0;

  return (
    <View style={styles.roomCard}>
      <View style={styles.roomHeaderRow}>
        <Text style={styles.roomTitle}>{room.roomType || 'Phòng tiêu chuẩn'}</Text>
        {room.roomSize && <Text style={styles.roomSizeTop}>{room.roomSize} m²</Text>}
      </View>

      <View style={styles.roomImgContainer}>
        <Image source={{ uri: imgUrl }} style={styles.roomImg} />
        <View style={styles.roomImgBadge}>
          <Text style={styles.roomImgBadgeText}>{imgIdx + 1}/{images.length}</Text>
        </View>
        <TouchableOpacity style={styles.roomImgNext} onPress={handleNextImg} activeOpacity={0.8}>
          <Feather name="chevron-right" size={20} color="#111" />
        </TouchableOpacity>
      </View>

      <View style={styles.roomSpecs}>
        <Text style={styles.roomSpecsText}>
          {room.roomSize ? `${room.roomSize} m²  |  ` : ''}{room.bedCount} {room.bedType || 'giường đôi'}
        </Text>
      </View>

      <View style={styles.roomAmenities}>
        <View style={styles.amenityItem}>
          <Ionicons
            name={room.isSmokingAllowed ? 'checkmark-circle-outline' : 'ban-outline'}
            size={12}
            color={room.isSmokingAllowed ? '#059669' : '#DC2626'}
          />
          <Text style={[styles.amenityText, { color: room.isSmokingAllowed ? '#059669' : '#DC2626' }]}>
            {room.isSmokingAllowed ? 'Cho phép hút thuốc' : 'Không hút thuốc'}
          </Text>
        </View>
      </View>

      {room.description && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
          <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 18 }}>{room.description}</Text>
        </View>
      )}

      <View style={styles.roomDealBox}>
        {hasDiscount && (
          <View style={styles.dealHeader}>
            <Text style={styles.dealHeaderText}>Đang giảm giá!</Text>
          </View>
        )}
        <View style={styles.dealContent}>
          <View style={styles.dealColLeft}>
            <View style={styles.dealRow}>
              <Ionicons name="person" size={14} color="#374151" />
              <Text style={styles.dealRowText}>Tối đa {room.capacity} người lớn</Text>
            </View>
          </View>

          <View style={styles.dealColRight}>
            {hasDiscount && (
              <>
                <View style={styles.priceStrikeRow}>
                  <Text style={styles.priceStrike}>{oldPrice.toLocaleString('vi-VN')} đ</Text>
                  <Text style={styles.priceDiscount}>-{discountPercent}%</Text>
                </View>
                <View style={styles.appliedDiscountBadge}>
                  <MaterialCommunityIcons name="ticket-percent" size={12} color="#059669" />
                  <Text style={styles.appliedDiscountText}>Tiết kiệm {discountAmount.toLocaleString('vi-VN')} đ</Text>
                </View>
              </>
            )}
            <View style={styles.finalPriceRow}>
              <Text style={styles.finalPrice}>{price.toLocaleString('vi-VN')}</Text>
              <Text style={styles.finalPriceCur}> đ</Text>
            </View>
            <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Giá cho {nights} đêm, 1 phòng</Text>
          </View>
        </View>

        <View style={styles.dealFooter}>
          <View style={styles.roomCountSelect}>
            <Text style={styles.roomCountLabel}>Số phòng trống</Text>
            <Text style={styles.roomCountVal}>{roomCount || 1}</Text>
          </View>
          <TouchableOpacity
            style={[styles.bookRoomBtn, room.status === 'SoldOut' && { backgroundColor: '#9CA3AF' }]}
            activeOpacity={0.8}
            disabled={room.status === 'SoldOut'}
            onPress={() => onBook(room.id, room.roomType || 'Phòng tiêu chuẩn', price)}
          >
            <Text style={styles.bookRoomBtnText}>{room.status === 'SoldOut' ? 'Hết phòng' : 'Đặt'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────
export default function ChoseRoomScreen() {
  const router = useRouter();
  const { hotelId, hotelName, checkIn, checkOut, rooms: roomCount, adults } = useLocalSearchParams<{
    hotelId: string; hotelName?: string; checkIn?: string; checkOut?: string; rooms?: string; adults?: string;
  }>();

  const [roomList, setRoomList] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hotelId) loadRooms();
  }, [hotelId]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const res = await roomApi.getRoomsByHotelId(hotelId!, checkIn, checkOut);
      if (res.isSuccess) {
        const activeRooms = res.data.filter(r => r.isActive);
        activeRooms.sort((a, b) => {
          const pA = a.discountPrice && a.discountPrice > 0 && a.discountPrice < a.pricePerNight ? a.discountPrice : a.pricePerNight;
          const pB = b.discountPrice && b.discountPrice > 0 && b.discountPrice < b.pricePerNight ? b.discountPrice : b.pricePerNight;
          return pA - pB;
        });
        setRoomList(activeRooms);
      }
    } catch (e) {
      console.warn('Lỗi load rooms:', e);
    } finally {
      setLoading(false);
    }
  };

  // Tính số đêm
  let nights = 1;
  let dateRange = '';
  if (checkIn && checkOut) {
    try {
      const start = parseISO(checkIn);
      const end = parseISO(checkOut);
      dateRange = `${format(start, 'dd MMM')} - ${format(end, 'dd MMM')}`;
      const d = differenceInDays(end, start);
      if (d > 0) nights = d;
    } catch (e) { }
  }

  // Group rooms of the same type and price
  const groupedRooms = useMemo(() => {
    const groups: { [key: string]: { representative: RoomDto; rooms: RoomDto[]; vacantCount: number } } = {};

    roomList.forEach(room => {
      const key = `${room.roomType || 'Standard'}-${room.pricePerNight}-${room.discountPrice || 0}-${room.capacity}-${room.bedCount}-${room.bedType || ''}-${room.isSmokingAllowed}`;
      if (!groups[key]) {
        groups[key] = {
          representative: room,
          rooms: [],
          vacantCount: 0
        };
      }
      groups[key].rooms.push(room);
      if (room.status !== 'SoldOut') {
        groups[key].vacantCount++;
      }
    });

    const mappedGroups = Object.values(groups).map(g => {
      const firstAvailable = g.rooms.find(r => r.status !== 'SoldOut') || g.rooms[0];
      return {
        room: {
          ...firstAvailable,
          status: g.vacantCount === 0 ? 'SoldOut' : firstAvailable.status
        },
        vacantCount: g.vacantCount
      };
    });

    // Sắp xếp: phòng hết (vacantCount === 0) đẩy xuống cuối
    return mappedGroups.sort((a, b) => {
      if (a.vacantCount === 0 && b.vacantCount > 0) return 1;
      if (b.vacantCount === 0 && a.vacantCount > 0) return -1;
      return 0;
    });
  }, [roomList]);

  const headerDateStr = (() => {
    const guests = adults ? `${adults} khách` : '1 khách';
    return dateRange ? `${dateRange}, ${guests}` : guests;
  })();

  const handleBook = (roomId: string, roomType: string, price: number) => {
    router.push({
      pathname: '/customer/booking/summary',
      params: {
        hotelId: hotelId || '',
        hotelName: hotelName || '',
        roomId,
        roomType,
        price: price.toString(),
        checkIn: checkIn || '',
        checkOut: checkOut || '',
        adults: adults || '',
        rooms: roomCount || '',
      },
    });
  };

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

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color="#000" />
        </TouchableOpacity>

        <View style={styles.searchPill}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pillTitle} numberOfLines={1}>{hotelName || 'Chọn phòng'}</Text>
            <Text style={styles.pillSub} numberOfLines={1}>{headerDateStr}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {groupedRooms.map(group => (
          <RoomCardItem
            key={group.room.id}
            room={group.room}
            nights={nights}
            roomCount={group.vacantCount.toString()}
            hotelId={hotelId || ''}
            hotelName={hotelName}
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            onBook={handleBook}
          />
        ))}
        {groupedRooms.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#6B7280' }}>Không có phòng trống.</Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 50,
    gap: 8,
  },
  backBtn: { padding: 4 },
  searchPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 22,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  pillTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  pillSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  headerIconBtn: { padding: 4, marginLeft: 4 },

  // Room Card
  roomCard: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  roomHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  roomTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  roomSizeTop: { fontSize: 13, color: '#4B5563', marginLeft: 8 },
  roomImgContainer: { position: 'relative', width: '100%', height: 180 },
  roomImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  roomImgBadge: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 4
  },
  roomImgBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  roomImgNext: {
    position: 'absolute', right: 10, top: '45%',
    backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 16, padding: 4
  },
  roomSpecs: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6 },
  roomSpecsText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  roomAmenities: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingBottom: 12, gap: 8
  },
  amenityItem: { flexDirection: 'row', alignItems: 'center' },
  amenityText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },

  roomDealBox: {
    margin: 12,
    borderWidth: 1, borderColor: '#DC2626',
    borderRadius: 8, overflow: 'hidden',
  },
  dealHeader: { backgroundColor: '#DC2626', paddingVertical: 6, paddingHorizontal: 10 },
  dealHeaderText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  dealContent: {
    flexDirection: 'column',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
  },
  dealColLeft: { marginBottom: 12 },
  dealRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dealRowText: { fontSize: 13, color: '#374151', marginLeft: 6 },

  dealColRight: { alignItems: 'flex-end', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  priceStrikeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  priceStrike: { fontSize: 11, color: '#6B7280', textDecorationLine: 'line-through', marginRight: 4 },
  priceDiscount: { fontSize: 11, color: '#DC2626', fontWeight: '600' },
  appliedDiscountBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: 4, marginBottom: 8
  },
  appliedDiscountText: { color: '#059669', fontSize: 10, fontWeight: '600', marginLeft: 4 },
  finalPriceRow: { flexDirection: 'row', alignItems: 'flex-end' },
  finalPrice: { fontSize: 18, fontWeight: '800', color: '#DC2626' },
  finalPriceCur: { fontSize: 12, color: '#DC2626', fontWeight: '700', marginBottom: 2 },

  dealFooter: {
    flexDirection: 'row', alignItems: 'center',
    padding: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB'
  },
  roomCountSelect: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginRight: 12
  },
  roomCountLabel: { fontSize: 11, fontWeight: '500', color: '#6B7280' },
  roomCountVal: { fontSize: 15, fontWeight: '700', color: '#111827' },
  bookRoomBtn: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  bookRoomBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
