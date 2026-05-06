import React, { useState } from 'react';
import {
    View, Text, TextInput, Pressable,
    ScrollView, StyleSheet, KeyboardAvoidingView,
    Platform, ActivityIndicator,
} from 'react-native';
import Colors from '../../shared/constants/colors';

function validateIdentifier(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return 'Vui lòng nhập email hoặc số điện thoại.';

    const isPhone = /^\d+$/.test(trimmed);
    if (isPhone) {
        if (!trimmed.startsWith('0')) return 'Số điện thoại không hợp lệ';
        if (trimmed.length !== 10) return 'Số điện thoại không hợp lệ';
        return '';
    }

    if (!trimmed.endsWith('@gmail.com')) return 'Email phải có đuôi @gmail.com.';
    if (!/^[^\s@]+@gmail\.com$/.test(trimmed)) return 'Email không đúng định dạng.';
    return '';
}

export default function RegisterScreen({ navigation }: any) {
    const [fullName, setFullName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setError('');

        if (!fullName.trim()) {
            setError('Vui lòng nhập họ và tên.'); return;
        }

        const identifierError = validateIdentifier(identifier);
        if (identifierError) {
            setError(identifierError); return;
        }

        if (!password) {
            setError('Vui lòng nhập mật khẩu.'); return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.'); return;
        }
        if (password !== confirmPass) {
            setError('Mật khẩu xác nhận không khớp.'); return;
        }

        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            alert('Đăng ký thành công! (demo)');
            navigation?.navigate('Login');
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
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>📝</Text>
                    </View>
                    <Text style={styles.title}>Tạo tài khoản</Text>
                    <Text style={styles.subtitle}>Điền thông tin để bắt đầu</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập họ và tên"
                        placeholderTextColor={Colors.textPlaceholder}
                        value={fullName}
                        onChangeText={setFullName}
                    />

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
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

                    <Text style={styles.label}>Xác nhận mật khẩu</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập lại mật khẩu"
                        placeholderTextColor={Colors.textPlaceholder}
                        value={confirmPass}
                        onChangeText={setConfirmPass}
                        secureTextEntry={!showPass}
                        autoCapitalize="none"
                    />

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

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Đã có tài khoản? </Text>
                    <Pressable onPress={() => navigation?.navigate('Login')}>
                        <Text style={styles.linkText}>Đăng nhập</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: Colors.background },
    container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
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
    passwordInput: { paddingRight: 48 },
    eyeBtn: { position: 'absolute', right: 12, top: 10 },
    eyeLabel: { fontSize: 13, fontWeight: '600', color: Colors.primary },
    btn: {
        backgroundColor: Colors.primary, borderRadius: 12,
        paddingVertical: 14, alignItems: 'center', marginTop: 20,
    },
    btnPressed: { backgroundColor: Colors.primaryDark },
    btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    errorText: { color: Colors.error, fontSize: 13, marginBottom: 8, textAlign: 'center' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
    footerText: { color: Colors.textSecondary, fontSize: 14 },
    linkText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});