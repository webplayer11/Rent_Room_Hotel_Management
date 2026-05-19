import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminStatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Màn hình Thống kê (Đang phát triển)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  text: {
    fontSize: 16,
    color: '#64748B',
  },
});
