import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { ChevronLeft, Search, Users } from 'lucide-react-native';
import { adminApi, AdminUserDto } from '../../src/shared/api/adminApi';
import { router, Stack, useFocusEffect } from 'expo-router';

// ─── Types & Constants ───────────────────────────────────────────────
type FilterType = 'all' | 'Customer' | 'Host' | 'Admin' | 'locked';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',      label: 'Tất cả'   },
  { key: 'Customer', label: 'Customer' },
  { key: 'Host',     label: 'Host'     },
  { key: 'Admin',    label: 'Admin'    },
  { key: 'locked',   label: 'Bị khóa' },
];

// ─── Helpers ─────────────────────────────────────────────────────────

/** Badge màu cho từng Role */
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

/** Format ngày vi-VN */
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

/** Lấy chữ cái đầu cho avatar */
const getInitial = (user: AdminUserDto) => {
  if (user.fullName) return user.fullName.trim()[0].toUpperCase();
  if (user.email)    return user.email[0].toUpperCase();
  return '?';
};

// ─── Component ───────────────────────────────────────────────────────
export default function UsersScreen() {
  const [users,     setUsers]    = useState<AdminUserDto[]>([]);
  const [loading,   setLoading]  = useState(false);
  const [error,     setError]    = useState<string | null>(null);
  const [search,    setSearch]   = useState('');
  const [filter,    setFilter]   = useState<FilterType>('all');

  // ── Data loading ─────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getAllUsers();
      if (result.isSuccess) {
        setUsers(result.data || []);
      } else {
        setError(result.message || 'Không tải được danh sách người dùng');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  // ── Search + Filter (local) ───────────────────────────────────────
  const displayUsers = useMemo(() => {
    let list = [...users];

    // Filter theo role / bị khóa
    if (filter === 'locked') {
      list = list.filter((u) => !u.isActive);
    } else if (filter !== 'all') {
      list = list.filter((u) => u.role === filter);
    }

    // Search theo fullName / email / phoneNumber
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phoneNumber?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [users, filter, search]);

  // ── Render user card ─────────────────────────────────────────────
  const renderItem = ({ item }: { item: AdminUserDto }) => {
    const roleBadge = getRoleBadge(item.role);
    const initial   = getInitial(item);

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
        onPress={() => router.push(`/admin/user-detail?id=${item.id}`)}
      >
        {/* Avatar */}
        <View style={[styles.avatar, !item.isActive && styles.avatarLocked]}>
          <Text style={[styles.avatarText, !item.isActive && styles.avatarTextLocked]}>
            {initial}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.fullName} numberOfLines={1}>
            {item.fullName || 'Chưa có tên'}
          </Text>

          {item.email ? (
            <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
          ) : null}

          {item.phoneNumber ? (
            <Text style={styles.phone}>{item.phoneNumber}</Text>
          ) : null}

          {item.createdAt ? (
            <Text style={styles.date}>Tạo: {formatDate(item.createdAt)}</Text>
          ) : null}
        </View>

        {/* Badges (right column) */}
        <View style={styles.badgesCol}>
          {/* Role badge */}
          <View style={[styles.badge, { backgroundColor: roleBadge.bg }]}>
            <Text style={[styles.badgeText, { color: roleBadge.color }]}>
              {roleBadge.label}
            </Text>
          </View>

          {/* Status badge */}
          <View style={[
            styles.badge,
            { backgroundColor: item.isActive ? '#DCFCE7' : '#FEE2E2', marginTop: 6 },
          ]}>
            <Text style={[
              styles.badgeText,
              { color: item.isActive ? '#166534' : '#991B1B' },
            ]}>
              {item.isActive ? 'Hoạt động' : 'Bị khóa'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // ── Body states ──────────────────────────────────────────────────
  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5392F9" />
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadUsers}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={displayUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadUsers}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Users size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>
              {search || filter !== 'all'
                ? 'Không tìm thấy người dùng nào'
                : 'Chưa có người dùng'}
            </Text>
          </View>
        }
      />
    );
  };

  // ── Main render ──────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Quản lý người dùng',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <Search size={16} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên, email, số điện thoại..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count label */}
      {!loading && !error && (
        <Text style={styles.countLabel}>
          {displayUsers.length} người dùng
          {filter !== 'all' || search ? ' (đã lọc)' : ''}
        </Text>
      )}

      {renderBody()}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // ── Search ──
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#111827',
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    color: '#94A3B8',
  },

  // ── Filter chips ──
  filterScroll: {
    marginTop: 10,
    marginBottom: 4,
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 18,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // ── Count label ──
  countLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginHorizontal: 16,
    marginBottom: 8,
  },

  // ── List ──
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ── Card ──
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarLocked: {
    backgroundColor: '#FEE2E2',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5392F9',
  },
  avatarTextLocked: {
    color: '#DC2626',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  fullName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: '#4B5563',
  },
  phone: {
    fontSize: 12,
    color: '#6B7280',
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  badgesCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
    flexShrink: 0,
  },

  // ── Badges ──
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── States ──
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
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
