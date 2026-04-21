import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    SafeAreaView, Animated, Easing,
} from 'react-native';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Palette cohérente avec la version web ───────────────────────────────────
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
    green:       '#10b981',
    greenBg:     '#f0fdf4',
    amber:       '#f59e0b',
    amberBg:     '#fffbeb',
    purple:      '#6366f1',
    purpleBg:    '#eef2ff',
};

const STATUT_COLORS = {
    todo:     { color: COLORS.amber,  bg: COLORS.amberBg,  label: 'À faire' },
    progress: { color: COLORS.blue,   bg: COLORS.blueBg,   label: 'En cours' },
    done:     { color: COLORS.green,  bg: COLORS.greenBg,  label: 'Terminé' },
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
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

    return (
        <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: '#e2e8f0', opacity }, style]} />
    );
}

function DashboardSkeleton() {
    return (
        <View style={{ padding: 20 }}>
            <SkeletonBox width={180} height={28} style={{ marginBottom: 6 }} />
            <SkeletonBox width={100} height={18} style={{ marginBottom: 28 }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                {[0,1,2,3].map(i => <SkeletonBox key={i} width="47%" height={90} style={{ flexGrow: 1 }} />)}
            </View>
            <SkeletonBox width="100%" height={280} />
        </View>
    );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ data, total }) {
    const SIZE   = 200;
    const cx     = SIZE / 2;
    const cy     = SIZE / 2;
    const R      = 72;
    const r      = 46;  // rayon intérieur du donut

    if (total === 0) return (
        <View style={styles.emptyChart}>
            <View style={styles.emptyChartIcon}>
                <Text style={{ fontSize: 20, color: COLORS.textLight }}>○</Text>
            </View>
            <Text style={styles.emptyText}>Aucune tâche pour le moment</Text>
        </View>
    );

    let startAngle = -Math.PI / 2;
    const slices = data.filter(d => d.value > 0).map(d => {
        const angle    = (d.value / total) * 2 * Math.PI;
        const endAngle = startAngle + angle;

        const x1 = cx + R * Math.cos(startAngle);
        const y1 = cy + R * Math.sin(startAngle);
        const x2 = cx + R * Math.cos(endAngle);
        const y2 = cy + R * Math.sin(endAngle);

        // points intérieurs pour le donut
        const ix1 = cx + r * Math.cos(endAngle);
        const iy1 = cy + r * Math.sin(endAngle);
        const ix2 = cx + r * Math.cos(startAngle);
        const iy2 = cy + r * Math.sin(startAngle);

        const largeArc  = angle > Math.PI ? 1 : 0;
        const midAngle  = startAngle + angle / 2;
        const lx        = cx + (R * 0.72) * Math.cos(midAngle);
        const ly        = cy + (R * 0.72) * Math.sin(midAngle);
        const pct       = Math.round((d.value / total) * 100);

        // Path donut : arc extérieur + arc intérieur inversé
        const path = [
            `M ${x1} ${y1}`,
            `A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix1} ${iy1}`,
            `A ${r} ${r} 0 ${largeArc} 0 ${ix2} ${iy2}`,
            'Z',
        ].join(' ');

        startAngle = endAngle;
        return { ...d, path, lx, ly, pct };
    });

    return (
        <View style={styles.chartWrapper}>
            <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    <G>
                        {slices.map((s, i) => (
                            <G key={i}>
                                <Path d={s.path} fill={s.color} />
                                {s.pct >= 10 && (
                                    <SvgText
                                        x={s.lx} y={s.ly + 4}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="700"
                                        fill="white"
                                    >
                                        {s.pct}%
                                    </SvgText>
                                )}
                            </G>
                        ))}
                    </G>
                </Svg>
                {/* Label central */}
                <View style={styles.donutCenter} pointerEvents="none">
                    <Text style={styles.donutTotal}>{total}</Text>
                    <Text style={styles.donutLabel}>tâches</Text>
                </View>
            </View>

            {/* Légende */}
            <View style={styles.legend}>
                {slices.map((s, i) => {
                    const pct = Math.round((s.value / total) * 100);
                    return (
                        <View key={i} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                            <Text style={styles.legendName}>{s.name}</Text>
                            <View style={[styles.legendPill, { backgroundColor: s.bg }]}>
                                <Text style={[styles.legendPct, { color: s.color }]}>{pct}%</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

// ─── Card métrique ────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, bg, icon }) {
    return (
        <View style={[styles.card, { borderTopColor: accent, borderTopWidth: 3 }]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>{label}</Text>
                <View style={[styles.cardIconBox, { backgroundColor: bg }]}>
                    <Text style={{ fontSize: 14, color: accent }}>{icon}</Text>
                </View>
            </View>
            <Text style={[styles.cardNum, { color: COLORS.text }]}>{value}</Text>
        </View>
    );
}

// ─── Progress bar de complétion ───────────────────────────────────────────────
function CompletionBar({ done, total }) {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
        <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
                <View style={styles.completionLeft}>
                    <View style={[styles.cardIconBox, { backgroundColor: COLORS.greenBg }]}>
                        <Text style={{ fontSize: 14, color: COLORS.green }}>✓</Text>
                    </View>
                    <Text style={styles.completionTitle}>Progression globale</Text>
                </View>
                <Text style={[styles.completionPct, { color: pct === 100 ? COLORS.green : COLORS.blue }]}>
                    {pct}%
                </Text>
            </View>
            <View style={styles.progressTrack}>
                <View style={[
                    styles.progressFill,
                    {
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? COLORS.green : COLORS.blue,
                    }
                ]} />
            </View>
            <Text style={styles.completionSub}>
                {done} tâche{done !== 1 ? 's' : ''} terminée{done !== 1 ? 's' : ''} sur {total}
            </Text>
        </View>
    );
}

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function DashboardScreen() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        API.get('/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(err => console.log(err));
    }, []);

    const ROLE_LABELS = {
        admin:  'Administrateur',
        chef:   'Chef de projet',
        membre: 'Membre',
    };
    const ROLE_COLORS = {
        admin:  COLORS.amber,
        chef:   COLORS.blue,
        membre: COLORS.green,
    };

    const roleLabel = ROLE_LABELS[user?.role] ?? user?.role;
    const roleColor = ROLE_COLORS[user?.role] ?? COLORS.textMuted;
    const roleBg    = { admin: COLORS.amberBg, chef: COLORS.blueBg, membre: COLORS.greenBg }[user?.role] ?? '#f1f5f9';

    const totalTaches = stats
        ? (stats.todo ?? 0) + (stats.progress ?? 0) + (stats.done ?? 0)
        : 0;

    const pieData = stats ? [
        { name: 'À faire',  value: stats.todo     ?? 0, color: COLORS.amber, bg: COLORS.amberBg },
        { name: 'En cours', value: stats.progress  ?? 0, color: COLORS.blue,  bg: COLORS.blueBg  },
        { name: 'Terminé',  value: stats.done      ?? 0, color: COLORS.green, bg: COLORS.greenBg },
    ] : [];

    const STAT_CARDS = stats ? [
        { label: 'Projets',   value: stats.projects ?? 0, accent: COLORS.purple, bg: COLORS.purpleBg, icon: '◫' },
        { label: 'À faire',   value: stats.todo     ?? 0, accent: COLORS.amber,  bg: COLORS.amberBg,  icon: '○' },
        { label: 'En cours',  value: stats.progress ?? 0, accent: COLORS.blue,   bg: COLORS.blueBg,   icon: '↺' },
        { label: 'Terminées', value: stats.done     ?? 0, accent: COLORS.green,  bg: COLORS.greenBg,  icon: '✓' },
    ] : [];

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>
                            Bonjour,
                        </Text>
                        <Text style={styles.userName} numberOfLines={1}>
                            {user?.nom} 👋
                        </Text>
                        <View style={[styles.rolePill, { backgroundColor: roleBg }]}>
                            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
                            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
                        </View>
                    </View>
                    <View style={[styles.avatar, { backgroundColor: roleColor }]}>
                        <Text style={styles.avatarText}>
                            {user?.nom?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* ── CONTENU ── */}
                {!stats ? (
                    <DashboardSkeleton />
                ) : (
                    <>
                        {/* STAT CARDS */}
                        <View style={styles.cardsGrid}>
                            {STAT_CARDS.map((card, i) => (
                                <StatCard key={i} {...card} />
                            ))}
                        </View>

                        {/* PROGRESSION */}
                        <CompletionBar done={stats.done ?? 0} total={totalTaches} />

                        {/* DONUT */}
                        <View style={styles.chartCard}>
                            <View style={styles.chartCardHeader}>
                                <View>
                                    <Text style={styles.chartTitle}>Répartition des tâches</Text>
                                    <Text style={styles.chartSub}>Distribution par statut</Text>
                                </View>
                                {totalTaches > 0 && (
                                    <View style={styles.totalPill}>
                                        <View style={[styles.roleDot, { backgroundColor: COLORS.blue }]} />
                                        <Text style={styles.totalPillText}>{totalTaches} tâches</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.chartDivider} />
                            <DonutChart data={pieData} total={totalTaches} />
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        marginTop: 8,
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '400',
        marginBottom: 2,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    rolePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    roleDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },

    // Cards
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 14,
        width: '47.5%',
        flexGrow: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    cardIconBox: {
        width: 28,
        height: 28,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardNum: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },

    // Completion bar
    completionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    completionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    completionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    completionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
    },
    completionPct: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    progressTrack: {
        height: 7,
        backgroundColor: COLORS.borderLight,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 10,
        minWidth: 4,
    },
    completionSub: {
        fontSize: 12,
        color: COLORS.textLight,
    },

    // Chart
    chartCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
    },
    chartCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        letterSpacing: -0.2,
        marginBottom: 2,
    },
    chartSub: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    chartDivider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 14,
    },
    totalPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    totalPillText: {
        fontSize: 11.5,
        color: '#475569',
        fontWeight: '500',
    },
    chartWrapper: {
        alignItems: 'center',
    },
    donutCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutTotal: {
        fontSize: 26,
        fontWeight: '700',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    donutLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 1,
    },

    // Légende
    legend: {
        width: '100%',
        marginTop: 16,
        gap: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendName: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    legendPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
    },
    legendPct: {
        fontSize: 11.5,
        fontWeight: '700',
    },

    // État vide
    emptyChart: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyChartIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 13.5,
        color: COLORS.textLight,
    },
});