import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import API from '../services/api';

const COLORS = {
    bg:          '#f8fafc',
    white:       '#ffffff',
    border:      '#e2e8f0',
    text:        '#0f172a',
    textMuted:   '#64748b',
    textLight:   '#94a3b8',
    blue:        '#1d4ed8',
    blueMid:     '#3b82f6',
    blueBg:      '#eff6ff',
    blueBorder:  '#bfdbfe',
    green:       '#10b981',
    greenBg:     '#f0fdf4',
    greenBorder: '#bbf7d0',
    amber:       '#f59e0b',
    amberBg:     '#fffbeb',
    amberBorder: '#fde68a',
    red:         '#ef4444',
    redBg:       '#fef2f2',
    redBorder:   '#fecaca',
};

function InputField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, hint }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={{ marginBottom: 13 }}>
            <Text style={styles.label}>{label} <Text style={{ color: COLORS.red }}>*</Text></Text>
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
            {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
    );
}

export default function RegisterScreen({ navigation }) {
    const [form, setForm] = useState({
        username: '', nom: '', email: '', password: '', password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');
        if (!form.username || !form.nom || !form.email || !form.password) {
            setError('Veuillez remplir tous les champs.'); return;
        }
        if (form.password !== form.password_confirmation) {
            setError('Les mots de passe ne correspondent pas.'); return;
        }
        if (form.password.length < 12) {
            setError('Le mot de passe doit contenir au moins 12 caractères.'); return;
        }
        setLoading(true);
        try {
            await API.post('/register', {
                username: form.username,
                nom:      form.nom,
                email:    form.email,
                password: form.password,
            });
            setSuccess(true);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.errors
                ? Object.values(data.errors)[0][0]
                : data?.message ?? "Erreur lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    // SUCCÈS
    if (success) return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                    <Text style={{ fontSize: 26, color: COLORS.green }}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Demande envoyée</Text>
                <Text style={styles.successText}>
                    Votre compte est en attente de validation par un administrateur. Vous recevrez vos accès par email une fois validé.
                </Text>
                <TouchableOpacity
                    style={styles.btn}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.btnText}>Retour à la connexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

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
                        <Text style={styles.logoSub}>Rejoignez votre espace de travail</Text>
                    </View>

                    {/* CARD */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Créer un compte</Text>

                        {error !== '' && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorDot}>●</Text>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <InputField
                            label="Nom complet"
                            value={form.nom}
                            onChangeText={v => setForm({ ...form, nom: v })}
                            placeholder="Jean Dupont"
                            autoCapitalize="words"
                        />
                        <InputField
                            label="Nom d'utilisateur"
                            value={form.username}
                            onChangeText={v => setForm({ ...form, username: v })}
                            placeholder="jean.dupont"
                        />
                        <InputField
                            label="Email"
                            value={form.email}
                            onChangeText={v => setForm({ ...form, email: v })}
                            placeholder="jean@example.com"
                            keyboardType="email-address"
                        />
                        <InputField
                            label="Mot de passe"
                            value={form.password}
                            onChangeText={v => setForm({ ...form, password: v })}
                            placeholder="Minimum 12 caractères"
                            secureTextEntry
                            hint="Au moins 12 caractères requis"
                        />
                        <InputField
                            label="Confirmer le mot de passe"
                            value={form.password_confirmation}
                            onChangeText={v => setForm({ ...form, password_confirmation: v })}
                            placeholder="Répétez votre mot de passe"
                            secureTextEntry
                        />

                        {/* AVERTISSEMENT */}
                        <View style={styles.warningBox}>
                            <Text style={styles.warningIcon}>○</Text>
                            <Text style={styles.warningText}>
                                Votre compte sera <Text style={{ fontWeight: '700' }}>en attente</Text> jusqu'à validation par un administrateur.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.btn, loading && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <View style={styles.btnLoadingRow}>
                                    <View style={styles.spinner} />
                                    <Text style={styles.btnText}>Création en cours...</Text>
                                </View>
                            ) : (
                                <Text style={styles.btnText}>Créer mon compte</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        style={styles.loginRow}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.loginText}>Déjà un compte ? </Text>
                        <Text style={styles.loginLink}>Se connecter</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },

    logoBlock: { alignItems: 'center', marginTop: 16, marginBottom: 28 },
    logoIcon: {
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: COLORS.blue,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    logoText: { fontSize: 22, fontWeight: '700', color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 },
    logoSub: { fontSize: 13, color: COLORS.textMuted },

    card: {
        backgroundColor: COLORS.white, borderRadius: 16,
        padding: 22, borderWidth: 1, borderColor: COLORS.border,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 17, fontWeight: '700', color: COLORS.text,
        letterSpacing: -0.3, marginBottom: 18,
    },

    errorBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        backgroundColor: COLORS.redBg, borderWidth: 1, borderColor: COLORS.redBorder,
        borderRadius: 8, padding: 10, marginBottom: 14,
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

    warningBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        backgroundColor: COLORS.amberBg, borderWidth: 1, borderColor: COLORS.amberBorder,
        borderRadius: 9, padding: 11, marginBottom: 18,
    },
    warningIcon: { fontSize: 13, color: COLORS.amber, marginTop: 1 },
    warningText: { flex: 1, fontSize: 12.5, color: '#92400e', lineHeight: 18 },

    btn: {
        backgroundColor: COLORS.blue, borderRadius: 10,
        paddingVertical: 14, alignItems: 'center',
    },
    btnText: { color: 'white', fontSize: 15, fontWeight: '600' },
    btnLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    spinner: {
        width: 14, height: 14, borderRadius: 7,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white',
    },

    loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    loginText: { fontSize: 13.5, color: COLORS.textMuted },
    loginLink: { fontSize: 13.5, color: COLORS.blue, fontWeight: '600' },

    // Succès
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    successIcon: {
        width: 72, height: 72, borderRadius: 18,
        backgroundColor: COLORS.greenBg, borderWidth: 1, borderColor: COLORS.greenBorder,
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    successTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, letterSpacing: -0.4, marginBottom: 10 },
    successText: {
        fontSize: 14, color: COLORS.textMuted, textAlign: 'center',
        lineHeight: 22, marginBottom: 28,
    },
});