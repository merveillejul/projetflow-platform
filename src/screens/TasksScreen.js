import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../services/api';

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
};

const STATUT_CONFIG = {
    a_faire:  { label:'À faire',  color:COLORS.amber,  bg:COLORS.amberBg,  border:COLORS.amberBorder,  dot:'#F59E0B' },
    en_cours: { label:'En cours', color:COLORS.indigo, bg:COLORS.indigoBg, border:COLORS.indigoBorder, dot:'#6366F1' },
    termine:  { label:'Terminé',  color:COLORS.green,  bg:COLORS.greenBg,  border:COLORS.greenBorder,  dot:'#10B981' },
};

/* ─── Skeleton ──────────────────────────────────────────────────── */
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

function TaskSkeleton() {
    return (
        <View style={{ padding:16, gap:10 }}>
            {[0,1,2,3].map(i => (
                <View key={i} style={{ backgroundColor:COLORS.white, borderRadius:14, padding:16, borderWidth:1, borderColor:COLORS.border, gap:10 }}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                        <SkeletonBox width="40%" height={11} />
                        <SkeletonBox width={70} height={22} radius={20} />
                    </View>
                    <SkeletonBox width="75%" height={16} />
                    <SkeletonBox width="100%" height={42} radius={10} />
                </View>
            ))}
        </View>
    );
}

/* ─── Écran ─────────────────────────────────────────────────────── */
export default function TasksScreen() {
    const [tasks, setTasks]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState('tous');

    useEffect(() => { loadTasks(); }, []);

    const loadTasks = async () => {
        try {
            const res = await API.get('/my-tasks');
            setTasks(res.data);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const updateStatut = async (taskId, statut) => {
        await API.put(`/tasks/${taskId}`, { statut });
        loadTasks();
    };

    const filtered = filter === 'tous' ? tasks : tasks.filter(t => t.statut === filter);

    const counts = {
        tous:     tasks.length,
        a_faire:  tasks.filter(t => t.statut === 'a_faire').length,
        en_cours: tasks.filter(t => t.statut === 'en_cours').length,
        termine:  tasks.filter(t => t.statut === 'termine').length,
    };

    const FILTERS = [
        { key:'tous',     label:'Toutes',   dot:'#94A3B8', activeBg:COLORS.primary,   activeColor:'white',        activeBorder:COLORS.primary },
        { key:'a_faire',  label:'À faire',  dot:COLORS.amber,  activeBg:COLORS.amberBg,   activeColor:COLORS.amber,   activeBorder:COLORS.amberBorder },
        { key:'en_cours', label:'En cours', dot:COLORS.indigo, activeBg:COLORS.indigoBg,  activeColor:COLORS.indigo,  activeBorder:COLORS.indigoBorder },
        { key:'termine',  label:'Terminé',  dot:COLORS.green,  activeBg:COLORS.greenBg,   activeColor:COLORS.green,   activeBorder:COLORS.greenBorder },
    ];

    return (
        <SafeAreaView style={styles.safe}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Mes tâches</Text>
                    <Text style={styles.subtitle}>
                        {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} assignée{tasks.length !== 1 ? 's' : ''}
                    </Text>
                </View>
                {!loading && (
                    <View style={styles.totalPill}>
                        <Text style={styles.totalPillText}>{filtered.length}</Text>
                    </View>
                )}
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
                            const isActive = filter === f.key;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.filterBtn,
                                        isActive && { backgroundColor:f.activeBg, borderColor:f.activeBorder },
                                    ]}
                                    onPress={() => setFilter(f.key)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.filterDot, { backgroundColor: isActive ? f.activeColor : f.dot, opacity: isActive ? 0.7 : 1 }]} />
                                    <Text style={[styles.filterText, isActive && { color:f.activeColor, fontWeight:'700' }]}>
                                        {f.label}
                                    </Text>
                                    <View style={[styles.filterCount, isActive && { backgroundColor:'rgba(0,0,0,0.08)' }]}>
                                        <Text style={[styles.filterCountText, isActive && { color:f.activeColor }]}>
                                            {counts[f.key]}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            )}

            <View style={styles.divider} />

            {/* ── Liste ── */}
            {loading ? <TaskSkeleton /> : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={(
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Text style={{ fontSize:22, color:COLORS.textLight }}>✓</Text>
                            </View>
                            <Text style={styles.emptyTitle}>Aucune tâche</Text>
                            <Text style={styles.emptySub}>
                                {filter === 'tous' ? 'Aucune tâche assignée pour le moment.' : 'Aucune tâche dans cette catégorie.'}
                            </Text>
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const conf = STATUT_CONFIG[item.statut];
                        return (
                            <View style={[styles.card, { borderLeftColor: conf?.dot ?? COLORS.border }]}>

                                {/* Top : projet + badge */}
                                <View style={styles.cardTop}>
                                    <View style={styles.projectRow}>
                                        <View style={styles.projectDot} />
                                        <Text style={styles.projectLabel} numberOfLines={1}>
                                            {item.project?.titre ?? item.projectTitre ?? 'Projet'}
                                        </Text>
                                    </View>
                                    {conf && (
                                        <View style={[styles.badge, { backgroundColor:conf.bg, borderColor:conf.border }]}>
                                            <Text style={[styles.badgeText, { color:conf.color }]}>{conf.label}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Titre */}
                                <Text style={styles.taskTitle}>{item.titre}</Text>
                                {item.description && (
                                    <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text>
                                )}

                                {/* Échéance */}
                                {item.date_echeance && (
                                    <View style={styles.echeanceRow}>
                                        <View style={styles.echeanceDot} />
                                        <Text style={styles.echeanceText}>Échéance : {item.date_echeance}</Text>
                                    </View>
                                )}

                                {/* Divider */}
                                <View style={styles.cardDivider} />

                                {/* Boutons statut */}
                                <View style={styles.statutBtns}>
                                    {Object.entries(STATUT_CONFIG).map(([key, c]) => {
                                        const isActive = item.statut === key;
                                        return (
                                            <TouchableOpacity
                                                key={key}
                                                style={[
                                                    styles.statutBtn,
                                                    { borderColor: isActive ? c.border : COLORS.border },
                                                    isActive && { backgroundColor: c.bg },
                                                ]}
                                                onPress={() => !isActive && updateStatut(item.id, key)}
                                                activeOpacity={isActive ? 1 : 0.7}
                                            >
                                                {isActive && (
                                                    <Text style={[styles.statutCheck, { color:c.color }]}>✓ </Text>
                                                )}
                                                <Text style={[
                                                    styles.statutBtnText,
                                                    { color: isActive ? c.color : COLORS.textLight },
                                                    isActive && { fontWeight:'700' },
                                                ]}>
                                                    {c.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
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
    totalPill: {
        backgroundColor:COLORS.white, borderWidth:1, borderColor:COLORS.border,
        borderRadius:20, paddingHorizontal:11, paddingVertical:5, marginTop:4,
    },
    totalPillText: { fontSize:13, fontWeight:'700', color:COLORS.textMuted },

    filterBtn: {
        flexDirection:'row', alignItems:'center', gap:6,
        paddingHorizontal:13, paddingVertical:8,
        borderRadius:20, borderWidth:1, borderColor:COLORS.border,
        backgroundColor:COLORS.white,
    },
    filterDot:       { width:6, height:6, borderRadius:3 },
    filterText:      { fontSize:12.5, fontWeight:'500', color:COLORS.textMuted },
    filterCount:     { backgroundColor:COLORS.borderLight, paddingHorizontal:7, paddingVertical:1, borderRadius:10 },
    filterCountText: { fontSize:11, fontWeight:'600', color:COLORS.textMuted },

    divider: { height:1, backgroundColor:COLORS.borderLight },
    list:    { padding:16, gap:10, paddingBottom:36 },

    card: {
        backgroundColor:COLORS.white, borderRadius:14,
        padding:14, borderWidth:1, borderColor:COLORS.border,
        borderLeftWidth:3,
        shadowColor:'#0F172A', shadowOpacity:0.04,
        shadowRadius:8, shadowOffset:{ width:0, height:2 }, elevation:2,
    },
    cardTop:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:9 },
    projectRow:  { flexDirection:'row', alignItems:'center', gap:6, flex:1 },
    projectDot:  { width:5, height:5, borderRadius:3, backgroundColor:COLORS.textLight },
    projectLabel:{ fontSize:12, color:COLORS.textLight, fontWeight:'500', flex:1 },
    badge:       { paddingHorizontal:9, paddingVertical:3, borderRadius:20, borderWidth:1, flexShrink:0 },
    badgeText:   { fontSize:11, fontWeight:'600' },

    taskTitle: { fontSize:15, fontWeight:'700', color:COLORS.text, letterSpacing:-0.2, marginBottom:4 },
    taskDesc:  { fontSize:13, color:COLORS.textMuted, lineHeight:19, marginBottom:8 },

    echeanceRow: { flexDirection:'row', alignItems:'center', gap:6, marginBottom:12 },
    echeanceDot: { width:5, height:5, borderRadius:3, backgroundColor:COLORS.textLight },
    echeanceText:{ fontSize:12, color:COLORS.textLight },

    cardDivider: { height:1, backgroundColor:COLORS.borderLight, marginBottom:12 },

    statutBtns: { flexDirection:'row', gap:6 },
    statutBtn: {
        flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center',
        paddingVertical:9, borderRadius:9, borderWidth:1, backgroundColor:COLORS.white,
    },
    statutCheck:    { fontSize:11, fontWeight:'700' },
    statutBtnText:  { fontSize:11.5, fontWeight:'500' },

    emptyState: { alignItems:'center', paddingTop:64 },
    emptyIcon: {
        width:56, height:56, borderRadius:16,
        backgroundColor:COLORS.white, borderWidth:1, borderColor:COLORS.border,
        alignItems:'center', justifyContent:'center', marginBottom:14,
    },
    emptyTitle: { fontSize:16, fontWeight:'700', color:COLORS.text, marginBottom:5 },
    emptySub:   { fontSize:13.5, color:COLORS.textLight, textAlign:'center', paddingHorizontal:32 },
});