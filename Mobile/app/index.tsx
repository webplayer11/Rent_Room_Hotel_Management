import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { tokenStorage } from "../src/shared/storage/tokenStorage";

export default function Index() {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await tokenStorage.getAccessToken();

      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const role = await tokenStorage.getRole();

      if (role === "Admin") {
        router.replace("/admin/home");
      } else if (role === "Host") {
        router.replace("/owner/home");
      } else if (role === "Customer") {
        router.replace("/customer/home");
      } else {
        await tokenStorage.clearTokens();
        router.replace("/auth/login");
      }
    } catch {
      await tokenStorage.clearTokens();
      router.replace("/auth/login");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}