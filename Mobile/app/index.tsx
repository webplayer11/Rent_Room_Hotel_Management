import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/shared/constants/colors';
import { AppButton } from '../src/shared/components/AppButton';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="business" size={64} color={colors.primary} style={{ marginBottom: 20 }} />
      <Text style={styles.title}>Chọn giao diện để test</Text>
      <Text style={styles.subtitle}>
        Do chưa có màn hình Login, vui lòng chọn phân quyền mà bạn muốn xem.
      </Text>

      <View style={styles.btnGroup}>
        <AppButton 
          title="Đăng nhập với tư cách Chủ khách sạn (Owner)" 
          onPress={() => router.replace('/owner')}
        />
        <AppButton 
          title="Đăng nhập với tư cách Quản trị viên (Admin)" 
          variant="outline"
          onPress={() => router.replace('/admin')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  btnGroup: {
    width: '100%',
    gap: 16,
  }
});
