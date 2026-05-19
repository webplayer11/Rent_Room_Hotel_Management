import React from 'react';
import { StyleSheet, ScrollView, View, RefreshControl, StatusBar } from 'react-native';
import { HomeHeader } from '../components/HomeHeader';
import { HotelSwitcher } from '../components/HotelSwitcher';
import { DashboardStats } from '../components/DashboardStats';
import { RoomStatus } from '../components/RoomStatus';
import { RecentBookings } from '../components/RecentBookings';
import { QuickActions } from '../components/QuickActions';
import { FloatingActionButton } from '../components/FloatingActionButton';

export default function OwnerHome() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        <HomeHeader hostName="Thành Đạt" />
        <HotelSwitcher currentHotel="Sun Hotel" />
        <DashboardStats />
        <RoomStatus />
        <QuickActions />
        <RecentBookings />
      </ScrollView>
      <FloatingActionButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background to make cards pop nicely
  },
  content: {
    padding: 16,
    paddingTop: 60, // Space for status bar if not handled by safe area
    paddingBottom: 100, // Space for fab and bottom nav
  }
});