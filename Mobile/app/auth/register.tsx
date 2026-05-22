import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import { authApi } from "../../src/shared/api/authApi";

/** Format a Date object → "dd/MM/yyyy" for display */
function formatDisplay(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Format a Date object → "yyyy-MM-dd" for API */
function formatApi(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  
  // dateOfBirth stores the finalized Date object; null means not selected yet
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  
  // tempDate holds the temporary selected value in iOS bottom sheet before clicking "Xác nhận"
  const [tempDate, setTempDate] = useState<Date | null>(null);

  // For web fallback: raw text input
  const [dateOfBirthText, setDateOfBirthText] = useState("");

  // Controls visibility of DatePicker (iOS modal or Android dialog)
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Gender states
  const [gender, setGender] = useState("");
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const [address, setAddress] = useState("");

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ScrollView Ref to handle auto-scrolling when input gets focused
  const scrollViewRef = useRef<ScrollView>(null);

  /** Handles confirmation for iOS modal */
  const handleConfirmIOS = () => {
    if (tempDate) {
      setDateOfBirth(tempDate);
    } else {
      setDateOfBirth(new Date(2000, 0, 1));
    }
    setShowDatePicker(false);
  };

  /** Handles date changes from the DateTimePicker */
  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && selected) {
        setDateOfBirth(selected);
      }
    } else if (Platform.OS === "ios") {
      if (selected) {
        setTempDate(selected);
      }
    }
  };

  /** Build the dateOfBirth string for the API (yyyy-MM-dd) */
  const getDateOfBirthForApi = (): string | undefined => {
    if (Platform.OS === "web") {
      return dateOfBirthText.trim() || undefined;
    }
    return dateOfBirth ? formatApi(dateOfBirth) : undefined;
  };

  const register = async () => {
    try {
      console.log("Bắt đầu đăng ký");

      // Validate required text fields
      if (!fullName.trim()) {
        Alert.alert("Thông báo", "Vui lòng nhập họ và tên");
        return;
      }
      if (!email.trim()) {
        Alert.alert("Thông báo", "Vui lòng nhập email");
        return;
      }
      if (!phoneNumber.trim()) {
        Alert.alert("Thông báo", "Vui lòng nhập số điện thoại");
        return;
      }
      if (!password) {
        Alert.alert("Thông báo", "Vui lòng nhập mật khẩu");
        return;
      }
      if (!confirmPassword) {
        Alert.alert("Thông báo", "Vui lòng nhập lại mật khẩu");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Thông báo", "Mật khẩu nhập lại không khớp");
        return;
      }

      const dobForApi = getDateOfBirthForApi();

      // Only send password to backend, exclude confirmPassword
      const res = await authApi.register({
        fullName,
        email,
        password,
        phoneNumber,
        dateOfBirth: dobForApi ? `${dobForApi}T00:00:00` : undefined,
        gender,
        address,
      });

      console.log("REGISTER SUCCESS:", res);

      Alert.alert(
        "Thành công",
        "Đăng ký thành công"
      );

      setTimeout(() => {
        router.replace("/auth/login");
      }, 1000);

    } catch (e: any) {
      console.log("REGISTER ERROR:", e);

      Alert.alert(
        "Lỗi",
        e.message || "Đăng ký thất bại"
      );
    }
  };

  // ── Date field rendering ──────────────────────────────────────────────────

  /** Web: simple TextInput fallback */
  const renderDateFieldWeb = () => (
    <TextInput
      placeholder="Ngày sinh (yyyy-MM-dd, vd: 2000-05-14)"
      placeholderTextColor="#9CA3AF"
      value={dateOfBirthText}
      onChangeText={setDateOfBirthText}
      style={input}
    />
  );

  /** Mobile (iOS/Android): clean simulated input that triggers picker */
  const renderDateFieldMobile = () => (
    <>
      <TouchableOpacity
        style={input}
        onPress={() => {
          setTempDate(dateOfBirth || new Date(2000, 0, 1));
          setShowDatePicker(true);
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            fontSize: 15,
            color: dateOfBirth ? "#1F2937" : "#9CA3AF",
            lineHeight: 18,
          }}
        >
          {dateOfBirth ? formatDisplay(dateOfBirth) : "Ngày sinh"}
        </Text>
      </TouchableOpacity>

      {/* iOS Bottom Sheet style modal picker */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={modalOverlay}>
            {/* Absolute backdrop underneath to close on click outside, avoiding touch conflict */}
            <Pressable 
              style={StyleSheet.absoluteFill} 
              onPress={() => setShowDatePicker(false)}
            />
            
            <View style={modalContainer}>
              <View style={modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ paddingVertical: 4 }}>
                  <Text style={modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <Text style={modalTitleText}>Chọn ngày sinh</Text>
                <TouchableOpacity onPress={handleConfirmIOS} style={{ paddingVertical: 4 }}>
                  <Text style={modalConfirmText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
              <View style={pickerWrapper}>
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

      {/* Android native popups */}
      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={dateOfBirth || new Date(2000, 0, 1)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}
    </>
  );

  const renderDateField = () => {
    if (Platform.OS === "web") return renderDateFieldWeb();
    return renderDateFieldMobile();
  };

  // ── Gender field rendering ───────────────────────────────────────────────

  const renderGenderField = () => (
    <>
      <TouchableOpacity
        style={[input, genderPickerRow]}
        onPress={() => setShowGenderPicker(true)}
        activeOpacity={0.7}
      >
        <Text
          style={{
            fontSize: 15,
            color: gender ? "#1F2937" : "#9CA3AF",
            flex: 1,
          }}
        >
          {gender || "Giới tính"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Gender Bottom Sheet Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={modalOverlay}>
          {/* Absolute backdrop underneath to close on click outside */}
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowGenderPicker(false)}
          />
          
          <View style={genderModalContainer}>
            <View style={modalHeader}>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)} style={{ paddingVertical: 4 }}>
                <Text style={modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <Text style={modalTitleText}>Chọn giới tính</Text>
              <View style={{ width: 40 }} />
            </View>
            
            <View style={genderOptionsWrapper}>
              {["Nam", "Nữ", "Khác"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={genderOptionItem}
                  onPress={() => {
                    setGender(option);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={[
                    genderOptionText,
                    gender === option && { color: "#5392F9", fontWeight: "bold" }
                  ]}>
                    {option}
                  </Text>
                  {gender === option && (
                    <Ionicons name="checkmark" size={18} color="#5392F9" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F8F9FA" }}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          backgroundColor: "#F8F9FA",
          paddingHorizontal: 28,
          paddingVertical: 40,
          paddingBottom: 80, // Generous padding to prevent final fields from being cut off
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            textAlign: "center",
            color: "#1A1A1A",
            marginBottom: 28,
          }}
        >
          Đăng ký
        </Text>

        <TextInput
          placeholder="Họ và tên"
          placeholderTextColor="#9CA3AF"
          value={fullName}
          onChangeText={setFullName}
          style={input}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={input}
        />

        {/* Password field with toggle visibility */}
        <View style={[input, passwordInputContainer]}>
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={{ flex: 1, color: "#1F2937", fontSize: 15, paddingVertical: 14, paddingLeft: 0 }}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password field with toggle visibility */}
        <View style={[input, passwordInputContainer]}>
          <TextInput
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={{ flex: 1, color: "#1F2937", fontSize: 15, paddingVertical: 14, paddingLeft: 0 }}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Số điện thoại"
          placeholderTextColor="#9CA3AF"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          style={input}
        />

        {renderDateField()}

        {renderGenderField()}

        <TextInput
          placeholder="Địa chỉ"
          placeholderTextColor="#9CA3AF"
          value={address}
          onChangeText={setAddress}
          style={input}
          onFocus={() => {
            // Scroll to the end of the scroll view after soft keyboard rises
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
        />

        <Pressable onPress={register} style={button}>
          <Text style={buttonText}>Đăng ký</Text>
        </Pressable>

        <Text
          onPress={() => router.replace("/auth/login")}
          style={link}
        >
          Đã có tài khoản? Đăng nhập
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────

const input = {
  borderWidth: 1,
  borderColor: "rgba(83, 146, 249, 0.3)",
  backgroundColor: "#FFFFFF",
  color: "#1F2937",
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  marginTop: 12,
  fontSize: 15,
} as const;

const genderPickerRow = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
} as const;

const passwordInputContainer = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 0,
} as const;

const modalOverlay = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  justifyContent: "flex-end",
} as const;

const modalContainer = {
  backgroundColor: "#FFFFFF",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  overflow: "hidden",
  height: 320,
  width: "100%",
} as const;

const genderModalContainer = {
  backgroundColor: "#FFFFFF",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  overflow: "hidden",
  paddingBottom: 30,
  width: "100%",
} as const;

const genderOptionsWrapper = {
  paddingHorizontal: 20,
  paddingTop: 8,
} as const;

const genderOptionItem = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: "#F3F4F6",
} as const;

const genderOptionText = {
  fontSize: 16,
  color: "#1F2937",
} as const;

const pickerWrapper = {
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#FFFFFF",
  height: 220,
} as const;

const modalHeader = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: "#F3F4F6",
} as const;

const modalCancelText = {
  color: "#9CA3AF",
  fontSize: 16,
  fontWeight: "500",
} as const;

const modalConfirmText = {
  color: "#5392F9",
  fontSize: 16,
  fontWeight: "bold",
} as const;

const modalTitleText = {
  fontSize: 16,
  fontWeight: "bold",
  color: "#1F2937",
} as const;

const button = {
  backgroundColor: "#5392F9",
  paddingVertical: 14,
  borderRadius: 24,
  marginTop: 24,
  shadowColor: "#5392F9",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 4,
} as const;

const buttonText = {
  color: "#FFF",
  textAlign: "center",
  fontWeight: "bold",
  fontSize: 16,
} as const;

const link = {
  color: "#5392F9",
  textAlign: "center",
  marginTop: 22,
  marginBottom: 20,
  fontWeight: "600",
  fontSize: 15,
} as const;