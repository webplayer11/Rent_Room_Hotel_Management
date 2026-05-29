import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { hotelApi, HotelImageDto } from '../api/hotelApi';
import { IMAGE_URL } from '../../config';

type Props = {
  hotelId: string;
  images: HotelImageDto[];
  onRefresh: () => void;
};

export default function HotelImageManager({ hotelId, images, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
    if (url.startsWith('http')) return url;
    return `${IMAGE_URL}/${url}`;
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể mở thư viện ảnh' });
    }
  };

  const uploadImage = async (asset: any) => {
    try {
      setLoading(true);
      const res = await hotelApi.uploadImage(hotelId, asset);
      if (res.isSuccess) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã tải ảnh lên' });
        onRefresh();
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: res.message || 'Tải ảnh thất bại' });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message || 'Không thể tải ảnh lên' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (img: HotelImageDto) => {
    if (img.isPrimary && images.length > 1) {
      Toast.show({
        type: 'error',
        text1: 'Không thể xóa',
        text2: 'Vui lòng đặt ảnh khác làm ảnh chính trước khi xóa ảnh này'
      });
      return;
    }

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa ảnh này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => deleteImage(img.id)
        }
      ]
    );
  };

  const deleteImage = async (imageId: string) => {
    try {
      setLoading(true);
      const res = await hotelApi.deleteImage(hotelId, imageId);
      if (res.isSuccess) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã xóa ảnh' });
        onRefresh();
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: res.message || 'Xóa ảnh thất bại' });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message || 'Không thể xóa ảnh' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quản lý ảnh</Text>
          <Text style={styles.subtitle}>{images.length} ảnh đã tải lên</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addButton, loading && { opacity: 0.5 }]} 
          onPress={handlePickImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <>
              <Ionicons name="add" size={16} color="#2563EB" />
              <Text style={styles.addButtonText}>Thêm ảnh</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {images.map((img) => (
          <View key={img.id} style={styles.imageContainer}>
            <Image 
              source={{ uri: getImageUrl(img.url) }} 
              style={styles.image} 
            />
            {img.isPrimary && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Ảnh chính</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => confirmDelete(img)}
              disabled={loading}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
        {images.length === 0 && !loading && (
          <Text style={styles.emptyText}>Chưa có ảnh nào. Vui lòng thêm ảnh cho khách sạn của bạn.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  imageContainer: {
    width: '33.33%',
    padding: 4,
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  badge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingHorizontal: 8,
    paddingVertical: 12,
  }
});
