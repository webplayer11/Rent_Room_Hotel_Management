import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format, differenceInDays, parseISO } from 'date-fns';
import { hotelApi } from '../../../src/shared/api/hotelApi';
import { IMAGE_URL } from '../../../src/config';

type HotelSearchResult = {
  id: string;
  name: string;
  address: string;
  image: string;
  rating: number;
  basePrice: number;
  discountPercent: number;
  badges: string[];
};

export default function HotelListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<HotelSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const nights = useMemo(() => {
    if (!params.checkIn || !params.checkOut) return 1;
    try {
      const start = parseISO(params.checkIn as string);
      const end = parseISO(params.checkOut as string);
      const days = differenceInDays(end, start);
      return days > 0 ? days : 1;
    } catch (e) {
      return 1;
    }
  }, [params.checkIn, params.checkOut]);

  useEffect(() => {
    loadHotels();
  }, [params.location, params.checkIn, params.checkOut, params.rooms, params.adults]);

  const loadHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hotelApi.searchHotels({
        location: params.location as string | undefined,
        latitude: params.latitude ? Number(params.latitude) : undefined,
        longitude: params.longitude ? Number(params.longitude) : undefined,
        radiusKm: 50,
        checkInDate: params.checkIn ? (params.checkIn as string).split('T')[0] : undefined,
        checkOutDate: params.checkOut ? (params.checkOut as string).split('T')[0] : undefined,
        roomCount: params.rooms ? Number(params.rooms as string) : 1,
        guestCount: params.adults ? Number(params.adults as string) : 1,
      });

      if (response.isSuccess && response.data) {
        const mappedData: HotelSearchResult[] = response.data.map((h: any) => {
          const primaryImage = h.images?.find((img: any) => img.isPrimary)?.url || h.images?.[0]?.url;
          const imageUrl = primaryImage 
            ? (primaryImage.startsWith("http") ? primaryImage : `${IMAGE_URL}/${primaryImage}`)
            : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

          // Tính giá nhỏ nhất từ các phòng trống
          let minPrice = 0;
          if (h.availableRooms && h.availableRooms.length > 0) {
            minPrice = Math.min(...h.availableRooms.map((r: any) => r.pricePerNight));
          }

          // Giả lập discount (vì BE chưa có)
          const discount = Math.floor(Math.random() * 20) + 10; // Giảm 10-30%

          return {
            id: h.id,
            name: h.name || 'Khách sạn chưa có tên',
            address: h.address || 'Chưa có địa chỉ',
            image: imageUrl,
            rating: h.starRating ? h.starRating : (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Giả lập rating nếu không có
            basePrice: minPrice,
            discountPercent: discount,
            badges: h.isApproved ? ['Free Cancellation'] : [],
          };
        });
        setHotels(mappedData);
      } else {
        setError(response.message || 'Lỗi tải dữ liệu');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    let dateStr = '';
    if (params.checkIn && params.checkOut) {
      dateStr = `${format(parseISO(params.checkIn as string), 'dd MMM')} - ${format(parseISO(params.checkOut as string), 'dd MMM')} • ${params.adults || 2} Adults`;
    }

    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{params.location || 'Gần bạn'}</Text>
          {dateStr ? <Text style={styles.headerSubtitle}>{dateStr}</Text> : null}
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Feather name="search" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilterBar = () => {
    return (
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity style={styles.filterPill}>
            <Ionicons name="options-outline" size={16} color="#475569" style={{ marginRight: 6 }} />
            <Text style={styles.filterPillText}>Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterPill, styles.filterPillActive]}>
            <Text style={styles.filterPillTextActive}>Popularity</Text>
            <Feather name="chevron-down" size={16} color="#FFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterPillText}>Price</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterPillText}>Rating</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderSubHeader = () => {
    return (
      <View style={styles.subHeader}>
        <Text style={styles.resultCount}>{hotels.length} properties found</Text>
        <TouchableOpacity style={styles.mapBtn}>
          <Feather name="map" size={14} color="#0F172A" style={{ marginRight: 4 }} />
          <Text style={styles.mapBtnText}>View Map</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHotelItem = ({ item }: { item: HotelSearchResult }) => {
    // Tính giá
    const priceAfterDiscount = item.basePrice * (1 - item.discountPercent / 100);

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <TouchableOpacity style={styles.heartBtn}>
            <Ionicons name="heart-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.topRatedBadge}>
            <Text style={styles.topRatedText}>TOP RATED</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#000" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>

          <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>

          <View style={styles.badgesRow}>
            {item.badges.includes('Free Cancellation') && (
              <View style={styles.freeCancelBadge}>
                <Feather name="check-circle" size={12} color="#059669" />
                <Text style={styles.freeCancelText}>Free Cancellation</Text>
              </View>
            )}
            <View style={styles.specialOfferBadge}>
              <Feather name="tag" size={12} color="#475569" />
              <Text style={styles.specialOfferText}>Special Offer</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.oldPrice}>
                {item.basePrice > 0 ? (item.basePrice.toLocaleString('vi-VN') + ' ₫') : ''}
              </Text>
              <Text style={styles.currentPrice}>
                {priceAfterDiscount > 0 ? (priceAfterDiscount.toLocaleString('vi-VN') + ' ₫') : 'Hết phòng'}
              </Text>
              <Text style={styles.perNight}>per night</Text>
            </View>

            <TouchableOpacity 
              style={styles.viewDealBtn}
              onPress={() => router.push(`/customer/hotel/${item.id}`)}
            >
              <Text style={styles.viewDealText}>View Deal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      {renderFilterBar()}
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={hotels}
          renderItem={renderHotelItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderSubHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A', // Slate 900
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B', // Slate 500
  },
  searchBtn: {
    padding: 4,
  },
  filterBar: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9', // Slate 100
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Slate 200
    backgroundColor: '#FFF',
    marginRight: 10,
  },
  filterPillActive: {
    backgroundColor: '#0F172A', // Slate 900
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 14,
    color: '#475569', // Slate 600
    fontWeight: '500',
  },
  filterPillTextActive: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#64748B',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapBtnText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden', // Để bo góc ảnh phía trên
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRatedBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#FDE68A', // Vàng nhạt (amber-200)
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  topRatedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E', // Nâu đậm (amber-800)
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hotelName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE68A', // Giống badge
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginLeft: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Khoảng cách giữa các badge (hỗ trợ RN mới)
    marginBottom: 16,
  },
  freeCancelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5', // Xanh lá nhạt (emerald-100)
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeCancelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669', // Xanh lá đậm (emerald-600)
    marginLeft: 4,
  },
  specialOfferBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Xám nhạt (slate-100)
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specialOfferText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  oldPrice: {
    fontSize: 13,
    color: '#94A3B8', // Slate 400
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  perNight: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  viewDealBtn: {
    backgroundColor: '#0F172A', // Xanh đen đậm
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewDealText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
