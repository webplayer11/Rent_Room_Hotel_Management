import React, { useRef, useState } from 'react';
import { OwnerDashboardScreen } from './src/app/owner/OwnerDashboardScreen';
import { OwnerHotelFormScreen } from './src/app/owner/OwnerHotelFormScreen';
import { OwnerHotelListScreen } from './src/app/owner/OwnerHotelListScreen';

type Screen = 'dashboard' | 'hotelForm' | 'hotelList';

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

  if (currentScreen === 'hotelList') {
    return (
      <OwnerHotelListScreen
        onAddHotel={goToForm}
        onBack={() => setCurrentScreen('dashboard')}
        onGoHome={() => setCurrentScreen('dashboard')}
      />
    );
  }

  return (
    <OwnerDashboardScreen
      onAddHotel={goToForm}
      onGoHotels={() => setCurrentScreen('hotelList')}
    />
  );
}