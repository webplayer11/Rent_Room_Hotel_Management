import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { tokenStorage } from "../../../src/shared/storage/tokenStorage";
import { profileApi, ProfileDto } from "../../../src/shared/api/profileApi";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return "AD";
  const words = fullName.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Chưa có";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Chưa có";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── AccountInfoModal ──────────────────────────────────────────────────────────

type ModalRow = { icon: string; label: string; value: string; highlight?: string };

function AccountInfoModal({
  visible,
  profile,
  onClose,
}: {
  visible: boolean;
  profile: ProfileDto | null;
  onClose: () => void;
}) {
  const rows: ModalRow[] = [
    {
      icon: "person-outline",
      label: "Họ tên",
      value: profile?.fullName?.trim() || "Chưa cập nhật",
    },
    {
      icon: "mail-outline",
      label: "Email",
      value: profile?.email ?? "—",
    },
    
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={m.overlay} onPress={onClose}>
        {/* Stop propagation so tapping inside sheet doesn't close */}
        <Pressable style={m.sheet} onPress={() => {}}>
          <View style={m.handle} />

          <Text style={m.sheetTitle}>Thông tin tài khoản</Text>

          {rows.map((row, i) => (
            <View
              key={row.label}
              style={[m.row, i === rows.length - 1 && m.rowLast]}
            >
              <View style={m.iconBox}>
                <Ionicons name={row.icon as any} size={18} color="#5392F9" />
              </View>
              <View style={m.rowBody}>
                <Text style={m.rowLabel}>{row.label}</Text>
                <Text style={[m.rowValue, row.highlight ? { color: row.highlight } : null]}>
                  {row.value}
                </Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={m.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={m.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── MenuItem ──────────────────────────────────────────────────────────────────

function MenuItem({
  icon,
  label,
  onPress,
  danger,
  last,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <>
      <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.65}>
        <View style={[s.menuIcon, danger && s.menuIconDanger]}>
          <Ionicons
            name={icon as any}
            size={19}
            color={danger ? "#EF4444" : "#5392F9"}
          />
        </View>
        <Text style={[s.menuLabel, danger && s.menuLabelDanger]}>{label}</Text>
        <Ionicons name="chevron-forward" size={17} color="#CBD5E1" />
      </TouchableOpacity>
      {!last && <View style={s.menuDivider} />}
    </>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AdminProfileScreen() {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchProfile = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await profileApi.getProfile();
      if (res.isSuccess && res.data) setProfile(res.data);
      else setError(res.message ?? "Không tải được thông tin.");
    } catch (e: any) {
      setError(e?.message ?? "Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () =>
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await tokenStorage.clearTokens();
          router.replace("/auth/login");
        },
      },
    ]);



  // ── Loading ──
  if (loading) {
    return (
      <SafeAreaView style={s.centered}>
        <ActivityIndicator size="large" color="#5392F9" />
        <Text style={s.loadingText}>Đang tải thông tin...</Text>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <SafeAreaView style={s.centered}>
        <Text style={s.errorEmoji}>⚠️</Text>
        <Text style={s.errorMsg}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => fetchProfile()}>
          <Text style={s.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const initials = getInitials(profile?.fullName);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProfile(true)}
            tintColor="#fff"
            colors={["#5392F9"]}
          />
        }
      >
        {/* ── Hero ── */}
        <View style={s.hero}>
          <View style={s.avatarRing}>
            <Text style={s.initials}>{initials}</Text>
          </View>
          <Text style={s.heroName}>
            {profile?.fullName?.trim() || "Admin"}
          </Text>
          <Text style={s.heroEmail}>{profile?.email ?? ""}</Text>
        </View>

        {/* ── Section: Cá nhân ── */}
        <Text style={s.sectionLabel}>CÁ NHÂN</Text>
        <View style={s.card}>
          <MenuItem
            icon="person-circle-outline"
            label="Thông tin tài khoản"
            onPress={() => setModalVisible(true)}
            last
          />
        </View>

        {/* ── Section: Hệ thống ── */}
        <Text style={s.sectionLabel}>HỆ THỐNG</Text>
        <View style={s.card}>
          <MenuItem
            icon="log-out-outline"
            label="Đăng xuất"
            onPress={handleLogout}
            danger
            last
          />
        </View>

      </ScrollView>

      <AccountInfoModal
        visible={modalVisible}
        profile={profile}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ── Screen Styles ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  scroll: { paddingBottom: 48 },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 28,
  },

  // Hero header
  hero: {
    backgroundColor: "#5392F9",
    paddingTop: 32,
    paddingBottom: 36,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#5392F9",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.55)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  initials: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  heroEmail: {
    marginTop: 5,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.1,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.1,
    marginTop: 28,
    marginBottom: 8,
    marginHorizontal: 20,
  },

  // Card
  card: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.055,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  // Menu item
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },
  menuIconDanger: {
    backgroundColor: "#FEF2F2",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
  },
  menuLabelDanger: {
    color: "#EF4444",
    fontWeight: "600",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 65,
  },

  // Version
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#CBD5E1",
    marginTop: 32,
    fontWeight: "500",
  },

  // Loading / Error
  loadingText: { marginTop: 14, fontSize: 15, color: "#64748B" },
  errorEmoji: { fontSize: 40, marginBottom: 10 },
  errorMsg: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: "#5392F9",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 22,
  },
  retryText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});

// ── Modal Styles ──────────────────────────────────────────────────────────────

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingBottom: 40,
    paddingTop: 14,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 22,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },

  // Rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rowBody: { flex: 1 },
  rowLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  // Close button
  closeBtn: {
    marginTop: 22,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
});