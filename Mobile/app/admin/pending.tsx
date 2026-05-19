import React, {
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  X,
  CheckCircle,
  AlertCircle,
  Maximize2,
  ChevronLeft,
} from "lucide-react-native";
import { adminApi, PendingHostDto } from "../../src/shared/api/adminApi";
import { router,Stack, useFocusEffect } from "expo-router";

type FilterType = "all" | "newest" | "oldest";

export default function PendingHostsScreen() {
  const [hosts, setHosts] = useState<PendingHostDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const loadPendingHosts = async () => {
    try {
      setLoading(true);

      const result = await adminApi.getPendingHosts();

      if (result.isSuccess) {
        setHosts(result.data || []);
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
  useCallback(() => {
    loadPendingHosts();
  }, [])
);

  const displayHosts = useMemo(() => {
    const list = [...hosts];

    if (filter === "newest") {
      return list.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });
    }

    if (filter === "oldest") {
      return list.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        );
      });
    }

    return list;
  }, [hosts, filter]);

  const renderFilterButton = (label: string, value: FilterType) => {
    const active = filter === value;

    return (
      <TouchableOpacity
        style={[styles.filterButton, active && styles.filterButtonActive]}
        onPress={() => setFilter(value)}
      >
        <Text style={[styles.filterText, active && styles.filterTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: PendingHostDto }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/admin/host-request-detail",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.email?.charAt(0)?.toUpperCase() || "H"}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.phone}>{item.phoneNumber}</Text>

          {item.createdAt ? (
            <Text style={styles.date}>
              Ngày gửi: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
            </Text>
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
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang tải danh sách...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
      options={{
      headerShown: true,
      title: "Danh sách chờ duyệt",
      headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
        <ChevronLeft size={28} color="#000" />
      </TouchableOpacity>),
      }}/>
    

      <View style={styles.filterContainer}>
        {renderFilterButton("Tất cả", "all")}
        {renderFilterButton("Mới nhất", "newest")}
        {renderFilterButton("Cũ nhất", "oldest")}
      </View>

      <FlatList
        data={displayHosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadPendingHosts}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có host nào chờ duyệt</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  filterContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  filterButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filterText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  list: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "700",
  },

  info: {
    flex: 1,
  },

  email: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  phone: {
    fontSize: 14,
    color: "#4B5563",
  },

  date: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },

  badge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#4B5563",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
    fontSize: 15,
  },
});