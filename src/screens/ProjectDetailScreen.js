import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, TextInput, Animated, Easing,
} from 'react-native';
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
    blueDark:    '#1d4ed8',
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
    purpleBorder:'#c7d2fe',
};

const TASK_STATUT = {
    a_faire:  { label: 'À faire',  color: COLORS.amber, bg: COLORS.amberBg, border: COLORS.amberBorder, next: 'en_cours' },
    en_cours: { label: 'En cours', color: COLORS.blue,  bg: COLORS.blueBg,  border: COLORS.blueBorder,  next: 'termine'  },
    termine:  { label: 'Terminé',  color: COLORS.green, bg: COLORS.greenBg, border: COLORS.greenBorder, next: 'a_faire'  },
};

const PROJET_STATUT = {
    en_attente: { label: 'En attente', color: COLORS.amber, bg: COLORS.amberBg, border: COLORS.amberBorder },
    en_cours:   { label: 'En cours',   color: COLORS.blue,  bg: COLORS.blueBg,  border: COLORS.blueBorder  },
    termine:    { label: 'Terminé',    color: COLORS.green, bg: COLORS.greenBg, border: COLORS.greenBorder },
    suspendu:   { label: 'Suspendu',   color: COLORS.red,   bg: COLORS.redBg,   border: COLORS.redBorder   },
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

function SectionHeader({ icon, title, count }) {
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBox}>
                <Text style={{ fontSize: 11, color: COLORS.blue }}>{icon}</Text>
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
            {count !== undefined && (
                <Text style={styles.sectionCount}>{count}</Text>
            )}
        </View>
    );
}

function StatutBadge({ statut, config }) {
    const conf = config[statut];
    if (!conf) return null;
    return (
        <View style={[styles.badge, { backgroundColor: conf.bg, borderColor: conf.border }]}>
            <Text style={[styles.badgeText, { color: conf.color }]}>{conf.label}</Text>
        </View>
    );
}

function Avatar({ name, color = COLORS.purple, size = 34 }) {
    return (
        <View style={{
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: color,
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
            <Text style={{ color: 'white', fontWeight: '700', fontSize: size * 0.38 }}>
                {name?.charAt(0).toUpperCase()}
            </Text>
        </View>
    );
}

function CommentSection({ task, currentUserId, isChef }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [focused, setFocused] = useState(false);

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

    const deleteComment = async (id) => {
        await API.delete(`/comments/${id}`);
        loadComments();
    };

    return (
        <View style={styles.commentBlock}>
            <View style={styles.commentTaskHeader}>
                <Text style={styles.commentTaskName} numberOfLines={1}>{task.titre}</Text>
                <StatutBadge statut={task.statut} config={TASK_STATUT} />
            </View>

            {comments.length === 0 ? (
                <Text style={styles.commentEmpty}>Aucun commentaire pour cette tâche.</Text>
            ) : (
                comments.map(c => (
                    <View key={c.id} style={styles.commentCard}>
                        <View style={styles.commentCardTop}>
                            <Avatar name={c.user?.nom ?? '?'} color={COLORS.purple} size={26} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.commentAuthor}>{c.user?.nom ?? 'Utilisateur'}</Text>
                                <Text style={styles.commentDate}>
                                    {new Date(c.created_at).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    })}
                                </Text>
                            </View>
                            {(isChef || c.user_id === currentUserId) && (
                                <TouchableOpacity
                                    onPress={() => deleteComment(c.id)}
                                    style={styles.commentDelete}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Text style={{ fontSize: 11, color: COLORS.red, fontWeight: '700' }}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.commentContent}>{c.content}</Text>
                    </View>
                ))
            )}

            <View style={[styles.commentInputRow, focused && styles.commentInputFocused]}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Ajouter un commentaire..."
                    placeholderTextColor={COLORS.textLight}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onSubmitEditing={addComment}
                />
                <TouchableOpacity
                    style={[styles.sendBtn, newComment.trim() ? { backgroundColor: COLORS.blueDark } : { backgroundColor: COLORS.borderLight }]}
                    onPress={addComment}
                    disabled={!newComment.trim()}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.sendBtnText, !newComment.trim() && { color: COLORS.textLight }]}>
                        ›
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function ProjectDetailScreen({ route }) {
    const { projectId } = route.params;
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks]     = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const isChef   = user?.role === 'chef';
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
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const updateStatut = async (taskId, statut) => {
        await API.put(`/tasks/${taskId}`, { statut });
        loadAll();
    };

    const myTasks = isMembre
        ? tasks.filter(t => Number(t.assigne_a) === Number(user?.id))
        : tasks;

    // Progression
    const done  = tasks.filter(t => t.statut === 'termine').length;
    const total = tasks.length;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

    if (loading) return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 12 }}>
                    <View style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <SkeletonBox width="60%" height={20} />
                            <SkeletonBox width={70} height={24} radius={20} />
                        </View>
                        <SkeletonBox width="90%" height={13} />
                        <SkeletonBox width="55%" height={11} />
                    </View>
                    {[0,1].map(i => (
                        <View key={i} style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 }}>
                            <SkeletonBox width="40%" height={13} />
                            <SkeletonBox width="75%" height={15} />
                            <SkeletonBox width="100%" height={36} radius={9} />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );

    if (!project) return (
        <SafeAreaView style={styles.safe}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: COLORS.textLight, fontSize: 14 }}>Projet introuvable.</Text>
            </View>
        </SafeAreaView>
    );

    const projetConf = PROJET_STATUT[project.statut];

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* ── EN-TÊTE PROJET ── */}
                <View style={[styles.card, projetConf && { borderTopColor: projetConf.color, borderTopWidth: 3 }]}>
                    <View style={styles.projectTop}>
                        <Text style={styles.projectTitle}>{project.titre}</Text>
                        <StatutBadge statut={project.statut} config={PROJET_STATUT} />
                    </View>

                    {project.description ? (
                        <Text style={styles.projectDesc}>{project.description}</Text>
                    ) : null}

                    <View style={styles.projectMeta}>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaIcon}>○</Text>
                            <Text style={styles.metaText}>{project.date_debut} → {project.date_fin}</Text>
                        </View>
                        {project.budget ? (
                            <View style={styles.metaItem}>
                                <Text style={styles.metaIcon}>◈</Text>
                                <Text style={styles.metaText}>{project.budget} €</Text>
                            </View>
                        ) : null}
                    </View>

                    {project.technologies?.length > 0 && (
                        <View style={styles.techRow}>
                            {project.technologies.map((tech, i) => (
                                <View key={i} style={styles.techPill}>
                                    <Text style={styles.techText}>{tech}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Progress bar */}
                    {total > 0 && (
                        <View style={styles.progressBlock}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Progression</Text>
                                <Text style={[styles.progressPct, { color: pct === 100 ? COLORS.green : COLORS.blue }]}>
                                    {pct}%
                                </Text>
                            </View>
                            <View style={styles.progressTrack}>
                                <View style={[
                                    styles.progressFill,
                                    { width: `${pct}%`, backgroundColor: pct === 100 ? COLORS.green : COLORS.blue },
                                ]} />
                            </View>
                            <Text style={styles.progressSub}>{done} / {total} tâches terminées</Text>
                        </View>
                    )}
                </View>

                {/* ── TÂCHES ── */}
                <View style={styles.card}>
                    <SectionHeader
                        icon="✓"
                        title={isMembre ? 'Mes tâches' : 'Tâches'}
                        count={myTasks.length}
                    />
                    <View style={styles.divider} />

                    {myTasks.length === 0 ? (
                        <Text style={styles.empty}>
                            {isMembre ? 'Aucune tâche assignée.' : 'Aucune tâche créée.'}
                        </Text>
                    ) : myTasks.map((task, idx) => {
                        const conf    = TASK_STATUT[task.statut];
                        const canEdit = isChef || (isMembre && Number(task.assigne_a) === Number(user?.id));
                        return (
                            <View key={task.id} style={[
                                styles.taskRow,
                                idx < myTasks.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
                            ]}>
                                <View style={[styles.taskAccent, { backgroundColor: conf?.color ?? COLORS.border }]} />
                                <View style={{ flex: 1 }}>
                                    <View style={styles.taskTop}>
                                        <Text style={styles.taskTitle} numberOfLines={2}>{task.titre}</Text>
                                        {conf && (
                                            <View style={[styles.taskStatut, { backgroundColor: conf.bg, borderColor: conf.border }]}>
                                                <Text style={[styles.taskStatutText, { color: conf.color }]}>{conf.label}</Text>
                                            </View>
                                        )}
                                    </View>
                                    {isChef && task.assigned_user && (
                                        <Text style={styles.taskAssigne}>↳ {task.assigned_user.nom}</Text>
                                    )}
                                    {task.date_echeance && (
                                        <Text style={styles.taskDate}>○ {task.date_echeance}</Text>
                                    )}
                                    {canEdit && (
                                        <TouchableOpacity
                                            style={[styles.nextStatutBtn, { borderColor: TASK_STATUT[conf?.next]?.border ?? COLORS.border }]}
                                            onPress={() => updateStatut(task.id, conf?.next)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.nextStatutText, { color: TASK_STATUT[conf?.next]?.color ?? COLORS.textMuted }]}>
                                                → {TASK_STATUT[conf?.next]?.label}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* ── ÉQUIPE ── */}
                <View style={styles.card}>
                    <SectionHeader
                        icon="◎"
                        title="Équipe"
                        count={members.length + (project.owner ? 1 : 0)}
                    />
                    <View style={styles.divider} />

                    {project.owner && (
                        <View style={[styles.memberRow, { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, paddingBottom: 12, marginBottom: 4 }]}>
                            <Avatar name={project.owner.nom} color={COLORS.blue} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.memberName}>{project.owner.nom}</Text>
                                <Text style={[styles.memberRole, { color: COLORS.blue }]}>Chef de projet</Text>
                            </View>
                            <View style={styles.ownerPill}>
                                <Text style={styles.ownerPillText}>Propriétaire</Text>
                            </View>
                        </View>
                    )}

                    {members.filter(m => m.id !== project.owner?.id).length === 0 ? (
                        <Text style={styles.empty}>Aucun membre dans l'équipe.</Text>
                    ) : members.filter(m => m.id !== project.owner?.id).map((member, idx, arr) => (
                        <View key={member.id} style={[
                            styles.memberRow,
                            idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
                        ]}>
                            <Avatar name={member.nom} color={COLORS.purple} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.memberName}>{member.nom}</Text>
                                <Text style={styles.memberRole}>Membre</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── COMMENTAIRES ── */}
                <View style={styles.card}>
                    <SectionHeader
                        icon="◉"
                        title={isMembre ? 'Mes commentaires' : 'Commentaires par tâche'}
                    />
                    <View style={styles.divider} />

                    {myTasks.length === 0 ? (
                        <Text style={styles.empty}>Aucune tâche pour commenter.</Text>
                    ) : myTasks.map(task => (
                        <CommentSection
                            key={task.id}
                            task={task}
                            currentUserId={user?.id}
                            isChef={isChef}
                        />
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    container: { padding: 16, gap: 12, paddingBottom: 40 },

    card: {
        backgroundColor: COLORS.white, borderRadius: 12,
        padding: 16, borderWidth: 1, borderColor: COLORS.border,
    },
    divider: { height: 1, backgroundColor: COLORS.borderLight, marginBottom: 14 },

    // Section header
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    sectionIconBox: {
        width: 24, height: 24, borderRadius: 6,
        backgroundColor: COLORS.blueBg,
        alignItems: 'center', justifyContent: 'center',
    },
    sectionTitle: { flex: 1, fontSize: 13.5, fontWeight: '700', color: COLORS.text },
    sectionCount: {
        fontSize: 12, color: COLORS.textMuted, fontWeight: '500',
        backgroundColor: COLORS.borderLight,
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
    },

    // Badge
    badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, borderWidth: 1, flexShrink: 0 },
    badgeText: { fontSize: 11, fontWeight: '600' },

    // Projet header
    projectTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 8, marginBottom: 8,
    },
    projectTitle: {
        fontSize: 18, fontWeight: '700', color: COLORS.text,
        flex: 1, letterSpacing: -0.3,
    },
    projectDesc: { fontSize: 13.5, color: COLORS.textMuted, lineHeight: 20, marginBottom: 10 },
    projectMeta: { gap: 5, marginBottom: 10 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    metaIcon: { fontSize: 11, color: COLORS.textLight },
    metaText: { fontSize: 12.5, color: COLORS.textLight },
    techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
    techPill: {
        backgroundColor: COLORS.blueBg, borderWidth: 1, borderColor: COLORS.blueBorder,
        paddingHorizontal: 9, paddingVertical: 3, borderRadius: 5,
    },
    techText: { fontSize: 12, color: COLORS.blue, fontWeight: '500' },

    // Progress
    progressBlock: {
        borderTopWidth: 1, borderTopColor: COLORS.borderLight,
        paddingTop: 12, marginTop: 4,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    progressLabel: { fontSize: 12.5, fontWeight: '600', color: COLORS.textMuted },
    progressPct: { fontSize: 13, fontWeight: '700' },
    progressTrack: {
        height: 7, backgroundColor: COLORS.borderLight,
        borderRadius: 10, overflow: 'hidden', marginBottom: 6,
    },
    progressFill: { height: '100%', borderRadius: 10, minWidth: 4 },
    progressSub: { fontSize: 11.5, color: COLORS.textLight },

    // Tâches
    taskRow: { flexDirection: 'row', gap: 10, paddingVertical: 12 },
    taskAccent: { width: 3, borderRadius: 4, alignSelf: 'stretch', flexShrink: 0 },
    taskTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 8, marginBottom: 4,
    },
    taskTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text, letterSpacing: -0.1 },
    taskStatut: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, borderWidth: 1, flexShrink: 0 },
    taskStatutText: { fontSize: 10.5, fontWeight: '600' },
    taskAssigne: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
    taskDate: { fontSize: 11.5, color: COLORS.textLight, marginBottom: 8 },
    nextStatutBtn: {
        alignSelf: 'flex-start', borderWidth: 1,
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 7, marginTop: 2,
    },
    nextStatutText: { fontSize: 12, fontWeight: '600' },

    // Membres
    memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    memberName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 1 },
    memberRole: { fontSize: 12, color: COLORS.textLight },
    ownerPill: {
        backgroundColor: COLORS.blueBg, borderWidth: 1, borderColor: COLORS.blueBorder,
        paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6,
    },
    ownerPillText: { fontSize: 11, color: COLORS.blue, fontWeight: '600' },

    // Commentaires
    commentBlock: {
        marginBottom: 16, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    },
    commentTaskHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginBottom: 10, justifyContent: 'space-between',
    },
    commentTaskName: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text },
    commentEmpty: { fontSize: 12.5, color: COLORS.textLight, marginBottom: 10 },
    commentCard: {
        backgroundColor: COLORS.bg, borderRadius: 9,
        padding: 10, marginBottom: 8,
        borderWidth: 1, borderColor: COLORS.borderLight,
    },
    commentCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    commentAuthor: { fontSize: 12.5, fontWeight: '700', color: COLORS.text },
    commentDate: { fontSize: 11, color: COLORS.textLight },
    commentDelete: {
        width: 22, height: 22, borderRadius: 6,
        backgroundColor: COLORS.redBg,
        alignItems: 'center', justifyContent: 'center',
    },
    commentContent: { fontSize: 13.5, color: COLORS.textMuted, lineHeight: 19 },
    commentInputRow: {
        flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'flex-end',
        borderWidth: 1, borderColor: COLORS.border,
        borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
        backgroundColor: COLORS.white,
    },
    commentInputFocused: { borderColor: COLORS.blue },
    commentInput: {
        flex: 1, fontSize: 13.5, color: COLORS.text,
        maxHeight: 80, paddingVertical: 2,
    },
    sendBtn: {
        width: 32, height: 32, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
    },
    sendBtnText: { fontSize: 20, color: 'white', fontWeight: '700', lineHeight: 24 },

    empty: { fontSize: 13, color: COLORS.textLight },
});