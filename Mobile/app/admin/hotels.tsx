import Toast from 'react-native-toast-message';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ChevronLeft, Star, MapPin } from 'lucide-react-native';
import { adminApi, PendingHotelDto } from '../../src/shared/api/adminApi';
import { router, Stack, useFocusEffect } from 'expo-router';
import { IMAGE_URL } from '../../src/config';

// ─── Types ──────────────────────────────────────────────────────────
type TabType = 'all' | 'pending' | 'approved';

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
];

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Tính badge theo 2 boolean của backend (Hotel.cs):
 *   IsApproved | IsActive → trạng thái hiển thị
 */
const getStatusBadge = (hotel: PendingHotelDto) => {
  if (!hotel.isApproved && hotel.isActive)  return { label: 'Chờ duyệt',       bg: '#FEF3C7', color: '#92400E' };
  if (hotel.isApproved  && hotel.isActive)  return { label: 'Đang hoạt động',  bg: '#DCFCE7', color: '#166534' };
  if (hotel.isApproved  && !hotel.isActive) return { label: 'Tạm khóa',         bg: '#FEE2E2', color: '#991B1B' };
  return                                           { label: 'Không hoạt động', bg: '#F1F5F9', color: '#475569' };
};

/** Resolve ảnh từ MinIO/relative URL → absolute URL */
const resolveImageUrl = (url: string | undefined | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const cleanUrl  = url.startsWith('/') ? url.substring(1) : url;
  const cleanBase = IMAGE_URL.endsWith('/') ? IMAGE_URL.slice(0, -1) : IMAGE_URL;
  return `${cleanBase}/${cleanUrl}`;
};

// ─── Component ───────────────────────────────────────────────────────
export default function HotelsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [hotels,   setHotels]    = useState<PendingHotelDto[]>([]);
  const [loading,  setLoading]   = useState(false);
  const [error,    setError]     = useState<string | null>(null);

  // ── Data loading ────────────────────────────────────────────────
  const loadHotels = useCallback(async (tab: TabType) => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (tab === 'all')      result = await adminApi.getAllHotels();
      else if (tab === 'pending')  result = await adminApi.getPendingHotel();
      else                         result = await adminApi.getApprovedHotels();

      if (result.isSuccess) {
        setHotels(result.data || []);
      } else {
        setError(result.message || 'Không tải được danh sách');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload khi tab focus hoặc tab thay đổi
  useFocusEffect(
    useCallback(() => {
      loadHotels(activeTab);
    }, [activeTab, loadHotels])
  );

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    // loadHotels sẽ được gọi lại bởi useFocusEffect khi activeTab thay đổi
    // nhưng useFocusEffect chỉ re-run khi dependency thay đổi sau focus
    // nên gọi thẳng để ngay lập tức
    loadHotels(tab);
  };

  // ── Render card ─────────────────────────────────────────────────
  const renderItem = ({ item }: { item: PendingHotelDto }) => {
    const badge = getStatusBadge(item);

    // Ảnh đầu tiên — images có thể là HotelImageDto[] hoặc string[]
    const firstImage = item.images?.[0];
    const rawUrl     = firstImage ? (firstImage.url ?? firstImage) : null;
    const imageUrl   = resolveImageUrl(typeof rawUrl === 'string' ? rawUrl : null);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() =>
          router.push({
            pathname: '/admin/hotel-detail',
            params: { id: item.id },
          })
        }
      >
        {/* Thumbnail */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.thumbnailEmoji}>🏨</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.cardContent}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {item.name || 'Chưa có tên'}
          </Text>

          {item.address ? (
            <View style={styles.rowInline}>
              <MapPin size={12} color="#94A3B8" style={{ marginRight: 4 }} />
              <Text style={styles.hotelAddress} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          ) : null}

          {item.starRating ? (
            <View style={styles.rowInline}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 4 }} />
              <Text style={styles.starText}>{item.starRating} sao</Text>
            </View>
          ) : null}

          {/* Status badge */}
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── UI states ───────────────────────────────────────────────────
  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5392F9" />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadHotels(activeTab)}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={hotels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={() => loadHotels(activeTab)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Không có khách sạn nào</Text>
          </View>
        }
      />
    );
  };

  // ── Main render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Quản lý khách sạn',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.segmentBtn,
              activeTab === tab.key && styles.segmentBtnActive,
            ]}
            onPress={() => handleTabChange(tab.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === tab.key && styles.segmentTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderBody()}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // ── Segmented control ──
  segmentContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#5392F9',
  },

  // ── List ──
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ── Card ──
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnail: {
    width: 88,
    height: 88,
  },
  thumbnailPlaceholder: {
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailEmoji: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  hotelName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelAddress: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  starText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },

  // ── Badge ──
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── States ──
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 10,
    color: '#4B5563',
    fontSize: 14,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  retryBtn: {
    backgroundColor: '#5392F9',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
