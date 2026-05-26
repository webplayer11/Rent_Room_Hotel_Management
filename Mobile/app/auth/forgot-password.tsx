import Toast from 'react-native-toast-message';
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { authApi } from "../../src/shared/api/authApi";
import { AppFormInput } from "../../src/shared/components/AppFormInput";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      const res = await authApi.forgotPassword(data.email.trim());

      const token = res.data.resetToken;

      Toast.show({
        type: 'info',
        text1: "Thông báo",
        text2: "Token reset đã được tạo"
      });

      router.push({
        pathname: "/auth/reset-password",
        params: {
          email: data.email.trim(),
          token,
        },
      });
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
        Quên mật khẩu
      </Text>

      <AppFormInput
        control={control}
        name="email"
        placeholder="Nhập email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Pressable onPress={handleSubmit(onSubmit)} style={button}>
        <Text style={buttonText}>Gửi yêu cầu</Text>
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