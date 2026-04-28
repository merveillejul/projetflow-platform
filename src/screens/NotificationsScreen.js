import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Alert, Animated, Easing,
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
    amber:       '#F59E0B',
    amberBg:     '#FFFBEB',
    red:         '#EF4444',
    redBg:       '#FEF2F2',
    redBorder:   '#FECACA',
};

const TYPE_CONFIG = {
    task_assigned:   { label:'Tâche assignée',    color:COLORS.indigo, bg:COLORS.indigoBg },
    task_updated:    { label:'Tâche mise à jour',  color:COLORS.indigo, bg:COLORS.indigoBg },
    comment_added:   { label:'Commentaire',         color:COLORS.amber,  bg:COLORS.amberBg  },
    project_updated: { label:'Projet mis à jour',   color:COLORS.green,  bg:COLORS.greenBg  },
};

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

function NotifSkeleton() {
    return (
        <View style={{ padding:16, gap:10 }}>
            {[0,1,2,3].map(i => (
                <View key={i} style={{ backgroundColor:COLORS.white, borderRadius:14, padding:16, borderWidth:1, borderColor:COLORS.border }}>
                    <View style={{ flexDirection:'row', gap:12, alignItems:'center' }}>
                        <SkeletonBox width={8} height={8} radius={4} />
                        <View style={{ flex:1, gap:8 }}>
                            <SkeletonBox width="80%" height={13} />
                            <SkeletonBox width="50%" height={11} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

function NotifItem({ item, onRead, onDelete }) {
    const conf = TYPE_CONFIG[item.type] ?? { label:'Notification', color:COLORS.textMuted, bg:'#F1F5F9' };
    const date = new Date(item.created_at).toLocaleDateString('fr-FR', {
        day:'2-digit', month:'2-digit', year:'numeric',
        hour:'2-digit', minute:'2-digit',
    });

    return (
        <View style={[
            styles.card,
            !item.is_read && styles.cardUnread,
        ]}>
            {/* Barre gauche si non lu */}
            {!item.is_read && <View style={styles.unreadBar} />}

            <View style={styles.cardRow}>
                {/* Dot */}
                <View style={[
                    styles.unreadDot,
                    { backgroundColor: item.is_read ? COLORS.borderLight : COLORS.indigo },
                    !item.is_read && { shadowColor:COLORS.indigo, shadowOpacity:0.3, shadowRadius:4, elevation:2 },
                ]} />

                {/* Contenu */}
                <View style={{ flex:1 }}>
                    <Text style={[
                        styles.message,
                        !item.is_read && { fontWeight:'600', color:COLORS.text },
                    ]} numberOfLines={3}>
                        {item.message}
                    </Text>
                    <View style={styles.metaRow}>
                        <View style={[styles.typePill, { backgroundColor:conf.bg }]}>
                            <Text style={[styles.typeLabel, { color:conf.color }]}>{conf.label}</Text>
                        </View>
                        <Text style={styles.date}>{date}</Text>
                    </View>
                </View>

                {/* Supprimer */}
                <TouchableOpacity
                    onPress={onDelete}
                    style={styles.deleteBtn}
                    hitSlop={{ top:8, bottom:8, left:8, right:8 }}
                >
                    <View style={styles.deleteIcon}>
                        <Text style={{ fontSize:10, color:COLORS.red, fontWeight:'700' }}>✕</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {!item.is_read && (
                <TouchableOpacity style={styles.readBtn} onPress={onRead} activeOpacity={0.7}>
                    <Text style={styles.readBtnText}>Marquer comme lu</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await API.get('/notifications');
            setNotifications(res.data);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const markAsRead = async (id) => { await API.post(`/notifications/${id}/read`); load(); };
    const markAllRead = async () => { await API.post('/notifications/read-all'); load(); };
    const deleteNotification = (id) => {
        Alert.alert('Supprimer', 'Supprimer cette notification ?', [
            { text:'Annuler', style:'cancel' },
            { text:'Supprimer', style:'destructive', onPress: async () => {
                await API.delete(`/notifications/${id}`); load();
            }},
        ]);
    };

    const unread = notifications.filter(n => !n.is_read).length;

    return (
        <SafeAreaView style={styles.safe}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:3 }}>
                        <Text style={styles.title}>Notifications</Text>
                        {unread > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadBadgeText}>{unread}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.subtitle}>
                        {unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
                    </Text>
                </View>
                {unread > 0 && (
                    <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead} activeOpacity={0.8}>
                        <Text style={styles.markAllText}>Tout lire</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.divider} />

            {loading ? <NotifSkeleton /> : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={(
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Text style={{ fontSize:22, color:COLORS.textLight }}>○</Text>
                            </View>
                            <Text style={styles.emptyTitle}>Aucune notification</Text>
                            <Text style={styles.emptySub}>Vous êtes à jour !</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <NotifItem
                            item={item}
                            onRead={() => markAsRead(item.id)}
                            onDelete={() => deleteNotification(item.id)}
                        />
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex:1, backgroundColor:COLORS.bg },

    header: {
        flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start',
        paddingHorizontal:20, paddingTop:18, paddingBottom:14,
    },
    title:    { fontSize:23, fontWeight:'700', color:COLORS.text, letterSpacing:-0.6 },
    subtitle: { fontSize:13, color:COLORS.textLight },
    unreadBadge: {
        backgroundColor:COLORS.indigo, borderRadius:20,
        paddingHorizontal:9, paddingVertical:2,
    },
    unreadBadgeText: { color:'white', fontSize:11, fontWeight:'700' },
    markAllBtn: {
        backgroundColor:COLORS.white, borderWidth:1, borderColor:COLORS.border,
        borderRadius:10, paddingHorizontal:13, paddingVertical:8, marginTop:4,
    },
    markAllText: { fontSize:12.5, color:COLORS.textMuted, fontWeight:'600' },

    divider: { height:1, backgroundColor:COLORS.borderLight },
    list:    { padding:16, gap:8, paddingBottom:36 },

    card: {
        backgroundColor:COLORS.white, borderRadius:14,
        borderWidth:1, borderColor:COLORS.border,
        overflow:'hidden', padding:14,
        shadowColor:'#0F172A', shadowOpacity:0.03,
        shadowRadius:6, shadowOffset:{ width:0, height:1 }, elevation:1,
    },
    cardUnread: {
        backgroundColor:'#FAFBFF',
        borderColor:COLORS.indigoBorder,
    },
    unreadBar: {
        position:'absolute', left:0, top:0, bottom:0,
        width:3, backgroundColor:COLORS.indigo,
    },
    cardRow:   { flexDirection:'row', alignItems:'flex-start', gap:10 },
    unreadDot: { width:8, height:8, borderRadius:4, marginTop:5, flexShrink:0 },
    message: {
        fontSize:13.5, color:COLORS.textMuted,
        lineHeight:20, flex:1, marginBottom:9,
    },
    metaRow:  { flexDirection:'row', alignItems:'center', gap:8, flexWrap:'wrap' },
    typePill: { paddingHorizontal:8, paddingVertical:3, borderRadius:20 },
    typeLabel:{ fontSize:11, fontWeight:'700' },
    date:     { fontSize:11, color:COLORS.textLight },

    deleteBtn:  { marginLeft:4 },
    deleteIcon: {
        width:26, height:26, borderRadius:8,
        backgroundColor:COLORS.redBg,
        alignItems:'center', justifyContent:'center',
    },
    readBtn: {
        marginTop:10, alignSelf:'flex-start',
        backgroundColor:COLORS.indigoBg, borderWidth:1, borderColor:COLORS.indigoBorder,
        borderRadius:8, paddingHorizontal:12, paddingVertical:7,
    },
    readBtnText: { color:COLORS.indigo, fontSize:12, fontWeight:'700' },

    emptyState: { alignItems:'center', paddingTop:64 },
    emptyIcon: {
        width:56, height:56, borderRadius:16,
        backgroundColor:COLORS.white, borderWidth:1, borderColor:COLORS.border,
        alignItems:'center', justifyContent:'center', marginBottom:14,
    },
    emptyTitle: { fontSize:16, fontWeight:'700', color:COLORS.text, marginBottom:5 },
    emptySub:   { fontSize:13.5, color:COLORS.textLight },
});