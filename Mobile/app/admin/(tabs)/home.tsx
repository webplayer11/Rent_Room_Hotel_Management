import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Fake Data ---
const MOCK_STATS = {
  totalHotels: 150,
  totalHosts: 420,
  pendingHosts: 15,
  totalBookings: '1,250',
};

const RECENT_ACTIVITIES = [
  {
    id: '1',
    title: 'Host Anh Tuấn vừa đăng ký mới.',
    time: '2 phút trước',
    icon: 'person-add-outline',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: '2',
    title: 'Khách sạn Blue Wave đã được duyệt.',
    time: '15 phút trước',
    icon: 'checkmark-circle-outline',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    id: '3',
    title: 'Booking #2042 vừa hoàn tất.',
    time: '1 giờ trước',
    icon: 'card-outline',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
];

export default function AdminHomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Skeleton Loader for Dashboard Cards
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
            <View style={[styles.skeleton, styles.statsCardFull, { height: 120 }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>Q</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Xin chào, Quản trị viên! 👋</Text>
              <Text style={styles.subtitle}>Hôm nay có 25 yêu cầu mới cần xử lý.</Text>
            </View>
          </View>
          <Pressable style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#111827" />
            <View style={styles.badge} />
          </Pressable>
        </View>

        {/* DASHBOARD STATS */}
        <View style={styles.statsContainer}>
          {/* Row 1 */}
          <View style={styles.row}>
            <View style={[styles.statsCard, styles.cardWhite]}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="business" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.statsValue}>{MOCK_STATS.totalHotels}</Text>
              <Text style={styles.statsLabel}>Tổng khách sạn</Text>
            </View>
            <View style={[styles.statsCard, styles.cardWhite]}>
              <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="people" size={24} color="#9333EA" />
              </View>
              <Text style={styles.statsValue}>{MOCK_STATS.totalHosts}</Text>
              <Text style={styles.statsLabel}>Tổng host</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <View style={[styles.statsCard, styles.cardOrange]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Ionicons name="time" size={24} color="#FFFFFF" />
                </View>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.statsValue, { color: '#FFF' }]}>{MOCK_STATS.pendingHosts}</Text>
              <Text style={[styles.statsLabel, { color: 'rgba(255,255,255,0.9)' }]}>Host chờ duyệt</Text>
            </View>
          </View>

          {/* Row 3 - Full Width */}
          <View style={[styles.statsCardFull, styles.cardBlue]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statsLabel, { color: 'rgba(255,255,255,0.8)' }]}>Tổng booking hệ thống</Text>
              <Text style={[styles.statsValue, { color: '#FFF', fontSize: 32 }]}>{MOCK_STATS.totalBookings}</Text>
            </View>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)', width: 60, height: 60, borderRadius: 30, marginBottom: 0 }]}>
              <Ionicons name="bar-chart" size={32} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS */}
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
            onPress={() => router.push('/admin/pending-hotels')}>
            <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="business" size={24} color="#16A34A" />
            </View>
            <Text style={styles.actionText}>Duyệt KS mới</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}>
            <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="people" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.actionText}>Quản lý user</Text>
          </Pressable>
        </View>

        {/* RECENT ACTIVITIES */}
        <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
        <View style={styles.activitiesContainer}>
          {RECENT_ACTIVITIES.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIconWrap, { backgroundColor: activity.bgColor }]}>
                <Ionicons name={activity.icon as any} size={20} color={activity.color} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
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
    paddingTop: Platform.OS === 'android' ? 40 : 20,
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
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },
  greeting: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
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
  cardBlue: {
    backgroundColor: '#1E3A8A',
  },
  statsCardFull: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
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
    color: '#1E3A8A',
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
