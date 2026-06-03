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
  KeyboardAvoidingView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ChevronLeft } from "lucide-react-native";
import { roomApi } from "../../src/shared/api/roomApi";
import { IMAGE_URL } from "../../src/config";
import AmenityPicker from "../../src/shared/components/AmenityPicker";

type RoomImage = {
  id: string;
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

type Step1Data = {
  roomNumber: string;
  selectedRoomType: string;
  customRoomType: string;
  capacity: string;
  roomSize: string;
  description: string;
};

type Step2Data = {
  bedCount: string;
  selectedBedType: string;
  customBedType: string;
  pricePerNight: string;
  discountPrice: string;
  isSmokingAllowed: boolean;
};

const STEPS = ["Cơ bản", "Giá & Giường", "Tiện ích", "Hình ảnh"];

export default function CreateRoomScreen() {
  const router = useRouter();
  const { hotelId, id } = useLocalSearchParams<{ hotelId: string; id?: string }>();
  const isEditMode = !!id;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [step1, setStep1] = useState<Step1Data>({
    roomNumber: "",
    selectedRoomType: "Standard",
    customRoomType: "",
    capacity: "",
    roomSize: "",
    description: "",
  });

  const [step2, setStep2] = useState<Step2Data>({
    bedCount: "",
    selectedBedType: "Đôi",
    customBedType: "",
    pricePerNight: "",
    discountPrice: "",
    isSmokingAllowed: false,
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<RoomImage[]>([]);

  // For Dropdowns
  const [showRoomTypeDropdown, setShowRoomTypeDropdown] = useState(false);
  const [showBedTypeDropdown, setShowBedTypeDropdown] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const loadRoomData = async () => {
        try {
          setLoading(true);
          const res = await roomApi.getRoomById(id);
          if (res.isSuccess && res.data) {
            const room = res.data;
            
            const stdRoomTypes = ["Standard", "Superior", "Deluxe", "Suite", "Family"];
            const isStdRoom = room.roomType && stdRoomTypes.includes(room.roomType);
            
            setStep1({
              roomNumber: room.roomNumber || "",
              selectedRoomType: isStdRoom ? room.roomType! : "Khác",
              customRoomType: isStdRoom ? "" : (room.roomType || ""),
              capacity: String(room.capacity || ""),
              roomSize: room.roomSize ? String(room.roomSize) : "",
              description: room.description || "",
            });

            const stdBedTypes = ["Đơn", "Đôi"];
            const isStdBed = room.bedType && stdBedTypes.includes(room.bedType);

            setStep2({
              bedCount: String(room.bedCount || ""),
              selectedBedType: isStdBed ? room.bedType! : "Khác",
              customBedType: isStdBed ? "" : (room.bedType || ""),
              pricePerNight: String(room.pricePerNight || ""),
              discountPrice: room.discountPrice ? String(room.discountPrice) : "",
              isSmokingAllowed: room.isSmokingAllowed || false,
            });

            if (room.roomAmenities) {
              setAmenities(room.roomAmenities.map((a: any) => a.name || "").filter(Boolean));
            }

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
            Toast.show({ type: 'error', text1: "Lỗi", text2: res.message || "Không thể tải thông tin phòng" });
          }
        } catch (error: any) {
          Toast.show({ type: 'error', text1: "Lỗi", text2: "Đã xảy ra lỗi khi tải dữ liệu phòng" });
        } finally {
          setLoading(false);
        }
      };
      loadRoomData();
    }
  }, [id, isEditMode]);

  const validateStep = (): string | null => {
    const newErrors: Record<string, string> = {};
    let firstError: string | null = null;

    if (step === 0) {
      if (!step1.roomNumber.trim()) {
        firstError = firstError || "Vui lòng nhập số phòng";
      }
      if (!step1.capacity.trim() || isNaN(Number(step1.capacity)) || Number(step1.capacity) <= 0) {
        newErrors.capacity = "Sức chứa phải lớn hơn 0";
        firstError = firstError || newErrors.capacity;
      }
      if (step1.roomSize.trim() && (isNaN(Number(step1.roomSize)) || Number(step1.roomSize) <= 0)) {
        newErrors.roomSize = "Diện tích phải lớn hơn 0";
        firstError = firstError || newErrors.roomSize;
      }
      if (step1.selectedRoomType === "Khác" && !step1.customRoomType.trim()) {
        firstError = firstError || "Vui lòng nhập loại phòng khác";
      }
    }
    if (step === 1) {
      if (!step2.bedCount.trim() || isNaN(Number(step2.bedCount)) || Number(step2.bedCount) <= 0) {
        newErrors.bedCount = "Số giường phải lớn hơn 0";
        firstError = firstError || newErrors.bedCount;
      }
      if (!step2.pricePerNight.trim() || isNaN(Number(step2.pricePerNight)) || Number(step2.pricePerNight) <= 0) {
        newErrors.pricePerNight = "Giá mỗi đêm phải lớn hơn 0";
        firstError = firstError || newErrors.pricePerNight;
      }
      if (step2.discountPrice.trim()) {
        const discount = Number(step2.discountPrice);
        const price = Number(step2.pricePerNight);
        if (isNaN(discount) || discount < 0) {
          newErrors.discountPrice = "Giá khuyến mãi phải là số >= 0";
          firstError = firstError || newErrors.discountPrice;
        } else if (discount >= price) {
          newErrors.discountPrice = "Giá khuyến mãi phải nhỏ hơn giá gốc";
          firstError = firstError || newErrors.discountPrice;
        }
      }
      if (step2.selectedBedType === "Khác" && !step2.customBedType.trim()) {
        firstError = firstError || "Vui lòng nhập loại giường khác";
      }
    }
    if (step === 3 && images.length === 0 && !isEditMode) {
      firstError = firstError || "Vui lòng chọn ít nhất 1 ảnh cho phòng này";
    }

    setErrors(newErrors);
    return firstError;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      Toast.show({ type: "error", text1: "Thiếu thông tin", text2: err });
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  };

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
    const err = validateStep();
    if (err) {
      Toast.show({ type: "error", text1: "Thiếu thông tin", text2: err });
      return;
    }

    if (!hotelId && !isEditMode) {
      Toast.show({ type: 'error', text1: "Lỗi", text2: "Không tìm thấy thông tin khách sạn. Vui lòng thử lại." });
      return;
    }

    try {
      setLoading(true);

      const finalRoomType = step1.selectedRoomType === "Khác" ? step1.customRoomType.trim() : step1.selectedRoomType;
      const finalBedType = step2.selectedBedType === "Khác" ? step2.customBedType.trim() : step2.selectedBedType;

      const payload = {
        hotelId: hotelId || "",
        roomNumber: step1.roomNumber.trim(),
        roomType: finalRoomType,
        description: step1.description.trim(),
        capacity: Number(step1.capacity),
        bedCount: Number(step2.bedCount),
        bedType: finalBedType,
        pricePerNight: Number(step2.pricePerNight),
        discountPrice: step2.discountPrice.trim() ? Number(step2.discountPrice) : undefined,
        roomSize: step1.roomSize.trim() ? Number(step1.roomSize) : undefined,
        isSmokingAllowed: step2.isSmokingAllowed,
        roomAmenities: amenities,
        images: images.map(img => ({
          uri: img.uri,
          fileName: img.fileName,
          mimeType: img.mimeType
        })),
      };

      let result;
      if (isEditMode && id) {
        // Update uses JSON, ignoring images (managed in detail screen)
        result = await roomApi.updateRoom(id, payload);
      } else {
        // Create uses FormData
        result = await roomApi.createRoom(payload);
      }

      if (result.isSuccess) {
        Alert.alert(
          "Thành công", 
          isEditMode ? "Thông tin phòng đã được cập nhật thành công" : "Phòng đã được tạo thành công", 
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Toast.show({ type: 'error', text1: "Lỗi", text2: result.message || (isEditMode ? "Cập nhật phòng thất bại" : "Tạo phòng thất bại") });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: "Lỗi", text2: error.message || "Không thể thực hiện tác vụ" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{isEditMode ? "Sửa phòng" : "Thêm phòng"}</Text>
            <Text style={styles.subtitle}>Bước {step + 1}/{STEPS.length} — {STEPS[step]}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          {STEPS.map((label, i) => (
            <View key={i} style={styles.stepWrap}>
              <View style={[styles.dot, i <= step && styles.dotActive]}>
                {i < step ? (
                  <Ionicons name="checkmark" size={13} color="#FFF" />
                ) : (
                  <Text style={[styles.dotNum, i === step && { color: "#FFF" }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, i === step && { color: "#2563EB" }]}>{label}</Text>
              {i < STEPS.length - 1 && <View style={[styles.line, i < step && styles.lineActive]} />}
            </View>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

              <FieldInput 
                label="Số phòng (Tên phòng) *" 
                value={step1.roomNumber} 
                onChangeText={(v: string) => setStep1({...step1, roomNumber: v})} 
              />
              
              <Text style={styles.label}>Loại phòng *</Text>
              <View style={{ zIndex: 2000, position: 'relative', marginBottom: 14 }}>
                <Pressable 
                  style={styles.dropdownButton} 
                  onPress={() => setShowRoomTypeDropdown(!showRoomTypeDropdown)}
                >
                  <Text style={{ color: step1.selectedRoomType ? '#111827' : '#9CA3AF' }}>
                    {step1.selectedRoomType}
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
                          setStep1({...step1, selectedRoomType: type});
                          setShowRoomTypeDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{type}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {step1.selectedRoomType === "Khác" && (
                <FieldInput 
                  label="Nhập loại phòng khác *" 
                  value={step1.customRoomType} 
                  onChangeText={(v: string) => setStep1({...step1, customRoomType: v})} 
                />
              )}
              
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <FieldInput 
                    label="Sức chứa (Người) *" 
                    value={step1.capacity} 
                    onChangeText={(v: string) => { setStep1({...step1, capacity: v}); setErrors(prev => ({...prev, capacity: ''})); }} 
                    keyboardType="numeric" 
                    error={errors.capacity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FieldInput 
                    label="Diện tích (m2)" 
                    value={step1.roomSize} 
                    onChangeText={(v: string) => { setStep1({...step1, roomSize: v}); setErrors(prev => ({...prev, roomSize: ''})); }} 
                    keyboardType="numeric" 
                    error={errors.roomSize}
                  />
                </View>
              </View>

              <Text style={styles.label}>Mô tả phòng</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={step1.description}
                onChangeText={(v: string) => setStep1({...step1, description: v})}
                multiline
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
                placeholder="Nhập mô tả cho phòng..."
              />
            </View>
          )}

          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Giường & Giá cả</Text>

              <FieldInput 
                label="Số giường *" 
                value={step2.bedCount} 
                onChangeText={(v: string) => { setStep2({...step2, bedCount: v}); setErrors(prev => ({...prev, bedCount: ''})); }} 
                keyboardType="numeric" 
                error={errors.bedCount}
              />

              <Text style={styles.label}>Loại giường *</Text>
              <View style={{ zIndex: 1000, position: 'relative', marginBottom: 14 }}>
                <Pressable 
                  style={styles.dropdownButton} 
                  onPress={() => setShowBedTypeDropdown(!showBedTypeDropdown)}
                >
                  <Text style={{ color: step2.selectedBedType ? '#111827' : '#9CA3AF' }}>
                    {step2.selectedBedType}
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
                          setStep2({...step2, selectedBedType: type});
                          setShowBedTypeDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{type}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {step2.selectedBedType === "Khác" && (
                <FieldInput 
                  label="Nhập loại giường khác *" 
                  value={step2.customBedType} 
                  onChangeText={(v: string) => setStep2({...step2, customBedType: v})} 
                />
              )}

              <CurrencyInput 
                label="Giá mỗi đêm (VNĐ) *" 
                value={step2.pricePerNight} 
                onChangeText={(v: string) => { setStep2({...step2, pricePerNight: v}); setErrors(prev => ({...prev, pricePerNight: ''})); }} 
                error={errors.pricePerNight}
              />
              <CurrencyInput 
                label="Giá khuyến mãi (VNĐ)" 
                value={step2.discountPrice} 
                onChangeText={(v: string) => { setStep2({...step2, discountPrice: v}); setErrors(prev => ({...prev, discountPrice: ''})); }} 
                error={errors.discountPrice}
              />
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Cho phép hút thuốc</Text>
                <Switch
                  value={step2.isSmokingAllowed}
                  onValueChange={(v) => setStep2({...step2, isSmokingAllowed: v})}
                  trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                  thumbColor={step2.isSmokingAllowed ? "#2563EB" : "#F3F4F6"}
                />
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>✨ Tiện ích phòng</Text>
              <Text style={styles.hint}>Chọn các tiện ích có trong phòng này (không bắt buộc)</Text>
              <View style={{ height: 12 }} />
              
              {/* Resuing AmenityPicker from shared components */}
              <AmenityPicker selected={amenities} onChange={setAmenities} />
              
              {amenities.length > 0 && (
                <Text style={[styles.hint, { marginTop: 12, color: "#2563EB", fontWeight: "700" }]}>
                  Đã chọn {amenities.length} tiện ích
                </Text>
              )}
            </View>
          )}

          {step === 3 && (
            <View>
              <View style={[styles.card, { marginBottom: 12 }]}>
                <Text style={styles.sectionTitle}>📝 Xem lại thông tin</Text>
                <ReviewRow icon="bed-outline" label="Tên phòng" value={step1.roomNumber} />
                <ReviewRow icon="key-outline" label="Loại phòng" value={step1.selectedRoomType === "Khác" ? step1.customRoomType : step1.selectedRoomType} />
                <ReviewRow icon="people-outline" label="Sức chứa" value={`${step1.capacity} người`} />
                <ReviewRow icon="pricetag-outline" label="Giá" value={`${Number(step2.pricePerNight).toLocaleString()} đ`} />
                <ReviewRow icon="sparkles-outline" label="Tiện ích" value={amenities.length > 0 ? `${amenities.length} tiện ích đã chọn` : "Không có"} />
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>🖼️ Hình ảnh{isEditMode ? " (Quản lý ở chi tiết phòng)" : " *"}</Text>
                
                {!isEditMode && (
                  <>
                    <Pressable style={styles.uploadBtn} onPress={pickImages}>
                      <Ionicons name="cloud-upload-outline" size={22} color="#2563EB" />
                      <Text style={styles.uploadText}>Chọn ảnh ({images.length} đã chọn)</Text>
                    </Pressable>

                    {images.length === 0 && <Text style={[styles.hint, { textAlign: "center", marginTop: 8 }]}>Chọn ít nhất 1 ảnh</Text>}

                    <View style={styles.imgGrid}>
                      {images.map((img, index) => (
                        <View key={img.id} style={styles.imgCell}>
                          <Image source={{ uri: img.uri }} style={styles.gridImg} />
                          {index === 0 && (
                            <View style={styles.badge}>
                              <Text style={styles.badgeTxt}>Đại diện</Text>
                            </View>
                          )}
                          <Pressable style={styles.removeBtn} onPress={() => removeImage(img.id)}>
                            <Ionicons name="close-circle" size={22} color="#EF4444" />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          <Pressable style={styles.secBtn} onPress={handleBack}>
            <Text style={styles.secBtnTxt}>{step === 0 ? "Hủy" : "Quay lại"}</Text>
          </Pressable>
          
          {step < STEPS.length - 1 ? (
            <Pressable style={styles.primBtn} onPress={handleNext}>
              <Text style={styles.primBtnTxt}>Tiếp tục</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </Pressable>
          ) : (
            <Pressable style={[styles.primBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name={isEditMode ? "save-outline" : "cloud-upload-outline"} size={18} color="#FFF" />
                  <Text style={styles.primBtnTxt}>{isEditMode ? "Cập nhật phòng" : "Tạo phòng"}</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────
function FieldInput({ label, value, onChangeText, keyboardType = "default", error }: { label: string; value: string; onChangeText: (v: string) => void; keyboardType?: any; error?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? { borderColor: '#EF4444' } : null]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
      />
      {error ? <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>{error}</Text> : null}
    </View>
  );
}

function CurrencyInput({ label, value, onChangeText, error }: { label: string; value: string; onChangeText: (v: string) => void; error?: string }) {
  const displayValue = value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";

  const handleChange = (text: string) => {
    const rawValue = text.replace(/\./g, "");
    if (/^\d*$/.test(rawValue)) {
      onChangeText(rawValue);
    }
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? { borderColor: '#EF4444' } : null]}
        value={displayValue}
        onChangeText={handleChange}
        placeholderTextColor="#9CA3AF"
        keyboardType="numeric"
      />
      {error ? <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>{error}</Text> : null}
    </View>
  );
}

function ReviewRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Ionicons name={icon} size={15} color="#6B7280" />
      <Text style={styles.reviewLabel}>{label}:</Text>
      <Text style={styles.reviewValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: "#FFF", 
    borderBottomWidth: 1, 
    borderBottomColor: "#E5E7EB" 
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: "#F3F4F6", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  title: { fontSize: 18, fontWeight: "800", color: "#1E3A8A" },
  subtitle: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  progressRow: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    paddingHorizontal: 12, 
    paddingVertical: 12, 
    backgroundColor: "#FFF", 
    borderBottomWidth: 1, 
    borderBottomColor: "#E5E7EB" 
  },
  stepWrap: { flex: 1, alignItems: "center", position: "relative" },
  dot: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    backgroundColor: "#E5E7EB", 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 4 
  },
  dotActive: { backgroundColor: "#2563EB" },
  dotNum: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  stepLabel: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", textAlign: "center" },
  line: { 
    position: "absolute", 
    top: 13, 
    left: "58%", 
    right: "-38%", 
    height: 2, 
    backgroundColor: "#E5E7EB", 
    zIndex: -1 
  },
  lineActive: { backgroundColor: "#2563EB" },
  content: { padding: 16, paddingBottom: 24 },
  card: { 
    backgroundColor: "#FFF", 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: "#E5E7EB" 
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 6 },
  input: { 
    backgroundColor: "#F8FAFC", 
    borderWidth: 1, 
    borderColor: "#E5E7EB", 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    fontSize: 14, 
    color: "#111827" 
  },
  textArea: { height: 100, marginBottom: 14 },
  hint: { color: "#6B7280", fontSize: 12, marginTop: 4 },
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
  },
  dropdownList: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
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
  dropdownItemText: { fontSize: 14, color: "#374151" },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  switchLabel: { fontSize: 14, fontWeight: "700", color: "#374151" },
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
    marginBottom: 14 
  },
  uploadText: { color: "#2563EB", fontWeight: "800" },
  imgGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  imgCell: { width: "47%", position: "relative" },
  gridImg: { width: "100%", aspectRatio: 4 / 3, borderRadius: 12, backgroundColor: "#E5E7EB" },
  badge: { 
    position: "absolute", 
    top: 6, 
    left: 6, 
    backgroundColor: "#2563EB", 
    borderRadius: 6, 
    paddingHorizontal: 8, 
    paddingVertical: 3 
  },
  badgeTxt: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  removeBtn: { position: "absolute", top: -6, right: -6, backgroundColor: '#FFF', borderRadius: 12 },
  reviewRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 8 },
  reviewLabel: { fontSize: 13, fontWeight: "700", color: "#6B7280", width: 85 },
  reviewValue: { fontSize: 13, color: "#111827", flex: 1, fontWeight: '500' },
  footer: { 
    flexDirection: "row", 
    gap: 10, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: "#FFF", 
    borderTopWidth: 1, 
    borderTopColor: "#E5E7EB" 
  },
  secBtn: { 
    flex: 1, 
    height: 50, 
    borderRadius: 14, 
    alignItems: "center", 
    justifyContent: "center", 
    borderWidth: 1.5, 
    borderColor: "#D1D5DB", 
    backgroundColor: "#F9FAFB" 
  },
  secBtnTxt: { fontSize: 15, fontWeight: "700", color: "#374151" },
  primBtn: { 
    flex: 2, 
    height: 50, 
    borderRadius: 14, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#2563EB", 
    flexDirection: "row", 
    gap: 8 
  },
  primBtnTxt: { fontSize: 15, fontWeight: "800", color: "#FFF" },
});
