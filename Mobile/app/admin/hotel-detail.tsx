import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  X,
  CheckCircle,
  AlertCircle,
  Maximize2,
  ChevronLeft,
  MapPin,
  Star,
  Clock,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { adminApi, PendingHotelDto } from "../../src/shared/api/adminApi";

export default function HotelDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [hotel, setHotel] = useState<PendingHotelDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const loadDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const result = await adminApi.getPendingHotelDetail(id);

      if (result.isSuccess) {
        setHotel(result.data);
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không tải được chi tiết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleAccept = () => {
    if (!id) return;

    Alert.alert("Duyệt Khách sạn", "Bạn có chắc muốn duyệt khách sạn này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Duyệt",
        onPress: async () => {
          try {
            setActionLoading(true);
            await adminApi.ApproveHotel(id);
            Alert.alert("Thành công", "Đã duyệt khách sạn");
            router.back();
          } catch (error: any) {
            Alert.alert("Lỗi", error.message || "Duyệt thất bại");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!id) return;

    if (!reason.trim()) {
      Alert.alert("Thiếu lý do", "Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.SuspendHotel(id, reason);
      setRejectModalVisible(false);
      Alert.alert("Thành công", "Đã từ chối (xóa) yêu cầu khách sạn");
      router.back();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Từ chối thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Chi tiết yêu cầu khách sạn",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Tên khách sạn</Text>
            <Text style={styles.infoValue}>{hotel.name || "Chưa có"}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Mô tả</Text>
            <Text style={[styles.infoValue, { fontSize: 15, fontWeight: '400', lineHeight: 22 }]}>
              {hotel.description || "Chưa có mô tả"}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin size={18} color="#666" style={{ marginRight: 6 }} />
              <Text style={[styles.infoValue, { flex: 1 }]}>{hotel.address || "Chưa có"}</Text>
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
                {hotel.createdAt ? new Date(hotel.createdAt).toLocaleDateString("vi-VN") : "Chưa có"}
              </Text>
            </View>
          </View>

          <View style={styles.rowSection}>
            <View style={[styles.infoSection, { flex: 1 }]}>
              <Text style={styles.infoLabel}>Giờ Check-in</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={18} color="#666" style={{ marginRight: 6 }} />
                <Text style={styles.infoValue}>{hotel.checkInTime || "14:00"}</Text>
              </View>
            </View>

            <View style={[styles.infoSection, { flex: 1 }]}>
              <Text style={styles.infoLabel}>Giờ Check-out</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={18} color="#666" style={{ marginRight: 6 }} />
                <Text style={styles.infoValue}>{hotel.checkOutTime || "12:00"}</Text>
              </View>
            </View>
          </View>

          {hotel.images && hotel.images.length > 0 ? (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Hình ảnh khách sạn</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {hotel.images.map((img: any, index: number) => {
                  const url = img.url || img;
                  if (!url) return null;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.licenseImageContainer}
                      onPress={() => setFullScreenImage(url)}
                    >
                      <Image
                        source={{
                          uri: url.startsWith("http")
                            ? url
                            : `http://192.168.0.105:9000/${url}`,
                        }}
                        style={styles.licenseImage}
                        resizeMode="cover"
                      />

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
              <Text style={{ color: "#999" }}>Chưa có hình ảnh</Text>
            </View>
          )}
        </View>
      </ScrollView>


      {!rejectModalVisible && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
            disabled={actionLoading}
          >
            <CheckCircle size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>
              {actionLoading ? "Đang xử lý..." : "Chấp nhận duyệt"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
            disabled={actionLoading}
          >
            <X size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={rejectModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.reasonModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xác nhận từ chối</Text>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.reasonInputContainer}>
              <AlertCircle size={20} color="#FF9500" style={{ marginBottom: 10 }} />
              <Text style={styles.reasonSubtitle}>
                Việc từ chối sẽ đồng nghĩa với việc xóa bỏ yêu cầu đăng ký khách sạn này. Bạn có chắc chắn muốn tiếp tục?
              </Text>

              <TextInput
                style={styles.reasonInput}
                placeholder="Nhập lý do tại đây (không bắt buộc)..."
                multiline
                numberOfLines={4}
                value={reason}
                onChangeText={setReason}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmRejectButton]}
                onPress={confirmReject}
              >
                <Text style={styles.confirmRejectButtonText}>Xác nhận từ chối</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {fullScreenImage && (
        <Modal transparent visible animationType="fade">
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity
              style={styles.closeFullScreen}
              onPress={() => setFullScreenImage(null)}
            >
              <X size={30} color="#FFF" />
            </TouchableOpacity>

            <Image
              source={{
                uri: fullScreenImage.startsWith("http")
                  ? fullScreenImage
                  : `http://192.168.0.105:9000/${fullScreenImage}`
              }}
              resizeMode="contain"
              style={{
                width: Dimensions.get("window").width,
                height: Dimensions.get("window").height * 0.8,
              }}
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
    paddingBottom: 100,
  },
  rowSection: {
    flexDirection: 'row',
    gap: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  licenseImageContainer: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
    position: 'relative',
    backgroundColor: '#F8F9FA',
    width: Dimensions.get('window').width * 0.8, // 80% chiều rộng màn hình
  },
  licenseImage: {
    width: '100%',
    height: 220, // Tăng chiều cao lên 220
  },
  maximizeIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButton: {
    backgroundColor: '#007AFF',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  reasonModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  reasonInputContainer: {
    paddingVertical: 10,
  },
  reasonSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  reasonInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1A1A1A',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    height: 120,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingVertical: 15,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E9ECEF',
  },
  cancelButtonText: {
    color: '#495057',
    fontWeight: '700',
  },
  confirmRejectButton: {
    backgroundColor: '#FF3B30',
    flex: 2,
  },
  confirmRejectButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullScreen: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
