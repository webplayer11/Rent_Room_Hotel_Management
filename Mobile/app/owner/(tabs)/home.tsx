import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import axios from 'axios';
import { HomeHeader } from '../components/HomeHeader';
import { HotelSwitcher } from '../components/HotelSwitcher';
import { DashboardStats } from '../components/DashboardStats';
import { RoomStatus } from '../components/RoomStatus';
import { RecentBookings } from '../components/RecentBookings';
import { QuickActions } from '../components/QuickActions';
import { hotelApi } from '../../../src/shared/api/hotelApi';
import { tokenStorage } from '../../../src/shared/storage/tokenStorage';
import { apiFetch } from '../../../src/shared/api/apiClient';

export default function OwnerHome() {
  const [refreshing, setRefreshing] = useState(false);
  const [hostName, setHostName] = useState('');
  const [currentHotel, setCurrentHotel] = useState('Đang tải...');
  const [stats, setStats] = useState({
    bookingsToday: 0,
    revenueThisMonth: 0,
    emptyRooms: 0,
    occupiedRooms: 0,
  });

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
      let selectedHotelId = undefined;
      if (res.isSuccess && res.data && res.data.length > 0) {
        setCurrentHotel(res.data[0].name || 'Khách sạn của bạn');
        selectedHotelId = res.data[0].id;
      } else {
        setCurrentHotel('Chưa có khách sạn');
      }

      // 3. Fetch Dashboard Stats
      try {
        const accessToken = await tokenStorage.getAccessToken();
        const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
        const statsRes = await axios.get(`${apiUrl}/api/hosts/revenue/dashboard`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (statsRes.data?.isSuccess && statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.log('Error fetching dashboard stats:', err);
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
    <SafeAreaView style={styles.safeArea}>
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
        <DashboardStats {...stats} />
        <RoomStatus />
        <QuickActions />
        <RecentBookings />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  }
});