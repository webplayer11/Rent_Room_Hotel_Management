import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

import { profileApi } from "../../../src/shared/api/profileApi";
import { tokenStorage } from "../../../src/shared/storage/tokenStorage";

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await profileApi.getProfile();
      setProfile(res.data);
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

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await tokenStorage.clearTokens();
          Toast.show({
            type: "success",
            text1: "Đăng xuất thành công",
          });
          setTimeout(() => {
            router.replace("/auth/login");
          }, 800);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#5392F9" />
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
            {profile?.fullName || "Chủ nhà"}
          </Text>

          <Text style={styles.email}>
            {profile?.email || ""}
          </Text>
        </View>

        {/* ACCOUNT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cá nhân</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push("/customer/setting/account-info")}
          >
            <Ionicons name="person-outline" size={20} color="#5392F9" />
            <Text style={styles.rowText}>Thông tin tài khoản</Text>
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
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: {
    marginLeft: 8,
    color: "#EF4444",
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#5392F9",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    color: "#E5E7EB",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9CA3AF",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
});