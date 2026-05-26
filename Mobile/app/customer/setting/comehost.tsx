import Toast from 'react-native-toast-message';
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authApi } from "../../../src/shared/api/authApi";


export default function BecomeHostScreen() {
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [businessLicenses, setBusinessLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Toast.show({
        type: 'info',
        text1: "Thông báo",
        text2: "Bạn cần cấp quyền truy cập ảnh"
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setBusinessLicenses((prev) => [...prev, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    setBusinessLicenses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: "Vui lòng nhập tên công ty"
      });
      return;
    }

    if (!taxCode.trim()) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: "Vui lòng nhập mã số thuế"
      });
      return;
    }

    if (businessLicenses.length === 0) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: "Vui lòng chọn ít nhất 1 ảnh giấy phép kinh doanh"
      });
      return;
    }

    try {
      setLoading(true);

      await authApi.upgradeToHost(
        companyName.trim(),
        taxCode.trim(),
        businessLicenses
      );

      Alert.alert(
        "Thành công",
        "Bạn đã gửi yêu cầu trở thành Host. Vui lòng chờ Admin duyệt.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: error.message || "Gửi yêu cầu thất bại"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Đăng ký Host</Text>

        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Trở thành đối tác lưu trú</Text>

        <Text style={styles.description}>
          Gửi thông tin doanh nghiệp của bạn. Sau khi Admin duyệt, tài khoản của
          bạn mới được chuyển sang Host.
        </Text>

        <Text style={styles.label}>Tên công ty / doanh nghiệp</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Công ty ABC"
          value={companyName}
          onChangeText={setCompanyName}
        />

        <Text style={styles.label}>Mã số thuế</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mã số thuế"
          value={taxCode}
          onChangeText={setTaxCode}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Giấy phép kinh doanh</Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
          <Ionicons name="cloud-upload-outline" size={36} color="#2563eb" />
          <Text style={styles.uploadTitle}>Chọn ảnh giấy phép</Text>
          <Text style={styles.uploadSub}>
            Có thể chọn nhiều ảnh cùng lúc
          </Text>
        </TouchableOpacity>

        {businessLicenses.map((item, index) => (
          <View key={index} style={styles.imageItem}>
            <Image source={{ uri: item.uri }} style={styles.image} />

            <View style={styles.imageInfo}>
              <Text style={styles.imageName} numberOfLines={1}>
                {item.fileName || `Ảnh giấy phép ${index + 1}`}
              </Text>
              <Text style={styles.imageSub}>Ảnh {index + 1}</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Gửi yêu cầu</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  header: {
    marginTop: 8,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 21,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 48,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
  },
  uploadBox: {
    marginTop: 4,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#2563eb",
  },
  uploadSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  imageItem: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  imageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  imageName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  imageSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
  },
  deleteButton: {
    padding: 8,
  },
  submitButton: {
    marginTop: 26,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});