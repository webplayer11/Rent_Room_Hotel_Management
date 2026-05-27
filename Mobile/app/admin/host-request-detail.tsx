import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
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
} from "lucide-react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { adminApi, PendingHostDto } from "../../src/shared/api/adminApi";
import { IMAGE_URL } from "../../src/config";

const SCREEN_WIDTH = Dimensions.get("window").width;
const LICENSE_IMAGE_WIDTH = SCREEN_WIDTH - 40;

const resolveImageUrl = (url: string) => {
  if (!url) return "";

  if (url.startsWith("http")) return url;

  const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
  const cleanBaseUrl = IMAGE_URL.endsWith("/")
    ? IMAGE_URL.slice(0, -1)
    : IMAGE_URL;

  return `${cleanBaseUrl}/${cleanUrl}`;
};

export default function HostRequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [host, setHost] = useState<PendingHostDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  
  const loadDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const result = await adminApi.getPendingHostDetail(id);

      if (result.isSuccess) {
        setHost(result.data);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: result.message,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Không tải được chi tiết",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleAccept = () => {
    if (!id) return;

    Alert.alert("Duyệt Host", "Bạn có chắc muốn duyệt tài khoản này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Duyệt",
        onPress: async () => {
          try {
            setActionLoading(true);
            await adminApi.Approved(id);

            Toast.show({
              type: "success",
              text1: "Thành công",
              text2: "Đã duyệt Host",
            });

            router.back();
          } catch (error: any) {
            Toast.show({
              type: "error",
              text1: "Lỗi",
              text2: error.message || "Duyệt thất bại",
            });
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
      Toast.show({
        type: "error",
        text1: "Thiếu lý do",
        text2: "Vui lòng nhập lý do từ chối",
      });
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.Reject(id, reason.trim());

      setRejectModalVisible(false);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã từ chối yêu cầu Host",
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Từ chối thất bại",
      });
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

  if (!host) {
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
          title: "Chi tiết yêu cầu",
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Họ và tên</Text>
            <Text style={styles.infoValue}>{host.fullName || "Chưa có"}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{host.email}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>
              {host.phoneNumber || "Chưa có"}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Tên công ty</Text>
            <Text style={styles.infoValue}>
              {host.companyName || "Chưa có"}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Mã số thuế</Text>
            <Text style={styles.infoValue}>{host.taxCode || "Chưa có"}</Text>
          </View>
{host.businessLicenseUrls &&
host.businessLicenseUrls.length > 0 ? (
  <View style={styles.infoSection}>
    <Text style={styles.infoLabel}>
      Giấy phép kinh doanh
    </Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 12 }}
    >
      {host.businessLicenseUrls.map((url, index) => (
        <TouchableOpacity
          key={index}
          style={styles.licenseImageContainer}
          onPress={() => setFullScreenImage(url)}
        >
          <Image
            source={{
              uri: url.startsWith("http")? url : `${IMAGE_URL}/${url}`,}}
              style={styles.licenseImage}
              resizeMode="cover"/>

          <View style={styles.maximizeIcon}>
            <Maximize2 size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
) : (
  <View style={styles.infoSection}>
    <Text style={styles.infoLabel}>
      Giấy phép kinh doanh
    </Text>

    <Text style={{ color: "#999" }}>
      Chưa có giấy phép
    </Text>
  </View>
)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
          disabled={actionLoading}
        >
          <CheckCircle size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionButtonText}>
            {actionLoading ? "Đang xử lý..." : "Chấp nhận Host"}
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
              <Text style={styles.modalTitle}>Lý do từ chối</Text>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.reasonInputContainer}>
              <AlertCircle
                size={20}
                color="#FF9500"
                style={{ marginBottom: 10 }}
              />

              <Text style={styles.reasonSubtitle}>
                Vui lòng nhập lý do để chủ tài khoản biết nguyên nhân bị từ
                chối.
              </Text>

              <TextInput
                style={styles.reasonInput}
                placeholder="Nhập lý do tại đây..."
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
                <Text style={styles.confirmRejectButtonText}>Gửi từ chối</Text>
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

           <Image  source={{ uri: fullScreenImage.startsWith("http") ? fullScreenImage : `${IMAGE_URL}/${fullScreenImage}` }}
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
    backgroundColor: "#FFF",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    paddingBottom: 100,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  licenseList: {
    gap: 12,
    paddingRight: 20,
  },
  licenseImageContainer: {
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE",
    position: "relative",
    backgroundColor: "#F8F9FA",
  },
  licenseImage: {
    width: "100%",
    height: "100%",
  },
  maximizeIcon: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 25,
  },
  emptyText: {
    color: "#999",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButton: {
    backgroundColor: "#007AFF",
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  reasonModalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  reasonInputContainer: {
    paddingVertical: 10,
  },
  reasonSubtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 15,
  },
  reasonInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#1A1A1A",
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    height: 120,
  },
  modalFooter: {
    flexDirection: "row",
    paddingVertical: 15,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E9ECEF",
  },
  cancelButtonText: {
    color: "#495057",
    fontWeight: "700",
  },
  confirmRejectButton: {
    backgroundColor: "#FF3B30",
    flex: 2,
  },
  confirmRejectButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  closeFullScreen: {
    position: "absolute",
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