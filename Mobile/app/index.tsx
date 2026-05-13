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

  if (!userToken) {
    return <Redirect href="/auth/login" />;
  }

  if (userRole === 'admin') {
    return <Redirect href="/admin" />;
  }

  if (userRole === 'owner') {
    return <Redirect href="/owner" />;
  }

  return <Redirect href="/customer" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});