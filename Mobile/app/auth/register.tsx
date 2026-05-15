import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { authApi } from "../../src/shared/api/authApi";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const register = async () => {
    try {
      console.log("Bắt đầu đăng ký");

      if (!fullName || !email || !password || !phoneNumber) {
        Alert.alert(
          "Thông báo",
          "Vui lòng nhập đầy đủ thông tin"
        );
        return;
      }

      const res = await authApi.register({
        fullName,
        email,
        password,
        phoneNumber,
        dateOfBirth: dateOfBirth
          ? `${dateOfBirth}T00:00:00`
          : undefined,
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

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        backgroundColor: "#FFF8F0",
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          textAlign: "center",
          color: "#5C3B1E",
          marginBottom: 24,
        }}
      >
        Đăng ký
      </Text>

      <TextInput
        placeholder="Họ và tên"
        placeholderTextColor="#9E8A78"
        value={fullName}
        onChangeText={setFullName}
        style={input}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#9E8A78"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={input}
      />

      <TextInput
        placeholder="Mật khẩu"
        placeholderTextColor="#9E8A78"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={input}
      />

      <TextInput
        placeholder="Số điện thoại"
        placeholderTextColor="#9E8A78"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={input}
      />

      <TextInput
        placeholder="Ngày sinh (2005-05-14)"
        placeholderTextColor="#9E8A78"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        style={input}
      />

      <TextInput
        placeholder="Giới tính"
        placeholderTextColor="#9E8A78"
        value={gender}
        onChangeText={setGender}
        style={input}
      />

      <TextInput
        placeholder="Địa chỉ"
        placeholderTextColor="#9E8A78"
        value={address}
        onChangeText={setAddress}
        style={input}
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
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#D6BFA9",
  backgroundColor: "#FFFFFF",
  color: "#3E2A1B",
  borderRadius: 14,
  padding: 14,
  marginTop: 14,
  fontSize: 15,
} as const;

const button = {
  backgroundColor: "#8B5A2B",
  paddingVertical: 16,
  borderRadius: 14,
  marginTop: 22,
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 5,
  elevation: 3,
} as const;

const buttonText = {
  color: "#FFF",
  textAlign: "center",
  fontWeight: "bold",
  fontSize: 16,
} as const;

const link = {
  color: "#8B5A2B",
  textAlign: "center",
  marginTop: 22,
  marginBottom: 30,
  fontWeight: "600",
} as const;