import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../../shared/components/AppCard';
import { AppButton } from '../../../shared/components/AppButton';
import { colors } from '../../../shared/constants/colors';
import { ownerDashboardMockData } from '../data/ownerMockData';
import type { OwnerPromotion } from '../types/ownerTypes';
import { ownerPromotionsMockData } from '../data/ownerMockData';

export function OwnerPromotionFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  
  // Only approved hotels
  const approvedHotels = ownerDashboardMockData.hotels.filter(h => h.status === 'approved');

  const existingPromo = id ? ownerPromotionsMockData.find(p => p.id === id) : null;

  if (id && !existingPromo) {
    Alert.alert('Lỗi', 'Không tìm thấy khuyến mãi.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
    return null;
  }

  const [form, setForm] = useState({
    title: existingPromo?.title || '',
    code: existingPromo?.code || '',
    hotelId: existingPromo?.hotelId || '',
    discountPercent: existingPromo?.discountPercent?.toString() || '',
    startDate: existingPromo?.startDate || '',
    endDate: existingPromo?.endDate || '',
    maxUsage: existingPromo?.maxUsage?.toString() || '',
    description: existingPromo?.description || '',
  });

  const [showHotelPicker, setShowHotelPicker] = useState(false);

  const handleSave = () => {
    if (!form.title || !form.code || !form.hotelId || !form.discountPercent || !form.startDate || !form.endDate) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc (*).');
      return;
    }

    const discount = parseInt(form.discountPercent, 10);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      Alert.alert('Lỗi', 'Phần trăm giảm giá phải từ 1 đến 100.');
      return;
    }

    // Basic date validation mock (dd/mm/yyyy string comparison is flawed in real life, but ok for mock)
    // To do it properly, we parse parts:
    const parseDate = (d: string) => {
      const parts = d.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      return new Date(0);
    };

    const start = parseDate(form.startDate);
    const end = parseDate(form.endDate);

    if (end < start) {
      Alert.alert('Lỗi', 'Ngày kết thúc không được trước ngày bắt đầu.');
      return;
    }

    Alert.alert('Thành công', id ? 'Đã cập nhật khuyến mãi thành công.' : 'Đã tạo khuyến mãi thành công.', [
      {
        text: 'OK',
        onPress: () => router.replace('/owner/promotions'),
      }
    ]);
  };

  const selectedHotelName = approvedHotels.find(h => h.id === form.hotelId)?.name || 'Chọn khách sạn...';

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{id ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppCard style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên khuyến mãi *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Ưu đãi mùa hè"
              value={form.title}
              onChangeText={(t) => setForm({ ...form, title: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mã khuyến mãi *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: SUMMER20"
              autoCapitalize="characters"
              value={form.code}
              onChangeText={(t) => setForm({ ...form, code: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Khách sạn áp dụng *</Text>
            <Pressable 
              style={styles.pickerBtn}
              onPress={() => setShowHotelPicker(!showHotelPicker)}
            >
              <Text style={[styles.pickerText, !form.hotelId && { color: colors.muted }]}>
                {selectedHotelName}
              </Text>
              <Ionicons name={showHotelPicker ? "chevron-up" : "chevron-down"} size={20} color={colors.muted} />
            </Pressable>
            
            {showHotelPicker && (
              <View style={styles.pickerOptions}>
                {approvedHotels.map(h => (
                  <Pressable 
                    key={h.id} 
                    style={styles.pickerOptionItem}
                    onPress={() => {
                      setForm({ ...form, hotelId: h.id });
                      setShowHotelPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{h.name}</Text>
                    {form.hotelId === h.id && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phần trăm giảm (%) *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 20"
              keyboardType="number-pad"
              value={form.discountPercent}
              onChangeText={(t) => setForm({ ...form, discountPercent: t })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Từ ngày *</Text>
              <TextInput
                style={styles.input}
                placeholder="dd/mm/yyyy"
                value={form.startDate}
                onChangeText={(t) => setForm({ ...form, startDate: t })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Đến ngày *</Text>
              <TextInput
                style={styles.input}
                placeholder="dd/mm/yyyy"
                value={form.endDate}
                onChangeText={(t) => setForm({ ...form, endDate: t })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số lượt sử dụng tối đa</Text>
            <TextInput
              style={styles.input}
              placeholder="Để trống nếu không giới hạn"
              keyboardType="number-pad"
              value={form.maxUsage}
              onChangeText={(t) => setForm({ ...form, maxUsage: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả chi tiết</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Điều kiện áp dụng..."
              multiline
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
            />
          </View>
        </AppCard>

        <AppButton title={id ? "Lưu thay đổi" : "Lưu khuyến mãi"} onPress={handleSave} style={styles.saveBtn} />
      </ScrollView>
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
    paddingBottom: 40,
  },
  section: {
    padding: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.surface,
  },
  pickerText: {
    fontSize: 14,
    color: colors.text,
  },
  pickerOptions: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  pickerOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  saveBtn: {
    marginBottom: 16,
  },
});
