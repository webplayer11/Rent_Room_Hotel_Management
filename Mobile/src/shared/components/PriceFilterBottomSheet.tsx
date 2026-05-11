import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 60; // 30 padding each side

interface PriceFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (min: number, max: number) => void;
  initialMin: number;
  initialMax: number;
  maxLimit: number;
  totalResult: number;
}

const PriceFilterBottomSheet = ({
  visible,
  onClose,
  onApply,
  initialMin,
  initialMax,
  maxLimit,
  totalResult,
}: PriceFilterBottomSheetProps) => {
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);

  // Animated values for slider handles
  const minPos = useRef(new Animated.Value((initialMin / maxLimit) * SLIDER_WIDTH)).current;
  const maxPos = useRef(new Animated.Value((initialMax / maxLimit) * SLIDER_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      setMinPrice(initialMin);
      setMaxPrice(initialMax);
      minPos.setValue((initialMin / maxLimit) * SLIDER_WIDTH);
      maxPos.setValue((initialMax / maxLimit) * SLIDER_WIDTH);
    }
  }, [visible, initialMin, initialMax]);

  const handleReset = () => {
    setMinPrice(0);
    setMaxPrice(maxLimit);
    minPos.setValue(0);
    maxPos.setValue(SLIDER_WIDTH);
  };

  const handleApply = () => {
    onApply(minPrice, maxPrice);
    onClose();
  };

  // PanResponder for Min Handle
  const minResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPos = Math.max(0, Math.min(gestureState.moveX - 30, (maxPrice / maxLimit) * SLIDER_WIDTH - 20));
        minPos.setValue(newPos);
        setMinPrice(Math.round((newPos / SLIDER_WIDTH) * maxLimit / 1000) * 1000);
      },
    })
  ).current;

  // PanResponder for Max Handle
  const maxResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPos = Math.min(SLIDER_WIDTH, Math.max(gestureState.moveX - 30, (minPrice / maxLimit) * SLIDER_WIDTH + 20));
        maxPos.setValue(newPos);
        setMaxPrice(Math.round((newPos / SLIDER_WIDTH) * maxLimit / 1000) * 1000);
      },
    })
  ).current;

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
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Giá tiền</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Price Range Display */}
          <View style={styles.priceDisplayContainer}>
            <Text style={styles.priceDisplayText}>
              <Text style={styles.priceBold}>{minPrice.toLocaleString('vi-VN')} đ</Text>
              <Text style={styles.priceSeparator}>  -  </Text>
              <Text style={styles.priceBold}>{maxPrice.toLocaleString('vi-VN')} đ</Text>
            </Text>
          </View>

          {/* Visual Slider */}
          <View style={styles.sliderWrapper}>
            <View style={styles.sliderTrack}>
              <Animated.View 
                style={[
                  styles.sliderFill, 
                  { 
                    left: minPos,
                    width: Animated.subtract(maxPos, minPos)
                  }
                ]} 
              />
            </View>
            <Animated.View 
              {...minResponder.panHandlers}
              style={[styles.handle, { left: minPos }]} 
            />
            <Animated.View 
              {...maxResponder.panHandlers}
              style={[styles.handle, { left: maxPos }]} 
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyText}>Xem {totalResult} kết quả</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
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
  priceDisplayContainer: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  priceDisplayText: {
    fontSize: 15,
    color: '#333',
  },
  priceBold: {
    fontWeight: 'bold',
  },
  priceSeparator: {
    color: '#333',
  },
  sliderWrapper: {
    height: 30,
    marginHorizontal: 30,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    width: '100%',
  },
  sliderFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#5392F9',
    borderRadius: 2,
  },
  handle: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#5392F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: -13, // Center handle on track
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#EEE',
    alignItems: 'center',
    gap: 15,
  },
  resetBtn: {
    paddingHorizontal: 20,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetText: {
    color: '#5392F9',
    fontWeight: 'bold',
    fontSize: 13,
  },
  applyBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#5392F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
  },
  applyText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default PriceFilterBottomSheet;
