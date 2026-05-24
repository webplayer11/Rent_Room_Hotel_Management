import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl, StatusBar } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { HomeHeader } from '../components/HomeHeader';
import { HotelSwitcher } from '../components/HotelSwitcher';
import { DashboardStats } from '../components/DashboardStats';
import { RoomStatus } from '../components/RoomStatus';
import { RecentBookings } from '../components/RecentBookings';
import { QuickActions } from '../components/QuickActions';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { hotelApi } from '../../../src/shared/api/hotelApi';
import { tokenStorage } from '../../../src/shared/storage/tokenStorage';
import { apiFetch } from '../../../src/shared/api/apiClient';

export default function OwnerHome() {
  const [refreshing, setRefreshing] = useState(false);
  const [hostName, setHostName] = useState('');
  const [currentHotel, setCurrentHotel] = useState('Đang tải...');

  const loadDashboardData = async () => {
    try {
      // 1. Get host name from secure storage
      let name = await tokenStorage.getFullName();
      
      // If not stored (e.g. older session), fetch dynamically from backend
      if (!name) {
        try {
          const profileRes = await apiFetch<any>('/api/hosts/me');
          if (profileRes.isSuccess && profileRes.data?.fullName) {
            name = profileRes.data.fullName;
            // Cache it in SecureStore
            await tokenStorage.saveTokens(
              await tokenStorage.getAccessToken() || '',
              await tokenStorage.getRefreshToken() || '',
              await tokenStorage.getRole() || '',
            );
          }
        } catch (e) {
          console.log('Error fetching host profile:', e);
        }
      }

      if (name) {
        setHostName(name);
      } else {
        setHostName('Chủ khách sạn');
      }

      // 2. Fetch my hotels from database
      const res = await hotelApi.getMyHotels();
      if (res.isSuccess && res.data && res.data.length > 0) {
        setCurrentHotel(res.data[0].name || 'Khách sạn của bạn');
      } else {
        setCurrentHotel('Chưa có khách sạn');
      }
    } catch (error) {
      console.log('Error loading dashboard data:', error);
      setCurrentHotel('Khách sạn của bạn');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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
        <HomeHeader hostName={hostName} />
        <HotelSwitcher currentHotel={currentHotel} />
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