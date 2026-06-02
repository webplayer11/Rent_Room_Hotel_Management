import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminApi, DashboardStatsDto } from '../../../src/shared/api/adminApi';

// ── Types ──────────────────────────────────────────────────────────
type LoadState = 'loading' | 'success' | 'error';
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ── Overview card config ───────────────────────────────────────────
type CardConfig = {
  key: keyof DashboardStatsDto;
  label: string;
  icon: IoniconsName;
  iconColor: string;
  iconBg: string;
  route: string;
};

const CARDS: CardConfig[] = [
  {
    key: 'totalUsers',
    label: 'Người dùng',
    icon: 'person-outline',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
    route: '/admin/users',
  },
  {
    key: 'totalHotels',
    label: 'Khách sạn',
    icon: 'business-outline',
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
    route: '/admin/hotels',
  },
  {
    key: 'totalHosts',
    label: 'Chủ khách sạn',
    icon: 'people-outline',
    iconColor: '#F97316',
    iconBg: '#FFF7ED',
    route: '/admin/users',
  },
  {
    key: 'totalVouchers',
    label: 'Voucher',
    icon: 'ticket-outline',
    iconColor: '#8B5CF6',
    iconBg: '#F5F3FF',
    route: '/admin/(tabs)/voucher',
  },
];

// ── Status item config ─────────────────────────────────────────────
type StatusItemConfig = {
  key: keyof DashboardStatsDto;
  label: string;
  icon: IoniconsName;
  accentColor: string;
  accentBg: string;
  route: string;
};

const STATUS_ITEMS: StatusItemConfig[] = [
  {
    key: 'lockedUsers',
    label: 'User bị khóa',
    icon: 'lock-closed-outline',
    accentColor: '#DC2626',
    accentBg: '#FEE2E2',
    route: '/admin/users',
  },
  {
    key: 'suspendedHotels',
    label: 'Khách sạn tạm khóa',
    icon: 'ban-outline',
    accentColor: '#D97706',
    accentBg: '#FEF3C7',
    route: '/admin/hotels',
  },
  {
    key: 'pendingHosts',
    label: 'Host chờ duyệt',
    icon: 'time-outline',
    accentColor: '#1D4ED8',
    accentBg: '#DBEAFE',
    route: '/admin/pending',
  },
  {
    key: 'pendingHotels',
    label: 'Khách sạn chờ duyệt',
    icon: 'construct-outline',
    accentColor: '#6D28D9',
    accentBg: '#EDE9FE',
    route: '/admin/pending-hotels',
  },
];

// ── Skeleton helpers ───────────────────────────────────────────────
function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={styles.skeletonIconBox} />
      <View style={styles.skeletonValueBar} />
      <View style={styles.skeletonLabelBar} />
    </View>
  );
}

function SkeletonStatusItem() {
  return (
    <View style={[styles.statusItem, { backgroundColor: '#F1F5F9' }]}>
      <View style={styles.skeletonIconBoxSm} />
      <View style={[styles.skeletonLabelBar, { flex: 1, width: undefined }]} />
      <View style={[styles.skeletonValueBar, { width: 36, height: 20, marginBottom: 0 }]} />
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────
export default function AdminStatsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getDashboardStats();
      if (res.isSuccess && res.data) {
        setStats(res.data);
        setLoadState('success');
      } else {
        setLoadState('error');
      }
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5392F9']}
            tintColor="#5392F9"
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thống kê hệ thống</Text>
          <Text style={styles.headerSubtitle}>Tổng quan dữ liệu hiện tại</Text>
        </View>

        {/* ── Loading skeleton ── */}
        {loadState === 'loading' && !refreshing ? (
          <>
            <View style={styles.grid}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
            <View style={styles.sectionHeader}>
              <View style={[styles.skeletonLabelBar, { width: 200, height: 18 }]} />
            </View>
            <View style={styles.statusList}>
              <SkeletonStatusItem />
              <SkeletonStatusItem />
              <SkeletonStatusItem />
              <SkeletonStatusItem />
            </View>
          </>

        ) : loadState === 'error' ? (
          /* ── Error state ── */
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={52} color="#CBD5E1" />
            <Text style={styles.errorText}>Không thể tải dữ liệu thống kê</Text>
            <Text style={styles.errorHint}>Kéo xuống để thử lại</Text>
          </View>

        ) : stats ? (
          <>
            {/* ── Overview cards (2-col grid) ── */}
            <View style={styles.grid}>
              {CARDS.map((card) => (
                <Pressable
                  key={card.key}
                  style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
                  onPress={() => router.push(card.route as any)}
                >
                  <View style={[styles.iconBox, { backgroundColor: card.iconBg }]}>
                    <Ionicons name={card.icon} size={22} color={card.iconColor} />
                  </View>
                  <Text style={styles.cardValue}>
                    {stats[card.key].toLocaleString('vi-VN')}
                  </Text>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* ── Status section header ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trạng thái cần chú ý</Text>
            </View>


            {/* ── Status rows ── */}
            <View style={styles.statusList}>
              {STATUS_ITEMS.map((item) => {
                const handlePress = () => {
                  if (item.key === 'lockedUsers') {
                    router.push({ pathname: '/admin/users' as any, params: { filter: 'locked' } });
                  } else if (item.key === 'suspendedHotels') {
                    router.push({ pathname: '/admin/hotels' as any, params: { tab: 'suspended' } });
                  } else if (item.key === 'pendingHotels') {
                    router.push({ pathname: '/admin/hotels' as any, params: { tab: 'pending' } });
                  } else {
                    router.push(item.route as any);
                  }
                };
                return (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [
                      styles.statusItem,
                      { backgroundColor: item.accentBg },
                      pressed && { opacity: 0.75 },
                    ]}
                    onPress={handlePress}
                  >
                    <View style={[styles.statusIconBox, { backgroundColor: '#FFFFFF40' }]}>
                      <Ionicons name={item.icon} size={20} color={item.accentColor} />
                    </View>
                    <Text style={[styles.statusLabel, { color: item.accentColor }]}>
                      {item.label}
                    </Text>
                    <View style={styles.statusBadge}>
                      <Text style={[styles.statusBadgeText, { color: item.accentColor }]}>
                        {stats[item.key].toLocaleString('vi-VN')}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
    flexGrow: 1,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  // ── 2-column grid ─────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },

  // ── Compact stat card ─────────────────────────────────────────
  card: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },

  // ── Status section ────────────────────────────────────────────
  sectionHeader: {
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },


  // ── Status rows ───────────────────────────────────────────────
  statusList: {
    gap: 10,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  statusIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  statusLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 4,
    minWidth: 36,
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },

  // ── Error state ───────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  errorHint: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '500',
  },

  // ── Skeleton ──────────────────────────────────────────────────
  skeletonCard: {
    backgroundColor: '#FFFFFF',
  },
  skeletonIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  skeletonIconBoxSm: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
  },
  skeletonValueBar: {
    width: 52,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  skeletonLabelBar: {
    width: 72,
    height: 12,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  skeletonSummaryBanner: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
});
