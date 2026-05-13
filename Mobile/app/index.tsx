// app/index.tsx
// Entry point — redirect dựa trên trạng thái đăng nhập
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function Index() {
  const { userToken, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  // Chưa đăng nhập → AuthStack
  if (!userToken) {
    return <Redirect href="/auth/login" />;
  }

  // Đã đăng nhập → redirect theo role
  switch (userRole) {
    case 'Admin':
      return <Redirect href="/admin" />;
    case 'Owner':
      return <Redirect href="/owner" />;
    default:
      return <Redirect href="/customer" />;
  }
  return <Redirect href="/customer" />; // thay đổi nếu muốn test màn khác 
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
});
