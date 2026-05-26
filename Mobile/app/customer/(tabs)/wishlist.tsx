import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { favoriteApi, FavoriteHotelDto } from '../../../src/shared/api/favoriteApi';

const WishlistScreen = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteHotelDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

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

  const renderItem = ({ item }: { item: FavoriteHotelDto }) => {
    const basePrice = item.availableRooms?.[0]?.pricePerNight || 0;
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/customer/hotel/${item.id}`)}
      >
        <Image 
          source={{ uri: item.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945' }} 
          style={styles.image} 
        />
        <TouchableOpacity 
          style={styles.heartBtn}
          onPress={() => removeFavorite(item.id)}
        >
          <Ionicons name="heart" size={20} color="#FF567D" />
        </TouchableOpacity>
        
        <View style={styles.cardContent}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingRow}>
            {[...Array(item.starRating || 0)].map((_, i) => (
              <Ionicons key={i} name="star" size={12} color="#FFB100" />
            ))}
          </View>
          <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá từ</Text>
            <Text style={styles.priceVal}>{basePrice.toLocaleString('vi-VN')} ₫</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5392F9" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>Chưa có khách sạn nào được lưu</Text>
          <Text style={styles.emptySubText}>Lưu khách sạn bạn thích để xem lại sau</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyText: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  emptySubText: { marginTop: 10, fontSize: 14, color: '#999', textAlign: 'center' },
  listContent: { padding: 15 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 12, marginBottom: 15, 
    overflow: 'hidden', elevation: 2, shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 
  },
  image: { width: '100%', height: 150 },
  heartBtn: { 
    position: 'absolute', top: 10, right: 10, 
    backgroundColor: '#FFF', borderRadius: 20, padding: 6, 
    elevation: 3 
  },
  cardContent: { padding: 15 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', marginBottom: 6 },
  address: { fontSize: 13, color: '#666', marginBottom: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  priceLabel: { fontSize: 12, color: '#999' },
  priceVal: { fontSize: 16, fontWeight: 'bold', color: '#FF567D' }
});

export default WishlistScreen;
