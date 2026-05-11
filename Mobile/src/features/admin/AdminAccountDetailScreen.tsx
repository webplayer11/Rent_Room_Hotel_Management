import React, { useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../shared/components/AppCard';
import { AppButton } from '../../shared/components/AppButton';
import { colors } from '../../shared/constants/colors';
import { adminAccountsMockData } from './adminMockData';
import type { AdminAccountStatus } from './adminTypes';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const roleConfig = {
  customer: { label: 'Khách hàng', bg: '#DBEAFE', fg: '#1D4ED8', avatarBg: colors.primary },
  business: { label: 'Doanh nghiệp', bg: '#EDE9FE', fg: '#6D28D9', avatarBg: '#6D28D9' },
};

const statusConfig: Record<AdminAccountStatus, { label: string; bg: string; fg: string }> = {
  active: { label: 'Hoạt động', bg: '#DCFCE7', fg: '#16A34A' },
  blocked: { label: 'Bị khóa', bg: '#FEE2E2', fg: '#DC2626' },
};

const hotelStatusConfig = {
  approved: { label: 'Đã duyệt', bg: '#DCFCE7', fg: '#16A34A' },
  pending: { label: 'Chờ duyệt', bg: '#FEF3C7', fg: '#B45309' },
  need_update: { label: 'Cần bổ sung', bg: '#FFEDD5', fg: '#C2410C' },
  rejected: { label: 'Từ chối', bg: '#FEE2E2', fg: '#DC2626' },
  blocked: { label: 'Bị khóa', bg: '#F3F4F6', fg: '#374151' },
};

const bookingStatusConfig = {
  completed: { label: 'Hoàn tất', bg: '#DCFCE7', fg: '#16A34A' },
  cancelled: { label: 'Đã hủy', bg: '#FEE2E2', fg: '#DC2626' },
  confirmed: { label: 'Đã xác nhận', bg: '#DBEAFE', fg: colors.primary },
  pending: { label: 'Chờ xác nhận', bg: '#FEF3C7', fg: '#B45309' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminAccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const accIndex = adminAccountsMockData.findIndex((a) => a.id === id);
  const [accounts, setAccounts] = useState([...adminAccountsMockData]);
  const account = accounts[accIndex];

  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [showBlockInput, setShowBlockInput] = useState(false);

  if (!account) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy tài khoản.</Text>
        <AppButton title="Quay lại" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const roleCfg = roleConfig[account.role];
  const stCfg = statusConfig[account.status];
  const initials = account.fullName.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();

  function refreshAccounts() {
    setAccounts([...adminAccountsMockData]);
  }

  function handleBlock() {
    if (!blockReasonInput.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do khóa tài khoản.');
      return;
    }
    adminAccountsMockData[accIndex] = {
      ...adminAccountsMockData[accIndex],
      status: 'blocked',
      blockReason: blockReasonInput.trim(),
      activityLog: [
        { id: `al-block-${Date.now()}`, date: new Date().toLocaleDateString('vi-VN'), action: 'Bị khóa tài khoản', detail: blockReasonInput.trim() },
        ...adminAccountsMockData[accIndex].activityLog,
      ],
    };
    setBlockReasonInput('');
    setShowBlockInput(false);
    refreshAccounts();
    Alert.alert('Đã khóa', 'Đã khóa tài khoản.');
  }

  function handleUnblock() {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn mở khóa tài khoản này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Mở khóa',
        onPress: () => {
          adminAccountsMockData[accIndex] = {
            ...adminAccountsMockData[accIndex],
            status: 'active',
            blockReason: undefined,
            activityLog: [
              { id: `al-unblock-${Date.now()}`, date: new Date().toLocaleDateString('vi-VN'), action: 'Được mở khóa tài khoản' },
              ...adminAccountsMockData[accIndex].activityLog,
            ],
          };
          refreshAccounts();
          Alert.alert('Đã mở khóa', 'Đã mở khóa tài khoản.');
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/admin/accounts'); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết tài khoản</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ===== ACCOUNT INFO ===== */}
        <AppCard style={styles.section}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: roleCfg.avatarBg }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{account.fullName}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: roleCfg.bg }]}>
                  <Text style={[styles.badgeText, { color: roleCfg.fg }]}>{roleCfg.label}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: stCfg.bg }]}>
                  <Text style={[styles.badgeText, { color: stCfg.fg }]}>{stCfg.label}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <InfoRow icon="mail-outline" label="Email" value={account.email} />
          <InfoRow icon="call-outline" label="SĐT" value={account.phone} />
          {account.companyName && <InfoRow icon="business-outline" label="Doanh nghiệp" value={account.companyName} />}
          <InfoRow icon="calendar-outline" label="Ngày tạo" value={account.createdAt} />
          {account.lastLoginAt && <InfoRow icon="time-outline" label="Đăng nhập gần nhất" value={account.lastLoginAt} />}
        </AppCard>

        {/* ===== CUSTOMER STATS ===== */}
        {account.role === 'customer' && (
          <>
            <AppCard style={styles.section}>
              <Text style={styles.sectionTitle}>Thống kê đặt phòng</Text>
              <View style={styles.metricsGrid}>
                <MetricCell label="Tổng đơn" value={String(account.totalBookings ?? 0)} />
                <MetricCell label="Tổng chi tiêu" value={account.totalSpending ?? '0đ'} />
                <MetricCell label="Hoàn tất" value={String(account.completedBookings ?? 0)} color={colors.success} />
                <MetricCell label="Đã hủy" value={String(account.cancelledBookings ?? 0)} color={colors.danger} />
              </View>
            </AppCard>

            {account.recentBookings && account.recentBookings.length > 0 && (
              <AppCard style={styles.section}>
                <Text style={styles.sectionTitle}>Đặt phòng gần đây</Text>
                {account.recentBookings.map((b, idx) => {
                  const bst = bookingStatusConfig[b.status];
                  return (
                    <View key={b.id} style={[styles.listRow, idx < account.recentBookings!.length - 1 && styles.listRowBorder]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listRowTitle} numberOfLines={1}>{b.hotelName}</Text>
                        <Text style={styles.listRowSub}>{b.bookedAt} · {b.amount}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: bst.bg }]}>
                        <Text style={[styles.badgeText, { color: bst.fg }]}>{bst.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </AppCard>
            )}
          </>
        )}

        {/* ===== BUSINESS HOTELS ===== */}
        {account.role === 'business' && account.hotels && (
          <AppCard style={styles.section}>
            <Text style={styles.sectionTitle}>Khách sạn ({account.hotels.length})</Text>
            {account.hotels.map((h, idx) => {
              const hst = hotelStatusConfig[h.status];
              return (
                <Pressable key={h.id}
                  style={[styles.listRow, idx < account.hotels!.length - 1 && styles.listRowBorder, { alignItems: 'center' }]}
                  onPress={() => router.push(`/admin/hotel-detail?id=${h.id}`)}>
                  <View style={styles.hotelRowIcon}>
                    <Ionicons name="business" size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.listRowTitle, { flex: 1 }]} numberOfLines={1}>{h.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.badge, { backgroundColor: hst.bg }]}>
                      <Text style={[styles.badgeText, { color: hst.fg }]}>{hst.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                  </View>
                </Pressable>
              );
            })}
          </AppCard>
        )}

        {/* ===== ACTIVITY LOG ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử hoạt động</Text>
          {account.activityLog.map((log, idx) => (
            <View key={log.id} style={styles.historyRow}>
              <View style={styles.historyDot}>
                <View style={styles.dot} />
                {idx < account.activityLog.length - 1 && <View style={styles.historyLine} />}
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyDate}>{log.date}</Text>
                <Text style={styles.historyAction}>{log.action}</Text>
                {log.detail && <Text style={styles.historyDetail}>{log.detail}</Text>}
              </View>
            </View>
          ))}
        </AppCard>

        {/* ===== ACTIONS ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động</Text>

          {account.status === 'active' && (
            <>
              <AppButton
                title={showBlockInput ? 'Hủy khóa tài khoản' : 'Khóa tài khoản'}
                variant="outline"
                onPress={() => { setShowBlockInput(!showBlockInput); setBlockReasonInput(''); }}
              />
              {showBlockInput && (
                <View style={styles.blockInputWrap}>
                  <TextInput
                    style={styles.noteInput}
                    value={blockReasonInput}
                    onChangeText={setBlockReasonInput}
                    placeholder="Nhập lý do khóa tài khoản..."
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <AppButton
                    title="Xác nhận khóa tài khoản"
                    onPress={handleBlock}
                    style={{ marginTop: 8, backgroundColor: colors.danger }}
                  />
                </View>
              )}
            </>
          )}

          {account.status === 'blocked' && (
            <>
              {account.blockReason && (
                <View style={styles.blockReasonBox}>
                  <Text style={styles.blockReasonLabel}>Lý do khóa:</Text>
                  <Text style={styles.blockReasonText}>{account.blockReason}</Text>
                </View>
              )}
              <AppButton title="Mở khóa tài khoản" onPress={handleUnblock} style={{ marginTop: 12 }} />
            </>
          )}
        </AppCard>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color={colors.muted} />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function MetricCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.metricCell}>
      <Text style={[styles.metricValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 16, color: colors.muted },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  content: { padding: 16, paddingBottom: 40 },

  section: { marginBottom: 14, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },

  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.textLight, fontWeight: '700', fontSize: 18 },
  accountName: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, color: colors.muted, width: 110 },
  infoValue: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '500' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCell: { width: '46%', backgroundColor: colors.background, borderRadius: 10, padding: 12, alignItems: 'center' },
  metricValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  metricLabel: { fontSize: 12, color: colors.muted, marginTop: 4 },

  listRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, gap: 10 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  listRowTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  listRowSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  hotelRowIcon: { width: 30, height: 30, backgroundColor: '#EFF6FF', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  historyRow: { flexDirection: 'row', marginBottom: 0 },
  historyDot: { width: 24, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 4 },
  historyLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  historyContent: { flex: 1, paddingBottom: 14, paddingLeft: 8 },
  historyDate: { fontSize: 11, color: colors.muted, marginBottom: 2 },
  historyAction: { fontSize: 13, color: colors.text, fontWeight: '600' },
  historyDetail: { fontSize: 12, color: colors.muted, marginTop: 3, fontStyle: 'italic' },

  blockInputWrap: { marginTop: 12 },
  noteInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    padding: 12, fontSize: 14, color: colors.text,
    backgroundColor: colors.surface, minHeight: 80,
  },
  blockReasonBox: {
    padding: 12, backgroundColor: '#FEF2F2',
    borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.danger,
    marginBottom: 4,
  },
  blockReasonLabel: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 4 },
  blockReasonText: { fontSize: 13, color: colors.text, lineHeight: 19 },
});
