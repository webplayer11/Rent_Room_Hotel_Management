import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { tokenStorage } from "../../src/shared/storage/tokenStorage";

export default function BusinessHomeScreen() {
  const logout = async () => {
    await tokenStorage.clearTokens();

    router.replace("/auth/login");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "orange",
        }}
      >
        BUSINESS HOME
      </Text>

      <Pressable
        onPress={logout}
        style={{
          marginTop: 24,
          backgroundColor: "orange",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          Đăng xuất
        </Text>
      </Pressable>
    </View>
  );
}