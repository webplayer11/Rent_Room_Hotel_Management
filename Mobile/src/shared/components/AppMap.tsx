import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Modal,
    ActivityIndicator,
    TextInput,
    FlatList,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// NOTE: react-native-maps (MapView) không hoạt động trong Expo Go vì thiếu native module RNMapsAirModule.
// Đã tạm thay bằng placeholder để app chạy ổn định cho demo.
// Khi build dev/production client, hãy uncomment import bên dưới và xóa placeholder.
// import MapView, { Region } from 'react-native-maps';

interface AppMapProps {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (address: string, coords?: { latitude: number; longitude: number }) => void;
}

const AppMap = ({ visible, onClose, onSelectLocation }: AppMapProps) => {
    const [region, setRegion] = useState({
        latitude: 21.0285,
        longitude: 105.8542,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchPlaces = async (text: string) => {
        setSearchText(text);
        if (text.length < 2) {
            setSearchResults([]);
            return;
        }
        
        setIsSearching(true);
        try {
            // Using Photon API (Free Geocoding based on OpenStreetMap)
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=10&bbox=102.14,8.56,109.46,23.39`
            );
            const data = await response.json();
            setSearchResults(data.features || []);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (item: any) => {
        const { properties, geometry } = item;
        const name = properties.name || "";
        const city = properties.city || properties.state || "";
        const country = properties.country || "";
        const fullAddress = [name, city, country].filter(Boolean).join(", ");
        
        const coords = {
            latitude: geometry.coordinates[1],
            longitude: geometry.coordinates[0],
        };

        setRegion({
            ...region,
            ...coords,
        });
        onSelectLocation(fullAddress, coords);
        setSearchResults([]);
        setSearchText(fullAddress);
        Keyboard.dismiss();
        onClose();
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            // Lấy địa chỉ từ toạ độ tâm bản đồ (region)
            const reverse = await Location.reverseGeocodeAsync({
                latitude: region.latitude,
                longitude: region.longitude,
            });

            let fullAddress = "Vị trí đã chọn";
            if (reverse && reverse.length > 0) {
                const loc = reverse[0];
                const parts = [loc.name, loc.street, loc.subregion, loc.city, loc.region, loc.country].filter(Boolean);
                if (parts.length > 0) {
                    fullAddress = parts.join(", ");
                }
            }

            onSelectLocation(fullAddress, { latitude: region.latitude, longitude: region.longitude });
            onClose();
        } catch (error) {
            console.log(error);
            onSelectLocation("Vị trí đã chọn", { latitude: region.latitude, longitude: region.longitude });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            visible={visible} 
            animationType="slide"
            transparent={false}
            statusBarTranslucent={true}
            presentationStyle="fullScreen"
        >
            <View style={styles.fullScreenContainer}>
                <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="rgba(83, 146, 249, 0.7)" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Chọn địa điểm</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="rgba(83, 146, 249, 0.7)" style={{ marginLeft: 15 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm biển, địa danh, khách sạn..."
                            value={searchText}
                            onChangeText={searchPlaces}
                            clearButtonMode="while-editing"
                            autoFocus
                        />
                        {isSearching && <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 15 }} />}
                    </View>

                    {searchResults.length > 0 && (
                        <View style={styles.resultsList}>
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => {
                                    const type = item.properties.type;
                                    const isHotel = type === 'house' || type === 'building' || item.properties.osm_key === 'tourism';
                                    const typeLabel = isHotel ? 'Nơi lưu trú' : 'Địa danh / Vị trí';
                                    const iconName = isHotel ? 'bed-outline' : 'location-outline';

                                    return (
                                        <TouchableOpacity 
                                            style={styles.resultItem}
                                            onPress={() => handleSelectResult(item)}
                                        >
                                            <View style={styles.resultIconContainer}>
                                                <Ionicons name={iconName} size={22} color="#1E293B" />
                                            </View>
                                            <View style={styles.resultTextContainer}>
                                                <Text style={styles.resultName} numberOfLines={1}>
                                                    {item.properties.name}
                                                </Text>
                                                <Text style={styles.resultSub} numberOfLines={1}>
                                                    {typeLabel} • {item.properties.city || item.properties.state || item.properties.country}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                                keyboardShouldPersistTaps="handled"
                            />
                        </View>
                    )}
                </View>

                {/* ── MAP PLACEHOLDER (thay cho MapView khi chạy Expo Go) ── */}
                <View style={{ flex: 1 }}>
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name="map-outline" size={52} color="#93C5FD" />
                        <Text style={styles.placeholderTitle}>Bản đồ không khả dụng</Text>
                        <Text style={styles.placeholderSub}>
                            Chức năng bản đồ yêu cầu bản build riêng.{"\n"}
                            Hãy <Text style={{ fontWeight: '700', color: '#2563EB' }}>tìm kiếm địa điểm</Text> ở ô trên{"\n"}
                            hoặc nhấn <Text style={{ fontWeight: '700', color: '#2563EB' }}>Dùng vị trí mặc định</Text>.
                        </Text>

                        <View style={styles.coordBox}>
                            <Ionicons name="location" size={16} color="#EF4444" />
                            <Text style={styles.coordText}>
                                {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.confirmButton} 
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.confirmText}>Dùng vị trí mặc định (Hà Nội)</Text>
                        )}
                    </TouchableOpacity>
                </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    container: { flex: 1, backgroundColor: '#FFF', paddingTop: 30 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: { padding: 8 },
    title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    searchSection: {
        zIndex: 100,
        backgroundColor: '#FFF',
        paddingBottom: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        margin: 12,
        borderRadius: 10,
        height: 44,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 10,
        fontSize: 14,
        color: '#1E293B',
    },
    resultsList: {
        maxHeight: 300,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    resultIconContainer: {
        width: 40,
        alignItems: 'center',
    },
    resultTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    resultName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1E293B',
    },
    resultSub: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 1,
    },
    // ── Placeholder styles ──
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 32,
    },
    placeholderTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E3A8A',
        marginTop: 8,
    },
    placeholderSub: {
        fontSize: 14,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 22,
    },
    coordBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6,
        marginTop: 8,
    },
    coordText: {
        fontSize: 13,
        color: '#B91C1C',
        fontWeight: '600',
    },
    confirmButton: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#2563EB',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 5,
    },
    confirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default AppMap;
