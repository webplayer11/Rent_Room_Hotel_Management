// Mobile/src/app/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
    View, Text, TextInput, Pressable,
    ScrollView, StyleSheet, KeyboardAvoidingView,
    Platform, ActivityIndicator,
} from 'react-native';
import { colors as Colors } from '../../shared/constants/colors';

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

export default function ForgotPasswordScreen({ navigation }: any) {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSend = async () => {
        setError('');

        const identifierError = validateIdentifier(identifier);
        if (identifierError) {
            setError(identifierError); return;
        }

        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            setSent(true);
        } catch {
            setError('Không tìm thấy tài khoản, vui lòng kiểm tra lại.');
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
                        <Text style={styles.logoText}>{sent ? '✅' : '🔑'}</Text>
                    </View>
                    <Text style={styles.title}>
                        {sent ? 'Đã gửi!' : 'Quên mật khẩu'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {sent
                            ? 'Kiểm tra email/SMS để lấy lại mật khẩu.'
                            : 'Nhập email hoặc số điện thoại để nhận hướng dẫn.'}
                    </Text>
                </View>

                <View style={styles.card}>
                    {!sent ? (
                        <>
                            {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

                            <Pressable
                                style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                                onPress={handleSend}
                                disabled={loading}
                            >
                                {loading
                                    ? <ActivityIndicator color={Colors.white} />
                                    : <Text style={styles.btnText}>Gửi yêu cầu</Text>
                                }
                            </Pressable>
                        </>
                    ) : (
                        <Pressable
                            style={styles.btn}
                            onPress={() => { setSent(false); setIdentifier(''); }}
                        >
                            <Text style={styles.btnText}>Thử lại với email khác</Text>
                        </Pressable>
                    )}
                </View>

                <View style={styles.footer}>
                    <Pressable onPress={() => navigation?.navigate('Login')}>
                        <Text style={styles.linkText}>← Quay lại đăng nhập</Text>
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
    subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, textAlign: 'center', lineHeight: 20 },
    card: {
        backgroundColor: Colors.white, borderRadius: 18,
        padding: 22, elevation: 3,
        shadowColor: '#1E6FD9', shadowOpacity: 0.08,
        shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    },
    label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 4 },
    input: {
        backgroundColor: Colors.inputBg, borderRadius: 10,
        borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: 14, paddingVertical: 11,
        fontSize: 15, color: Colors.textPrimary,
    },
    btn: {
        backgroundColor: Colors.primary, borderRadius: 12,
        paddingVertical: 14, alignItems: 'center', marginTop: 18,
    },
    btnPressed: { backgroundColor: Colors.primaryDark },
    btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    errorText: { color: Colors.error, fontSize: 13, marginBottom: 8, textAlign: 'center' },
    footer: { alignItems: 'center', marginTop: 22 },
    linkText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
