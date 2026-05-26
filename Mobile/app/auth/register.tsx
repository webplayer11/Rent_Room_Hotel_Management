import Toast from 'react-native-toast-message';
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
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
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { authApi } from "../../src/shared/api/authApi";
import { AppFormInput } from "../../src/shared/components/AppFormInput";

const registerSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  phoneNumber: z.string().min(1, "Vui lòng nhập số điện thoại"),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

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
  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      address: "",
    }
  });

  // dateOfBirth stores the finalized Date object; null means not selected yet
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [dateOfBirthText, setDateOfBirthText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Gender states
  const [gender, setGender] = useState("");
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ScrollView Ref to handle auto-scrolling when input gets focused
  const scrollViewRef = useRef<ScrollView>(null);

  const handleConfirmIOS = () => {
    if (tempDate) setDateOfBirth(tempDate);
    else setDateOfBirth(new Date(2000, 0, 1));
    setShowDatePicker(false);
  };

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && selected) {
        setDateOfBirth(selected);
      }
    } else if (Platform.OS === "ios") {
      if (selected) setTempDate(selected);
    }
  };

  const getDateOfBirthForApi = (): string | undefined => {
    if (Platform.OS === "web") return dateOfBirthText.trim() || undefined;
    return dateOfBirth ? formatApi(dateOfBirth) : undefined;
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const dobForApi = getDateOfBirthForApi();
      const res = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        dateOfBirth: dobForApi ? `${dobForApi}T00:00:00` : undefined,
        gender,
        address: data.address,
      });

      Toast.show({
        type: 'success',
        text1: "Thành công",
        text2: "Đăng ký thành công"
      });

      setTimeout(() => {
        router.replace("/auth/login");
      }, 1000);

    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: e.message || "Đăng ký thất bại"
      });
    }
  };

  const renderDateFieldWeb = () => (
    <View style={{ marginBottom: 16 }}>
      <TextInput
        placeholder="Ngày sinh (yyyy-MM-dd, vd: 2000-05-14)"
        placeholderTextColor="#9CA3AF"
        value={dateOfBirthText}
        onChangeText={setDateOfBirthText}
        style={input}
      />
    </View>
  );

  const renderDateFieldMobile = () => (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity
        style={input}
        onPress={() => {
          setTempDate(dateOfBirth || new Date(2000, 0, 1));
          setShowDatePicker(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 15, color: dateOfBirth ? "#1F2937" : "#9CA3AF", lineHeight: 18 }}>
          {dateOfBirth ? formatDisplay(dateOfBirth) : "Ngày sinh"}
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
          <View style={modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDatePicker(false)} />
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

      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={dateOfBirth || new Date(2000, 0, 1)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}
    </View>
  );

  const renderDateField = () => {
    if (Platform.OS === "web") return renderDateFieldWeb();
    return renderDateFieldMobile();
  };

  const renderGenderField = () => (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity
        style={[input, genderPickerRow]}
        onPress={() => setShowGenderPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 15, color: gender ? "#1F2937" : "#9CA3AF", flex: 1 }}>
          {gender || "Giới tính"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={showGenderPicker} transparent animationType="slide" onRequestClose={() => setShowGenderPicker(false)}>
        <View style={modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowGenderPicker(false)} />
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
                  <Text style={[genderOptionText, gender === option && { color: "#5392F9", fontWeight: "bold" }]}>
                    {option}
                  </Text>
                  {gender === option && <Ionicons name="checkmark" size={18} color="#5392F9" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
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
            paddingBottom: 80,
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

          <AppFormInput
            control={control}
            name="fullName"
            placeholder="Họ và tên"
            containerStyle={{ marginBottom: 0 }}
          />

          <AppFormInput
            control={control}
            name="email"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={{ marginBottom: 0 }}
          />

          <AppFormInput
            control={control}
            name="password"
            placeholder="Mật khẩu"
            secureTextEntry={!showPassword}
            containerStyle={{ marginBottom: 0 }}
            icon={() => (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          />

          <AppFormInput
            control={control}
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            secureTextEntry={!showConfirmPassword}
            containerStyle={{ marginBottom: 0 }}
            icon={() => (
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7}>
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          />

          <AppFormInput
            control={control}
            name="phoneNumber"
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            containerStyle={{ marginBottom: 0 }}
          />

          {renderDateField()}
          {renderGenderField()}

          <AppFormInput
            control={control}
            name="address"
            placeholder="Địa chỉ"
            containerStyle={{ marginBottom: 0 }}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />

          <Pressable onPress={handleSubmit(onSubmit)} style={button}>
            <Text style={buttonText}>Đăng ký</Text>
          </Pressable>

          <Text onPress={() => router.replace("/auth/login")} style={link}>
            Đã có tài khoản? Đăng nhập
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────

const input = {
  borderWidth: 1.5,
  borderColor: "blue",
  backgroundColor: "#FFFFFF",
  color: "#1F2937",
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  height: 52,
  fontSize: 16,
} as const;

const genderPickerRow = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
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