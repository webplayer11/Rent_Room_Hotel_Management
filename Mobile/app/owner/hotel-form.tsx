import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { hotelApi } from "../../src/shared/api/hotelApi";

type HotelImage = {
  id: string;
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export default function CreateHotelScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [starRating, setStarRating] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [images, setImages] = useState<HotelImage[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset, index) => ({
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
        fileName: asset.fileName || `hotel_${index}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
      }));

      setImages((prev) => [...prev, ...selected]);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Thiếu tên", "Vui lòng nhập tên khách sạn");
      return;
    }

    if (!street.trim() || !district.trim() || !city.trim()) {
      Alert.alert("Thiếu địa chỉ", "Vui lòng nhập đầy đủ địa chỉ");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Thiếu mô tả", "Vui lòng nhập mô tả khách sạn");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Thiếu ảnh", "Vui lòng chọn ít nhất 1 ảnh khách sạn");
      return;
    }

    try {
      setLoading(true);

      const address = [street, district, city].join(", ");

      const result = await hotelApi.createHotel({
        name: name.trim(),
        description: description.trim(),
        address,
        starRating: starRating.trim() ? Number(starRating) : undefined,
        checkInTime,
        checkOutTime,
        images,
      });

      if (result.isSuccess) {
        Alert.alert("Thành công", "Khách sạn đã được gửi chờ admin duyệt", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Lỗi", result.message || "Tạo khách sạn thất bại");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể tạo khách sạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>

        <View>
          <Text style={styles.title}>Thêm khách sạn</Text>
          <Text style={styles.subtitle}>Điền thông tin để gửi admin duyệt</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

        <Input label="Tên khách sạn *" value={name} onChangeText={setName} />
        <Input label="Số nhà / đường *" value={street} onChangeText={setStreet} />
        <Input label="Quận / huyện *" value={district} onChangeText={setDistrict} />
        <Input label="Tỉnh / thành phố *" value={city} onChangeText={setCity} />

        <Text style={styles.label}>Mô tả khách sạn *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Giới thiệu ngắn về khách sạn"
          multiline
          textAlignVertical="top"
        />

        <StarRatingField
          label="Số sao (Tuỳ chọn)"
          value={starRating}
          onChange={setStarRating}
        />

        <TimePickerField
          label="Giờ nhận phòng"
          value={checkInTime}
          onChange={setCheckInTime}
        />

        <TimePickerField
          label="Giờ trả phòng"
          value={checkOutTime}
          onChange={setCheckOutTime}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Hình ảnh khách sạn *</Text>

        <Pressable style={styles.uploadBtn} onPress={pickImages}>
          <Ionicons name="cloud-upload-outline" size={22} color="#2563EB" />
          <Text style={styles.uploadText}>Chọn ảnh khách sạn</Text>
        </Pressable>

        {images.map((img, index) => (
          <View key={img.id} style={styles.imageBox}>
            <Image source={{ uri: img.uri }} style={styles.preview} />
            <View style={styles.imageInfo}>
              <Text style={styles.imageName} numberOfLines={1}>
                {index === 0 ? "Ảnh đại diện - " : ""}
                {img.fileName}
              </Text>

              <Pressable onPress={() => removeImage(img.id)}>
                <Text style={styles.removeText}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        ))}


      </View>

      <Pressable
        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitText}>Gửi duyệt</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function Input(props: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

function TimePickerField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);

  const date = new Date();
  if (value) {
    const [h, m] = value.split(':');
    date.setHours(parseInt(h, 10) || 0, parseInt(m, 10) || 0, 0);
  }

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const mins = selectedDate.getMinutes().toString().padStart(2, '0');
      onChange(`${hours}:${mins}`);
    }
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
        onPress={() => setShow(true)}
      >
        <Text style={{ color: value ? "#111827" : "#9CA3AF" }}>
          {value || "Chọn giờ"}
        </Text>
        <Ionicons name="time-outline" size={20} color="#9CA3AF" />
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={show} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShow(false)}>
                  <Text style={styles.modalDoneText}>Xong</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={date}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleChange}
              />
            </View>
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}

function StarRatingField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  const currentRating = parseInt(value) || 0;

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.label}>{label}</Text>
        {currentRating > 0 && (
          <Pressable onPress={() => onChange("")}>
            <Text style={{ fontSize: 13, color: "#EF4444", fontWeight: "600", marginBottom: 6 }}>Bỏ chọn</Text>
          </Pressable>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => onChange(star.toString())}
            style={{ paddingVertical: 4, paddingRight: 8 }}
          >
            <Ionicons
              name={star <= currentRating ? "star" : "star-outline"}
              size={36}
              color={star <= currentRating ? "#F59E0B" : "#D1D5DB"}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    height: 100,
    marginBottom: 14,
  },
  uploadBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#2563EB",
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  uploadText: {
    color: "#2563EB",
    fontWeight: "800",
  },
  imageBox: {
    marginBottom: 12,
  },
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
  },
  imageInfo: {
    marginTop: 8,
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imageName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginRight: 10,
  },
  removeText: {
    color: "#DC2626",
    fontWeight: "800",
  },
  hint: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 30,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalDoneText: {
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 16,
  },
});