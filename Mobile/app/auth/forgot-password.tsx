import { router } from "expo-router";
import { useState, useMemo } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi } from "../../src/shared/api/authApi";

// ── Validation helper ─────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(v: string): string {
  if (!v.trim()) return "Email không được để trống";
  if (!EMAIL_REGEX.test(v.trim())) return "Email không đúng định dạng";
  return "";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailError = useMemo(() => validateEmail(email), [email]);
  const isFormValid = !emailError;
  const isDisabled = loading || !isFormValid;

  const handleForgot = async () => {
    setEmailTouched(true);
    if (!isFormValid) return;

    try {
      setLoading(true);
      const res = await authApi.forgotPassword(email);
      const token = res.data.resetToken;

      // Chuyển sang màn hình reset-password ngay, không lộ token qua Alert
      router.push({
        pathname: "/auth/reset-password",
        params: { email, token },
      });
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
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
            Quên mật khẩu
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 32,
            }}
          >
            Nhập email để nhận liên kết đặt lại mật khẩu
          </Text>

          {/* Email input */}
          <View>
            <TextInput
              placeholder="Nhập email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setEmailTouched(true);
              }}
              onBlur={() => setEmailTouched(true)}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[
                inputBase,
                emailTouched && emailError ? inputError : inputNormal,
              ]}
            />
            {emailTouched && emailError ? (
              <Text style={errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleForgot}
            disabled={isDisabled}
            style={[
              buttonBase,
              isDisabled ? buttonDisabled : buttonActive,
            ]}
          >
            <Text style={buttonText}>
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </Text>
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
            ← Quay lại đăng nhập
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const inputBase = {
  borderWidth: 1.5,
  backgroundColor: "#FFFFFF",
  color: "#1F2937",
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 15,
} as const;

const inputNormal = {
  borderColor: "rgba(83, 146, 249, 0.35)",
} as const;

const inputError = {
  borderColor: "#EF4444",
} as const;

const errorText = {
  color: "#EF4444",
  fontSize: 12,
  marginTop: 5,
  marginLeft: 4,
} as const;

const buttonBase = {
  paddingVertical: 14,
  borderRadius: 24,
  marginTop: 24,
  alignItems: "center" as const,
};

const buttonActive = {
  backgroundColor: "#5392F9",
  shadowColor: "#5392F9",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 4,
} as const;

const buttonDisabled = {
  backgroundColor: "#B0C4F8",
  elevation: 0,
} as const;

const buttonText = {
  color: "#FFF",
  textAlign: "center" as const,
  fontWeight: "bold" as const,
  fontSize: 16,
};