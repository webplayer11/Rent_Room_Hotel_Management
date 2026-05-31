import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Modal,
  Image, ScrollView, KeyboardAvoidingView, Platform, Dimensions,
  ActivityIndicator, Alert, Pressable,
} from 'react-native';
import {
  X, CheckCircle, AlertCircle, Maximize2, ChevronLeft,
  MapPin, Star, Clock, Lock, Unlock, Trash2,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { adminApi, PendingHotelDto } from '../../src/shared/api/adminApi';
import { roomApi, RoomDto } from '../../src/shared/api/roomApi';
import { IMAGE_URL } from '../../src/config';

// ── Trạng thái KS (2 boolean từ backend) ─────────────────────────
type HotelStatus = 'pending' | 'active' | 'suspended' | 'inactive';

const getStatus = (h: PendingHotelDto): HotelStatus => {
  if (!h.isApproved && h.isActive)  return 'pending';
  if (h.isApproved  && h.isActive)  return 'active';
  if (h.isApproved  && !h.isActive) return 'suspended';
  return 'inactive';
};

const STATUS_BADGE: Record<HotelStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Chờ duyệt',       bg: '#FEF3C7', color: '#92400E' },
  active:    { label: 'Đang hoạt động',  bg: '#DCFCE7', color: '#166534' },
  suspended: { label: 'Tạm khóa',        bg: '#FEE2E2', color: '#991B1B' },
  inactive:  { label: 'Không hoạt động', bg: '#F1F5F9', color: '#475569' },
};

// ─────────────────────────────────────────────────────────────────
export default function HotelDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [hotel,         setHotel]         = useState<PendingHotelDto | null>(null);
  const [rooms,         setRooms]         = useState<RoomDto[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [roomsLoading,  setRoomsLoading]  = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendModal,  setSuspendModal]  = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);

  // ── Load ────────────────────────────────────────────────────────
  const loadRooms = async () => {
    if (!id) return;
    try {
      setRoomsLoading(true);
      const res = await roomApi.getRoomsByHotelId(id);
      if (res.isSuccess) {
        setRooms(res.data || []);
      }
    } catch (e: any) {
      console.log("Error loading rooms:", e);
    } finally {
      setRoomsLoading(false);
    }
  };

  const loadDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await adminApi.getPendingHotelDetail(id);
      if (res.isSuccess) {
        setHotel(res.data);
        await loadRooms();
      }
      else Toast.show({ type: 'error', text1: 'Lỗi', text2: res.message });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: e.message || 'Không tải được chi tiết' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDetail(); }, [id]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleApprove = () => {
    Alert.alert('Duyệt Khách sạn', 'Bạn có chắc muốn duyệt khách sạn này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Duyệt', onPress: async () => {
        try {
          setActionLoading(true);
          await adminApi.ApproveHotel(id!);
          Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã duyệt khách sạn' });
          router.back();
        } catch (e: any) {
          Toast.show({ type: 'error', text1: 'Lỗi', text2: e.message || 'Duyệt thất bại' });
        } finally { setActionLoading(false); }
      }},
    ]);
  };

  const handleDeletePending = () => {
    Alert.alert(
      'Xóa yêu cầu',
      'Thao tác này sẽ xóa khách sạn khỏi hệ thống và không thể hoàn tác. Bạn có chắc chắn?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            setActionLoading(true);
            await adminApi.DeleteHotel(id!);
            Toast.show({ type: 'success', text1: 'Đã xóa', text2: 'Yêu cầu khách sạn đã bị xóa' });
            router.back();
          } catch (e: any) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: e.message || 'Xóa thất bại' });
          } finally { setActionLoading(false); }
        }},
      ]
    );
  };

  const confirmSuspend = async () => {
    if (!suspendReason.trim()) {
      Toast.show({ type: 'error', text1: 'Thiếu lý do', text2: 'Vui lòng nhập lý do tạm khóa' });
      return;
    }
    try {
      setActionLoading(true);
      await adminApi.SuspendHotel(id!, suspendReason.trim());
      setSuspendModal(false);
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã tạm khóa khách sạn' });
      await loadDetail(); // reload — không back, Admin vẫn xem được KS
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: e.message || 'Tạm khóa thất bại' });
    } finally { setActionLoading(false); }
  };

  const handleUnsuspend = () => {
    Alert.alert('Mở khóa', 'Khách sạn sẽ hoạt động trở lại. Xác nhận?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Mở khóa', onPress: async () => {
        try {
          setActionLoading(true);
          await adminApi.UnsuspendHotel(id!);
          Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã mở khóa khách sạn' });
          await loadDetail(); // reload — cập nhật trạng thái tại chỗ
        } catch (e: any) {
          Toast.show({ type: 'error', text1: 'Lỗi', text2: e.message || 'Mở khóa thất bại' });
        } finally { setActionLoading(false); }
      }},
    ]);
  };

  // ── Footer theo trạng thái ──────────────────────────────────────
  const renderFooter = () => {
    if (!hotel) return null;
    const status = getStatus(hotel);

    if (status === 'inactive') {
      return (
        <View style={styles.footer}>
          <Text style={styles.inactiveText}>Khách sạn này hiện không hoạt động.</Text>
        </View>
      );
    }
    if (status === 'pending') {
      return (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnApprove]}
            onPress={handleApprove}
            disabled={actionLoading}
          >
            <CheckCircle size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>
              {actionLoading ? 'Đang xử lý...' : 'Chấp nhận duyệt'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnDelete]}
            onPress={handleDeletePending}
            disabled={actionLoading}
          >
            <Trash2 size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Xóa yêu cầu</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (status === 'active') {
      return (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnSuspend]}
            onPress={() => { setSuspendReason(''); setSuspendModal(true); }}
            disabled={actionLoading}
          >
            <Lock size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>
              {actionLoading ? 'Đang xử lý...' : 'Tạm khóa'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (status === 'suspended') {
      return (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnUnsuspend]}
            onPress={handleUnsuspend}
            disabled={actionLoading}
          >
            <Unlock size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>
              {actionLoading ? 'Đang xử lý...' : 'Mở khóa'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  // ── Loading / empty ─────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#5392F9" />
        <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
      </SafeAreaView>
    );
  }
  if (!hotel) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Không có dữ liệu</Text>
      </SafeAreaView>
    );
  }

  const status = getStatus(hotel);
  const badge  = STATUS_BADGE[status];

  // ── Main render ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Chi tiết khách sạn',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>

          {/* Tên + badge */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Tên khách sạn</Text>
            <Text style={styles.infoValue}>{hotel.name || 'Chưa có'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
            </View>
          </View>

          {status === 'suspended' && (
            <View style={[styles.infoSection, { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FCA5A5' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <AlertCircle size={18} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#B91C1C' }}>Thông tin tạm khóa</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#991B1B', marginBottom: 4 }}>
                <Text style={{ fontWeight: '600' }}>Lý do: </Text>
                {hotel.suspendReason || 'Không có lý do'}
              </Text>
              {hotel.suspendedAt && (
                <Text style={{ fontSize: 14, color: '#991B1B' }}>
                  <Text style={{ fontWeight: '600' }}>Thời gian khóa: </Text>
                  {new Date(
  hotel.suspendedAt.endsWith('Z')
    ? hotel.suspendedAt
    : `${hotel.suspendedAt}Z`
).toLocaleString('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour12: false,
                  })}
                </Text>
              )}
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Mô tả</Text>
            <Text style={[styles.infoValue, { fontSize: 15, fontWeight: '400', lineHeight: 22 }]}>
              {hotel.description || 'Chưa có mô tả'}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin size={18} color="#666" style={{ marginRight: 6 }} />
              <Text style={[styles.infoValue, { flex: 1 }]}>{hotel.address || 'Chưa có'}</Text>
            </View>
          </View>

          <View style={styles.rowSection}>
            <View style={[styles.infoSection, { flex: 1 }]}>
              <Text style={styles.infoLabel}>Đánh giá sao</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Star size={18} color="#FFD700" style={{ marginRight: 6 }} />
                <Text style={styles.infoValue}>{hotel.starRating || 0} Sao</Text>
              </View>
            </View>
            <View style={[styles.infoSection, { flex: 1 }]}>
              <Text style={styles.infoLabel}>Ngày tạo</Text>
              <Text style={styles.infoValue}>
                {hotel.createdAt ? new Date(hotel.createdAt).toLocaleDateString('vi-VN') : 'Chưa có'}
              </Text>
            </View>
          </View>

          <View style={styles.rowSection}>
            <View style={[styles.infoSection, { flex: 1 }]}>
              <Text style={styles.infoLabel}>Check-in</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={18} color="#666" style={{ marginRight: 6 }} />
                <Text style={styles.infoValue}>{hotel.checkInTime || '14:00'}</Text>
              </View>
            </View>
            <View style={[styles.infoSection, { flex: 1 }]}>
              <Text style={styles.infoLabel}>Check-out</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={18} color="#666" style={{ marginRight: 6 }} />
                <Text style={styles.infoValue}>{hotel.checkOutTime || '12:00'}</Text>
              </View>
            </View>
          </View>

          {/* Gallery ảnh */}
          {hotel.images && hotel.images.length > 0 ? (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Hình ảnh khách sạn</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {hotel.images.map((img: any, index: number) => {
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
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Hình ảnh khách sạn</Text>
              <Text style={{ color: '#999' }}>Chưa có hình ảnh</Text>
            </View>
          )}

          {/* Danh sách phòng */}
          <View style={[styles.infoSection, { marginTop: 12 }]}>
            <Text style={styles.infoLabel}>Danh sách phòng</Text>
            {roomsLoading ? (
              <ActivityIndicator size="small" color="#5392F9" style={{ marginVertical: 10 }} />
            ) : rooms.length === 0 ? (
              <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>Khách sạn chưa có phòng nào</Text>
            ) : (
              rooms.map((room) => {
                const firstImg = room.images?.[0]?.url || room.images?.[0];
                const roomImgUri = firstImg
                  ? (firstImg.startsWith('http') ? firstImg : `${IMAGE_URL}/${firstImg}`)
                  : null;

                return (
                  <Pressable
                    key={room.id}
                    style={styles.roomCard}
                    onPress={() => router.push(`/admin/room-detail?id=${room.id}`)}
                  >
                    {roomImgUri ? (
                      <Image source={{ uri: roomImgUri }} style={styles.roomThumb} resizeMode="cover" />
                    ) : (
                      <View style={styles.roomThumbPlaceholder}>
                        <Text style={{ fontSize: 18 }}>🛏</Text>
                      </View>
                    )}
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName} numberOfLines={1}>
                        {room.roomType || 'Phòng'} {room.roomNumber ? `- ${room.roomNumber}` : ''}
                      </Text>
                      <Text style={styles.roomDetails}>
                        👥 {room.capacity} người | 🛏 {room.bedCount} {room.bedType || 'Giường'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={styles.roomPrice}>
                          {room.discountPrice ? (
                            <>
                              <Text style={{ textDecorationLine: 'line-through', color: '#94A3B8', fontSize: 11 }}>
                                {Number(room.pricePerNight).toLocaleString('vi-VN')}đ
                              </Text>{' '}
                              <Text style={{ color: '#E11D48', fontWeight: '700' }}>
                                {Number(room.discountPrice).toLocaleString('vi-VN')}đ
                              </Text>
                            </>
                          ) : (
                            <Text style={{ color: '#1E293B', fontWeight: '700' }}>
                              {Number(room.pricePerNight).toLocaleString('vi-VN')}đ
                            </Text>
                          )}
                          <Text style={{ fontSize: 11, fontWeight: '400', color: '#64748B' }}>/đêm</Text>
                        </Text>
                        
                        <View style={[styles.roomStatusBadge, { backgroundColor: room.isActive ? '#DCFCE7' : '#FEE2E2' }]}>
                          <Text style={[styles.roomStatusText, { color: room.isActive ? '#166534' : '#991B1B' }]}>
                            {room.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>

        </View>
      </ScrollView>

      {/* Footer — ẩn khi modal suspend đang mở */}
      {!suspendModal && renderFooter()}

      {/* Modal Tạm khóa */}
      <Modal visible={suspendModal} animationType="fade" transparent onRequestClose={() => setSuspendModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạm khóa khách sạn</Text>
              <TouchableOpacity onPress={() => setSuspendModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={{ paddingVertical: 10 }}>
              <AlertCircle size={20} color="#F97316" style={{ marginBottom: 10 }} />
              <Text style={styles.modalSub}>
                Khách sạn sẽ bị tạm khóa và không thể nhận đặt phòng. Vui lòng nhập lý do.
              </Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Nhập lý do tạm khóa..."
                multiline numberOfLines={4}
                value={suspendReason}
                onChangeText={setSuspendReason}
              />
            </View>
            <View style={styles.modalFooterRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setSuspendModal(false)}>
                <Text style={{ color: '#495057', fontWeight: '700' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]} onPress={confirmSuspend} disabled={actionLoading}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận khóa'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FFF' },
  content:     { flex: 1, padding: 20 },
  section:     { paddingBottom: 120 },
  rowSection:  { flexDirection: 'row', gap: 16 },
  infoSection: { marginBottom: 24 },
  infoLabel:   { fontSize: 14, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue:   { fontSize: 17, fontWeight: '600', color: '#1A1A1A' },

  statusBadge:     { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },

  imgContainer: { marginTop: 10, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EEE', position: 'relative', backgroundColor: '#F8F9FA', width: Dimensions.get('window').width * 0.8 },
  imgThumb:     { width: '100%', height: 220 },
  maximizeIcon: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },

  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE', gap: 12 },
  inactiveText: { flex: 1, textAlign: 'center', color: '#94A3B8', fontSize: 14, fontWeight: '500', paddingVertical: 8 },

  actionBtn:    { flex: 1, height: 56, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  actionBtnText:{ color: '#FFF', fontWeight: '700', fontSize: 15 },
  btnApprove:   { backgroundColor: '#5392F9' },
  btnDelete:    { backgroundColor: '#FF3B30' },
  btnSuspend:   { backgroundColor: '#F97316' },
  btnUnsuspend: { backgroundColor: '#10B981' },

  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:       { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle:     { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  modalSub:       { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 15 },
  reasonInput:    { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, fontSize: 16, color: '#1A1A1A', textAlignVertical: 'top', borderWidth: 1, borderColor: '#E9ECEF', height: 120 },
  modalFooterRow: { flexDirection: 'row', paddingVertical: 15, gap: 12 },
  modalBtn:       { flex: 1, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#E9ECEF' },
  modalBtnConfirm:{ backgroundColor: '#F97316', flex: 2 },

  fullScreen: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  closeBtn:   { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText:{ fontSize: 16, color: '#333', fontWeight: '500' },

  // ── Room Card Styles ──
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  roomThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  roomThumbPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  roomName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  roomDetails: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  roomPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  roomStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roomStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
