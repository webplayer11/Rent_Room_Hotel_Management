import { router } from "expo-router";
import { useState, useMemo } from "react";
import Toast from "react-native-toast-message";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Modal } from "react-native";
import { StyleSheet } from "react-native";

import { authApi } from "../../src/shared/api/authApi";

// ── Date helpers ─────────────────────────────────────────────────────────────
function formatDisplay(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatApi(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

// ── Validation helpers ────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^(0[3|5|7|8|9])[0-9]{8}$/;

function validateField(value: string, rules: Array<[boolean, string]>): string {
  for (const [condition, message] of rules) {
    if (condition) return message;
  }
  return "";
}

// ── Field wrapper (must live OUTSIDE RegisterScreen to avoid remount on re-render) ──
function Field({
  fieldKey,
  touched,
  error,
  children,
}: {
  fieldKey: string;
  touched: Record<string, boolean>;
  error: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      {children}
      {touched[fieldKey] && error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

function inputStyle(touched: Record<string, boolean>, fieldKey: string, error: string) {
  return [
    styles.input,
    touched[fieldKey] && error ? styles.inputError : styles.inputNormal,
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [dateOfBirthText, setDateOfBirthText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Touched states — show error only after user has interacted
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));
  const touchAll = () =>
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true,
      dob: true,
      gender: true,
      address: true,
    });

  // ── Per-field errors ────────────────────────────────────────────────────────
  const errors = useMemo(
    () => ({
      fullName: validateField(fullName, [
        [!fullName.trim(), "Họ và tên không được để trống"],
      ]),
      email: validateField(email, [
        [!email.trim(), "Email không được để trống"],
        [!EMAIL_REGEX.test(email.trim()), "Email không đúng định dạng"],
      ]),
      password: validateField(password, [
        [!password, "Mật khẩu không được để trống"],
        [password.length < 6, "Mật khẩu tối thiểu 6 ký tự"],
      ]),
      confirmPassword: validateField(confirmPassword, [
        [!confirmPassword, "Vui lòng nhập lại mật khẩu"],
        [confirmPassword !== password, "Mật khẩu nhập lại không khớp"],
      ]),
      phone: validateField(phoneNumber, [
        [!phoneNumber.trim(), "Số điện thoại không được để trống"],
        [!PHONE_REGEX.test(phoneNumber.trim()), "Số điện thoại không hợp lệ (10 số, bắt đầu 03/05/07/08/09)"],
      ]),
      dob:
        Platform.OS === "web"
          ? !dateOfBirthText.trim()
            ? "Ngày sinh không được để trống"
            : ""
          : !dateOfBirth
          ? "Ngày sinh không được để trống"
          : "",
      gender: !gender ? "Vui lòng chọn giới tính" : "",
      address: !address.trim() ? "Địa chỉ không được để trống" : "",
    }),
    [fullName, email, password, confirmPassword, phoneNumber, dateOfBirth, dateOfBirthText, gender, address]
  );

  const isFormValid = Object.values(errors).every((e) => !e);
  const isDisabled = loading || !isFormValid;

  // ── Date handlers ───────────────────────────────────────────────────────────
  const handleConfirmIOS = () => {
    if (tempDate) {
      setDateOfBirth(tempDate);
    } else {
      setDateOfBirth(new Date(2000, 0, 1));
    }
    touch("dob");
    setShowDatePicker(false);
  };

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && selected) {
        setDateOfBirth(selected);
        touch("dob");
      }
    } else if (Platform.OS === "ios") {
      if (selected) setTempDate(selected);
    }
  };

  const getDateOfBirthForApi = (): string | undefined => {
    if (Platform.OS === "web") return dateOfBirthText.trim() || undefined;
    return dateOfBirth ? formatApi(dateOfBirth) : undefined;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const register = async () => {
    touchAll();
    if (!isFormValid) return;

    try {
      const dobForApi = getDateOfBirthForApi();
      await authApi.register({
        fullName,
        email,
        password,
        phoneNumber,
        dateOfBirth: dobForApi ? `${dobForApi}T00:00:00` : undefined,
        gender,
        address,
      });

      Toast.show({
        type: "success",
        text1: "Đăng ký thành công! 🎉",
        text2: "Chuyển sang trang đăng nhập...",
        position: "top",
        visibilityTime: 2000,
      });
      setTimeout(() => router.replace("/auth/login"), 1500);
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Đăng ký thất bại",
        text2: e?.response?.data?.message || e?.message || "Vui lòng thử lại",
        position: "top",
        visibilityTime: 4000,
      });
    }
  };

  // inputStyle and Field are defined at module level (outside this component)

  // ── Date field ────────────────────────────────────────────────────────────
  const renderDateField = () => {
    if (Platform.OS === "web") {
      return (
        <Field fieldKey="dob" touched={touched} error={errors.dob}>
          <TextInput
            placeholder="Ngày sinh (yyyy-MM-dd)"
            placeholderTextColor="#9CA3AF"
            value={dateOfBirthText}
            onChangeText={(v) => { setDateOfBirthText(v); touch("dob"); }}
            style={inputStyle(touched, "dob", errors.dob)}
          />
        </Field>
      );
    }
    return (
      <Field fieldKey="dob" touched={touched} error={errors.dob}>
        <TouchableOpacity
          style={[inputStyle(touched, "dob", errors.dob), { justifyContent: "center" }]}
          onPress={() => {
            setTempDate(dateOfBirth || new Date(2000, 0, 1));
            setShowDatePicker(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 15, color: dateOfBirth ? "#1F2937" : "#9CA3AF" }}>
            {dateOfBirth ? formatDisplay(dateOfBirth) : "Ngày sinh"}
          </Text>
        </TouchableOpacity>

        {Platform.OS === "ios" && (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDatePicker(false)} />
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ paddingVertical: 4 }}>
                    <Text style={styles.modalCancelText}>Hủy</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitleText}>Chọn ngày sinh</Text>
                  <TouchableOpacity onPress={handleConfirmIOS} style={{ paddingVertical: 4 }}>
                    <Text style={styles.modalConfirmText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={tempDate || new Date(2000, 0, 1)}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onChange={onDateChange}
                    locale="vi-VN"
                    textColor="#1F2937"
                    style={{ height: 216, width: 320 }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}

        {Platform.OS === "android" && showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date(2000, 0, 1)}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        )}
      </Field>
    );
  };

  // ── Gender field ──────────────────────────────────────────────────────────
  const renderGenderField = () => (
    <Field fieldKey="gender" touched={touched} error={errors.gender}>
      <TouchableOpacity
        style={[inputStyle(touched, "gender", errors.gender), { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
        onPress={() => { setShowGenderPicker(true); touch("gender"); }}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 15, color: gender ? "#1F2937" : "#9CA3AF", flex: 1 }}>
          {gender || "Giới tính"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal
        visible={showGenderPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowGenderPicker(false)} />
          <View style={styles.genderModalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)} style={{ paddingVertical: 4 }}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleText}>Chọn giới tính</Text>
              <View style={{ width: 40 }} />
            </View>
            <View style={styles.genderOptionsWrapper}>
              {["Nam", "Nữ", "Khác"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.genderOptionItem}
                  onPress={() => {
                    setGender(option);
                    touch("gender");
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={[styles.genderOptionText, gender === option && { color: "#5392F9", fontWeight: "bold" }]}>
                    {option}
                  </Text>
                  {gender === option && <Ionicons name="checkmark" size={18} color="#5392F9" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </Field>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 28,
            paddingVertical: 40,
            paddingBottom: 80,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#1A1A1A", marginBottom: 28 }}>
            Đăng ký
          </Text>

          {/* Họ và tên */}
          <Field fieldKey="fullName" touched={touched} error={errors.fullName}>
            <TextInput
              placeholder="Họ và tên"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={(v) => { setFullName(v); touch("fullName"); }}
              onBlur={() => touch("fullName")}
              style={inputStyle(touched, "fullName", errors.fullName)}
            />
          </Field>

          {/* Email */}
          <Field fieldKey="email" touched={touched} error={errors.email}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(v) => { setEmail(v); touch("email"); }}
              onBlur={() => touch("email")}
              autoCapitalize="none"
              keyboardType="email-address"
              style={inputStyle(touched, "email", errors.email)}
            />
          </Field>

          {/* Mật khẩu */}
          <Field fieldKey="password" touched={touched} error={errors.password}>
            <View style={[inputStyle(touched, "password", errors.password), { flexDirection: "row", alignItems: "center", paddingVertical: 0 }]}>
              <TextInput
                placeholder="Mật khẩu"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(v) => { setPassword(v); touch("password"); }}
                onBlur={() => touch("password")}
                secureTextEntry={!showPassword}
                style={{ flex: 1, color: "#1F2937", fontSize: 15, paddingVertical: 14 }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Field>

          {/* Nhập lại mật khẩu */}
          <Field fieldKey="confirmPassword" touched={touched} error={errors.confirmPassword}>
            <View style={[inputStyle(touched, "confirmPassword", errors.confirmPassword), { flexDirection: "row", alignItems: "center", paddingVertical: 0 }]}>
              <TextInput
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); touch("confirmPassword"); }}
                onBlur={() => touch("confirmPassword")}
                secureTextEntry={!showConfirmPassword}
                style={{ flex: 1, color: "#1F2937", fontSize: 15, paddingVertical: 14 }}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7}>
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Field>

          {/* Số điện thoại */}
          <Field fieldKey="phone" touched={touched} error={errors.phone}>
            <TextInput
              placeholder="Số điện thoại"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={(v) => { setPhoneNumber(v); touch("phone"); }}
              onBlur={() => touch("phone")}
              keyboardType="phone-pad"
              style={inputStyle(touched, "phone", errors.phone)}
            />
          </Field>

          {/* Ngày sinh */}
          {renderDateField()}

          {/* Giới tính */}
          {renderGenderField()}

          {/* Địa chỉ */}
          <Field fieldKey="address" touched={touched} error={errors.address}>
            <TextInput
              placeholder="Địa chỉ"
              placeholderTextColor="#9CA3AF"
              value={address}
              onChangeText={(v) => { setAddress(v); touch("address"); }}
              onBlur={() => touch("address")}
              style={inputStyle(touched, "address", errors.address)}
            />
          </Field>

          {/* Submit */}
          <Pressable
            onPress={register}
            disabled={isDisabled}
            style={[styles.buttonBase, isDisabled ? styles.buttonDisabled : styles.buttonActive]}
          >
            <Text style={styles.buttonText}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Text>
          </Pressable>

          <Text
            onPress={() => router.replace("/auth/login")}
            style={styles.link}
          >
            Đã có tài khoản? Đăng nhập
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  inputNormal: {
    borderColor: "rgba(83, 146, 249, 0.35)",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
  buttonBase: {
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: "#5392F9",
    shadowColor: "#5392F9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#B0C4F8",
    elevation: 0,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#5392F9",
    textAlign: "center",
    marginTop: 22,
    marginBottom: 20,
    fontWeight: "600",
    fontSize: 15,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    height: 320,
    width: "100%",
  },
  genderModalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    paddingBottom: 30,
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalCancelText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "500",
  },
  modalConfirmText: {
    color: "#5392F9",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  pickerWrapper: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 220,
  },
  genderOptionsWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  genderOptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  genderOptionText: {
    fontSize: 16,
    color: "#1F2937",
  },
});