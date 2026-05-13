// app/customer/_layout.tsx
// CustomerStack: chứa toàn bộ màn hình dành cho khách hàng
// Bảo vệ route: nếu không phải Customer → redirect về đúng Stack
import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function CustomerLayout() {
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

  // Đăng nhập nhưng không phải Customer → về đúng Stack của role
  if (userRole === 'Admin') {
    return <Redirect href="/admin" />;
  }
  if (userRole === 'Owner') {
    return <Redirect href="/owner" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="hotel" options={{ headerShown: false }} />
      <Stack.Screen name="booking" options={{ headerShown: false }} />
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
