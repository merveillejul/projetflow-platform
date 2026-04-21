import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, Animated, Easing,
} from 'react-native';
import API from '../services/api';

const COLORS = {
    bg:          '#f8fafc',
    white:       '#ffffff',
    border:      '#e2e8f0',
    borderLight: '#f1f5f9',
    text:        '#0f172a',
    textMuted:   '#64748b',
    textLight:   '#94a3b8',
    blue:        '#3b82f6',
    blueBg:      '#eff6ff',
    blueBorder:  '#bfdbfe',
    green:       '#10b981',
    greenBg:     '#f0fdf4',
    greenBorder: '#bbf7d0',
    amber:       '#f59e0b',
    amberBg:     '#fffbeb',
    amberBorder: '#fde68a',
};

const STATUT_CONFIG = {
    a_faire:  { label: 'À faire',  color: COLORS.amber, bg: COLORS.amberBg, border: COLORS.amberBorder, next: 'en_cours', nextLabel: 'En cours'  },
    en_cours: { label: 'En cours', color: COLORS.blue,  bg: COLORS.blueBg,  border: COLORS.blueBorder,  next: 'termine',  nextLabel: 'Terminé'   },
    termine:  { label: 'Terminé',  color: COLORS.green, bg: COLORS.greenBg, border: COLORS.greenBorder, next: 'a_faire',  nextLabel: 'À faire'   },
};

function SkeletonBox({ width, height, radius = 8, style }) {
    const opacity = React.useRef(new Animated.Value(0.4)).current;
    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        ).start();
    }, []);
    return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: '#e2e8f0', opacity }, style]} />;
}

function TaskSkeleton() {
    return (
        <View style={{ padding: 16, gap: 10 }}>
            {[0,1,2,3].map(i => (
                <View key={i} style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 }}>
                    <SkeletonBox width="40%" height={11} />
                    <SkeletonBox width="75%" height={15} />
                    <SkeletonBox width="100%" height={38} radius={9} />
                </View>
            ))}
        </View>
    );
}

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
        { key: 'tous',     label: 'Toutes' },
        { key: 'a_faire',  label: 'À faire' },
        { key: 'en_cours', label: 'En cours' },
        { key: 'termine',  label: 'Terminé' },
    ];

    return (
        <SafeAreaView style={styles.safe}>

            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Mes tâches</Text>
                    <Text style={styles.subtitle}>
                        {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} assignée{tasks.length !== 1 ? 's' : ''}
                    </Text>
                </View>
            </View>

            {/* FILTRES */}
            {!loading && (
                <View style={{ paddingBottom: 12 }}>
                    <FlatList
                        horizontal
                        data={FILTERS}
                        keyExtractor={f => f.key}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, gap: 7 }}
                        renderItem={({ item: f }) => {
                            const conf     = STATUT_CONFIG[f.key];
                            const isActive = filter === f.key;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.filterBtn,
                                        isActive && (f.key === 'tous'
                                            ? { backgroundColor: COLORS.text, borderColor: COLORS.text }
                                            : { backgroundColor: conf.bg, borderColor: conf.border }),
                                    ]}
                                    onPress={() => setFilter(f.key)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        isActive && (f.key === 'tous'
                                            ? { color: 'white' }
                                            : { color: conf.color }),
                                    ]}>
                                        {f.label}
                                    </Text>
                                    <View style={[
                                        styles.filterCount,
                                        isActive && { backgroundColor: 'rgba(255,255,255,0.3)' },
                                    ]}>
                                        <Text style={[
                                            styles.filterCountText,
                                            isActive && (f.key === 'tous' ? { color: 'white' } : { color: conf.color }),
                                        ]}>
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

            {loading ? (
                <TaskSkeleton />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={(
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Text style={{ fontSize: 20, color: COLORS.textLight }}>✓</Text>
                            </View>
                            <Text style={styles.emptyTitle}>Aucune tâche</Text>
                            <Text style={styles.emptySub}>
                                {filter === 'tous' ? 'Aucune tâche assignée.' : 'Aucune tâche dans cette catégorie.'}
                            </Text>
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const conf = STATUT_CONFIG[item.statut];
                        return (
                            <View style={[styles.card, { borderLeftColor: conf?.color ?? COLORS.border }]}>

                                {/* Projet + badge */}
                                <View style={styles.cardTop}>
                                    <View style={styles.projectRow}>
                                        <Text style={styles.projectIcon}>◫</Text>
                                        <Text style={styles.projectLabel} numberOfLines={1}>
                                            {item.project?.titre ?? item.projectTitre ?? 'Projet'}
                                        </Text>
                                    </View>
                                    {conf && (
                                        <View style={[styles.statut, { backgroundColor: conf.bg, borderColor: conf.border }]}>
                                            <Text style={[styles.statutText, { color: conf.color }]}>{conf.label}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Titre */}
                                <Text style={styles.taskTitle}>{item.titre}</Text>

                                {item.description ? (
                                    <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text>
                                ) : null}

                                {/* Échéance */}
                                {item.date_echeance && (
                                    <View style={styles.echeanceRow}>
                                        <Text style={styles.echeanceIcon}>○</Text>
                                        <Text style={styles.echeanceText}>Échéance : {item.date_echeance}</Text>
                                    </View>
                                )}

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
                                                    <Text style={[styles.checkMark, { color: c.color }]}>✓ </Text>
                                                )}
                                                <Text style={[
                                                    styles.statutBtnText,
                                                    { color: isActive ? c.color : COLORS.textLight },
                                                    isActive && { fontWeight: '700' },
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
    safe: { flex: 1, backgroundColor: COLORS.bg },

    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', paddingHorizontal: 20,
        paddingTop: 16, paddingBottom: 12,
    },
    title: { fontSize: 22, fontWeight: '700', color: COLORS.text, letterSpacing: -0.5, marginBottom: 2 },
    subtitle: { fontSize: 13, color: COLORS.textLight },

    filterBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 13, paddingVertical: 7,
        borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    filterText: { fontSize: 12.5, fontWeight: '500', color: COLORS.textMuted },
    filterCount: {
        backgroundColor: COLORS.borderLight,
        paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10,
    },
    filterCountText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },

    divider: { height: 1, backgroundColor: COLORS.borderLight },
    list: { padding: 16, gap: 10, paddingBottom: 32 },

    card: {
        backgroundColor: COLORS.white, borderRadius: 12,
        padding: 14, borderWidth: 1, borderColor: COLORS.border,
        borderLeftWidth: 3,
    },
    cardTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8,
    },
    projectRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
    projectIcon: { fontSize: 11, color: COLORS.textLight },
    projectLabel: { fontSize: 12, color: COLORS.textLight, fontWeight: '500', flex: 1 },
    statut: {
        paddingHorizontal: 9, paddingVertical: 3,
        borderRadius: 20, borderWidth: 1, flexShrink: 0,
    },
    statutText: { fontSize: 11, fontWeight: '600' },
    taskTitle: {
        fontSize: 15, fontWeight: '700', color: COLORS.text,
        letterSpacing: -0.2, marginBottom: 4,
    },
    taskDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18, marginBottom: 8 },
    echeanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
    echeanceIcon: { fontSize: 11, color: COLORS.textLight },
    echeanceText: { fontSize: 12, color: COLORS.textLight },

    statutBtns: {
        flexDirection: 'row', gap: 6, marginTop: 8,
        borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 12,
    },
    statutBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 8, borderRadius: 8, borderWidth: 1,
        backgroundColor: COLORS.white,
    },
    checkMark: { fontSize: 11, fontWeight: '700' },
    statutBtnText: { fontSize: 11.5, fontWeight: '500' },

    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: {
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    emptyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
    emptySub: { fontSize: 13, color: COLORS.textLight },
});