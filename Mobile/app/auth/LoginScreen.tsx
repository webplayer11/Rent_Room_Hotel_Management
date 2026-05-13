// app/auth/LoginScreen.tsx
// Màn hình Đăng nhập — dùng AuthContext để phân luồng tự động
import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import Colors from '../../shared/constants/colors';
import { useAuth } from '../../src/context/AuthContext';
import { loginApi } from '../../src/shared/api/authApi';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!identifier.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      // Gọi API Backend .NET → trả về { token, role }
      const { token, role } = await loginApi({ identifier, password });

      // signIn() lưu vào AsyncStorage + cập nhật Context
      // → _layout.tsx sẽ tự động render đúng Stack theo role
      // KHÔNG cần navigation.navigate(...)
      await signIn(token, role);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Đăng nhập thất bại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>🏨</Text>
          </View>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Chào mừng bạn quay lại!</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          {/* Email / SĐT */}
          <Text style={styles.label}>Email / Số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email hoặc số điện thoại"
            placeholderTextColor={Colors.textPlaceholder}
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Mật khẩu */}
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Nhập mật khẩu"
              placeholderTextColor={Colors.textPlaceholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowPass(p => !p)}
            >
              <Text style={styles.eyeLabel}>{showPass ? 'Ẩn' : 'Hiện'}</Text>
            </Pressable>
          </View>

          {/* Quên mật khẩu — dùng Expo Router Link */}
          <Link href="/auth/ForgotPassword" asChild>
            <Pressable style={styles.forgotWrapper}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </Pressable>
          </Link>

          {/* Nút đăng nhập */}
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.btnText}>Đăng nhập</Text>
            }
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Footer — link sang Register */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <Link href="/auth/register" asChild>
            <Pressable>
              <Text style={styles.linkText}>Đăng ký ngay</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  // Header
  header: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, elevation: 4,
  },
  logoText: { fontSize: 34 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  // Card
  card: {
    backgroundColor: Colors.white, borderRadius: 18,
    padding: 22, elevation: 3,
    shadowColor: '#1E6FD9', shadowOpacity: 0.08,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  label: {
    fontSize: 13, fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6, marginTop: 12,
  },
  input: {
    backgroundColor: Colors.inputBg, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: Colors.textPrimary,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 52 },
  eyeBtn: { position: 'absolute', right: 12, top: 11 },
  eyeLabel: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  forgotWrapper: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 },
  forgotText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  // Button
  btn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 18,
  },
  btnPressed: { backgroundColor: Colors.primaryDark },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  errorText: { color: Colors.error, fontSize: 13, marginTop: 10, textAlign: 'center' },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  linkText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});