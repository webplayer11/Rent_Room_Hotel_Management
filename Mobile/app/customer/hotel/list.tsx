import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Modal
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format, parseISO, differenceInDays } from 'date-fns';
import { hotelApi } from '../../../src/shared/api/hotelApi';
import { favoriteApi } from '../../../src/shared/api/favoriteApi';
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
  // Set lưu các hotelId đã được yêu thích
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Filter & Sort States
  const [sortOrder, setSortOrder] = useState<null | 'price_asc' | 'price_desc'>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(30000000);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  let nights = 1;
  if (params.checkIn && params.checkOut) {
    try {
      const start = parseISO(params.checkIn as string);
      const end = parseISO(params.checkOut as string);
      const d = differenceInDays(end, start);
      if (d > 0) nights = d;
    } catch (e) { }
  }
  const multiplier = nights;

  useEffect(() => {
    loadFavoriteIds();
    loadHotels();
  }, [params.location, params.checkIn, params.checkOut, params.rooms, params.adults]);

  const loadFavoriteIds = async () => {
    try {
      const res = await favoriteApi.getMyFavorites();
      if (res.isSuccess && res.data) {
        setFavoriteIds(new Set(res.data.map((h: any) => h.id)));
      }
    } catch (_) { }
  };

  const toggleFavorite = async (hotelId: string) => {
    try {
      const res = await favoriteApi.toggleFavorite(hotelId);
      if (res.isSuccess) {
        setFavoriteIds(prev => {
          const next = new Set(prev);
          if (res.data.isFavorited) next.add(hotelId);
          else next.delete(hotelId);
          return next;
        });
      }
    } catch (_) { }
  };

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
        // DEBUG: xem raw data từ API
        console.log('=== SEARCH RESPONSE RAW ===');
        response.data.forEach((h: any) => {
          console.log(`Hotel: ${h.name}`);
          console.log(`  availableRooms count: ${(h.availableRooms || []).length}`);
          (h.availableRooms || []).forEach((r: any) => {
            console.log(`  Room: ${r.roomType || r.roomNumber}, status=${r.status}, price=${r.pricePerNight}, discount=${r.discountPrice}`);
          });
        });

        const mappedData: HotelSearchResult[] = response.data.map((h: any) => {
          const primaryImage = h.images?.find((img: any) => img.isPrimary)?.url || h.images?.[0]?.url;
          const imageUrl = primaryImage
            ? (primaryImage.startsWith("http") ? primaryImage : `${IMAGE_URL}/${primaryImage}`)
            : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

          // Lấy giá thấp nhất từ danh sách phòng còn trống (loại SoldOut, Maintenance)
          let minPrice = 0;
          const vacantRooms = (h.availableRooms || []).filter(
            (r: any) => r.status !== 'SoldOut' && r.status !== 'Maintenance'
          );
          if (vacantRooms.length > 0) {
            minPrice = Math.min(...vacantRooms.map((r: any) => {
              return r.discountPrice && r.discountPrice > 0 && r.discountPrice < r.pricePerNight
                ? r.discountPrice
                : r.pricePerNight;
            }));
          }

          console.log(`  => minPrice for ${h.name}: ${minPrice}, vacantRooms: ${vacantRooms.length}`);

          return {
            id: h.id,
            name: h.name || 'Chưa có tên',
            address: h.address || 'Chưa có địa chỉ',
            image: imageUrl,
            rating: h.starRating ?? 0,
            basePrice: minPrice * multiplier,
            discountPercent: 0,
            badges: [],
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

  const filteredAndSortedHotels = useMemo(() => {
    let result = hotels.filter(h => h.basePrice <= maxPriceFilter);
    if (sortOrder === 'price_asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    }
    return result;
  }, [hotels, maxPriceFilter, sortOrder]);

  const renderHeader = () => {
    let dateStr = 'Th 3, 26 thg 5 - Th 4, 27 thg 5...';
    if (params.checkIn && params.checkOut) {
      try {
        dateStr = `${format(parseISO(params.checkIn as string), 'dd MMM')} - ${format(parseISO(params.checkOut as string), 'dd MMM')}`;
      } catch (e) { }
    }

    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerSearch}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSearchTitle} numberOfLines={1}>
              {params.location || 'Hồ Chí Minh (6.389)'}
            </Text>
            <Text style={styles.headerSearchSubtitle} numberOfLines={1}>{dateStr}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFilterBar = () => {
    return (
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterTab} onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.filterTabText}>Bộ lọc giá</Text>
          <Feather name="chevron-down" size={16} color="#475569" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <View style={styles.filterDivider} />
        <TouchableOpacity style={styles.filterTab} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.filterTabText}>Sắp xếp</Text>
          <Feather name="chevron-down" size={16} color="#475569" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPromoBanner = () => null;

  const renderHotelItem = ({ item }: { item: HotelSearchResult }) => {
    const starCount = item.rating ? Math.round(Number(item.rating)) : 0;
    const isFav = favoriteIds.has(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({
          pathname: `/customer/hotel/[id]`,
          params: {
            id: item.id,
            checkIn: params.checkIn,
            checkOut: params.checkOut,
            rooms: params.rooms,
            adults: params.adults
          }
        })}
        activeOpacity={0.95}
      >
        <View style={styles.cardTop}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => toggleFavorite(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={24}
                color={isFav ? '#FF567D' : '#111'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.hotelName} numberOfLines={2}>{item.name}</Text>

            {/* Số sao thật */}
            {starCount > 0 && (
              <View style={styles.starsRow}>
                {Array.from({ length: starCount }).map((_, i) => (
                  <Ionicons key={i} name="star" size={12} color="#D97706" />
                ))}
              </View>
            )}

            <Text style={styles.locationText} numberOfLines={2}>{item.address}</Text>

            {/* Điểm đánh giá thật */}
            {starCount > 0 && (
              <View style={styles.ratingRow}>
                <View style={styles.ratingScore}>
                  <Text style={styles.ratingScoreText}>{item.rating}</Text>
                </View>
                <Text style={styles.ratingLabel}>
                  {starCount >= 5 ? 'Tuyệt vời' : starCount >= 4 ? 'Rất tốt' : starCount >= 3 ? 'Tốt' : 'Hài Lòng'}
                </Text>
              </View>
            )}

            <View style={styles.priceContainer}>
              {item.basePrice > 0 ? (
                <>
                  <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'right' }}>Từ</Text>
                  <View style={styles.currentPriceRow}>
                    <Text style={styles.currentPrice}>{item.basePrice.toLocaleString('vi-VN')}</Text>
                    <Text style={styles.currencySymbol}>₫</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                    /{nights} đêm, 1 phòng
                  </Text>
                </>
              ) : (
                <Text style={styles.noPriceText}>Liên hệ để biết giá</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
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
          data={filteredAndSortedHotels}
          renderItem={renderHotelItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderPromoBanner}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: '#F3F4F6' }}
        />
      )}

      {/* MODAL SẮP XẾP */}
      <Modal visible={sortModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sắp xếp theo</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}><Ionicons name="close" size={24} color="#111" /></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setSortOrder(null); setSortModalVisible(false); }}>
              <Text style={[styles.modalOptionText, sortOrder === null && styles.modalOptionActive]}>Phù hợp nhất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setSortOrder('price_asc'); setSortModalVisible(false); }}>
              <Text style={[styles.modalOptionText, sortOrder === 'price_asc' && styles.modalOptionActive]}>Giá thấp nhất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setSortOrder('price_desc'); setSortModalVisible(false); }}>
              <Text style={[styles.modalOptionText, sortOrder === 'price_desc' && styles.modalOptionActive]}>Giá cao nhất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL BỘ LỌC GIÁ */}
      <Modal visible={filterModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc giá</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Ionicons name="close" size={24} color="#111" /></TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <Text style={{ marginBottom: 15, fontSize: 16, fontWeight: '600', color: '#111827' }}>
                Giá tối đa: {maxPriceFilter.toLocaleString('vi-VN')} ₫
              </Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={30000000}
                step={100000}
                value={maxPriceFilter}
                onValueChange={setMaxPriceFilter}
                minimumTrackTintColor="#2563EB"
                maximumTrackTintColor="#E2E8F0"
                thumbTintColor="#2563EB"
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#2563EB',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 20
                }}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                  Xem {filteredAndSortedHotels.length} kết quả
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerSearch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerSearchIcon: {
    marginRight: 8,
  },
  headerSearchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  headerSearchSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 12,
  },
  headerIconBtn: {
    padding: 2,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  filterTabText: {
    fontSize: 13,
    color: '#374151',
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  listContainer: {
    paddingBottom: 24,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    margin: 12,
    padding: 12,
    borderRadius: 8,
  },
  promoText: {
    flex: 1,
    fontSize: 13,
    color: '#065F46',
    fontWeight: '600',
    marginLeft: 8,
  },
  promoAction: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    padding: 12,
  },
  cardTop: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: '32%',
    height: 190,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    padding: 2,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 12,
  },
  hotelName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 20,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 6,
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingScore: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderBottomLeftRadius: 2,
    marginRight: 6,
  },
  ratingScoreText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
  },
  currencySymbol: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 2,
    marginLeft: 3,
  },
  noPriceText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
