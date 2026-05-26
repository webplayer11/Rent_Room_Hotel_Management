import Toast from 'react-native-toast-message';
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { authApi } from "../../src/shared/api/authApi";
import { AppFormInput } from "../../src/shared/components/AppFormInput";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const { email, token } = useLocalSearchParams();

  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      newPassword: "",
    }
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await authApi.resetPassword(
        email as string,
        token as string,
        data.newPassword
      );

      Toast.show({
        type: 'success',
        text1: "Thành công",
        text2: "Đổi mật khẩu thành công"
      });

      router.replace("/auth/login");
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: e.message
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Đặt lại mật khẩu
      </Text>

      <AppFormInput
        control={control}
        name="newPassword"
        placeholder="Mật khẩu mới"
        secureTextEntry
      />

      <Pressable onPress={handleSubmit(onSubmit)} style={button}>
        <Text style={buttonText}>Đổi mật khẩu</Text>
      </Pressable>
    </View>
    </SafeAreaView>
  );
}

const button = {
  backgroundColor: "#8B5A2B",
  padding: 15,
  borderRadius: 12,
  marginTop: 20,
} as const;

const buttonText = {
  color: "#fff",
  textAlign: "center",
  fontWeight: "bold",
} as const;