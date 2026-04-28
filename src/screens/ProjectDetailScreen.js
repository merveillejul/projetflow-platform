import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, TextInput, Animated, Easing,
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Svg, { Path, Rect, Circle, Polyline, Line } from 'react-native-svg';

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
    red:         '#EF4444',
    redBg:       '#FEF2F2',
    redBorder:   '#FECACA',
};

const TASK_STATUT = {
    a_faire:  { label:'À faire',  color:COLORS.amber,  bg:COLORS.amberBg,  border:COLORS.amberBorder,  dot:'#F59E0B', next:'en_cours' },
    en_cours: { label:'En cours', color:COLORS.indigo, bg:COLORS.indigoBg, border:COLORS.indigoBorder, dot:'#6366F1', next:'termine'  },
    termine:  { label:'Terminé',  color:COLORS.green,  bg:COLORS.greenBg,  border:COLORS.greenBorder,  dot:'#10B981', next:'a_faire'  },
};

const PROJET_STATUT = {
    en_attente: { label:'En attente', color:COLORS.amber,  bg:COLORS.amberBg,  border:COLORS.amberBorder  },
    en_cours:   { label:'En cours',   color:COLORS.indigo, bg:COLORS.indigoBg, border:COLORS.indigoBorder },
    termine:    { label:'Terminé',    color:COLORS.green,  bg:COLORS.greenBg,  border:COLORS.greenBorder  },
    suspendu:   { label:'Suspendu',   color:COLORS.red,    bg:COLORS.redBg,    border:COLORS.redBorder    },
};

/* ─── Icônes ────────────────────────────────────────────────────── */
const IconCheck = ({ color=COLORS.indigo, size=12 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Polyline points="20 6 9 17 4 12"/>
    </Svg>
);
const IconUsers = ({ color=COLORS.indigo, size=13 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <Circle cx="9" cy="7" r="4"/>
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <Path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </Svg>
);
const IconChat = ({ color=COLORS.indigo, size=13 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </Svg>
);
const IconTask = ({ color=COLORS.indigo, size=13 }) => (
    <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <Polyline points="9 11 12 14 22 4"/>
        <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </Svg>
);

/* ─── Skeleton ──────────────────────────────────────────────────── */
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

/* ─── Composants ────────────────────────────────────────────────── */
function StatutBadge({ statut, config }) {
    const conf = config[statut]; if (!conf) return null;
    return (
        <View style={[styles.badge, { backgroundColor:conf.bg, borderColor:conf.border }]}>
            <Text style={[styles.badgeText, { color:conf.color }]}>{conf.label}</Text>
        </View>
    );
}

function Avatar({ name, color=COLORS.indigo, size=34 }) {
    return (
        <View style={{
            width:size, height:size, borderRadius:size/2,
            backgroundColor:color, alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
            <Text style={{ color:'white', fontWeight:'700', fontSize:size*0.38 }}>
                {name?.charAt(0).toUpperCase()}
            </Text>
        </View>
    );
}

function SectionCard({ icon, title, count, accentBg=COLORS.indigoBg, children }) {
    return (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
                <View style={[styles.sectionIconBox, { backgroundColor:accentBg }]}>{icon}</View>
                <Text style={styles.sectionTitle}>{title}</Text>
                {count !== undefined && (
                    <View style={styles.sectionCountPill}>
                        <Text style={styles.sectionCountText}>{count}</Text>
                    </View>
                )}
            </View>
            <View style={styles.sectionDivider} />
            <View style={styles.sectionBody}>{children}</View>
        </View>
    );
}

function CommentSection({ task, currentUserId, isChef }) {
    const [comments, setComments]   = useState([]);
    const [newComment, setNewComment] = useState('');
    const [focused, setFocused]     = useState(false);

    useEffect(() => { loadComments(); }, [task.id]);

    const loadComments = async () => {
        try { const res = await API.get(`/tasks/${task.id}/comments`); setComments(res.data); }
        catch (err) { console.log(err); }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;
        await API.post(`/tasks/${task.id}/comments`, { content: newComment });
        setNewComment(''); loadComments();
    };

    const deleteComment = async (id) => {
        await API.delete(`/comments/${id}`); loadComments();
    };

    return (
        <View style={styles.commentBlock}>
            {/* Header tâche */}
            <View style={styles.commentTaskHead}>
                <View style={[styles.commentTaskDot, { backgroundColor: TASK_STATUT[task.statut]?.dot ?? COLORS.border }]} />
                <Text style={styles.commentTaskName} numberOfLines={1}>{task.titre}</Text>
                <StatutBadge statut={task.statut} config={TASK_STATUT} />
            </View>

            {comments.length === 0 ? (
                <Text style={styles.commentEmpty}>Aucun commentaire.</Text>
            ) : comments.map(c => (
                <View key={c.id} style={styles.commentCard}>
                    <View style={styles.commentCardTop}>
                        <Avatar name={c.user?.nom ?? '?'} color={COLORS.indigo} size={26} />
                        <View style={{ flex:1 }}>
                            <Text style={styles.commentAuthor}>{c.user?.nom ?? 'Utilisateur'}</Text>
                            <Text style={styles.commentDate}>
                                {new Date(c.created_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                            </Text>
                        </View>
                        {(isChef || c.user_id === currentUserId) && (
                            <TouchableOpacity
                                onPress={() => deleteComment(c.id)}
                                style={styles.commentDeleteBtn}
                                hitSlop={{ top:8, bottom:8, left:8, right:8 }}
                            >
                                <Text style={{ fontSize:10, color:COLORS.red, fontWeight:'700' }}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.commentContent}>{c.content}</Text>
                </View>
            ))}

            {/* Input */}
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
                />
                <TouchableOpacity
                    style={[styles.sendBtn, { backgroundColor: newComment.trim() ? COLORS.primary : COLORS.borderLight }]}
                    onPress={addComment}
                    disabled={!newComment.trim()}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.sendBtnText, { color: newComment.trim() ? 'white' : COLORS.textLight }]}>›</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ─── Écran ─────────────────────────────────────────────────────── */
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
        await API.put(`/tasks/${taskId}`, { statut }); loadAll();
    };

    const myTasks = isMembre
        ? tasks.filter(t => Number(t.assigne_a) === Number(user?.id))
        : tasks;

    const done  = tasks.filter(t => t.statut === 'termine').length;
    const total = tasks.length;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

    if (loading) return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ gap:12 }}>
                    <View style={{ backgroundColor:COLORS.white, borderRadius:14, padding:16, borderWidth:1, borderColor:COLORS.border, gap:12 }}>
                        <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                            <SkeletonBox width="60%" height={20} />
                            <SkeletonBox width={70} height={24} radius={20} />
                        </View>
                        <SkeletonBox width="90%" height={13} />
                        <SkeletonBox width="55%" height={11} />
                        <SkeletonBox width="100%" height={7} radius={4} />
                    </View>
                    {[0,1].map(i => (
                        <View key={i} style={{ backgroundColor:COLORS.white, borderRadius:14, padding:16, borderWidth:1, borderColor:COLORS.border, gap:10 }}>
                            <SkeletonBox width="40%" height={13} />
                            <SkeletonBox width="75%" height={16} />
                            <SkeletonBox width="100%" height={40} radius={10} />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );

    if (!project) return (
        <SafeAreaView style={styles.safe}>
            <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
                <Text style={{ color:COLORS.textLight, fontSize:14 }}>Projet introuvable.</Text>
            </View>
        </SafeAreaView>
    );

    const projetConf = PROJET_STATUT[project.statut];

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* ── En-tête projet ── */}
                <View style={[styles.projectCard, projetConf && { borderTopColor:projetConf.color, borderTopWidth:3 }]}>
                    <View style={styles.projectTop}>
                        <Text style={styles.projectTitle}>{project.titre}</Text>
                        <StatutBadge statut={project.statut} config={PROJET_STATUT} />
                    </View>

                    {project.description && (
                        <Text style={styles.projectDesc}>{project.description}</Text>
                    )}

                    <View style={styles.projectMeta}>
                        <View style={styles.metaRow}>
                            <View style={styles.metaDot} />
                            <Text style={styles.metaText}>{project.date_debut} → {project.date_fin}</Text>
                        </View>
                        {project.budget && (
                            <View style={styles.metaRow}>
                                <View style={styles.metaDot} />
                                <Text style={styles.metaText}>{project.budget} €</Text>
                            </View>
                        )}
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

                    {/* Barre de progression */}
                    {total > 0 && (
                        <View style={styles.progressBlock}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Progression</Text>
                                <Text style={[styles.progressPct, { color: pct === 100 ? COLORS.green : COLORS.primary }]}>
                                    {pct}%
                                </Text>
                            </View>
                            <View style={styles.progressTrack}>
                                <View style={[
                                    styles.progressFill,
                                    { width:`${pct}%`, backgroundColor: pct === 100 ? COLORS.green : COLORS.primary },
                                ]} />
                            </View>
                            <Text style={styles.progressSub}>{done} / {total} tâches terminées</Text>
                        </View>
                    )}
                </View>

                {/* ── Tâches ── */}
                <SectionCard
                    icon={<IconTask />}
                    title={isMembre ? 'Mes tâches' : 'Tâches'}
                    count={myTasks.length}
                >
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
                                idx < myTasks.length - 1 && { borderBottomWidth:1, borderBottomColor:COLORS.borderLight },
                            ]}>
                                <View style={[styles.taskAccent, { backgroundColor: conf?.dot ?? COLORS.border }]} />
                                <View style={{ flex:1 }}>
                                    <View style={styles.taskTop}>
                                        <Text style={styles.taskTitle} numberOfLines={2}>{task.titre}</Text>
                                        <StatutBadge statut={task.statut} config={TASK_STATUT} />
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
                                                → Passer à : {TASK_STATUT[conf?.next]?.label}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </SectionCard>

                {/* ── Équipe ── */}
                <SectionCard
                    icon={<IconUsers />}
                    title="Équipe"
                    count={members.length + (project.owner ? 1 : 0)}
                >
                    {project.owner && (
                        <View style={[styles.memberRow, { borderBottomWidth:1, borderBottomColor:COLORS.borderLight, paddingBottom:12, marginBottom:4 }]}>
                            <Avatar name={project.owner.nom} color={COLORS.primary} />
                            <View style={{ flex:1 }}>
                                <Text style={styles.memberName}>{project.owner.nom}</Text>
                                <Text style={[styles.memberRole, { color:COLORS.indigo }]}>Chef de projet</Text>
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
                            idx < arr.length - 1 && { borderBottomWidth:1, borderBottomColor:COLORS.borderLight },
                        ]}>
                            <Avatar name={member.nom} color={COLORS.indigo} />
                            <View style={{ flex:1 }}>
                                <Text style={styles.memberName}>{member.nom}</Text>
                                <Text style={styles.memberRole}>Membre</Text>
                            </View>
                        </View>
                    ))}
                </SectionCard>

                {/* ── Commentaires ── */}
                <SectionCard
                    icon={<IconChat />}
                    title={isMembre ? 'Mes commentaires' : 'Commentaires par tâche'}
                >
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
                </SectionCard>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:      { flex:1, backgroundColor:COLORS.bg },
    container: { padding:16, gap:12, paddingBottom:44 },

    /* Projet header */
    projectCard: {
        backgroundColor:COLORS.white, borderRadius:14,
        padding:16, borderWidth:1, borderColor:COLORS.border,
        shadowColor:'#0F172A', shadowOpacity:0.04,
        shadowRadius:8, shadowOffset:{ width:0, height:2 }, elevation:2,
    },
    projectTop:  { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:9 },
    projectTitle:{ fontSize:19, fontWeight:'700', color:COLORS.text, flex:1, letterSpacing:-0.4 },
    projectDesc: { fontSize:13.5, color:COLORS.textMuted, lineHeight:20, marginBottom:11 },
    projectMeta: { gap:5, marginBottom:10 },
    metaRow:     { flexDirection:'row', alignItems:'center', gap:6 },
    metaDot:     { width:5, height:5, borderRadius:3, backgroundColor:COLORS.textLight },
    metaText:    { fontSize:12.5, color:COLORS.textLight },
    techRow:     { flexDirection:'row', flexWrap:'wrap', gap:6, marginBottom:10 },
    techPill: {
        backgroundColor:COLORS.indigoBg, borderWidth:1, borderColor:COLORS.indigoBorder,
        paddingHorizontal:9, paddingVertical:3, borderRadius:6,
    },
    techText: { fontSize:11.5, color:COLORS.indigo, fontWeight:'600' },

    badge:     { paddingHorizontal:9, paddingVertical:3, borderRadius:20, borderWidth:1, flexShrink:0 },
    badgeText: { fontSize:11, fontWeight:'700' },

    /* Progress */
    progressBlock:  { borderTopWidth:1, borderTopColor:COLORS.borderLight, paddingTop:12, marginTop:4 },
    progressHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
    progressLabel:  { fontSize:12.5, fontWeight:'600', color:COLORS.textMuted },
    progressPct:    { fontSize:14, fontWeight:'700', letterSpacing:-0.3 },
    progressTrack:  { height:7, backgroundColor:COLORS.borderLight, borderRadius:10, overflow:'hidden', marginBottom:6 },
    progressFill:   { height:'100%', borderRadius:10, minWidth:4 },
    progressSub:    { fontSize:12, color:COLORS.textLight },

    /* Section card */
    sectionCard: {
        backgroundColor:COLORS.white, borderRadius:14,
        borderWidth:1, borderColor:COLORS.border, overflow:'hidden',
        shadowColor:'#0F172A', shadowOpacity:0.04,
        shadowRadius:8, shadowOffset:{ width:0, height:2 }, elevation:2,
    },
    sectionHead:      { flexDirection:'row', alignItems:'center', gap:9, padding:15, paddingBottom:12 },
    sectionIconBox:   { width:28, height:28, borderRadius:8, alignItems:'center', justifyContent:'center' },
    sectionTitle:     { flex:1, fontSize:14, fontWeight:'700', color:COLORS.text, letterSpacing:-0.1 },
    sectionCountPill: { backgroundColor:COLORS.borderLight, paddingHorizontal:9, paddingVertical:2, borderRadius:10 },
    sectionCountText: { fontSize:12, fontWeight:'700', color:COLORS.textMuted },
    sectionDivider:   { height:1, backgroundColor:COLORS.borderLight },
    sectionBody:      { padding:15 },

    /* Tasks */
    taskRow:    { flexDirection:'row', gap:10, paddingVertical:12 },
    taskAccent: { width:3, borderRadius:4, alignSelf:'stretch', flexShrink:0 },
    taskTop:    { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:5 },
    taskTitle:  { flex:1, fontSize:14, fontWeight:'700', color:COLORS.text, letterSpacing:-0.1 },
    taskAssigne:{ fontSize:12, color:COLORS.textMuted, marginBottom:3 },
    taskDate:   { fontSize:11.5, color:COLORS.textLight, marginBottom:9 },
    nextStatutBtn: {
        alignSelf:'flex-start', borderWidth:1,
        paddingHorizontal:11, paddingVertical:6, borderRadius:8, marginTop:2,
    },
    nextStatutText: { fontSize:12, fontWeight:'700' },

    /* Members */
    memberRow: { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:11 },
    memberName:{ fontSize:14, fontWeight:'600', color:COLORS.text, marginBottom:1 },
    memberRole:{ fontSize:12, color:COLORS.textLight },
    ownerPill: {
        backgroundColor:COLORS.indigoBg, borderWidth:1, borderColor:COLORS.indigoBorder,
        paddingHorizontal:9, paddingVertical:3, borderRadius:6,
    },
    ownerPillText: { fontSize:11, color:COLORS.indigo, fontWeight:'700' },

    /* Comments */
    commentBlock: { marginBottom:18, paddingBottom:18, borderBottomWidth:1, borderBottomColor:COLORS.borderLight },
    commentTaskHead: { flexDirection:'row', alignItems:'center', gap:8, marginBottom:11 },
    commentTaskDot:  { width:7, height:7, borderRadius:4, flexShrink:0 },
    commentTaskName: { flex:1, fontSize:13.5, fontWeight:'700', color:COLORS.text },
    commentEmpty:    { fontSize:12.5, color:COLORS.textLight, marginBottom:10 },
    commentCard: {
        backgroundColor:COLORS.bg, borderRadius:10,
        padding:11, marginBottom:8, borderWidth:1, borderColor:COLORS.borderLight,
    },
    commentCardTop:   { flexDirection:'row', alignItems:'center', gap:8, marginBottom:7 },
    commentAuthor:    { fontSize:12.5, fontWeight:'700', color:COLORS.text },
    commentDate:      { fontSize:11, color:COLORS.textLight },
    commentDeleteBtn: {
        width:24, height:24, borderRadius:7,
        backgroundColor:COLORS.redBg,
        alignItems:'center', justifyContent:'center',
    },
    commentContent: { fontSize:13.5, color:COLORS.textMuted, lineHeight:20 },
    commentInputRow: {
        flexDirection:'row', gap:8, marginTop:10, alignItems:'flex-end',
        borderWidth:1, borderColor:COLORS.border,
        borderRadius:11, paddingHorizontal:12, paddingVertical:7,
        backgroundColor:COLORS.white,
    },
    commentInputFocused: { borderColor:COLORS.indigo },
    commentInput: { flex:1, fontSize:13.5, color:COLORS.text, maxHeight:80, paddingVertical:2 },
    sendBtn: { width:34, height:34, borderRadius:9, alignItems:'center', justifyContent:'center' },
    sendBtnText: { fontSize:22, fontWeight:'700', lineHeight:26 },

    empty: { fontSize:13, color:COLORS.textLight },
});