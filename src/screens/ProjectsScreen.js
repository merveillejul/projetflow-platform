import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, Animated, Easing,
} from 'react-native';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    red:         '#ef4444',
    redBg:       '#fef2f2',
    redBorder:   '#fecaca',
    purple:      '#6366f1',
    purpleBg:    '#eef2ff',
};

const STATUT_CONFIG = {
    en_attente: { label: 'En attente', color: COLORS.amber, bg: COLORS.amberBg, border: COLORS.amberBorder },
    en_cours:   { label: 'En cours',   color: COLORS.blue,  bg: COLORS.blueBg,  border: COLORS.blueBorder  },
    termine:    { label: 'Terminé',    color: COLORS.green, bg: COLORS.greenBg, border: COLORS.greenBorder },
    suspendu:   { label: 'Suspendu',   color: COLORS.red,   bg: COLORS.redBg,   border: COLORS.redBorder   },
};

function IconCalendar({ color = "#1d4ed8", size = 16 }) {
    return (
        <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <Line x1="16" y1="2" x2="16" y2="6" />
            <Line x1="8" y1="2" x2="8" y2="6" />
            <Line x1="3" y1="10" x2="21" y2="10" />
        </Svg>
    );
}

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

function ProjectSkeleton() {
    return (
        <View style={{ padding: 16, gap: 12 }}>
            {[0,1,2,3].map(i => (
                <View key={i} style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <SkeletonBox width="65%" height={16} />
                        <SkeletonBox width={70} height={22} radius={20} />
                    </View>
                    <SkeletonBox width="90%" height={13} />
                    <SkeletonBox width="50%" height={11} />
                </View>
            ))}
        </View>
    );
}

function StatutBadge({ statut }) {
    const conf = STATUT_CONFIG[statut];
    if (!conf) return null;
    return (
        <View style={[styles.badge, { backgroundColor: conf.bg, borderColor: conf.border }]}>
            <Text style={[styles.badgeText, { color: conf.color }]}>{conf.label}</Text>
        </View>
    );
}

function AvatarStack({ members, max = 4 }) {
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
                <View style={[styles.stackAvatar, { marginLeft: -8, backgroundColor: COLORS.border, zIndex: 0 }]}>
                    <Text style={[styles.stackAvatarText, { color: COLORS.textMuted }]}>+{extra}</Text>
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

    const filtered = filter === 'tous'
        ? projects
        : projects.filter(p => p.statut === filter);

    const FILTERS = [
        { key: 'tous',       label: 'Tous' },
        { key: 'en_cours',   label: 'En cours' },
        { key: 'en_attente', label: 'En attente' },
        { key: 'termine',    label: 'Terminé' },
        { key: 'suspendu',   label: 'Suspendu' },
    ];

    return (
        <SafeAreaView style={styles.safe}>

            {/* HEADER */}
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Projets</Text>
                    <Text style={styles.subtitle}>
                        {user?.role === 'membre' ? 'Projets auxquels vous participez' : 'Projets que vous gérez'}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* BOUTON PLANNING */}
                    <TouchableOpacity
                        style={styles.planningBtn}
                        onPress={() => navigation.navigate('Planning')}
                        activeOpacity={0.75}
                    >
                        <IconCalendar color="#1d4ed8" size={15} />
                        <Text style={styles.planningBtnText}>Planning</Text>
                    </TouchableOpacity>

                    {!loading && (
                        <View style={styles.countPill}>
                            <Text style={styles.countText}>{filtered.length}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* FILTRES */}
            {!loading && (
                <View style={styles.filtersWrapper}>
                    <FlatList
                        horizontal
                        data={FILTERS}
                        keyExtractor={f => f.key}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, gap: 7 }}
                        renderItem={({ item: f }) => {
                            const conf    = STATUT_CONFIG[f.key];
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
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            )}

            <View style={styles.divider} />

            {loading ? (
                <ProjectSkeleton />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={(
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Text style={{ fontSize: 20, color: COLORS.textLight }}>◫</Text>
                            </View>
                            <Text style={styles.emptyTitle}>Aucun projet</Text>
                            <Text style={styles.emptySub}>Aucun projet ne correspond à ce filtre.</Text>
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const conf = STATUT_CONFIG[item.statut];
                        return (
                            <TouchableOpacity
                                style={[styles.card, { borderLeftColor: conf?.color ?? COLORS.border }]}
                                onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id, titre: item.titre })}
                                activeOpacity={0.75}
                            >
                                <View style={styles.cardTop}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{item.titre}</Text>
                                    <StatutBadge statut={item.statut} />
                                </View>

                                {item.description ? (
                                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                                ) : null}

                                <View style={styles.cardMeta}>
                                    <View style={styles.metaItem}>
                                        <Text style={styles.metaIcon}>○</Text>
                                        <Text style={styles.metaText}>{item.date_debut} → {item.date_fin}</Text>
                                    </View>
                                    {item.technologies?.length > 0 && (
                                        <View style={styles.techRow}>
                                            {item.technologies.slice(0, 3).map((tech, i) => (
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

                                {item.members?.length > 0 && (
                                    <View style={styles.cardFooter}>
                                        <AvatarStack members={item.members} />
                                        <Text style={styles.memberCount}>
                                            {item.members.length} membre{item.members.length > 1 ? 's' : ''}
                                        </Text>
                                        <View style={styles.chevron}>
                                            <Text style={{ fontSize: 12, color: COLORS.textLight }}>›</Text>
                                        </View>
                                    </View>
                                )}

                                {!item.members?.length && (
                                    <View style={[styles.cardFooter, { justifyContent: 'flex-end' }]}>
                                        <View style={styles.chevron}>
                                            <Text style={{ fontSize: 12, color: COLORS.textLight }}>›</Text>
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
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
    title:    { fontSize: 22, fontWeight: '700', color: COLORS.text, letterSpacing: -0.5, marginBottom: 2 },
    subtitle: { fontSize: 13, color: COLORS.textLight },

    planningBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: COLORS.blueBg, borderWidth: 1, borderColor: COLORS.blueBorder,
        borderRadius: 10, paddingHorizontal: 11, paddingVertical: 7,
    },
    planningBtnText: { fontSize: 12.5, fontWeight: '600', color: '#1d4ed8' },

    countPill: {
        backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4,
    },
    countText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },

    filtersWrapper: { paddingBottom: 12 },
    filterBtn: {
        paddingHorizontal: 14, paddingVertical: 7,
        borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    filterText: { fontSize: 12.5, fontWeight: '500', color: COLORS.textMuted },

    divider: { height: 1, backgroundColor: COLORS.borderLight },
    list: { padding: 16, gap: 10, paddingBottom: 32 },

    card: {
        backgroundColor: COLORS.white, borderRadius: 12,
        padding: 14, borderWidth: 1, borderColor: COLORS.border,
        borderLeftWidth: 3,
    },
    cardTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 6, gap: 8,
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1, letterSpacing: -0.2 },
    badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, borderWidth: 1, flexShrink: 0 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    cardDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18, marginBottom: 10 },

    cardMeta: { gap: 6, marginBottom: 10 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    metaIcon: { fontSize: 11, color: COLORS.textLight },
    metaText: { fontSize: 12, color: COLORS.textLight },
    techRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    techPill: {
        backgroundColor: COLORS.blueBg, borderWidth: 1, borderColor: COLORS.blueBorder,
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5,
    },
    techText: { fontSize: 11, color: COLORS.blue, fontWeight: '500' },
    techMore: { fontSize: 11, color: COLORS.textLight, paddingVertical: 2 },

    cardFooter: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderTopWidth: 1, borderTopColor: COLORS.borderLight,
        paddingTop: 10, marginTop: 2,
    },
    avatarStack:     { flexDirection: 'row', alignItems: 'center' },
    stackAvatar: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: COLORS.purple,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: COLORS.white,
    },
    stackAvatarText: { fontSize: 9, fontWeight: '700', color: 'white' },
    memberCount:     { flex: 1, fontSize: 12, color: COLORS.textLight },
    chevron: {
        width: 22, height: 22, borderRadius: 6,
        backgroundColor: COLORS.borderLight,
        alignItems: 'center', justifyContent: 'center',
    },

    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: {
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    emptyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
    emptySub:   { fontSize: 13, color: COLORS.textLight },
});