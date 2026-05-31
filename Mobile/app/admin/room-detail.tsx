import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView,
  Dimensions, ActivityIndicator, Modal,
} from 'react-native';
import {
  ChevronLeft, Maximize2, X, Users, Bed, Check, Info, AlertTriangle,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { roomApi, RoomDto } from '../../src/shared/api/roomApi';
import { IMAGE_URL } from '../../src/config';

export default function RoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [room,          setRoom]          = useState<RoomDto | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);

  // ── Load Room Details ───────────────────────────────────────────
  const loadDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await roomApi.getRoomById(id);
      if (res.isSuccess) {
        setRoom(res.data);
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: res.message });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: e.message || 'Không tải được chi tiết phòng' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  // ── Loading / Empty states ──────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#5392F9" />
        <Text style={styles.loadingText}>Đang tải chi tiết phòng...</Text>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={styles.center}>
        <AlertTriangle size={48} color="#FF3B30" style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 16, color: '#64748B', fontWeight: '500' }}>Không tìm thấy thông tin phòng</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Status Badges ──────────────────────────────────────────────
  const roomStatus = room.status || 'Available'; // Available / Occupied / Maintenance
  const getStatusBadge = () => {
    switch (roomStatus.toLowerCase()) {
      case 'occupied':
        return { label: 'Đã có khách', bg: '#FEE2E2', color: '#991B1B' };
      case 'maintenance':
        return { label: 'Bảo trì', bg: '#FEF3C7', color: '#92400E' };
      default:
        return { label: 'Phòng trống', bg: '#DCFCE7', color: '#166534' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Chi tiết phòng',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          
          {/* Gallery ảnh phòng */}
          {room.images && room.images.length > 0 ? (
            <View style={styles.infoSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {room.images.map((img: any, index: number) => {
                  const raw = img.url || img;
                  if (!raw) return null;
                  const uri = raw.startsWith('http') ? raw : `${IMAGE_URL}/${raw}`;
                  return (
                    <TouchableOpacity key={index} style={styles.imgContainer} onPress={() => setFullScreenImg(uri)}>
                      <Image source={{ uri }} style={styles.imgThumb} resizeMode="cover" />
                      <View style={styles.maximizeIcon}>
                        <Maximize2 size={20} color="#FFF" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View style={[styles.infoSection, styles.noImageContainer]}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🛏</Text>
              <Text style={{ color: '#94A3B8', fontSize: 14 }}>Phòng này chưa có hình ảnh</Text>
            </View>
          )}

          {/* Loại phòng & Số phòng */}
          <View style={styles.headerInfo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomTitle}>
                {room.roomType || 'Standard'} {room.roomNumber ? `- Phòng ${room.roomNumber}` : ''}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <View style={[styles.badge, { backgroundColor: room.isActive ? '#DCFCE7' : '#F3F4F6' }]}>
                  <Text style={[styles.badgeText, { color: room.isActive ? '#166534' : '#4B5563' }]}>
                    {room.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: statusBadge.bg }]}>
                  <Text style={[styles.badgeText, { color: statusBadge.color }]}>{statusBadge.label}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Giá phòng */}
          <View style={styles.priceContainer}>
            <Text style={{ fontSize: 13, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Giá phòng
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
              {room.discountPrice ? (
                <>
                  <Text style={styles.discountPriceText}>
                    {Number(room.discountPrice).toLocaleString('vi-VN')}đ
                  </Text>
                  <Text style={styles.originalPriceText}>
                    {Number(room.pricePerNight).toLocaleString('vi-VN')}đ
                  </Text>
                </>
              ) : (
                <Text style={styles.priceText}>
                  {Number(room.pricePerNight).toLocaleString('vi-VN')}đ
                </Text>
              )}
              <Text style={{ fontSize: 14, color: '#64748B', marginLeft: 4 }}>/ đêm</Text>
            </View>
          </View>

          {/* Chi tiết cơ bản */}
          <View style={styles.detailsGrid}>
            <View style={styles.gridItem}>
              <Users size={20} color="#64748B" style={{ marginBottom: 6 }} />
              <Text style={styles.gridLabel}>Sức chứa</Text>
              <Text style={styles.gridValue}>{room.capacity} người</Text>
            </View>
            <View style={styles.gridItem}>
              <Bed size={20} color="#64748B" style={{ marginBottom: 6 }} />
              <Text style={styles.gridLabel}>Giường ngủ</Text>
              <Text style={styles.gridValue}>
                {room.bedCount} {room.bedType || 'Giường'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Info size={20} color="#64748B" style={{ marginBottom: 6 }} />
              <Text style={styles.gridLabel}>Diện tích</Text>
              <Text style={styles.gridValue}>
                {room.roomSize ? `${room.roomSize} m²` : 'Chưa có'}
              </Text>
            </View>
          </View>

          {/* Mô tả phòng */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Mô tả phòng</Text>
            <Text style={styles.infoValue}>
              {room.description || 'Chưa có mô tả chi tiết cho phòng này.'}
            </Text>
          </View>

          {/* Quy định khác */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Quy định phòng</Text>
            <View style={styles.ruleItem}>
              <View style={[styles.bulletPoint, { backgroundColor: room.isSmokingAllowed ? '#FEE2E2' : '#DCFCE7' }]} />
              <Text style={{ fontSize: 15, color: '#334155' }}>
                Hút thuốc:{' '}
                <Text style={{ fontWeight: '600', color: room.isSmokingAllowed ? '#EF4444' : '#10B981' }}>
                  {room.isSmokingAllowed ? 'Cho phép' : 'Nghiêm cấm'}
                </Text>
              </Text>
            </View>
          </View>

          {/* Tiện ích phòng */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Tiện ích phòng</Text>
            {room.roomAmenities && room.roomAmenities.length > 0 ? (
              <View style={styles.amenitiesContainer}>
                {room.roomAmenities.map((amenity: any) => (
                  <View key={amenity.id} style={styles.amenityCard}>
                    <Check size={16} color="#10B981" style={{ marginRight: 6 }} />
                    <Text style={styles.amenityText}>{amenity.name || 'Tiện ích'}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>Không có thông tin tiện ích</Text>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Fullscreen ảnh */}
      {fullScreenImg && (
        <Modal transparent visible animationType="fade">
          <View style={styles.fullScreen}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setFullScreenImg(null)}>
              <X size={30} color="#FFF" />
            </TouchableOpacity>
            <Image
              source={{ uri: fullScreenImg }}
              resizeMode="contain"
              style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 }}
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    paddingBottom: 60,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 12,
  },
  backBtn: {
    marginTop: 20,
    backgroundColor: '#5392F9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  imgContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
    position: 'relative',
    backgroundColor: '#F8F9FA',
    width: Dimensions.get('window').width * 0.8,
  },
  imgThumb: {
    width: '100%',
    height: 220,
  },
  maximizeIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  noImageContainer: {
    height: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  roomTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  discountPriceText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E11D48',
  },
  originalPriceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  amenityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
});
