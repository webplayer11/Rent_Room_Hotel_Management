// Mobile/App.tsx — CHỈ ĐỂ CHẠY THỬ, xoá sau khi nhóm có NavigationContainer chung
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/app/auth/LoginScreen';
import RegisterScreen from './src/app/auth/RegisterScreen';
import ForgotPasswordScreen from './src/app/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}