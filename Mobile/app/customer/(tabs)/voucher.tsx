import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, StatusBar, Platform,
  Alert, Clipboard, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import Toast from 'react-native-toast-message';
import { voucherApi, VoucherDto } from '../../../src/shared/api/voucherApi';

type VoucherTab = 'all' | 'system' | 'soon_expired';

const getVoucherStatus = (v: VoucherDto) => {
  const now = new Date();
  const end = parseISO(v.endDate);
  const start = parseISO(v.startDate);
  const remaining = v.usageLimit - v.usedCount;
  if (!v.isActive) return 'inactive';
  if (isBefore(now, start)) return 'upcoming';
  if (isAfter(now, end)) return 'expired';
  if (remaining <= 0) return 'exhausted';
  return 'active';
};

const getDaysUntilExpiry = (endDate: string) => {
  const now = new Date();
  const end = parseISO(endDate);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const VoucherScreen = () => {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<VoucherTab>('all');
  const [searchCode, setSearchCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [validateResult, setValidateResult] = useState<{
    isValid: boolean; message?: string; voucher?: VoucherDto;
  } | null>(null);

  const loadVouchers = useCallback(async () => {
    try {
      const res = await voucherApi.getSystemVouchers();
      if (res.isSuccess && res.data) {
        setVouchers(res.data);
      }
    } catch (e) {
      console.warn('Lỗi tải voucher:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadVouchers(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadVouchers();
  };

  const handleValidate = async () => {
  if (!searchCode.trim()) return;

  setValidating(true);

  try {
    const res = await voucherApi.validateVoucher(
      searchCode.trim().toUpperCase()
    );

    if (res.isSuccess && res.data?.isValid) {
      const voucher = res.data.voucher;

      Toast.show({
        type: 'success',
        text1: 'Voucher hợp lệ',
        text2:
          voucher?.type === 'Percent'
            ? `Giảm ${voucher.discountValue}%`
            : `Giảm ${voucher?.discountValue?.toLocaleString('vi-VN')}₫`,
        position: 'top',
        visibilityTime: 2500,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Voucher không hợp lệ',
        text2: res.message || 'Mã không hợp lệ',
        position: 'top',
      });
    }
  } catch (e: any) {
    Toast.show({
      type: 'error',
      text1: 'Lỗi kiểm tra voucher',
      text2: e.message || 'Có lỗi xảy ra',
      position: 'top',
    });
  } finally {
    setValidating(false);
  }
};

  const handleCopy = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('Đã sao chép', `Mã voucher "${code}" đã được sao chép!`);
  };

  const filteredVouchers = vouchers.filter(v => {
    const status = getVoucherStatus(v);
    if (tab === 'system') return !v.hotelId;
    if (tab === 'soon_expired') {
      const days = getDaysUntilExpiry(v.endDate);
      return status === 'active' && days <= 7 && days >= 0;
    }
    return status === 'active';
  });

  const renderBadge = (v: VoucherDto) => {
    const status = getVoucherStatus(v);
    const days = getDaysUntilExpiry(v.endDate);
    if (status === 'expired') return <View style={[styles.badge, styles.badgeExpired]}><Text style={styles.badgeText}>Hết hạn</Text></View>;
    if (status === 'exhausted') return <View style={[styles.badge, styles.badgeExhausted]}><Text style={styles.badgeText}>Hết lượt</Text></View>;
    if (days <= 3) return <View style={[styles.badge, styles.badgeUrgent]}><Text style={styles.badgeText}>Sắp hết hạn!</Text></View>;
    if (days <= 7) return <View style={[styles.badge, styles.badgeSoon]}><Text style={styles.badgeText}>Hết hạn sau {days} ngày</Text></View>;
    return null;
  };

  const renderVoucher = ({ item }: { item: VoucherDto }) => {
    const isPercent = item.type === 'Percent';
    const remaining = item.usageLimit - item.usedCount;
    const status = getVoucherStatus(item);
    const isDisabled = status !== 'active';
  

    return (
      <View style={[styles.card, isDisabled && styles.cardDisabled]}>
        {/* Left accent */}
        <View style={[styles.cardAccent, isDisabled && styles.cardAccentDisabled]} />

        {/* Notch */}
        <View style={styles.notchTop} />
        <View style={styles.notchBottom} />

        <View style={styles.cardInner}>
          {/* Left: Discount */}
          <View style={styles.discountSide}>
            <Text style={[styles.discountValue, isDisabled && styles.textDisabled]}>
              {isPercent ? `${item.discountValue}%` : `${item.discountValue.toLocaleString('vi-VN')}₫`}
            </Text>
            <Text style={[styles.discountLabel, isDisabled && styles.textDisabled]}>
              {isPercent ? 'Giảm' : 'Tiết kiệm'}
            </Text>
            {item.maxDiscountAmount && isPercent && (
              <Text style={styles.maxDiscount}>
                Tối đa {item.maxDiscountAmount.toLocaleString('vi-VN')}₫
              </Text>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.dividerDot} />
            ))}
          </View>

          {/* Right: Details */}
          <View style={styles.detailSide}>
            <View style={styles.codeRow}>
              <Text style={[styles.code, isDisabled && styles.textDisabled]}>{item.code}</Text>
              {!isDisabled && (
                <TouchableOpacity onPress={() => handleCopy(item.code)} style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={14} color="#5392F9" />
                </TouchableOpacity>
              )}
            </View>

            {renderBadge(item)}

            {item.minOrderAmount && (
              <Text style={styles.condition}>
                Đơn tối thiểu {item.minOrderAmount.toLocaleString('vi-VN')}₫
              </Text>
            )}
            {item.minNights && (
              <Text style={styles.condition}>Tối thiểu {item.minNights} đêm</Text>
            )}

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={11} color="#999" />
              <Text style={styles.metaText}>
                HSD: {format(parseISO(item.endDate), 'dd/MM/yyyy')}
              </Text>
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.usageText}>
                Còn {remaining}/{item.usageLimit} lượt
              </Text>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  { width: `${Math.max(0, (remaining / item.usageLimit) * 100)}%` as any },
                  isDisabled && styles.progressFillDisabled,
                ]} />
              </View>
            </View>

            {!item.hotelId && (
              <View style={styles.systemTag}>
                <MaterialCommunityIcons name="shield-check" size={10} color="#5392F9" />
                <Text style={styles.systemTagText}>Toàn sàn</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voucher của tôi</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search & Validate */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="ticket-percent-outline" size={18} color="#5392F9" />
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập mã voucher..."
            placeholderTextColor="#AAA"
            value={searchCode}
            onChangeText={t => setSearchCode(t)}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={handleValidate}
          />
          {searchCode.length > 0 && (
            <TouchableOpacity onPress={() => setSearchCode('')}>
               <Ionicons name="close-circle" size={18} color="#CCC" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.validateBtn} onPress={handleValidate} disabled={validating}>
          {validating
            ? <ActivityIndicator size="small" color="#FFF" />
            : <Text style={styles.validateText}>Kiểm tra</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {([
          { key: 'all', label: 'Khả dụng' },
          { key: 'system', label: 'Toàn sàn' },
          { key: 'soon_expired', label: 'Sắp hết hạn' },
        ] as { key: VoucherTab; label: string }[]).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5392F9" />
          <Text style={styles.loadingText}>Đang tải voucher...</Text>
        </View>
      ) : filteredVouchers.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="ticket-outline" size={60} color="#DDD" />
          <Text style={styles.emptyTitle}>Không có voucher nào</Text>
          <Text style={styles.emptySubtitle}>Bạn sẽ nhận được voucher ưu đãi tại đây</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVouchers}
          renderItem={renderVoucher}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5392F9']} />}
        />
      )}
      <Toast />
    </SafeAreaView>
  );
};

const ACCENT = '#5392F9';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#222' },

  searchSection: {
    flexDirection: 'row', backgroundColor: '#FFF',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F9FF', borderRadius: 12,
    paddingHorizontal: 12, borderWidth: 1.5, borderColor: '#E8EEFF', gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 10, letterSpacing: 1 },
  validateBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  validateText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  validateResult: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 12, marginTop: 8, padding: 10,
    borderRadius: 10, borderWidth: 1,
  },
  resultSuccess: { backgroundColor: '#F0FFF4', borderColor: '#B2F0D0' },
  resultFail: { backgroundColor: '#FFF0F0', borderColor: '#FFD0D0' },
  resultText: { fontSize: 13, fontWeight: '600', flex: 1 },

  tabs: {
    flexDirection: 'row', backgroundColor: '#FFF',
    marginTop: 10, borderRadius: 12, marginHorizontal: 12,
    padding: 4, elevation: 2, shadowColor: '#000',
    shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  tabItem: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabItemActive: { backgroundColor: ACCENT },
  tabText: { fontSize: 12, color: '#888', fontWeight: '600' },
  tabTextActive: { color: '#FFF' },

  listContent: { padding: 12, gap: 12 },

  card: {
    backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden',
    elevation: 3, shadowColor: '#5392F9',
    shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  cardDisabled: { opacity: 0.55 },
  cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: ACCENT },
  cardAccentDisabled: { backgroundColor: '#CCC' },
  notchTop: {
    position: 'absolute', left: 110, top: -10,
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#F5F7FA',
  },
  notchBottom: {
    position: 'absolute', left: 110, bottom: -10,
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#F5F7FA',
  },
  cardInner: { flexDirection: 'row', paddingVertical: 16, paddingLeft: 16, paddingRight: 12 },

  discountSide: { width: 90, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  discountValue: { fontSize: 26, fontWeight: '800', color: ACCENT, textAlign: 'center' },
  discountLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginTop: 2 },
  maxDiscount: { fontSize: 9, color: '#AAA', textAlign: 'center', marginTop: 4 },

  divider: { width: 1, marginHorizontal: 12, justifyContent: 'space-around', alignItems: 'center' },
  dividerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#E0E7FF', marginVertical: 2 },

  detailSide: { flex: 1 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  code: { fontSize: 15, fontWeight: '800', color: '#222', letterSpacing: 1 },
  copyBtn: {
    backgroundColor: '#EEF3FF', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3,
  },

  badge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 20, marginBottom: 4,
  },
  badgeExpired: { backgroundColor: '#F5F5F5' },
  badgeExhausted: { backgroundColor: '#FFF0F0' },
  badgeUrgent: { backgroundColor: '#FFF0E0' },
  badgeSoon: { backgroundColor: '#FFF8E1' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#555' },

  condition: { fontSize: 11, color: '#666', marginBottom: 4 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  metaText: { fontSize: 11, color: '#999' },

  progressRow: { gap: 3 },
  usageText: { fontSize: 10, color: '#AAA' },
  progressBar: {
    height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },
  progressFillDisabled: { backgroundColor: '#CCC' },

  systemTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    marginTop: 6, alignSelf: 'flex-start',
    backgroundColor: '#EEF3FF', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  systemTagText: { fontSize: 9, color: ACCENT, fontWeight: '700' },

  textDisabled: { color: '#AAA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: '#AAA' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#555', marginTop: 8 },
  emptySubtitle: { fontSize: 13, color: '#AAA', textAlign: 'center', paddingHorizontal: 40 },
});

export default VoucherScreen;
