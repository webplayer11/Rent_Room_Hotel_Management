import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/auth/forgot-password" />; // thay đổi nếu muốn test màn khác 
}
