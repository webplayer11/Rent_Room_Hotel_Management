import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { authApi } from "../../src/shared/api/authApi";
import { tokenStorage } from "../../src/shared/storage/tokenStorage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          marginBottom: 40,
          textAlign: "center",
          color: "#D97706",
        }}
      >
        Đăng nhập
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
        }}
      />

      <TextInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          padding: 14,
          marginBottom: 24,
        }}
      />

      <Pressable
        onPress={login}
        disabled={loading}
        style={{
          backgroundColor: "#D97706",
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          opacity: loading ? 0.7 : 1,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/auth/forgot-password")}
        style={{
          marginTop: 20,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#2563EB",
            fontSize: 14,
          }}
        >
          Quên mật khẩu?
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/auth/register")}
        style={{
          marginTop: 16,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#444",
            fontSize: 14,
          }}
        >
          Chưa có tài khoản?{" "}
          <Text
            style={{
              color: "#D97706",
              fontWeight: "bold",
            }}
          >
            Đăng ký ngay
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}