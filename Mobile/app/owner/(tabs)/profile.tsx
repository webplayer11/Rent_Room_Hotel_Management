import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { hostApi, HostProfileDto } from "../../../src/shared/api/hostApi";

export default function OwnerProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<HostProfileDto | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await hostApi.getMyProfile();
      if (res.isSuccess && res.data) {
        setProfile(res.data);
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

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  // ================= LOGOUT =================
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      Toast.show({
        type: "success",
        text1: "Đăng xuất thành công",
      });
      setTimeout(() => {
        router.replace("/login");
      }, 800);
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể đăng xuất",
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color="#fff" />
          </View>

          <Text style={styles.name}>
            {profile?.fullName || "Chủ khách sạn"}
          </Text>

          <Text style={styles.email}>
            {profile?.email || ""}
          </Text>

          {profile?.isVerified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.verifiedText}>Đã xác minh</Text>
            </View>
          ) : (
            <View style={[styles.verifiedBadge, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="time-outline" size={14} color="#D97706" />
              <Text style={[styles.verifiedText, { color: "#D97706" }]}>Chờ xác minh</Text>
            </View>
          )}
        </View>


        {/* SETTINGS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push("/owner/setting/profile-host")}
          >
            <Ionicons name="create-outline" size={20} color="#2563EB" />
            <Text style={styles.rowText}>Chỉnh sửa hồ sơ</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= COMPONENT =================
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={18} color="#64748B" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ================= STYLE =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  header: {
    backgroundColor: "#2563EB",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },

  email: {
    color: "#BFDBFE",
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
    gap: 4,
  },

  verifiedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9CA3AF",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },

  infoValue: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "600",
    marginTop: 1,
  },

  // Settings rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  rowText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  logoutText: {
    marginLeft: 8,
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 15,
  },
});