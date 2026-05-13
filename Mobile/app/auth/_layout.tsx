// app/auth/_layout.tsx
// AuthStack: chứa Login, Register, ForgotPassword
// Người dùng đã đăng nhập sẽ bị redirect ra ngoài bởi root _layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: 'Đăng nhập' }} />
      <Stack.Screen name="register" options={{ title: 'Đăng ký' }} />
      <Stack.Screen name="ForgotPassword" options={{ title: 'Quên mật khẩu' }} />
    </Stack>
  );
}
