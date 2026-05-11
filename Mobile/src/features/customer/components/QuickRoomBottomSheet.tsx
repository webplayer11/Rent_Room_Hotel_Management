import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Room } from '../types/room';
import { HotelSearchParams } from '../types/hotel';
import { roomService } from '../services/roomService';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuickRoomBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  hotelId: string | number | null;
  hotelName: string;
  searchParams: HotelSearchParams;
}

const QuickRoomBottomSheet = ({ visible, onClose, hotelId, hotelName, searchParams }: QuickRoomBottomSheetProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);

  const nights = searchParams.checkIn && searchParams.checkOut 
    ? Math.max(1, Math.round((new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const numRooms = parseInt(searchParams.rooms) || 1;

  useEffect(() => {
    if (visible && hotelId) {
      loadRooms();
    }
  }, [visible, hotelId]);

  const loadRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      if (hotelId) {
        const data = await roomService.getQuickRoomsByHotelId(hotelId, searchParams);
        setRooms(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalPrice = (room: RoomPreview) => {
    const totalBasePrice = room.basePrice * nights * numRooms;
    const roomDiscountAmount = totalBasePrice * (room.discountPercent / 100);
    const priceAfterRoomDiscount = totalBasePrice - roomDiscountAmount;

    let voucherDiscountAmount = 0;
    if (room.voucher && priceAfterRoomDiscount >= room.voucher.minPrice) {
      if (room.voucher.discountType === 'percent') {
        voucherDiscountAmount = priceAfterRoomDiscount * (room.voucher.discountValue / 100);
        if (room.voucher.maxDiscount) {
          voucherDiscountAmount = Math.min(voucherDiscountAmount, room.voucher.maxDiscount);
        }
      } else {
        voucherDiscountAmount = room.voucher.discountValue;
      }
    }

    return Math.max(0, priceAfterRoomDiscount - voucherDiscountAmount);
  };

  const renderRoomItem = ({ item }: { item: RoomPreview }) => {
    const finalPrice = calculateFinalPrice(item);

    return (
      <View style={styles.roomCard}>
        <Image source={{ uri: item.image }} style={styles.roomImage} />
        <View style={styles.roomInfo}>
          <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.roomDetails}>{item.area} • {item.guestInfo} • {item.bedInfo}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.pricePrefix}>Từ </Text>
            <Text style={styles.finalPrice}>{finalPrice.toLocaleString('vi-VN')} ₫</Text>
          </View>
        </View>
      </View>
    );
  };

  const handleGoToDetail = () => {
    onClose();
    if (hotelId) {
      router.push({
        pathname: `/customer/hotel/${hotelId}`,
        params: { ...searchParams }
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.content} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{hotelName}</Text>
          </View>

          {/* List Content */}
          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color="#5392F9" />
              </View>
            ) : error ? (
              <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={loadRooms} style={styles.retryBtn}>
                  <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : rooms.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>Hiện không có phòng khả dụng.</Text>
              </View>
            ) : (
              <FlatList
                data={rooms}
                renderItem={renderRoomItem}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerBtn} onPress={handleGoToDetail}>
              <Text style={styles.footerBtnText}>Xem chi tiết cơ sở lưu trú</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.55,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listPadding: {
    padding: 15,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomImage: {
    width: 80,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#EEE',
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roomName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  roomDetails: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  pricePrefix: {
    fontSize: 11,
    color: '#666',
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF567D',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 15,
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  footerBtn: {
    backgroundColor: '#5392F9',
    borderRadius: 25,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#5392F9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  footerBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 10,
    padding: 8,
  },
  retryText: {
    color: '#5392F9',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  }
});

export default QuickRoomBottomSheet;
