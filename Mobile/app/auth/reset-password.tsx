import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi } from "../../src/shared/api/authApi";

export default function ResetPasswordScreen() {
  const { email, token } = useLocalSearchParams();

  const [newPassword, setNewPassword] = useState("");

  const handleReset = async () => {
    try {
      await authApi.resetPassword(
        email as string,
        token as string,
        newPassword
      );

      Toast.show({
        type: "success",
        text1: "Đổi mật khẩu thành công! ✓",
        text2: "Đang chuyển sang trang đăng nhập...",
        position: "top",
        visibilityTime: 2000,
      });
      setTimeout(() => router.replace("/auth/login"), 1500);
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Đổi mật khẩu thất bại",
        text2: e?.response?.data?.message || e?.message || "Vui lòng thử lại",
        position: "top",
        visibilityTime: 4000,
      });
    }
  };

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
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Đặt lại mật khẩu
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 32,
            }}
          >
            Nhập mật khẩu mới cho tài khoản của bạn
          </Text>

          <TextInput
            placeholder="Mật khẩu mới"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            style={input}
          />

          <Pressable onPress={handleReset} style={button}>
            <Text style={buttonText}>Đổi mật khẩu</Text>
          </Pressable>

          <Text
            onPress={() => router.back()}
            style={{
              color: "#5392F9",
              textAlign: "center",
              marginTop: 22,
              fontWeight: "600",
              fontSize: 15,
            }}
          >
            ← Quay lại
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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