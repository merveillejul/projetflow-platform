import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import API from '../services/api';

const COLORS = {
    bg:         '#f8fafc',
    white:      '#ffffff',
    border:     '#e2e8f0',
    text:       '#0f172a',
    textMuted:  '#64748b',
    textLight:  '#94a3b8',
    blue:       '#1d4ed8',
    blueMid:    '#3b82f6',
    blueBg:     '#eff6ff',
    blueBorder: '#bfdbfe',
    green:      '#10b981',
    greenBg:    '#f0fdf4',
    greenBorder:'#bbf7d0',
    red:        '#ef4444',
    redBg:      '#fef2f2',
    redBorder:  '#fecaca',
};

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState(false);

    const handleSubmit = async () => {
        setError('');
        if (!email) { setError('Veuillez entrer votre adresse email.'); return; }
        setLoading(true);
        try {
            await API.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    // ÉTAT SUCCÈS
    if (success) return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                    <Text style={{ fontSize: 26, color: COLORS.green }}>✉</Text>
                </View>
                <Text style={styles.successTitle}>Email envoyé</Text>
                <Text style={styles.successSub}>
                    Si cet email est enregistré dans notre système, vous recevrez un lien de réinitialisation dans quelques instants.
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
                    {/* RETOUR */}
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.navigate('Login')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Text style={styles.backText}>← Retour</Text>
                    </TouchableOpacity>

                    {/* LOGO */}
                    <View style={styles.logoBlock}>
                        <View style={styles.logoIcon}>
                            <Text style={{ fontSize: 18, color: 'white', fontWeight: '700' }}>⚡</Text>
                        </View>
                        <Text style={styles.logoText}>ProjectFlow</Text>
                        <Text style={styles.logoSub}>Réinitialisation du mot de passe</Text>
                    </View>

                    {/* CARD */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Mot de passe oublié</Text>
                        <Text style={styles.cardDesc}>
                            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                        </Text>

                        {error !== '' && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorDot}>●</Text>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <Text style={styles.label}>Adresse email</Text>
                        <TextInput
                            style={[styles.input, focused && styles.inputFocused]}
                            placeholder="votre@email.fr"
                            placeholderTextColor={COLORS.textLight}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                        />

                        <TouchableOpacity
                            style={[styles.btn, loading && { opacity: 0.7 }, { marginTop: 20 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <View style={styles.btnLoadingRow}>
                                    <View style={styles.spinner} />
                                    <Text style={styles.btnText}>Envoi en cours...</Text>
                                </View>
                            ) : (
                                <Text style={styles.btnText}>Envoyer le lien</Text>
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

    backBtn: { marginBottom: 24, alignSelf: 'flex-start' },
    backText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },

    logoBlock: { alignItems: 'center', marginBottom: 28 },
    logoIcon: {
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: COLORS.blue,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    logoText: {
        fontSize: 22, fontWeight: '700', color: COLORS.text,
        letterSpacing: -0.5, marginBottom: 4,
    },
    logoSub: { fontSize: 13, color: COLORS.textMuted },

    card: {
        backgroundColor: COLORS.white, borderRadius: 16,
        padding: 22, borderWidth: 1, borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 17, fontWeight: '700', color: COLORS.text,
        letterSpacing: -0.3, marginBottom: 6,
    },
    cardDesc: {
        fontSize: 13.5, color: COLORS.textMuted,
        lineHeight: 20, marginBottom: 20,
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

    // Succès
    successContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32,
    },
    successIcon: {
        width: 72, height: 72, borderRadius: 18,
        backgroundColor: COLORS.greenBg, borderWidth: 1, borderColor: COLORS.greenBorder,
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    successTitle: {
        fontSize: 22, fontWeight: '700', color: COLORS.text,
        letterSpacing: -0.4, marginBottom: 10,
    },
    successSub: {
        fontSize: 14, color: COLORS.textMuted, textAlign: 'center',
        lineHeight: 22, marginBottom: 28,
    },
});