import React, { useState } from 'react';
import { 
    View, 
    StyleSheet, 
    TouchableOpacity, 
    Text, 
    Modal, 
    SafeAreaView,
    ActivityIndicator,
    TextInput,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppMapProps {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (address: string, coords?: { latitude: number; longitude: number }) => void;
}

const AppMap = ({ visible, onClose, onSelectLocation }: AppMapProps) => {
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

        onSelectLocation(fullAddress, coords);
        setSearchResults([]);
        setSearchText("");
        onClose();
    };

    return (
        <Modal visible={visible} animationType="fade">
            <SafeAreaView style={styles.container}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Tìm địa điểm</Text>
                    </View>

                    <View style={styles.searchWrapper}>
                        <Text style={styles.hint}>Nhập tên biển, địa danh hoặc địa chỉ cụ thể:</Text>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#94A3B8" style={{ marginLeft: 15 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Ví dụ: Biển Sầm Sơn, Hà Nội..."
                                value={searchText}
                                onChangeText={searchPlaces}
                            />
                            {isSearching && <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 15 }} />}
                        </View>

                        {searchResults.length > 0 && (
                            <View style={styles.resultsContainer}>
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
                                />
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.webPlaceholder}>
                        <Ionicons name="earth-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.placeholderText}>
                            Dữ liệu địa điểm được cung cấp thời gian thực từ OpenStreetMap.
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    modalContent: {
        width: '90%',
        maxWidth: 600,
        height: '85%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: { marginRight: 15 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    searchWrapper: {
        padding: 20,
        zIndex: 100,
    },
    hint: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        height: 55,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#1E293B',
    },
    resultsContainer: {
        marginTop: 10,
        maxHeight: 400,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        backgroundColor: '#FFF',
        elevation: 5,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    resultIconContainer: {
        width: 40,
        alignItems: 'center',
    },
    resultTextContainer: {
        marginLeft: 12,
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
        marginTop: 2,
    },
    webPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#F8FAFC',
    },
    placeholderText: {
        marginTop: 15,
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 14,
    }
});

export default AppMap;
