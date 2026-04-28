import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
    bg:        '#F8FAFC',
    white:     '#FFFFFF',
    border:    '#E2E8F0',
    text:      '#0F172A',
    textMuted: '#64748B',
    textLight: '#94A3B8',
    // Dark premium (remplace blue)
    primary:   '#0F172A',
    primaryMd: '#1E293B',
    // Bleu secondaire uniquement pour focus/lien
    blue:      '#6366F1',
    blueMid:   '#818CF8',
    blueBg:    '#EEF2FF',
    red:       '#EF4444',
    redBg:     '#FEF2F2',
    redBorder: '#FECACA',
};

function LogoIcon() {
    return (
        <Svg width="20" height="20" fill="none" stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <Rect x="3" y="3" width="7" height="7" rx="1"/>
            <Rect x="14" y="3" width="7" height="7" rx="1"/>
            <Rect x="14" y="14" width="7" height="7" rx="1"/>
            <Rect x="3" y="14" width="7" height="7" rx="1"/>
        </Svg>
    );
}

function EyeIcon({ visible }) {
    const color = COLORS.textLight;
    if (visible) return (
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <Line x1="1" y1="1" x2="23" y2="23"/>
        </Svg>
    );
    return (
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <Circle cx="12" cy="12" r="3"/>
        </Svg>
    );
}

function InputField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, rightAction }) {
    const [focused, setFocused] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>{label}</Text>
            <View style={{ position: 'relative' }}>
                <TextInput
                    style={[
                        styles.input,
                        focused && styles.inputFocused,
                        secureTextEntry && { paddingRight: 48 },
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textLight}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !passwordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize ?? 'none'}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setPasswordVisible(!passwordVisible)}
                        style={styles.eyeBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={0.7}
                    >
                        <EyeIcon visible={passwordVisible} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    const handleLogin = async () => {
        setError('');
        if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
        setLoading(true);
        try {
            const res = await API.post('/login', { email, password });
            await login(res.data.user, res.data.token);
        } catch (err) {
            setError('Email ou mot de passe incorrect.');
        } finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* LOGO — dark premium */}
                    <View style={styles.logoBlock}>
                        <View style={styles.logoIcon}>
                            <LogoIcon />
                        </View>
                        <Text style={styles.logoText}>ProjectFlow</Text>
                        <Text style={styles.logoSub}>Connexion à votre espace de travail</Text>
                    </View>

                    {/* CARD */}
                    <View style={styles.card}>

                        {error !== '' && (
                            <View style={styles.errorBox}>
                                <View style={styles.errorDot} />
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
                            style={{ alignSelf: 'flex-end', marginTop: -6, marginBottom: 22 }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
                        </TouchableOpacity>

                        {/* Bouton dark premium */}
                        <TouchableOpacity
                            style={[styles.btn, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <View style={styles.btnRow}>
                                    <View style={styles.spinner} />
                                    <Text style={styles.btnText}>Connexion...</Text>
                                </View>
                            ) : (
                                <Text style={styles.btnText}>Se connecter</Text>
                            )}
                        </TouchableOpacity>
                    </View>

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
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 48 },

    logoBlock: { alignItems: 'center', marginBottom: 36 },
    logoIcon: {
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    logoText: {
        fontSize: 24, fontWeight: '700', color: COLORS.text,
        letterSpacing: -0.6, marginBottom: 6,
    },
    logoSub: { fontSize: 13.5, color: COLORS.textMuted, textAlign: 'center' },

    card: {
        backgroundColor: COLORS.white, borderRadius: 20,
        padding: 24, marginBottom: 24,
        borderWidth: 1, borderColor: COLORS.border,
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },

    errorBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: COLORS.redBg, borderWidth: 1, borderColor: COLORS.redBorder,
        borderRadius: 10, padding: 11, marginBottom: 18,
    },
    errorDot: {
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: COLORS.red, marginTop: 5, flexShrink: 0,
    },
    errorText: { flex: 1, fontSize: 13, color: '#B91C1C', lineHeight: 19 },

    label: {
        fontSize: 12.5, fontWeight: '600', color: '#475569',
        marginBottom: 7, letterSpacing: 0.1,
    },
    input: {
        backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: COLORS.border,
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
        fontSize: 15, color: COLORS.text,
    },
    inputFocused: {
        borderColor: COLORS.blue,
        backgroundColor: COLORS.white,
        shadowColor: COLORS.blue,
        shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
    },
    eyeBtn: {
        position: 'absolute', right: 13,
        top: '50%', marginTop: -12, padding: 4,
    },
    forgotLink: {
        fontSize: 12.5, color: COLORS.textMuted,
        fontWeight: '500',
    },

    btn: {
        backgroundColor: COLORS.primary, borderRadius: 12,
        paddingVertical: 15, alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2, shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    btnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    btnText: { color: 'white', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
    spinner: {
        width: 15, height: 15, borderRadius: 8,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
        borderTopColor: 'white',
    },

    registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    registerText: { fontSize: 13.5, color: COLORS.textMuted },
    registerLink: { fontSize: 13.5, color: COLORS.primary, fontWeight: '700' },
});
