import { router } from "expo-router";
import { useState, useMemo } from "react";
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
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { authApi } from "../../src/shared/api/authApi";
import { tokenStorage } from "../../src/shared/storage/tokenStorage";

// ── Validation helpers ──────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(v: string): string {
  if (!v.trim()) return "Email không được để trống";
  if (!EMAIL_REGEX.test(v.trim())) return "Email không đúng định dạng";
  return "";
}

function validatePassword(v: string): string {
  if (!v) return "Mật khẩu không được để trống";
  if (v.length < 6) return "Mật khẩu tối thiểu 6 ký tự";
  return "";
}

// ── Component ───────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Track whether user has touched each field (show errors only after first touch)
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailError = useMemo(() => validateEmail(email), [email]);
  const passwordError = useMemo(() => validatePassword(password), [password]);

  const isFormValid = !emailError && !passwordError;

  const login = async () => {
    // Mark all touched so errors show if submitted blank
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!isFormValid) return;

    try {
      setLoading(true);

      const res = await authApi.login({
        email: email.trim(),
        password,
      });

      const user = res.data;
      console.log(user);
      console.log(user.roles);

      const roles = user.roles ?? [];
      const mainRole = roles[0] ?? "Customer";

      await tokenStorage.saveTokens(
        user.token,
        user.refreshToken,
        mainRole,
        user.fullName
      );

      if (roles.includes("Admin")) {
        router.replace("/admin/home");
      } else if (roles.includes("Host")) {
        router.replace("/owner/home");
      } else if (roles.includes("Customer")) {
        router.replace("/customer/home");
      } else {
        Toast.show({
          type: "error",
          text1: "Không có quyền truy cập",
          text2: "Tài khoản chưa được cấp quyền truy cập",
          position: "top",
        });
      }
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
        text2:
          e?.response?.data?.message ||
          e?.message ||
          "Email hoặc mật khẩu không chính xác. Bạn chưa có tài khoản?",
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !isFormValid;

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
            paddingBottom: 60,
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
              marginBottom: 36,
            }}
          >
            Đăng nhập
          </Text>

          {/* Email */}
          <View>
            <TextInput
              placeholder="Email"
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

          {/* Password */}
          <View style={{ marginTop: 12 }}>
            <View
              style={[
                inputBase,
                passwordTouched && passwordError ? inputError : inputNormal,
                { flexDirection: "row", alignItems: "center", paddingVertical: 0 },
              ]}
            >
              <TextInput
                placeholder="Mật khẩu"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setPasswordTouched(true);
                }}
                onBlur={() => setPasswordTouched(true)}
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  color: "#1F2937",
                  fontSize: 15,
                  paddingVertical: 14,
                  paddingLeft: 0,
                }}
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
            {passwordTouched && passwordError ? (
              <Text style={errorText}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Submit button */}
          <Pressable
            onPress={login}
            disabled={isDisabled}
            style={[
              buttonBase,
              isDisabled ? buttonDisabled : buttonActive,
            ]}
          >
            <Text style={buttonText}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Text>
          </Pressable>

          <Text
            onPress={() => router.push("/auth/forgot-password")}
            style={link}
          >
            Quên mật khẩu?
          </Text>

          <Text
            style={{
              color: "#4B5563",
              textAlign: "center",
              marginTop: 10,
              fontSize: 15,
            }}
          >
            Chưa có tài khoản?{" "}
            <Text
              onPress={() => router.push("/auth/register")}
              style={{ color: "#5392F9", fontWeight: "bold" }}
            >
              Đăng ký ngay
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

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

const link = {
  color: "#5392F9",
  textAlign: "center" as const,
  marginTop: 22,
  marginBottom: 20,
  fontWeight: "600" as const,
  fontSize: 15,
};