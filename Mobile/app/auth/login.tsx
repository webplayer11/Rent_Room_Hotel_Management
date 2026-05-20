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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { authApi } from "../../src/shared/api/authApi";
import { tokenStorage } from "../../src/shared/storage/tokenStorage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.login({
        email: email.trim(),
        password,
      });
      
      const user = res.data;
      console.log(user); // kiểm tra xem có đúng roles chua
      console.log(user.roles);

      const roles = user.roles ?? [];
      const mainRole = roles[0] ?? "Customer";

      // Lưu token + role
      await tokenStorage.saveTokens(
        user.token,
        user.refreshToken,
        mainRole
      );

      // Điều hướng theo role
      if (roles.includes("Admin")) {
        router.replace("/admin/home");
      } else if (roles.includes("Host")) {
        router.replace("/owner/home");
      } else if (roles.includes("Customer")) {
        router.replace("/customer/home");
      } else {
        Alert.alert(
          "Lỗi",
          "Tài khoản chưa được cấp quyền truy cập"
        );
      }
    } catch (e: any) {
      Alert.alert(
        "Đăng nhập thất bại",
        e?.response?.data?.message ||
          e?.message ||
          "Email hoặc mật khẩu không chính xác",
        [
          {
            text: "Thử lại",
            style: "cancel",
          },
          {
            text: "Đăng ký ngay",
            onPress: () => router.push("/auth/register"),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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

        <Pressable 
          onPress={login} 
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

const passwordInputContainer = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 0,
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