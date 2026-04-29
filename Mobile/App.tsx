import React, { useRef, useState } from 'react';
import { OwnerBookingListScreen } from './src/app/owner/OwnerBookingListScreen';
import { OwnerDashboardScreen } from './src/app/owner/OwnerDashboardScreen';
import { OwnerHotelFormScreen } from './src/app/owner/OwnerHotelFormScreen';
import { OwnerHotelListScreen } from './src/app/owner/OwnerHotelListScreen';

type Screen = 'dashboard' | 'hotelForm' | 'hotelList' | 'bookings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  // Track where we came from so "back" from Form returns correctly
  const previousScreen = useRef<Screen>('dashboard');

  function goToForm() {
    previousScreen.current = currentScreen;
    setCurrentScreen('hotelForm');
  }

  function goBackFromForm() {
    setCurrentScreen(previousScreen.current);
  }

  if (currentScreen === 'hotelForm') {
    return <OwnerHotelFormScreen onBack={goBackFromForm} />;
  }

  if (currentScreen === 'bookings') {
    return (
      <OwnerBookingListScreen
        onGoHome={() => setCurrentScreen('dashboard')}
        onGoHotels={() => setCurrentScreen('hotelList')}
      />
    );
  }

  if (currentScreen === 'hotelList') {
    return (
      <OwnerHotelListScreen
        onAddHotel={goToForm}
        onBack={() => setCurrentScreen('dashboard')}
        onGoHome={() => setCurrentScreen('dashboard')}
        onGoBookings={() => setCurrentScreen('bookings')}
      />
    );
  }

  return (
    <OwnerDashboardScreen
      onAddHotel={goToForm}
      onGoHotels={() => setCurrentScreen('hotelList')}
      onGoBookings={() => setCurrentScreen('bookings')}
    />
  );
}