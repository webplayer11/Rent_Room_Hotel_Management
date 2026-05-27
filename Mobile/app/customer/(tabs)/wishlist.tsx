import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { favoriteApi, FavoriteHotelDto } from '../../../src/shared/api/favoriteApi';
import { IMAGE_URL } from '../../../src/config';

const WishlistScreen = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteHotelDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload mỗi khi tab này được focus (đảm bảo đồng bộ với list.tsx)
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteApi.getMyFavorites();
      if (res.isSuccess && res.data) {
        setFavorites(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách yêu thích:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (hotelId: string) => {
    try {
      const res = await favoriteApi.toggleFavorite(hotelId);
      if (res.isSuccess) {
        setFavorites(prev => prev.filter(h => h.id !== hotelId));
      }
    } catch (err) {
      console.warn('Lỗi xóa khách sạn:', err);
    }
  };

  const getImageUrl = (item: FavoriteHotelDto) => {
    const url = item.images?.find((img: any) => img.isPrimary)?.url || item.images?.[0]?.url;
    if (!url) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
    return url.startsWith('http') ? url : `${IMAGE_URL}/${url}`;
  };

  const renderItem = ({ item }: { item: FavoriteHotelDto }) => {
    const starCount = item.starRating ? Math.round(item.starRating) : 0;
    const minPrice = item.availableRooms && item.availableRooms.length > 0
      ? Math.min(...item.availableRooms.map(r => r.pricePerNight))
      : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/customer/hotel/${item.id}`)}
        activeOpacity={0.95}
      >
        <View style={styles.cardTop}>
          {/* Ảnh */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: getImageUrl(item) }} style={styles.image} />
            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => removeFavorite(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="heart" size={22} color="#FF567D" />
            </TouchableOpacity>
          </View>

          {/* Nội dung */}
          <View style={styles.cardContent}>
            <Text style={styles.hotelName} numberOfLines={2}>{item.name || 'Chưa có tên'}</Text>

            {/* Số sao */}
            {starCount > 0 && (
              <View style={styles.starsRow}>
                {Array.from({ length: starCount }).map((_, i) => (
                  <Ionicons key={i} name="star" size={12} color="#D97706" />
                ))}
              </View>
            )}

            <Text style={styles.locationText} numberOfLines={2}>
              {item.address || 'Chưa có địa chỉ'}
            </Text>

            {/* Giá */}
            <View style={styles.priceContainer}>
              {minPrice > 0 ? (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Từ</Text>
                  <Text style={styles.priceValue}>{minPrice.toLocaleString('vi-VN')}</Text>
                  <Text style={styles.priceCurrency}> ₫/đêm</Text>
                </View>
              ) : (
                <Text style={styles.noPriceText}>Liên hệ để biết giá</Text>
              )}
            </View>

            {/* Nút xem chi tiết */}
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => router.push(`/customer/hotel/${item.id}`)}
            >
              <Text style={styles.viewBtnText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đã lưu</Text>
        <TouchableOpacity style={styles.headerSearchBtn}>
          <Feather name="search" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5392F9" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={90} color="#DDD" />
          <Text style={styles.emptyTitle}>Chưa có khách sạn nào được lưu</Text>
          <Text style={styles.emptySubTitle}>
            Nhấn biểu tượng ❤️ trên danh sách khách sạn để lưu lại
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/customer/(tabs)/home')}
          >
            <Text style={styles.exploreBtnText}>Khám phá khách sạn</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.countBar}>
            <Text style={styles.countText}>{favorites.length} khách sạn đã lưu</Text>
          </View>
          <FlatList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: '#F3F4F6' }}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerSearchBtn: {
    padding: 4,
  },
  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  countText: {
    fontSize: 13,
    color: '#6B7280',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  emptySubTitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreBtn: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  listContent: {
    padding: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardTop: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: '35%',
    height: 170,
    position: 'relative',
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 5,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  hotelName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 6,
  },
  priceContainer: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginRight: 4,
    marginBottom: 1,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#DC2626',
  },
  priceCurrency: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 2,
  },
  noPriceText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  viewBtn: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default WishlistScreen;
