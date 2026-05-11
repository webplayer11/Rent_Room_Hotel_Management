// Mobile/src/app/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
    View, Text, TextInput, Pressable,
    ScrollView, StyleSheet, KeyboardAvoidingView,
    Platform, ActivityIndicator, Modal,
} from 'react-native';
import { colors as Colors } from '../../shared/constants/colors';

export default function LoginScreen({ navigation }: any) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleLogin = async () => {
        setError('');
        if (!identifier || !password) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            setShowSuccess(true);
        } catch {
            setError('Sai thông tin đăng nhập.');
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
                {/* Logo */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>🏨</Text>
                    </View>
                    <Text style={styles.title}>Đăng nhập</Text>
                    <Text style={styles.subtitle}>Chào mừng bạn quay lại!</Text>
                </View>

                {/* Form */}
                <View style={styles.card}>
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

                    <Text style={styles.label}>Mật khẩu</Text>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            placeholder="Nhập mật khẩu"
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

                    <Pressable
                        onPress={() => navigation?.navigate('ForgotPassword')}
                        style={styles.forgotWrapper}
                    >
                        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color={Colors.white} />
                            : <Text style={styles.btnText}>Đăng nhập</Text>
                        }
                    </Pressable>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                    <Pressable onPress={() => navigation?.navigate('Register')}>
                        <Text style={styles.linkText}>Đăng ký ngay</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Modal đăng nhập thành công */}
            <Modal
                transparent
                animationType="fade"
                visible={showSuccess}
                onRequestClose={() => setShowSuccess(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>

                        {/* Icon vòng tròn tích xanh */}
                        <View style={styles.successCircle}>
                            <Text style={styles.successIcon}>✓</Text>
                        </View>

                        <Text style={styles.modalTitle}>Đăng nhập thành công!</Text>
                        <Text style={styles.modalSubtitle}>
                            Chào mừng bạn đã quay trở lại.{'\n'}
                            Chúc bạn có trải nghiệm tuyệt vời!
                        </Text>

                        <Pressable
                            style={({ pressed }) => [styles.modalBtn, pressed && styles.modalBtnPressed]}
                            onPress={() => {
                                setShowSuccess(false);
                                // TODO: navigation.navigate('Home') khi có màn hình chính
                            }}
                        >
                            <Text style={styles.modalBtnText}>Tiếp tục</Text>
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
    label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 12 },
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
    forgotWrapper: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 },
    forgotText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
    btn: {
        backgroundColor: Colors.primary, borderRadius: 12,
        paddingVertical: 14, alignItems: 'center', marginTop: 18,
    },
    btnPressed: { backgroundColor: Colors.primaryDark },
    btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    errorText: { color: Colors.error, fontSize: 13, marginTop: 10, textAlign: 'center' },

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
