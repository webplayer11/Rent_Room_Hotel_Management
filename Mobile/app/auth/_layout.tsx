// app/auth/_layout.tsx
// AuthStack: chứa Login, Register, ForgotPassword
// Người dùng đã đăng nhập sẽ bị redirect ra ngoài bởi root _layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}