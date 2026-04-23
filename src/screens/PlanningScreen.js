import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, Modal, SafeAreaView
} from 'react-native';
import API from '../services/api';

const STATUT = {
    a_faire:  { label:"À faire",  color:"#92400e", bg:"#fef3c7", dot:"#f59e0b" },
    en_cours: { label:"En cours", color:"#1e40af", bg:"#dbeafe", dot:"#3b82f6" },
    termine:  { label:"Terminé",  color:"#065f46", bg:"#d1fae5", dot:"#10b981" },
};

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS   = ["L","M","M","J","V","S","D"];

export default function PlanningScreen() {
    const [tasks, setTasks]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [cur, setCur]         = useState(new Date());
    const [sel, setSel]         = useState(null);
    const [filter, setFilter]   = useState("tous");
    const today = new Date();

    useEffect(() => {
        (async () => {
            try {
                const { data: projects } = await API.get('/projects');
                const arrays = await Promise.all(
                    projects.map(p =>
                        API.get(`/projects/${p.id}/tasks`)
                           .then(r => r.data.map(t => ({ ...t, projectTitre: p.titre, projectId: p.id })))
                           .catch(() => [])
                    )
                );
                setTasks(arrays.flat().filter(t => t.date_echeance));
            } catch(e) { console.log(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const year = cur.getFullYear(), month = cur.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    let   dow      = firstDay.getDay() - 1;
    if (dow < 0) dow = 6;

    const days = [];
    for (let i = dow - 1; i >= 0; i--)          days.push({ date: new Date(year, month, -i),     cur: false });
    for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i),       cur: true  });
    while (days.length < 42)                     days.push({ date: new Date(year, month + 1, days.length - dow - lastDay.getDate() + 1), cur: false });

    const visible = filter === "tous" ? tasks : tasks.filter(t => t.statut === filter);
    const forDay  = d => visible.filter(t => new Date(t.date_echeance + "T00:00:00").toDateString() === d.toDateString());
    const isToday = d => d.toDateString() === today.toDateString();
    const getAssigne = t => t.assignedUser?.nom || t.assigned_user?.nom || null;

    const monthTasks = tasks.filter(t => {
        const d = new Date(t.date_echeance + "T00:00:00");
        return d.getMonth() === month && d.getFullYear() === year;
    });

    if (loading) return (
        <SafeAreaView style={s.safe}>
            <View style={s.center}>
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text style={s.loadTxt}>Chargement du planning...</Text>
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={s.container}>

                {/* TITRE */}
                <Text style={s.title}>Planning</Text>
                <Text style={s.subtitle}>{monthTasks.length} tâche{monthTasks.length !== 1 ? "s" : ""} ce mois · {tasks.length} au total</Text>

                {/* FILTRES */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14 }}>
                    {[
                        { val:"tous",     label:"Tous",     dot:"#94a3b8", ac:"#0f172a" },
                        { val:"a_faire",  label:"À faire",  dot:"#f59e0b", ac:"#f59e0b" },
                        { val:"en_cours", label:"En cours", dot:"#3b82f6", ac:"#3b82f6" },
                        { val:"termine",  label:"Terminé",  dot:"#10b981", ac:"#10b981" },
                    ].map(f => (
                        <TouchableOpacity key={f.val} onPress={() => setFilter(f.val)}
                            style={[s.chip, filter === f.val && { backgroundColor: f.ac, borderColor: f.ac }]}>
                            <View style={{ width:7, height:7, borderRadius:4, backgroundColor: filter === f.val ? "white" : f.dot }} />
                            <Text style={[s.chipTxt, filter === f.val && { color:"white" }]}>{f.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* NAVIGATION MOIS */}
                <View style={s.navRow}>
                    <TouchableOpacity style={s.arr} onPress={() => setCur(new Date(year, month - 1, 1))}>
                        <Text style={s.arrTxt}>‹</Text>
                    </TouchableOpacity>
                    <Text style={s.monthTxt}>{MONTHS[month]} {year}</Text>
                    <TouchableOpacity style={s.arr} onPress={() => setCur(new Date(year, month + 1, 1))}>
                        <Text style={s.arrTxt}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.todayBtn} onPress={() => setCur(new Date())}>
                        <Text style={s.todayTxt}>Aujourd'hui</Text>
                    </TouchableOpacity>
                </View>

                {/* CALENDRIER */}
                <View style={s.cal}>
                    {/* En-têtes jours */}
                    <View style={s.week}>
                        {DAYS.map((d, i) => (
                            <View key={i} style={s.th}>
                                <Text style={[s.thTxt, i >= 5 && { color:"#cbd5e1" }]}>{d}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Semaines */}
                    {Array.from({ length:6 }, (_, w) => (
                        <View key={w} style={s.week}>
                            {days.slice(w*7, w*7+7).map((day, i) => {
                                const dt  = forDay(day.date);
                                const now = isToday(day.date);
                                const we  = day.date.getDay() === 0 || day.date.getDay() === 6;
                                return (
                                    <View key={i} style={[
                                        s.td,
                                        !day.cur && s.tdOut,
                                        we && !now && s.tdWe,
                                        now && s.tdNow,
                                    ]}>
                                        <View style={s.dayRow}>
                                            <View style={[s.dayNum, now && s.dayNumNow]}>
                                                <Text style={[s.dayTxt, !day.cur && { color:"#cbd5e1" }, now && { color:"white" }]}>
                                                    {day.date.getDate()}
                                                </Text>
                                            </View>
                                            {dt.length > 0 && (
                                                <View style={s.badge}>
                                                    <Text style={s.badgeTxt}>{dt.length}</Text>
                                                </View>
                                            )}
                                        </View>
                                        {dt.slice(0,2).map(t => {
                                            const c = STATUT[t.statut] || STATUT.a_faire;
                                            const a = getAssigne(t);
                                            return (
                                                <TouchableOpacity key={t.id} onPress={() => setSel(t)}
                                                    style={[s.ev, { backgroundColor: c.bg, borderLeftColor: c.dot }]}>
                                                    <Text style={[s.evTitle, { color: c.color }]} numberOfLines={1}>{t.titre}</Text>
                                                    <Text style={[s.evSub,   { color: c.color }]} numberOfLines={1}>
                                                        {t.projectTitre}{a ? ` · ${a}` : ""}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                        {dt.length > 2 && (
                                            <Text style={s.more}>+{dt.length - 2}</Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>

                {tasks.length === 0 && (
                    <View style={s.empty}>
                        <Text style={s.emptyIcon}>📅</Text>
                        <Text style={s.emptyTitle}>Aucune tâche avec date d'échéance</Text>
                        <Text style={s.emptySub}>Ajoutez des dates d'échéance à vos tâches</Text>
                    </View>
                )}

            </ScrollView>

            {/* MODAL */}
            <Modal visible={!!sel} transparent animationType="fade" onRequestClose={() => setSel(null)}>
                <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setSel(null)}>
                    <TouchableOpacity activeOpacity={1} style={s.modal}>

                        {/* Header coloré */}
                        <View style={[s.modalHead, { backgroundColor: STATUT[sel?.statut]?.bg }]}>
                            <View style={{ flex:1, marginRight:12 }}>
                                <Text style={[s.modalStatut, { color: STATUT[sel?.statut]?.dot }]}>
                                    {STATUT[sel?.statut]?.label?.toUpperCase()}
                                </Text>
                                <Text style={s.modalTitle}>{sel?.titre}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSel(null)}>
                                <Text style={s.modalClose}>×</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={s.modalBody}>
                            {/* Projet */}
                            <View style={s.infoRow}>
                                <Text style={s.infoIcon}>📁</Text>
                                <Text style={s.infoVal}>{sel?.projectTitre}</Text>
                            </View>
                            {/* Assigné */}
                            {getAssigne(sel) && (
                                <View style={[s.infoRow, { backgroundColor:"#f0fdf4" }]}>
                                    <Text style={s.infoIcon}>👤</Text>
                                    <Text style={[s.infoVal, { color:"#065f46" }]}>Assigné à : {getAssigne(sel)}</Text>
                                </View>
                            )}
                            {sel?.description ? <Text style={s.modalDesc}>{sel.description}</Text> : null}
                            {[
                                { label:"Priorité", value: sel?.priorite === "haute" ? "🔴 Haute" : sel?.priorite === "normale" ? "🟡 Normale" : "🟢 Basse" },
                                { label:"Échéance", value: sel?.date_echeance },
                            ].map(r => (
                                <View key={r.label} style={s.detailRow}>
                                    <Text style={s.detailLabel}>{r.label}</Text>
                                    <Text style={s.detailVal}>{r.value}</Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe:       { flex:1, backgroundColor:"#f8fafc" },
    center:     { flex:1, justifyContent:"center", alignItems:"center" },
    loadTxt:    { marginTop:12, color:"#94a3b8", fontSize:14 },
    container:  { padding:16, paddingBottom:32 },
    title:      { fontSize:22, fontWeight:"700", color:"#0f172a", marginBottom:2 },
    subtitle:   { fontSize:13, color:"#94a3b8", marginBottom:14 },
    chip:       { flexDirection:"row", alignItems:"center", gap:5, paddingHorizontal:13, paddingVertical:6, borderRadius:20, borderWidth:1.5, borderColor:"#e2e8f0", backgroundColor:"white", marginRight:7 },
    chipTxt:    { fontSize:12, fontWeight:"500", color:"#64748b" },
    navRow:     { flexDirection:"row", alignItems:"center", gap:8, marginBottom:12 },
    arr:        { width:32, height:32, borderRadius:8, backgroundColor:"white", borderWidth:1, borderColor:"#e2e8f0", alignItems:"center", justifyContent:"center" },
    arrTxt:     { fontSize:18, color:"#374151", lineHeight:22 },
    monthTxt:   { fontSize:16, fontWeight:"700", color:"#0f172a", flex:1, textAlign:"center" },
    todayBtn:   { paddingHorizontal:12, paddingVertical:5, borderRadius:8, backgroundColor:"white", borderWidth:1, borderColor:"#e2e8f0" },
    todayTxt:   { fontSize:12, fontWeight:"500", color:"#1d4ed8" },
    cal:        { backgroundColor:"white", borderRadius:12, borderWidth:1, borderColor:"#e2e8f0", overflow:"hidden" },
    week:       { flexDirection:"row" },
    th:         { flex:1, paddingVertical:8, alignItems:"center", backgroundColor:"#f8fafc", borderBottomWidth:2, borderBottomColor:"#e2e8f0" },
    thTxt:      { fontSize:10, fontWeight:"600", color:"#64748b", textTransform:"uppercase" },
    td:         { flex:1, minHeight:75, borderWidth:0.5, borderColor:"#f1f5f9", padding:4, backgroundColor:"white" },
    tdOut:      { backgroundColor:"#f8fafc" },
    tdWe:       { backgroundColor:"#fafafa" },
    tdNow:      { backgroundColor:"#eff6ff", borderWidth:1.5, borderColor:"#3b82f6" },
    dayRow:     { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:3 },
    dayNum:     { width:20, height:20, borderRadius:10, alignItems:"center", justifyContent:"center" },
    dayNumNow:  { backgroundColor:"#1d4ed8" },
    dayTxt:     { fontSize:11, fontWeight:"500", color:"#0f172a" },
    badge:      { backgroundColor:"#f1f5f9", borderRadius:8, paddingHorizontal:4, paddingVertical:1 },
    badgeTxt:   { fontSize:9, fontWeight:"700", color:"#94a3b8" },
    ev:         { borderRadius:4, borderLeftWidth:3, paddingHorizontal:4, paddingVertical:3, marginBottom:2 },
    evTitle:    { fontSize:9.5, fontWeight:"600" },
    evSub:      { fontSize:8.5, opacity:0.7, marginTop:1 },
    more:       { fontSize:9, color:"#94a3b8", fontWeight:"600", paddingLeft:4 },
    empty:      { alignItems:"center", paddingVertical:48 },
    emptyIcon:  { fontSize:36, marginBottom:12 },
    emptyTitle: { fontSize:14, fontWeight:"600", color:"#475569", marginBottom:4 },
    emptySub:   { fontSize:12, color:"#94a3b8" },
    overlay:    { flex:1, backgroundColor:"rgba(15,23,42,0.45)", justifyContent:"center", alignItems:"center" },
    modal:      { backgroundColor:"white", borderRadius:18, width:"90%", maxWidth:420, overflow:"hidden" },
    modalHead:  { padding:"18px 20px 14px", flexDirection:"row", alignItems:"flex-start" },
    modalStatut:{ fontSize:10, fontWeight:"700", letterSpacing:1, textTransform:"uppercase", marginBottom:4 },
    modalTitle: { fontSize:17, fontWeight:"700", color:"#0f172a", lineHeight:22 },
    modalClose: { fontSize:24, color:"#94a3b8", lineHeight:24 },
    modalBody:  { padding:18 },
    infoRow:    { flexDirection:"row", alignItems:"center", gap:8, backgroundColor:"#f8fafc", borderRadius:10, padding:10, marginBottom:8 },
    infoIcon:   { fontSize:13 },
    infoVal:    { fontSize:13, fontWeight:"600", color:"#374151" },
    modalDesc:  { fontSize:13, color:"#64748b", marginBottom:12, lineHeight:19 },
    detailRow:  { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingVertical:9, borderBottomWidth:1, borderBottomColor:"#f1f5f9" },
    detailLabel:{ fontSize:12.5, color:"#94a3b8" },
    detailVal:  { fontSize:13, fontWeight:"500", color:"#374151" },
});