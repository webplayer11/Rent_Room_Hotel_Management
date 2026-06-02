import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminApi, DashboardStatsDto } from '../../../src/shared/api/adminApi';

// ── Types ──────────────────────────────────────────────────────────
type LoadState = 'loading' | 'success' | 'error';

// ── Stat card definition ───────────────────────────────────────────
type CardConfig = {
  key: keyof DashboardStatsDto;
  label: string;
  emoji: string;
  iconBg: string;
  valueBg: string;
  valueColor: string;
};

const CARDS: CardConfig[] = [
  {
    key: 'totalUsers',
    label: 'Người dùng',
    emoji: '👤',
    iconBg: '#EFF6FF',
    valueBg: '#FFFFFF',
    valueColor: '#1E293B',
  },
  {
    key: 'totalHotels',
    label: 'Khách sạn',
    emoji: '🏨',
    iconBg: '#ECFDF5',
    valueBg: '#FFFFFF',
    valueColor: '#1E293B',
  },
  {
    key: 'totalHosts',
    label: 'Chủ khách sạn',
    emoji: '🧑‍💼',
    iconBg: '#FFF7ED',
    valueBg: '#FFFFFF',
    valueColor: '#1E293B',
  },
  {
    key: 'totalVouchers',
    label: 'Voucher',
    emoji: '🎟️',
    iconBg: '#F5F3FF',
    valueBg: '#FFFFFF',
    valueColor: '#1E293B',
  },
];

// ── Skeleton card ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeletonCard]}>
      <View style={styles.skeletonCircle} />
      <View style={styles.skeletonValueBar} />
      <View style={styles.skeletonLabelBar} />
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────
export default function AdminStatsScreen() {
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

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  // ── Render ──
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thống kê hệ thống</Text>
          <Text style={styles.headerSubtitle}>Tổng quan dữ liệu hiện tại</Text>
        </View>

        {/* Content area */}
        {loadState === 'loading' && !refreshing ? (
          /* Skeleton */
          <View style={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : loadState === 'error' ? (
          /* Error state */
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>Không thể tải dữ liệu thống kê</Text>
            <Text style={styles.errorHint}>Kéo xuống để thử lại</Text>
          </View>
        ) : stats ? (
          /* Stat cards grid */
          <View style={styles.grid}>
            {CARDS.map((card) => (
              <View key={card.key} style={styles.card}>
                {/* Emoji icon */}
                <View style={[styles.emojiBox, { backgroundColor: card.iconBg }]}>
                  <Text style={styles.emoji}>{card.emoji}</Text>
                </View>
                {/* Value */}
                <Text style={[styles.value, { color: card.valueColor }]}>
                  {stats[card.key].toLocaleString('vi-VN')}
                </Text>
                {/* Label */}
                <Text style={styles.label}>{card.label}</Text>
              </View>
            ))}
          </View>
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
    marginBottom: 28,
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

  // Grid (2-column)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  // Stat card
  card: {
    // Take up ~half the row minus gap
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emojiBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emoji: {
    fontSize: 26,
  },
  value: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // Skeleton
  skeletonCard: {
    backgroundColor: '#FFFFFF',
  },
  skeletonCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  skeletonValueBar: {
    width: 60,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  skeletonLabelBar: {
    width: 80,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
});
