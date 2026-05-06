import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../shared/components/AppCard';
import { AppButton } from '../../shared/components/AppButton';
import { colors } from '../../shared/constants/colors';
import { ownerReviewsMockData } from './ownerMockData';
import type { ReviewFilter, OwnerReview } from './ownerTypes';

export function OwnerReviewListScreen() {
  const router = useRouter();
  const { hotelId } = useLocalSearchParams<{ hotelId?: string }>();
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [reviews, setReviews] = useState<OwnerReview[]>(
    hotelId ? ownerReviewsMockData.filter(r => r.hotelId === hotelId) : ownerReviewsMockData
  );
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const filters: { id: ReviewFilter; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: '5_star', label: '5 sao' },
    { id: '4_star', label: '4 sao' },
    { id: 'under_4_star', label: 'Dưới 4 sao' },
    { id: 'unreplied', label: 'Chưa phản hồi' },
  ];

  const filteredReviews = reviews.filter((r) => {
    if (filter === '5_star') return r.rating === 5;
    if (filter === '4_star') return r.rating === 4;
    if (filter === 'under_4_star') return r.rating < 4;
    if (filter === 'unreplied') return !r.reply;
    return true;
  });

  const handleSendReply = (id: string) => {
    const text = replyText[id]?.trim();
    if (!text) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung phản hồi.');
      return;
    }
    
    // Update state to mock sending reply
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: text } : r));
    setReplyingTo(null);
    Alert.alert('Thành công', 'Đã gửi phản hồi đánh giá.');
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Ionicons
            key={s}
            name={s <= rating ? 'star' : 'star-outline'}
            size={14}
            color="#F59E0B"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Đánh giá của khách</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.description}>
            Theo dõi phản hồi của khách hàng về khách sạn.
          </Text>
        </View>

        {/* KPI Row */}
        <View style={styles.kpiRow}>
          <AppCard style={styles.kpiCard}>
            <Text style={styles.kpiValue}>4.7</Text>
            <Text style={styles.kpiLabel}>Đánh giá TB</Text>
          </AppCard>
          <AppCard style={styles.kpiCard}>
            <Text style={styles.kpiValue}>86</Text>
            <Text style={styles.kpiLabel}>Tổng đánh giá</Text>
          </AppCard>
          <AppCard style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.warning }]}>1</Text>
            <Text style={styles.kpiLabel}>Đánh giá mới</Text>
          </AppCard>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((f) => {
            const isActive = filter === f.id;
            return (
              <Pressable
                key={f.id}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setFilter(f.id)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Review List */}
        <View style={styles.listContainer}>
          {filteredReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>Không có đánh giá nào.</Text>
            </View>
          ) : (
            filteredReviews.map((review) => (
              <AppCard key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.customerInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{review.customerName.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.customerName}>{review.customerName}</Text>
                      <Text style={styles.dateText}>{review.date}</Text>
                    </View>
                  </View>
                  {renderStars(review.rating)}
                </View>

                <View style={styles.hotelInfo}>
                  <Ionicons name="business-outline" size={14} color={colors.muted} />
                  <Text style={styles.hotelNameText}>
                    {review.hotelName} {review.roomType ? `· ${review.roomType}` : ''}
                  </Text>
                </View>

                <Text style={styles.contentText}>{review.content}</Text>

                <View style={styles.divider} />

                {review.reply ? (
                  <View style={styles.replyBox}>
                    <Text style={styles.replyLabel}>Phản hồi của bạn:</Text>
                    <Text style={styles.replyText}>{review.reply}</Text>
                  </View>
                ) : (
                  <View style={styles.unrepliedBox}>
                    <Text style={styles.unrepliedText}>Chưa phản hồi</Text>
                    
                    {replyingTo === review.id ? (
                      <View style={styles.replyInputContainer}>
                        <TextInput
                          style={styles.replyInput}
                          placeholder="Nhập nội dung phản hồi..."
                          multiline
                          value={replyText[review.id] || ''}
                          onChangeText={(t) => setReplyText({ ...replyText, [review.id]: t })}
                        />
                        <View style={styles.replyActions}>
                          <AppButton 
                            title="Hủy" 
                            variant="outline" 
                            style={styles.replyCancelBtn} 
                            onPress={() => setReplyingTo(null)} 
                          />
                          <AppButton 
                            title="Gửi phản hồi" 
                            style={styles.replySendBtn} 
                            onPress={() => handleSendReply(review.id)} 
                          />
                        </View>
                      </View>
                    ) : (
                      <Pressable style={styles.replyBtn} onPress={() => setReplyingTo(review.id)}>
                        <Ionicons name="arrow-undo-outline" size={16} color={colors.primary} />
                        <Text style={styles.replyBtnText}>Phản hồi</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </AppCard>
            ))
          )}
        </View>
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
  introSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.textLight,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.muted,
  },
  reviewCard: {
    marginBottom: 16,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '700',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  hotelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  hotelNameText: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
  },
  contentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  replyBox: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  replyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  replyText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  unrepliedBox: {
    alignItems: 'flex-start',
  },
  unrepliedText: {
    fontSize: 13,
    color: colors.warning,
    fontWeight: '500',
    marginBottom: 12,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  replyBtnText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  replyInputContainer: {
    width: '100%',
  },
  replyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  replyCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  replySendBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
