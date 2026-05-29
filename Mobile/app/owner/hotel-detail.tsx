import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Alert,
    Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ChevronLeft, Plus } from "lucide-react-native";
import { hotelApi } from "../../src/shared/api/hotelApi";
import { roomApi } from "../../src/shared/api/roomApi";
import { IMAGE_URL } from "../../src/config";
import HotelImageManager from "../../src/shared/components/HotelImageManager";

const getAmenityIcon = (name: string, iconFromDb?: string | null): string => {
  // Backend lưu icon là Ionicons name (vd: "wifi-outline", "snow-outline", ...)
  if (iconFromDb) return iconFromDb;
  // Fallback theo tên nếu backend chưa có icon
  const n = (name || '').toLowerCase();
  if (n.includes('wifi')) return 'wifi-outline';
  if (n.includes('hồ bơi') || n.includes('bể bơi') || n.includes('pool')) return 'water-outline';
  if (n.includes('gym') || n.includes('thể hình') || n.includes('fitness')) return 'barbell-outline';
  if (n.includes('nhà hàng') || n.includes('restaurant')) return 'restaurant-outline';
  if (n.includes('đỗ xe') || n.includes('bãi xe') || n.includes('parking')) return 'car-outline';
  if (n.includes('điều hòa') || n.includes('máy lạnh') || n.includes('air')) return 'snow-outline';
  if (n.includes('bar') || n.includes('rượu')) return 'wine-outline';
  if (n.includes('thang máy') || n.includes('elevator')) return 'git-commit-outline';
  if (n.includes('spa') || n.includes('massage')) return 'flower-outline';
  if (n.includes('giặt') || n.includes('laundry')) return 'shirt-outline';
  if (n.includes('sân bay') || n.includes('airport')) return 'airplane-outline';
  if (n.includes('phòng') || n.includes('room service')) return 'bed-outline';
  return 'help-circle-outline';
};


export default function HotelDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [hotel, setHotel] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const hotelRes = await hotelApi.getHotelById(id);
            if (hotelRes.isSuccess) {
                setHotel(hotelRes.data);
            } else {
                console.log("Failed to load hotel detail:", hotelRes.message);
            }

            const roomsRes = await roomApi.getRoomsByHotelId(id);
            if (roomsRes.isSuccess) {
                setRooms(roomsRes.data || []);
            } else {
                console.log("Failed to load rooms:", roomsRes.message);
            }
        } catch (error: any) {
            console.log("Error loading hotel details:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [id])
    );

    const getHotelPrimaryImage = (images: any[]) => {
        if (!images || images.length === 0) return null;
        const primary = images.find((img) => img.isPrimary);
        const url = primary ? primary.url : images[0].url;
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${IMAGE_URL}/${url}`;
    };

    const getRoomPrimaryImage = (images: any[]) => {
        if (!images || images.length === 0) return null;
        const url = images[0].url || images[0];
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${IMAGE_URL}/${url}`;
    };

    const formatPrice = (price: number) => {
        if (!price) return "0đ";
        if (price >= 1000000) {
            const mil = price / 1000000;
            return `${mil.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
        }
        return `${price.toLocaleString("vi-VN")}đ`;
    };

    const handleDeleteRoom = (roomId: string, roomNumber: string) => {
        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc chắn muốn xóa phòng ${roomNumber || ""} không?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await roomApi.deleteRoom(roomId);
                            if (res.isSuccess) {
                                Toast.show({
                                    type: 'success',
                                    text1: "Thành công",
                                    text2: "Đã xóa phòng thành công"
                                });
                                loadData();
                            } else {
                                Toast.show({
                                    type: 'error',
                                    text1: "Lỗi",
                                    text2: res.message || "Xóa phòng thất bại"
                                });
                            }
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: "Lỗi",
                                text2: error.message || "Không thể xóa phòng"
                            });
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Đang tải chi tiết khách sạn...</Text>
            </SafeAreaView>
        );
    }

    const hotelName = hotel?.name || "";
    const hotelAddress = hotel?.address || "";
    const hotelRating = hotel?.starRating || 0;
    const hotelDescription = hotel?.description || "Chưa có mô tả.";

    const imageUrl = getHotelPrimaryImage(hotel?.images);

    // Stats calculation
    const totalRoomsCount = rooms.length;
    const availableRoomsCount = rooms.filter((r) => r.isActive && (r.status?.toLowerCase() === "available" || !r.status)).length;
    const maintenanceRoomsCount = rooms.filter((r) => r.status?.toLowerCase() === "maintenance" || r.status?.toLowerCase() === "bảo trì").length;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                        <ChevronLeft size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {hotelName}
                    </Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.addBtn, { marginRight: 4 }]}
                        onPress={() =>
                            router.push({
                                pathname: "/owner/hotel-form",
                                params: { id, mode: "edit" },
                            })
                        }
                    >
                        <Ionicons name="create-outline" size={20} color="#1E293B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() =>
                            router.push({
                                pathname: "/owner/room-form",
                                params: { hotelId: id },
                            })
                        }
                    >
                        <Plus size={20} color="#1E293B" />
                    </TouchableOpacity>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>H</Text>
                    </View>
                </View>
            </View>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Banner Section */}
                <View style={styles.bannerContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.bannerImage} resizeMode="cover" />
                    ) : (
                        <Image
                            source={{ uri: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" }}
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                    )}

                    <View style={styles.overlay}>
                        <View style={styles.badgeContainer}>
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                                <Text style={styles.ratingText}>
                                    {hotelRating} Sao ({rooms.length} phòng)
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.bannerHotelName}>{hotelName}</Text>
                        <View style={styles.addressRow}>
                            <Ionicons name="location-sharp" size={14} color="#E2E8F0" style={{ marginRight: 4, marginTop: 1 }} />
                            <Text style={styles.bannerAddress} numberOfLines={2}>
                                {hotelAddress}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Mô tả khách sạn Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Giới thiệu khách sạn</Text>
                    <Text style={styles.descriptionText}>{hotelDescription}</Text>

                    {hotel?.amenities && hotel.amenities.length > 0 && (
                        <View style={styles.amenitiesGrid}>
                            {hotel.amenities.map((item: any) => {
                                const iconName = getAmenityIcon(item.name || '', item.icon);
                                return (
                                    <View key={item.id} style={styles.amenityItem}>
                                        <Ionicons name={iconName as any} size={20} color="#2563EB" />
                                        <Text style={styles.amenityText} numberOfLines={1}>{item.name}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Quản lý nhanh Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Quản lý nhanh</Text>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Tổng số phòng</Text>
                        <Text style={styles.statValueBold}>{totalRoomsCount}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Phòng trống</Text>
                        <Text style={[styles.statValueBold, { color: "#0284C7" }]}>{availableRoomsCount}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Đang bảo trì</Text>
                        <Text style={[styles.statValueBold, { color: "#EF4444" }]}>{maintenanceRoomsCount}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() => Toast.show({
                            type: 'info',
                            text1: "Báo cáo",
                            text2: "Tính năng báo cáo doanh thu & công suất phòng đang được chuẩn bị."
                        })}
                    >
                        <Text style={styles.reportButtonText}>Xem báo cáo chi tiết</Text>
                    </TouchableOpacity>
                </View>

                {/* Quản lý ảnh Card */}
                <HotelImageManager 
                    hotelId={id} 
                    images={hotel?.images || []} 
                    onRefresh={loadData} 
                />

                {/* Available Rooms Header */}
                <View style={styles.roomsHeaderRow}>
                    <Text style={styles.roomsHeaderTitle}>Danh sách các phòng hiện có</Text>
                    <View style={styles.roomsHeaderIcons}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="options-outline" size={18} color="#4B5563" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="grid-outline" size={18} color="#4B5563" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Rooms List */}
                {rooms.length === 0 ? (
                    <View style={styles.emptyRoomsCard}>
                        <Ionicons name="bed-outline" size={48} color="#94A3B8" />
                        <Text style={styles.emptyRoomsText}>Chưa có phòng nào được tạo</Text>
                        <TouchableOpacity
                            style={styles.addFirstRoomBtn}
                            onPress={() =>
                                router.push({
                                    pathname: "/owner/room-form",
                                    params: { hotelId: id },
                                })
                            }
                        >
                            <Text style={styles.addFirstRoomBtnText}>Thêm phòng ngay</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    rooms.map((room) => {
                        const roomImageUrl = getRoomPrimaryImage(room.images);
                        const isAvailable = room.status?.toLowerCase() === "available" || !room.status;
                        return (
                            <View key={room.id} style={styles.roomCard}>
                                <TouchableOpacity
                                    style={styles.roomImageContainer}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/owner/room-detail",
                                            params: { id: room.id },
                                        })
                                    }
                                >
                                    {roomImageUrl ? (
                                        <Image source={{ uri: roomImageUrl }} style={styles.roomImage} resizeMode="cover" />
                                    ) : (
                                        <Image
                                            source={{ uri: "https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=800&q=80" }}
                                            style={styles.roomImage}
                                            resizeMode="cover"
                                        />
                                    )}

                                    <View style={[styles.roomStatusBadge, { backgroundColor: isAvailable ? "#D1FAE5" : "#FEE2E2" }]}>
                                        <Text style={[styles.roomStatusText, { color: isAvailable ? "#059669" : "#DC2626" }]}>
                                            {isAvailable ? "Available" : "Maintenance"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.roomCardBody}>
                                    <View style={styles.roomTitleRow}>
                                        <Text style={styles.roomTypeTitle} numberOfLines={1}>
                                            {room.roomType || "Deluxe City View"}
                                        </Text>
                                        <Text style={styles.roomPriceText}>{formatPrice(room.pricePerNight)}/đêm</Text>
                                    </View>

                                    <Text style={styles.roomCodeText}>Mã phòng: {room.roomNumber || "402"}</Text>

                                    <View style={styles.roomSpecsRow}>
                                        <View style={styles.specItem}>
                                            <Ionicons name="bed-outline" size={14} color="#6B7280" />
                                            <Text style={styles.specText}>{room.bedType || "King"}</Text>
                                        </View>
                                        <View style={styles.specItem}>
                                            <Ionicons name="expand-outline" size={14} color="#6B7280" />
                                            <Text style={styles.specText}>{room.roomSize || 45}m²</Text>
                                        </View>
                                        <View style={styles.specItem}>
                                            <Ionicons name="people-outline" size={14} color="#6B7280" />
                                            <Text style={styles.specText}>{room.capacity || 2}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.roomActionsRow}>
                                        <TouchableOpacity
                                            style={styles.editRoomButton}
                                            onPress={() =>
                                                router.push({
                                                    pathname: "/owner/room-form",
                                                    params: { hotelId: id, id: room.id },
                                                })
                                            }
                                        >
                                            <Text style={styles.editRoomButtonText}>Sửa thông tin</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.moreButton} onPress={() => handleDeleteRoom(room.id, room.roomNumber || "")}>
                                            <Ionicons name="ellipsis-vertical" size={20} color="#1F2937" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    loadingText: {
        fontSize: 15,
        color: "#64748B",
        marginTop: 12,
        fontWeight: "500",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: Platform.OS === "android" ? 45 : 10,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderColor: "#E2E8F0",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 16,
    },
    iconBtn: {
        padding: 4,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
        flex: 1,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    addBtn: {
        width: 38,
        height: 38,
        borderRadius: 8,
        backgroundColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#64748B",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    bannerContainer: {
        height: 250,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    bannerImage: {
        width: "100%",
        height: "100%",
    },
    placeholderBanner: {
        backgroundColor: "#CBD5E1",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        color: "#475569",
        marginTop: 8,
        fontSize: 14,
        fontWeight: "500",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        justifyContent: "flex-end",
        padding: 16,
    },
    badgeContainer: {
        flexDirection: "row",
        marginBottom: 8,
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3B82F6",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    ratingText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    bannerHotelName: {
        fontSize: 24,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 4,
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    bannerAddress: {
        fontSize: 13,
        color: "#F1F5F9",
        flex: 1,
        lineHeight: 18,
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 13,
        color: "#475569",
        lineHeight: 20,
    },
    amenitiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 16,
        gap: 10,
    },
    amenityItem: {
        width: "48%",
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 6,
    },
    amenityText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1E40AF",
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    statLabel: {
        fontSize: 14,
        color: "#475569",
        fontWeight: "500",
    },
    statValueBold: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
    },
    reportButton: {
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 16,
    },
    reportButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#2563EB",
    },
    roomsHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 14,
    },
    roomsHeaderTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    roomsHeaderIcons: {
        flexDirection: "row",
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyRoomsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
    },
    emptyRoomsText: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 12,
        fontWeight: "500",
    },
    addFirstRoomBtn: {
        backgroundColor: "#2563EB",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    addFirstRoomBtnText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },
    roomCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 16,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    roomImageContainer: {
        height: 180,
        position: "relative",
        width: "100%",
    },
    roomImage: {
        width: "100%",
        height: "100%",
    },
    roomStatusBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    roomStatusText: {
        fontSize: 11,
        fontWeight: "800",
    },
    roomCardBody: {
        padding: 16,
    },
    roomTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    roomTypeTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        flex: 1,
        marginRight: 10,
    },
    roomPriceText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#2563EB",
    },
    roomCodeText: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
        marginBottom: 12,
    },
    roomSpecsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 16,
    },
    specItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    specText: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "500",
    },
    roomActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    editRoomButton: {
        flex: 1,
        backgroundColor: "#000000",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    editRoomButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },
    moreButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
});
