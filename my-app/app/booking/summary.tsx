import { Stack } from 'expo-router';
import BookingSummaryScreen from '../../src/features/booking/BookingSummaryScreen';

export default function BookingSummaryRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BookingSummaryScreen />
    </>
  );
}
