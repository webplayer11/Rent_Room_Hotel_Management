// app/admin/_layout.tsx
// AdminStack: chứa toàn bộ màn hình quản trị viên
// Bảo vệ route: nếu không phải Admin → redirect về auth
import React from 'react';
import { Redirect } from 'expo-router';
import { Stack } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function AdminLayout() {
  const { userToken, userRole, isLoading } = useAuth();

  // Đang restore session
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  // Chưa đăng nhập → về Auth
  if (!userToken) {
    return <Redirect href="/auth/login" />;
  }

  // Đăng nhập nhưng không phải Admin → về đúng Stack của role
  if (userRole !== 'Admin') {
    return <Redirect href={userRole === 'Owner' ? '/owner' : '/customer'} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"          options={{ animation: 'none' }} />
      <Stack.Screen name="hotels"         options={{ animation: 'none' }} />
      <Stack.Screen name="hotel-detail"   options={{ title: 'Chi tiết khách sạn' }} />
      <Stack.Screen name="accounts"       options={{ animation: 'none' }} />
      <Stack.Screen name="account-detail" options={{ title: 'Chi tiết tài khoản' }} />
      <Stack.Screen name="reports"        options={{ animation: 'none' }} />
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
