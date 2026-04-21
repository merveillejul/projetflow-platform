import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = {
    bg:        '#f8fafc',
    white:     '#ffffff',
    border:    '#e2e8f0',
    text:      '#0f172a',
    textMuted: '#64748b',
    textLight: '#94a3b8',
    blue:      '#1d4ed8',
    blueMid:   '#3b82f6',
    blueBg:    '#eff6ff',
    red:       '#ef4444',
    redBg:     '#fef2f2',
    redBorder: '#fecaca',
};

function InputField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, focused && styles.inputFocused]}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textLight}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize ?? 'none'}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
        </View>
    );
}

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
        setLoading(true);
        try {
            const res = await API.post('/login', { email, password });
            await login(res.data.user, res.data.token);
        } catch (err) {
            setError('Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* LOGO */}
                    <View style={styles.logoBlock}>
                        <View style={styles.logoIcon}>
                            <Text style={{ fontSize: 18, color: 'white', fontWeight: '700' }}>⚡</Text>
                        </View>
                        <Text style={styles.logoText}>ProjectFlow</Text>
                        <Text style={styles.logoSub}>Connexion à votre espace de travail</Text>
                    </View>

                    {/* CARD */}
                    <View style={styles.card}>
                        {error !== '' && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorDot}>●</Text>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <InputField
                            label="Adresse email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="votre@email.fr"
                            keyboardType="email-address"
                        />
                        <InputField
                            label="Mot de passe"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                        />

                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={{ alignSelf: 'flex-end', marginTop: -6, marginBottom: 20 }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <View style={styles.btnLoadingRow}>
                                    <View style={styles.spinner} />
                                    <Text style={styles.btnText}>Connexion...</Text>
                                </View>
                            ) : (
                                <Text style={styles.btnText}>Se connecter</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* INSCRIPTION */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Register')}
                        style={styles.registerRow}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.registerText}>Pas encore de compte ? </Text>
                        <Text style={styles.registerLink}>Créer un compte</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },

    logoBlock: { alignItems: 'center', marginBottom: 32 },
    logoIcon: {
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: COLORS.blue,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
    },
    logoText: {
        fontSize: 22, fontWeight: '700', color: COLORS.text,
        letterSpacing: -0.5, marginBottom: 6,
    },
    logoSub: { fontSize: 13.5, color: COLORS.textMuted, textAlign: 'center' },

    card: {
        backgroundColor: COLORS.white, borderRadius: 16,
        padding: 22, borderWidth: 1, borderColor: COLORS.border,
        marginBottom: 20,
    },

    errorBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        backgroundColor: COLORS.redBg, borderWidth: 1, borderColor: COLORS.redBorder,
        borderRadius: 8, padding: 10, marginBottom: 16,
    },
    errorDot: { fontSize: 10, color: COLORS.red, marginTop: 3 },
    errorText: { flex: 1, fontSize: 13, color: '#b91c1c', lineHeight: 18 },

    label: { fontSize: 12.5, fontWeight: '600', color: '#475569', marginBottom: 6 },
    input: {
        backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
        borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12,
        fontSize: 15, color: COLORS.text,
    },
    inputFocused: {
        borderColor: COLORS.blueMid,
        shadowColor: COLORS.blueMid,
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },

    forgotLink: { fontSize: 12.5, color: COLORS.textMuted, fontWeight: '500' },

    btn: {
        backgroundColor: COLORS.blue, borderRadius: 10,
        paddingVertical: 14, alignItems: 'center',
    },
    btnText: { color: 'white', fontSize: 15, fontWeight: '600' },
    btnLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    spinner: {
        width: 14, height: 14, borderRadius: 7,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
        borderTopColor: 'white',
    },

    registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    registerText: { fontSize: 13.5, color: COLORS.textMuted },
    registerLink: { fontSize: 13.5, color: COLORS.blue, fontWeight: '600' },
});