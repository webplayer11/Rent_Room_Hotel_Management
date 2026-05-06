import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../../shared/components/AppCard';
import { AppButton } from '../../shared/components/AppButton';
import { colors } from '../../shared/constants/colors';
import { ownerDashboardMockData } from './ownerMockData';

export function OwnerRoomFormScreen() {
  const router = useRouter();

  // Only approved hotels
  const approvedHotels = ownerDashboardMockData.hotels.filter(h => h.status === 'approved');

  const [form, setForm] = useState({
    hotelId: '',
    name: '',
    roomType: 'Standard Twin',
    capacity: '',
    pricePerNight: '',
    status: 'available',
    description: '',
  });

  const [showHotelPicker, setShowHotelPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const roomTypes = ['Standard Twin', 'Deluxe Double', 'Family Suite'];
  const roomStatuses = [
    { value: 'available', label: 'Còn trống' },
    { value: 'maintenance', label: 'Bảo trì' },
  ];

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để chọn ảnh phòng.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!form.hotelId || !form.name || !form.roomType || !form.capacity || !form.pricePerNight || !form.status) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc (*).');
      return;
    }

    const capacityNum = parseInt(form.capacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      Alert.alert('Lỗi', 'Sức chứa phải lớn hơn 0.');
      return;
    }

    const priceNum = parseInt(form.pricePerNight.replace(/\D/g, ''), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Lỗi', 'Giá mỗi đêm phải lớn hơn 0.');
      return;
    }

    Alert.alert('Thành công', 'Đã thêm phòng thành công.', [
      {
        text: 'OK',
        onPress: () => router.replace('/owner/rooms'),
      }
    ]);
  };

  const selectedHotelName = approvedHotels.find(h => h.id === form.hotelId)?.name || 'Chọn khách sạn...';
  const selectedStatusLabel = roomStatuses.find(s => s.value === form.status)?.label || '';

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Thêm phòng mới</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppCard style={styles.section}>
          
          {/* Hotel */}
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

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên/Số phòng *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Phòng 101"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
          </View>

          {/* Room Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại phòng *</Text>
            <Pressable 
              style={styles.pickerBtn}
              onPress={() => setShowTypePicker(!showTypePicker)}
            >
              <Text style={styles.pickerText}>{form.roomType}</Text>
              <Ionicons name={showTypePicker ? "chevron-up" : "chevron-down"} size={20} color={colors.muted} />
            </Pressable>
            
            {showTypePicker && (
              <View style={styles.pickerOptions}>
                {roomTypes.map(type => (
                  <Pressable 
                    key={type} 
                    style={styles.pickerOptionItem}
                    onPress={() => {
                      setForm({ ...form, roomType: type });
                      setShowTypePicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{type}</Text>
                    {form.roomType === type && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Capacity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sức chứa (người) *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 2"
              keyboardType="number-pad"
              value={form.capacity}
              onChangeText={(t) => setForm({ ...form, capacity: t })}
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giá mỗi đêm (VND) *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 500000"
              keyboardType="number-pad"
              value={form.pricePerNight}
              onChangeText={(t) => setForm({ ...form, pricePerNight: t })}
            />
          </View>

          {/* Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trạng thái *</Text>
            <Pressable 
              style={styles.pickerBtn}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
            >
              <Text style={styles.pickerText}>{selectedStatusLabel}</Text>
              <Ionicons name={showStatusPicker ? "chevron-up" : "chevron-down"} size={20} color={colors.muted} />
            </Pressable>
            
            {showStatusPicker && (
              <View style={styles.pickerOptions}>
                {roomStatuses.map(s => (
                  <Pressable 
                    key={s.value} 
                    style={styles.pickerOptionItem}
                    onPress={() => {
                      setForm({ ...form, status: s.value });
                      setShowStatusPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{s.label}</Text>
                    {form.status === s.value && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả phòng</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tiện ích, view, v.v."
              multiline
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
            />
          </View>

          {/* Photos placeholder */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ảnh phòng (Tuỳ chọn)</Text>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <View style={styles.imageActions}>
                  <Pressable style={styles.imageActionBtn} onPress={handlePickImage}>
                    <Text style={styles.imageActionText}>Thay ảnh</Text>
                  </Pressable>
                  <Pressable style={[styles.imageActionBtn, { borderLeftWidth: 1, borderColor: colors.border }]} onPress={() => setImageUri(null)}>
                    <Text style={[styles.imageActionText, { color: colors.danger }]}>Xóa ảnh</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.photoBox} onPress={handlePickImage}>
                <Ionicons name="camera-outline" size={32} color={colors.muted} />
                <Text style={styles.photoText}>Thêm ảnh</Text>
              </Pressable>
            )}
            {/* TODO: Sau này khi Backend có API upload, ảnh phòng sẽ được upload bằng multipart/form-data. */}
          </View>

        </AppCard>

        <AppButton title="Lưu phòng" onPress={handleSave} style={styles.saveBtn} />
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
    minHeight: 80,
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
  photoBox: {
    height: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  photoText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  imagePreviewContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  imageActionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  saveBtn: {
    marginBottom: 16,
  },
});
