import React, { useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../shared/components/AppCard';
import { colors } from '../../shared/constants/colors';
import { adminAccountsMockData } from './adminMockData';
import type { AdminAccount, AdminAccountRole, AdminAccountStatus } from './adminTypes';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

type RoleFilter = 'all' | AdminAccountRole;
type StatusFilter = 'all' | AdminAccountStatus;

const roleConfig: Record<AdminAccountRole, { label: string; bg: string; fg: string }> = {
  customer: { label: 'Khách hàng', bg: '#DBEAFE', fg: '#1D4ED8' },
  business: { label: 'Doanh nghiệp', bg: '#EDE9FE', fg: '#6D28D9' },
};

const statusConfig: Record<AdminAccountStatus, { label: string; bg: string; fg: string }> = {
  active: { label: 'Hoạt động', bg: '#DCFCE7', fg: '#16A34A' },
  blocked: { label: 'Bị khóa', bg: '#FEE2E2', fg: '#DC2626' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminAccountListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const accounts = adminAccountsMockData;

  const filtered = accounts.filter((a) => {
    const matchRole = roleFilter === 'all' || a.role === roleFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.includes(q);
    return matchRole && matchStatus && matchSearch;
  });

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quản lý tài khoản</Text>
          <Text style={styles.headerSub}>Theo dõi tài khoản khách hàng và doanh nghiệp trong hệ thống.</Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.muted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên, email hoặc SĐT..."
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

        {/* Role filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }} contentContainerStyle={styles.filterRow}>
          {(['all', 'customer', 'business'] as RoleFilter[]).map((r) => {
            const isActive = roleFilter === r;
            const label = r === 'all' ? 'Tất cả' : roleConfig[r as AdminAccountRole].label;
            return (
              <Pressable key={r} style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setRoleFilter(r)}>
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Status filter */}
        <View style={styles.filterRow2}>
          {(['all', 'active', 'blocked'] as StatusFilter[]).map((s) => {
            const isActive = statusFilter === s;
            const label = s === 'all' ? 'Tất cả' : statusConfig[s as AdminAccountStatus].label;
            const cfg = s !== 'all' ? statusConfig[s as AdminAccountStatus] : null;
            return (
              <Pressable key={s}
                style={[styles.statusTab, isActive && { backgroundColor: cfg?.bg ?? colors.primary + '18', borderColor: cfg?.fg ?? colors.primary }]}
                onPress={() => setStatusFilter(s)}>
                <Text style={[styles.statusTabText, isActive && { color: cfg?.fg ?? colors.primary, fontWeight: '600' }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Result count */}
        <Text style={styles.resultCount}>{filtered.length} tài khoản</Text>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyText}>Không tìm thấy tài khoản phù hợp.</Text>
          </View>
        ) : (
          filtered.map((acc) => <AccountCard key={acc.id} account={acc} router={router} />)
        )}
      </ScrollView>

      <BottomNav activeTab="accounts" router={router} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Account Card
// ---------------------------------------------------------------------------

function AccountCard({ account, router }: { account: AdminAccount; router: any }) {
  const roleCfg = roleConfig[account.role];
  const stCfg = statusConfig[account.status];
  const initials = account.fullName.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();

  return (
    <Pressable style={({ pressed }) => [pressed && { opacity: 0.85 }]}
      onPress={() => router.push(`/admin/account-detail?id=${account.id}`)}>
      <AppCard style={styles.card}>
        <View style={styles.cardTop}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: account.role === 'business' ? '#6D28D9' : colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>{account.fullName}</Text>
            <Text style={styles.cardEmail} numberOfLines={1}>{account.email}</Text>
            <Text style={styles.cardPhone}>{account.phone}</Text>
          </View>

          {/* Badges */}
          <View style={styles.badgeCol}>
            <View style={[styles.badge, { backgroundColor: roleCfg.bg }]}>
              <Text style={[styles.badgeText, { color: roleCfg.fg }]}>{roleCfg.label}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: stCfg.bg, marginTop: 4 }]}>
              <Text style={[styles.badgeText, { color: stCfg.fg }]}>{stCfg.label}</Text>
            </View>
          </View>
        </View>

        {/* Sub info */}
        <View style={styles.cardMeta}>
          {account.role === 'business' && account.hotels && (
            <View style={styles.metaRow}>
              <Ionicons name="business-outline" size={13} color={colors.muted} />
              <Text style={styles.metaText}>{account.hotels.length} khách sạn</Text>
            </View>
          )}
          {account.role === 'customer' && account.totalBookings !== undefined && (
            <View style={styles.metaRow}>
              <Ionicons name="receipt-outline" size={13} color={colors.muted} />
              <Text style={styles.metaText}>{account.totalBookings} đơn đặt</Text>
            </View>
          )}
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
          ? tab.icon : (`${tab.icon}-outline` as keyof typeof Ionicons.glyphMap);
        return (
          <Pressable key={tab.key} style={styles.navTab}
            onPress={() => { if (!isActive) router.replace(tab.route as any); }}>
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
  searchInput: { flex: 1, fontSize: 14, color: colors.text },

  filterRow: { gap: 8, paddingBottom: 4 },
  filterTab: {
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  filterTabTextActive: { color: colors.textLight, fontWeight: '600' },

  filterRow2: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statusTab: {
    flex: 1, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: 'center',
  },
  statusTabText: { fontSize: 13, color: colors.muted },

  resultCount: { fontSize: 13, color: colors.muted, marginBottom: 12, fontWeight: '500' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center' },

  card: { marginBottom: 10, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.textLight, fontWeight: '700', fontSize: 15 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '700', color: colors.text },
  cardEmail: { fontSize: 12, color: colors.muted, marginTop: 2 },
  cardPhone: { fontSize: 12, color: colors.muted },
  badgeCol: { alignItems: 'flex-end' },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.muted },

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
