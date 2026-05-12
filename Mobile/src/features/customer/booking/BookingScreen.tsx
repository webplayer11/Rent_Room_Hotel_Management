import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { hotels } from '../data/hotels';

const BookingScreen = () => {
  const router = useRouter();
  const { hotelId } = useLocalSearchParams();
  const hotel = hotels.find(h => h.id === hotelId) || hotels[0];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleBooking = () => {
    if (!name || !email || !phone) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    Alert.alert(
      'Thành công',
      'Đơn đặt phòng của bạn đã được ghi nhận!',
      [{ text: 'OK', onPress: () => router.replace('/customer/(tabs)/history') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="rgba(83, 146, 249, 0.7)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin đặt phòng</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hotel Summary */}
          <View style={styles.section}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Nhận phòng</Text>
                <Text style={styles.dateValue}>05 thg 5 2026</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#CCC" />
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Trả phòng</Text>
                <Text style={styles.dateValue}>06 thg 5 2026</Text>
              </View>
            </View>
            <Text style={styles.roomInfo}>1 đêm, 1 phòng, 2 người lớn</Text>
          </View>

          {/* Guest Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên người nhận phòng"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: example@mail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại liên lạc"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Payment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <TouchableOpacity style={styles.paymentOption}>
              <Ionicons name="card-outline" size={24} color="#5392F9" />
              <Text style={styles.paymentText}>Thanh toán tại khách sạn</Text>
              <Ionicons name="radio-button-on" size={20} color="#5392F9" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentOption}>
              <Ionicons name="wallet-outline" size={24} color="#666" />
              <Text style={styles.paymentText}>Chuyển khoản ngân hàng</Text>
              <Ionicons name="radio-button-off" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết giá</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giá phòng (1 đêm)</Text>
              <Text style={styles.priceValue}>{hotel.price.toLocaleString('vi-VN')} ₫</Text>
            </View>

            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{hotel.price.toLocaleString('vi-VN')} ₫</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handleBooking}>
          <Text style={styles.placeOrderButtonText}>Xác nhận đặt phòng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 15,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  roomInfo: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 45,
    fontSize: 15,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  paymentText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 15,
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF567D',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: 35,
  },
  placeOrderButton: {
    backgroundColor: '#FF567D',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingScreen;
