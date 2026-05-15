import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Animated, Easing,
} from 'react-native';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
    bg:          '#F8FAFC',
    white:       '#FFFFFF',
    border:      '#E2E8F0',
    borderLight: '#F1F5F9',
    text:        '#0F172A',
    textMuted:   '#64748B',
    textLight:   '#94A3B8',
    primary:     '#0F172A',
    // Accents
    indigo:      '#6366F1',
    indigoBg:    '#EEF2FF',
    green:       '#10B981',
    greenBg:     '#ECFDF5',
    amber:       '#F59E0B',
    amberBg:     '#FFFBEB',
    blue:        '#3B82F6',
    blueBg:      '#EFF6FF',
};

const STATUT_COLORS = {
    todo:     { color: COLORS.amber,  bg: COLORS.amberBg,  label: 'À faire'  },
    progress: { color: COLORS.indigo, bg: COLORS.indigoBg, label: 'En cours' },
    done:     { color: COLORS.green,  bg: COLORS.greenBg,  label: 'Terminé'  },
};

/* ─── Skeleton ──────────────────────────────────────────────────── */
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
    return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: '#E2E8F0', opacity }, style]} />;
}

function DashboardSkeleton() {
    return (
        <View style={{ padding: 20, gap: 14 }}>
            <SkeletonBox width={180} height={28} />
            <SkeletonBox width={120} height={18} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                {[0,1,2,3].map(i => <SkeletonBox key={i} width="47%" height={96} style={{ flexGrow: 1 }} />)}
            </View>
            <SkeletonBox width="100%" height={100} />
            <SkeletonBox width="100%" height={280} />
        </View>
    );
}

/* ─── Donut chart ────────────────────────────────────────────────── */
function DonutChart({ data, total }) {
    const SIZE = 200;
    const cx = SIZE / 2, cy = SIZE / 2;
    const R = 74, r = 48;
    const GAP = 0.03;

    if (total === 0) return (
        <View style={styles.emptyChart}>
            <View style={styles.emptyChartIcon}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.textLight }} />
            </View>
            <Text style={styles.emptyText}>Aucune tâche pour le moment</Text>
        </View>
    );

    let startAngle = -Math.PI / 2;
    const slices = data.filter(d => d.value > 0).map(d => {
        const angle    = (d.value / total) * 2 * Math.PI - GAP;
        const endAngle = startAngle + angle;
        const x1 = cx + R * Math.cos(startAngle);
        const y1 = cy + R * Math.sin(startAngle);
        const x2 = cx + R * Math.cos(endAngle);
        const y2 = cy + R * Math.sin(endAngle);
        const ix1 = cx + r * Math.cos(endAngle);
        const iy1 = cy + r * Math.sin(endAngle);
        const ix2 = cx + r * Math.cos(startAngle);
        const iy2 = cy + r * Math.sin(startAngle);
        const largeArc = angle > Math.PI ? 1 : 0;
        const path = [
            `M ${x1} ${y1}`,
            `A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix1} ${iy1}`,
            `A ${r} ${r} 0 ${largeArc} 0 ${ix2} ${iy2}`,
            'Z',
        ].join(' ');
        startAngle = endAngle + GAP;
        return { ...d, path };
    });

    return (
        <View style={styles.chartWrapper}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    {slices.map((s, i) => (
                        <Path key={i} d={s.path} fill={s.color} />
                    ))}
                </Svg>
                {/* Centre absolu */}
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
                            <Text style={styles.legendVal}>{s.value}</Text>
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

/* ─── Stat card ─────────────────────────────────────────────────── */
function StatCard({ label, value, accent, bg, icon }) {
    return (
        <View style={[styles.card, styles.statCard, { borderTopColor: accent, borderTopWidth: 3 }]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>{label}</Text>
                <View style={[styles.cardIconBox, { backgroundColor: bg }]}>
                    <Text style={{ fontSize: 13, color: accent }}>{icon}</Text>
                </View>
            </View>
            <Text style={styles.cardNum}>{value}</Text>
        </View>
    );
}

/* ─── Completion bar ─────────────────────────────────────────────── */
function CompletionBar({ done, total }) {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const barColor = pct === 100 ? COLORS.green : COLORS.primary;
    return (
        <View style={[styles.card, styles.completionCard]}>
            <View style={styles.completionTop}>
                <View style={styles.completionLeft}>
                    <View style={[styles.cardIconBox, { backgroundColor: COLORS.greenBg }]}>
                        <Text style={{ fontSize: 13, color: COLORS.green }}>✓</Text>
                    </View>
                    <Text style={styles.completionTitle}>Progression globale</Text>
                </View>
                <Text style={[styles.completionPct, { color: barColor }]}>{pct}%</Text>
            </View>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: barColor }]} />
            </View>
            <Text style={styles.completionSub}>
                {done} tâche{done !== 1 ? 's' : ''} terminée{done !== 1 ? 's' : ''} sur {total}
            </Text>
        </View>
    );
}

/* ─── Écran principal ────────────────────────────────────────────── */
export default function DashboardScreen() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        API.get('/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(err => console.log(err));
    }, []);

    const ROLE_LABELS  = { admin:'Administrateur', chef:'Chef de projet', membre:'Membre' };
    const ROLE_COLORS  = { admin:COLORS.amber, chef:COLORS.primary, membre:COLORS.green };
    const ROLE_BG      = { admin:COLORS.amberBg, chef:COLORS.borderLight, membre:COLORS.greenBg };

    const roleLabel = ROLE_LABELS[user?.role] ?? user?.role;
    const roleColor = ROLE_COLORS[user?.role] ?? COLORS.textMuted;
    const roleBg    = ROLE_BG[user?.role] ?? '#F1F5F9';

    const total = stats ? (stats.todo ?? 0) + (stats.progress ?? 0) + (stats.done ?? 0) : 0;

    const pieData = stats ? [
        { name:'À faire',  value: stats.todo     ?? 0, color: COLORS.amber,  bg: COLORS.amberBg  },
        { name:'En cours', value: stats.progress  ?? 0, color: COLORS.indigo, bg: COLORS.indigoBg },
        { name:'Terminé',  value: stats.done      ?? 0, color: COLORS.green,  bg: COLORS.greenBg  },
    ] : [];

    const STAT_CARDS = stats ? [
        { label:'Projets',   value: stats.projects ?? 0, accent: COLORS.indigo, bg: COLORS.indigoBg, icon:'◫' },
        { label:'À faire',   value: stats.todo     ?? 0, accent: COLORS.amber,  bg: COLORS.amberBg,  icon:'○' },
        { label:'En cours',  value: stats.progress ?? 0, accent: COLORS.primary,bg:'#F1F5F9',        icon:'↺' },
        { label:'Terminées', value: stats.done     ?? 0, accent: COLORS.green,  bg: COLORS.greenBg,  icon:'✓' },
    ] : [];

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>{greeting},</Text>
                        <Text style={styles.userName} numberOfLines={1}>{user?.nom} 👋</Text>
                        <View style={[styles.rolePill, { backgroundColor: roleBg }]}>
                            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
                            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
                        </View>
                    </View>
                    <View style={[styles.avatar, { backgroundColor: roleColor }]}>
                        <Text style={styles.avatarText}>{user?.nom?.charAt(0).toUpperCase()}</Text>
                    </View>
                </View>

                {/* ── CONTENU ── */}
                {!stats ? <DashboardSkeleton /> : (
                    <>
                        {/* STAT CARDS */}
                        <View style={styles.cardsGrid}>
                            {STAT_CARDS.map((card, i) => <StatCard key={i} {...card} />)}
                        </View>

                        {/* PROGRESSION */}
                        <CompletionBar done={stats.done ?? 0} total={total} />

                        {/* DONUT */}
                        <View style={[styles.card, styles.chartCard]}>
                            <View style={styles.chartHead}>
                                <View>
                                    <Text style={styles.chartTitle}>Répartition des tâches</Text>
                                    <Text style={styles.chartSub}>Distribution par statut</Text>
                                </View>
                                {total > 0 && (
                                    <View style={styles.totalPill}>
                                        <View style={[styles.roleDot, { backgroundColor: COLORS.indigo }]} />
                                        <Text style={styles.totalPillText}>{total} tâches</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.chartDivider} />
                            <DonutChart data={pieData} total={total} />
                        </View>
                    </>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:    { flex: 1, backgroundColor: COLORS.bg },
    scroll:  { flex: 1 },
    content: { padding: 20, paddingBottom: 100 },

    /* Header */
    header:     { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, marginTop:8 },
    headerLeft: { flex:1, marginRight:12 },
    greeting:   { fontSize:14, color:COLORS.textMuted, fontWeight:'400', marginBottom:3 },
    userName:   { fontSize:23, fontWeight:'700', color:COLORS.text, letterSpacing:-0.6, marginBottom:10 },
    rolePill:   { flexDirection:'row', alignItems:'center', gap:6, alignSelf:'flex-start', paddingHorizontal:11, paddingVertical:5, borderRadius:20 },
    roleDot:    { width:6, height:6, borderRadius:3 },
    roleText:   { fontSize:12, fontWeight:'600' },
    avatar: {
        width:46, height:46, borderRadius:13,
        alignItems:'center', justifyContent:'center',
        shadowColor:'#0F172A', shadowOpacity:0.15,
        shadowRadius:8, shadowOffset:{ width:0, height:2 }, elevation:3,
    },
    avatarText: { color:'white', fontSize:19, fontWeight:'700' },

    /* Card base */
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width:0, height:2 },
        elevation: 2,
    },

    /* Stat cards */
    cardsGrid: { flexDirection:'row', flexWrap:'wrap', gap:12, marginBottom:12 },
    statCard:  { padding:16, width:'47.5%', flexGrow:1 },
    cardHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
    cardLabel:   { fontSize:12, color:COLORS.textMuted, fontWeight:'500' },
    cardIconBox: { width:30, height:30, borderRadius:8, alignItems:'center', justifyContent:'center' },
    cardNum:     { fontSize:30, fontWeight:'700', color:COLORS.text, letterSpacing:-0.8 },

    /* Completion */
    completionCard:  { padding:16, marginBottom:12 },
    completionTop:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
    completionLeft:  { flexDirection:'row', alignItems:'center', gap:9 },
    completionTitle: { fontSize:13.5, fontWeight:'600', color:COLORS.text },
    completionPct:   { fontSize:16, fontWeight:'700', letterSpacing:-0.3 },
    progressTrack:   { height:7, backgroundColor:COLORS.borderLight, borderRadius:10, overflow:'hidden', marginBottom:8 },
    progressFill:    { height:'100%', borderRadius:10, minWidth:4 },
    completionSub:   { fontSize:12, color:COLORS.textLight },

    /* Chart */
    chartCard:    { padding:20, marginBottom:12 },
    chartHead:    { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 },
    chartTitle:   { fontSize:14.5, fontWeight:'700', color:COLORS.text, letterSpacing:-0.2, marginBottom:3 },
    chartSub:     { fontSize:12, color:COLORS.textLight },
    chartDivider: { height:1, backgroundColor:COLORS.borderLight, marginVertical:14 },
    totalPill: {
        flexDirection:'row', alignItems:'center', gap:5,
        backgroundColor:'#F8FAFC', borderWidth:1, borderColor:COLORS.border,
        borderRadius:20, paddingHorizontal:10, paddingVertical:5,
    },
    totalPillText: { fontSize:12, color:COLORS.textMuted, fontWeight:'500' },

    /* Donut */
    chartWrapper: { alignItems:'center' },
    donutCenter:  { position:'absolute', alignItems:'center', justifyContent:'center', top:0, bottom:0, left:0, right:0 },
    donutTotal:   { fontSize:28, fontWeight:'700', color:COLORS.text, letterSpacing:-0.8 },
    donutLabel:   { fontSize:11, color:COLORS.textLight, fontWeight:'600', textTransform:'uppercase', letterSpacing:0.6, marginTop:2 },

    /* Legend */
    legend:     { width:'100%', marginTop:20, gap:11 },
    legendItem: { flexDirection:'row', alignItems:'center', gap:9 },
    legendDot:  { width:8, height:8, borderRadius:4 },
    legendName: { flex:1, fontSize:13, color:COLORS.textMuted, fontWeight:'500' },
    legendVal:  { fontSize:13, fontWeight:'700', color:COLORS.text, marginRight:6 },
    legendPill: { paddingHorizontal:8, paddingVertical:3, borderRadius:20 },
    legendPct:  { fontSize:11.5, fontWeight:'700' },

    /* Empty */
    emptyChart:     { alignItems:'center', paddingVertical:36 },
    emptyChartIcon: { width:44, height:44, borderRadius:12, backgroundColor:'#F8FAFC', borderWidth:1, borderColor:COLORS.border, alignItems:'center', justifyContent:'center', marginBottom:12 },
    emptyText:      { fontSize:13.5, color:COLORS.textLight },
});
