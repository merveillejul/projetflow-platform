import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    ActivityIndicator, TouchableOpacity, TextInput
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

// Commentaires — accessible aux deux rôles
function CommentSection({ task }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => { loadComments(); }, [task.id]);

    const loadComments = async () => {
        try {
            const res = await API.get(`/tasks/${task.id}/comments`);
            setComments(res.data);
        } catch (err) { console.log(err); }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;
        await API.post(`/tasks/${task.id}/comments`, { content: newComment });
        setNewComment('');
        loadComments();
    };

    return (
        <View style={styles.commentSection}>
            <Text style={styles.commentTaskTitle}>💬 {task.titre}</Text>
            {comments.length === 0 ? (
                <Text style={styles.empty}>Aucun commentaire.</Text>
            ) : (
                comments.map(c => (
                    <View key={c.id} style={styles.commentCard}>
                        <Text style={styles.commentAuthor}>{c.user?.nom ?? 'Utilisateur'}</Text>
                        <Text style={styles.commentContent}>{c.content}</Text>
                        <Text style={styles.commentDate}>
                            {new Date(c.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </Text>
                    </View>
                ))
            )}
            <View style={styles.commentInput}>
                <TextInput
                    style={styles.input}
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                />
                <TouchableOpacity style={styles.sendBtn} onPress={addComment}>
                    <Text style={styles.sendBtnText}>Envoyer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function ProjectDetailScreen({ route }) {

    const { projectId } = route.params;
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const isChef = user?.role === 'chef';
    const isMembre = user?.role === 'membre';

    useEffect(() => { loadAll(); }, []);

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

    const updateStatut = async (taskId, statut) => {
        await API.put(`/tasks/${taskId}`, { statut });
        loadAll();
    };

    const getStatutColor = (statut) => ({
        a_faire:    '#f59e0b',
        en_cours:   '#3b82f6',
        termine:    '#10b981',
        en_attente: '#f59e0b',
        suspendu:   '#ef4444',
    }[statut] ?? '#6b7280');

    const statutLabel = (statut) => ({
        a_faire:  'À faire',
        en_cours: 'En cours',
        termine:  'Terminé',
    }[statut] ?? statut);

    const nextStatut = (statut) => ({
        a_faire:  'en_cours',
        en_cours: 'termine',
        termine:  'a_faire',
    }[statut]);

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

    // Tâches assignées au membre connecté
    const myTasks = isMembre
        ? tasks.filter(t => Number(t.assigne_a) === Number(user?.id))
        : tasks;

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* EN-TÊTE — identique pour tous */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.titre}>{project.titre}</Text>
                        <View style={[styles.badge, { backgroundColor: getStatutColor(project.statut) }]}>
                            <Text style={styles.badgeText}>{project.statut?.replace('_', ' ')}</Text>
                        </View>
                    </View>
                    <Text style={styles.desc}>{project.description}</Text>
                    <Text style={styles.dates}>📅 {project.date_debut} → {project.date_fin}</Text>
                    {project.budget ? <Text style={styles.dates}>💰 {project.budget} €</Text> : null}
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
                    <Text style={styles.sectionTitle}>
                        {isMembre ? `Mes tâches (${myTasks.length})` : `Tâches (${tasks.length})`}
                    </Text>

                    {/* Membre — voit seulement ses tâches */}
                    {isMembre && myTasks.length === 0 && (
                        <Text style={styles.empty}>Aucune tâche assignée dans ce projet.</Text>
                    )}

                    {/* Chef — voit toutes les tâches avec infos assignation */}
                    {isChef && tasks.length === 0 && (
                        <Text style={styles.empty}>Aucune tâche créée.</Text>
                    )}

                    {(isMembre ? myTasks : tasks).map(task => (
                        <View key={task.id} style={styles.taskRow}>
                            <View style={[styles.taskBadge, { backgroundColor: getStatutColor(task.statut) }]}>
                                <Text style={styles.taskBadgeText}>{statutLabel(task.statut)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.taskTitre}>{task.titre}</Text>
                                {/* Chef voit à qui la tâche est assignée */}
                                {isChef && task.assigned_user && (
                                    <Text style={styles.taskAssigne}>👤 {task.assigned_user.nom}</Text>
                                )}
                                {task.date_echeance && (
                                    <Text style={styles.taskDate}>📅 {task.date_echeance}</Text>
                                )}
                            </View>
                            {/* Membre peut changer statut de SES tâches, chef peut tout changer */}
                            {(isChef || (isMembre && Number(task.assigne_a) === Number(user?.id))) && (
                                <TouchableOpacity
                                    style={[styles.statutBtn, { backgroundColor: getStatutColor(nextStatut(task.statut)) }]}
                                    onPress={() => updateStatut(task.id, nextStatut(task.statut))}
                                >
                                    <Text style={styles.statutBtnText}>→ {statutLabel(nextStatut(task.statut))}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                {/* ÉQUIPE — chef voit tout, membre voit juste l'équipe */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Équipe</Text>

                    {project.owner && (
                        <View style={[styles.memberRow, { marginBottom: 8 }]}>
                            <View style={[styles.avatar, { backgroundColor: '#2563eb' }]}>
                                <Text style={styles.avatarText}>{project.owner.nom?.charAt(0).toUpperCase()}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.memberNom}>{project.owner.nom}</Text>
                                <Text style={[styles.memberRole, { color: '#2563eb' }]}>Chef de projet</Text>
                            </View>
                            <View style={styles.ownerBadge}>
                                <Text style={styles.ownerBadgeText}>Propriétaire</Text>
                            </View>
                        </View>
                    )}

                    {members.filter(m => m.id !== project.owner?.id).length === 0 ? (
                        <Text style={styles.empty}>Aucun membre dans l'équipe.</Text>
                    ) : (
                        members.filter(m => m.id !== project.owner?.id).map(member => (
                            <View key={member.id} style={styles.memberRow}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{member.nom?.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.memberNom}>{member.nom}</Text>
                                    <Text style={styles.memberRole}>Membre</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* COMMENTAIRES — accessible aux deux mais affichage différent */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {isMembre ? 'Mes commentaires' : 'Commentaires par tâche'}
                    </Text>
                    {/* Membre voit seulement les commentaires de ses tâches */}
                    {(isMembre ? myTasks : tasks).length === 0 ? (
                        <Text style={styles.empty}>Aucune tâche pour commenter.</Text>
                    ) : (
                        (isMembre ? myTasks : tasks).map(task => (
                            <CommentSection key={task.id} task={task} />
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
    header: { backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 2 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    titre: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', flex: 1, marginRight: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    badgeText: { color: 'white', fontSize: 11, fontWeight: '500' },
    desc: { fontSize: 14, color: '#64748b', marginBottom: 6 },
    dates: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    tag: { backgroundColor: '#e2e8f0', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    tagText: { fontSize: 12, color: '#475569' },
    section: { backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
    empty: { fontSize: 14, color: '#94a3b8' },
    taskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    taskBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    taskBadgeText: { color: 'white', fontSize: 10, fontWeight: '500' },
    taskTitre: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
    taskAssigne: { fontSize: 11, color: '#64748b', marginTop: 2 },
    taskDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
    statutBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statutBtnText: { color: 'white', fontSize: 11, fontWeight: '500' },
    memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    memberNom: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
    memberRole: { fontSize: 12, color: '#94a3b8' },
    ownerBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    ownerBadgeText: { color: '#2563eb', fontSize: 11 },
    commentSection: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    commentTaskTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
    commentCard: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 10, marginBottom: 6 },
    commentAuthor: { fontSize: 13, fontWeight: '500', color: '#1e293b', marginBottom: 2 },
    commentContent: { fontSize: 14, color: '#64748b' },
    commentDate: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
    commentInput: { flexDirection: 'row', gap: 8, marginTop: 8 },
    input: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, fontSize: 14 },
    sendBtn: { backgroundColor: '#1e293b', paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center' },
    sendBtnText: { color: 'white', fontWeight: '500', fontSize: 13 },
});