import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, 
    KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
    bg:          '#F8FAFC',
    white:       '#FFFFFF',
    border:      '#E2E8F0',
    text:        '#0F172A',
    textMuted:   '#64748B',
    textLight:   '#94A3B8',
    primary:     '#0F172A',
    indigo:      '#6366F1',
    indigoBg:    '#EEF2FF',
    indigoBorder:'#C7D2FE',
    amber:       '#F59E0B',
    amberBg:     '#FFFBEB',
    amberBorder: '#FDE68A',
    green:       '#10B981',
    greenBg:     '#ECFDF5',
    greenBorder: '#A7F3D0',
    red:         '#EF4444',
    redBg:       '#FEF2F2',
    redBorder:   '#FECACA',
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

function PwStrengthBar({ password }) {
    if (!password) return null;
    const checks = [
        password.length >= 12,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
        /[@$!%*#?&^_\-+=]/.test(password),
    ];
    const score    = checks.filter(Boolean).length;
    const barColor = ['#EF4444','#F97316','#EAB308','#22C55E','#10B981'][score - 1] ?? '#E2E8F0';
    const labels   = ['12+ car.','Maj.','Min.','Chiffre','Spécial'];
    return (
        <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection:'row', gap:3, marginBottom:7 }}>
                {checks.map((ok, i) => (
                    <View key={i} style={{
                        flex:1, height:3, borderRadius:2,
                        backgroundColor: i < score ? barColor : COLORS.border,
                    }} />
                ))}
            </View>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
                {checks.map((ok, i) => (
                    <Text key={i} style={{
                        fontSize:10.5,
                        color: ok ? COLORS.green : COLORS.textLight,
                        fontWeight: ok ? '600' : '400',
                    }}>
                        {ok ? '✓' : '○'} {labels[i]}
                    </Text>
                ))}
            </View>
        </View>
    );
}

function InputField({ label, value, onChangeText, placeholder, hint, showStrength }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={{ marginBottom: 16 }}>
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
            {showStrength && <PwStrengthBar password={value} />}
        </View>
    );
}

export default function ChangePasswordScreen() {
    const { user, login } = useAuth();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    const handleSubmit = async () => {
        setError('');
        if (!password || !confirm)        { setError('Veuillez remplir tous les champs.'); return; }
        if (password.length < 12)         { setError('Le mot de passe doit contenir au moins 12 caractères.'); return; }
        if (!/[A-Z]/.test(password))      { setError('Ajoutez au moins une majuscule.'); return; }
        if (!/[0-9]/.test(password))      { setError('Ajoutez au moins un chiffre.'); return; }
        if (!/[@$!%*#?&^_\-+=]/.test(password)) { setError('Ajoutez un caractère spécial.'); return; }
        if (password !== confirm)         { setError('Les mots de passe ne correspondent pas.'); return; }

        setLoading(true);
        try {
            await API.post('/auth/first-login-password', { password });
            const token       = await AsyncStorage.getItem('token');
            const updatedUser = { ...user, first_login: 0 };
            await login(updatedUser, token);
            Alert.alert('Succès', 'Votre mot de passe a été défini.');
        } catch (err) {
            setError(err.response?.data?.message ?? 'Une erreur est survenue.');
        } finally { setLoading(false); }
    };

    const match = password && confirm && password === confirm;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    {/* ── Logo ── */}
                    <View style={styles.logoBlock}>
                        <View style={styles.logoIcon}>
                            <LogoIcon />
                        </View>
                        <Text style={styles.logoText}>ProjectFlow</Text>
                        <Text style={styles.logoSub}>Première connexion</Text>
                    </View>

                    {/* ── Bannière info ── */}
                    <View style={styles.infoBox}>
                        <View style={styles.infoDot} />
                        <View style={{ flex:1 }}>
                            <Text style={styles.infoTitle}>Définissez votre mot de passe</Text>
                            <Text style={styles.infoSub}>
                                Choisissez un mot de passe personnel sécurisé pour protéger votre compte.
                            </Text>
                        </View>
                    </View>

                    {/* ── Card ── */}
                    <View style={styles.card}>

                        {error !== '' && (
                            <View style={styles.errorBox}>
                                <View style={styles.errorDot} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <InputField
                            label="Nouveau mot de passe"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Minimum 12 caractères"
                            showStrength
                        />

                        <InputField
                            label="Confirmer le mot de passe"
                            value={confirm}
                            onChangeText={setConfirm}
                            placeholder="Répétez votre mot de passe"
                        />

                        {/* Indicateur correspondance */}
                        {confirm !== '' && (
                            <Text style={{
                                fontSize:11.5, marginTop:-8, marginBottom:16,
                                fontWeight:'500',
                                color: match ? COLORS.green : COLORS.red,
                            }}>
                                {match ? '✓ Les mots de passe correspondent' : '✗ Ne correspondent pas'}
                            </Text>
                        )}

                        <TouchableOpacity
                            style={[styles.btn, loading && { opacity:0.7 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <View style={styles.btnRow}>
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
    safe:   { flex:1, backgroundColor:COLORS.bg },
    scroll: { flexGrow:1, justifyContent:'center', padding:24, paddingBottom:48 },

    /* Logo */
    logoBlock: { alignItems:'center', marginBottom:28 },
    logoIcon: {
        width:56, height:56, borderRadius:16,
        backgroundColor:COLORS.primary,
        alignItems:'center', justifyContent:'center', marginBottom:16,
        shadowColor:COLORS.primary, shadowOpacity:0.25, shadowRadius:12,
        shadowOffset:{ width:0, height:4 }, elevation:6,
    },
    logoText: { fontSize:24, fontWeight:'700', color:COLORS.text, letterSpacing:-0.6, marginBottom:5 },
    logoSub:  { fontSize:13.5, color:COLORS.textMuted },

    /* Info box */
    infoBox: {
        flexDirection:'row', alignItems:'flex-start', gap:11,
        backgroundColor:COLORS.amberBg, borderWidth:1, borderColor:COLORS.amberBorder,
        borderRadius:12, padding:14, marginBottom:20,
    },
    infoDot:   { width:8, height:8, borderRadius:4, backgroundColor:COLORS.amber, marginTop:4, flexShrink:0 },
    infoTitle: { fontSize:13, fontWeight:'700', color:'#92400E', marginBottom:4 },
    infoSub:   { fontSize:12.5, color:'#92400E', lineHeight:19 },

    /* Card */
    card: {
        backgroundColor:COLORS.white, borderRadius:20,
        padding:24, borderWidth:1, borderColor:COLORS.border,
        shadowColor:'#0F172A', shadowOpacity:0.06, shadowRadius:16,
        shadowOffset:{ width:0, height:4 }, elevation:3,
    },

    /* Error */
    errorBox: {
        flexDirection:'row', alignItems:'flex-start', gap:10,
        backgroundColor:COLORS.redBg, borderWidth:1, borderColor:COLORS.redBorder,
        borderRadius:10, padding:11, marginBottom:16,
    },
    errorDot:  { width:6, height:6, borderRadius:3, backgroundColor:COLORS.red, marginTop:5, flexShrink:0 },
    errorText: { flex:1, fontSize:13, color:'#B91C1C', lineHeight:19 },

    /* Input */
    label: { fontSize:12.5, fontWeight:'600', color:'#475569', marginBottom:7, letterSpacing:0.1 },
    input: {
        backgroundColor:'#FAFAFA', borderWidth:1, borderColor:COLORS.border,
        borderRadius:12, paddingHorizontal:14, paddingVertical:13,
        fontSize:15, color:COLORS.text,
    },
    inputFocused: {
        borderColor:COLORS.indigo, backgroundColor:COLORS.white,
        shadowColor:COLORS.indigo, shadowOpacity:0.1, shadowRadius:6, elevation:2,
    },
    hint: { fontSize:11.5, color:COLORS.textLight, marginTop:4 },

    /* Bouton */
    btn: {
        backgroundColor:COLORS.primary, borderRadius:12,
        paddingVertical:15, alignItems:'center',
        shadowColor:COLORS.primary, shadowOpacity:0.2, shadowRadius:8,
        shadowOffset:{ width:0, height:3 }, elevation:4,
    },
    btnRow:  { flexDirection:'row', alignItems:'center', gap:10 },
    btnText: { color:'white', fontSize:15, fontWeight:'700', letterSpacing:-0.2 },
    spinner: {
        width:15, height:15, borderRadius:8,
        borderWidth:2, borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white',
    },
});
