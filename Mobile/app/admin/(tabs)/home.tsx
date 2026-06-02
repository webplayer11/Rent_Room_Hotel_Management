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
import { adminApi } from '../../../src/shared/api/adminApi';



export default function AdminHomeScreen() {
  const router = useRouter();

  const [totalHotels, setTotalHotels] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [pendingHosts, setPendingHosts] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const [hotelsRes, usersRes, pendingRes] = await Promise.all([
        adminApi.getAllHotels(),
        adminApi.getAllUsers(),
        adminApi.getPendingHosts(),
      ]);
      if (hotelsRes.isSuccess && hotelsRes.data) setTotalHotels(hotelsRes.data.length);
      if (usersRes.isSuccess && usersRes.data) setTotalUsers(usersRes.data.length);
      if (pendingRes.isSuccess && pendingRes.data) setPendingHosts(pendingRes.data.length);
    } catch (e) {
      console.error('Lỗi khi tải dữ liệu home:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  // Hiển thị "--" khi đang tải, số thật khi có data
  const display = (val: number | null) =>
    loading ? '--' : (val ?? '--').toString();

  // ── Skeleton Loader ──
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.skeleton, { width: 48, height: 48, borderRadius: 24 }]} />
            <View>
              <View style={[styles.skeleton, { width: 150, height: 24, marginBottom: 8 }]} />
              <View style={[styles.skeleton, { width: 200, height: 16 }]} />
            </View>
          </View>
        </View>
        <View style={styles.content}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <View style={[styles.skeleton, styles.statsCard, { height: 120 }]} />
            <View style={[styles.skeleton, styles.statsCard, { height: 120 }]} />
            <View style={[styles.skeleton, styles.statsCard, { height: 120, flex: 2 }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.greeting}>Xin chào, Quản trị viên! 👋</Text>
              <Text style={styles.subtitle}>Tổng quan hệ thống hôm nay</Text>
            </View>
          </View>
        </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5392F9']}
            tintColor="#5392F9"
          />
        }
      >
       

        {/* ── DASHBOARD STATS ── */}
        <View style={styles.statsContainer}>
          {/* Row 1: Tổng khách sạn + Tổng user */}
          <View style={styles.row}>
            {/* Card: Tổng khách sạn */}
            <Pressable
              style={({ pressed }) => [
                styles.statsCard,
                styles.cardWhite,
                pressed && { opacity: 0.75 },
              ]}
              onPress={() => router.push('/admin/hotels')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="business" size={24} color="#5392F9" />
              </View>
              <Text style={styles.statsValue}>{display(totalHotels)}</Text>
              <Text style={styles.statsLabel}>Tổng khách sạn</Text>
            </Pressable>

            {/* Card: Tổng user */}
            <Pressable
              style={({ pressed }) => [
                styles.statsCard,
                styles.cardWhite,
                pressed && { opacity: 0.75 },
              ]}
              onPress={() => router.push('/admin/users')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="people" size={24} color="#9333EA" />
              </View>
              <Text style={styles.statsValue}>{display(totalUsers)}</Text>
              <Text style={styles.statsLabel}>Tổng user</Text>
            </Pressable>
          </View>

          {/* Row 2: Host chờ duyệt */}
          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [
                styles.statsCard,
                styles.cardOrange,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => router.push('/admin/pending')}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Ionicons name="time" size={24} color="#FFFFFF" />
                </View>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.statsValue, { color: '#FFF' }]}>
                {display(pendingHosts)}
              </Text>
              <Text style={[styles.statsLabel, { color: 'rgba(255,255,255,0.9)' }]}>
                Host chờ duyệt
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── QUICK ACTIONS ── */}
        <Text style={styles.sectionTitle}>Hành động nhanh</Text>
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/admin/pending')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="person-add" size={24} color="#D97706" />
            </View>
            <Text style={styles.actionText}>Duyệt host</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/admin/pending-hotels')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="business" size={24} color="#16A34A" />
            </View>
            <Text style={styles.actionText}>Duyệt KS mới</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/admin/hotels')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="business-outline" size={24} color="#16A34A" />
            </View>
            <Text style={styles.actionText}>Quản lý KS</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/admin/users')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="people" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.actionText}>Quản lý user</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  skeleton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginLeft: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5392F9',
  },
  greeting: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  // --- Stats ---
  statsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  statsCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardWhite: {
    backgroundColor: '#FFF',
  },
  cardOrange: {
    backgroundColor: '#F97316',
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  // --- Actions ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5392F9',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  // --- Activities ---
  activitiesContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
