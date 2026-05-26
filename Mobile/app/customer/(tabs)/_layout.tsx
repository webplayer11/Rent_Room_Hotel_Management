import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from 'react-native';

export default function CustomerTabsLayout() {
  return (
     <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarStyle: {
              height: 80,
              backgroundColor: '#FFF',
              paddingBottom: Platform.OS === 'ios' ? 20 : 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: '#F1F5F9',
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.03,
              shadowRadius: 10,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 4,
            },
          }}
        >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color}) => (
            <Ionicons name="home-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="voucher"
        options={{
          title: "Voucher",
          tabBarIcon: ({ color}) => (
            <MaterialCommunityIcons name="ticket-percent-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "Đơn đặt",
          tabBarIcon: ({ color}) => (
            <Ionicons name="calendar-outline"  color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Yêu thích",
          tabBarIcon: ({ color}) => (
            <Ionicons name="heart-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profiles"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}


