import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userApi, UserProfileDto } from '../../../src/shared/api/userApi';
import Toast from 'react-native-toast-message';

export default function AccountInfoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await userApi.getProfile();
      if (res.isSuccess && res.data) {
        setFullName(res.data.fullName || '');
        setPhoneNumber(res.data.phoneNumber || '');
        setGender(res.data.gender || '');
        setAddress(res.data.address || '');
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: res.message || 'Không tải được thông tin' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Họ tên không được để trống' });
      return;
    }

    setSaving(true);
    try {
      const res = await userApi.updateProfile({
        fullName,
        phoneNumber,
        gender,
        address,
      });

      if (res.isSuccess) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Cập nhật thông tin thành công' });
        router.back();
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: res.message || 'Cập nhật thất bại' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Đã có lỗi xảy ra' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5392F9" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Họ và tên *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <TextInput
              style={styles.input}
              value={gender}
              onChangeText={setGender}
              placeholder="Nam / Nữ / Khác"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ của bạn"
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, saving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  saveButton: {
    backgroundColor: '#5392F9',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
