import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    blueBorder:'#bfdbfe',
    amber:     '#f59e0b',
    amberBg:   '#fffbeb',
    amberBorder:'#fde68a',
    red:       '#ef4444',
    redBg:     '#fef2f2',
    redBorder: '#fecaca',
};

function InputField({ label, value, onChangeText, placeholder, hint }) {
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
                secureTextEntry
                autoCapitalize="none"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
    );
}

export default function ChangePasswordScreen() {
    const { user, login } = useAuth();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');
        if (!password || !confirm) { setError('Veuillez remplir tous les champs.'); return; }
        if (password.length < 12) { setError('Le mot de passe doit contenir au moins 12 caractères.'); return; }
        if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }

        setLoading(true);
        try {
            await API.post('/auth/first-login-password', { password });
            const token = await AsyncStorage.getItem('token');
            const updatedUser = { ...user, first_login: 0 };
            await login(updatedUser, token);
            Alert.alert('Succès', 'Votre mot de passe a été défini.');
        } catch (err) {
            setError(err.response?.data?.message ?? 'Une erreur est survenue.');
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
                    </View>

                    {/* ALERTE INFO */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoIcon}>○</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoTitle}>Première connexion</Text>
                            <Text style={styles.infoSub}>
                                Définissez votre mot de passe personnel pour sécuriser votre compte.
                            </Text>
                        </View>
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
                            label="Nouveau mot de passe"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Minimum 12 caractères"
                            hint="Au moins 12 caractères requis"
                        />
                        <InputField
                            label="Confirmer le mot de passe"
                            value={confirm}
                            onChangeText={setConfirm}
                            placeholder="Répétez votre mot de passe"
                        />

                        <TouchableOpacity
                            style={[styles.btn, loading && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <View style={styles.btnLoadingRow}>
                                    <View style={styles.spinner} />
                                    <Text style={styles.btnText}>Enregistrement...</Text>
                                </View>
                            ) : (
                                <Text style={styles.btnText}>Valider mon mot de passe</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },

    logoBlock: { alignItems: 'center', marginBottom: 24 },
    logoIcon: {
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: COLORS.blue,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    logoText: {
        fontSize: 22, fontWeight: '700', color: COLORS.text, letterSpacing: -0.5,
    },

    infoBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: COLORS.amberBg, borderWidth: 1, borderColor: COLORS.amberBorder,
        borderRadius: 10, padding: 12, marginBottom: 20,
    },
    infoIcon: { fontSize: 14, color: COLORS.amber, marginTop: 1 },
    infoTitle: { fontSize: 13, fontWeight: '700', color: '#92400e', marginBottom: 3 },
    infoSub: { fontSize: 12.5, color: '#92400e', lineHeight: 18 },

    card: {
        backgroundColor: COLORS.white, borderRadius: 16,
        padding: 22, borderWidth: 1, borderColor: COLORS.border,
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
        shadowOpacity: 0.12, shadowRadius: 4, elevation: 2,
    },
    hint: { fontSize: 11.5, color: COLORS.textLight, marginTop: 4 },

    btn: {
        backgroundColor: COLORS.blue, borderRadius: 10,
        paddingVertical: 14, alignItems: 'center', marginTop: 4,
    },
    btnText: { color: 'white', fontSize: 15, fontWeight: '600' },
    btnLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    spinner: {
        width: 14, height: 14, borderRadius: 7,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white',
    },
});