import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton } from '../../shared/components/AppButton';
import { AppCard } from '../../shared/components/AppCard';
import { colors } from '../../shared/constants/colors';
import { ownerDashboardMockData, amenityOptions, ownerReviewsMockData } from './ownerMockData';
import type { HotelStatus } from './ownerTypes';

const hotelStatusMap: Record<HotelStatus, { label: string; bg: string; fg: string }> = {
  approved: { label: 'Đã duyệt', bg: '#DCFCE7', fg: colors.success },
  pending: { label: 'Chờ duyệt', bg: '#FEF3C7', fg: '#B45309' },
  need_update: { label: 'Cần bổ sung', bg: '#FEE2E2', fg: colors.danger },
};

export function OwnerHotelDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const hotel = ownerDashboardMockData.hotels.find((h) => h.id === id);
  const hotelReviews = hotel ? ownerReviewsMockData.filter(r => r.hotelId === hotel.id) : [];
  const totalReviews = hotelReviews.length;

  if (!hotel) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Chi tiết khách sạn</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={60} color={colors.muted} />
          <Text style={styles.emptyText}>Không tìm thấy khách sạn.</Text>
        </View>
      </View>
    );
  }

  const statusInfo = hotelStatusMap[hotel.status];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết khách sạn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 1. Thông tin chính ===== */}
        <AppCard style={styles.section}>
          {hotel.thumbnailUrl ? (
            <Image source={{ uri: hotel.thumbnailUrl }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="business" size={40} color={colors.primary} />
            </View>
          )}

          <View style={styles.mainInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                <Text style={[styles.statusBadgeText, { color: statusInfo.fg }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>
            
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={16} color={colors.muted} />
              <Text style={styles.addressText}>{hotel.address}</Text>
            </View>

            {hotel.description && (
              <Text style={styles.descriptionText}>{hotel.description}</Text>
            )}
          </View>
        </AppCard>

        {/* ===== 2. Thông tin vận hành ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Thông tin vận hành</Text>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Số phòng</Text>
              <Text style={styles.gridValue}>{hotel.roomCount} phòng</Text>
            </View>
            {hotel.rating != null && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Đánh giá</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={[styles.gridValue, { marginLeft: 4 }]}>{hotel.rating}</Text>
                </View>
              </View>
            )}
            {hotel.monthlyBookings != null && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Đơn tháng này</Text>
                <Text style={styles.gridValue}>{hotel.monthlyBookings} đơn</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Nhận phòng từ</Text>
            <Text style={styles.rowValue}>{hotel.checkInTime || '--:--'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Trả phòng trước</Text>
            <Text style={styles.rowValue}>{hotel.checkOutTime || '--:--'}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subTitle}>Tiện nghi</Text>
          {hotel.amenities && hotel.amenities.length > 0 ? (
            <View style={styles.chipGrid}>
              {hotel.amenities.map(amenityId => {
                const label = amenityOptions.find(a => a.id === amenityId)?.label || amenityId;
                return (
                  <View key={amenityId} style={styles.chip}>
                    <Text style={styles.chipText}>{label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyValText}>Chưa cập nhật tiện nghi</Text>
          )}
        </AppCard>

        {/* ===== 3. Giấy tờ pháp lý ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Giấy tờ pháp lý</Text>
          </View>

          <View style={styles.docItem}>
            <Text style={styles.docLabel}>Giấy phép kinh doanh</Text>
            {hotel.businessLicenseFileName ? (
              <View style={styles.docFile}>
                <Ionicons name="document-text" size={16} color={colors.primary} />
                <Text style={styles.docFileName} numberOfLines={1}>{hotel.businessLicenseFileName}</Text>
              </View>
            ) : (
              <Text style={styles.emptyValText}>Chưa tải lên</Text>
            )}
          </View>

          <View style={styles.docItem}>
            <Text style={styles.docLabel}>Giấy chứng nhận quyền sử dụng tài sản</Text>
            {hotel.propertyDocumentFileName ? (
              <View style={styles.docFile}>
                <Ionicons name="document-text" size={16} color={colors.primary} />
                <Text style={styles.docFileName} numberOfLines={1}>{hotel.propertyDocumentFileName}</Text>
              </View>
            ) : (
              <Text style={styles.emptyValText}>Chưa tải lên</Text>
            )}
          </View>
        </AppCard>

        {/* ===== 4. Đánh giá khách hàng ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Đánh giá khách hàng</Text>
          </View>

          {hotelReviews.length > 0 ? (
            <View>
              <View style={styles.reviewSummary}>
                <View style={styles.reviewScoreBox}>
                  <Text style={styles.reviewScore}>{hotel.rating || '4.8'}</Text>
                  <Text style={styles.reviewCount}>({totalReviews} đánh giá)</Text>
                </View>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= Math.round(hotel.rating || 5) ? 'star' : 'star-outline'}
                      size={16}
                      color="#F59E0B"
                    />
                  ))}
                </View>
              </View>

              {hotelReviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.recentReviewItem}>
                  <View style={styles.recentReviewHeader}>
                    <Text style={styles.recentReviewName}>{review.customerName}</Text>
                    <View style={styles.recentReviewStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.recentReviewContent} numberOfLines={2}>
                    {review.content}
                  </Text>
                </View>
              ))}

              <AppButton 
                title="Xem tất cả đánh giá" 
                variant="outline"
                style={{ marginTop: 12 }}
                onPress={() => router.push(`/owner/reviews?hotelId=${hotel.id}`)}
              />
            </View>
          ) : (
            <Text style={styles.emptyValText}>Chưa có đánh giá nào.</Text>
          )}
        </AppCard>

        {/* ===== 5. Ghi chú duyệt & Hành động ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Trạng thái phê duyệt</Text>
          </View>

          <View style={[styles.noteBox, { backgroundColor: statusInfo.bg + '30' }]}>
            <Text style={styles.noteText}>{hotel.approvalNote || 'Chưa có ghi chú.'}</Text>
          </View>

          <View style={styles.actionWrap}>
            {hotel.status === 'approved' && (
              <AppButton 
                title="Quản lý phòng" 
                onPress={() => router.push('/owner/rooms')} 
              />
            )}
            {hotel.status === 'pending' && (
              <AppButton 
                title="Xem trạng thái" 
                variant="outline"
                onPress={() => Alert.alert('Trạng thái', 'Hồ sơ đang được admin kiểm tra. Vui lòng chờ thêm.')} 
              />
            )}
            {hotel.status === 'need_update' && (
              <AppButton 
                title="Bổ sung hồ sơ" 
                onPress={() => router.push('/owner/hotel-form')} 
              />
            )}
          </View>
        </AppCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.muted,
    marginTop: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  coverImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainInfo: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.muted,
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    minWidth: '45%',
  },
  gridLabel: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.text,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 13,
    color: colors.text,
  },
  emptyValText: {
    fontSize: 14,
    color: colors.muted,
    fontStyle: 'italic',
  },
  docItem: {
    marginBottom: 16,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  docFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  docFileName: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  noteBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionWrap: {
    marginTop: 8,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  reviewScoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  reviewScore: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  reviewCount: {
    fontSize: 13,
    color: colors.muted,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  recentReviewItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentReviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  recentReviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  recentReviewContent: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
});
