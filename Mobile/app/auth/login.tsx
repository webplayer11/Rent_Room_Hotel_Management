import Toast from 'react-native-toast-message';
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { authApi } from "../../src/shared/api/authApi";
import { tokenStorage } from "../../src/shared/storage/tokenStorage";
import { AppFormInput } from "../../src/shared/components/AppFormInput";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);

      const res = await authApi.login({
        email: data.email.trim(),
        password: data.password,
      });
      
      const user = res.data;
      const roles = user.roles ?? [];
      const mainRole = roles[0] ?? "Customer";

      // Lưu token + role + tên chủ
      await tokenStorage.saveTokens(
        user.token,
        user.refreshToken,
        mainRole,
        user.fullName
      );

      // Điều hướng theo role
      if (roles.includes("Admin")) {
        router.replace("/admin/home");
      } else if (roles.includes("Host")) {
        router.replace("/owner/home");
      } else if (roles.includes("Customer")) {
        router.replace("/customer/home");
      } else {
        Toast.show({
          type: 'error',
          text1: "Lỗi",
          text2: "Tài khoản chưa được cấp quyền truy cập"
        });
      }
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: "Đăng nhập thất bại",
        text2: e?.response?.data?.message || e?.message || "Email hoặc mật khẩu không chính xác",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: "#F8F9FA" }}
      >
        <ScrollView
          contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          backgroundColor: "#F8F9FA",
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

        <Pressable 
          onPress={handleSubmit(onSubmit)} 
          disabled={loading} 
          style={[button, { opacity: loading ? 0.7 : 1 }]}
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
            style={{
              color: "#5392F9",
              fontWeight: "bold",
            }}
          >
            Đăng ký ngay
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────

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