import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/shared/constants/colors';

export default function Reports() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Báo cáo doanh thu</Text>
      <Text style={styles.text}>Màn báo cáo doanh thu sẽ được phát triển sau.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
});
