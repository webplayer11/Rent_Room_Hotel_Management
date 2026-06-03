import Toast from 'react-native-toast-message';
import React, { useState } from "react";
import {
  Alert, Image, Pressable, ScrollView, StyleSheet, Text,
  TextInput, View, ActivityIndicator, Modal, KeyboardAvoidingView, FlatList, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { hotelApi } from "../../src/shared/api/hotelApi";
import AppMap from "../../src/shared/components/AppMap";
import AmenityPicker from "../../src/shared/components/AmenityPicker";

type HotelImage = { id: string; uri: string; fileName?: string | null; mimeType?: string | null };
type Step1Data = { name: string; description: string; starRating: string; checkInTime: string; checkOutTime: string };
type Step2Data = { street: string; district: string; city: string; latitude?: number; longitude?: number; selectedLocation: string };

const STEPS = ["Thông tin", "Tiện ích", "Vị trí", "Hình ảnh"];

export default function CreateHotelScreen() {
  const router = useRouter();
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: 'create' | 'edit' }>();
  const isEdit = mode === "edit";
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [step1, setStep1] = useState<Step1Data>({ name: "", description: "", starRating: "", checkInTime: "", checkOutTime: "" });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [step2, setStep2] = useState<Step2Data>({ street: "", district: "", city: "", latitude: undefined, longitude: undefined, selectedLocation: "" });
  const [mapVisible, setMapVisible] = useState(false);
  const [images, setImages] = useState<HotelImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      hotelApi.getHotelById(id)
        .then((res) => {
          if (res.isSuccess && res.data) {
            const d = res.data;
            setStep1({
              name: d.name || "",
              description: d.description || "",
              starRating: d.starRating ? String(d.starRating) : "",
              checkInTime: d.checkInTime || "",
              checkOutTime: d.checkOutTime || "",
            });
            if (d.address) {
              const parts = d.address.split(", ");
              setStep2({
                street: parts[0] || "",
                district: parts[1] || "",
                city: parts.length > 2 ? parts.slice(2).join(", ") : "",
                latitude: d.latitude,
                longitude: d.longitude,
                selectedLocation: d.address,
              });
            }
            if (d.amenities) {
              setAmenities(d.amenities.map(a => a.name || "").filter(Boolean));
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const validate = (): string | null => {
    const newErrors: Record<string, string> = {};
    let firstError: string | null = null;

    if (step === 0) {
      if (!step1.name.trim()) {
        newErrors.name = "Vui lòng nhập tên khách sạn";
        firstError = firstError || newErrors.name;
      }
      if (!step1.description.trim()) {
        newErrors.description = "Vui lòng nhập mô tả khách sạn";
        firstError = firstError || newErrors.description;
      }
      if (!step1.checkInTime) {
        newErrors.checkInTime = "Vui lòng chọn giờ nhận phòng";
        firstError = firstError || newErrors.checkInTime;
      }
      if (!step1.checkOutTime) {
        newErrors.checkOutTime = "Vui lòng chọn giờ trả phòng";
        firstError = firstError || newErrors.checkOutTime;
      }
      // Rule checkInTime === checkOutTime đã bỏ: check-in/out có thể trùng giờ nhưng khác ngày
    }
    if (step === 2) {
      if (!step2.latitude || !step2.longitude) {
        firstError = firstError || "Vui lòng chọn vị trí trên bản đồ";
      }
      if (!step2.street.trim()) {
        newErrors.street = "Vui lòng nhập số nhà / đường";
        firstError = firstError || newErrors.street;
      }
      if (!step2.district.trim()) {
        newErrors.district = "Vui lòng nhập quận / huyện";
        firstError = firstError || newErrors.district;
      }
      if (!step2.city.trim()) {
        newErrors.city = "Vui lòng nhập tỉnh / thành phố";
        firstError = firstError || newErrors.city;
      }
    }
    if (step === 3 && images.length === 0 && !isEdit) {
      firstError = firstError || "Vui lòng chọn ít nhất 1 ảnh";
    }

    setErrors(newErrors);
    return firstError;
  };

  const handleNext = () => {
    const err = validate();
    if (err) { Toast.show({ type: "error", text1: "Thiếu thông tin", text2: err }); return; }
    setStep((s) => s + 1);
  };

  const handleBack = () => { if (step === 0) { router.back(); return; } setStep((s) => s - 1); };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a, i) => ({ id: `${Date.now()}-${i}`, uri: a.uri, fileName: a.fileName || `hotel_${i}.jpg`, mimeType: a.mimeType || "image/jpeg" }))]);
    }
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { Toast.show({ type: "error", text1: "Thiếu thông tin", text2: err }); return; }
    try {
      setLoading(true);
      if (isEdit && id) {
        const result = await hotelApi.updateHotel(id, {
          name: step1.name.trim(),
          description: step1.description.trim(),
          address: [step2.street.trim(), step2.district.trim(), step2.city.trim()].filter(Boolean).join(", "),
          latitude: step2.latitude,
          longitude: step2.longitude,
          starRating: step1.starRating ? Number(step1.starRating) : null,
          checkInTime: step1.checkInTime,
          checkOutTime: step1.checkOutTime,
          amenities,
        });
        if (result.isSuccess) {
          Toast.show({ type: "success", text1: "Thành công", text2: "Đã lưu thông tin khách sạn" });
          router.back();
        } else {
          Toast.show({ type: "error", text1: "Lỗi", text2: result.message || "Cập nhật khách sạn thất bại" });
        }
      } else {
        const result = await hotelApi.createHotel({
          name: step1.name.trim(), description: step1.description.trim(),
          address: [step2.street.trim(), step2.district.trim(), step2.city.trim()].filter(Boolean).join(", "),
          latitude: step2.latitude, longitude: step2.longitude,
          starRating: step1.starRating ? Number(step1.starRating) : undefined,
          checkInTime: step1.checkInTime, checkOutTime: step1.checkOutTime,
          amenities, images,
        });
        if (result.isSuccess) {
  Toast.show({
    type: "success",
    text1: "Thành công 🎉",
    text2: "Khách sạn đã được gửi chờ admin duyệt",
    visibilityTime: 2000,
    onHide: () => router.back(),
  });
} else {
  Toast.show({
    type: "error",
    text1: "Lỗi",
    text2: result.message || "Tạo khách sạn thất bại",
  });
}
      }
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Lỗi", text2: e.message || "Không thể thực hiện yêu cầu" });
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.backBtn} onPress={handleBack}><Ionicons name="chevron-back" size={22} color="#111827" /></Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{isEdit ? "Sửa khách sạn" : "Thêm khách sạn"}</Text>
            <Text style={s.subtitle}>Bước {step + 1}/{STEPS.length} — {STEPS[step]}</Text>
          </View>
        </View>
        {/* Progress */}
        <View style={s.progressRow}>
          {STEPS.map((label, i) => (
            <View key={i} style={s.stepWrap}>
              <View style={[s.dot, i <= step && s.dotActive]}>
                {i < step ? <Ionicons name="checkmark" size={13} color="#FFF" /> : <Text style={[s.dotNum, i === step && { color: "#FFF" }]}>{i + 1}</Text>}
              </View>
              <Text style={[s.stepLabel, i === step && { color: "#2563EB" }]}>{label}</Text>
              {i < STEPS.length - 1 && <View style={[s.line, i < step && s.lineActive]} />}
            </View>
          ))}
        </View>
        {/* Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {step === 0 && <StepBasic data={step1} onChange={(k, v) => { setStep1((p) => ({ ...p, [k]: v })); setErrors(prev => ({...prev, [k]: ''})); }} errors={errors} />}
          {step === 1 && (
            <View style={s.card}>
              <Text style={s.sectionTitle}>✨ Tiện ích khách sạn</Text>
              <Text style={s.hint}>Chọn các tiện ích khách sạn của bạn (không bắt buộc)</Text>
              <View style={{ height: 12 }} />
              <AmenityPicker selected={amenities} onChange={setAmenities} />
              {amenities.length > 0 && (
                <Text style={[s.hint, { marginTop: 12, color: "#2563EB", fontWeight: "700" }]}>
                  Đã chọn {amenities.length} tiện ích
                </Text>
              )}
            </View>
          )}
          {step === 2 && (
            <StepLocation
              data={step2}
              onChange={(k, v) => { setStep2((p) => ({ ...p, [k]: v })); if (typeof v === 'string') setErrors(prev => ({...prev, [k]: ''})); }}
              mapVisible={mapVisible}
              setMapVisible={setMapVisible}
              errors={errors}
            />
          )}
          {step === 3 && (
            <StepPhotos
              images={images} onPick={pickImages} onRemove={(id) => setImages((p) => p.filter((i) => i.id !== id))}
              step1={step1} step2={step2} amenityCount={amenities.length} isEdit={isEdit}
            />
          )}
        </ScrollView>
        {/* Footer */}
        <View style={s.footer}>
          <Pressable style={s.secBtn} onPress={handleBack}><Text style={s.secBtnTxt}>{step === 0 ? "Hủy" : "Quay lại"}</Text></Pressable>
          {step < 3
            ? <Pressable style={s.primBtn} onPress={handleNext}><Text style={s.primBtnTxt}>Tiếp tục</Text><Ionicons name="arrow-forward" size={18} color="#FFF" /></Pressable>
            : <Pressable style={[s.primBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <><Ionicons name={isEdit ? "save-outline" : "cloud-upload-outline"} size={18} color="#FFF" /><Text style={s.primBtnTxt}>{isEdit ? "Lưu thay đổi" : "Tạo khách sạn"}</Text></>}
              </Pressable>
          }
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Step 1: Basic Info ─────────────────────────────────────────────────────────
function StepBasic({ data, onChange, errors }: { data: Step1Data; onChange: (k: keyof Step1Data, v: string) => void; errors: Record<string, string> }) {
  return (
    <View style={s.card}>
      <Text style={s.sectionTitle}>📋 Thông tin cơ bản</Text>
      <FieldInput
        label="Tên khách sạn *"
        value={data.name}
        onChangeText={(v) => onChange("name", v)}
        placeholder="Nhập tên khách sạn"
        error={errors.name}
      />
      <Text style={s.label}>Mô tả khách sạn *</Text>
      <TextInput
        style={[s.input, s.textArea, errors.description ? { borderColor: '#EF4444' } : null]}
        value={data.description}
        onChangeText={(v) => onChange("description", v)}
        placeholder="Giới thiệu ngắn về khách sạn"
        multiline
        textAlignVertical="top"
        placeholderTextColor="#9CA3AF"
      />
      {errors.description ? <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4, marginBottom: 10 }}>{errors.description}</Text> : <View style={{ height: 14 }} />}
      <StarField label="Số sao (Tuỳ chọn)" value={data.starRating} onChange={(v) => onChange("starRating", v)} />
      <TimeField label="Giờ nhận phòng *" value={data.checkInTime} onChange={(v) => onChange("checkInTime", v)} error={errors.checkInTime} />
      <TimeField label="Giờ trả phòng *" value={data.checkOutTime} onChange={(v) => onChange("checkOutTime", v)} error={errors.checkOutTime} />
    </View>
  );
}

// ── Step 2 (now Step 3): Location ──────────────────────────────────────────────
function StepLocation({ data, onChange, mapVisible, setMapVisible, errors }: { data: Step2Data; onChange: (k: keyof Step2Data, v: any) => void; mapVisible: boolean; setMapVisible: (v: boolean) => void; errors: Record<string, string> }) {
  return (
    <View style={s.card}>
      <Text style={s.sectionTitle}>📍 Vị trí khách sạn</Text>
      <Text style={s.label}>Vị trí trên bản đồ *</Text>
      <Pressable style={[s.input, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]} onPress={() => setMapVisible(true)}>
        <Text style={{ color: data.selectedLocation ? "#111827" : "#9CA3AF", flex: 1 }} numberOfLines={1}>{data.selectedLocation || "Chạm để mở bản đồ"}</Text>
        <Ionicons name="map-outline" size={20} color="#9CA3AF" />
      </Pressable>
      {data.latitude && data.longitude && <Text style={s.hint}>✓ Toạ độ: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</Text>}
      <View style={{ height: 14 }} />
      <FieldInput label="Số nhà / đường *" value={data.street} onChangeText={(v) => onChange("street", v)} placeholder="Ví dụ: 123 Lý Thường Kiệt" error={errors.street} />
      <FieldInput label="Quận / huyện *" value={data.district} onChangeText={(v) => onChange("district", v)} placeholder="Ví dụ: Hoàn Kiếm" error={errors.district} />
      <FieldInput label="Tỉnh / thành phố *" value={data.city} onChangeText={(v) => onChange("city", v)} placeholder="Ví dụ: Hà Nội" error={errors.city} />
      <AppMap visible={mapVisible} onClose={() => setMapVisible(false)} onSelectLocation={(addr, coords) => { onChange("selectedLocation", addr); if (coords) { onChange("latitude", coords.latitude); onChange("longitude", coords.longitude); } setMapVisible(false); }} />
    </View>
  );
}

// ── Step 4: Photos & Review ────────────────────────────────────────────────────
function StepPhotos({ images, onPick, onRemove, step1, step2, amenityCount, isEdit }: { images: HotelImage[]; onPick: () => void; onRemove: (id: string) => void; step1: Step1Data; step2: Step2Data; amenityCount: number; isEdit: boolean }) {
  return (
    <View>
      <View style={[s.card, { marginBottom: 12 }]}>
        <Text style={s.sectionTitle}>📝 Xem lại thông tin</Text>
        <ReviewRow icon="business-outline" label="Tên" value={step1.name} />
        <ReviewRow icon="star-outline" label="Số sao" value={step1.starRating ? `${step1.starRating} sao` : "Chưa chọn"} />
        <ReviewRow icon="sparkles-outline" label="Tiện ích" value={amenityCount > 0 ? `${amenityCount} tiện ích đã chọn` : "Không có"} />
        <ReviewRow icon="time-outline" label="Check-in" value={step1.checkInTime || "Chưa chọn"} />
        <ReviewRow icon="time-outline" label="Check-out" value={step1.checkOutTime || "Chưa chọn"} />
        <ReviewRow icon="location-outline" label="Địa chỉ" value={[step2.street, step2.district, step2.city].filter(Boolean).join(", ") || "Chưa nhập"} />
      </View>
      <View style={s.card}>
        <Text style={s.sectionTitle}>🖼️ Hình ảnh{isEdit ? " (Quản lý ở chi tiết khách sạn)" : " *"}</Text>
        {!isEdit && (
          <>
            <Pressable style={s.uploadBtn} onPress={onPick}>
              <Ionicons name="cloud-upload-outline" size={22} color="#2563EB" />
              <Text style={s.uploadTxt}>Chọn ảnh ({images.length} đã chọn)</Text>
            </Pressable>
            {images.length === 0 && <Text style={[s.hint, { textAlign: "center", marginTop: 8 }]}>Chọn ít nhất 1 ảnh</Text>}
            <View style={s.imgGrid}>
              {images.map((img, i) => (
                <View key={img.id} style={s.imgCell}>
                  <Image source={{ uri: img.uri }} style={s.gridImg} />
                  {i === 0 && <View style={s.badge}><Text style={s.badgeTxt}>Đại diện</Text></View>}
                  <Pressable style={s.removeBtn} onPress={() => onRemove(img.id)}><Ionicons name="close-circle" size={22} color="#EF4444" /></Pressable>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────
function FieldInput({ label, value, onChangeText, placeholder, error }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; error?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, error ? { borderColor: '#EF4444' } : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
      {error ? <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

function ReviewRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={s.reviewRow}>
      <Ionicons name={icon} size={15} color="#6B7280" />
      <Text style={s.reviewLabel}>{label}:</Text>
      <Text style={s.reviewValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

// Generate 30-min slots: 00:00, 00:30 ... 23:30
const TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

function TimeField({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  const [show, setShow] = useState(false);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <Pressable
        style={[s.input, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, error ? { borderColor: '#EF4444' } : null]}
        onPress={() => setShow(true)}
      >
        <Text style={{ color: value ? "#111827" : "#9CA3AF" }}>{value || "Chọn giờ"}</Text>
        <Ionicons name="time-outline" size={20} color={error ? "#EF4444" : "#9CA3AF"} />
      </Pressable>
      {error ? <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</Text> : null}

      <Modal visible={show} transparent animationType="slide" onRequestClose={() => setShow(false)}>
        <Pressable style={s.mOverlay} onPress={() => setShow(false)}>
          <Pressable style={s.timeModal} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={s.mHeader}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{label}</Text>
              <Pressable onPress={() => setShow(false)}>
                <Text style={s.mDone}>Xong</Text>
              </Pressable>
            </View>
            {/* Time list */}
            <FlatList
              data={TIME_SLOTS}
              keyExtractor={(item) => item}
              style={{ maxHeight: 320 }}
              initialScrollIndex={Math.max(0, TIME_SLOTS.indexOf(value))}
              getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const active = item === value;
                return (
                  <Pressable
                    style={[s.timeSlot, active && s.timeSlotActive]}
                    onPress={() => { onChange(item); setShow(false); }}
                  >
                    <Ionicons name="time-outline" size={18} color={active ? "#2563EB" : "#9CA3AF"} />
                    <Text style={[s.timeSlotTxt, active && s.timeSlotTxtActive]}>{item}</Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color="#2563EB" style={{ marginLeft: "auto" }} />}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function StarField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const cur = parseInt(value) || 0;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={s.label}>{label}</Text>
        {cur > 0 && <Pressable onPress={() => onChange("")}><Text style={{ fontSize: 13, color: "#EF4444", fontWeight: "600", marginBottom: 6 }}>Bỏ chọn</Text></Pressable>}
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable key={i} onPress={() => onChange(i.toString())} style={{ paddingVertical: 4, paddingRight: 8 }}>
            <Ionicons name={i <= cur ? "star" : "star-outline"} size={36} color={i <= cur ? "#F59E0B" : "#D1D5DB"} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#1E3A8A" },
  subtitle: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  progressRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  stepWrap: { flex: 1, alignItems: "center", position: "relative" },
  dot: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  dotActive: { backgroundColor: "#2563EB" },
  dotNum: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  stepLabel: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", textAlign: "center" },
  line: { position: "absolute", top: 13, left: "58%", right: "-38%", height: 2, backgroundColor: "#E5E7EB", zIndex: -1 },
  lineActive: { backgroundColor: "#2563EB" },
  content: { padding: 16, paddingBottom: 24 },
  card: { backgroundColor: "#FFF", borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 6 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#111827" },
  textArea: { height: 100, marginBottom: 14 },
  hint: { color: "#6B7280", fontSize: 12, marginTop: 4 },
  uploadBtn: { borderWidth: 1, borderStyle: "dashed", borderColor: "#2563EB", backgroundColor: "#DBEAFE", borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginBottom: 14 },
  uploadTxt: { color: "#2563EB", fontWeight: "800" },
  imgGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  imgCell: { width: "47%", position: "relative" },
  gridImg: { width: "100%", aspectRatio: 4 / 3, borderRadius: 12, backgroundColor: "#E5E7EB" },
  badge: { position: "absolute", top: 6, left: 6, backgroundColor: "#2563EB", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  removeBtn: { position: "absolute", top: 4, right: 4 },
  reviewRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 8 },
  reviewLabel: { fontSize: 13, fontWeight: "700", color: "#6B7280", width: 68 },
  reviewValue: { fontSize: 13, color: "#111827", flex: 1 },
  footer: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  secBtn: { flex: 1, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#D1D5DB", backgroundColor: "#F9FAFB" },
  secBtnTxt: { fontSize: 15, fontWeight: "700", color: "#374151" },
  primBtn: { flex: 2, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#2563EB", flexDirection: "row", gap: 8 },
  primBtnTxt: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  mOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  timeModal: { backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  mHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderColor: "#E5E7EB" },
  mDone: { color: "#2563EB", fontWeight: "800", fontSize: 16 },
  timeSlot: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", height: 52 },
  timeSlotActive: { backgroundColor: "#EFF6FF" },
  timeSlotTxt: { fontSize: 15, color: "#374151", fontWeight: "500" },
  timeSlotTxtActive: { color: "#2563EB", fontWeight: "700" },
});