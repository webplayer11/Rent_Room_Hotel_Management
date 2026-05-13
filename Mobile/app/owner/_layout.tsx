// app/owner/_layout.tsx
// OwnerStack: chứa toàn bộ màn hình dành cho chủ khách sạn
// Bảo vệ route: nếu không phải Owner → redirect về đúng Stack
import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function OwnerLayout() {
  const { userToken, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  if (!userToken) {
    return <Redirect href="/auth/login" />;
  }

  if (userRole !== 'Owner') {
    return <Redirect href={userRole === 'Admin' ? '/admin' : '/customer'} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tab chính - không animation */}
      <Stack.Screen name="index"          options={{ animation: 'none' }} />
      <Stack.Screen name="hotels"         options={{ animation: 'none' }} />
      <Stack.Screen name="bookings"       options={{ animation: 'none' }} />
      <Stack.Screen name="reports"        options={{ animation: 'none' }} />
      <Stack.Screen name="profile"        options={{ animation: 'none' }} />
      {/* Màn hình chi tiết */}
      <Stack.Screen name="hotel-detail"   options={{ title: 'Chi tiết khách sạn' }} />
      <Stack.Screen name="hotel-form"     options={{ title: 'Thêm / Sửa khách sạn' }} />
      <Stack.Screen name="rooms"          options={{ title: 'Danh sách phòng' }} />
      <Stack.Screen name="room-form"      options={{ title: 'Thêm / Sửa phòng' }} />
      <Stack.Screen name="promotions"     options={{ title: 'Khuyến mãi' }} />
      <Stack.Screen name="promotion-form" options={{ title: 'Thêm / Sửa khuyến mãi' }} />
      <Stack.Screen name="reviews"        options={{ title: 'Đánh giá' }} />
      <Stack.Screen name="notifications"  options={{ title: 'Thông báo' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
});
