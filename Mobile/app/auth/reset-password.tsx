import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

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

      Alert.alert("Thành công", "Đổi mật khẩu thành công");

      router.replace("/auth/login");
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        Đặt lại mật khẩu
      </Text>

      <TextInput
        placeholder="Mật khẩu mới"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={input}
      />

      <Pressable onPress={handleReset} style={button}>
        <Text style={buttonText}>Đổi mật khẩu</Text>
      </Pressable>
    </View>
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 12,
  padding: 14,
  marginTop: 16,
} as const;

const button = {
  backgroundColor: "#8B5A2B",
  padding: 15,
  borderRadius: 12,
  marginTop: 20,
} as const;

const buttonText = {
  color: "#fff",
  textAlign: "center",
  fontWeight: "bold",
} as const;