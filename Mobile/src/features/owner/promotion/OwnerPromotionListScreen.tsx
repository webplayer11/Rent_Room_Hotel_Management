import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../../shared/components/AppCard';
import { colors } from '../../../shared/constants/colors';
import { ownerPromotionsMockData } from '../data/ownerMockData';
import type { PromotionFilter, OwnerPromotion, PromotionStatus } from '../types/ownerTypes';

const statusMap: Record<PromotionStatus, { label: string; bg: string; fg: string }> = {
  active: { label: 'Đang chạy', bg: '#DCFCE7', fg: colors.success },
  upcoming: { label: 'Sắp diễn ra', bg: '#DBEAFE', fg: colors.primary },
  expired: { label: 'Đã hết hạn', bg: '#F3F4F6', fg: colors.muted },
  paused: { label: 'Tạm dừng', bg: '#FEF3C7', fg: '#B45309' },
};

export function OwnerPromotionListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<PromotionFilter>('all');
  const [promotions, setPromotions] = useState<OwnerPromotion[]>(ownerPromotionsMockData);

  const filters: { id: PromotionFilter; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'active', label: 'Đang chạy' },
    { id: 'upcoming', label: 'Sắp diễn ra' },
    { id: 'paused', label: 'Tạm dừng' },
    { id: 'expired', label: 'Đã hết hạn' },
  ];

  const filteredPromotions = promotions.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const toggleStatus = (id: string, currentStatus: PromotionStatus) => {
    let newStatus: PromotionStatus = 'paused';
    if (currentStatus === 'paused') newStatus = 'active';

    setPromotions(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const handleEdit = (id: string) => {
    router.push(`/owner/promotion-form?id=${id}`);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Khuyến mãi</Text>
        <Pressable onPress={() => router.push('/owner/promotion-form')} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.description}>
            Tạo và quản lý mã giảm giá cho khách đặt phòng.
          </Text>
          <Pressable 
            style={styles.createBtn}
            onPress={() => router.push('/owner/promotion-form')}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.textLight} />
            <Text style={styles.createBtnText}>Tạo khuyến mãi mới</Text>
          </Pressable>
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

        {/* List */}
        <View style={styles.listContainer}>
          {filteredPromotions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="ticket-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>Không có khuyến mãi nào.</Text>
            </View>
          ) : (
            filteredPromotions.map((promo) => {
              const statusInfo = statusMap[promo.status];
              return (
                <AppCard key={promo.id} style={styles.promoCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{promo.discountPercent}%</Text>
                      </View>
                      <View>
                        <Text style={styles.promoTitle}>{promo.title}</Text>
                        <Text style={styles.promoCode}>{promo.code}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusText, { color: statusInfo.fg }]}>{statusInfo.label}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={14} color={colors.muted} />
                    <Text style={styles.infoText}>{promo.hotelName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.muted} />
                    <Text style={styles.infoText}>{promo.startDate} - {promo.endDate}</Text>
                  </View>
                  
                  {promo.maxUsage != null ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={14} color={colors.muted} />
                      <Text style={styles.infoText}>
                        Đã dùng: {promo.currentUsage} / {promo.maxUsage}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={14} color={colors.muted} />
                      <Text style={styles.infoText}>
                        Đã dùng: {promo.currentUsage}
                      </Text>
                    </View>
                  )}

                  <View style={styles.divider} />

                  <View style={styles.actionRow}>
                    <Pressable 
                      style={styles.actionBtn} 
                      onPress={() => handleEdit(promo.id)}
                    >
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                      <Text style={styles.actionText}>Chỉnh sửa</Text>
                    </Pressable>
                    
                    {promo.status === 'active' && (
                      <Pressable 
                        style={styles.actionBtn} 
                        onPress={() => toggleStatus(promo.id, promo.status)}
                      >
                        <Ionicons name="pause-circle-outline" size={18} color={'#B45309'} />
                        <Text style={[styles.actionText, { color: '#B45309' }]}>Tạm dừng</Text>
                      </Pressable>
                    )}
                    
                    {promo.status === 'paused' && (
                      <Pressable 
                        style={styles.actionBtn} 
                        onPress={() => toggleStatus(promo.id, promo.status)}
                      >
                        <Ionicons name="play-circle-outline" size={18} color={colors.success} />
                        <Text style={[styles.actionText, { color: colors.success }]}>Kích hoạt</Text>
                      </Pressable>
                    )}
                  </View>
                </AppCard>
              );
            })
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
  addBtn: {
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
    paddingBottom: 16,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 16,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createBtnText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '600',
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
  promoCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discountBadge: {
    backgroundColor: colors.danger,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 14,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  promoCode: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
