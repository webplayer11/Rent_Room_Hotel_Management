import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppMap from '../../../src/shared/components/AppMap';
import AppDatePicker from '../../../src/shared/components/AppDatePicker';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import RoomGuestPicker from '../../../src/shared/components/RoomGuestPicker';
import { tokenStorage } from '../../../src/shared/storage/tokenStorage';
const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();

  const [location, setLocation] = useState('Gần chỗ tôi');
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(
    new Date(Date.now() + 86400000)
  );

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);

  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);

 const logout = async () => {
  // WEB
  if (Platform.OS === "web") {
    const ok = window.confirm(
      "Bạn có chắc chắn muốn đăng xuất không?"
    );

    if (!ok) return;

    await tokenStorage.clearTokens();

    router.replace("/auth/login");

    return;
  }

  // MOBILE
  Alert.alert(
    "Đăng xuất",
    "Bạn có chắc chắn muốn đăng xuất không?",
    [
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
    ]
  );
};

  const guestText = useMemo(() => {
    let text = `${rooms} phòng, ${adults} người lớn`;

    if (children > 0) {
      text += `, ${children} trẻ em`;
    }

    return text;
  }, [rooms, adults, children]);

  const onSelectLocation = (address: string) => {
    setLocation(address);
    setSearchModalVisible(false);
  };

  const onConfirmDates = (start: Date, end: Date) => {
    setCheckIn(start);
    setCheckOut(end);
    setDateModalVisible(false);
  };

  const onConfirmGuests = (
    r: number,
    a: number,
    c: number,
    ages: number[]
  ) => {
    setRooms(r);
    setAdults(a);
    setChildren(c);
    setChildAges(ages);
    setGuestModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brandText}>HanWangHo</Text>
          <View style={styles.headerIcons}>
  <TouchableOpacity
    style={styles.logoutButton}
    onPress={logout}
  >
    <Ionicons
      name="log-out-outline"
      size={22}
      color="#fff"
    />

    <Text style={styles.logoutText}>
      Đăng xuất
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.headerIcon}>
    <Ionicons
      name="notifications-outline"
      size={24}
      color="#333"
    />
   </TouchableOpacity>
   </View>
   </View>

        <View style={styles.searchCardContainer}>
          <View style={styles.searchCard}>
            <TouchableOpacity
              style={[styles.searchItemLarge, { zIndex: 100 }]}
              onPress={() => setSearchModalVisible(true)}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
                color="rgba(83, 146, 249, 0.7)"
                style={styles.absoluteIcon}
              />

              <View
                style={[
                  styles.searchItemText,
                  { flex: 1, paddingLeft: 18 },
                ]}
              >
                <Text style={styles.searchLabel}>Địa điểm</Text>
                <Text style={styles.searchValue} numberOfLines={1}>
                  {location || 'Nhập địa điểm...'}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={16}
                color="#CCC"
              />
            </TouchableOpacity>

            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={styles.dateBoxSeparate}
                  onPress={() => setDateModalVisible(true)}
                >
                  <View style={styles.centeredRow}>
                    <MaterialCommunityIcons
                      name="calendar-import"
                      size={15}
                      color="rgba(83, 146, 249, 0.7)"
                    />

                    <View style={styles.dateTextGroup}>
                      <Text style={styles.searchLabel}>Nhận phòng</Text>
                      <Text style={styles.dateValueText}>
                        {format(checkIn, 'eee, dd MMM', {
                          locale: vi,
                        })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={{ width: 10 }} />

              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={styles.dateBoxSeparate}
                  onPress={() => setDateModalVisible(true)}
                >
                  <View style={styles.centeredRow}>
                    <MaterialCommunityIcons
                      name="calendar-export"
                      size={15}
                      color="rgba(83, 146, 249, 0.7)"
                    />

                    <View style={styles.dateTextGroup}>
                      <Text style={styles.searchLabel}>Trả phòng</Text>
                      <Text style={styles.dateValueText}>
                        {format(checkOut, 'eee, dd MMM', {
                          locale: vi,
                        })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.searchItem}
              onPress={() => setGuestModalVisible(true)}
            >
              <MaterialCommunityIcons
                name="account-multiple"
                size={18}
                color="rgba(83, 146, 249, 0.7)"
                style={styles.absoluteIcon}
              />

              <View
                style={[
                  styles.searchItemText,
                  { paddingLeft: 18 },
                ]}
              >
                <Text style={styles.searchLabel}>Số người / phòng</Text>
                <Text style={styles.searchValue}>{guestText}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={() =>
                router.push({
                  pathname: '/customer/hotel/list',
                  params: {
                    location,
                    checkIn: checkIn.toISOString(),
                    checkOut: checkOut.toISOString(),
                    rooms: rooms.toString(),
                    adults: adults.toString(),
                    children: children.toString(),
                    childAges: JSON.stringify(childAges),
                  },
                })
              }
            >
              <Text style={styles.searchButtonText}>Tìm kiếm</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ưu đãi đặc biệt</Text>

          <TouchableOpacity>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoScroll}
        >
          <PromoCard
            image="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500"
            title="Giảm đến 30% tại Đà Nẵng"
            tag="Ưu đãi hè"
          />

          <PromoCard
            image="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500"
            title="Combo Bay + Ở tiết kiệm"
            tag="Hot deal"
          />
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>

      <AppMap
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectLocation={onSelectLocation}
      />

      <AppDatePicker
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        onConfirm={onConfirmDates}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
      />

      <RoomGuestPicker
        visible={guestModalVisible}
        onClose={() => setGuestModalVisible(false)}
        onConfirm={onConfirmGuests}
        initialRooms={rooms}
        initialAdults={adults}
        initialChildren={children}
        initialChildAges={childAges}
      />
    </SafeAreaView>
  );
};

const PromoCard = ({
  image,
  title,
  tag,
}: {
  image: string;
  title: string;
  tag: string;
}) => (
  <TouchableOpacity style={styles.promoCard}>
    <Image source={{ uri: image }} style={styles.promoImage} />

    <View style={styles.promoOverlay}>
      <View style={styles.promoTag}>
        <Text style={styles.promoTagText}>{tag}</Text>
      </View>

      <Text style={styles.promoTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  brandText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#5392F9',
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    marginLeft: 12,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 4,
  },

  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },

  searchCardContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },

  searchCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
  },

  searchItemLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(83, 146, 249, 0.4)',
    marginBottom: 12,
  },

  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(83, 146, 249, 0.4)',
    marginBottom: 12,
  },

  searchItemText: {
    marginLeft: 12,
  },

  searchLabel: {
    fontSize: 8,
    color: '#888',
    marginBottom: 0,
    letterSpacing: 0.2,
  },

  searchValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },

  dateBoxSeparate: {
    flex: 1,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(83, 146, 249, 0.4)',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  absoluteIcon: {
    position: 'absolute',
    left: 15,
  },

  centeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  dateTextGroup: {
    marginLeft: 10,
  },

  dateValueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
    letterSpacing: 0.1,
  },

  dateRow: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
  },

  searchButton: {
    backgroundColor: '#5392F9',
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  seeAll: {
    color: '#5392F9',
    fontWeight: '600',
  },

  promoScroll: {
    paddingLeft: 20,
    paddingBottom: 20,
  },

  promoCard: {
    width: width * 0.7,
    height: 180,
    borderRadius: 16,
    marginRight: 15,
    overflow: 'hidden',
  },

  promoImage: {
    width: '100%',
    height: '100%',
  },

  promoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  promoTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF567D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 5,
  },

  promoTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  promoTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
