import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../../shared/components/AppButton';
import { AppCard } from '../../../shared/components/AppCard';
import { colors } from '../../../shared/constants/colors';
import { ownerProfileMockData } from '../data/ownerMockData';
import type { OwnerProfile } from '../types/ownerTypes';

export function OwnerProfileScreen() {
  const router = useRouter();
  
  const [personalInfo, setPersonalInfo] = useState({
    fullName: ownerProfileMockData.fullName,
    phone: ownerProfileMockData.phone,
    email: ownerProfileMockData.email,
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(ownerProfileMockData.avatarUrl || null);

  const handlePickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const [businessInfo, setBusinessInfo] = useState({
    companyName: ownerProfileMockData.businessInfo.companyName,
    taxId: ownerProfileMockData.businessInfo.taxId,
    address: ownerProfileMockData.businessInfo.address,
    representativeName: ownerProfileMockData.businessInfo.representativeName,
  });

  const handleSave = () => {
    if (!personalInfo.fullName || !personalInfo.phone || !personalInfo.email || 
        !businessInfo.companyName || !businessInfo.taxId || !businessInfo.address || !businessInfo.representativeName) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return;
    }
    // TODO: Sau này sẽ upload avatar bằng API multipart khi Backend hỗ trợ.
    Alert.alert('Thành công', 'Đã lưu thay đổi thông tin.');
  };

  const handleChangePassword = () => {
    Alert.alert('Thông báo', 'Tính năng đổi mật khẩu sẽ được xử lý khi nối backend.');
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.profileHeader}>
          <Pressable style={styles.avatarContainer} onPress={handlePickAvatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AN</Text>
              </View>
            )}
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={14} color={colors.textLight} />
            </View>
          </Pressable>
          <Pressable onPress={handlePickAvatar} style={{ marginBottom: 8 }}>
            <Text style={styles.changeAvatarText}>Đổi ảnh đại diện</Text>
          </Pressable>
          <Text style={styles.description}>Quản lý thông tin cá nhân và hồ sơ doanh nghiệp.</Text>
        </View>

        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên *</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.fullName}
              onChangeText={(t) => setPersonalInfo({ ...personalInfo, fullName: t })}
              placeholder="Nhập họ và tên"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.phone}
              onChangeText={(t) => setPersonalInfo({ ...personalInfo, phone: t })}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.email}
              onChangeText={(t) => setPersonalInfo({ ...personalInfo, email: t })}
              placeholder="Nhập email"
              keyboardType="email-address"
            />
          </View>
        </AppCard>

        <AppCard style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Thông tin doanh nghiệp</Text>
            {ownerProfileMockData.businessInfo.verificationStatus === 'verified' && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <Text style={styles.verifiedText}>Đã xác minh</Text>
              </View>
            )}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên công ty *</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.companyName}
              onChangeText={(t) => setBusinessInfo({ ...businessInfo, companyName: t })}
              placeholder="Nhập tên công ty"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mã số thuế *</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.taxId}
              onChangeText={(t) => setBusinessInfo({ ...businessInfo, taxId: t })}
              placeholder="Nhập mã số thuế"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ doanh nghiệp *</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.address}
              onChangeText={(t) => setBusinessInfo({ ...businessInfo, address: t })}
              placeholder="Nhập địa chỉ"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Người đại diện *</Text>
            <TextInput
              style={styles.input}
              value={businessInfo.representativeName}
              onChangeText={(t) => setBusinessInfo({ ...businessInfo, representativeName: t })}
              placeholder="Nhập tên người đại diện"
            />
          </View>
        </AppCard>

        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Bảo mật</Text>
          <Pressable style={styles.pwdBtn} onPress={handleChangePassword}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
            <Text style={styles.pwdBtnText}>Đổi mật khẩu</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        </AppCard>

        <View style={styles.actions}>
          <AppButton title="Lưu thay đổi" onPress={handleSave} />
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { key: 'home', icon: 'home', label: 'Trang chủ' },
          { key: 'hotels', icon: 'business', label: 'Khách sạn' },
          { key: 'bookings', icon: 'document-text', label: 'Đơn đặt' },
          { key: 'reports', icon: 'bar-chart', label: 'Báo cáo' },
        ].map((tab) => {
          const isActive = false;
          const iconName: any = isActive ? tab.icon : `${tab.icon}-outline`;
          return (
            <Pressable
              key={tab.key}
              style={styles.navTab}
              onPress={() => {
                if (tab.key === 'home') router.push('/owner');
                if (tab.key === 'hotels') router.push('/owner/hotels');
                if (tab.key === 'bookings') router.push('/owner/bookings');
                if (tab.key === 'reports') router.push('/owner/reports');
              }}
            >
              <Ionicons name={iconName} size={22} color={isActive ? colors.primary : colors.muted} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 28,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primaryDark,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  changeAvatarText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  pwdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pwdBtnText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  actions: {
    marginTop: 8,
    marginBottom: 24,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
