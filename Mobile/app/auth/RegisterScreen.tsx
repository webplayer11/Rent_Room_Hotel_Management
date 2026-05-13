// app/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
    View, Text, TextInput, Pressable,
    ScrollView, StyleSheet, KeyboardAvoidingView,
    Platform, ActivityIndicator, Modal,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import Colors from '../../shared/constants/colors';

type AccountType = 'customer' | 'hotel_owner';

function validateIdentifier(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return 'Vui lòng nhập email hoặc số điện thoại.';

    const isPhone = /^\d+$/.test(trimmed);
    if (isPhone) {
        if (!trimmed.startsWith('0')) return 'Số điện thoại không hợp lệ';
        if (trimmed.length !== 10) return 'Số điện thoại không hợp lệ';
        return '';
    }

    if (!trimmed.endsWith('@gmail.com')) return 'Email phải có đuôi @gmail.com';
    if (!/^[^\s@]+@gmail\.com$/.test(trimmed)) return 'Email không đúng định dạng.';
    return '';
}

export default function RegisterScreen() {
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [accountType, setAccountType] = useState<AccountType>('customer');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleRegister = async () => {
        setError('');

        if (!fullName.trim()) {
            setError('Vui lòng nhập họ và tên'); return;
        }

        const identifierError = validateIdentifier(identifier);
        if (identifierError) {
            setError(identifierError); return;
        }

        if (!password) {
            setError('Vui lòng nhập mật khẩu'); return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự'); return;
        }
        if (password !== confirmPass) {
            setError('Mật khẩu xác nhận không khớp'); return;
        }

        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            setShowSuccess(true);
        } catch {
            setError('Đăng ký thất bại, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>📝</Text>
                    </View>
                    <Text style={styles.title}>Đăng ký tài khoản</Text>

                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    {/* Họ và tên */}
                    <Text style={styles.label}>Họ và tên</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập họ và tên"
                        placeholderTextColor={Colors.textPlaceholder}
                        value={fullName}
                        onChangeText={setFullName}
                    />

                    {/* Email / Số điện thoại */}
                    <Text style={styles.label}>Email / Số điện thoại</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập email hoặc số điện thoại"
                        placeholderTextColor={Colors.textPlaceholder}
                        value={identifier}
                        onChangeText={setIdentifier}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* Mật khẩu */}
                    <Text style={styles.label}>Mật khẩu</Text>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            placeholder="Ít nhất 6 ký tự"
                            placeholderTextColor={Colors.textPlaceholder}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPass}
                            autoCapitalize="none"
                        />
                        <Pressable style={styles.eyeBtn} onPress={() => setShowPass(p => !p)}>
                            <Text style={styles.eyeLabel}>{showPass ? 'Ẩn' : 'Hiện'}</Text>
                        </Pressable>
                    </View>

                    {/* Xác nhận mật khẩu */}
                    <Text style={styles.label}>Xác nhận mật khẩu</Text>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            placeholder="Nhập lại mật khẩu"
                            placeholderTextColor={Colors.textPlaceholder}
                            value={confirmPass}
                            onChangeText={setConfirmPass}
                            secureTextEntry={!showConfirmPass}
                            autoCapitalize="none"
                        />
                        <Pressable style={styles.eyeBtn} onPress={() => setShowConfirmPass(p => !p)}>
                            <Text style={styles.eyeLabel}>{showConfirmPass ? 'Ẩn' : 'Hiện'}</Text>
                        </Pressable>
                    </View>

                    {/* Loại tài khoản */}
                    <Text style={styles.label}>Loại tài khoản</Text>
                    <View style={styles.accountTypeContainer}>
                        <Pressable
                            style={[
                                styles.accountTypeOption,
                                accountType === 'customer' && styles.accountTypeSelected,
                            ]}
                            onPress={() => setAccountType('customer')}
                        >
                            <View style={[
                                styles.radioOuter,
                                accountType === 'customer' && styles.radioOuterSelected,
                            ]}>
                                {accountType === 'customer' && <View style={styles.radioInner} />}
                            </View>
                            <View style={styles.accountTypeInfo}>
                                <Text style={[
                                    styles.accountTypeText,
                                    accountType === 'customer' && styles.accountTypeTextSelected,
                                ]}>🧳 Khách hàng</Text>
                                <Text style={styles.accountTypeDesc}>Tìm kiếm & đặt phòng</Text>
                            </View>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.accountTypeOption,
                                accountType === 'hotel_owner' && styles.accountTypeSelected,
                            ]}
                            onPress={() => setAccountType('hotel_owner')}
                        >
                            <View style={[
                                styles.radioOuter,
                                accountType === 'hotel_owner' && styles.radioOuterSelected,
                            ]}>
                                {accountType === 'hotel_owner' && <View style={styles.radioInner} />}
                            </View>
                            <View style={styles.accountTypeInfo}>
                                <Text style={[
                                    styles.accountTypeText,
                                    accountType === 'hotel_owner' && styles.accountTypeTextSelected,
                                ]}>🏨 Chủ khách sạn</Text>
                                <Text style={styles.accountTypeDesc}>Quản lý khách sạn & phòng</Text>
                            </View>
                        </Pressable>
                    </View>

                    {/* Error message */}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {/* Nút Đăng ký */}
                    <Pressable
                        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color={Colors.white} />
                            : <Text style={styles.btnText}>Đăng ký</Text>
                        }
                    </Pressable>
                </View>

                {/* Footer link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Đã có tài khoản? </Text>
                    <Link href="/auth/login" asChild>
                        <Pressable>
                            <Text style={styles.linkText}>Đăng nhập</Text>
                        </Pressable>
                    </Link>
                </View>
            </ScrollView>

            {/* Modal đăng ký thành công */}
            <Modal
                transparent
                animationType="fade"
                visible={showSuccess}
                onRequestClose={() => setShowSuccess(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.successCircle}>
                            <Text style={styles.successIcon}>✓</Text>
                        </View>
                        <Text style={styles.modalTitle}>Đăng ký thành công!</Text>
                        <Text style={styles.modalSubtitle}>
                            Tài khoản của bạn đã được tạo.{'\n'}
                            Hãy đăng nhập để bắt đầu trải nghiệm!
                        </Text>
                        <Pressable
                            style={({ pressed }) => [styles.modalBtn, pressed && styles.modalBtnPressed]}
                            onPress={() => {
                                setShowSuccess(false);
                                router.replace('/auth/login');
                            }}
                        >
                            <Text style={styles.modalBtnText}>Đăng nhập ngay</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: Colors.background },
    container: { flexGrow: 1, justifyContent: 'center', padding: 24 },

    // Header
    header: { alignItems: 'center', marginBottom: 28 },
    logoBox: {
        width: 72, height: 72, borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 14, elevation: 4,
    },
    logoText: { fontSize: 34 },
    title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
    subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

    // Card
    card: {
        backgroundColor: Colors.white, borderRadius: 18,
        padding: 22, elevation: 3,
        shadowColor: '#1E6FD9', shadowOpacity: 0.08,
        shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    },
    label: {
        fontSize: 13, fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 6, marginTop: 12,
    },
    input: {
        backgroundColor: Colors.inputBg, borderRadius: 10,
        borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: 14, paddingVertical: 11,
        fontSize: 15, color: Colors.textPrimary,
    },
    passwordRow: { position: 'relative' },
    passwordInput: { paddingRight: 52 },
    eyeBtn: { position: 'absolute', right: 12, top: 11 },
    eyeLabel: { fontSize: 13, fontWeight: '600', color: Colors.primary },

    // Account type selector
    accountTypeContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    accountTypeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBg,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    accountTypeSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    radioOuter: {
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 2, borderColor: Colors.border,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10,
    },
    radioOuterSelected: {
        borderColor: Colors.primary,
    },
    radioInner: {
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    accountTypeInfo: {
        flex: 1,
    },
    accountTypeText: {
        fontSize: 13, fontWeight: '600',
        color: Colors.textSecondary,
    },
    accountTypeTextSelected: {
        color: Colors.primary,
    },
    accountTypeDesc: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 2,
    },

    // Error
    errorText: {
        color: Colors.error, fontSize: 13,
        marginTop: 10, textAlign: 'center',
    },

    // Button
    btn: {
        backgroundColor: Colors.primary, borderRadius: 12,
        paddingVertical: 14, alignItems: 'center', marginTop: 20,
    },
    btnPressed: { backgroundColor: Colors.primaryDark },
    btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

    // Footer
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
    footerText: { color: Colors.textSecondary, fontSize: 14 },
    linkText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },

    // Modal
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalBox: {
        backgroundColor: Colors.white, borderRadius: 24,
        padding: 32, marginHorizontal: 32,
        alignItems: 'center', elevation: 10,
        shadowColor: '#000', shadowOpacity: 0.15,
        shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    },
    successCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
    },
    successIcon: { fontSize: 40, color: Colors.white, fontWeight: '700' },
    modalTitle: {
        fontSize: 20, fontWeight: '700',
        color: Colors.textPrimary, marginBottom: 10,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14, color: Colors.textSecondary,
        textAlign: 'center', lineHeight: 22, marginBottom: 28,
    },
    modalBtn: {
        backgroundColor: Colors.primary, borderRadius: 12,
        paddingVertical: 13, paddingHorizontal: 48,
    },
    modalBtnPressed: { backgroundColor: Colors.primaryDark },
    modalBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});