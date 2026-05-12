import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface RoomGuestPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (rooms: number, adults: number, children: number, childAges: number[]) => void;
  initialRooms?: number;
  initialAdults?: number;
  initialChildren?: number;
  initialChildAges?: number[];
}

const RoomGuestPicker: React.FC<RoomGuestPickerProps> = ({
  visible,
  onClose,
  onConfirm,
  initialRooms = 1,
  initialAdults = 2,
  initialChildren = 0,
  initialChildAges = [],
}) => {
  const [rooms, setRooms] = useState(initialRooms);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [childAges, setChildAges] = useState<number[]>(initialChildAges);
  const [agePickerVisible, setAgePickerVisible] = useState<{ visible: boolean; index: number }>({
    visible: false,
    index: -1,
  });

  useEffect(() => {
    if (visible) {
      setRooms(initialRooms);
      setAdults(initialAdults);
      setChildren(initialChildren);
      setChildAges(initialChildAges);
    }
  }, [visible]);

  const handleAddChild = () => {
    setChildren(children + 1);
    setChildAges([...childAges, 2]); // Default 2 years old
  };

  const handleRemoveChild = () => {
    if (children > 0) {
      setChildren(children - 1);
      setChildAges(childAges.slice(0, -1));
    }
  };

  const updateChildAge = (index: number, age: number) => {
    const newAges = [...childAges];
    newAges[index] = age;
    setChildAges(newAges);
    setAgePickerVisible({ visible: false, index: -1 });
  };

  const handleConfirm = () => {
    onConfirm(rooms, adults, children, childAges);
    onClose();
  };

  const renderCounter = (
    label: string,
    subLabel: string | null,
    value: number,
    onMinus: () => void,
    onPlus: () => void,
    minValue: number
  ) => (
    <View style={styles.counterRow}>
      <View style={styles.counterInfo}>
        <Text style={styles.counterLabel}>{label}</Text>
        {subLabel && <Text style={styles.counterSubLabel}>{subLabel}</Text>}
      </View>
      <View style={styles.counterControls}>
        <TouchableOpacity
          onPress={onMinus}
          disabled={value <= minValue}
          style={[styles.btnMinus, value <= minValue && styles.btnDisabled]}
        >
          <Ionicons name="remove" size={24} color={value <= minValue ? '#CCC' : '#5392F9'} />
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity onPress={onPlus} style={styles.btnPlus}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={false}
      statusBarTranslucent={true}
      presentationStyle="fullScreen"
    >
      <View style={styles.fullScreenContainer}>
        <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="rgba(83, 146, 249, 0.7)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn phòng và số lượng khách</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollContent}>
          <View style={styles.section}>
            {renderCounter('Phòng', null, rooms, () => setRooms(Math.max(1, rooms - 1)), () => setRooms(rooms + 1), 1)}
            <View style={styles.divider} />
            {renderCounter('Người lớn', 'Từ 18 tuổi trở lên', adults, () => setAdults(Math.max(1, adults - 1)), () => setAdults(adults + 1), 1)}
            <View style={styles.divider} />
            {renderCounter('Trẻ em', 'Từ 0 đến 17 tuổi', children, handleRemoveChild, handleAddChild, 0)}
          </View>

          {children > 0 && (
            <View style={styles.childAgesSection}>
              <Text style={styles.childAgesInfo}>
                Để hiển thị giá phòng chính xác, hãy đảm bảo nhập đúng độ tuổi của trẻ em.
              </Text>
              <View style={styles.ageGrid}>
                {childAges.map((age, index) => (
                  <View key={index} style={styles.ageItem}>
                    <Text style={styles.ageLabel}>Tuổi của trẻ {index + 1}</Text>
                    <TouchableOpacity
                      style={styles.ageDropdown}
                      onPress={() => setAgePickerVisible({ visible: true, index })}
                    >
                      <Text style={styles.ageValueText}>{age} tuổi</Text>
                      <Ionicons name="chevron-down" size={16} color="#5392F9" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Age Picker Modal */}
        <Modal visible={agePickerVisible.visible} transparent animationType="fade">
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setAgePickerVisible({ visible: false, index: -1 })}
          >
            <View style={styles.agePickerContainer}>
              <View style={styles.agePickerHeader}>
                <Text style={styles.agePickerTitle}>Chọn độ tuổi</Text>
              </View>
              <ScrollView style={{ maxHeight: height * 0.6 }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.ageOption}
                    onPress={() => updateChildAge(agePickerVisible.index, i)}
                  >
                    <Text style={[
                      styles.ageOptionText, 
                      childAges[agePickerVisible.index] === i && styles.ageOptionTextActive
                    ]}>
                      {i} tuổi
                    </Text>
                    {childAges[agePickerVisible.index] === i && (
                      <Ionicons name="checkmark" size={20} color="#5392F9" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 30, // Thêm khoảng cách cho status bar translucent
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  counterInfo: {
    flex: 1,
  },
  counterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  counterSubLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnMinus: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#5392F9',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  btnPlus: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#5392F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  btnDisabled: {
    borderColor: '#EEE',
    backgroundColor: '#FAFAFA',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 25,
    textAlign: 'center',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  childAgesSection: {
    padding: 20,
    backgroundColor: '#F8FAFF',
  },
  childAgesInfo: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
    marginBottom: 15,
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  ageItem: {
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 12,
  },
  ageLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  ageDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5392F9',
    backgroundColor: '#FFF',
  },
  ageValueText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  confirmBtn: {
    backgroundColor: '#5392F9',
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5392F9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agePickerContainer: {
    width: width * 0.75,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  agePickerHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
  },
  agePickerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  ageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  ageOptionText: {
    fontSize: 14,
    color: '#333',
  },
  ageOptionTextActive: {
    color: '#5392F9',
    fontWeight: 'bold',
  },
});

export default RoomGuestPicker;
