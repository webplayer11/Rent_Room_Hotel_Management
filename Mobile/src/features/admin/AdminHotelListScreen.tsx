import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../shared/components/AppCard';
import { colors } from '../../shared/constants/colors';
import { adminHotelsMockData } from './adminMockData';
import type { AdminHotel, AdminHotelStatus } from './adminTypes';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

type FilterKey = 'all' | AdminHotelStatus;

const statusConfig: Record<AdminHotelStatus, { label: string; bg: string; fg: string }> = {
  approved: { label: 'Đã duyệt', bg: '#DCFCE7', fg: '#16A34A' },
  pending: { label: 'Chờ duyệt', bg: '#FEF3C7', fg: '#B45309' },
  need_update: { label: 'Cần bổ sung', bg: '#FFEDD5', fg: '#C2410C' },
  rejected: { label: 'Từ chối', bg: '#FEE2E2', fg: '#DC2626' },
  blocked: { label: 'Bị khóa', bg: '#F3F4F6', fg: '#374151' },
};

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'need_update', label: 'Cần bổ sung' },
  { key: 'rejected', label: 'Từ chối' },
  { key: 'blocked', label: 'Bị khóa' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminHotelListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  // Reactive list so detail screen changes propagate back
  const hotels = adminHotelsMockData;

  const filtered = hotels.filter((h) => {
    const matchFilter = activeFilter === 'all' || h.status === activeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q) ||
      h.business.companyName.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

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
          <Text style={styles.headerTitle}>Quản lý khách sạn</Text>
          <Text style={styles.headerSub}>Duyệt hồ sơ và theo dõi trạng thái khách sạn.</Text>
        </View>

        {/* ===== SEARCH ===== */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm khách sạn..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* ===== FILTER TABS ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ===== SUMMARY COUNT ===== */}
        <Text style={styles.resultCount}>
          {filtered.length} khách sạn{activeFilter !== 'all' ? ` · ${filters.find(f => f.key === activeFilter)?.label}` : ''}
        </Text>

        {/* ===== HOTEL CARDS ===== */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyText}>Không tìm thấy khách sạn phù hợp.</Text>
          </View>
        ) : (
          filtered.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} router={router} />)
        )}
      </ScrollView>

      {/* ===== BOTTOM NAV ===== */}
      <BottomNav activeTab={activeTab} router={router} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Hotel card
// ---------------------------------------------------------------------------

function HotelCard({ hotel, router }: { hotel: AdminHotel; router: any }) {
  const st = statusConfig[hotel.status];
  return (
    <Pressable
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
      onPress={() => router.push(`/admin/hotel-detail?id=${hotel.id}`)}
    >
      <AppCard style={styles.card}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.cardIconWrap}>
            <Ionicons name="business" size={20} color={colors.primary} />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardName} numberOfLines={1}>{hotel.name}</Text>
            <Text style={styles.cardCompany} numberOfLines={1}>{hotel.business.companyName}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: st.bg }]}>
            <Text style={[styles.badgeText, { color: st.fg }]}>{st.label}</Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={13} color={colors.muted} />
          <Text style={styles.cardMeta} numberOfLines={1}>{hotel.address}</Text>
        </View>

        {/* Date + status note */}
        <View style={styles.cardRow}>
          <Ionicons name="calendar-outline" size={13} color={colors.muted} />
          <Text style={styles.cardMeta}>Đăng ký: {hotel.submittedAt}</Text>
        </View>

        {/* Status-specific note */}
        {hotel.status === 'pending' && (
          <Text style={styles.cardNote}>Đang chờ admin duyệt</Text>
        )}
        {hotel.status === 'need_update' && hotel.adminNote && (
          <Text style={[styles.cardNote, { color: '#C2410C' }]} numberOfLines={2}>
            {hotel.adminNote}
          </Text>
        )}
        {hotel.status === 'rejected' && (
          <Text style={[styles.cardNote, { color: colors.danger }]}>Đã từ chối</Text>
        )}
        {hotel.status === 'blocked' && (
          <Text style={[styles.cardNote, { color: '#374151' }]}>Đang bị khóa</Text>
        )}

        {/* Chevron */}
        <View style={styles.cardChevronWrap}>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </View>
      </AppCard>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Bottom Nav
// ---------------------------------------------------------------------------

function BottomNav({ activeTab, router }: { activeTab: string; router: any }) {
  const tabs = [
    { key: 'home', icon: 'home' as const, label: 'Tổng quan', route: '/admin' },
    { key: 'hotels', icon: 'business' as const, label: 'Khách sạn', route: '/admin/hotels' },
    { key: 'accounts', icon: 'people' as const, label: 'Tài khoản', route: '/admin/accounts' },
    { key: 'reports', icon: 'bar-chart' as const, label: 'Báo cáo', route: '/admin/reports' },
  ];
  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const iconName: keyof typeof Ionicons.glyphMap = isActive
          ? tab.icon
          : (`${tab.icon}-outline` as keyof typeof Ionicons.glyphMap);
        return (
          <Pressable
            key={tab.key}
            style={styles.navTab}
            onPress={() => { if (!isActive) router.replace(tab.route as any); }}
          >
            <Ionicons name={iconName} size={22} color={isActive ? colors.primary : colors.muted} />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
            {isActive && <View style={styles.navIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 52, paddingBottom: 100 },

  header: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.primaryDark },
  headerSub: { fontSize: 13, color: colors.muted, marginTop: 4 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },

  filterScroll: { marginBottom: 12 },
  filterContainer: { gap: 8, paddingRight: 4 },
  filterTab: {
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  filterTabTextActive: { color: colors.textLight, fontWeight: '600' },

  resultCount: { fontSize: 13, color: colors.muted, marginBottom: 12, fontWeight: '500' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center' },

  card: { marginBottom: 12, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardIconWrap: {
    width: 36, height: 36, backgroundColor: '#EFF6FF',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  cardTitleWrap: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '700', color: colors.text },
  cardCompany: { fontSize: 12, color: colors.muted, marginTop: 2 },
  badge: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardMeta: { fontSize: 12, color: colors.muted, flex: 1 },
  cardNote: { fontSize: 12, color: colors.muted, marginTop: 6, fontStyle: 'italic' },
  cardChevronWrap: { position: 'absolute', right: 14, top: '50%' },

  bottomNav: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingBottom: 20, paddingTop: 8,
  },
  navTab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  navLabel: { fontSize: 11, color: colors.muted, fontWeight: '500', marginTop: 2 },
  navLabelActive: { color: colors.primary, fontWeight: '700' },
  navIndicator: { width: 20, height: 3, borderRadius: 2, backgroundColor: colors.primary, marginTop: 4 },
});
