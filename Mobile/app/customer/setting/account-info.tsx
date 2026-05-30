import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { profileApi } from "../../../src/shared/api/profileApi";

// ================= VALIDATION =================
function validateField(value: string, rules: Array<[boolean, string]>) {
  for (const [condition, message] of rules) {
    if (condition) return message;
  }
  return "";
}

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = (key: string) =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  const touchAll = () =>
    setTouched({
      fullName: true,
      phoneNumber: true,
      dateOfBirth: true,
      address: true,
    });

  // ================= VALIDATION =================
  const errors = useMemo(
    () => ({
      fullName: validateField(fullName, [
        [!fullName.trim(), "Họ và tên không được để trống"],
      ]),

      phoneNumber: validateField(phoneNumber, [
        [!phoneNumber.trim(), "Số điện thoại không được để trống"],
        [
          !/^(0[3|5|7|8|9])[0-9]{8}$/.test(phoneNumber),
          "Số điện thoại không hợp lệ",
        ],
      ]),

      dateOfBirth: validateField(dateOfBirth, [
        [!dateOfBirth.trim(), "Ngày sinh không được để trống"],
      ]),

      address: validateField(address, [
        [!address.trim(), "Địa chỉ không được để trống"],
      ]),
    }),
    [fullName, phoneNumber, dateOfBirth, address]
  );

  const isValid = Object.values(errors).every((e) => !e);

  // ================= LOAD =================
  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await profileApi.getProfile();

      const data = res.data;

      setFullName(data.fullName || "");
      setPhoneNumber(data.phoneNumber || "");
      setDateOfBirth(data.dateOfBirth?.split("T")[0] || "");
      setAddress(data.address || "");
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không tải được thông tin",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE =================
  const updateProfile = async () => {
    touchAll();
    if (!isValid) return;

    try {
      setSaving(true);

      await profileApi.updateProfile({
        fullName,
        phoneNumber,
        dateOfBirth,
        address,
      });

      Toast.show({
        type: "success",
        text1: "Thành công ",
        text2: "Cập nhật thông tin thành công",
      });

      setTimeout(() => {
        router.replace("/");
      }, 1200);
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Cập nhật thất bại",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#5392F9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Thông tin cá nhân</Text>

            <View style={{ width: 24 }} />
          </View>

          {/* FULL NAME */}
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            value={fullName}
            onChangeText={(v) => {
              setFullName(v);
              touch("fullName");
            }}
            style={[
              styles.input,
              touched.fullName && errors.fullName ? styles.error : null,
            ]}
          />
          {touched.fullName && errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : null}

          {/* PHONE */}
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            value={phoneNumber}
            onChangeText={(v) => {
              setPhoneNumber(v);
              touch("phoneNumber");
            }}
            keyboardType="phone-pad"
            style={[
              styles.input,
              touched.phoneNumber && errors.phoneNumber
                ? styles.error
                : null,
            ]}
          />
          {touched.phoneNumber && errors.phoneNumber ? (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          ) : null}

          {/* DOB */}
          <Text style={styles.label}>Ngày sinh</Text>
          <TextInput
            value={dateOfBirth}
            onChangeText={(v) => {
              setDateOfBirth(v);
              touch("dateOfBirth");
            }}
            placeholder="YYYY-MM-DD"
            style={[
              styles.input,
              touched.dateOfBirth && errors.dateOfBirth
                ? styles.error
                : null,
            ]}
          />
          {touched.dateOfBirth && errors.dateOfBirth ? (
            <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
          ) : null}

          {/* ADDRESS */}
          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              touch("address");
            }}
            style={[
              styles.input,
              touched.address && errors.address ? styles.error : null,
            ]}
          />
          {touched.address && errors.address ? (
            <Text style={styles.errorText}>{errors.address}</Text>
          ) : null}

          {/* BUTTON */}
          <TouchableOpacity
            style={[styles.button, (!isValid || saving) && styles.disabled]}
            onPress={updateProfile}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Đang lưu..." : "Cập nhật"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================= STYLE =================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },

  label: {
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: "#374151",
  },

  input: {
    borderWidth: 1.2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },

  error: {
    borderColor: "#EF4444",
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },

  button: {
    marginTop: 25,
    backgroundColor: "#5392F9",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  disabled: {
    backgroundColor: "#A5C7FF",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});