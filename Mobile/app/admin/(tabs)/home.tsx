import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { tokenStorage } from "../../../src/shared/storage/tokenStorage";

export default function AdminDashboardScreen() {
  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await tokenStorage.clearTokens();

            router.replace("/auth/login");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trang quản trị</Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/admin/pending")}
      >
        <Text style={styles.cardTitle}>Host chờ duyệt</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  card: {
    backgroundColor: "#2563EB",
    padding: 20,
    borderRadius: 16,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});