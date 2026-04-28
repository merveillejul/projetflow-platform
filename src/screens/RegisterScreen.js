import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../services/api';
import Svg, { Path, Rect, Line } from 'react-native-svg';

const COLORS = {
    bg:          '#F8FAFC',
    white:       '#FFFFFF',
    border:      '#E2E8F0',
    text:        '#0F172A',
    textMuted:   '#64748B',
    textLight:   '#94A3B8',
    primary:     '#0F172A',
    blue:        '#6366F1',
    blueBg:      '#EEF2FF',
    blueBorder:  '#C7D2FE',
    green:       '#10B981',
    greenBg:     '#ECFDF5',
    greenBorder: '#A7F3D0',
    amber:       '#F59E0B',
    amberBg:     '#FFFBEB',
    amberBorder: '#FDE68A',
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

function InputField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, hint, required }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>
                {label}{required && <Text style={{ color: COLORS.red }}> *</Text>}
            </Text>
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
    const [form, setForm] = useState({ username:'', nom:'', email:'', password:'', password_confirmation:'' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState('');

    const handleSubmit = async () => {
        setError('');
        if (!form.username || !form.nom || !form.email || !form.password) { setError('Veuillez remplir tous les champs.'); return; }
        if (form.password !== form.password_confirmation) { setError('Les mots de passe ne correspondent pas.'); return; }
        if (form.password.length < 12) { setError('Le mot de passe doit contenir au moins 12 caractères.'); return; }
        setLoading(true);
        try {
            await API.post('/register', { username:form.username, nom:form.nom, email:form.email, password:form.password });
            setSuccess(true);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.errors ? Object.values(data.errors)[0][0] : data?.message ?? "Erreur lors de l'inscription.");
        } finally { setLoading(false); }
    };

    if (success) return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                    <Svg width="28" height="28" fill="none" stroke={COLORS.green} strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <Path d="M20 6L9 17l-5-5"/>
                    </Svg>
                </View>
                <Text style={styles.successTitle}>Demande envoyée</Text>
                <Text style={styles.successText}>
                    Votre compte est en attente de validation par un administrateur. Vous recevrez vos accès par email une fois validé.
                </Text>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
                    <Text style={styles.btnText}>Retour à la connexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* LOGO */}
                    <View style={styles.logoBlock}>
                        <View style={styles.logoIcon}><LogoIcon /></View>
                        <Text style={styles.logoText}>ProjectFlow</Text>
                        <Text style={styles.logoSub}>Rejoignez votre espace de travail</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Créer un compte</Text>

                        {error !== '' && (
                            <View style={styles.errorBox}>
                                <View style={styles.errorDot} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <InputField label="Nom complet"         required value={form.nom}                   onChangeText={v => setForm({...form, nom:v})}                   placeholder="Jean Dupont"              autoCapitalize="words" />
                        <InputField label="Nom d'utilisateur"   required value={form.username}              onChangeText={v => setForm({...form, username:v})}              placeholder="jean.dupont" />
                        <InputField label="Email"               required value={form.email}                 onChangeText={v => setForm({...form, email:v})}                 placeholder="jean@example.com"         keyboardType="email-address" />
                        <InputField label="Mot de passe"        required value={form.password}              onChangeText={v => setForm({...form, password:v})}              placeholder="12 caractères minimum"    secureTextEntry hint="Au moins 12 caractères requis" />
                        <InputField label="Confirmer"           required value={form.password_confirmation} onChangeText={v => setForm({...form, password_confirmation:v})} placeholder="Répétez votre mot de passe" secureTextEntry />

                        {/* Avertissement */}
                        <View style={styles.warningBox}>
                            <View style={styles.warningDot} />
                            <Text style={styles.warningText}>
                                Votre compte sera <Text style={{ fontWeight:'700' }}>en attente</Text> jusqu'à validation par un administrateur.
                            </Text>
                        </View>

                        <TouchableOpacity style={[styles.btn, loading && { opacity:0.7 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                            {loading ? (
                                <View style={styles.btnRow}>
                                    <View style={styles.spinner} />
                                    <Text style={styles.btnText}>Création en cours...</Text>
                                </View>
                            ) : <Text style={styles.btnText}>Créer mon compte</Text>}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginRow} activeOpacity={0.7}>
                        <Text style={styles.loginText}>Déjà un compte ? </Text>
                        <Text style={styles.loginLink}>Se connecter</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:   { flex:1, backgroundColor:COLORS.bg },
    scroll: { flexGrow:1, padding:24, paddingBottom:48 },

    logoBlock: { alignItems:'center', marginTop:8, marginBottom:32 },
    logoIcon: {
        width:56, height:56, borderRadius:16,
        backgroundColor:COLORS.primary,
        alignItems:'center', justifyContent:'center', marginBottom:16,
        shadowColor:COLORS.primary, shadowOpacity:0.25, shadowRadius:12,
        shadowOffset:{ width:0, height:4 }, elevation:6,
    },
    logoText: { fontSize:24, fontWeight:'700', color:COLORS.text, letterSpacing:-0.6, marginBottom:6 },
    logoSub:  { fontSize:13.5, color:COLORS.textMuted },

    card: {
        backgroundColor:COLORS.white, borderRadius:20, padding:24,
        marginBottom:24, borderWidth:1, borderColor:COLORS.border,
        shadowColor:'#0F172A', shadowOpacity:0.06, shadowRadius:16,
        shadowOffset:{ width:0, height:4 }, elevation:3,
    },
    cardTitle: { fontSize:18, fontWeight:'700', color:COLORS.text, letterSpacing:-0.3, marginBottom:20 },

    errorBox: {
        flexDirection:'row', alignItems:'flex-start', gap:10,
        backgroundColor:COLORS.redBg, borderWidth:1, borderColor:COLORS.redBorder,
        borderRadius:10, padding:11, marginBottom:16,
    },
    errorDot: { width:6, height:6, borderRadius:3, backgroundColor:COLORS.red, marginTop:5, flexShrink:0 },
    errorText: { flex:1, fontSize:13, color:'#B91C1C', lineHeight:19 },

    label: { fontSize:12.5, fontWeight:'600', color:'#475569', marginBottom:7, letterSpacing:0.1 },
    input: {
        backgroundColor:'#FAFAFA', borderWidth:1, borderColor:COLORS.border,
        borderRadius:12, paddingHorizontal:14, paddingVertical:13,
        fontSize:15, color:COLORS.text,
    },
    inputFocused: {
        borderColor:COLORS.blue, backgroundColor:COLORS.white,
        shadowColor:COLORS.blue, shadowOpacity:0.1, shadowRadius:6, elevation:2,
    },
    hint: { fontSize:11.5, color:COLORS.textLight, marginTop:4 },

    warningBox: {
        flexDirection:'row', alignItems:'flex-start', gap:10,
        backgroundColor:COLORS.amberBg, borderWidth:1, borderColor:COLORS.amberBorder,
        borderRadius:10, padding:11, marginBottom:20,
    },
    warningDot: { width:6, height:6, borderRadius:3, backgroundColor:COLORS.amber, marginTop:5, flexShrink:0 },
    warningText: { flex:1, fontSize:12.5, color:'#92400E', lineHeight:19 },

    btn: {
        backgroundColor:COLORS.primary, borderRadius:12, paddingVertical:15, alignItems:'center',
        shadowColor:COLORS.primary, shadowOpacity:0.2, shadowRadius:8,
        shadowOffset:{ width:0, height:3 }, elevation:4,
    },
    btnRow:   { flexDirection:'row', alignItems:'center', gap:10 },
    btnText:  { color:'white', fontSize:15, fontWeight:'700', letterSpacing:-0.2 },
    spinner:  { width:15, height:15, borderRadius:8, borderWidth:2, borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' },

    loginRow: { flexDirection:'row', justifyContent:'center', alignItems:'center' },
    loginText: { fontSize:13.5, color:COLORS.textMuted },
    loginLink: { fontSize:13.5, color:COLORS.primary, fontWeight:'700' },

    successContainer: { flex:1, justifyContent:'center', alignItems:'center', padding:32 },
    successIcon: {
        width:72, height:72, borderRadius:20,
        backgroundColor:COLORS.greenBg, borderWidth:1, borderColor:COLORS.greenBorder,
        alignItems:'center', justifyContent:'center', marginBottom:24,
    },
    successTitle: { fontSize:22, fontWeight:'700', color:COLORS.text, letterSpacing:-0.4, marginBottom:12 },
    successText:  { fontSize:14, color:COLORS.textMuted, textAlign:'center', lineHeight:22, marginBottom:32 },
});