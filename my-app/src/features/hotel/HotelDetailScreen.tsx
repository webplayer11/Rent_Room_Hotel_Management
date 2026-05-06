import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format, differenceInDays } from 'date-fns';
import { hotelService } from '../../services/hotelService';
import { HotelDetail, HotelSearchParams, HotelPriceSummary } from '../../types/hotel';

const { width } = Dimensions.get('window');

const HotelDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as HotelSearchParams & { id: string };
  const hotelId = params.id;

  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (hotelId) loadDetail();
  }, [hotelId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await hotelService.getHotelDetail(hotelId);
      setHotel(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!hotel) return 0;
    const totalBasePrice = hotel.basePrice * nights;
    const priceAfterDiscount = totalBasePrice * (1 - hotel.discountPercent / 100);
    
    let voucherAmount = 0;
    if (hotel.voucher && priceAfterDiscount >= hotel.voucher.minPrice) {
      if (hotel.voucher.discountType === 'percent') {
        voucherAmount = Math.min(priceAfterDiscount * (hotel.voucher.discountValue / 100), hotel.voucher.maxDiscount || Infinity);
      } else {
        voucherAmount = hotel.voucher.discountValue;
      }
    }
    return Math.max(0, priceAfterDiscount - voucherAmount);
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#5392F9" /></View>
  );

  if (error || !hotel) return (
    <View style={styles.center}><Text>{error || 'Không tìm thấy dữ liệu'}</Text></View>
  );

  const finalPrice = calculateFinalPrice();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerName} numberOfLines={1}>{hotel.name}</Text>
          <Text style={styles.headerDates}>{format(new Date(params.checkIn || Date.now()), 'dd/MM')} - {format(new Date(params.checkOut || Date.now() + 86400000), 'dd/MM')} • {params.adults || 2} khách</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}><Ionicons name="share-outline" size={22} color="#333" /></TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}><Ionicons name="heart-outline" size={22} color="#333" /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: hotel.image }} style={styles.mainImage} />
          <View style={styles.imageCount}>
            <Text style={styles.imageCountText}>1/{hotel.images.length + 10}</Text>
          </View>
        </View>

        {/* Hotel Basic Info */}
        <View style={styles.section}>
          <View style={styles.badgesRow}>
            {hotel.badges?.map((badge, idx) => (
              <View key={idx} style={[styles.badge, badge.includes('VIP') && styles.vipBadge]}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.starsRow}>
            {[...Array(hotel.star)].map((_, i) => <Ionicons key={i} name="star" size={14} color="#FFB100" />)}
          </View>
          <Text style={styles.addressText}>{hotel.address}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingValue}>{hotel.rating}</Text>
            </View>
            <View style={styles.ratingInfo}>
              <Text style={styles.ratingLabel}>{hotel.ratingText}</Text>
              <Text style={styles.reviewCount}>{hotel.reviewCount} nhận xét</Text>
            </View>
            <TouchableOpacity style={styles.favBtn}><Ionicons name="heart-outline" size={24} color="#5392F9" /></TouchableOpacity>
          </View>
        </View>

        {/* Highlights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lý do khách hay đặt phòng ở đây</Text>
          <View style={styles.highlightsGrid}>
            {hotel.highlights.map((h, i) => (
              <View key={i} style={styles.highlightItem}>
                <Ionicons name="checkmark-circle" size={16} color="#00A651" />
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Amenities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Các tiện nghi Hàng đầu</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Xem hết</Text></TouchableOpacity>
          </View>
          <View style={styles.amenitiesGrid}>
            {hotel.topAmenities.map((a, i) => (
              <View key={i} style={styles.amenityItem}>
                <Ionicons name="checkbox" size={16} color="#5392F9" />
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vị trí</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Xem hết</Text></TouchableOpacity>
          </View>
          <Text style={styles.locationScoreText}>{hotel.locationScore} Tuyệt vời</Text>
          <Text style={styles.fullAddress}>{hotel.address}</Text>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={40} color="#DDD" />
            <Text style={styles.mapText}>Xem vị trí trên bản đồ</Text>
          </View>
          <View style={styles.nearbyList}>
            {hotel.nearbyPlaces.map((p, i) => (
              <View key={i} style={styles.nearbyItem}>
                <Text style={styles.nearbyName}>{p.name}</Text>
                <Text style={styles.nearbyDist}>{p.distance}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả cơ sở lưu trú</Text>
          <Text style={styles.descText} numberOfLines={3}>{hotel.description}</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Xem hết</Text></TouchableOpacity>
        </View>

        {/* Useful Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vài thông tin hữu ích</Text>
          <View style={styles.infoGroup}>
            <Text style={styles.groupLabel}>Nhận phòng / Trả phòng</Text>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Nhận phòng từ</Text><Text style={styles.infoValue}>{hotel.usefulInfo.checkInFrom}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Trả phòng đến</Text><Text style={styles.infoValue}>{hotel.usefulInfo.checkOutUntil}</Text></View>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.groupLabel}>Di chuyển</Text>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Khoảng cách từ trung tâm</Text><Text style={styles.infoValue}>{hotel.usefulInfo.distanceFromCityCenter}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Phí đưa đón sân bay</Text><Text style={styles.infoValue}>{hotel.usefulInfo.airportTransferFee.toLocaleString()} VND</Text></View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <View style={styles.priceSection}>
          <Text style={styles.footerPriceLabel}>Khởi điểm</Text>
          <Text style={styles.footerFinalPrice}>{finalPrice.toLocaleString('vi-VN')} ₫</Text>
          <View style={styles.todayBadge}><Text style={styles.todayText}>-{hotel.discountPercent}% HÔM NAY</Text></View>
        </View>
        <TouchableOpacity 
          style={styles.bookBtn}
          onPress={() => router.push({ pathname: `/hotel/${hotelId}/rooms`, params: { ...params } })}
        >
          <Text style={styles.bookBtnText}>Chọn phòng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 5 : 5,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerIcon: { padding: 5 },
  headerContent: { flex: 1, marginLeft: 10 },
  headerName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  headerDates: { fontSize: 11, color: '#666', marginTop: 2 },
  scrollContent: { paddingBottom: 100 },
  imageContainer: { width: '100%', height: 250, position: 'relative' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageCount: {
    position: 'absolute', bottom: 15, right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15,
  },
  imageCountText: { color: '#FFF', fontSize: 12 },
  section: { backgroundColor: '#FFF', padding: 15, marginBottom: 10 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  badge: { backgroundColor: '#E1F5FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8, marginBottom: 4 },
  vipBadge: { backgroundColor: '#FFF3E0' },
  badgeText: { fontSize: 10, color: '#01579B', fontWeight: 'bold' },
  hotelName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  starsRow: { flexDirection: 'row', marginBottom: 8 },
  addressText: { fontSize: 13, color: '#666', marginBottom: 15 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
  ratingBox: { backgroundColor: '#5392F9', padding: 8, borderRadius: 8 },
  ratingValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  ratingInfo: { flex: 1, marginLeft: 12 },
  ratingLabel: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  reviewCount: { fontSize: 12, color: '#777', marginTop: 2 },
  favBtn: { padding: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  seeAll: { fontSize: 13, color: '#5392F9', fontWeight: 'bold' },
  highlightsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  highlightItem: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  highlightText: { fontSize: 12, color: '#444', marginLeft: 8 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  amenityItem: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  amenityText: { fontSize: 12, color: '#444', marginLeft: 8 },
  locationScoreText: { fontSize: 14, fontWeight: 'bold', color: '#5392F9', marginBottom: 5 },
  fullAddress: { fontSize: 13, color: '#666', marginBottom: 15 },
  mapPlaceholder: {
    height: 150, backgroundColor: '#F0F0F0', borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC'
  },
  mapText: { fontSize: 12, color: '#888', marginTop: 8 },
  nearbyList: { marginTop: 15 },
  nearbyItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  nearbyName: { fontSize: 13, color: '#444' },
  nearbyDist: { fontSize: 12, color: '#888' },
  descText: { fontSize: 13, color: '#555', lineHeight: 20 },
  infoGroup: { marginBottom: 15 },
  groupLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: { fontSize: 12, color: '#666' },
  infoValue: { fontSize: 12, color: '#333', fontWeight: '500' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', flexDirection: 'row', padding: 15,
    borderTopWidth: 1, borderTopColor: '#EEE', alignItems: 'center',
  },
  priceSection: { flex: 1 },
  footerPriceLabel: { fontSize: 11, color: '#666' },
  footerFinalPrice: { fontSize: 20, fontWeight: 'bold', color: '#FF567D' },
  todayBadge: { backgroundColor: '#FFF1F1', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  todayText: { fontSize: 9, color: '#FF567D', fontWeight: 'bold' },
  bookBtn: { backgroundColor: '#5392F9', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25 },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default HotelDetailScreen;
