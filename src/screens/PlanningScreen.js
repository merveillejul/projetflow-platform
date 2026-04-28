import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Modal, Animated, Easing,
} from 'react-native';
import API from '../services/api';
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

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS   = ["L","M","M","J","V","S","D"];

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

function PlanningSkeleton() {
    return (
        <View style={{ padding:16, gap:14 }}>
            <SkeletonBox width="60%" height={24} />
            <SkeletonBox width="40%" height={16} />
            <SkeletonBox width="100%" height={340} radius={14} />
        </View>
    );
}

export default function PlanningScreen() {
    const [allTasks, setAllTasks]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [current, setCurrent]           = useState(new Date());
    const [selected, setSelected]         = useState(null);
    const [filterStatut, setFilterStatut] = useState('tous');
    const today = new Date();

    useEffect(() => {
        (async () => {
            try {
                const { data: projects } = await API.get('/projects');
                const arrays = await Promise.all(
                    projects.map(p =>
                        API.get(`/projects/${p.id}/tasks`)
                            .then(r => r.data.map(t => ({ ...t, projectTitre:p.titre, projectId:p.id })))
                            .catch(() => [])
                    )
                );
                setAllTasks(arrays.flat().filter(t => t && t.date_echeance));
            } catch (err) { console.log(err); }
            finally { setLoading(false); }
        })();
    }, []);

    const year  = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    let startDow   = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days = [];
    for (let i = startDow - 1; i >= 0; i--)
        days.push({ date:new Date(year, month, -i), current:false });
    for (let i = 1; i <= lastDay.getDate(); i++)
        days.push({ date:new Date(year, month, i), current:true });
    while (days.length < 42)
        days.push({ date:new Date(year, month+1, days.length-startDow-lastDay.getDate()+1), current:false });

    const filtered = filterStatut === 'tous' ? allTasks : allTasks.filter(t => t.statut === filterStatut);

    const getTasksForDay = (date) =>
        filtered.filter(t => {
            if (!t?.date_echeance) return false;
            const d = new Date(t.date_echeance + 'T00:00:00');
            return d.getFullYear() === date.getFullYear() &&
                   d.getMonth()    === date.getMonth()    &&
                   d.getDate()     === date.getDate();
        });

    const isToday   = (d) => d.toDateString() === today.toDateString();
    const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;
    const getAssigne = (t) => t?.assignedUser?.nom || t?.assigned_user?.nom || null;

    const monthTasks = allTasks.filter(t => {
        const d = new Date(t.date_echeance + 'T00:00:00');
        return d.getMonth() === month && d.getFullYear() === year;
    });

    const FILTERS = [
        { key:'tous',     label:'Tous',     dot:'#94A3B8', activeBg:COLORS.primary,   activeColor:'white',        activeBorder:COLORS.primary },
        { key:'a_faire',  label:'À faire',  dot:COLORS.amber,  activeBg:COLORS.amberBg,   activeColor:COLORS.amber,   activeBorder:COLORS.amberBorder },
        { key:'en_cours', label:'En cours', dot:COLORS.indigo, activeBg:COLORS.indigoBg,  activeColor:COLORS.indigo,  activeBorder:COLORS.indigoBorder },
        { key:'termine',  label:'Terminé',  dot:COLORS.green,  activeBg:COLORS.greenBg,   activeColor:COLORS.green,   activeBorder:COLORS.greenBorder },
    ];

    if (loading) return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <PlanningSkeleton />
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Planning</Text>
                        <Text style={styles.subtitle}>
                            {monthTasks.length} tâche{monthTasks.length !== 1 ? 's' : ''} ce mois · {allTasks.length} au total
                        </Text>
                    </View>
                </View>

                {/* ── Filtres ── */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14 }}>
                    <View style={{ flexDirection:'row', gap:7, paddingHorizontal:16 }}>
                        {FILTERS.map(f => {
                            const isActive = filterStatut === f.key;
                            return (
                                <TouchableOpacity
                                    key={f.key}
                                    style={[
                                        styles.filterBtn,
                                        isActive && { backgroundColor:f.activeBg, borderColor:f.activeBorder },
                                    ]}
                                    onPress={() => setFilterStatut(f.key)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.filterDot, {
                                        backgroundColor: isActive
                                            ? (f.key === 'tous' ? 'rgba(255,255,255,0.5)' : f.dot)
                                            : f.dot
                                    }]} />
                                    <Text style={[
                                        styles.filterText,
                                        isActive && { color:f.activeColor, fontWeight:'700' },
                                    ]}>
                                        {f.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* ── Nav mois ── */}
                <View style={styles.navRow}>
                    <TouchableOpacity
                        style={styles.navBtn}
                        onPress={() => setCurrent(new Date(year, month-1, 1))}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.navBtnText}>‹</Text>
                    </TouchableOpacity>

                    <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>

                    <TouchableOpacity
                        style={styles.navBtn}
                        onPress={() => setCurrent(new Date(year, month+1, 1))}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.navBtnText}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.todayBtn}
                        onPress={() => setCurrent(new Date())}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.todayBtnText}>Auj.</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Calendrier ── */}
                <View style={styles.calendar}>
                    {/* Jours de la semaine */}
                    <View style={styles.weekHeader}>
                        {DAYS.map((d, i) => (
                            <View key={i} style={styles.dayHeaderCell}>
                                <Text style={[
                                    styles.dayHeaderText,
                                    i >= 5 && { color:COLORS.border },
                                ]}>
                                    {d}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Semaines */}
                    {Array.from({ length:6 }, (_, w) => (
                        <View key={w} style={styles.weekRow}>
                            {days.slice(w*7, w*7+7).map((day, i) => {
                                const dayTasks = getTasksForDay(day.date);
                                const now      = isToday(day.date);
                                const we       = isWeekend(day.date);
                                return (
                                    <View key={i} style={[
                                        styles.dayCell,
                                        !day.current && styles.dayCellOut,
                                        we && !now && styles.dayCellWE,
                                        now && styles.dayCellToday,
                                    ]}>
                                        {/* Numéro du jour */}
                                        <View style={[
                                            styles.dayNum,
                                            now && styles.dayNumToday,
                                        ]}>
                                            <Text style={[
                                                styles.dayNumText,
                                                !day.current && { color:COLORS.border },
                                                now && { color:'white', fontWeight:'700' },
                                            ]}>
                                                {day.date.getDate()}
                                            </Text>
                                        </View>

                                        {/* Tâches du jour */}
                                        {dayTasks.slice(0,2).map(task => {
                                            const conf = STATUT_CONFIG[task.statut] ?? STATUT_CONFIG.a_faire;
                                            return (
                                                <TouchableOpacity
                                                    key={task.id}
                                                    style={[styles.taskPill, { backgroundColor:conf.bg, borderLeftColor:conf.dot }]}
                                                    onPress={() => setSelected(task)}
                                                    activeOpacity={0.75}
                                                >
                                                    <Text style={[styles.taskPillText, { color:conf.color }]} numberOfLines={1}>
                                                        {task.titre}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                        {dayTasks.length > 2 && (
                                            <Text style={styles.moreText}>+{dayTasks.length - 2}</Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>

                {/* Empty */}
                {allTasks.length === 0 && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Text style={{ fontSize:22, color:COLORS.textLight }}>○</Text>
                        </View>
                        <Text style={styles.emptyTitle}>Aucune tâche avec date d'échéance</Text>
                        <Text style={styles.emptySub}>Ajoutez des dates d'échéance à vos tâches pour les voir ici.</Text>
                    </View>
                )}

            </ScrollView>

            {/* ── Modal détail tâche ── */}
            <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelected(null)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>

                        {/* Handle */}
                        <View style={styles.modalHandle} />

                        {/* Header */}
                        <View style={[styles.modalHeader, { backgroundColor: STATUT_CONFIG[selected?.statut]?.bg ?? COLORS.bg }]}>
                            <View style={{ flex:1, marginRight:12 }}>
                                <View style={styles.modalStatutRow}>
                                    <View style={[styles.modalStatutDot, { backgroundColor: STATUT_CONFIG[selected?.statut]?.dot }]} />
                                    <Text style={[styles.modalStatutLabel, { color: STATUT_CONFIG[selected?.statut]?.color }]}>
                                        {STATUT_CONFIG[selected?.statut]?.label}
                                    </Text>
                                </View>
                                <Text style={styles.modalTitle}>{selected?.titre}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelected(null)} style={styles.modalCloseBtn}>
                                <Text style={{ fontSize:16, color:COLORS.textMuted, fontWeight:'700' }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Corps */}
                        <View style={styles.modalBody}>
                            {/* Projet */}
                            <View style={styles.modalInfoCard}>
                                <View style={styles.modalInfoDot} />
                                <Text style={styles.modalInfoText}>{selected?.projectTitre}</Text>
                            </View>

                            {/* Assigné */}
                            {getAssigne(selected) && (
                                <View style={[styles.modalInfoCard, { backgroundColor:COLORS.greenBg, borderColor:COLORS.greenBorder }]}>
                                    <View style={[styles.modalInfoDot, { backgroundColor:COLORS.green }]} />
                                    <Text style={[styles.modalInfoText, { color:COLORS.green }]}>
                                        Assigné à : {getAssigne(selected)}
                                    </Text>
                                </View>
                            )}

                            {selected?.description && (
                                <Text style={styles.modalDesc}>{selected.description}</Text>
                            )}

                            {/* Infos */}
                            {[
                                { label:'Priorité', value: selected?.priorite === 'haute' ? 'Haute' : selected?.priorite === 'normale' ? 'Normale' : 'Basse' },
                                { label:'Échéance', value: selected?.date_echeance },
                            ].map(r => (
                                <View key={r.label} style={styles.modalRow}>
                                    <Text style={styles.modalRowLabel}>{r.label}</Text>
                                    <Text style={styles.modalRowValue}>{r.value}</Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:      { flex:1, backgroundColor:COLORS.bg },
    container: { paddingBottom:36 },

    header:   { paddingHorizontal:20, paddingTop:18, paddingBottom:14 },
    title:    { fontSize:23, fontWeight:'700', color:COLORS.text, letterSpacing:-0.6, marginBottom:3 },
    subtitle: { fontSize:13, color:COLORS.textLight },

    filterBtn: {
        flexDirection:'row', alignItems:'center', gap:6,
        paddingHorizontal:13, paddingVertical:8,
        borderRadius:20, borderWidth:1, borderColor:COLORS.border,
        backgroundColor:COLORS.white,
    },
    filterDot:  { width:6, height:6, borderRadius:3 },
    filterText: { fontSize:12.5, fontWeight:'500', color:COLORS.textMuted },

    /* Nav */
    navRow: {
        flexDirection:'row', alignItems:'center',
        paddingHorizontal:16, marginBottom:14, gap:8,
    },
    navBtn: {
        width:36, height:36, borderRadius:10,
        backgroundColor:COLORS.white, borderWidth:1, borderColor:COLORS.border,
        alignItems:'center', justifyContent:'center',
    },
    navBtnText: { fontSize:20, color:COLORS.text, fontWeight:'500', lineHeight:24 },
    monthTitle: {
        flex:1, textAlign:'center',
        fontSize:16, fontWeight:'700', color:COLORS.text, letterSpacing:-0.3,
    },
    todayBtn: {
        backgroundColor:COLORS.indigoBg, borderWidth:1, borderColor:COLORS.indigoBorder,
        borderRadius:10, paddingHorizontal:12, paddingVertical:8,
    },
    todayBtnText: { fontSize:12.5, fontWeight:'700', color:COLORS.indigo },

    /* Calendrier */
    calendar: {
        marginHorizontal:16,
        backgroundColor:COLORS.white, borderRadius:14,
        borderWidth:1, borderColor:COLORS.border, overflow:'hidden',
        shadowColor:'#0F172A', shadowOpacity:0.04,
        shadowRadius:8, shadowOffset:{ width:0, height:2 }, elevation:2,
    },
    weekHeader:    { flexDirection:'row', backgroundColor:COLORS.bg, borderBottomWidth:1, borderBottomColor:COLORS.border },
    dayHeaderCell: { flex:1, paddingVertical:9, alignItems:'center' },
    dayHeaderText: { fontSize:11, fontWeight:'700', color:COLORS.textLight, textTransform:'uppercase' },
    weekRow:       { flexDirection:'row' },
    dayCell: {
        flex:1, minHeight:72, padding:5,
        borderWidth:0.5, borderColor:COLORS.borderLight,
        backgroundColor:COLORS.white,
    },
    dayCellOut:   { backgroundColor:'#FAFAFA' },
    dayCellWE:    { backgroundColor:'#FAFAFA' },
    dayCellToday: { backgroundColor:COLORS.indigoBg },

    dayNum: {
        width:20, height:20, borderRadius:10,
        alignItems:'center', justifyContent:'center', marginBottom:3,
    },
    dayNumToday:  { backgroundColor:COLORS.indigo },
    dayNumText:   { fontSize:11, fontWeight:'500', color:COLORS.text },

    taskPill: {
        borderRadius:4, paddingHorizontal:4, paddingVertical:2,
        marginBottom:2, borderLeftWidth:2,
    },
    taskPillText: { fontSize:9.5, fontWeight:'700' },
    moreText:     { fontSize:9, color:COLORS.textLight, fontWeight:'600', paddingLeft:2 },

    /* Empty */
    emptyState: { alignItems:'center', paddingTop:36, paddingHorizontal:32 },
    emptyIcon: {
        width:52, height:52, borderRadius:14,
        backgroundColor:COLORS.white, borderWidth:1, borderColor:COLORS.border,
        alignItems:'center', justifyContent:'center', marginBottom:12,
    },
    emptyTitle: { fontSize:15, fontWeight:'700', color:COLORS.text, marginBottom:5, textAlign:'center' },
    emptySub:   { fontSize:13, color:COLORS.textLight, textAlign:'center', lineHeight:19 },

    /* Modal */
    modalOverlay: {
        flex:1, backgroundColor:'rgba(15,23,42,0.5)',
        justifyContent:'flex-end',
    },
    modalSheet: {
        backgroundColor:COLORS.white,
        borderTopLeftRadius:24, borderTopRightRadius:24,
        overflow:'hidden',
        shadowColor:'#000', shadowOpacity:0.15, shadowRadius:20,
        shadowOffset:{ width:0, height:-4 }, elevation:10,
    },
    modalHandle: {
        width:36, height:4, borderRadius:2,
        backgroundColor:COLORS.border,
        alignSelf:'center', marginTop:10, marginBottom:4,
    },
    modalHeader:   { padding:20, paddingTop:16, paddingBottom:18 },
    modalStatutRow:{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:6 },
    modalStatutDot:{ width:7, height:7, borderRadius:4 },
    modalStatutLabel:{ fontSize:11.5, fontWeight:'700', textTransform:'uppercase', letterSpacing:0.5 },
    modalTitle:    { fontSize:19, fontWeight:'700', color:COLORS.text, letterSpacing:-0.4, lineHeight:25 },
    modalCloseBtn: {
        width:32, height:32, borderRadius:8,
        backgroundColor:'rgba(0,0,0,0.06)',
        alignItems:'center', justifyContent:'center',
    },
    modalBody:    { padding:20, paddingTop:4, paddingBottom:32, gap:10 },
    modalInfoCard:{
        flexDirection:'row', alignItems:'center', gap:9,
        backgroundColor:COLORS.bg, borderWidth:1, borderColor:COLORS.border,
        borderRadius:10, paddingHorizontal:13, paddingVertical:10,
    },
    modalInfoDot: { width:7, height:7, borderRadius:4, backgroundColor:COLORS.textLight, flexShrink:0 },
    modalInfoText:{ fontSize:13.5, fontWeight:'600', color:COLORS.textMuted, flex:1 },
    modalDesc:    { fontSize:13.5, color:COLORS.textMuted, lineHeight:21 },
    modalRow:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:COLORS.borderLight },
    modalRowLabel:{ fontSize:13, color:COLORS.textLight },
    modalRowValue:{ fontSize:13, fontWeight:'600', color:COLORS.text },
});
