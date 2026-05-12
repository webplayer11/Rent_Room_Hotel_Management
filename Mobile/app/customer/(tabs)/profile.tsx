import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="#CCC" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Khách hàng</Text>
              <Text style={styles.userEmail}>Đăng nhập để nhận ưu đãi thành viên</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập / Đăng ký</Text>
          </TouchableOpacity>
        </View>

        {/* Membership Section */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipInfo}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.membershipTitle}>Agoda VIP</Text>
          </View>
          <Text style={styles.membershipDesc}>Tiết kiệm thêm 10% cho các khách sạn tham gia</Text>
          <TouchableOpacity style={styles.membershipAction}>
            <Text style={styles.membershipActionText}>Tìm hiểu thêm</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản của tôi</Text>
          <MenuItem icon="heart-outline" title="Danh sách yêu thích" />
          <MenuItem icon="wallet-outline" title="AgodaCash" />
          <MenuItem icon="card-outline" title="Phương thức thanh toán" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          <MenuItem icon="help-circle-outline" title="Trung tâm trợ giúp" />
          <MenuItem icon="chatbubble-outline" title="Liên hệ chúng tôi" />
          <MenuItem icon="document-text-outline" title="Điều khoản & Chính sách" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <MenuItem icon="settings-outline" title="Cài đặt ứng dụng" />
          <MenuItem icon="globe-outline" title="Ngôn ngữ & Tiền tệ" />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/login')}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, title }: { icon: any, title: string }) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={styles.menuItemLeft}>
      <Ionicons name={icon} size={22} color="#333" />
      <Text style={styles.menuItemText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loginButton: {
    backgroundColor: '#5392F9',
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  membershipCard: {
    backgroundColor: '#333',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },
  membershipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  membershipTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  membershipDesc: {
    color: '#FFF',
    fontSize: 13,
    marginBottom: 15,
  },
  membershipAction: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  membershipActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#999',
    marginLeft: 15,
    marginBottom: 5,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    marginHorizontal: 20,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF567D',
  },
  logoutText: {
    color: '#FF567D',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
