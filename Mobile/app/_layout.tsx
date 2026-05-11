import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="customer" options={{ headerShown: false }} />
      {/* Owner tab screens – no animation on tab switch */}
      <Stack.Screen name="owner/index" options={{ animation: 'none' }} />
      <Stack.Screen name="owner/hotels" options={{ animation: 'none' }} />
      <Stack.Screen name="owner/bookings" options={{ animation: 'none' }} />
      <Stack.Screen name="owner/reports" options={{ animation: 'none' }} />
      {/* Admin tab screens – no animation on tab switch */}
      <Stack.Screen name="admin/index" options={{ animation: 'none' }} />
      <Stack.Screen name="admin/hotels" options={{ animation: 'none' }} />
      <Stack.Screen name="admin/accounts" options={{ animation: 'none' }} />
      <Stack.Screen name="admin/reports" options={{ animation: 'none' }} />
    </Stack>
  );
}
