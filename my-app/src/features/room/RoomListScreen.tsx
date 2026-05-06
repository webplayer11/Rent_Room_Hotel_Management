import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format, differenceInDays } from 'date-fns';
import { roomService } from '../../services/roomService';
import { hotelService } from '../../services/hotelService';
import { Room, RoomSearchParams } from '../../types/room';
import { HotelDetail } from '../../types/hotel';

const { width } = Dimensions.get('window');

const RoomListScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const hotelId = params.id || params.hotelId;

  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});

  const nights = useMemo(() => {
    if (!params.checkIn || !params.checkOut) return 1;
    try {
      const days = differenceInDays(new Date(params.checkOut), new Date(params.checkIn));
      return days > 0 ? days : 1;
    } catch (e) {
      return 1;
    }
  }, [params.checkIn, params.checkOut]);

  useEffect(() => {
    loadData();
  }, [hotelId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomData, hotelData] = await Promise.all([
        roomService.getRoomsByHotelId(hotelId, params),
        hotelService.getHotelDetail(hotelId)
      ]);
      setRooms(roomData);
      setHotel(hotelData);
      
      const initialCounts: Record<string, number> = {};
      roomData.forEach(r => { initialCounts[r.id] = 1; });
      setSelectedCounts(initialCounts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (room: Room) => {
    const count = selectedCounts[room.id] || 1;
    const priceInfo = roomService.calculateRoomPrice(room, nights, count);
    
    router.push({
      pathname: '/booking/summary',
      params: {
        roomId: room.id,
        hotelId,
        selectedRoomCount: count,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        nights: nights,
        adults: params.adults,
        children: params.children,
        finalPrice: priceInfo.finalPrice,
      }
    });
  };

  const renderRoomItem = ({ item }: { item: Room }) => {
    const count = selectedCounts[item.id] || 1;
    const priceInfo = roomService.calculateRoomPrice(item, nights, count);

    return (
      <View style={styles.roomCard}>
        {/* Room Image with Badges */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.images[0] }} style={styles.roomImage} />
          <View style={styles.imgIndicator}><Text style={styles.imgIndicatorText}>1/{item.images.length + 10}</Text></View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.roomName}>{item.name}</Text>
          

          {/* Quick Info */}
          <View style={styles.quickInfoRow}>
            <View style={styles.infoChip}><Ionicons name="resize-outline" size={14} color="#666" /><Text style={styles.chipText}>{item.area}</Text></View>
            <View style={styles.infoChip}><Ionicons name="people-outline" size={14} color="#666" /><Text style={styles.chipText}>Tối đa {item.maxAdults} người lớn</Text></View>
            <View style={styles.infoChip}><Ionicons name="bed-outline" size={14} color="#666" /><Text style={styles.chipText}>{item.bedInfo}</Text></View>
          </View>

          {/* Amenities Grid */}
          <View style={styles.amenitiesGrid}>
            {item.amenities.slice(0, 6).map((a, idx) => (
              <View key={idx} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle-outline" size={12} color="#00A651" />
                <Text style={styles.amenityText} numberOfLines={1}>{a}</Text>
              </View>
            ))}
          </View>

          {/* Policies & Perks */}
          <View style={styles.policyBox}>
            <View style={styles.policyRow}>
              <Ionicons name="cafe-outline" size={14} color="#00A651" />
              <Text style={styles.policyText}>Phục vụ bữa sáng ({item.breakfastFee.toLocaleString()}đ / người)</Text>
            </View>
            {item.refundable && (
              <View style={styles.policyRow}>
                <Ionicons name="calendar-outline" size={14} color="#00A651" />
                <Text style={styles.policyText}>Chính sách hủy linh hoạt</Text>
              </View>
            )}
            {item.noCreditCardRequired && (
              <View style={styles.policyRow}>
                <Ionicons name="card-outline" size={14} color="#00A651" />
                <Text style={styles.policyText}>Không cần thẻ tín dụng</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.detailLink}>
            <Text style={styles.detailLinkText}>Xem chi tiết phòng</Text>
            <Ionicons name="chevron-forward" size={14} color="#5392F9" />
          </TouchableOpacity>

          {/* Pricing Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceTop}>
              <Text style={styles.oldPrice}>{priceInfo.totalBasePrice.toLocaleString('vi-VN')} đ</Text>
              <View style={styles.discountBadge}><Text style={styles.discountText}>-{item.discountPercent}%</Text></View>
            </View>
            <Text style={styles.finalPrice}>{priceInfo.finalPrice.toLocaleString('vi-VN')}đ</Text>
            <Text style={styles.urgencyFooter}>Chỉ chúng 2 phút thôi!</Text>
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.favBtn}>
            <Ionicons name="heart-outline" size={20} color="#5392F9" />
          </TouchableOpacity>
          
          <View style={styles.countPicker}>
            <View style={styles.countContainer}>
              <TouchableOpacity 
                style={styles.countAdjustBtn}
                onPress={() => setSelectedCounts(prev => ({...prev, [item.id]: Math.max(1, count - 1)}))}
              >
                <Ionicons name="remove" size={18} color="#5392F9" />
              </TouchableOpacity>
              
              <View style={styles.countTextWrapper}>
                <Text style={styles.countValue}>{count}</Text>
                <Text style={styles.countLabel}>phòng</Text>
              </View>

              <TouchableOpacity 
                style={styles.countAdjustBtn}
                onPress={() => setSelectedCounts(prev => ({...prev, [item.id]: Math.min(item.availableRooms, count + 1)}))}
              >
                <Ionicons name="add" size={18} color="#5392F9" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.bookBtn} onPress={() => handleBookNow(item)}>
            <Text style={styles.bookBtnText}>Đặt ngay</Text>
            <Text style={styles.payLaterText}>{item.payAtHotel ? 'Trả tại khách sạn' : 'Thanh toán ngay'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#5392F9" /></View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{hotel?.name || 'Đang tải...'}</Text>
          <Text style={styles.headerSubtitle}>
            {format(new Date(params.checkIn || Date.now()), 'dd/MM')} - {format(new Date(params.checkOut || Date.now() + 86400000), 'dd/MM')} • {params.adults || 2} khách
          </Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}><Ionicons name="share-outline" size={22} color="#333" /></TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.center}><Text>Không còn phòng trống cho tiêu chí này</Text></View>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 5 : 5,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerIcon: { padding: 5 },
  headerContent: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  listPadding: { padding: 12 },
  roomCard: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  imageWrapper: { width: '100%', height: 200, position: 'relative' },
  roomImage: { width: '100%', height: '100%' },
  imgIndicator: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  imgIndicatorText: { color: '#FFF', fontSize: 11 },
  cardBody: { padding: 15 },
  roomName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  quickInfoRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  infoChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 15, marginRight: 8, marginBottom: 5 },
  chipText: { fontSize: 11, color: '#666', marginLeft: 4 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  amenityItem: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  amenityText: { fontSize: 11, color: '#444', marginLeft: 5 },
  policyBox: { backgroundColor: '#F1F8E9', padding: 10, borderRadius: 8, marginBottom: 15 },
  policyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  policyText: { fontSize: 11, color: '#2E7D32', marginLeft: 8 },
  detailLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  detailLinkText: { fontSize: 13, color: '#5392F9', fontWeight: 'bold', marginRight: 4 },
  priceSection: { alignItems: 'flex-end', marginBottom: 10 },
  priceTop: { flexDirection: 'row', alignItems: 'center' },
  oldPrice: { fontSize: 13, color: '#999', textDecorationLine: 'line-through', marginRight: 8 },
  discountBadge: { backgroundColor: '#FF567D', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  finalPrice: { fontSize: 22, fontWeight: 'bold', color: '#FF567D', marginTop: 4 },
  urgencyFooter: { fontSize: 11, color: '#D32F2F', fontStyle: 'italic', marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', padding: 15, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#FAFAFA' },
  favBtn: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  countPicker: { 
    flex: 1, 
    marginRight: 10,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  countAdjustBtn: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countTextWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countValue: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#333',
  },
  countLabel: { 
    fontSize: 10, 
    color: '#666', 
    marginLeft: 4,
  },
  bookBtn: { 
    backgroundColor: '#5392F9', 
    paddingHorizontal: 22, 
    height: 40,
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center' 
  },
  bookBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  payLaterText: { color: '#FFF', fontSize: 8, opacity: 0.9, marginTop: -2 },
});

export default RoomListScreen;
