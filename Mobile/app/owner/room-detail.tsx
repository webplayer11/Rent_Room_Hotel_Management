import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import React, { useState, useEffect, useCallback } from "react";
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
import { ChevronLeft } from "lucide-react-native";
import { roomApi, RoomDto } from "../../src/shared/api/roomApi";
import { hotelApi, HotelDto } from "../../src/shared/api/hotelApi";
import { IMAGE_URL } from "../../src/config";

const { width } = Dimensions.get("window");

export default function RoomDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [room, setRoom] = useState<RoomDto | null>(null);
    const [hotelName, setHotelName] = useState<string>(" ");
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);

    const loadRoomData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await roomApi.getRoomById(id);
            if (res.isSuccess && res.data) {
                setRoom(res.data);
                
                // Fetch hotel details to get the real hotel name
                if (res.data.hotelId) {
                    const hotelRes = await hotelApi.getHotelById(res.data.hotelId);
                    if (hotelRes.isSuccess && hotelRes.data) {
                        setHotelName(hotelRes.data.name || "Khách sạn của bạn");
                    }
                }
            } else {
                Toast.show({
                    type: 'error',
                    text1: "Lỗi",
                    text2: res.message || "Không thể tải thông tin chi tiết phòng"
                });
            }
        } catch (error: any) {
            console.log("Error loading room detail:", error);
            Toast.show({
                type: 'error',
                text1: "Lỗi",
                text2: "Không thể tải thông tin phòng"
            });
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadRoomData();
        }, [id])
    );

    const getRoomImage = (images: any[]) => {
        if (!images || images.length === 0) return null;
        const url = images[0].url || images[0];
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${IMAGE_URL}/${url}`;
    };

    const handleChangeStatus = () => {
        if (!room) return;
        
        Alert.alert(
            "Thay đổi trạng thái phòng",
            "Chọn trạng thái hiện tại của phòng này:",
            [
                {
                    text: "Sẵn sàng (Available)",
                    onPress: () => updateRoomStatus("available"),
                },
                {
                    text: "Đang bảo trì (Maintenance)",
                    onPress: () => updateRoomStatus("maintenance"),
                },
                {
                    text: "Đang thuê (Occupied)",
                    onPress: () => updateRoomStatus("occupied"),
                },
                {
                    text: "Hủy",
                    style: "cancel",
                }
            ]
        );
    };

    const updateRoomStatus = async (newStatus: string) => {
        if (!room || !id) return;
        try {
            setStatusLoading(true);
            // In ASP.NET backend, Update takes a Body of CreateRoomDto
            const updatedPayload = {
                hotelId: room.hotelId || "",
                roomNumber: room.roomNumber || "",
                roomType: room.roomType || "",
                description: room.description || "",
                capacity: room.capacity || 2,
                bedCount: room.bedCount || 1,
                bedType: room.bedType || "",
                pricePerNight: room.pricePerNight || 0,
                discountPrice: room.discountPrice,
                roomSize: room.roomSize,
                isSmokingAllowed: room.isSmokingAllowed || false,
                status: newStatus,
                images: [] // images list unchanged on simple status update
            };

            const res = await roomApi.updateRoom(id, updatedPayload);
            if (res.isSuccess) {
                Toast.show({
                    type: 'success',
                    text1: "Thành công",
                    text2: "Đã cập nhật trạng thái phòng!"
                });
                loadRoomData(); // Reload details from API
            } else {
                Toast.show({
                    type: 'error',
                    text1: "Lỗi",
                    text2: res.message || "Cập nhật trạng thái thất bại"
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: "Lỗi",
                text2: error.message || "Đã xảy ra lỗi"
            });
        } finally {
            setStatusLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Đang tải chi tiết phòng...</Text>
            </SafeAreaView>
        );
    }

    if (!room) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.errorText}>Không tìm thấy thông tin phòng</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Quay lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const roomImageUrl = getRoomImage(room.images);
    const roomType = room.roomType;
    const roomNumberText = room.roomNumber;
    const roomStatus = room.status?.toLowerCase() || "available";

    const formattedRoomNumber = roomNumberText
        ? (roomNumberText.toString().toLowerCase().includes("phòng") || roomNumberText.toString().toLowerCase().includes("phong")
            ? roomNumberText
            : `Phòng ${roomNumberText}`)
        : "";

    // Status Badge Setup
    let statusLabel = "SẴN SÀNG";
    let statusBg = "#E8F5E9";
    let statusTextColor = "#2E7D32";

    if (roomStatus === "maintenance" || roomStatus === "bảo trì") {
        statusLabel = "ĐANG BẢO TRÌ";
        statusBg = "#FFEBEE";
        statusTextColor = "#C62828";
    } else if (roomStatus === "occupied" || roomStatus === "đang thuê") {
        statusLabel = "ĐANG THUÊ";
        statusBg = "#E3F2FD";
        statusTextColor = "#1565C0";
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                        <ChevronLeft size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {roomType} - {formattedRoomNumber}
                    </Text>
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="help-circle-outline" size={24} color="#0F172A" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Main Image Section */}
                <View style={styles.imageCard}>
                    {roomImageUrl ? (
                        <Image source={{ uri: roomImageUrl }} style={styles.roomImage} resizeMode="cover" />
                    ) : (
                        <Image
                            source={{ uri: "https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=800&q=80" }}
                            style={styles.roomImage}
                            resizeMode="cover"
                        />
                    )}

                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                        <Text style={[styles.statusText, { color: statusTextColor }]}>
                            {statusLabel}
                        </Text>
                    </View>
                </View>

                {/* Card 1: THÔNG TIN PHÒNG */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionLabel}>THÔNG TIN PHÒNG</Text>
                    <Text style={styles.priceText}>
                        {room.pricePerNight?.toLocaleString("vi-VN")} VND <Text style={styles.perNightText}>/ đêm</Text>
                    </Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="bed-outline" size={20} color="#64748B" style={styles.infoIcon} />
                        <View>
                            <Text style={styles.infoLabel}>Loại phòng</Text>
                            <Text style={styles.infoValue}>{roomType}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="office-building" size={20} color="#64748B" style={styles.infoIcon} />
                        <View>
                            <Text style={styles.infoLabel}>Khách sạn</Text>
                            <Text style={styles.infoValue}>{hotelName}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() =>
                            router.push({
                                pathname: "/owner/room-form",
                                params: { hotelId: room.hotelId, id: room.id },
                            })
                        }
                    >
                        <Text style={styles.editBtnText}>Sửa thông tin</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.statusChangeBtn}
                        onPress={handleChangeStatus}
                        disabled={statusLoading}
                    >
                        {statusLoading ? (
                            <ActivityIndicator size="small" color="#0F172A" />
                        ) : (
                            <Text style={styles.statusChangeBtnText}>Đổi trạng thái</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Card 2: Thông tin cơ bản */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Thông tin cơ bản</Text>

                    <View style={styles.featureBlock}>
                        <Ionicons name="expand-outline" size={20} color="#475569" />
                        <Text style={styles.featureLabel}>Diện tích</Text>
                        <Text style={styles.featureValue}>{room.roomSize || 0} m²</Text>
                    </View>

                    <View style={styles.featureBlock}>
                        <Ionicons name="bed-outline" size={20} color="#475569" />
                        <Text style={styles.featureLabel}>Loại giường</Text>
                        <Text style={styles.featureValue}>
                            {room.bedCount || 1} giường {room.bedType || "King"}
                        </Text>
                    </View>

                    <View style={styles.featureBlock}>
                        <Ionicons name="people-outline" size={20} color="#475569" />
                        <Text style={styles.featureLabel}>Sức chứa</Text>
                        <Text style={styles.featureValue}>
                            {room.capacity || 2} người lớn
                        </Text>
                    </View>
                </View>

                {/* Card 3: Tiện ích */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tiện ích</Text>

                    <View style={styles.amenitiesGrid}>
                        <View style={styles.amenityItem}>
                            <Ionicons name="wifi" size={20} color="#3B82F6" />
                            <Text style={styles.amenityText}>Wifi</Text>
                        </View>
                        <View style={styles.amenityItem}>
                            <Ionicons name="snow" size={20} color="#3B82F6" />
                            <Text style={styles.amenityText}>Điều hòa</Text>
                        </View>
                        <View style={styles.amenityItem}>
                            <Ionicons name="wine-outline" size={20} color="#3B82F6" />
                            <Text style={styles.amenityText}>Mini bar</Text>
                        </View>
                        <View style={styles.amenityItem}>
                            <Ionicons name="water-outline" size={20} color="#3B82F6" />
                            <Text style={styles.amenityText}>Bồn tắm</Text>
                        </View>
                        <View style={styles.amenityItem}>
                            <Ionicons name="lock-closed-outline" size={20} color="#3B82F6" />
                            <Text style={styles.amenityText}>Két sắt</Text>
                        </View>
                        <View style={styles.amenityItem}>
                            <Ionicons name="tv-outline" size={20} color="#3B82F6" />
                            <Text style={styles.amenityText}>TV</Text>
                        </View>
                    </View>
                </View>

                {/* Card 4: Bảo trì & Dọn dẹp */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Bảo trì & Dọn dẹp</Text>

                    {/* Cleaning Row */}
                    <View style={styles.operationRow}>
                        <View style={[styles.operationIconBox, { backgroundColor: "#EFF6FF" }]}>
                            <MaterialCommunityIcons name="broom" size={20} color="#2563EB" />
                        </View>
                        <View style={styles.operationTextContent}>
                            <Text style={styles.operationTitle}>Dọn dẹp lần cuối</Text>
                            <Text style={styles.operationDesc}>10:45 AM - Hôm nay</Text>
                        </View>
                    </View>

                    {/* Maintenance Notes Row */}
                    <View style={styles.operationRow}>
                        <View style={[styles.operationIconBox, { backgroundColor: "#FFFBEB" }]}>
                            <Ionicons name="construct-outline" size={20} color="#D97706" />
                        </View>
                        <View style={styles.operationTextContent}>
                            <Text style={styles.operationTitle}>Ghi chú bảo trì</Text>
                            <Text style={styles.operationDesc}>
                                {room.description || "Thiết bị và phòng đang hoạt động bình thường, không ghi nhận sự cố."}
                            </Text>
                        </View>
                    </View>
                </View>
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
    errorText: {
        fontSize: 16,
        color: "#64748B",
        marginBottom: 16,
        fontWeight: "500",
    },
    backBtn: {
        backgroundColor: "#000",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backBtnText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 14,
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
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#0F172A",
        marginLeft: 8,
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    imageCard: {
        height: 260,
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
    roomImage: {
        width: "100%",
        height: "100%",
    },
    statusBadge: {
        position: "absolute",
        top: 16,
        left: 16,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 12,
        elevation: 2,
    },
    cardSectionLabel: {
        fontSize: 11,
        fontWeight: "800",
        color: "#94A3B8",
        letterSpacing: 1,
        marginBottom: 4,
    },
    priceText: {
        fontSize: 26,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 20,
    },
    perNightText: {
        fontSize: 14,
        color: "#64748B",
        fontWeight: "500",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    infoIcon: {
        marginRight: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "500",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
    },
    editBtn: {
        backgroundColor: "#000000",
        borderRadius: 12,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 12,
    },
    editBtnText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    statusChangeBtn: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    statusChangeBtnText: {
        color: "#0F172A",
        fontSize: 15,
        fontWeight: "700",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 16,
    },
    featureBlock: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    featureLabel: {
        fontSize: 14,
        color: "#475569",
        fontWeight: "600",
        marginLeft: 12,
        flex: 1,
    },
    featureValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    amenitiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
    },
    amenityItem: {
        width: "30%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    amenityText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#475569",
        marginTop: 6,
    },
    operationRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    operationIconBox: {
        width: 42,
        height: 42,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    operationTextContent: {
        flex: 1,
    },
    operationTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 4,
    },
    operationDesc: {
        fontSize: 13,
        color: "#64748B",
        lineHeight: 18,
    },
});
