// app/_layout.tsx
// Root layout của Expo Router.
// Bọc toàn bộ app trong AuthProvider.
// Việc điều hướng theo role được xử lý tại:
//   - app/index.tsx (entry redirect)
//   - app/auth/_layout.tsx (AuthStack)
//   - app/admin/_layout.tsx (AdminStack + guard)
//   - app/owner/_layout.tsx (OwnerStack + guard)
//   - app/customer/_layout.tsx (CustomerStack + guard)

import React from 'react';
import { Slot } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
