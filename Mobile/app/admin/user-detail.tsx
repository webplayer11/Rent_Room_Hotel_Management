import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Phone, Calendar, User } from 'lucide-react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { adminApi, AdminUserDto } from '../../src/shared/api/adminApi';

// ─── Helpers (đồng bộ với users.tsx) ─────────────────────────────────
const getRoleBadge = (role: string) => {
  switch (role) {
    case 'Admin':
      return { label: 'Admin',    bg: '#FEE2E2', color: '#991B1B' };
    case 'Host':
      return { label: 'Host',     bg: '#E0E7FF', color: '#3730A3' };
    case 'Customer':
      return { label: 'Customer', bg: '#DCFCE7', color: '#166534' };
    default:
      return { label: role,       bg: '#F1F5F9', color: '#475569' };
  }
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const getInitial = (user: AdminUserDto) => {
  if (user.fullName) return user.fullName.trim()[0].toUpperCase();
  if (user.email)    return user.email[0].toUpperCase();
  return '?';
};

// ─── Component ────────────────────────────────────────────────────────
export default function UserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [user,          setUser]          = useState<AdminUserDto | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Load / reload ───────────────────────────────────────────────
  const loadUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getUserById(id);
      if (res.isSuccess) {
        setUser(res.data);
      } else {
        setError(res.message || 'Không tải được thông tin người dùng');
      }
    } catch (e: any) {
      setError(e.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  // ── Lock handler ────────────────────────────────────────────────
  const handleLock = () => {
    Alert.alert(
      'Khóa tài khoản',
      'Bạn có chắc muốn khóa tài khoản này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await adminApi.lockUser(id!);
              if (res.isSuccess) {
                await loadUser();
              } else {
                Alert.alert('Lỗi', res.message || 'Khóa tài khoản thất bại');
              }
            } catch (e: any) {
              Alert.alert('Lỗi', e.message || 'Lỗi kết nối máy chủ');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // ── Unlock handler ──────────────────────────────────────────────
  const handleUnlock = () => {
    Alert.alert(
      'Mở khóa tài khoản',
      'Bạn có chắc muốn mở khóa tài khoản này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Mở khóa',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await adminApi.unlockUser(id!);
              if (res.isSuccess) {
                await loadUser();
              } else {
                Alert.alert('Lỗi', res.message || 'Mở khóa thất bại');
              }
            } catch (e: any) {
              Alert.alert('Lỗi', e.message || 'Lỗi kết nối máy chủ');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // ── Header options ──────────────────────────────────────────────
  const headerOptions = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: 'Chi tiết người dùng',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <ChevronLeft size={28} color="#000" />
          </TouchableOpacity>
        ),
      }}
    />
  );

  // ── Loading state ───────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        {headerOptions}
        <ActivityIndicator size="large" color="#5392F9" />
        <Text style={styles.loadingText}>Đang tải thông tin người dùng...</Text>
      </SafeAreaView>
    );
  }

  // ── Error state ─────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        {headerOptions}
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadUser}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Not found state ─────────────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        {headerOptions}
        <User size={48} color="#CBD5E1" />
        <Text style={styles.notFoundText}>Không tìm thấy người dùng</Text>
      </SafeAreaView>
    );
  }

  // ── Data ────────────────────────────────────────────────────────
  const roleBadge = getRoleBadge(user.role);
  const initial   = getInitial(user);
  const isLocked  = !user.isActive;

  // ── Main render ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {headerOptions}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar + name header ─────────────────────────────── */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, isLocked && styles.avatarLocked]}>
            <Text style={[styles.avatarText, isLocked && styles.avatarTextLocked]}>
              {initial}
            </Text>
          </View>
          <Text style={styles.fullName}>
            {user.fullName || 'Chưa có tên'}
          </Text>
          {/* Badges row */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: roleBadge.bg }]}>
              <Text style={[styles.badgeText, { color: roleBadge.color }]}>
                {roleBadge.label}
              </Text>
            </View>
            <View style={[
              styles.badge,
              { backgroundColor: isLocked ? '#FEE2E2' : '#DCFCE7' },
            ]}>
              <Text style={[
                styles.badgeText,
                { color: isLocked ? '#991B1B' : '#166534' },
              ]}>
                {isLocked ? 'Bị khóa' : 'Hoạt động'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Info card ────────────────────────────────────────── */}
        <View style={styles.infoCard}>

          {/* Email */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Mail size={18} color="#5392F9" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email || 'Chưa có'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Số điện thoại */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Phone size={18} color="#5392F9" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>
                {user.phoneNumber || 'Chưa có'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Ngày tạo */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Calendar size={18} color="#5392F9" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày tạo tài khoản</Text>
              <Text style={styles.infoValue}>
                {user.createdAt ? formatDate(user.createdAt) : 'Chưa có'}
              </Text>
            </View>
          </View>

        </View>

        {/* ── User ID ──────────────────────────────────────────── */}
        <Text style={styles.userId} selectable>ID: {user.id}</Text>

        {/* Spacer để nội dung không bị footer che */}
        <View style={{ height: 90 }} />

      </ScrollView>

      {/* ── Footer action button ─────────────────────────────── */}
      <View style={styles.footer}>
        {user.isActive ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnLock]}
            onPress={handleLock}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>
              {actionLoading ? 'Đang xử lý...' : '🔒  Khóa tài khoản'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnUnlock]}
            onPress={handleUnlock}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>
              {actionLoading ? 'Đang xử lý...' : '🔓  Mở khóa tài khoản'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // ── Profile header ──
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarLocked: {
    backgroundColor: '#FEE2E2',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#5392F9',
  },
  avatarTextLocked: {
    color: '#DC2626',
  },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Info card ──
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 50,
  },

  // ── User ID ──
  userId: {
    fontSize: 11,
    color: '#CBD5E1',
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 4,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  btnLock: {
    backgroundColor: '#EF4444',
  },
  btnUnlock: {
    backgroundColor: '#10B981',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },

  // ── States ──
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  loadingText: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 4,
  },
  notFoundText: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 32,
  },
  retryBtn: {
    backgroundColor: '#5392F9',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
