import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../shared/components/AppCard';
import { colors } from '../../shared/constants/colors';
import { adminDashboardMockData } from './adminMockData';
import type { AdminHotelStatus, AdminTaskAction } from './adminTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hotelStatusMap: Record<AdminHotelStatus, { label: string; bg: string; fg: string }> = {
  approved: { label: 'Đã duyệt', bg: '#DCFCE7', fg: colors.success },
  pending: { label: 'Chờ duyệt', bg: '#FEF3C7', fg: '#B45309' },
  need_update: { label: 'Cần bổ sung', bg: '#FEE2E2', fg: colors.danger },
  rejected: { label: 'Từ chối', bg: '#F3F4F6', fg: '#6B7280' },
  blocked: { label: 'Bị khóa', bg: '#F3F4F6', fg: '#374151' },
};


const taskColorMap: Record<string, { icon: string; color: string }> = {
  warning: { icon: '#B45309', color: '#FEF3C7' },
  danger: { icon: colors.danger, color: '#FEE2E2' },
  info: { icon: colors.primary, color: '#DBEAFE' },
};

const taskIconMap: Record<AdminTaskAction, keyof typeof Ionicons.glyphMap> = {
  review_hotel: 'business-outline',
  review_report: 'flag-outline',
  review_account: 'person-outline',
  system_alert: 'alert-circle-outline',
};

function handleTaskPress(action: AdminTaskAction, router: any) {
  switch (action) {
    case 'review_hotel': router.push('/admin/hotels'); break;
    case 'review_report': router.push('/admin/reports'); break;
    case 'review_account': router.push('/admin/accounts'); break;
    default:
      Alert.alert('Thông báo', 'Tính năng sẽ được phát triển sau.');
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminDashboardScreen() {
  const router = useRouter();
  const {
    adminName,
    unreadNotifications,
    stats,
    tasks,
    recentSubmissions,
    recentActivity,
  } = adminDashboardMockData;

  const activeTab = 'home';

  // Quick management actions (not in bottom tab)
  const quickActions = [
    {
      icon: 'business-outline' as const,
      label: 'Khách sạn',
      onPress: () => router.replace('/admin/hotels'),
    },
    {
      icon: 'people-outline' as const,
      label: 'Tài khoản',
      onPress: () => router.replace('/admin/accounts'),
    },
    {
      icon: 'pricetag-outline' as const,
      label: 'Voucher',
      onPress: () => Alert.alert('Voucher', 'Tính năng quản lý Voucher sẽ được phát triển sau.'),
    },
    {
      icon: 'list-outline' as const,
      label: 'Tiện nghi',
      onPress: () => Alert.alert('Tiện nghi', 'Tính năng quản lý Tiện nghi sẽ được phát triển sau.'),
    },
    {
      icon: 'bar-chart-outline' as const,
      label: 'Báo cáo',
      onPress: () => router.replace('/admin/reports'),
    },
    {
      icon: 'shield-checkmark-outline' as const,
      label: 'Phê duyệt',
      onPress: () => router.push('/admin/hotels'),
    },
  ];

  const activityIconColorMap: Record<string, string> = {
    hotel: colors.primary,
    account: colors.success,
    booking: '#B45309',
    system: colors.muted,
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 1. HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AD</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>Xin chào, {adminName}</Text>
              <Text style={styles.headerSub}>Quản trị hệ thống khách sạn</Text>
            </View>
          </View>

          <Pressable
            style={styles.bellWrapper}
            onPress={() =>
              Alert.alert('Thông báo', 'Tính năng thông báo Admin sẽ được phát triển sau.')
            }
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* ===== 2. BANNER ===== */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Tổng quan hệ thống</Text>
          <Text style={styles.bannerSub}>
            Theo dõi khách sạn, tài khoản và doanh thu nền tảng.
          </Text>
        </View>

        {/* ===== 3. KPI GRID 2x3 ===== */}
        <View style={styles.kpiGrid}>
          {/* Row 1 */}
          <Pressable style={styles.kpiCell} onPress={() => router.replace('/admin/hotels')}>
            <AppCard style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="business-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.kpiValue}>{stats.totalHotels}</Text>
              <Text style={styles.kpiLabel}>Khách sạn</Text>
            </AppCard>
          </Pressable>

          <Pressable style={styles.kpiCell} onPress={() => router.replace('/admin/hotels')}>
            <AppCard style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="time-outline" size={20} color="#B45309" />
              </View>
              <Text style={[styles.kpiValue, { color: '#B45309' }]}>{stats.pendingHotels}</Text>
              <Text style={styles.kpiLabel}>Chờ duyệt</Text>
            </AppCard>
          </Pressable>

          {/* Row 2 */}
          <Pressable style={styles.kpiCell} onPress={() => router.replace('/admin/accounts')}>
            <AppCard style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="people-outline" size={20} color={colors.success} />
              </View>
              <Text style={[styles.kpiValue, { color: colors.success }]}>{stats.totalAccounts}</Text>
              <Text style={styles.kpiLabel}>Tài khoản</Text>
            </AppCard>
          </Pressable>

          <Pressable style={styles.kpiCell} onPress={() => router.replace('/admin/reports')}>
            <AppCard style={styles.kpiCard}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="wallet-outline" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.kpiValue, { color: colors.primary }]}>{stats.monthlyCommission}</Text>
              <Text style={styles.kpiLabel}>Hoa hồng</Text>
            </AppCard>
          </Pressable>
        </View>

        {/* ===== 4. CÔNG VIỆC CẦN XỬ LÝ ===== */}
        {tasks.length > 0 && (
          <AppCard style={styles.section}>
            <Text style={styles.sectionTitle}>Cần xử lý</Text>
            {tasks.map((task, idx) => {
              const colors_ = taskColorMap[task.type];
              const iconName = taskIconMap[task.action];
              return (
                <Pressable
                  key={task.id}
                  style={[styles.taskRow, idx < tasks.length - 1 && styles.taskRowBorder]}
                  onPress={() => handleTaskPress(task.action, router)}
                >
                  <View style={[styles.taskIconWrap, { backgroundColor: colors_.color }]}>
                    <Ionicons name={iconName} size={16} color={colors_.icon} />
                  </View>
                  <View style={styles.taskTextWrap}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskSub}>{task.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              );
            })}
          </AppCard>
        )}

        {/* ===== 5. THAO TÁC NHANH ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Quản trị nhanh</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action) => (
              <Pressable key={action.label} style={styles.actionItem} onPress={action.onPress}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name={action.icon} size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </AppCard>

        {/* ===== 6. KHÁCH SẠN MỚI GỬI ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Hồ sơ khách sạn mới</Text>
            <Pressable onPress={() => router.replace('/admin/hotels')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </Pressable>
          </View>
          {recentSubmissions.map((sub, idx) => {
            const st = hotelStatusMap[sub.status];
            return (
              <Pressable
                key={sub.id}
                style={[styles.submissionRow, idx < recentSubmissions.length - 1 && styles.submissionRowBorder]}
                onPress={() => router.push('/admin/hotels')}
              >
                <View style={styles.submissionIcon}>
                  <Ionicons name="business" size={18} color={colors.primary} />
                </View>
                <View style={styles.submissionInfo}>
                  <Text style={styles.submissionName} numberOfLines={1}>{sub.hotelName}</Text>
                  <Text style={styles.submissionOwner}>{sub.ownerName} · {sub.submittedAt}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: st.fg }]}>{st.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </AppCard>

        {/* ===== 7. HOẠT ĐỘNG GẦN ĐÂY ===== */}
        <AppCard style={styles.sectionLast}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          {recentActivity.map((act, idx) => (
            <View
              key={act.id}
              style={[styles.activityRow, idx < recentActivity.length - 1 && styles.activityRowBorder]}
            >
              <View style={[styles.activityIconWrap, { backgroundColor: activityIconColorMap[act.type] + '18' }]}>
                <Ionicons
                  name={act.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={activityIconColorMap[act.type]}
                />
              </View>
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityMsg}>{act.message}</Text>
                <Text style={styles.activityTime}>{act.time}</Text>
              </View>
            </View>
          ))}
        </AppCard>
      </ScrollView>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <View style={styles.bottomNav}>
        {([
          { key: 'home', icon: 'home' as const, label: 'Tổng quan' },
          { key: 'hotels', icon: 'business' as const, label: 'Khách sạn' },
          { key: 'accounts', icon: 'people' as const, label: 'Tài khoản' },
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
                if (tab.key === 'hotels') router.replace('/admin/hotels');
                else if (tab.key === 'accounts') router.replace('/admin/accounts');
                else if (tab.key === 'reports') router.replace('/admin/reports');
              }}
            >
              <Ionicons name={iconName} size={22} color={isActive ? colors.primary : colors.muted} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
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
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 52, paddingBottom: 100 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primaryDark,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarText: { color: colors.textLight, fontWeight: '700', fontSize: 15 },
  headerInfo: { flex: 1 },
  greeting: { color: colors.text, fontSize: 16, fontWeight: '700' },
  headerSub: { color: colors.muted, fontSize: 12, marginTop: 1 },
  bellWrapper: { position: 'relative', padding: 6 },
  badge: {
    position: 'absolute', top: 3, right: 3,
    backgroundColor: colors.danger,
    borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: colors.textLight, fontSize: 9, fontWeight: '700' },

  // Banner
  banner: {
    backgroundColor: colors.primaryDark, borderRadius: 14,
    padding: 16, marginBottom: 16,
  },
  bannerTitle: { color: colors.textLight, fontSize: 17, fontWeight: '700' },
  bannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4, lineHeight: 19 },

  // KPI
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCell: { width: '48%' },
  kpiCard: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 10 },
  kpiIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  kpiValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  kpiLabel: { fontSize: 12, color: colors.muted, marginTop: 2, fontWeight: '500' },

  // Section
  section: { marginBottom: 14, padding: 14 },
  sectionLast: { marginBottom: 0, padding: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // Tasks
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  taskRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  taskIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  taskTextWrap: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  taskSub: { fontSize: 12, color: colors.muted, marginTop: 2 },

  // Quick actions
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionItem: { width: '30%', alignItems: 'center', gap: 6 },
  actionIconWrap: {
    width: 50, height: 50, backgroundColor: '#EFF6FF',
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, color: colors.text, fontWeight: '500', textAlign: 'center' },

  // Submissions
  submissionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  submissionRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  submissionIcon: {
    width: 36, height: 36, backgroundColor: '#EFF6FF',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  submissionInfo: { flex: 1 },
  submissionName: { fontSize: 14, fontWeight: '600', color: colors.text },
  submissionOwner: { fontSize: 12, color: colors.muted, marginTop: 2 },

  // Status badge
  statusBadge: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  // Activity
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10 },
  activityRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  activityIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  activityTextWrap: { flex: 1 },
  activityMsg: { fontSize: 13, color: colors.text, lineHeight: 18 },
  activityTime: { fontSize: 11, color: colors.muted, marginTop: 3 },

  // Bottom Nav
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
