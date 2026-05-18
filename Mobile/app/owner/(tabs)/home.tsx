// app/owner/home.tsx

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OwnerHomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>DN</Text>
            </View>

            <View>
              <Text style={styles.hello}>Xin chào</Text>
              <Text style={styles.name}>Chủ doanh nghiệp</Text>
            </View>
          </View>

          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Quản lý cơ sở lưu trú</Text>
            <Text style={styles.bannerSub}>
              Theo dõi khách sạn, phòng, đơn đặt và doanh thu của bạn.
            </Text>

            <Pressable
              style={styles.bannerButton}
              onPress={() => router.push('/owner/hotel-form')}
            >
              <Text style={styles.bannerButtonText}>Thêm khách sạn</Text>
            </Pressable>
          </View>

          <Ionicons name="business-outline" size={72} color="rgba(255,255,255,0.25)" />
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="business-outline" title="Khách sạn" value="0" color="#2563EB" bg="#DBEAFE" />
          <StatCard icon="bed-outline" title="Phòng" value="0" color="#16A34A" bg="#DCFCE7" />
          <StatCard icon="calendar-outline" title="Đơn hôm nay" value="0" color="#F59E0B" bg="#FEF3C7" />
          <StatCard icon="wallet-outline" title="Doanh thu" value="0đ" color="#DC2626" bg="#FEE2E2" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

          <View style={styles.actionGrid}>
            <ActionItem icon="add-circle-outline" label="Thêm KS" onPress={() => router.push('/owner/hotel-form')} />
            <ActionItem icon="business-outline" label="Khách sạn" onPress={() => router.push('/owner/hotels')} />
            <ActionItem icon="bed-outline" label="Phòng" onPress={() => router.push('/owner/rooms')} />
            <ActionItem icon="document-text-outline" label="Đơn đặt" onPress={() => router.push('/owner/bookings')} />
            <ActionItem icon="bar-chart-outline" label="Báo cáo" onPress={() => router.push('/owner/reports')} />
            <ActionItem icon="star-outline" label="Đánh giá" onPress={() => router.push('/owner/reviews')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cần xử lý</Text>

          <MenuRow
            icon="document-text-outline"
            title="Đơn đặt đang chờ xác nhận"
            onPress={() => router.push('/owner/bookings')}
          />

          <MenuRow
            icon="time-outline"
            title="Khách sạn chờ admin duyệt"
            onPress={() => router.push('/owner/hotels')}
          />

          <MenuRow
            icon="star-outline"
            title="Đánh giá mới từ khách hàng"
            onPress={() => router.push('/owner/reviews')}
          />
        </View>

        <View style={styles.emptyCard}>
          <Ionicons name="business-outline" size={60} color="#CBD5E1" />

          <Text style={styles.emptyTitle}>Chưa có dữ liệu kinh doanh</Text>

          <Text style={styles.emptyText}>
            Khi bạn thêm khách sạn, hệ thống sẽ hiển thị đơn đặt, phòng và doanh thu tại đây.
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push('/owner/hotel-form')}
          >
            <Text style={styles.emptyButtonText}>Thêm khách sạn đầu tiên</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, title, value, color, bg }: any) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function ActionItem({ icon, label, onPress }: any) {
  return (
    <Pressable style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={24} color="#2563EB" />
      </View>

      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function MenuRow({ icon, title, onPress }: any) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={20} color="#2563EB" />
      </View>

      <Text style={styles.menuTitle}>{title}</Text>

      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 16,
    paddingTop: 55,
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },

  hello: {
    fontSize: 13,
    color: '#6B7280',
  },

  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  banner: {
    backgroundColor: '#1D4ED8',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  bannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },

  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  bannerButtonText: {
    color: '#1D4ED8',
    fontWeight: '800',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },

  statTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  actionItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 18,
  },

  actionIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 14,
  },

  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },

  emptyButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});