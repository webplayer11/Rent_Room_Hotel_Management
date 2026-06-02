import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { authApi } from "../../../src/shared/api/authApi";

// ── Types ──────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5; // 5 = success screen

// ── Validate helpers ───────────────────────────────────────────────────────
const TAX_REGEX = /^\d{10}(-\d{3})?$/;

function validateCompany(v: string) {
  if (!v.trim()) return "Tên công ty không được để trống";
  if (v.trim().length < 3) return "Tối thiểu 3 ký tự";
  return "";
}

function validateTax(v: string) {
  if (!v.trim()) return "Mã số thuế không được để trống";
  if (!TAX_REGEX.test(v.trim())) return "Mã số thuế gồm 10 chữ số (hoặc 10-3)";
  return "";
}

// ── Step Indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            i < current ? styles.stepDotActive : styles.stepDotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function BecomeHostScreen() {
  const [step, setStep] = useState<Step>(1);

  // Form data
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [businessLicenses, setBusinessLicenses] = useState<any[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Touched
  const [companyTouched, setCompanyTouched] = useState(false);
  const [taxTouched, setTaxTouched] = useState(false);

  const companyErr = validateCompany(companyName);
  const taxErr = validateTax(taxCode);

  // ── Image picker ────────────────────────────────────────────────────────
  const pickImages = async () => {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    const files = result.assets.map((img) => ({
      uri: img.uri,
      name: img.fileName || `license_${Date.now()}.jpg`,
      type: img.mimeType || "image/jpeg",
    }));

    setBusinessLicenses((prev) => [...prev, ...files]);
  }
};

  const removeImage = (idx: number) =>
    setBusinessLicenses((prev) => prev.filter((_, i) => i !== idx));

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setLoading(true);
      await authApi.upgradeToHost(companyName.trim(), taxCode.trim(), businessLicenses);
      setStep(5);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Gửi yêu cầu thất bại",
        text2: err?.response?.data?.message || err?.message || "Vui lòng thử lại",
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Nav helpers ─────────────────────────────────────────────────────────
  const goNext = () => setStep((s) => (s + 1) as Step);
  const goBack = () => {
    if (step === 1) router.back();
    else setStep((s) => (s - 1) as Step);
  };

  // ── Shared header ───────────────────────────────────────────────────────
  const Header = ({ title }: { title: string }) => (
    <View style={styles.header}>
      {step < 5 && (
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {step < 5 && <View style={{ width: 36 }} />}
    </View>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 1 — Giới thiệu
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 1) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Header title="Đăng ký Host" />
          <StepIndicator current={1} total={4} />

          <View style={styles.heroBanner}>
            <Ionicons name="business" size={56} color="#2563EB" />
            <Text style={styles.heroTitle}>Trở thành Đối tác lưu trú</Text>
            <Text style={styles.heroSub}>
              Kiếm thu nhập từ khách sạn của bạn và tiếp cận hàng nghìn khách hàng mỗi ngày.
            </Text>
          </View>

          {[
            { icon: "home-outline", title: "Đăng khách sạn của bạn", sub: "Tạo hồ sơ và đưa lên nền tảng dễ dàng" },
            { icon: "cash-outline", title: "Nhận thu nhập ổn định", sub: "Thanh toán minh bạch, rút tiền nhanh chóng" },
            { icon: "bar-chart-outline", title: "Quản lý booking thông minh", sub: "Theo dõi đặt phòng, doanh thu theo thời gian thực" },
          ].map((item) => (
            <View key={item.title} style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Ionicons name={item.icon as any} size={26} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{item.title}</Text>
                <Text style={styles.benefitSub}>{item.sub}</Text>
              </View>
            </View>
          ))}

          <View style={styles.infoBox}>
            <Ionicons name="time-outline" size={18} color="#92400E" style={{ marginTop: 2 }} />
            <Text style={styles.infoText}>
              Yêu cầu sẽ được Admin xem xét trong <Text style={{ fontWeight: "800" }}>1–3 ngày làm việc</Text>. Bạn cần cung cấp giấy phép kinh doanh hợp lệ.
            </Text>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={goNext}>
            <Text style={styles.btnPrimaryText}>Bắt đầu đăng ký</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 2 — Thông tin doanh nghiệp
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 2) {
    const canNext = !companyErr && !taxErr;

    const handleNext = () => {
      setCompanyTouched(true);
      setTaxTouched(true);
      if (canNext) goNext();
    };

    return (
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Header title="Thông tin doanh nghiệp" />
            <StepIndicator current={2} total={4} />

            <Text style={styles.stepLabel}>Bước 2 / 4</Text>
            <Text style={styles.stepDesc}>Nhập thông tin pháp nhân của doanh nghiệp bạn.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tên công ty / doanh nghiệp *</Text>
              <TextInput
                style={[styles.input, companyTouched && companyErr ? styles.inputErr : styles.inputNormal]}
                placeholder="Ví dụ: Công ty TNHH ABC"
                placeholderTextColor="#9CA3AF"
                value={companyName}
                onChangeText={(v) => { setCompanyName(v); setCompanyTouched(true); }}
                onBlur={() => setCompanyTouched(true)}
              />
              {companyTouched && companyErr ? <Text style={styles.errText}>{companyErr}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mã số thuế *</Text>
              <TextInput
                style={[styles.input, taxTouched && taxErr ? styles.inputErr : styles.inputNormal]}
                placeholder="10 chữ số (VD: 0123456789)"
                placeholderTextColor="#9CA3AF"
                value={taxCode}
                onChangeText={(v) => { setTaxCode(v); setTaxTouched(true); }}
                onBlur={() => setTaxTouched(true)}
                keyboardType="number-pad"
              />
              {taxTouched && taxErr ? <Text style={styles.errText}>{taxErr}</Text> : null}
            </View>

            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.btnOutline} onPress={goBack}>
                <Text style={styles.btnOutlineText}>← Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, { flex: 1 }, !canNext && styles.btnDisabled]}
                onPress={handleNext}
              >
                <Text style={styles.btnPrimaryText}>Tiếp tục →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 3 — Giấy phép kinh doanh
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 3) {
    const canNext = businessLicenses.length > 0;

    const handleNext = () => {
      if (!canNext) {
        Toast.show({ type: "error", text1: "Cần ít nhất 1 ảnh giấy phép", position: "top" });
        return;
      }
      goNext();
    };

    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Header title="Giấy phép kinh doanh" />
          <StepIndicator current={3} total={4} />

          <Text style={styles.stepLabel}>Bước 3 / 4</Text>
          <Text style={styles.stepDesc}>Tải lên ít nhất 1 ảnh giấy phép kinh doanh còn hiệu lực.</Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color="#92400E" style={{ marginTop: 2 }} />
            <Text style={styles.infoText}>Ảnh cần rõ ràng, không mờ/tối. Chấp nhận: JPEG, PNG</Text>
          </View>

          <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
            <Ionicons name="cloud-upload-outline" size={38} color="#2563EB" />
            <Text style={styles.uploadTitle}>Nhấn để chọn ảnh</Text>
            <Text style={styles.uploadSub}>Có thể chọn nhiều ảnh cùng lúc</Text>
          </TouchableOpacity>

          {businessLicenses.length > 0 && (
            <>
              <Text style={styles.countText}>Đã chọn: {businessLicenses.length} ảnh</Text>
              <View style={styles.imageGrid}>
                {businessLicenses.map((item, idx) => (
                  <View key={idx} style={styles.imageCell}>
                    <Image source={{ uri: item.uri }} style={styles.gridImage} />
                    <TouchableOpacity style={styles.deleteOverlay} onPress={() => removeImage(idx)}>
                      <Ionicons name="close-circle" size={22} color="#EF4444" />
                    </TouchableOpacity>
                    <Text style={styles.imageIndex} numberOfLines={1}>
                      Ảnh {idx + 1}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.rowBtns}>
            <TouchableOpacity style={styles.btnOutline} onPress={goBack}>
              <Text style={styles.btnOutlineText}>← Quay lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { flex: 1 }, !canNext && styles.btnDisabled]}
              onPress={handleNext}
            >
              <Text style={styles.btnPrimaryText}>Tiếp tục →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 4 — Xác nhận & Gửi
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 4) {
    const canSubmit = confirmed && !loading;

    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Header title="Xác nhận & Gửi" />
          <StepIndicator current={4} total={4} />

          <Text style={styles.stepLabel}>Bước 4 / 4</Text>
          <Text style={styles.stepDesc}>Kiểm tra lại thông tin trước khi gửi yêu cầu.</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tóm tắt hồ sơ</Text>

            {[
              { icon: "business-outline", label: "Tên công ty", value: companyName },
              { icon: "receipt-outline", label: "Mã số thuế", value: taxCode },
              { icon: "images-outline", label: "Giấy phép", value: `${businessLicenses.length} ảnh đã tải lên` },
            ].map((row) => (
              <View key={row.label} style={styles.summaryRow}>
                <Ionicons name={row.icon as any} size={20} color="#2563EB" style={{ width: 28 }} />
                <View>
                  <Text style={styles.summaryLabel}>{row.label}</Text>
                  <Text style={styles.summaryValue}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Image thumbnails */}
          <View style={styles.thumbRow}>
            {businessLicenses.slice(0, 4).map((img, idx) => (
              <Image key={idx} source={{ uri: img.uri }} style={styles.thumb} />
            ))}
            {businessLicenses.length > 4 && (
              <View style={[styles.thumb, styles.thumbMore]}>
                <Text style={styles.thumbMoreText}>+{businessLicenses.length - 4}</Text>
              </View>
            )}
          </View>

          {/* Checkbox xác nhận */}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setConfirmed(!confirmed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, confirmed && styles.checkboxActive]}>
              {confirmed && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={styles.checkLabel}>
              Tôi xác nhận thông tin trên là chính xác và chịu trách nhiệm về tính hợp lệ của hồ sơ.
            </Text>
          </TouchableOpacity>

          <View style={styles.rowBtns}>
            <TouchableOpacity style={styles.btnOutline} onPress={goBack} disabled={loading}>
              <Text style={styles.btnOutlineText}>← Chỉnh sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { flex: 1 }, !canSubmit && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnPrimaryText}>🚀 Gửi yêu cầu</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 5 — Thành công
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { alignItems: "center", justifyContent: "center", flex: 1 }]}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
        </View>
        <Text style={styles.successTitle}>Yêu cầu đã được gửi! 🎉</Text>
        <Text style={styles.successDesc}>
          Chúng tôi sẽ xem xét hồ sơ của bạn trong <Text style={{ fontWeight: "800" }}>1–3 ngày làm việc</Text>.
          {"\n\n"}
          Sau khi được duyệt, bạn cần đăng nhập lại để sử dụng tài khoản Host.
        </Text>
        <TouchableOpacity style={[styles.btnPrimary, { width: "100%", marginTop: 32 }]} onPress={() => router.back()}>
          <Text style={styles.btnPrimaryText}>Về trang cá nhân</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { padding: 20, paddingBottom: 48 },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },

  // Step indicator
  stepRow: { flexDirection: "row", gap: 6, justifyContent: "center", marginBottom: 24 },
  stepDot: { height: 8, borderRadius: 4 },
  stepDotActive: { width: 28, backgroundColor: "#2563EB" },
  stepDotInactive: { width: 8, backgroundColor: "#E5E7EB" },

  stepLabel: { fontSize: 13, fontWeight: "700", color: "#6B7280", marginBottom: 4 },
  stepDesc: { fontSize: 15, color: "#374151", marginBottom: 20, lineHeight: 22 },

  // Hero (step 1)
  heroBanner: { alignItems: "center", backgroundColor: "#EFF6FF", borderRadius: 20, padding: 28, marginBottom: 20 },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#1E3A8A", marginTop: 12, textAlign: "center" },
  heroSub: { fontSize: 14, color: "#3B82F6", textAlign: "center", marginTop: 8, lineHeight: 20 },

  benefitCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  benefitIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
  benefitTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  benefitSub: { fontSize: 13, color: "#6B7280", marginTop: 3 },

  infoBox: { flexDirection: "row", gap: 10, backgroundColor: "#FEF3C7", borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: "#FCD34D" },
  infoText: { flex: 1, fontSize: 13, color: "#78350F", lineHeight: 19 },

  // Fields
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 8 },
  input: { height: 50, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: "#111827", backgroundColor: "#FFF" },
  inputNormal: { borderColor: "rgba(83,146,249,0.35)" },
  inputErr: { borderColor: "#EF4444" },
  errText: { color: "#EF4444", fontSize: 12, marginTop: 5, marginLeft: 4 },

  // Upload
  uploadBox: { borderWidth: 1.5, borderStyle: "dashed", borderColor: "#93C5FD", backgroundColor: "#EFF6FF", borderRadius: 16, paddingVertical: 32, alignItems: "center", marginBottom: 16 },
  uploadTitle: { fontSize: 15, fontWeight: "700", color: "#2563EB", marginTop: 8 },
  uploadSub: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  countText: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 12 },

  // Image grid
  imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  imageCell: { width: "47%", position: "relative" },
  gridImage: { width: "100%", aspectRatio: 1, borderRadius: 12, backgroundColor: "#E5E7EB" },
  deleteOverlay: { position: "absolute", top: 6, right: 6, backgroundColor: "#FFF", borderRadius: 12 },
  imageIndex: { fontSize: 11, color: "#6B7280", marginTop: 4, textAlign: "center" },

  // Summary card
  summaryCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  summaryTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 14 },
  summaryRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 14 },
  summaryLabel: { fontSize: 12, color: "#6B7280" },
  summaryValue: { fontSize: 15, fontWeight: "700", color: "#111827" },

  // Thumb row
  thumbRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  thumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: "#E5E7EB" },
  thumbMore: { alignItems: "center", justifyContent: "center", backgroundColor: "#DBEAFE" },
  thumbMoreText: { fontSize: 14, fontWeight: "800", color: "#2563EB" },

  // Checkbox
  checkRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", backgroundColor: "#F0FDF4", borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: "#BBF7D0" },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkboxActive: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  checkLabel: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 20 },

  // Buttons
  rowBtns: { flexDirection: "row", gap: 10, marginTop: 8 },
  btnPrimary: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#2563EB", height: 50, borderRadius: 14, paddingHorizontal: 20, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  btnPrimaryText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  btnOutline: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1.5, borderColor: "#D1D5DB", backgroundColor: "#FFF" },
  btnOutlineText: { color: "#374151", fontSize: 14, fontWeight: "700" },
  btnDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },

  // Success
  successIcon: { marginBottom: 20 },
  successTitle: { fontSize: 26, fontWeight: "900", color: "#111827", textAlign: "center", marginBottom: 16 },
  successDesc: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 24 },
});