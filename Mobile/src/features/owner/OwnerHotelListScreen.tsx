import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton } from '../../shared/components/AppButton';
import { AppCard } from '../../shared/components/AppCard';
import { colors } from '../../shared/constants/colors';
import { ownerDashboardMockData } from './ownerMockData';
import type { HotelStatus } from './ownerTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hotelStatusMap: Record<HotelStatus, { label: string; bg: string; fg: string }> = {
  approved: { label: 'Đã duyệt', bg: '#DCFCE7', fg: colors.success },
  pending: { label: 'Chờ duyệt', bg: '#FEF3C7', fg: '#B45309' },
  need_update: { label: 'Cần bổ sung', bg: '#FEE2E2', fg: colors.danger },
};

type FilterKey = 'all' | HotelStatus;

const filterTabs: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'need_update', label: 'Cần bổ sung' },
];

// ---------------------------------------------------------------------------
// Placeholder handlers
// ---------------------------------------------------------------------------

// Handlers are now inlined in the component

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type OwnerHotelListProps = {
  onAddHotel?: () => void;
  onBack?: () => void;
  onGoHome?: () => void;
  onGoBookings?: () => void;
};

export function OwnerHotelListScreen({
  onAddHotel,
  onBack,
  onGoHome,
  onGoBookings,
}: OwnerHotelListProps) {
  const router = useRouter();
  const { hotels } = ownerDashboardMockData;
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHotels = hotels.filter((h) => {
    const matchStatus = activeFilter === 'all' || h.status === activeFilter;
    const matchSearch =
      searchQuery === '' ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ---- Bottom nav ----
  const activeTab = 'hotels';

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Khách sạn của bạn</Text>
            <Text style={styles.headerSubtitle}>
              Quản lý danh sách khách sạn và trạng thái phê duyệt.
            </Text>
          </View>
          <Pressable
            style={styles.headerAddBtn}
            onPress={() => {
              if (onAddHotel) onAddHotel();
              else router.push('/owner/hotel-form');
            }}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {/* ===== SEARCH BAR ===== */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm khách sạn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* ===== FILTER TABS ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ===== HOTEL COUNT ===== */}
        <Text style={styles.resultCount}>
          Tổng cộng {filteredHotels.length} khách sạn
          {activeFilter !== 'all' &&
            ` · ${filterTabs.find((t) => t.key === activeFilter)?.label}`}
        </Text>

        {/* ===== HOTEL LIST ===== */}
        {hotels.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <Ionicons name="business-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyText}>
              Thêm khách sạn để bắt đầu kinh doanh.
            </Text>
          </AppCard>
        ) : filteredHotels.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <Ionicons name="search-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyText}>
              Không tìm thấy khách sạn phù hợp.
            </Text>
          </AppCard>
        ) : (
          <View style={styles.hotelList}>
            {filteredHotels.map((hotel) => {
              const status = hotelStatusMap[hotel.status];
              return (
                <Pressable
                  key={hotel.id}
                  onPress={() => router.push(`/owner/hotel-detail?id=${hotel.id}`)}
                >
                  <AppCard style={styles.hotelCard}>
                    <View style={styles.hotelTop}>
                      {/* Thumbnail */}
                      <View style={styles.thumbnail}>
                        <Ionicons name="business" size={22} color={colors.primary} />
                      </View>

                      <View style={styles.hotelInfo}>
                        <Text style={styles.hotelName}>{hotel.name}</Text>
                        <View style={styles.hotelAddressRow}>
                          <Ionicons
                            name="location-outline"
                            size={13}
                            color={colors.muted}
                          />
                          <Text style={styles.hotelAddress}>
                            {hotel.address}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: status.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: status.fg },
                          ]}
                        >
                          {status.label}
                        </Text>
                      </View>
                    </View>

                    {/* Performance stats for approved hotels */}
                    {hotel.status === 'approved' && (hotel.rating != null || hotel.monthlyBookings != null) && (
                      <View style={styles.perfRow}>
                        {hotel.rating != null && (
                          <View style={styles.perfItem}>
                            <Ionicons name="star" size={13} color="#F59E0B" />
                            <Text style={styles.perfText}>{hotel.rating}</Text>
                          </View>
                        )}
                        {hotel.monthlyBookings != null && (
                          <View style={styles.perfItem}>
                            <Ionicons name="receipt-outline" size={13} color={colors.primary} />
                            <Text style={styles.perfText}>
                              {hotel.monthlyBookings} đơn tháng này
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {hotel.status === 'pending' && hotel.submittedAt && (
                      <View style={styles.perfRow}>
                        <View style={styles.perfItem}>
                          <Ionicons name="time-outline" size={13} color={colors.muted} />
                          <Text style={styles.perfText}>Gửi duyệt: {hotel.submittedAt}</Text>
                        </View>
                      </View>
                    )}

                    {hotel.status === 'need_update' && hotel.approvalNote && (
                      <View style={styles.perfRow}>
                        <View style={styles.perfItem}>
                          <Ionicons name="alert-circle-outline" size={13} color={colors.danger} />
                          <Text style={styles.perfText}>Lý do: {hotel.approvalNote}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.hotelBottom}>
                      <View style={styles.hotelRoomRow}>
                        <MaterialCommunityIcons
                          name="bed-outline"
                          size={14}
                          color={colors.muted}
                        />
                        <Text style={styles.hotelRoomCount}>
                          {hotel.roomCount} phòng
                        </Text>
                      </View>

                      {hotel.status === 'approved' && (
                        <Pressable
                          style={styles.hotelActionBtn}
                          onPress={() => router.push(`/owner/hotel-detail?id=${hotel.id}`)}
                        >
                          <Ionicons
                            name="settings-outline"
                            size={14}
                            color={colors.primary}
                          />
                          <Text style={styles.hotelActionText}>Quản lý</Text>
                        </Pressable>
                      )}
                      {hotel.status === 'pending' && (
                        <Pressable
                          style={[
                            styles.hotelActionBtn,
                            styles.hotelActionWarning,
                          ]}
                          onPress={() => router.push(`/owner/hotel-detail?id=${hotel.id}`)}
                        >
                          <Ionicons
                            name="eye-outline"
                            size={14}
                            color="#B45309"
                          />
                          <Text
                            style={[
                              styles.hotelActionText,
                              { color: '#B45309' },
                            ]}
                          >
                            Xem trạng thái
                          </Text>
                        </Pressable>
                      )}
                      {hotel.status === 'need_update' && (
                        <Pressable
                          style={[
                            styles.hotelActionBtn,
                            styles.hotelActionDanger,
                          ]}
                          onPress={() => router.push(`/owner/hotel-detail?id=${hotel.id}`)}
                        >
                          <Ionicons
                            name="create-outline"
                            size={14}
                            color={colors.danger}
                          />
                          <Text
                            style={[
                              styles.hotelActionText,
                              { color: colors.danger },
                            ]}
                          >
                            Bổ sung hồ sơ
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </AppCard>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <View style={styles.bottomNav}>
        {([
          { key: 'home', icon: 'home' as const, label: 'Trang chủ' },
          { key: 'hotels', icon: 'business' as const, label: 'Khách sạn' },
          { key: 'bookings', icon: 'document-text' as const, label: 'Đơn đặt' },
          { key: 'reports', icon: 'bar-chart' as const, label: 'Báo cáo' },
        ]).map((tab) => {
          const isActive = activeTab === tab.key;
          const iconName: keyof typeof Ionicons.glyphMap = isActive
            ? tab.icon
            : (`${tab.icon}-outline` as keyof typeof Ionicons.glyphMap);
          return (
            <Pressable
              key={tab.key}
              style={styles.navTab}
              onPress={() => {
                if (tab.key === 'home') {
                  if (onGoHome) onGoHome();
                  else router.push('/owner');
                }
                if (tab.key === 'bookings') {
                  if (onGoBookings) onGoBookings();
                  else router.push('/owner/bookings');
                }
                if (tab.key === 'reports') {
                  router.push('/owner/reports');
                }
                // 'hotels' is already active
              }}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isActive ? colors.primary : colors.muted}
              />
              <Text
                style={[
                  styles.navLabel,
                  isActive && styles.navLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.navIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 52,
    paddingBottom: 100,
  },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  headerAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  // ---- Filter ----
  filterScroll: {
    marginBottom: 12,
  },
  filterContainer: {
    gap: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.textLight,
    fontWeight: '600',
  },

  // ---- Result count ----
  resultCount: {
    color: colors.text,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },

  // ---- Empty state ----
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },

  // ---- Hotel list ----
  hotelList: {
    gap: 12,
  },
  hotelCard: {
    gap: 12,
  },
  hotelTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotelInfo: {
    flex: 1,
    gap: 3,
  },
  perfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingLeft: 54,
  },
  perfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  perfText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  hotelName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  hotelAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hotelAddress: {
    color: colors.muted,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: colors.text,
  },
  hotelBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hotelRoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hotelRoomCount: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },

  // ---- Status Badge ----
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ---- Hotel actions ----
  hotelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  hotelActionWarning: {
    borderColor: '#B45309',
  },
  hotelActionDanger: {
    borderColor: colors.danger,
  },
  hotelActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  // ---- Bottom Nav ----
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
    paddingTop: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 2,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  navIndicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
});
