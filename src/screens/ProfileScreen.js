import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, TextInput, Alert, Image, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Svg, { Path, Rect, Circle, Polyline, Line } from 'react-native-svg';

const COLORS = {
    bg:          '#F8FAFC',
    white:       '#FFFFFF',
    border:      '#E2E8F0',
    borderLight: '#F1F5F9',
    text:        '#0F172A',
    textMuted:   '#64748B',
    textLight:   '#94A3B8',
    primary:     '#0F172A',
    indigo:      '#6366F1',
    indigoBg:    '#EEF2FF',
    indigoBorder:'#C7D2FE',
    green:       '#10B981',
    greenBg:     '#ECFDF5',
    greenBorder: '#A7F3D0',
    amber:       '#F59E0B',
    amberBg:     '#FFFBEB',
    red:         '#EF4444',
    redBg:       '#FEF2F2',
    redBorder:   '#FECACA',
};

const ROLE_CONFIG = {
    admin:  { color:'#DC2626', bg:'#FEF2F2', border:'#FECACA', label:'Administrateur', heroFrom:'#7F1D1D', heroTo:'#DC2626', avatarBg:'#B91C1C' },
    chef:   { color:'#0F172A', bg:'#F1F5F9', border:'#E2E8F0', label:'Chef de projet',  heroFrom:'#0F172A', heroTo:'#334155', avatarBg:'#1E293B' },
    membre: { color:'#059669', bg:'#ECFDF5', border:'#A7F3D0', label:'Membre',           heroFrom:'#064E3B', heroTo:'#059669', avatarBg:'#047857' },
};
const getRoleConf = (r) => ROLE_CONFIG[r] ?? { color:'#475569', bg:'#F8FAFC', border:'#E2E8F0', label:r, heroFrom:'#0F172A', heroTo:'#334155', avatarBg:'#475569' };

/* ─── Icônes ────────────────────────────────────────────────────── */
const IconLock = ({ color=COLORS.indigo, size=14 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Rect x="3" y="11" width="18" height="11" rx="2"/><Path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </Svg>
);
const IconUser = ({ color=COLORS.indigo, size=14 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><Circle cx="12" cy="7" r="4"/>
    </Svg>
);
const IconLogout = ({ color=COLORS.red, size=14 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <Polyline points="16 17 21 12 16 7"/><Line x1="21" y1="12" x2="9" y2="12"/>
    </Svg>
);
const IconCamera = ({ color='#475569', size=12 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <Circle cx="12" cy="13" r="4"/>
    </Svg>
);
const IconCheck = ({ color=COLORS.green, size=13 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Polyline points="20 6 9 17 4 12"/>
    </Svg>
);
const IconSave = ({ color='white', size=14 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <Polyline points="17 21 17 13 7 13 7 21"/><Polyline points="7 3 7 8 15 8"/>
    </Svg>
);

/* ─── Composants ────────────────────────────────────────────────── */
function SectionCard({ icon, title, accentBg=COLORS.indigoBg, children }) {
    return (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
                <View style={[styles.sectionIconBox, { backgroundColor: accentBg }]}>{icon}</View>
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <View style={styles.sectionDivider} />
            <View style={styles.sectionBody}>{children}</View>
        </View>
    );
}

function Field({ label, children }) {
    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {children}
        </View>
    );
}

function StyledInput({ value, onChangeText, placeholder, secureTextEntry, editable=true, keyboardType, autoCapitalize='none' }) {
    const [focused, setFocused] = useState(false);
    return (
        <TextInput
            style={[styles.input, focused && styles.inputFocused, !editable && styles.inputDisabled]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textLight}
            secureTextEntry={secureTextEntry}
            editable={editable}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
}

function SuccessBanner({ text }) {
    return (
        <View style={styles.successBanner}>
            <IconCheck />
            <Text style={styles.successBannerText}>{text}</Text>
        </View>
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
    const score = checks.filter(Boolean).length;
    const barColor = ['#EF4444','#F97316','#EAB308','#22C55E','#10B981'][score - 1] ?? '#E2E8F0';
    const labels   = ['12+ car.','Maj.','Min.','Chiffre','Spécial'];
    return (
        <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection:'row', gap:3, marginBottom:7 }}>
                {checks.map((ok, i) => (
                    <View key={i} style={{ flex:1, height:3, borderRadius:2, backgroundColor: i < score ? barColor : COLORS.borderLight }} />
                ))}
            </View>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:'4px 10px' }}>
                {checks.map((ok, i) => (
                    <Text key={i} style={{ fontSize:10.5, color: ok ? COLORS.green : COLORS.textLight, fontWeight: ok ? '600' : '400' }}>
                        {ok ? '✓' : '○'} {labels[i]}
                    </Text>
                ))}
            </View>
        </View>
    );
}

/* ─── Écran ─────────────────────────────────────────────────────── */
export default function ProfileScreen() {
    const { user, logout, login } = useAuth();
    const roleConf = getRoleConf(user?.role);

    /* Infos personnelles */
    const [infoForm, setInfoForm]       = useState({ nom:'', email:'' });
    const [infoLoading, setInfoLoading] = useState(false);
    const [infoSuccess, setInfoSuccess] = useState(false);
    const [infoError, setInfoError]     = useState('');

    /* Mot de passe */
    const [pwForm, setPwForm]       = useState({ current_password:'', password:'', password_confirmation:'' });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);

    /* Photo */
    const [photoLoading, setPhotoLoading] = useState(false);

    useEffect(() => {
        API.get('/user').then(res => {
            setInfoForm({ nom: res.data.nom ?? '', email: res.data.email ?? '' });
        }).catch(() => {});
    }, []);

    /* ── Enregistrer infos ── */
    const handleSaveInfo = async () => {
        if (!infoForm.nom.trim() || !infoForm.email.trim()) {
            setInfoError('Nom et email sont requis.'); return;
        }
        setInfoError(''); setInfoLoading(true);
        try {
            await API.put('/user', infoForm);
            setInfoSuccess(true);
            setTimeout(() => setInfoSuccess(false), 3000);
        } catch (err) {
            setInfoError(err.response?.data?.message ?? 'Erreur lors de la mise à jour.');
        } finally { setInfoLoading(false); }
    };

    /* ── Photo ── */
    const handlePickPhoto = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { Alert.alert('Permission refusée', "Autorisez l'accès aux photos."); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect:[1,1], quality:0.8,
        });
        if (result.canceled) return;
        setPhotoLoading(true);
        try {
            const fd = new FormData();
            fd.append('photo', { uri:result.assets[0].uri, type:'image/jpeg', name:'photo.jpg' });
            const res = await API.post('/user/photo', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const token = await AsyncStorage.getItem('token');
            await login({ ...user, photo: res.data.photo }, token);
            Alert.alert('Succès', 'Photo mise à jour !');
        } catch { Alert.alert('Erreur', 'Impossible de mettre à jour la photo.'); }
        finally { setPhotoLoading(false); }
    };

    /* ── Mot de passe ── */
    const handleChangePassword = async () => {
        if (!pwForm.current_password) { Alert.alert('Erreur', 'Saisissez votre mot de passe actuel.'); return; }
        if (pwForm.password.length < 12) { Alert.alert('Erreur', '12 caractères minimum.'); return; }
        if (!/[A-Z]/.test(pwForm.password)) { Alert.alert('Erreur', 'Ajoutez une majuscule.'); return; }
        if (!/[0-9]/.test(pwForm.password)) { Alert.alert('Erreur', 'Ajoutez un chiffre.'); return; }
        if (!/[@$!%*#?&^_\-+=]/.test(pwForm.password)) { Alert.alert('Erreur', 'Ajoutez un caractère spécial.'); return; }
        if (pwForm.password !== pwForm.password_confirmation) { Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.'); return; }
        setPwLoading(true);
        try {
            await API.post('/auth/change-password', pwForm);
            setPwSuccess(true);
            setPwForm({ current_password:'', password:'', password_confirmation:'' });
            setTimeout(() => setPwSuccess(false), 3000);
        } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message ?? 'Erreur.');
        } finally { setPwLoading(false); }
    };

    /* ── Déconnexion ── */
    const handleLogout = () => {
        Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
            { text:'Annuler', style:'cancel' },
            { text:'Déconnexion', style:'destructive', onPress: () => {
                API.post('/logout').catch(() => {}).finally(() => logout());
            }},
        ]);
    };

    const pwMatch = pwForm.password && pwForm.password_confirmation && pwForm.password === pwForm.password_confirmation;

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ══ HERO ══ */}
                <View style={[styles.hero, { backgroundColor: roleConf.heroFrom }]}>
                    <View style={styles.heroCircle1} />
                    <View style={styles.heroCircle2} />
                    <View style={styles.heroCircle3} />

                    {/* Avatar */}
                    <TouchableOpacity style={styles.avatarWrap} onPress={handlePickPhoto} disabled={photoLoading} activeOpacity={0.85}>
                        {user?.photo ? (
                            <Image source={{ uri: user.photo }} style={styles.avatarImg} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: roleConf.avatarBg }]}>
                                <Text style={styles.avatarLetter}>{user?.nom?.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        <View style={styles.cameraBadge}>
                            {photoLoading
                                ? <ActivityIndicator size="small" color={COLORS.textMuted} />
                                : <IconCamera />
                            }
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.heroName}>{infoForm.nom || user?.nom}</Text>
                    <Text style={styles.heroUsername}>@{user?.username}</Text>
                    <View style={styles.roleBadge}>
                        <View style={styles.roleDot} />
                        <Text style={styles.roleBadgeText}>{roleConf.label}</Text>
                    </View>
                </View>

                {/* ══ INFO STRIP ══ */}
                <View style={styles.infoStrip}>
                    {[
                        { key:'Email',  val: infoForm.email || user?.email || '—' },
                        { key:'Rôle',   val: roleConf.label },
                        { key:'Statut', val: 'Actif' },
                    ].map((item, i, arr) => (
                        <View key={item.key} style={[styles.infoCell, i < arr.length - 1 && styles.infoCellBorder]}>
                            <Text style={styles.infoCellKey}>{item.key}</Text>
                            <Text style={styles.infoCellVal} numberOfLines={1}>{item.val}</Text>
                        </View>
                    ))}
                </View>

                {/* ══ CONTENU ══ */}
                <View style={styles.content}>

                    {/* ── Informations personnelles ── */}
                    <SectionCard
                        icon={<IconUser />}
                        title="Informations personnelles"
                        accentBg={COLORS.indigoBg}
                    >
                        {infoSuccess && <SuccessBanner text="Profil mis à jour !" />}
                        {infoError !== '' && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{infoError}</Text>
                            </View>
                        )}

                        <Field label="Nom complet">
                            <StyledInput
                                value={infoForm.nom}
                                onChangeText={v => setInfoForm({...infoForm, nom:v})}
                                placeholder="Jean Dupont"
                                autoCapitalize="words"
                            />
                        </Field>

                        <Field label="Adresse email">
                            <StyledInput
                                value={infoForm.email}
                                onChangeText={v => setInfoForm({...infoForm, email:v})}
                                placeholder="votre@email.fr"
                                keyboardType="email-address"
                            />
                        </Field>

                        <Field label="Nom d'utilisateur">
                            <StyledInput
                                value={user?.username ?? ''}
                                editable={false}
                                placeholder="username"
                            />
                            <Text style={styles.fieldHint}>Non modifiable</Text>
                        </Field>

                        <TouchableOpacity
                            style={[styles.btnPrimary, infoLoading && { opacity:0.7 }]}
                            onPress={handleSaveInfo}
                            disabled={infoLoading}
                            activeOpacity={0.85}
                        >
                            {infoLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <View style={styles.btnRow}>
                                    <IconSave />
                                    <Text style={styles.btnPrimaryText}>Enregistrer</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </SectionCard>

                    {/* ── Mot de passe ── */}
                    <SectionCard
                        icon={<IconLock />}
                        title="Changer le mot de passe"
                        accentBg={COLORS.indigoBg}
                    >
                        {pwSuccess && <SuccessBanner text="Mot de passe mis à jour !" />}

                        <Field label="Mot de passe actuel">
                            <StyledInput
                                value={pwForm.current_password}
                                onChangeText={v => setPwForm({...pwForm, current_password:v})}
                                placeholder="••••••••"
                                secureTextEntry
                            />
                        </Field>

                        <Field label="Nouveau mot de passe">
                            <StyledInput
                                value={pwForm.password}
                                onChangeText={v => setPwForm({...pwForm, password:v})}
                                placeholder="12 caractères minimum"
                                secureTextEntry
                            />
                            <PwStrengthBar password={pwForm.password} />
                        </Field>

                        <Field label="Confirmation">
                            <StyledInput
                                value={pwForm.password_confirmation}
                                onChangeText={v => setPwForm({...pwForm, password_confirmation:v})}
                                placeholder="Répétez le mot de passe"
                                secureTextEntry
                            />
                            {pwForm.password_confirmation !== '' && (
                                <Text style={{ fontSize:11.5, marginTop:5, fontWeight:'500', color: pwMatch ? COLORS.green : COLORS.red }}>
                                    {pwMatch ? '✓ Correspondent' : '✗ Ne correspondent pas'}
                                </Text>
                            )}
                        </Field>

                        <TouchableOpacity
                            style={[styles.btnPrimary, pwLoading && { opacity:0.7 }]}
                            onPress={handleChangePassword}
                            disabled={pwLoading}
                            activeOpacity={0.85}
                        >
                            {pwLoading
                                ? <ActivityIndicator color="white" size="small" />
                                : <Text style={styles.btnPrimaryText}>Changer le mot de passe</Text>
                            }
                        </TouchableOpacity>
                    </SectionCard>

                    {/* ── Danger zone ── */}
                    <View style={styles.dangerCard}>
                        <Text style={styles.dangerTitle}>Compte</Text>
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                            <IconLogout size={15} />
                            <Text style={styles.logoutText}>Se déconnecter</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:   { flex:1, backgroundColor:COLORS.bg },
    scroll: { flexGrow:1 },

    hero: { paddingTop:44, paddingBottom:32, alignItems:'center', position:'relative', overflow:'hidden' },
    heroCircle1: { position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:80, backgroundColor:'rgba(255,255,255,0.05)' },
    heroCircle2: { position:'absolute', bottom:-30, left:20, width:100, height:100, borderRadius:50, backgroundColor:'rgba(255,255,255,0.04)' },
    heroCircle3: { position:'absolute', top:20, left:-30, width:80, height:80, borderRadius:40, backgroundColor:'rgba(255,255,255,0.03)' },

    avatarWrap:        { position:'relative', marginBottom:16 },
    avatarImg:         { width:84, height:84, borderRadius:42, borderWidth:3, borderColor:'rgba(255,255,255,0.3)' },
    avatarPlaceholder: { width:84, height:84, borderRadius:42, justifyContent:'center', alignItems:'center', borderWidth:3, borderColor:'rgba(255,255,255,0.25)' },
    avatarLetter:      { color:'white', fontSize:34, fontWeight:'700' },
    cameraBadge: {
        position:'absolute', bottom:0, right:0,
        width:28, height:28, borderRadius:14,
        backgroundColor:COLORS.white, borderWidth:2, borderColor:'rgba(255,255,255,0.4)',
        justifyContent:'center', alignItems:'center',
        shadowColor:'#000', shadowOpacity:0.15, shadowRadius:4, shadowOffset:{ width:0, height:1 }, elevation:3,
    },

    heroName:     { fontSize:21, fontWeight:'700', color:'white', letterSpacing:-0.4, marginBottom:3 },
    heroUsername: { fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:14 },
    roleBadge: {
        flexDirection:'row', alignItems:'center', gap:6,
        paddingHorizontal:13, paddingVertical:5, borderRadius:20,
        backgroundColor:'rgba(255,255,255,0.15)', borderWidth:1, borderColor:'rgba(255,255,255,0.25)',
    },
    roleDot:       { width:6, height:6, borderRadius:3, backgroundColor:'rgba(255,255,255,0.7)' },
    roleBadgeText: { fontSize:12, fontWeight:'600', color:'rgba(255,255,255,0.9)' },

    infoStrip:      { flexDirection:'row', backgroundColor:COLORS.white, borderBottomWidth:1, borderBottomColor:COLORS.border },
    infoCell:       { flex:1, paddingVertical:13, paddingHorizontal:10, alignItems:'center' },
    infoCellBorder: { borderRightWidth:1, borderRightColor:COLORS.border },
    infoCellKey:    { fontSize:10, color:COLORS.textLight, fontWeight:'700', textTransform:'uppercase', letterSpacing:0.6, marginBottom:3 },
    infoCellVal:    { fontSize:12, color:COLORS.text, fontWeight:'600', maxWidth:90 },

    content: { padding:16, gap:12, paddingBottom:44 },

    sectionCard: {
        backgroundColor:COLORS.white, borderRadius:16,
        borderWidth:1, borderColor:COLORS.border, overflow:'hidden',
        shadowColor:'#0F172A', shadowOpacity:0.04, shadowRadius:10, shadowOffset:{ width:0, height:2 }, elevation:2,
    },
    sectionHead:    { flexDirection:'row', alignItems:'center', gap:10, padding:16, paddingBottom:12 },
    sectionIconBox: { width:28, height:28, borderRadius:8, alignItems:'center', justifyContent:'center' },
    sectionTitle:   { fontSize:14, fontWeight:'700', color:COLORS.text, letterSpacing:-0.1 },
    sectionDivider: { height:1, backgroundColor:COLORS.borderLight },
    sectionBody:    { padding:16 },

    field:      { marginBottom:16 },
    fieldLabel: { fontSize:11.5, fontWeight:'700', color:COLORS.textMuted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:7 },
    fieldHint:  { fontSize:11, color:COLORS.textLight, marginTop:4 },

    input: {
        backgroundColor:'#FAFAFA', borderWidth:1, borderColor:COLORS.border,
        borderRadius:11, paddingHorizontal:14, paddingVertical:13,
        fontSize:14.5, color:COLORS.text,
    },
    inputFocused: {
        borderColor:COLORS.indigo, backgroundColor:COLORS.white,
        shadowColor:COLORS.indigo, shadowOpacity:0.1, shadowRadius:6, elevation:2,
    },
    inputDisabled: { backgroundColor:'#F1F5F9', color:COLORS.textLight },

    successBanner: {
        flexDirection:'row', alignItems:'center', gap:8,
        backgroundColor:COLORS.greenBg, borderWidth:1, borderColor:COLORS.greenBorder,
        borderRadius:10, padding:11, marginBottom:16,
    },
    successBannerText: { fontSize:13, fontWeight:'600', color:'#065F46' },

    errorBanner: {
        backgroundColor:COLORS.redBg, borderWidth:1, borderColor:COLORS.redBorder,
        borderRadius:10, padding:11, marginBottom:16,
    },
    errorBannerText: { fontSize:13, color:'#B91C1C', fontWeight:'500' },

    btnPrimary: {
        backgroundColor:COLORS.primary, borderRadius:11,
        paddingVertical:14, alignItems:'center', marginTop:4,
        shadowColor:COLORS.primary, shadowOpacity:0.2, shadowRadius:8,
        shadowOffset:{ width:0, height:3 }, elevation:4,
    },
    btnRow:        { flexDirection:'row', alignItems:'center', gap:8 },
    btnPrimaryText:{ color:'white', fontSize:14.5, fontWeight:'700', letterSpacing:-0.2 },

    dangerCard: {
        backgroundColor:COLORS.white, borderRadius:16,
        borderWidth:1, borderColor:COLORS.border, padding:16,
        shadowColor:'#0F172A', shadowOpacity:0.04, shadowRadius:10, shadowOffset:{ width:0, height:2 }, elevation:2,
    },
    dangerTitle: { fontSize:11.5, fontWeight:'700', color:COLORS.textLight, textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 },
    logoutBtn: {
        flexDirection:'row', alignItems:'center', gap:10,
        paddingVertical:13, paddingHorizontal:14,
        backgroundColor:COLORS.redBg, borderWidth:1, borderColor:COLORS.redBorder, borderRadius:11,
    },
    logoutText: { fontSize:14, fontWeight:'600', color:COLORS.red },
});