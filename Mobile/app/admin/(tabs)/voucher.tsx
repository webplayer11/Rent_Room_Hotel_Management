import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { voucherApi, VoucherDto, CreateSystemVoucherDto } from "../../../src/shared/api/voucherApi";

export default function AdminVoucherScreen() {
  const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState<"Percent" | "FixedAmount">("Percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [usageLimit, setUsageLimit] = useState("");

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const res = await voucherApi.getSystemVouchers();
      if (res.isSuccess) {
        setVouchers(res.data || []);
      } else {
        setVouchers([]);
      }
    } catch (error: any) {
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleCreateVoucher = async () => {
    if (!code.trim() || !discountValue.trim() || !usageLimit.trim()) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: "Vui lòng nhập đầy đủ các trường bắt buộc (*)"
      });
      return;
    }

    const payload: CreateSystemVoucherDto = {
      code: code.trim().toUpperCase(),
      type,
      discountValue: Number(discountValue),
      maxDiscountAmount: maxDiscountAmount.trim() ? Number(maxDiscountAmount) : undefined,
      minOrderAmount: minOrderAmount.trim() ? Number(minOrderAmount) : undefined,
      startDate: startDate,
      endDate: endDate,
      usageLimit: Number(usageLimit),
    };

    try {
      setLoading(true);
      const res = await voucherApi.createSystemVoucher(payload);
      if (res.isSuccess) {
        Toast.show({
          type: 'success',
          text1: "Thành công",
          text2: "Đã tạo voucher hệ thống mới!"
        });
        setModalVisible(false);
        resetForm();
        loadVouchers();
      } else {
        Toast.show({
          type: 'error',
          text1: "Lỗi",
          text2: res.message || "Không thể tạo voucher"
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: "Lỗi",
        text2: error.message || "Tạo voucher thất bại"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoucher = (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa voucher này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await voucherApi.deleteVoucher(id);
            if (res.isSuccess) {
              Toast.show({
                type: 'success',
                text1: "Thành công",
                text2: "Đã xóa voucher"
              });
              loadVouchers();
            } else {
              Toast.show({
                type: 'error',
                text1: "Lỗi",
                text2: res.message
              });
            }
          } catch (error: any) {
            Toast.show({
              type: 'error',
              text1: "Lỗi",
              text2: "Không thể xóa voucher"
            });
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setCode("");
    setType("Percent");
    setDiscountValue("");
    setMaxDiscountAmount("");
    setMinOrderAmount("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setUsageLimit("");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const renderVoucherCard = ({ item }: { item: VoucherDto }) => {
    const isExpired = new Date(item.endDate) < new Date();
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDeleteVoucher(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.valueText}>
            Giảm {item.type === "Percent" ? `${item.discountValue}%` : `${item.discountValue.toLocaleString()} đ`}
          </Text>
          {item.maxDiscountAmount ? (
            <Text style={styles.subText}>Tối đa: {item.maxDiscountAmount.toLocaleString()} đ</Text>
          ) : null}
          {item.minOrderAmount ? (
            <Text style={styles.subText}>Đơn tối thiểu: {item.minOrderAmount.toLocaleString()} đ</Text>
          ) : null}

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Đã dùng: {item.usedCount} / {item.usageLimit}</Text>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${Math.min((item.usedCount / item.usageLimit) * 100, 100)}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Ionicons name="calendar-outline" size={14} color="#64748B" />
          <Text style={styles.dateText}>
            Hạn dùng: {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
          <View style={[styles.statusIndicator, { backgroundColor: isExpired ? "#FEE2E2" : "#DCFCE7" }]}>
            <Text style={[styles.statusIndicatorText, { color: isExpired ? "#EF4444" : "#16A34A" }]}>
              {isExpired ? "Hết hạn" : "Hoạt động"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mã giảm giá</Text>
          <Text style={styles.subtitle}>Quản lý chiến dịch voucher hệ thống</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.createButtonText}>Tạo mới</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.id}
        renderItem={renderVoucherCard}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadVouchers}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="ticket-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Chưa có voucher hệ thống nào</Text>
          </View>
        }
      />

      {/* Create Voucher Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo Voucher Hệ thống</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.form}>
              <Text style={styles.label}>Mã giảm giá *</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={(val) => setCode(val.toUpperCase())}
                placeholder="VD: WELCOME2026"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Loại giảm giá</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, type === "Percent" && styles.typeButtonActive]}
                  onPress={() => setType("Percent")}
                >
                  <Text style={[styles.typeButtonText, type === "Percent" && styles.typeButtonTextActive]}>Phần trăm (%)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === "FixedAmount" && styles.typeButtonActive]}
                  onPress={() => setType("FixedAmount")}
                >
                  <Text style={[styles.typeButtonText, type === "FixedAmount" && styles.typeButtonTextActive]}>Số tiền (đ)</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Giá trị giảm *</Text>
              <TextInput
                style={styles.input}
                value={discountValue}
                onChangeText={setDiscountValue}
                placeholder={type === "Percent" ? "VD: 10 (%)" : "VD: 50000 (đ)"}
                keyboardType="numeric"
              />

              {type === "Percent" && (
                <>
                  <Text style={styles.label}>Số tiền giảm tối đa (đ)</Text>
                  <TextInput
                    style={styles.input}
                    value={maxDiscountAmount}
                    onChangeText={setMaxDiscountAmount}
                    placeholder="Không giới hạn"
                    keyboardType="numeric"
                  />
                </>
              )}

              <Text style={styles.label}>Giá trị đơn hàng tối thiểu (đ)</Text>
              <TextInput
                style={styles.input}
                value={minOrderAmount}
                onChangeText={setMinOrderAmount}
                placeholder="Không có"
                keyboardType="numeric"
              />

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Ngày bắt đầu (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Ngày kết thúc (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <Text style={styles.label}>Tổng lượt sử dụng tối đa *</Text>
              <TextInput
                style={styles.input}
                value={usageLimit}
                onChangeText={setUsageLimit}
                placeholder="VD: 100"
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleCreateVoucher}>
                <Text style={styles.submitButtonText}>Tạo ngay</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  createButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeText: {
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 14,
  },
  cardBody: {
    marginBottom: 12,
  },
  valueText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  subText: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 2,
  },
  progressRow: {
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 6,
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusIndicatorText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  form: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  typeButtonText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 13,
  },
  typeButtonTextActive: {
    color: "#2563EB",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },
});