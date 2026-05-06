import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hotels } from '../../data/hotels';

const HistoryScreen = () => {
  // Mock history data
  const historyData = [
    {
      id: 'h1',
      hotel: hotels[1],
      status: 'Sắp tới',
      dates: '20 thg 5 - 22 thg 5 2026',
      total: 6400000,
    },
    {
      id: 'h2',
      hotel: hotels[2],
      status: 'Đã hoàn thành',
      dates: '10 thg 4 - 12 thg 4 2026',
      total: 4200000,
    },
  ];

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.historyCard}>
      <Image source={{ uri: item.hotel.image }} style={styles.hotelImage} />
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.hotelName} numberOfLines={1}>{item.hotel.name}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'Sắp tới' ? '#E6F4FE' : '#F0F2F5' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'Sắp tới' ? '#5392F9' : '#666' }
            ]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.infoText}>{item.dates}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalValue}>{item.total.toLocaleString('vi-VN')} ₫</Text>
        </View>

        {item.status === 'Sắp tới' && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn đặt của tôi</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Sắp tới</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabText}>Đã hoàn thành</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabText}>Đã hủy</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={historyData}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color="#CCC" />
            <Text style={styles.emptyText}>Bạn chưa có đơn đặt phòng nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#5392F9',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#5392F9',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
  },
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  hotelImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  totalLabel: {
    fontSize: 13,
    color: '#999',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButton: {
    marginTop: 15,
    backgroundColor: '#E6F4FE',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#5392F9',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});

export default HistoryScreen;
