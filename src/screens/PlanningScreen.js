import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../services/api';

const STATUT_CONFIG = {
    a_faire:  { label: "À faire",  color: "#f59e0b", bg: "#fffbeb" },
    en_cours: { label: "En cours", color: "#3b82f6", bg: "#eff6ff" },
    termine:  { label: "Terminé",  color: "#10b981", bg: "#f0fdf4" },
};

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS   = ["L","M","M","J","V","S","D"];

export default function PlanningScreen() {
    const [allTasks, setAllTasks]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [current, setCurrent]           = useState(new Date());
    const [selected, setSelected]         = useState(null);
    const [filterStatut, setFilterStatut] = useState("tous");
    const today = new Date();

    useEffect(() => {
        const load = async () => {
            try {
                const projRes  = await API.get('/projects');
                const projects = projRes.data;
                const arrays   = await Promise.all(
                    projects.map(p =>
                        API.get(`/projects/${p.id}/tasks`)
                           .then(r => r.data.map(t => ({ ...t, projectTitre: p.titre, projectId: p.id })))
                           .catch(() => [])
                    )
                );
                setAllTasks(arrays.flat().filter(t => t && t.date_echeance));
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const year  = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    let startDow   = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days = [];
    for (let i = startDow - 1; i >= 0; i--)
        days.push({ date: new Date(year, month, -i), current: false });
    for (let i = 1; i <= lastDay.getDate(); i++)
        days.push({ date: new Date(year, month, i), current: true });
    while (days.length < 42)
        days.push({ date: new Date(year, month + 1, days.length - startDow - lastDay.getDate() + 1), current: false });

    const filteredTasks = filterStatut === "tous"
        ? allTasks
        : allTasks.filter(t => t && t.statut === filterStatut);

    const getTasksForDay = (date) =>
        filteredTasks.filter(t => {
            if (!t || !t.date_echeance) return false;
            const td = new Date(t.date_echeance + "T00:00:00");
            return td.getFullYear() === date.getFullYear() &&
                   td.getMonth()    === date.getMonth()    &&
                   td.getDate()     === date.getDate();
        });

    const isToday = (date) =>
        date.getFullYear() === today.getFullYear() &&
        date.getMonth()    === today.getMonth()    &&
        date.getDate()     === today.getDate();

    const getAssigne = (t) => {
        if (!t) return null;
        return t.assignedUser?.nom || t.assigned_user?.nom || null;
    };

    if (loading) return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text style={styles.loadingText}>Chargement du planning...</Text>
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* EN-TÊTE */}
                <Text style={styles.title}>Planning</Text>
                <Text style={styles.subtitle}>
                    {allTasks.length} tâche{allTasks.length !== 1 ? "s" : ""} sur tous les projets
                </Text>

                {/* FILTRES */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
                    {[
                        { val: "tous",     label: "Tous",     color: "#0f172a" },
                        { val: "a_faire",  label: "À faire",  color: "#f59e0b" },
                        { val: "en_cours", label: "En cours", color: "#3b82f6" },
                        { val: "termine",  label: "Terminé",  color: "#10b981" },
                    ].map(f => (
                        <TouchableOpacity
                            key={f.val}
                            onPress={() => setFilterStatut(f.val)}
                            style={[styles.filterBtn, filterStatut === f.val && { backgroundColor: f.color, borderColor: f.color }]}
                        >
                            <Text style={[styles.filterText, filterStatut === f.val && { color: "white" }]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* NAVIGATION MOIS */}
                <View style={styles.navRow}>
                    <TouchableOpacity style={styles.navBtn} onPress={() => setCurrent(new Date(year, month - 1, 1))}>
                        <Text style={styles.navBtnText}>← Préc.</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
                    <TouchableOpacity style={styles.navBtn} onPress={() => setCurrent(new Date(year, month + 1, 1))}>
                        <Text style={styles.navBtnText}>Suiv. →</Text>
                    </TouchableOpacity>
                </View>

                {/* CALENDRIER */}
                <View style={styles.calendar}>
                    <View style={styles.weekRow}>
                        {DAYS.map((d, i) => (
                            <View key={i} style={styles.dayHeader}>
                                <Text style={styles.dayHeaderText}>{d}</Text>
                            </View>
                        ))}
                    </View>

                    {Array.from({ length: 6 }, (_, week) => (
                        <View key={week} style={styles.weekRow}>
                            {days.slice(week * 7, week * 7 + 7).map((day, i) => {
                                const dayTasks   = getTasksForDay(day.date);
                                const todayStyle = isToday(day.date);
                                return (
                                    <View key={i} style={[
                                        styles.dayCell,
                                        !day.current && styles.otherMonth,
                                        todayStyle && styles.todayCell,
                                    ]}>
                                        <Text style={[
                                            styles.dayNumber,
                                            !day.current && styles.otherMonthText,
                                            todayStyle && styles.todayNumber,
                                        ]}>
                                            {day.date.getDate()}
                                        </Text>
                                        {dayTasks.slice(0, 2).map(task => {
                                            if (!task) return null;
                                            const conf = STATUT_CONFIG[task.statut] || STATUT_CONFIG.a_faire;
                                            return (
                                                <TouchableOpacity
                                                    key={task.id}
                                                    onPress={() => setSelected(task)}
                                                    style={[styles.taskPill, { backgroundColor: conf.bg }]}
                                                >
                                                    <Text style={[styles.taskPillText, { color: conf.color }]} numberOfLines={1}>
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

            </ScrollView>

            {/* MODAL DÉTAIL */}
            <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelected(null)}>
                    <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selected?.titre}</Text>
                            <TouchableOpacity onPress={() => setSelected(null)}>
                                <Text style={styles.modalClose}>×</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalProject}>Projet : {selected?.projectTitre}</Text>

                        {getAssigne(selected) && (
                            <Text style={styles.modalAssigne}>Assigné à : {getAssigne(selected)}</Text>
                        )}

                        {selected?.description ? (
                            <Text style={styles.modalDesc}>{selected.description}</Text>
                        ) : null}

                        <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Statut</Text>
                            <View style={[styles.modalBadge, { backgroundColor: STATUT_CONFIG[selected?.statut]?.bg }]}>
                                <Text style={[styles.modalBadgeText, { color: STATUT_CONFIG[selected?.statut]?.color }]}>
                                    {STATUT_CONFIG[selected?.statut]?.label}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Priorité</Text>
                            <Text style={styles.modalValue}>{selected?.priorite}</Text>
                        </View>
                        <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Échéance</Text>
                            <Text style={styles.modalValue}>{selected?.date_echeance}</Text>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:           { flex: 1, backgroundColor: '#f8fafc' },
    center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText:    { marginTop: 12, color: '#94a3b8', fontSize: 14 },
    container:      { padding: 16, paddingBottom: 32 },
    title:          { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
    subtitle:       { fontSize: 13, color: '#94a3b8', marginBottom: 14 },
    filtersRow:     { marginBottom: 14 },
    filterBtn:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: 'white', marginRight: 8 },
    filterText:     { fontSize: 12, fontWeight: '500', color: '#64748b' },
    navRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    navBtn:         { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    navBtnText:     { fontSize: 13, color: '#374151' },
    monthTitle:     { fontSize: 16, fontWeight: '600', color: '#0f172a' },
    calendar:       { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
    weekRow:        { flexDirection: 'row' },
    dayHeader:      { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: '#f8fafc' },
    dayHeaderText:  { fontSize: 11, fontWeight: '600', color: '#64748b' },
    dayCell:        { flex: 1, minHeight: 70, borderWidth: 0.5, borderColor: '#e2e8f0', padding: 4 },
    otherMonth:     { backgroundColor: '#f8fafc' },
    todayCell:      { borderColor: '#1d4ed8', borderWidth: 1.5 },
    dayNumber:      { fontSize: 11, fontWeight: '500', color: '#0f172a', marginBottom: 2 },
    otherMonthText: { color: '#cbd5e1' },
    todayNumber:    { color: '#1d4ed8', fontWeight: '700' },
    taskPill:       { borderRadius: 3, paddingHorizontal: 3, paddingVertical: 1, marginBottom: 2 },
    taskPillText:   { fontSize: 9, fontWeight: '600' },
    moreText:       { fontSize: 9, color: '#94a3b8', fontWeight: '500' },
    modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    modalCard:      { backgroundColor: 'white', borderRadius: 12, padding: 20, width: '88%', maxWidth: 380 },
    modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    modalTitle:     { fontSize: 16, fontWeight: '600', color: '#0f172a', flex: 1, marginRight: 8 },
    modalClose:     { fontSize: 22, color: '#94a3b8' },
    modalProject:   { fontSize: 12, color: '#64748b', marginBottom: 6 },
    modalAssigne:   { fontSize: 12, color: '#10b981', fontWeight: '600', marginBottom: 10 },
    modalDesc:      { fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 19 },
    modalInfoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalLabel:     { fontSize: 12, color: '#94a3b8' },
    modalValue:     { fontSize: 12, fontWeight: '500', color: '#374151' },
    modalBadge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
    modalBadgeText: { fontSize: 11, fontWeight: '600' },
});