import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../shared/components/AppCard';
import { colors } from '../../shared/constants/colors';
import { ownerNotificationsMockData } from './ownerMockData';
import type { NotificationFilter, OwnerNotification, NotificationType } from './ownerTypes';

const typeMap: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }> = {
  booking: { icon: 'calendar-outline', bg: '#E0F2FE', color: '#0284C7' },
  review: { icon: 'star-outline', bg: '#FEF3C7', color: '#D97706' },
  hotel: { icon: 'business-outline', bg: '#DCFCE7', color: '#16A34A' },
  promotion: { icon: 'pricetag-outline', bg: '#FCE7F3', color: '#DB2777' },
  system: { icon: 'information-circle-outline', bg: '#F3F4F6', color: '#4B5563' },
};

export function OwnerNotificationScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [notifications, setNotifications] = useState<OwnerNotification[]>(ownerNotificationsMockData);

  const filters: { id: NotificationFilter; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'unread', label: 'Chưa đọc' },
    { id: 'booking', label: 'Đơn đặt' },
    { id: 'hotel', label: 'Khách sạn' },
    { id: 'review', label: 'Đánh giá' },
    { id: 'system', label: 'Hệ thống' },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handlePress = (notif: OwnerNotification) => {
    // Mark as read
    if (!notif.isRead) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    }

    // Navigate
    switch (notif.type) {
      case 'booking':
        router.push('/owner/bookings');
        break;
      case 'review':
        router.push('/owner/reviews');
        break;
      case 'promotion':
        router.push('/owner/promotions');
        break;
      case 'hotel':
        if (notif.dataId) {
          router.push(`/owner/hotel-detail?id=${notif.dataId}`);
        } else {
          router.push('/owner/hotels');
        }
        break;
      case 'system':
      default:
        break;
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.description}>
            Theo dõi các cập nhật quan trọng về khách sạn và đơn đặt phòng.
          </Text>
          <Pressable style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
            <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
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
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>Không có thông báo nào.</Text>
            </View>
          ) : (
            filteredNotifications.map((notif) => {
              const typeInfo = typeMap[notif.type] || typeMap.system;
              return (
                <Pressable key={notif.id} onPress={() => handlePress(notif)}>
                  <AppCard style={StyleSheet.flatten([styles.notifCard, !notif.isRead && styles.notifCardUnread])}>
                    <View style={styles.cardHeader}>
                      <View style={styles.headerLeft}>
                        <View style={[styles.iconBox, { backgroundColor: typeInfo.bg }]}>
                          <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
                        </View>
                        <Text style={[styles.notifTitle, !notif.isRead && styles.notifTitleUnread]}>
                          {notif.title}
                        </Text>
                      </View>
                      <View style={styles.headerRight}>
                        <Text style={styles.dateText}>{notif.date}</Text>
                        {!notif.isRead && <View style={styles.unreadDot} />}
                      </View>
                    </View>
                    <Text style={styles.notifMessage}>{notif.message}</Text>
                  </AppCard>
                </Pressable>
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
    marginBottom: 12,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
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
  notifCard: {
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  notifCardUnread: {
    backgroundColor: '#F8FAFC',
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  notifTitleUnread: {
    color: colors.primaryDark,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  notifMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    paddingLeft: 48, // 36(icon) + 12(gap)
  },
});
