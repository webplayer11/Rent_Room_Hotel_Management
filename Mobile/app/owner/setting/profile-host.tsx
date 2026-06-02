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

import {
  hostApi,
  HostProfileDto,
  UpdateHostProfileDto,
} from "../../../src/shared/api/hostApi";

function validateField(value: string, rules: Array<[boolean, string]>) {
  for (const [condition, message] of rules) {
    if (condition) return message;
  }
  return "";
}

export default function EditHostProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // profile gốc từ DB
  const [profile, setProfile] = useState<HostProfileDto | null>(null);

  // UI states
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = (key: string) =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  const touchAll = () =>
    setTouched({
      bankName: true,
      bankAccount: true,
    });

  // ================= VALIDATION =================
  const errors = useMemo(
    () => ({
      bankName: validateField(bankName, [
        [!bankName.trim(), "Tên ngân hàng không được để trống"],
        [
          !/^[a-zA-ZÀ-ỹ\s]+$/.test(bankName.trim()),
          "Tên ngân hàng chỉ được chứa chữ",
        ],
      ]),

      bankAccount: validateField(bankAccount, [
        [!bankAccount.trim(), "Số tài khoản không được để trống"],
        [/^\D+$/.test(bankAccount.trim()), "Số tài khoản chỉ được chứa số"],
      ]),
    }),
    [bankName, bankAccount]
  );

  const isValid = Object.values(errors).every((e) => !e);

  // ================= LOAD PROFILE =================
  const loadProfile = async () => {
    try {
      setLoading(true);

      const res = await hostApi.getMyProfile();

      if (res.isSuccess && res.data) {
        const data = res.data;

        setProfile(data);

        setCompanyName(data.companyName || "");
        setTaxCode(data.taxCode || "");

        setBankName(data.bankName || "");
        setBankAccount(data.bankAccount || "");
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không tải được thông tin hồ sơ",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE PROFILE =================
  const updateProfile = async () => {
    touchAll();
    if (!isValid) return;

    try {
      setSaving(true);

      const dto: UpdateHostProfileDto = {
        companyName: profile?.companyName || undefined,
        taxCode: profile?.taxCode || undefined,
        bankName: bankName.trim() || undefined,
        bankAccount: bankAccount.trim() || undefined,
      };

      const res = await hostApi.updateMyProfile(dto);

      if (res.isSuccess) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Cập nhật hồ sơ thành công",
        });

        setProfile(res.data);

        setTimeout(() => {
          router.back();
        }, 800);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: res.message || "Cập nhật thất bại",
        });
      }
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
        <ActivityIndicator size="large" color="#2563EB" />
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
            <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* COMPANY NAME (LOCKED) */}
          <Text style={styles.label}>Tên công ty / Kinh doanh</Text>
          <TextInput
            value={companyName}
            editable={false}
            style={[styles.input, styles.readOnly]}
          />

          {/* TAX CODE (LOCKED) */}
          <Text style={styles.label}>Mã số thuế</Text>
          <TextInput
            value={taxCode}
            editable={false}
            style={[styles.input, styles.readOnly]}
          />

          {/* BANK NAME */}
          <Text style={styles.label}>Tên ngân hàng</Text>
          <TextInput
            value={bankName}
            onChangeText={(v) => {
              setBankName(v);
              touch("bankName");
            }}
            placeholder="Nhập tên ngân hàng"
            style={[
              styles.input,
              touched.bankName && errors.bankName ? styles.inputError : null,
            ]}
          />
          {touched.bankName && errors.bankName ? (
            <Text style={styles.errorText}>{errors.bankName}</Text>
          ) : null}

          {/* BANK ACCOUNT */}
          <Text style={styles.label}>Số tài khoản</Text>
          <TextInput
            value={bankAccount}
            onChangeText={(v) => {
              setBankAccount(v);
              touch("bankAccount");
            }}
            keyboardType="number-pad"
            placeholder="Nhập số tài khoản"
            style={[
              styles.input,
              touched.bankAccount && errors.bankAccount
                ? styles.inputError
                : null,
            ]}
          />
          {touched.bankAccount && errors.bankAccount ? (
            <Text style={styles.errorText}>{errors.bankAccount}</Text>
          ) : null}

          {/* BUTTON */}
          <TouchableOpacity
            style={[styles.button, (!isValid || saving) && styles.disabled]}
            onPress={updateProfile}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Đang lưu..." : "Cập nhật hồ sơ"}
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
    backgroundColor: "#F8FAFC",
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
    marginBottom: 28,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },

  label: {
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 6,
    color: "#374151",
    fontSize: 14,
  },

  input: {
    borderWidth: 1.2,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: "#111827",
  },

  readOnly: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },

  inputError: {
    borderColor: "#EF4444",
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },

  button: {
    marginTop: 28,
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  disabled: {
    backgroundColor: "#93C5FD",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});