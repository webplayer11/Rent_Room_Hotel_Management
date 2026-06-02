
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { MapPin, ChevronLeft } from "lucide-react-native";
import { hotelApi } from "../../../src/shared/api/hotelApi";
import { IMAGE_URL } from "../../../src/config";
export default function HotelsTab() {
  const router = useRouter();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const result = await hotelApi.getMyHotels();
      if (result.isSuccess) {
        setHotels(result.data || []);
      }
    } catch (error) {
      console.log("Lỗi khi tải danh sách khách sạn:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHotels();
    }, [])
  );

  const getPrimaryImage = (images: any[]) => {
  if (!images || images.length === 0) return null;

  const primary = images.find((img) => img.isPrimary);
  const url = primary ? primary.url : images[0].url;

  return url.startsWith("http")
    ? url
    : `${IMAGE_URL}/${url}`;
};

  const renderHotelItem = ({ item }: { item: any }) => {
    const imageUrl = getPrimaryImage(item.images);
    const roomCount = item.rooms ? item.rooms.length : 0;
    
    // Giả lập trạng thái
    let statusText = "AVAILABLE";
    let statusBg = "#D1FAE5";
    let statusColor = "#059669";

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
            {imageUrl ? (
          <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"/>) : (
        <View style={[styles.image, styles.placeholderImage]}>
           <Text style={{ color: "#9CA3AF" }}>Chưa có ảnh</Text>
        </View>)}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.addressRow}>
            <MapPin size={14} color="#6B7280" style={{ marginRight: 4 }} />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.addRoomButton}
              onPress={() =>
                router.push({
                  pathname: "/owner/room-form",
                  params: { hotelId: item.id },
                })
              }
            >
              <Text style={styles.detailButtonText}>Thêm phòng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailButton}
              onPress={() =>
                router.push({
                  pathname: "/owner/hotel-detail",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.detailButtonText}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Khách sạn của tôi</Text>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#0284C7" />
            <Text style={{ marginTop: 10, color: "#6B7280" }}>Đang tải dữ liệu...</Text>
          </View>
        ) : hotels.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={{ color: "#6B7280", fontSize: 16 }}>Bạn chưa có khách sạn nào.</Text>
            <TouchableOpacity 
              style={{ marginTop: 16, backgroundColor: '#0284C7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
              onPress={() => router.push("/owner/hotel-form")}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Thêm khách sạn ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={hotels}
            keyExtractor={(item) => item.id}
            renderItem={renderHotelItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Màu nền trắng xanh (slate-50)
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    color: "#0284C7",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    // Shadow cho iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Shadow cho Android
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 300,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderImage: {
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  cardBody: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addressText: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  roomInfo: {
    flexDirection: "column",
  },
  roomLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 4,
  },
  roomValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0284C7", // Màu xanh nhấn
  },
  detailButton: {
    flex: 1,
    backgroundColor: "#0F172A", // Đen đậm
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addRoomButton: {
    flex: 1,
    backgroundColor: "#0284C7", // Xanh dương
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  detailButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
