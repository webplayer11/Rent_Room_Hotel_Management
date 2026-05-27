import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../api/apiClient";

const FALLBACK = [
  { id: "f1", name: "Wifi", icon: "wifi-outline" },
  { id: "f2", name: "Điều hòa", icon: "snow-outline" },
  { id: "f3", name: "Hồ bơi", icon: "water-outline" },
  { id: "f4", name: "Bãi đỗ xe", icon: "car-outline" },
  { id: "f5", name: "Nhà hàng", icon: "restaurant-outline" },
  { id: "f6", name: "Gym", icon: "barbell-outline" },
  { id: "f7", name: "Spa", icon: "flower-outline" },
  { id: "f8", name: "Giặt ủi", icon: "shirt-outline" },
  { id: "f9", name: "Đưa đón sân bay", icon: "airplane-outline" },
  { id: "f10", name: "Dịch vụ phòng", icon: "bed-outline" },
];

type AmenityItem = { id: string; name: string; icon?: string | null };

type Props = {
  selected: string[];
  onChange: (names: string[]) => void;
};

export default function AmenityPicker({ selected, onChange }: Props) {
  const [list, setList] = useState<AmenityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/amenities", { method: "GET" })
      .then((res: any) => {
        const data: any[] = res?.data ?? [];
        if (data.length > 0) {
          setList(data.map((a: any) => ({ id: a.id, name: a.name ?? "", icon: a.icon })));
        } else {
          setList(FALLBACK);
        }
      })
      .catch(() => setList(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#2563EB" />
        <Text style={s.hint}>Đang tải tiện ích...</Text>
      </View>
    );
  }

  return (
    <View style={s.grid}>
      {list.map((item) => {
        const active = selected.includes(item.name);
        return (
          <Pressable
            key={item.id}
            style={[s.chip, active && s.chipActive]}
            onPress={() => toggle(item.name)}
          >
            {item.icon ? (
              <Ionicons
                name={item.icon as any}
                size={16}
                color={active ? "#FFF" : "#6B7280"}
              />
            ) : null}
            <Text style={[s.chipText, active && s.chipTextActive]}>{item.name}</Text>
            {active && <Ionicons name="checkmark" size={14} color="#FFF" />}
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  center: { alignItems: "center", paddingVertical: 24, gap: 8 },
  hint: { fontSize: 13, color: "#6B7280" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
  },
  chipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  chipTextActive: { color: "#FFF" },
});
