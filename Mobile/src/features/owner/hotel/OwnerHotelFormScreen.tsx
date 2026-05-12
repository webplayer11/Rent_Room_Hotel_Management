import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../../shared/components/AppButton';
import { AppCard } from '../../../shared/components/AppCard';
import { colors } from '../../../shared/constants/colors';
import {
  amenityOptions,
  defaultHotelFormData,
  sampleFileNames,
} from '../data/ownerMockData';
import type { HotelFormData, HotelImageUpload } from '../types/ownerTypes';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type OwnerHotelFormProps = {
  onBack?: () => void;
};

export function OwnerHotelFormScreen({ onBack }: OwnerHotelFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<HotelFormData>({
    ...defaultHotelFormData,
    legalDocuments: defaultHotelFormData.legalDocuments.map((d) => ({ ...d })),
  });
  const [submitted, setSubmitted] = useState(false);

  // ---- Field updater ----
  function updateField<K extends keyof HotelFormData>(key: K, value: HotelFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ---- Amenity toggle ----
  function toggleAmenity(id: string) {
    setForm((prev) => {
      const selected = prev.selectedAmenities.includes(id)
        ? prev.selectedAmenities.filter((a) => a !== id)
        : [...prev.selectedAmenities, id];
      return { ...prev, selectedAmenities: selected };
    });
  }

  // ---- Real image upload ----
  async function simulateCoverUpload() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      updateField('coverImage', {
        id: `cover-${Date.now()}`,
        fileName: asset.fileName || `image-${Date.now()}.jpg`,
        uri: asset.uri,
      });
    }
  }

  function removeCoverImage() {
    updateField('coverImage', null);
  }

  async function simulateGalleryUpload() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => ({
        id: `gallery-${Date.now()}-${Math.random()}`,
        fileName: asset.fileName || `image-${Date.now()}.jpg`,
        uri: asset.uri,
      }));
      setForm((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...newImages],
      }));
    }
  }

  function removeGalleryImage(id: string) {
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((img) => img.id !== id),
    }));
  }

  // ---- Real document upload ----
  async function simulateDocUpload(docId: string) {
    let result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
      copyToCacheDirectory: true,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setForm((prev) => ({
        ...prev,
        legalDocuments: prev.legalDocuments.map((doc) =>
          doc.id === docId
            ? { ...doc, fileName: asset.name, uri: asset.uri }
            : doc,
        ),
      }));
    }
  }

  function removeDoc(docId: string) {
    setForm((prev) => ({
      ...prev,
      legalDocuments: prev.legalDocuments.map((doc) =>
        doc.id === docId ? { ...doc, fileName: null, uri: undefined } : doc,
      ),
    }));
  }

  // ---- Validation & submit ----
  function handleSubmit() {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push('Tên khách sạn');
    if (!form.street.trim()) errors.push('Số nhà / đường');
    if (!form.district.trim()) errors.push('Quận / huyện');
    if (!form.city.trim()) errors.push('Tỉnh / thành phố');
    if (!form.phone.trim()) errors.push('Số điện thoại');
    if (!form.email.trim()) errors.push('Email liên hệ');
    if (!form.description.trim()) errors.push('Mô tả khách sạn');
    if (!form.coverImage) errors.push('Ảnh đại diện khách sạn');

    const missingDocs = form.legalDocuments.filter((d) => !d.fileName);
    if (missingDocs.length > 0) {
      missingDocs.forEach((d) => errors.push(d.label));
    }

    if (errors.length > 0) {
      Alert.alert(
        'Vui lòng tải ảnh đại diện khách sạn và đầy đủ giấy tờ pháp lý.',
        `Còn thiếu:\n• ${errors.join('\n• ')}`,
      );
      return;
    }

    Alert.alert(
      'Hồ sơ đã được chọn đầy đủ. Khi Backend hỗ trợ upload, app sẽ gửi ảnh và giấy tờ lên server.',
      'Khách sạn đang chờ admin xét duyệt.',
      [{ text: 'OK', onPress: () => setSubmitted(true) }],
    );
    // TODO: After navigation is wired, navigate back to OwnerHotelListScreen
    // and show the new hotel with status = 'pending'
  }

  function handleSaveDraft() {
    Alert.alert('Lưu nháp', 'Đã lưu nháp hồ sơ khách sạn.');
  }

  // ---- Submitted success state ----
  if (submitted) {
    return (
      <View style={styles.screen}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.successContent}
        >
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Hồ sơ đã gửi</Text>
          <Text style={styles.successSubtitle}>
            Trạng thái: Chờ admin duyệt
          </Text>
          <AppCard style={styles.successCard}>
            <View style={styles.successRow}>
              <Ionicons name="business-outline" size={18} color={colors.primary} />
              <Text style={styles.successHotelName}>{form.name}</Text>
            </View>
            <View style={styles.successRow}>
              <Ionicons name="location-outline" size={16} color={colors.muted} />
              <Text style={styles.successDetail}>
                {form.street}, {form.district}, {form.city}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.statusBadgeText, { color: '#B45309' }]}>
                Chờ duyệt
              </Text>
            </View>
          </AppCard>
          <AppButton
            title="Quay về Dashboard"
            style={{ marginTop: 20 }}
            onPress={() => {
              setSubmitted(false);
              if (onBack) onBack();
              else router.back();
            }}
          />
        </ScrollView>
      </View>
    );
  }

  // ---- Main form ----
  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => {
            if (onBack) onBack();
            else router.back();
          }}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Thêm khách sạn</Text>
            <Text style={styles.headerSubtitle}>
              Điền thông tin và giấy tờ để gửi Admin phê duyệt.
            </Text>
          </View>
        </View>

        {/* ===== 1. THÔNG TIN CƠ BẢN ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          </View>

          <FormField label="Tên khách sạn" required>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên khách sạn"
              placeholderTextColor={colors.muted}
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
            />
          </FormField>

          <FormField label="Số nhà / đường" required>
            <TextInput
              style={styles.input}
              placeholder="Nhập số nhà, tên đường"
              placeholderTextColor={colors.muted}
              value={form.street}
              onChangeText={(v) => updateField('street', v)}
            />
          </FormField>

          <FormField label="Quận / huyện" required>
            <TextInput
              style={styles.input}
              placeholder="Nhập quận / huyện"
              placeholderTextColor={colors.muted}
              value={form.district}
              onChangeText={(v) => updateField('district', v)}
            />
          </FormField>

          <FormField label="Tỉnh / thành phố" required>
            <TextInput
              style={styles.input}
              placeholder="Nhập tỉnh / thành phố"
              placeholderTextColor={colors.muted}
              value={form.city}
              onChangeText={(v) => updateField('city', v)}
            />
          </FormField>

          <FormField label="Số điện thoại liên hệ" required>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => updateField('phone', v)}
            />
          </FormField>

          <FormField label="Email liên hệ" required>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => updateField('email', v)}
            />
          </FormField>

          <FormField label="Mô tả khách sạn" required>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Giới thiệu ngắn về khách sạn"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
            />
          </FormField>
        </AppCard>

        {/* ===== 2. HÌNH ẢNH ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="image-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Hình ảnh khách sạn</Text>
          </View>

          {/* Cover image */}
          <FormField label="Ảnh đại diện" required>
            {form.coverImage ? (
              <View style={styles.uploadedFileContainer}>
                {form.coverImage.uri ? (
                  <Image source={{ uri: form.coverImage.uri }} style={styles.previewImage} />
                ) : null}
                <View style={styles.uploadedFile}>
                  <View style={styles.uploadedFileInfo}>
                    <Ionicons name="image" size={18} color={colors.success} />
                    <Text style={styles.uploadedFileName} numberOfLines={1}>
                      {form.coverImage.fileName}
                    </Text>
                  </View>
                  <View style={styles.uploadedFileActions}>
                    <Pressable onPress={simulateCoverUpload} style={styles.fileActionBtn}>
                      <Text style={styles.fileActionReplace}>Thay thế</Text>
                    </Pressable>
                    <Pressable onPress={removeCoverImage} style={styles.fileActionBtn}>
                      <Text style={styles.fileActionRemove}>Xóa</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : (
              <Pressable style={styles.uploadBtn} onPress={simulateCoverUpload}>
                <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                <Text style={styles.uploadBtnText}>Chọn ảnh</Text>
              </Pressable>
            )}
          </FormField>

          {/* Gallery images */}
          <FormField label="Ảnh thư viện">
            {form.galleryImages.map((img) => (
              <View key={img.id} style={styles.uploadedFileContainer}>
                {img.uri ? (
                  <Image source={{ uri: img.uri }} style={styles.previewImage} />
                ) : null}
                <View style={styles.uploadedFile}>
                  <View style={styles.uploadedFileInfo}>
                    <Ionicons name="image" size={18} color={colors.success} />
                    <Text style={styles.uploadedFileName} numberOfLines={1}>
                      {img.fileName}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => removeGalleryImage(img.id)}
                    style={styles.fileActionBtn}
                  >
                    <Text style={styles.fileActionRemove}>Xóa</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <Pressable style={styles.uploadBtn} onPress={simulateGalleryUpload}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.uploadBtnText}>Thêm ảnh</Text>
            </Pressable>
          </FormField>
        </AppCard>

        {/* ===== 3. TIỆN NGHI ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Tiện nghi</Text>
          </View>
          <Text style={styles.fieldHint}>Chọn các tiện nghi khách sạn cung cấp.</Text>
          <View style={styles.chipGrid}>
            {amenityOptions.map((amenity) => {
              const selected = form.selectedAmenities.includes(amenity.id);
              return (
                <Pressable
                  key={amenity.id}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => toggleAmenity(amenity.id)}
                >
                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.primary}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text
                    style={[styles.chipText, selected && styles.chipTextSelected]}
                  >
                    {amenity.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </AppCard>

        {/* ===== 4. CHÍNH SÁCH ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Chính sách nhận/trả phòng</Text>
          </View>

          <FormField label="Giờ nhận phòng">
            <TextInput
              style={styles.input}
              placeholder="14:00"
              placeholderTextColor={colors.muted}
              value={form.checkInTime}
              onChangeText={(v) => updateField('checkInTime', v)}
            />
          </FormField>

          <FormField label="Giờ trả phòng">
            <TextInput
              style={styles.input}
              placeholder="12:00"
              placeholderTextColor={colors.muted}
              value={form.checkOutTime}
              onChangeText={(v) => updateField('checkOutTime', v)}
            />
          </FormField>

          <FormField label="Chính sách hủy phòng">
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Cho phép hủy trước 24 giờ"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={form.cancellationPolicy}
              onChangeText={(v) => updateField('cancellationPolicy', v)}
            />
          </FormField>

          <FormField label="Quy định lưu trú">
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Không hút thuốc, không mang thú cưng..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={form.houseRules}
              onChangeText={(v) => updateField('houseRules', v)}
            />
          </FormField>
        </AppCard>

        {/* ===== 5. GIẤY TỜ PHÁP LÝ ===== */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Pháp lý / giấy tờ</Text>
          </View>
          <Text style={styles.fieldHint}>
            Cần tải lên đầy đủ 2 giấy tờ bắt buộc để gửi duyệt.
          </Text>

          {form.legalDocuments.map((doc) => (
            <FormField key={doc.id} label={doc.label} required>
              {doc.fileName ? (
                <View style={styles.uploadedFile}>
                  <View style={styles.uploadedFileInfo}>
                    <Ionicons name="document-attach" size={18} color={colors.success} />
                    <Text style={styles.uploadedFileName} numberOfLines={1}>
                      {doc.fileName}
                    </Text>
                  </View>
                  <View style={styles.uploadedFileActions}>
                    <Pressable
                      onPress={() => simulateDocUpload(doc.id)}
                      style={styles.fileActionBtn}
                    >
                      <Text style={styles.fileActionReplace}>Thay thế</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => removeDoc(doc.id)}
                      style={styles.fileActionBtn}
                    >
                      <Text style={styles.fileActionRemove}>Xóa</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={styles.uploadBtn}
                  onPress={() => simulateDocUpload(doc.id)}
                >
                  <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                  <Text style={styles.uploadBtnText}>Chọn file</Text>
                </Pressable>
              )}
            </FormField>
          ))}
        </AppCard>

        {/* ===== 6. GHI CHÚ KIỂM DUYỆT ===== */}
        <View style={styles.reviewNote}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={styles.reviewNoteText}>
            Sau khi gửi, khách sạn sẽ ở trạng thái{' '}
            <Text style={styles.reviewNoteBold}>Chờ admin duyệt</Text>. Bạn chỉ
            có thể quản lý phòng, khuyến mãi sau khi khách sạn được duyệt.
          </Text>
        </View>

        {/* ===== BUTTONS ===== */}
        <View style={styles.buttonRow}>
          <AppButton
            title="Lưu nháp"
            variant="outline"
            style={styles.btnHalf}
            onPress={handleSaveDraft}
          />
          <AppButton
            title="Gửi duyệt"
            style={styles.btnHalf}
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// FormField helper
// ---------------------------------------------------------------------------

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.fieldRequired}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 52,
    paddingBottom: 40,
  },
  successContent: {
    padding: 16,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 2,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },

  // ---- Sections ----
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  // ---- Fields ----
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldRequired: {
    color: colors.danger,
  },
  fieldHint: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 17,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },

  // ---- Upload ----
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    borderStyle: 'dashed',
    paddingVertical: 14,
  },
  uploadBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  uploadedFileContainer: {
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  uploadedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  uploadedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  uploadedFileName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  uploadedFileActions: {
    flexDirection: 'row',
    gap: 12,
  },
  fileActionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  fileActionReplace: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  fileActionRemove: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },

  // ---- Chips ----
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#DBEAFE',
  },
  chipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  // ---- Review note ----
  reviewNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  reviewNoteText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  reviewNoteBold: {
    fontWeight: '700',
    color: colors.primaryDark,
  },

  // ---- Buttons ----
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  btnHalf: {
    flex: 1,
  },

  // ---- Success state ----
  successIconWrap: {
    marginBottom: 16,
  },
  successTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  successSubtitle: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 24,
  },
  successCard: {
    width: '100%',
    gap: 10,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successHotelName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  successDetail: {
    color: colors.muted,
    fontSize: 13,
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
