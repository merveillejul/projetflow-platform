import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import API from '../services/api';

export default function ProjectDetailScreen({ route }) {

    const { projectId } = route.params;
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const [projRes, taskRes, memberRes] = await Promise.all([
                API.get(`/projects/${projectId}`),
                API.get(`/projects/${projectId}/tasks`),
                API.get(`/projects/${projectId}/members`),
            ]);
            setProject(projRes.data);
            setTasks(taskRes.data);
            setMembers(memberRes.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatutColor = (statut) => ({
        a_faire:  '#f59e0b',
        en_cours: '#3b82f6',
        termine:  '#10b981',
        en_attente: '#f59e0b',
        suspendu: '#ef4444',
    }[statut] ?? '#6b7280');

    if (loading) return (
        <SafeAreaView style={styles.safe}>
            <ActivityIndicator size="large" color="#1e293b" style={{ marginTop: 40 }} />
        </SafeAreaView>
    );

    if (!project) return (
        <SafeAreaView style={styles.safe}>
            <Text style={{ padding: 24, color: '#94a3b8' }}>Projet introuvable.</Text>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* EN-TÊTE */}
                <View style={styles.header}>
                    <Text style={styles.titre}>{project.titre}</Text>
                    <View style={[styles.badge, { backgroundColor: getStatutColor(project.statut) }]}>
                        <Text style={styles.badgeText}>{project.statut?.replace('_', ' ')}</Text>
                    </View>
                    <Text style={styles.desc}>{project.description}</Text>
                    <Text style={styles.dates}>📅 {project.date_debut} → {project.date_fin}</Text>

                    {project.technologies && project.technologies.length > 0 && (
                        <View style={styles.tagsRow}>
                            {project.technologies.map((tech, i) => (
                                <View key={i} style={styles.tag}>
                                    <Text style={styles.tagText}>{tech}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* TÂCHES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tâches ({tasks.length})</Text>
                    {tasks.length === 0 ? (
                        <Text style={styles.empty}>Aucune tâche.</Text>
                    ) : (
                        tasks.map(task => (
                            <View key={task.id} style={styles.taskRow}>
                                <View style={[styles.taskBadge, { backgroundColor: getStatutColor(task.statut) }]}>
                                    <Text style={styles.taskBadgeText}>{task.statut?.replace('_', ' ')}</Text>
                                </View>
                                <Text style={styles.taskTitre}>{task.titre}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* MEMBRES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Équipe ({members.length})</Text>
                    {members.length === 0 ? (
                        <Text style={styles.empty}>Aucun membre.</Text>
                    ) : (
                        members.map(member => (
                            <View key={member.id} style={styles.memberRow}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {member.nom?.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.memberNom}>{member.nom}</Text>
                                    <Text style={styles.memberRole}>{member.role}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    container: { padding: 16, gap: 16 },
    header: {
        backgroundColor: 'white', borderRadius: 12, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    titre: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 10 },
    badgeText: { color: 'white', fontSize: 11, fontWeight: '500' },
    desc: { fontSize: 14, color: '#64748b', marginBottom: 8 },
    dates: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tag: { backgroundColor: '#e2e8f0', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    tagText: { fontSize: 12, color: '#475569' },
    section: {
        backgroundColor: 'white', borderRadius: 12, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
    empty: { fontSize: 14, color: '#94a3b8' },
    taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    taskBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    taskBadgeText: { color: 'white', fontSize: 10 },
    taskTitre: { fontSize: 14, color: '#1e293b', flex: 1 },
    memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    memberNom: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
    memberRole: { fontSize: 12, color: '#94a3b8' },
});