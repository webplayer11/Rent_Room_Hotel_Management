import { SafeAreaView } from 'react-native-safe-area-context';
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { User, Mail, Shield, LogOut } from "lucide-react-native";
import { tokenStorage } from "../../../src/shared/storage/tokenStorage";

export default function AdminProfileScreen() {
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
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cá nhân</Text>
        <Text style={styles.subtitle}>Thông tin tài khoản quản trị</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <User size={42} color="#2563EB" />
        </View>

        <Text style={styles.name}>Quản trị viên</Text>

        <View style={styles.infoRow}>
          <Mail size={18} color="#64748B" />
          <Text style={styles.infoText}>admin@example.com</Text>
        </View>

        <View style={styles.infoRow}>
          <Shield size={18} color="#64748B" />
          <Text style={styles.infoText}>Admin</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <LogOut size={20} color="#FFF" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 20,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 20,
  },

  infoRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#334155",
    fontWeight: "600",
  },

  logoutButton: {
    marginTop: 28,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
});