import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, Animated, Easing,
} from 'react-native';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    amberBorder: '#FDE68A',
    red:         '#EF4444',
    redBg:       '#FEF2F2',
    redBorder:   '#FECACA',
};

const STATUT_CONFIG = {
    en_attente: { label:'En attente', color:COLORS.amber,  bg:COLORS.amberBg,  border:COLORS.amberBorder,  dot:'#F59E0B' },
    en_cours:   { label:'En cours',   color:COLORS.indigo, bg:COLORS.indigoBg, border:COLORS.indigoBorder, dot:'#6366F1' },
    termine:    { label:'Terminé',    color:COLORS.green,  bg:COLORS.greenBg,  border:COLORS.greenBorder,  dot:'#10B981' },
    suspendu:   { label:'Suspendu',   color:COLORS.red,    bg:COLORS.redBg,    border:COLORS.redBorder,    dot:'#EF4444' },
};

const IconCalendar = ({ color=COLORS.indigo, size=15 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Rect x="3" y="4" width="18" height="18" rx="2"/>
        <Line x1="16" y1="2" x2="16" y2="6"/>
        <Line x1="8" y1="2" x2="8" y2="6"/>
        <Line x1="3" y1="10" x2="21" y2="10"/>
    </Svg>
);

function SkeletonBox({ width, height, radius=8, style }) {
    const opacity = React.useRef(new Animated.Value(0.4)).current;
    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue:1,   duration:700, useNativeDriver:true, easing:Easing.inOut(Easing.ease) }),
                Animated.timing(opacity, { toValue:0.4, duration:700, useNativeDriver:true, easing:Easing.inOut(Easing.ease) }),
            ])
        ).start();
    }, []);
    return <Animated.View style={[{ width, height, borderRadius:radius, backgroundColor:'#E2E8F0', opacity }, style]} />;
}

function ProjectSkeleton() {
    return (
        <View style={{ padding:16, gap:12 }}>
            {[0,1,2,3].map(i => (
                <View key={i} style={{ backgroundColor:COLORS.white, borderRadius:14, padding:16, borderWidth:1, borderColor:COLORS.border, gap:10 }}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                        <SkeletonBox width="60%" height={16} />
                        <SkeletonBox width={70} height={22} radius={20} />
                    </View>
                    <SkeletonBox width="85%" height={13} />
                    <SkeletonBox width="50%" height={11} />
                </View>
            ))}
        </View>
    );
}

function StatutBadge({ statut }) {
    const conf = STATUT_CONFIG[statut]; if (!conf) return null;
    return (
        <View style={[styles.badge, { backgroundColor:conf.bg, borderColor:conf.border }]}>
            <Text style={[styles.badgeText, { color:conf.color }]}>{conf.label}</Text>
        </View>
    );
}

function AvatarStack({ members, max=4 }) {
    const visible = members.slice(0, max);
    const extra   = members.length - max;
    return (
        <View style={styles.avatarStack}>
            {visible.map((m, i) => (
                <View key={m.id} style={[styles.stackAvatar, { marginLeft: i > 0 ? -8 : 0, zIndex: max - i }]}>
                    <Text style={styles.stackAvatarText}>{m.nom?.charAt(0).toUpperCase()}</Text>
                </View>
            ))}
            {extra > 0 && (
                <View style={[styles.stackAvatar, { marginLeft:-8, backgroundColor:COLORS.borderLight, zIndex:0 }]}>
                    <Text style={[styles.stackAvatarText, { color:COLORS.textMuted }]}>+{extra}</Text>
                </View>
            )}
        </View>
    );
}

export default function ProjectsScreen({ navigation }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [filter, setFilter]     = useState('tous');
    const { user } = useAuth();

    useEffect(() => {
        API.get('/projects')
            .then(res => setProjects(res.data))
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'tous' ? projects : projects.filter(p => p.statut === filter);

    const FILTERS = [
        { key:'tous',       label:'Tous' },
        { key:'en_cours',   label:'En cours' },
        { key:'en_attente', label:'En attente' },
        { key:'termine',    label:'Terminé' },
        { key:'suspendu',   label:'Suspendu' },
    ];

    return (
        <SafeAreaView style={styles.safe}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={{ flex:1 }}>
                    <Text style={styles.title}>Projets</Text>
                    <Text style={styles.subtitle}>
                        {user?.role === 'membre' ? 'Projets auxquels vous participez' : 'Projets que vous gérez'}
                    </Text>
                </View>
                <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                    <TouchableOpacity
                        style={styles.planningBtn}
                        onPress={() => navigation.navigate('Planning')}
                        activeOpacity={0.75}
                    >
                        <IconCalendar size={14} color={COLORS.indigo} />
                        <Text style={styles.planningBtnText}>Planning</Text>
                    </TouchableOpacity>
                    {!loading && (
                        <View style={styles.countPill}>
                            <Text style={styles.countText}>{filtered.length}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ── Filtres ── */}
            {!loading && (
                <View style={{ paddingBottom:12 }}>
                    <FlatList
                        horizontal
                        data={FILTERS}
                        keyExtractor={f => f.key}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal:16, gap:7 }}
                        renderItem={({ item: f }) => {
                            const conf    = STATUT_CONFIG[f.key];
                            const isActive = filter === f.key;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.filterBtn,
                                        isActive && (f.key === 'tous'
                                            ? { backgroundColor:COLORS.primary, borderColor:COLORS.primary }
                                            : { backgroundColor:conf.bg, borderColor:conf.border }),
                                    ]}
                                    onPress={() => setFilter(f.key)}
                                    activeOpacity={0.7}
                                >
                                    {f.key !== 'tous' && (
                                        <View style={[styles.filterDot, { backgroundColor: isActive ? conf.color : COLORS.textLight }]} />
                                    )}
                                    <Text style={[
                                        styles.filterText,
                                        isActive && (f.key === 'tous'
                                            ? { color:'white', fontWeight:'700' }
                                            : { color:conf.color, fontWeight:'700' }),
                                    ]}>
                                        {f.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            )}

            <View style={styles.divider} />

            {/* ── Liste ── */}
            {loading ? <ProjectSkeleton /> : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={(
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Text style={{ fontSize:22, color:COLORS.textLight }}>◫</Text>
                            </View>
                            <Text style={styles.emptyTitle}>Aucun projet</Text>
                            <Text style={styles.emptySub}>Aucun projet ne correspond à ce filtre.</Text>
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const conf = STATUT_CONFIG[item.statut];
                        return (
                            <TouchableOpacity
                                style={[styles.card, { borderLeftColor: conf?.dot ?? COLORS.border }]}
                                onPress={() => navigation.navigate('ProjectDetail', { projectId:item.id, titre:item.titre })}
                                activeOpacity={0.75}
                            >
                                {/* Top */}
                                <View style={styles.cardTop}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{item.titre}</Text>
                                    <StatutBadge statut={item.statut} />
                                </View>

                                {item.description && (
                                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                                )}

                                {/* Meta */}
                                <View style={styles.cardMeta}>
                                    <View style={styles.metaItem}>
                                        <View style={styles.metaDot} />
                                        <Text style={styles.metaText}>{item.date_debut} → {item.date_fin}</Text>
                                    </View>
                                    {item.technologies?.length > 0 && (
                                        <View style={styles.techRow}>
                                            {item.technologies.slice(0,3).map((tech, i) => (
                                                <View key={i} style={styles.techPill}>
                                                    <Text style={styles.techText}>{tech}</Text>
                                                </View>
                                            ))}
                                            {item.technologies.length > 3 && (
                                                <Text style={styles.techMore}>+{item.technologies.length - 3}</Text>
                                            )}
                                        </View>
                                    )}
                                </View>

                                {/* Footer */}
                                <View style={styles.cardFooter}>
                                    {item.members?.length > 0 ? (
                                        <>
                                            <AvatarStack members={item.members} />
                                            <Text style={styles.memberCount}>
                                                {item.members.length} membre{item.members.length > 1 ? 's' : ''}
                                            </Text>
                                        </>
                                    ) : <View style={{ flex:1 }} />}
                                    <View style={styles.chevron}>
                                        <Text style={{ fontSize:14, color:COLORS.textLight, fontWeight:'600' }}>›</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex:1, backgroundColor:COLORS.bg },

    header: {
        flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start',
        paddingHorizontal:20, paddingTop:18, paddingBottom:14,
    },
    title:    { fontSize:23, fontWeight:'700', color:COLORS.text, letterSpacing:-0.6, marginBottom:3 },
    subtitle: { fontSize:13, color:COLORS.textLight },

    planningBtn: {
        flexDirection:'row', alignItems:'center', gap:5,
        backgroundColor:COLORS.indigoBg, borderWidth:1, borderColor:COLORS.indigoBorder,
        borderRadius:10, paddingHorizontal:11, paddingVertical:8,
    },
    planningBtnText: { fontSize:12.5, fontWeight:'700', color:COLORS.indigo },

    countPill: {
        backgroundColor:COLORS.white, borderWidth:1, borderColor:COLORS.border,
        borderRadius:20, paddingHorizontal:10, paddingVertical:5, marginTop:4,
    },
    countText: { fontSize:12, fontWeight:'700', color:COLORS.textMuted },

    filterBtn: {
        flexDirection:'row', alignItems:'center', gap:6,
        paddingHorizontal:13, paddingVertical:8,
        borderRadius:20, borderWidth:1, borderColor:COLORS.border,
        backgroundColor:COLORS.white,
    },
    filterDot:  { width:6, height:6, borderRadius:3 },
    filterText: { fontSize:12.5, fontWeight:'500', color:COLORS.textMuted },

    divider: { height:1, backgroundColor:COLORS.borderLight },
    list:    { padding:16, gap:10, paddingBottom:36 },

    card: {
        backgroundColor:COLORS.white, borderRadius:14,
        padding:15, borderWidth:1, borderColor:COLORS.border,
        borderLeftWidth:3,
        shadowColor:'#0F172A', shadowOpacity:0.04,
        shadowRadius:8, shadowOffset:{ width:0, height:2 }, elevation:2,
    },
    cardTop: {
        flexDirection:'row', justifyContent:'space-between',
        alignItems:'flex-start', marginBottom:7, gap:8,
    },
    cardTitle: { fontSize:15, fontWeight:'700', color:COLORS.text, flex:1, letterSpacing:-0.2 },
    badge:     { paddingHorizontal:9, paddingVertical:3, borderRadius:20, borderWidth:1, flexShrink:0 },
    badgeText: { fontSize:11, fontWeight:'700' },
    cardDesc:  { fontSize:13, color:COLORS.textMuted, lineHeight:19, marginBottom:10 },

    cardMeta: { gap:7, marginBottom:12 },
    metaItem: { flexDirection:'row', alignItems:'center', gap:6 },
    metaDot:  { width:5, height:5, borderRadius:3, backgroundColor:COLORS.textLight },
    metaText: { fontSize:12, color:COLORS.textLight },

    techRow:  { flexDirection:'row', flexWrap:'wrap', gap:5 },
    techPill: {
        backgroundColor:COLORS.indigoBg, borderWidth:1, borderColor:COLORS.indigoBorder,
        paddingHorizontal:8, paddingVertical:3, borderRadius:6,
    },
    techText: { fontSize:11, color:COLORS.indigo, fontWeight:'600' },
    techMore: { fontSize:11, color:COLORS.textLight, paddingVertical:3 },

    cardFooter: {
        flexDirection:'row', alignItems:'center', gap:8,
        borderTopWidth:1, borderTopColor:COLORS.borderLight,
        paddingTop:11, marginTop:2,
    },
    avatarStack:     { flexDirection:'row', alignItems:'center' },
    stackAvatar: {
        width:24, height:24, borderRadius:12,
        backgroundColor:COLORS.indigo,
        alignItems:'center', justifyContent:'center',
        borderWidth:2, borderColor:COLORS.white,
    },
    stackAvatarText: { fontSize:9, fontWeight:'700', color:'white' },
    memberCount: { flex:1, fontSize:12, color:COLORS.textLight },
    chevron: {
        width:24, height:24, borderRadius:7,
        backgroundColor:COLORS.borderLight,
        alignItems:'center', justifyContent:'center',
    },

    emptyState: { alignItems:'center', paddingTop:64 },
    emptyIcon: {
        width:56, height:56, borderRadius:16,
        backgroundColor:COLORS.white, borderWidth:1, borderColor:COLORS.border,
        alignItems:'center', justifyContent:'center', marginBottom:14,
    },
    emptyTitle: { fontSize:16, fontWeight:'700', color:COLORS.text, marginBottom:5 },
    emptySub:   { fontSize:13.5, color:COLORS.textLight, textAlign:'center', paddingHorizontal:32 },
});