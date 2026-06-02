import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { tokenStorage } from '../../../src/shared/storage/tokenStorage';

type RoomStatusType = 'available' | 'occupied' | 'cleaning';

type RoomItem = {
  id: string;
  roomNumber?: string;
  type?: string;
  status: RoomStatusType;
  currentGuestName?: string;
  updatedAt?: string;
};

type Props = {
  hotelId: string;
};

const STATUS_MAP: Record<RoomStatusType, { label: string; color: string; bg: string }> = {
  available: { label: 'Sẵn sàng', color: '#16A34A', bg: '#DCFCE7' },
  occupied: { label: 'Có khách', color: '#2563EB', bg: '#DBEAFE' },
  cleaning: { label: 'Đang dọn', color: '#EA580C', bg: '#FFEDD5' },
};

function relativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.roomInfo}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: 80, marginTop: 6 }]} />
        </View>
        <View style={[styles.skeletonLine, { width: 64, height: 24, borderRadius: 8 }]} />
      </View>
      <View style={[styles.skeletonLine, { width: '100%', height: 36, borderRadius: 8, marginBottom: 12 }]} />
      <View style={[styles.skeletonLine, { width: 100 }]} />
    </View>
  );
}

export function RoomStatus({ hotelId }: Props) {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!hotelId) return;
    let cancelled = false;

    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(false);
        const accessToken = await tokenStorage.getAccessToken();
        const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
        const res = await axios.get(`${apiUrl}/api/rooms?hotelId=${hotelId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!cancelled) {
          const data = res.data?.data ?? res.data ?? [];
          setRooms(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRooms();
    return () => { cancelled = true; };
  }, [hotelId]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trạng thái phòng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
            <Text style={styles.emptyText}>Không thể tải dữ liệu phòng</Text>
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bed-outline" size={32} color="#9CA3AF" />
            <Text style={styles.emptyText}>Chưa có phòng nào</Text>
          </View>
        ) : (
          rooms.map(room => {
            const statusKey = (room.status?.toLowerCase() ?? 'available') as RoomStatusType;
            const statusInfo = STATUS_MAP[statusKey] ?? STATUS_MAP.available;
            return (
              <View key={room.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomNumber}>P.{room.roomNumber ?? room.id}</Text>
                    <Text style={styles.roomType}>{room.type ?? '—'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>
                </View>
                {room.currentGuestName ? (
                  <View style={styles.guestInfo}>
                    <Ionicons name="person-outline" size={16} color="#6B7280" />
                    <Text style={styles.guestName}>{room.currentGuestName}</Text>
                  </View>
                ) : <View style={styles.placeholder} />}
                <Text style={styles.updateTime}>Cập nhật: {relativeTime(room.updatedAt)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  card: {
    width: 260,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonCard: {
    opacity: 0.6,
  },
  skeletonLine: {
    width: 120,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  roomType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  guestName: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '600',
  },
  placeholder: {
    height: 38,
    marginBottom: 12,
  },
  updateTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  emptyState: {
    width: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontWeight: '500',
  },
});

