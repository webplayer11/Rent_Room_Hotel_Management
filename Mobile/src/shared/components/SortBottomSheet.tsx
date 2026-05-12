import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SortOption {
  id: string;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { id: 'distance', label: 'Khoảng cách' },
  { id: 'price_low', label: 'Giá thấp nhất' },
  { id: 'price_high', label: 'Giá cao nhất' },
  { id: 'star_high', label: 'Sao (5 đến 0)' },
  { id: 'reviews', label: 'Được đánh giá nhiều nhất' },
];

interface SortBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (sortType: string) => void;
  selectedSort: string;
}

const SortBottomSheet = ({ visible, onClose, onApply, selectedSort }: SortBottomSheetProps) => {
  const handleSelect = (id: string) => {
    onApply(id);
    onClose();
  };

  const renderItem = ({ item }: { item: SortOption }) => {
    const isSelected = item.id === selectedSort;
    return (
      <TouchableOpacity 
        style={styles.optionItem} 
        onPress={() => handleSelect(item.id)}
      >
        <Text style={[styles.optionLabel, isSelected && styles.selectedLabel]}>
          {item.label}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={20} color="#2563EB" />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.content} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sắp xếp theo:</Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Options List */}
          <FlatList
            data={SORT_OPTIONS}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listPadding}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  listPadding: { paddingBottom: 20 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  optionLabel: {
    fontSize: 15,
    color: '#333',
  },
  selectedLabel: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#EEE',
    marginHorizontal: 20,
  },
});

export default SortBottomSheet;
