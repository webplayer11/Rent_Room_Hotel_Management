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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format, differenceInDays } from 'date-fns';
import { hotelService } from '../../services/hotelService';
import { HotelSearchParams, HotelSearchResult, HotelPriceSummary } from '../../types/hotel';
import QuickRoomBottomSheet from '../../components/QuickRoomBottomSheet';
import PriceFilterBottomSheet from '../../components/PriceFilterBottomSheet';
import SortBottomSheet from '../../components/SortBottomSheet';

const { width } = Dimensions.get('window');

const calculatePrice = (hotel: HotelSearchResult, nights: number): HotelPriceSummary => {
  const safeNights = nights > 0 ? nights : 1;
  const totalBasePrice = hotel.basePrice * safeNights;
  const hotelDiscountAmount = totalBasePrice * (hotel.discountPercent / 100);
  const priceAfterHotelDiscount = totalBasePrice - hotelDiscountAmount;

  let voucherDiscountAmount = 0;
  if (hotel.voucher && priceAfterHotelDiscount >= hotel.voucher.minPrice) {
    if (hotel.voucher.discountType === 'percent') {
      voucherDiscountAmount = priceAfterHotelDiscount * (hotel.voucher.discountValue / 100);
      if (hotel.voucher.maxDiscount) {
        voucherDiscountAmount = Math.min(voucherDiscountAmount, hotel.voucher.maxDiscount);
      }
    } else {
      voucherDiscountAmount = hotel.voucher.discountValue;
    }
  }

  const finalPrice = Math.max(0, priceAfterHotelDiscount - voucherDiscountAmount);

  return {
    totalBasePrice,
    priceAfterHotelDiscount,
    voucherDiscountAmount,
    finalPrice,
    nights: safeNights
  };
};

const HotelListScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as HotelSearchParams;
  
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<HotelSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000000); // Mặc định 5tr
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);

  // Sort States
  const [sortType, setSortType] = useState('distance');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<{ id: string | number, name: string } | null>(null);

  const nights = useMemo(() => {
    if (!params.checkIn || !params.checkOut) return 1;
    try {
      const start = new Date(params.checkIn);
      const end = new Date(params.checkOut);
      const days = differenceInDays(end, start);
      return days > 0 ? days : 1;
    } catch (e) {
      return 1;
    }
  }, [params.checkIn, params.checkOut]);

  useEffect(() => {
    loadHotels();
  }, [params.location, minPrice, maxPrice, sortType]);

  const loadHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hotelService.searchHotels({
        ...params,
        minPrice,
        maxPrice,
        sortBy: sortType
      });
      setHotels(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const renderHotelItem = ({ item }: { item: HotelSearchResult }) => {
    const priceData = calculatePrice(item, nights);

    return (
      <View style={styles.hotelCard}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.push({
            pathname: `/hotel/${item.id}`,
            params: { ...params }
          })}
        >
          <View style={styles.cardMainRow}>
            {/* Left: Image Section */}
            <View style={styles.imageSection}>
              <Image source={{ uri: item.image }} style={styles.hotelImage} />
              {item.badges && item.badges.length > 0 && (
                <View style={styles.imageBadges}>
                  <View style={[styles.imgBadge, item.badges[0].includes('Eco') && styles.ecoBadge]}>
                    <Text style={styles.imgBadgeText}>{item.badges[0]}</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity style={styles.heartBtn} onPress={(e) => e.stopPropagation()}>
                <Ionicons name="heart-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Right: Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.hotelSubName} numberOfLines={1}>{item.address.split(',')[1]?.trim() || item.address}</Text>
              
              <Text style={styles.distanceText}>
                cách bạn {item.distance ? (item.distance < 1 ? `${Math.round(item.distance * 1000)}m` : `${item.distance.toFixed(1)}km`) : '...'}
              </Text>

              <View style={styles.typeRow}>
                <MaterialCommunityIcons name="home-city-outline" size={12} color="#00A651" />
                <Text style={styles.typeText}>{item.type}</Text>
              </View>

              <View style={styles.starsRow}>
                {[...Array(item.star)].map((_, i) => (
                  <Ionicons key={i} name="star" size={10} color="#FFB100" />
                ))}
              </View>

              <View style={styles.ratingRow}>
                <Text style={styles.ratingScore}>{item.rating} Tuyệt vời</Text>
                <Text style={styles.reviewCount}>{item.reviewCount} nhận xét</Text>
              </View>

              {item.availableRooms <= 3 && (
                <View style={styles.urgencyBadge}>
                  <Text style={styles.urgencyText}>Chỉ còn {item.availableRooms} phòng</Text>
                </View>
              )}

              {item.voucher && priceData.voucherDiscountAmount > 0 && (
                <View style={styles.voucherRow}>
                  <MaterialCommunityIcons name="ticket-percent" size={12} color="#00A651" />
                  <Text style={styles.voucherLabel}>Đã áp dụng Voucher {item.voucher.code}</Text>
                </View>
              )}

              <View style={styles.priceContainer}>
                {item.discountPercent > 0 && (
                  <View style={styles.priceMeta}>
                    <Text style={styles.oldPrice}>{priceData.totalBasePrice.toLocaleString('vi-VN')} ₫</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{item.discountPercent}%</Text>
                    </View>
                  </View>
                )}
                <Text style={styles.finalPrice}>{priceData.finalPrice.toLocaleString('vi-VN')} <Text style={styles.currency}>₫</Text></Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Promo Box */}
        {item.voucher && priceData.voucherDiscountAmount > 0 && (
          <View style={styles.promoBox}>
            <Ionicons name="checkmark-circle" size={14} color="#5392F9" />
            <Text style={styles.promoBoxText}> Đã áp dụng mã {item.voucher.code} - giảm {priceData.voucherDiscountAmount.toLocaleString('vi-VN')}đ</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.viewRoomFullBtn}
          onPress={() => {
            setSelectedHotel({ id: item.id, name: item.name });
            setBottomSheetVisible(true);
          }}
        >
          <MaterialCommunityIcons name="door-open" size={18} color="#5392F9" />
          <Text style={styles.viewRoomFullText}>Xem nhanh phòng</Text>
        </TouchableOpacity>
      </View>
    );
  };


  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
        <Ionicons name="chevron-back" size={24} color="rgba(83, 146, 249, 0.7)" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.searchSummary} onPress={() => router.back()}>
        <Text style={styles.summaryLoc}>{params.location || 'Gần chỗ tôi'}</Text>
        <Text style={styles.summaryMeta}>
          {params.checkIn ? format(new Date(params.checkIn), 'dd/MM') : '??'} - 
          {params.checkOut ? format(new Date(params.checkOut), 'dd/MM') : '??'} • {nights} đêm • {params.adults} NL
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.favHeaderIcon}>
        <Ionicons name="heart-outline" size={22} color="#444" />
      </TouchableOpacity>
    </View>
  );

  const FilterTabs = () => (
    <View style={styles.filterTabs}>
      <TouchableOpacity style={styles.tab}>
        <MaterialCommunityIcons name="filter-variant" size={16} color="#5392F9" />
        <Text style={styles.tabText}>Bộ lọc</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => setSortSheetVisible(true)}>
        <Ionicons name="swap-vertical" size={16} color="#5392F9" />
        <Text style={styles.tabText}>Sắp xếp</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => setPriceSheetVisible(true)}>
        <Ionicons name="cash-outline" size={16} color="#5392F9" />
        <Text style={styles.tabText}>Giá tiền</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#5392F9" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <Header />
      <FilterTabs />
      
      <FlatList
        data={hotels}
        renderItem={renderHotelItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />

      <QuickRoomBottomSheet 
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        hotelId={selectedHotel?.id || null}
        hotelName={selectedHotel?.name || ''}
        searchParams={params}
      />

      <PriceFilterBottomSheet
        visible={priceSheetVisible}
        onClose={() => setPriceSheetVisible(false)}
        onApply={(min, max) => {
          setMinPrice(min);
          setMaxPrice(max);
        }}
        initialMin={minPrice}
        initialMax={maxPrice}
        maxLimit={10000000} // Giới hạn 10tr cho slider
        totalResult={hotels.length}
      />

      <SortBottomSheet
        visible={sortSheetVisible}
        onClose={() => setSortSheetVisible(false)}
        onApply={(type) => setSortType(type)}
        selectedSort={sortType}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
  },
  backIcon: { padding: 4 },
  searchSummary: { flex: 1, marginLeft: 8 },
  summaryLoc: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  summaryMeta: { fontSize: 10, color: '#777', marginTop: 1 },
  favHeaderIcon: { padding: 4 },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#F0F0F0',
  },
  tabText: { fontSize: 11, color: '#444', marginLeft: 4, fontWeight: '500' },
  listPadding: { padding: 10 },
  hotelCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardMainRow: { flexDirection: 'row' },
  imageSection: {
    width: 110,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  hotelImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageBadges: { position: 'absolute', top: 0, left: 0, right: 0 },
  imgBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderBottomRightRadius: 8,
    alignSelf: 'flex-start',
  },
  ecoBadge: { backgroundColor: '#E8F5E9' },
  imgBadgeText: { color: '#2E7D32', fontSize: 8, fontWeight: 'bold' },
  heartBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 15,
    padding: 4,
  },
  infoSection: { flex: 1, marginLeft: 10 },
  statusText: { fontSize: 9, color: '#666', marginBottom: 2 },
  hotelName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  hotelSubName: { fontSize: 10, color: '#888', marginTop: 1 },
  distanceText: { fontSize: 10, color: '#666', marginTop: 2 },
  typeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  typeText: { fontSize: 10, color: '#333', marginLeft: 4, fontWeight: '500' },
  starsRow: { flexDirection: 'row', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingScore: { fontSize: 11, fontWeight: 'bold', color: '#5392F9' },
  reviewCount: { fontSize: 10, color: '#888', marginLeft: 4 },
  urgencyBadge: {
    backgroundColor: '#FFF1F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  urgencyText: { color: '#FF567D', fontSize: 9, fontWeight: 'bold' },
  voucherRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  voucherLabel: { fontSize: 9, color: '#00A651', fontWeight: 'bold', marginLeft: 4 },
  priceContainer: { marginTop: 8, alignItems: 'flex-end' },
  priceMeta: { flexDirection: 'row', alignItems: 'center' },
  oldPrice: { fontSize: 10, color: '#999', textDecorationLine: 'line-through' },
  discountBadge: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 5,
  },
  discountText: { color: '#E65100', fontSize: 8, fontWeight: 'bold' },
  finalPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF567D', marginTop: 1 },
  currency: { fontSize: 12 },
  attributesRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#EEE',
    marginTop: 10,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  attrItem: { flexDirection: 'row', alignItems: 'center' },
  attrText: { fontSize: 9, color: '#666', marginLeft: 4 },
  promoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 6,
    marginTop: 8,
  },
  promoBoxText: { fontSize: 9, color: '#64748B' },
  viewRoomFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 8,
    marginTop: 10,
  },
  viewRoomFullText: { color: '#5392F9', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
});

export default HotelListScreen;
