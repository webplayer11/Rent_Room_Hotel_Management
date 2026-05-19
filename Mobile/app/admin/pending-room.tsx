import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { adminApi, PendingRoomDto } from "../../src/shared/api/adminApi";
import { router, Stack, useFocusEffect } from "expo-router";

type FilterType = "all" | "newest" | "oldest";

export default function PendingRoomsScreen() {
  const [rooms, setRooms] = useState<PendingRoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const loadPendingRooms = async () => {
    try {
      setLoading(true);
      const result = await adminApi.getPendingRooms();
      if (result.isSuccess) {
        setRooms(result.data || []);
      } else {
        setRooms([]);
      }
    } catch (error: any) {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPendingRooms();
    }, [])
  );

  const displayRooms = useMemo(() => {
    const list = [...rooms];
    if (filter === "newest") {
      return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    if (filter === "oldest") {
      return list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    return list;
  }, [rooms, filter]);

  const renderFilterButton = (label: string, value: FilterType) => {
    const active = filter === value;
    return (
      <TouchableOpacity
        style={[styles.filterButton, active && styles.filterButtonActive]}
        onPress={() => setFilter(value)}
      >
        <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: PendingRoomDto }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/admin/room-detail",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.roomNumber?.charAt(0)?.toUpperCase() || "R"}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>Phòng: {item.roomNumber} ({item.roomType})</Text>
          <Text style={styles.address} numberOfLines={1}>Giá: {item.pricePerNight?.toLocaleString("vi-VN")} đ/đêm</Text>
          {item.createdAt ? (
            <Text style={styles.date}>Ngày gửi: {new Date(item.createdAt).toLocaleDateString("vi-VN")}</Text>
          ) : null}
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Chờ duyệt</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={styles.loadingText}>Đang tải danh sách...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Phòng chờ duyệt",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.filterContainer}>
        {renderFilterButton("Tất cả", "all")}
        {renderFilterButton("Mới nhất", "newest")}
        {renderFilterButton("Cũ nhất", "oldest")}
      </View>

      <FlatList
        data={displayRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadPendingRooms}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có phòng nào chờ duyệt</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 14 },
  filterContainer: { flexDirection: "row", gap: 10, marginBottom: 16 },
  filterButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D1D5DB" },
  filterButtonActive: { backgroundColor: "#D97706", borderColor: "#D97706" },
  filterText: { color: "#374151", fontSize: 14, fontWeight: "600" },
  filterTextActive: { color: "#FFFFFF" },
  list: { paddingBottom: 20 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB", flexDirection: "row", alignItems: "center" },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#FEF3C7", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: "#D97706", fontSize: 18, fontWeight: "700" },
  info: { flex: 1, marginRight: 8 },
  name: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
  address: { fontSize: 14, color: "#4B5563", marginBottom: 6 },
  date: { fontSize: 12, color: "#9CA3AF" },
  badge: { backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#D97706", fontSize: 12, fontWeight: "600" },
  emptyText: { textAlign: "center", marginTop: 40, color: "#6B7280", fontSize: 16 },
});
