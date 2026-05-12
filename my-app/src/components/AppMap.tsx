import React, { useState, useCallback } from 'react';
import { 
    View, 
    StyleSheet, 
    TouchableOpacity, 
    Text, 
    Modal, 
    SafeAreaView,
    ActivityIndicator,
    TextInput,
    FlatList,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

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
                `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=10&lang=en`
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
        setLoading(true);
        try {
            const reverse = await Location.reverseGeocodeAsync(region);
            if (reverse.length > 0) {
                const addr = reverse[0];
                const fullAddress = [addr.streetNumber, addr.street, addr.district, addr.city]
                    .filter(Boolean)
                    .join(", ");
                onSelectLocation(fullAddress || "Vị trí đã chọn", region);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            onClose();
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

                <View style={{ flex: 1 }}>
                    <MapView
                        style={styles.map}
                        region={region}
                        onRegionChangeComplete={setRegion}
                    >
                        <Marker coordinate={region} />
                    </MapView>
                    
                    <View style={styles.markerFixed}>
                        <Ionicons name="location" size={40} color="#EF4444" />
                    </View>

                    <TouchableOpacity 
                        style={styles.confirmButton} 
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.confirmText}>Xác nhận vị trí này</Text>
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
    map: { flex: 1 },
    markerFixed: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20,
        marginTop: -40,
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
