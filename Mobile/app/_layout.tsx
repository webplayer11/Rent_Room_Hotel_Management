import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GlobalConfirmModal } from "../src/shared/components/GlobalConfirmModal";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast topOffset={60} />
      <GlobalConfirmModal />
    </SafeAreaProvider>
  );
}