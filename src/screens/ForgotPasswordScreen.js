import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, 
    KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import API from '../services/api';
import Svg, { Rect, Path, Polyline } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
    bg:          '#F8FAFC',
    white:       '#FFFFFF',
    border:      '#E2E8F0',
    text:        '#0F172A',
    textMuted:   '#64748B',
    textLight:   '#94A3B8',
    primary:     '#0F172A',
    blue:        '#6366F1',
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

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail]     = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState('');
    const [focused, setFocused] = useState(false);

    const handleSubmit = async () => {
        setError('');
        if (!email) { setError('Veuillez entrer votre adresse email.'); return; }
        setLoading(true);
        try {
            await API.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch { setError('Une erreur est survenue. Veuillez réessayer.'); }
        finally { setLoading(false); }
    };

    if (success) return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                    <Svg width="28" height="28" fill="none" stroke={COLORS.green} strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <Polyline points="22,6 12,13 2,6"/>
                    </Svg>
                </View>
                <Text style={styles.successTitle}>Email envoyé</Text>
                <Text style={styles.successText}>
                    Si cet email est enregistré dans notre système, vous recevrez un lien de réinitialisation dans quelques instants.
                </Text>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
                    <Text style={styles.btnText}>Retour à la connexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Retour */}
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
                        <Text style={styles.backText}>← Retour</Text>
                    </TouchableOpacity>

                    {/* LOGO */}
                    <View style={styles.logoBlock}>
                        <View style={styles.logoIcon}><LogoIcon /></View>
                        <Text style={styles.logoText}>ProjectFlow</Text>
                        <Text style={styles.logoSub}>Réinitialisation du mot de passe</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Mot de passe oublié</Text>
                        <Text style={styles.cardDesc}>
                            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                        </Text>

                        {error !== '' && (
                            <View style={styles.errorBox}>
                                <View style={styles.errorDot} />
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

                        <TouchableOpacity style={[styles.btn, { marginTop:24 }, loading && { opacity:0.7 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                            {loading ? (
                                <View style={styles.btnRow}>
                                    <View style={styles.spinner} />
                                    <Text style={styles.btnText}>Envoi en cours...</Text>
                                </View>
                            ) : <Text style={styles.btnText}>Envoyer le lien</Text>}
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

    backBtn: { marginBottom:20, alignSelf:'flex-start' },
    backText: { fontSize:14, color:COLORS.textMuted, fontWeight:'500' },

    logoBlock: { alignItems:'center', marginBottom:32 },
    logoIcon: {
        width:56, height:56, borderRadius:16, backgroundColor:COLORS.primary,
        alignItems:'center', justifyContent:'center', marginBottom:16,
        shadowColor:COLORS.primary, shadowOpacity:0.25, shadowRadius:12,
        shadowOffset:{ width:0, height:4 }, elevation:6,
    },
    logoText: { fontSize:24, fontWeight:'700', color:COLORS.text, letterSpacing:-0.6, marginBottom:6 },
    logoSub:  { fontSize:13.5, color:COLORS.textMuted },

    card: {
        backgroundColor:COLORS.white, borderRadius:20, padding:24, marginBottom:24,
        borderWidth:1, borderColor:COLORS.border,
        shadowColor:'#0F172A', shadowOpacity:0.06, shadowRadius:16,
        shadowOffset:{ width:0, height:4 }, elevation:3,
    },
    cardTitle: { fontSize:18, fontWeight:'700', color:COLORS.text, letterSpacing:-0.3, marginBottom:8 },
    cardDesc:  { fontSize:13.5, color:COLORS.textMuted, lineHeight:21, marginBottom:20 },

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

    btn: {
        backgroundColor:COLORS.primary, borderRadius:12, paddingVertical:15, alignItems:'center',
        shadowColor:COLORS.primary, shadowOpacity:0.2, shadowRadius:8,
        shadowOffset:{ width:0, height:3 }, elevation:4,
    },
    btnRow:  { flexDirection:'row', alignItems:'center', gap:10 },
    btnText: { color:'white', fontSize:15, fontWeight:'700', letterSpacing:-0.2 },
    spinner: { width:15, height:15, borderRadius:8, borderWidth:2, borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' },

    successContainer: { flex:1, justifyContent:'center', alignItems:'center', padding:32 },
    successIcon: {
        width:72, height:72, borderRadius:20,
        backgroundColor:COLORS.greenBg, borderWidth:1, borderColor:COLORS.greenBorder,
        alignItems:'center', justifyContent:'center', marginBottom:24,
    },
    successTitle: { fontSize:22, fontWeight:'700', color:COLORS.text, letterSpacing:-0.4, marginBottom:12 },
    successText:  { fontSize:14, color:COLORS.textMuted, textAlign:'center', lineHeight:22, marginBottom:32 },
});
