import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import React, { useState, useEffect } from "react";
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
  Switch,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ChevronLeft } from "lucide-react-native";
import { roomApi } from "../../src/shared/api/roomApi";
import { IMAGE_URL } from "../../src/config";

type RoomImage = {
  id: string;
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export default function CreateRoomScreen() {
  const router = useRouter();
  const { hotelId, id } = useLocalSearchParams<{ hotelId: string; id?: string }>();
  const isEditMode = !!id;

  const [roomNumber, setRoomNumber] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("Standard");
  const [customRoomType, setCustomRoomType] = useState("");
  const [showRoomTypeDropdown, setShowRoomTypeDropdown] = useState(false);
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [bedCount, setBedCount] = useState("");
  const [bedType, setBedType] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [roomSize, setRoomSize] = useState("");
  const [isSmokingAllowed, setIsSmokingAllowed] = useState(false);
  const [images, setImages] = useState<RoomImage[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedBedType, setSelectedBedType] = useState("Đôi");
  const [customBedType, setCustomBedType] = useState("");
  const [showBedTypeDropdown, setShowBedTypeDropdown] = useState(false);

  // Load existing room details if in Edit Mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadRoomData = async () => {
        try {
          setLoading(true);
          const res = await roomApi.getRoomById(id);
          if (res.isSuccess && res.data) {
            const room = res.data;
            setRoomNumber(room.roomNumber || "");
            
            const stdTypes = ["Standard", "Superior", "Deluxe", "Suite", "Family"];
            if (room.roomType && stdTypes.includes(room.roomType)) {
              setSelectedRoomType(room.roomType);
            } else {
              setSelectedRoomType("Khác");
              setCustomRoomType(room.roomType || "");
            }

            setDescription(room.description || "");
            setCapacity(String(room.capacity || ""));
            setRoomSize(room.roomSize ? String(room.roomSize) : "");
            setBedCount(String(room.bedCount || ""));

            const stdBeds = ["Đơn", "Đôi"];
            if (room.bedType && stdBeds.includes(room.bedType)) {
              setSelectedBedType(room.bedType);
            } else {
              setSelectedBedType("Khác");
              setCustomBedType(room.bedType || "");
            }

            setPricePerNight(String(room.pricePerNight || ""));
            setDiscountPrice(room.discountPrice ? String(room.discountPrice) : "");
            setIsSmokingAllowed(room.isSmokingAllowed || false);

            if (room.images && room.images.length > 0) {
              const formattedImages = room.images.map((img: any, idx: number) => {
                const url = img.url || img;
                const uri = url.startsWith("http") ? url : `${IMAGE_URL}/${url}`;
                return {
                  id: img.id || `${Date.now()}-${idx}`,
                  uri,
                  fileName: img.caption || `room_${idx}.jpg`,
                  mimeType: "image/jpeg"
                };
              });
              setImages(formattedImages);
            }
          } else {
            Toast.show({
              type: 'error',
              text1: "Lỗi",
              text2: res.message || "Không thể tải thông tin phòng"
            });
          }
        } catch (error: any) {
          console.log("Error fetching room details:", error);
          Toast.show({
            type: 'error',
            text1: "Lỗi",
            text2: "Đã xảy ra lỗi khi tải dữ liệu phòng"
          });
        } finally {
          setLoading(false);
        }
      };
      loadRoomData();
    }
  }, [id, isEditMode]);

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
        fileName: asset.fileName || `room_${index}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
      }));

      setImages((prev) => [...prev, ...selected]);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async () => {
    if (!hotelId && !isEditMode) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: "Không tìm thấy thông tin khách sạn. Vui lòng thử lại."
      });
      return;
    }

    if (!selectedRoomType.trim() || !roomNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập Số phòng và Loại phòng"
      });
      return;
    }

    const finalRoomType = selectedRoomType === "Khác" ? customRoomType.trim() : selectedRoomType;

    if (selectedRoomType === "Khác" && !finalRoomType) {
      Toast.show({
        type: 'error',
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập loại phòng khác"
      });
      return;
    }

    if (!capacity.trim() || isNaN(Number(capacity))) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: "Sức chứa phải là một số hợp lệ"
      });
      return;
    }

    if (!pricePerNight.trim() || isNaN(Number(pricePerNight))) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: "Giá mỗi đêm phải là một số hợp lệ"
      });
      return;
    }

    if (!bedCount.trim() || isNaN(Number(bedCount))) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: "Số giường phải là một số hợp lệ"
      });
      return;
    }

    if (images.length === 0) {
      Toast.show({
        type: 'error',
        text1: "Thiếu ảnh",
        text2: "Vui lòng chọn ít nhất 1 ảnh cho phòng này"
      });
      return;
    }

    const finalBedType = selectedBedType === "Khác" ? customBedType.trim() : selectedBedType;

    if (selectedBedType === "Khác" && !finalBedType) {
      Toast.show({
        type: 'error',
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập loại giường khác"
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        hotelId: hotelId || "",
        roomNumber: roomNumber.trim(),
        roomType: finalRoomType,
        description: description.trim(),
        capacity: Number(capacity),
        bedCount: Number(bedCount),
        bedType: finalBedType,
        pricePerNight: Number(pricePerNight),
        discountPrice: discountPrice.trim() ? Number(discountPrice) : undefined,
        roomSize: roomSize.trim() ? Number(roomSize) : undefined,
        isSmokingAllowed,
        images: images.map(img => ({
          uri: img.uri,
          fileName: img.fileName,
          mimeType: img.mimeType
        })),
      };

      let result;
      if (isEditMode && id) {
        result = await roomApi.updateRoom(id, payload);
      } else {
        result = await roomApi.createRoom(payload);
      }

      if (result.isSuccess) {
        Alert.alert(
          "Thành công", 
          isEditMode ? "Thông tin phòng đã được cập nhật thành công" : "Phòng đã được tạo thành công", 
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Toast.show({
          type: 'error',
          text1: "Lỗi",
          text2: result.message || (isEditMode ? "Cập nhật phòng thất bại" : "Tạo phòng thất bại")
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: error.message || "Không thể thực hiện tác vụ"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ChevronLeft size={28} color="#0F172A" />
        </Pressable>
        <Text style={styles.title}>{isEditMode ? "Cập nhật thông tin phòng" : "Thêm phòng mới"}</Text>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

        <Input label="Số phòng (Tên phòng) " value={roomNumber} onChangeText={setRoomNumber} />
        
        <Text style={styles.label}>Loại phòng *</Text>
        <View style={{ zIndex: 2000, position: 'relative' }}>
          <Pressable 
            style={styles.dropdownButton} 
            onPress={() => {
              setShowRoomTypeDropdown(!showRoomTypeDropdown);
              if (!showRoomTypeDropdown) setShowBedTypeDropdown(false);
            }}
          >
            <Text style={{ color: selectedRoomType ? '#111827' : '#9CA3AF' }}>
              {selectedRoomType}
            </Text>
            <Ionicons name={showRoomTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
          </Pressable>

          {showRoomTypeDropdown && (
            <View style={styles.dropdownList}>
              {["Standard", "Superior", "Deluxe", "Suite", "Family", "Khác"].map((type) => (
                <Pressable
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedRoomType(type);
                    setShowRoomTypeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {selectedRoomType === "Khác" && (
          <Input 
            label="Nhập loại phòng " 
            value={customRoomType} 
            onChangeText={setCustomRoomType} 
          />
        )}
        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Input label="Sức chứa (Người) " value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Diện tích (m2)" value={roomSize} onChangeText={setRoomSize} keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.label}>Mô tả phòng</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Giường & Giá cả</Text>

        <Input label="Số giường " value={bedCount} onChangeText={setBedCount} keyboardType="numeric" />

        <Text style={styles.label}>Loại giường *</Text>
        <View style={{ zIndex: 1000, position: 'relative' }}>
          <Pressable 
            style={styles.dropdownButton} 
            onPress={() => {
              setShowBedTypeDropdown(!showBedTypeDropdown);
              if (!showBedTypeDropdown) setShowRoomTypeDropdown(false);
            }}
          >
            <Text style={{ color: selectedBedType ? '#111827' : '#9CA3AF' }}>
              {selectedBedType}
            </Text>
            <Ionicons name={showBedTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
          </Pressable>

          {showBedTypeDropdown && (
            <View style={styles.dropdownList}>
              {["Đơn", "Đôi", "Khác"].map((type) => (
                <Pressable
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedBedType(type);
                    setShowBedTypeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {selectedBedType === "Khác" && (
          <Input 
            label="Nhập loại giường " 
            value={customBedType} 
            onChangeText={setCustomBedType} 
          />
        )}

        <Input label="Giá mỗi đêm (VNĐ) *" value={pricePerNight} onChangeText={setPricePerNight} keyboardType="numeric" />
        <Input label="Giá khuyến mãi (VNĐ)" value={discountPrice} onChangeText={setDiscountPrice} keyboardType="numeric" />
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Cho phép hút thuốc</Text>
          <Switch
            value={isSmokingAllowed}
            onValueChange={setIsSmokingAllowed}
            trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
            thumbColor={isSmokingAllowed ? "#2563EB" : "#F3F4F6"}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Hình ảnh phòng *</Text>

        <Pressable style={styles.uploadBtn} onPress={pickImages}>
          <Ionicons name="cloud-upload-outline" size={22} color="#2563EB" />
          <Text style={styles.uploadText}>Chọn ảnh phòng</Text>
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
          <Text style={styles.submitText}>{isEditMode ? "Cập nhật phòng" : "Tạo phòng"}</Text>
        )}
      </Pressable>
    </ScrollView>
    </SafeAreaView>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
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
  dropdownButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#374151",
  },
  textArea: {
    height: 100,
    marginBottom: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
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
});
