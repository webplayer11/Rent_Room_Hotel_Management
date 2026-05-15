import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { tokenStorage } from "../../src/shared/storage/tokenStorage";

export default function AdminHomeScreen() {
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
          color: "red",
        }}
      >
        ADMIN HOME
      </Text>

      <Pressable
        onPress={logout}
        style={{
          marginTop: 24,
          backgroundColor: "red",
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