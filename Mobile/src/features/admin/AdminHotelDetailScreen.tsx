import React, { useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../shared/components/AppCard';
import { AppButton } from '../../shared/components/AppButton';
import { colors } from '../../shared/constants/colors';
import { adminHotelsMockData } from './adminMockData';
import type { AdminHotelStatus } from './adminTypes';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const statusConfig: Record<AdminHotelStatus, { label: string; bg: string; fg: string }> = {
  approved: { label: 'Đã duyệt', bg: '#DCFCE7', fg: '#16A34A' },
  pending: { label: 'Chờ duyệt', bg: '#FEF3C7', fg: '#B45309' },
  need_update: { label: 'Cần bổ sung', bg: '#FFEDD5', fg: '#C2410C' },
  rejected: { label: 'Từ chối', bg: '#FEE2E2', fg: '#DC2626' },
  blocked: { label: 'Bị khóa', bg: '#F3F4F6', fg: '#374151' },
};

const docTypeLabel: Record<string, string> = {
  business_license: 'Giấy phép kinh doanh',
  property_cert: 'Giấy chứng nhận tài sản',
  id_card: 'CCCD người đại diện',
  other: 'Giấy tờ khác',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminHotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const hotelIndex = adminHotelsMockData.findIndex((h) => h.id === id);
  const [hotels, setHotels] = useState([...adminHotelsMockData]);
  const hotel = hotels[hotelIndex];

  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState<'update_request' | 'reject' | null>(null);

  if (!hotel) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy khách sạn.</Text>
        <AppButton title="Quay lại" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const st = statusConfig[hotel.status];

  // Mutate mock data in-place + refresh local state
  function updateStatus(newStatus: AdminHotelStatus, extra?: Partial<typeof hotel>) {
    adminHotelsMockData[hotelIndex] = { ...adminHotelsMockData[hotelIndex], status: newStatus, ...extra };
    setHotels([...adminHotelsMockData]);
  }

  function handleApprove() {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn duyệt khách sạn này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Duyệt',
        onPress: () => {
          updateStatus('approved');
          Alert.alert('Thành công', 'Đã duyệt khách sạn.');
        },
      },
    ]);
  }

  function handleRequestUpdate() {
    if (!noteInput.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do cần bổ sung.');
      return;
    }
    updateStatus('need_update', { adminNote: noteInput.trim() });
    setNoteInput('');
    setShowNoteInput(null);
    Alert.alert('Đã gửi', 'Đã gửi yêu cầu bổ sung hồ sơ.');
  }

  function handleReject() {
    if (!noteInput.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối.');
      return;
    }
    updateStatus('rejected', { rejectionReason: noteInput.trim() });
    setNoteInput('');
    setShowNoteInput(null);
    Alert.alert('Đã từ chối', 'Đã từ chối hồ sơ khách sạn.');
  }

  function handleBlock() {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn tạm khóa khách sạn này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Tạm khóa',
        style: 'destructive',
        onPress: () => {
          updateStatus('blocked');
          Alert.alert('Đã khóa', 'Đã tạm khóa khách sạn.');
        },
      },
    ]);
  }

  function handleUnblock() {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn mở khóa khách sạn này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Mở khóa',
        onPress: () => {
          updateStatus('approved');
          Alert.alert('Đã mở khóa', 'Đã mở khóa khách sạn.');
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/admin/hotels'); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết khách sạn</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ===== HOTEL INFO ===== */}
        <AppCard style={styles.section}>
          {/* Thumbnail placeholder */}
          <View style={styles.thumbnail}>
            <Ionicons name="business" size={40} color={colors.primary} style={{ opacity: 0.4 }} />
          </View>

          <View style={styles.hotelTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <View style={styles.rowGap}>
                <Ionicons name="location-outline" size={13} color={colors.muted} />
                <Text style={styles.metaText}>{hotel.address}</Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: st.bg }]}>
              <Text style={[styles.badgeText, { color: st.fg }]}>{st.label}</Text>
            </View>
          </View>

          {hotel.description && (
            <Text style={styles.description}>{hotel.description}</Text>
          )}

          <View style={styles.dateMeta}>
            <Text style={styles.metaText}>Đăng ký: {hotel.submittedAt}</Text>
            {hotel.updatedAt && <Text style={styles.metaText}>Cập nhật: {hotel.updatedAt}</Text>}
          </View>
        </AppCard>

        {/* ===== BUSINESS INFO ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin doanh nghiệp</Text>
          <InfoRow icon="business-outline" label="Doanh nghiệp" value={hotel.business.companyName} />
          <InfoRow icon="person-outline" label="Đại diện" value={hotel.business.representativeName} />
          <InfoRow icon="mail-outline" label="Email" value={hotel.business.email} />
          <InfoRow icon="call-outline" label="Điện thoại" value={hotel.business.phone} />
          {hotel.business.taxId && <InfoRow icon="card-outline" label="Mã số thuế" value={hotel.business.taxId} />}
        </AppCard>

        {/* ===== LEGAL DOCUMENTS ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Giấy tờ pháp lý</Text>
          {hotel.legalDocuments.map((doc) => (
            <View key={doc.id} style={styles.docRow}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docType}>{docTypeLabel[doc.type] ?? doc.type}</Text>
                <Text style={styles.docFile}>{doc.fileName}</Text>
              </View>
              <Pressable
                style={styles.viewFileBtn}
                onPress={() => Alert.alert('Xem file', 'Tính năng xem file sẽ được xử lý khi nối backend.')}
              >
                <Text style={styles.viewFileBtnText}>Xem file</Text>
              </Pressable>
            </View>
          ))}
        </AppCard>

        {/* ===== STATUS HISTORY ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử trạng thái</Text>
          {hotel.statusHistory.map((h, idx) => (
            <View key={h.id} style={styles.historyRow}>
              <View style={styles.historyDot}>
                <View style={[styles.dot, { backgroundColor: h.actor === 'admin' ? colors.primary : colors.success }]} />
                {idx < hotel.statusHistory.length - 1 && <View style={styles.historyLine} />}
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyDate}>{h.date}</Text>
                <Text style={styles.historyAction}>{h.action}</Text>
                {h.note && <Text style={styles.historyNote}>{h.note}</Text>}
              </View>
            </View>
          ))}
        </AppCard>

        {/* ===== METRICS (approved/blocked only) ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Số liệu hoạt động</Text>
          {hotel.metrics ? (
            <View style={styles.metricsGrid}>
              <MetricCell label="Tổng đơn" value={String(hotel.metrics.totalBookings)} />
              <MetricCell label="Tỷ lệ hủy" value={hotel.metrics.cancellationRate} />
              <MetricCell label="Đánh giá" value={`${hotel.metrics.averageRating}/5`} />
              <MetricCell label="Doanh thu gần đây" value={hotel.metrics.recentRevenue} />
            </View>
          ) : (
            <Text style={styles.noMetrics}>
              Khách sạn chưa hoạt động chính thức nên chưa có số liệu.
            </Text>
          )}
        </AppCard>

        {/* ===== ACTIONS ===== */}
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động</Text>

          {/* PENDING */}
          {hotel.status === 'pending' && (
            <>
              <AppButton title="Duyệt khách sạn" onPress={handleApprove} style={{ marginBottom: 10 }} />
              <AppButton
                title={showNoteInput === 'update_request' ? 'Hủy yêu cầu bổ sung' : 'Yêu cầu bổ sung hồ sơ'}
                variant="outline"
                style={{ marginBottom: 10 }}
                onPress={() => { setShowNoteInput(showNoteInput === 'update_request' ? null : 'update_request'); setNoteInput(''); }}
              />
              {showNoteInput === 'update_request' && (
                <NoteInputBlock
                  value={noteInput}
                  onChange={setNoteInput}
                  placeholder="Nhập lý do cần bổ sung..."
                  onSubmit={handleRequestUpdate}
                  submitLabel="Gửi yêu cầu bổ sung"
                />
              )}
              <AppButton
                title={showNoteInput === 'reject' ? 'Hủy từ chối' : 'Từ chối hồ sơ'}
                variant="outline"
                onPress={() => { setShowNoteInput(showNoteInput === 'reject' ? null : 'reject'); setNoteInput(''); }}
              />
              {showNoteInput === 'reject' && (
                <NoteInputBlock
                  value={noteInput}
                  onChange={setNoteInput}
                  placeholder="Nhập lý do từ chối..."
                  onSubmit={handleReject}
                  submitLabel="Xác nhận từ chối"
                  danger
                />
              )}
            </>
          )}

          {/* APPROVED */}
          {hotel.status === 'approved' && (
            <>
              <View style={styles.statusInfo}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={[styles.statusInfoText, { color: colors.success }]}>
                  Khách sạn đã được duyệt và đang hoạt động.
                </Text>
              </View>
              <AppButton title="Tạm khóa khách sạn" variant="outline" onPress={handleBlock} style={{ marginTop: 12 }} />
            </>
          )}

          {/* NEED_UPDATE */}
          {hotel.status === 'need_update' && (
            <>
              <View style={styles.statusInfo}>
                <Ionicons name="time-outline" size={18} color="#C2410C" />
                <Text style={[styles.statusInfoText, { color: '#C2410C' }]}>
                  Đang chờ Owner bổ sung hồ sơ.
                </Text>
              </View>
              {hotel.adminNote && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteBoxLabel}>Yêu cầu bổ sung:</Text>
                  <Text style={styles.noteBoxText}>{hotel.adminNote}</Text>
                </View>
              )}
              <AppButton
                title={showNoteInput === 'update_request' ? 'Hủy' : 'Cập nhật yêu cầu bổ sung'}
                variant="outline"
                style={{ marginTop: 12, marginBottom: 10 }}
                onPress={() => { setShowNoteInput(showNoteInput === 'update_request' ? null : 'update_request'); setNoteInput(hotel.adminNote ?? ''); }}
              />
              {showNoteInput === 'update_request' && (
                <NoteInputBlock
                  value={noteInput}
                  onChange={setNoteInput}
                  placeholder="Nhập yêu cầu bổ sung mới..."
                  onSubmit={handleRequestUpdate}
                  submitLabel="Lưu yêu cầu"
                />
              )}
              <AppButton
                title={showNoteInput === 'reject' ? 'Hủy từ chối' : 'Từ chối hồ sơ'}
                variant="outline"
                onPress={() => { setShowNoteInput(showNoteInput === 'reject' ? null : 'reject'); setNoteInput(''); }}
              />
              {showNoteInput === 'reject' && (
                <NoteInputBlock
                  value={noteInput}
                  onChange={setNoteInput}
                  placeholder="Nhập lý do từ chối..."
                  onSubmit={handleReject}
                  submitLabel="Xác nhận từ chối"
                  danger
                />
              )}
            </>
          )}

          {/* REJECTED */}
          {hotel.status === 'rejected' && (
            <>
              <View style={styles.statusInfo}>
                <Ionicons name="close-circle" size={18} color={colors.danger} />
                <Text style={[styles.statusInfoText, { color: colors.danger }]}>Hồ sơ khách sạn đã bị từ chối.</Text>
              </View>
              {hotel.rejectionReason && (
                <View style={[styles.noteBox, { borderLeftColor: colors.danger }]}>
                  <Text style={styles.noteBoxLabel}>Lý do từ chối:</Text>
                  <Text style={styles.noteBoxText}>{hotel.rejectionReason}</Text>
                </View>
              )}
              <AppButton title="Quay lại danh sách" variant="outline" onPress={() => router.replace('/admin/hotels')} style={{ marginTop: 12 }} />
            </>
          )}

          {/* BLOCKED */}
          {hotel.status === 'blocked' && (
            <>
              <View style={styles.statusInfo}>
                <Ionicons name="lock-closed" size={18} color="#374151" />
                <Text style={[styles.statusInfoText, { color: '#374151' }]}>Khách sạn đang bị khóa.</Text>
              </View>
              <AppButton title="Mở khóa khách sạn" onPress={handleUnblock} style={{ marginTop: 12 }} />
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
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCell}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function NoteInputBlock({
  value, onChange, placeholder, onSubmit, submitLabel, danger,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  onSubmit: () => void; submitLabel: string; danger?: boolean;
}) {
  return (
    <View style={styles.noteInputWrap}>
      <TextInput
        style={styles.noteInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      <AppButton
        title={submitLabel}
        onPress={onSubmit}
        style={{ marginTop: 8, ...(danger ? { backgroundColor: colors.danger } : {}) }}
      />
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

  thumbnail: {
    width: '100%', height: 120, backgroundColor: '#EFF6FF',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  hotelTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  hotelName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  description: { fontSize: 13, color: colors.muted, lineHeight: 19, marginBottom: 10 },
  dateMeta: { flexDirection: 'row', gap: 16 },
  metaText: { fontSize: 12, color: colors.muted },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, color: colors.muted, width: 90 },
  infoValue: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '500' },

  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  docName: { fontSize: 13, fontWeight: '600', color: colors.text },
  docType: { fontSize: 11, color: colors.muted, marginTop: 1 },
  docFile: { fontSize: 11, color: colors.primary, marginTop: 2 },
  viewFileBtn: {
    paddingVertical: 5, paddingHorizontal: 10,
    backgroundColor: '#EFF6FF', borderRadius: 8,
    borderWidth: 1, borderColor: colors.primary,
  },
  viewFileBtnText: { fontSize: 12, color: colors.primary, fontWeight: '600' },

  historyRow: { flexDirection: 'row', marginBottom: 0 },
  historyDot: { width: 24, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  historyLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  historyContent: { flex: 1, paddingBottom: 14, paddingLeft: 8 },
  historyDate: { fontSize: 11, color: colors.muted, marginBottom: 2 },
  historyAction: { fontSize: 13, color: colors.text, fontWeight: '600' },
  historyNote: { fontSize: 12, color: colors.muted, marginTop: 3, fontStyle: 'italic' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCell: {
    width: '46%', backgroundColor: colors.background,
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  metricValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  metricLabel: { fontSize: 12, color: colors.muted, marginTop: 4, textAlign: 'center' },
  noMetrics: { fontSize: 13, color: colors.muted, lineHeight: 19, fontStyle: 'italic' },

  statusInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusInfoText: { fontSize: 14, fontWeight: '600' },

  noteBox: {
    marginTop: 12, padding: 12, backgroundColor: '#FFF7ED',
    borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#C2410C',
  },
  noteBoxLabel: { fontSize: 12, color: colors.muted, marginBottom: 4, fontWeight: '600' },
  noteBoxText: { fontSize: 13, color: colors.text, lineHeight: 19 },

  noteInputWrap: { marginTop: 12 },
  noteInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    padding: 12, fontSize: 14, color: colors.text,
    backgroundColor: colors.surface, minHeight: 80,
  },
});
