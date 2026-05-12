import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../../shared/components/AppButton';
import { AppCard } from '../../../shared/components/AppCard';
import { colors } from '../../../shared/constants/colors';
import { ownerDashboardMockData, ownerRoomsMockData } from '../data/ownerMockData';
import type { RoomStatus, OwnerRoom } from '../types/ownerTypes';

const roomStatusMap: Record<RoomStatus, { label: string; bg: string; fg: string }> = {
  available: { label: 'Còn trống', bg: '#DCFCE7', fg: colors.success },
  booked: { label: 'Đã đặt', bg: '#DBEAFE', fg: colors.primary },
  maintenance: { label: 'Bảo trì', bg: '#FEE2E2', fg: colors.danger },
};

export function OwnerRoomListScreen() {
  const router = useRouter();
  const [selectedHotel, setSelectedHotel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | 'all'>('all');

  const hotelStatusMap = ownerDashboardMockData.hotels.reduce((acc, hotel) => {
    acc[hotel.name] = hotel.status;
    return acc;
  }, {} as Record<string, string>);

  const hotels = ['all', 'Guma Hotel', 'Biển Xanh Resort', 'Central Stay'];
  const statuses: (RoomStatus | 'all')[] = ['all', 'available', 'booked', 'maintenance'];

  const filteredRooms = ownerRoomsMockData.filter((room) => {
    if (selectedHotel !== 'all' && room.hotelName !== selectedHotel) return false;
    if (selectedStatus !== 'all' && room.status !== selectedStatus) return false;
    return true;
  });

  const handleAction = (room: any) => {
    const isApproved = hotelStatusMap[room.hotelName] === 'approved';
    if (!isApproved) {
      Alert.alert('Lỗi', 'Khách sạn chưa được duyệt nên chưa thể quản lý phòng.');
      return;
    }
    
    if (room.status === 'available') {
      Alert.alert('Chỉnh sửa', 'Tính năng chỉnh sửa phòng sẽ được xử lý khi nối backend.');
    } else if (room.status === 'booked') {
      router.push('/owner/bookings');
    } else if (room.status === 'maintenance') {
      Alert.alert('Cập nhật', 'Tính năng cập nhật trạng thái phòng sẽ được xử lý khi nối backend.');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Quản lý phòng</Text>
        <Pressable 
          style={styles.headerAddBtn}
          onPress={() => {
            const hasApproved = ownerDashboardMockData.hotels.some(h => h.status === 'approved');
            if (!hasApproved) {
              Alert.alert('Lỗi', 'Bạn cần có khách sạn được duyệt trước khi thêm phòng.');
            } else {
              router.push('/owner/room-form');
            }
          }}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.description}>Theo dõi danh sách phòng, giá và trạng thái phòng.</Text>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {hotels.map((h) => (
              <Pressable
                key={h}
                style={[styles.filterChip, selectedHotel === h && styles.filterChipActive]}
                onPress={() => setSelectedHotel(h)}
              >
                <Text style={[styles.filterChipText, selectedHotel === h && styles.filterChipTextActive]}>
                  {h === 'all' 
                    ? 'Tất cả' 
                    : `${h}${hotelStatusMap[h] && hotelStatusMap[h] !== 'approved' ? ' (Chưa duyệt)' : ''}`}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {statuses.map((s) => (
              <Pressable
                key={s}
                style={[styles.filterChip, selectedStatus === s && styles.filterChipActive]}
                onPress={() => setSelectedStatus(s)}
              >
                <Text style={[styles.filterChipText, selectedStatus === s && styles.filterChipTextActive]}>
                  {s === 'all' ? 'Tất cả trạng thái' : roomStatusMap[s as RoomStatus].label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.roomList}>
          {filteredRooms.map((room) => {
            const statusConfig = roomStatusMap[room.status];
            return (
              <AppCard key={room.id} style={styles.roomCard}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.fg }]}>{statusConfig.label}</Text>
                  </View>
                </View>
                
                <Text style={styles.hotelName}>{room.hotelName}</Text>
                
                <View style={styles.roomDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="bed-outline" size={16} color={colors.muted} />
                    <Text style={styles.detailText}>{room.roomType}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={16} color={colors.muted} />
                    <Text style={styles.detailText}>{room.capacity} người</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="pricetag-outline" size={16} color={colors.muted} />
                    <Text style={styles.detailText}>{room.pricePerNight}/đêm</Text>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  {hotelStatusMap[room.hotelName] !== 'approved' ? (
                    <Text style={styles.unapprovedText}>
                      * Khách sạn chưa được duyệt nên chưa thể quản lý phòng.
                    </Text>
                  ) : (
                    <View style={styles.actions}>
                      <AppButton 
                        title={room.status === 'available' ? 'Chỉnh sửa' : room.status === 'booked' ? 'Xem đơn' : 'Cập nhật'} 
                        onPress={() => handleAction(room)}
                        style={styles.actionBtn}
                      />
                    </View>
                  )}
                </View>
              </AppCard>
            );
          })}
          {filteredRooms.length === 0 && (
            <Text style={styles.emptyText}>Không tìm thấy phòng nào.</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { key: 'home', icon: 'home', label: 'Trang chủ' },
          { key: 'hotels', icon: 'business', label: 'Khách sạn' },
          { key: 'bookings', icon: 'document-text', label: 'Đơn đặt' },
          { key: 'reports', icon: 'bar-chart', label: 'Báo cáo' },
        ].map((tab) => {
          const isActive = false; // No active tab for rooms yet
          const iconName: any = isActive ? tab.icon : `${tab.icon}-outline`;
          return (
            <Pressable
              key={tab.key}
              style={styles.navTab}
              onPress={() => {
                if (tab.key === 'home') router.push('/owner');
                if (tab.key === 'hotels') router.push('/owner/hotels');
                if (tab.key === 'bookings') router.push('/owner/bookings');
                if (tab.key === 'reports') router.push('/owner/reports');
              }}
            >
              <Ionicons name={iconName} size={22} color={isActive ? colors.primary : colors.muted} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerAddBtn: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.textLight,
  },
  roomList: {
    gap: 12,
  },
  roomCard: {
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hotelName: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
  },
  roomDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: colors.text,
  },
  actionsContainer: {
    gap: 8,
  },
  unapprovedText: {
    fontSize: 12,
    color: colors.danger,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    minWidth: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 32,
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
