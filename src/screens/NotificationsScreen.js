import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, Alert, Animated, Easing,
} from 'react-native';
import API from '../services/api';

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
    green:       '#10b981',
    greenBg:     '#f0fdf4',
    greenBorder: '#bbf7d0',
    amber:       '#f59e0b',
    amberBg:     '#fffbeb',
    amberBorder: '#fde68a',
    purple:      '#6366f1',
    purpleBg:    '#eef2ff',
    red:         '#ef4444',
    redBg:       '#fef2f2',
    redBorder:   '#fecaca',
};

const TYPE_CONFIG = {
    task_assigned:   { label: 'Tâche assignée',    color: COLORS.purple, bg: COLORS.purpleBg,  icon: '◫' },
    task_updated:    { label: 'Tâche mise à jour',  color: COLORS.blue,   bg: COLORS.blueBg,   icon: '↺' },
    comment_added:   { label: 'Commentaire',         color: COLORS.amber,  bg: COLORS.amberBg,  icon: '◉' },
    project_updated: { label: 'Projet mis à jour',   color: COLORS.green,  bg: COLORS.greenBg,  icon: '◫' },
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

function NotifSkeleton() {
    return (
        <View style={{ padding: 16, gap: 10 }}>
            {[0,1,2,3].map(i => (
                <View key={i} style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                        <SkeletonBox width={36} height={36} radius={9} />
                        <View style={{ flex: 1, gap: 8 }}>
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
    const conf = TYPE_CONFIG[item.type] ?? { label: 'Notification', color: COLORS.textMuted, bg: '#f1f5f9', icon: '○' };
    const date = new Date(item.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <View style={[
            styles.card,
            !item.is_read && { borderLeftWidth: 3, borderLeftColor: COLORS.blue, backgroundColor: '#fafbff' },
        ]}>
            <View style={styles.cardRow}>
                {/* Indicateur non lu */}
                <View style={[
                    styles.unreadDot,
                    { backgroundColor: item.is_read ? COLORS.borderLight : COLORS.blue }
                ]} />

                {/* Contenu */}
                <View style={{ flex: 1 }}>
                    <Text style={[
                        styles.message,
                        !item.is_read && { fontWeight: '600', color: COLORS.text },
                    ]} numberOfLines={3}>
                        {item.message}
                    </Text>
                    <View style={styles.metaRow}>
                        <View style={[styles.typePill, { backgroundColor: conf.bg }]}>
                            <Text style={[styles.typeLabel, { color: conf.color }]}>{conf.label}</Text>
                        </View>
                        <Text style={styles.date}>{date}</Text>
                    </View>
                </View>

                {/* Supprimer */}
                <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <View style={styles.deleteIcon}>
                        <Text style={{ fontSize: 11, color: COLORS.red, fontWeight: '700' }}>✕</Text>
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

    useEffect(() => { loadNotifications(); }, []);

    const loadNotifications = async () => {
        try {
            const res = await API.get('/notifications');
            setNotifications(res.data);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const markAsRead = async (id) => {
        await API.post(`/notifications/${id}/read`);
        loadNotifications();
    };

    const markAllRead = async () => {
        await API.post('/notifications/read-all');
        loadNotifications();
    };

    const deleteNotification = (id) => {
        Alert.alert('Supprimer', 'Supprimer cette notification ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: async () => {
                await API.delete(`/notifications/${id}`);
                loadNotifications();
            }},
        ]);
    };

    const unread = notifications.filter(n => !n.is_read).length;

    return (
        <SafeAreaView style={styles.safe}>

            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Notifications</Text>
                    <Text style={styles.subtitle}>
                        {unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    {unread > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{unread}</Text>
                        </View>
                    )}
                    {unread > 0 && (
                        <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead} activeOpacity={0.8}>
                            <Text style={styles.markAllText}>Tout lire</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.divider} />

            {loading ? (
                <NotifSkeleton />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={(
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Text style={{ fontSize: 20, color: COLORS.textLight }}>○</Text>
                            </View>
                            <Text style={styles.emptyText}>Aucune notification</Text>
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
    safe: { flex: 1, backgroundColor: COLORS.bg },

    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', paddingHorizontal: 20,
        paddingTop: 16, paddingBottom: 14,
    },
    title: {
        fontSize: 22, fontWeight: '700', color: COLORS.text,
        letterSpacing: -0.5, marginBottom: 2,
    },
    subtitle: { fontSize: 13, color: COLORS.textLight },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    unreadBadge: {
        backgroundColor: COLORS.red, borderRadius: 20,
        paddingHorizontal: 8, paddingVertical: 2,
    },
    unreadBadgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
    markAllBtn: {
        backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
        borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
    },
    markAllText: { fontSize: 12.5, color: COLORS.textMuted, fontWeight: '500' },
    divider: { height: 1, backgroundColor: COLORS.borderLight, marginHorizontal: 0 },

    list: { padding: 16, gap: 8, paddingBottom: 32 },

    card: {
        backgroundColor: COLORS.white, borderRadius: 12,
        padding: 14, borderWidth: 1, borderColor: COLORS.border,
    },
    cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    unreadDot: { width: 7, height: 7, borderRadius: 4, marginTop: 5, flexShrink: 0 },
    message: {
        fontSize: 13.5, color: COLORS.textMuted,
        lineHeight: 20, flex: 1, marginBottom: 8,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    typePill: {
        paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 20,
    },
    typeLabel: { fontSize: 11, fontWeight: '600' },
    date: { fontSize: 11, color: COLORS.textLight },
    deleteBtn: { marginLeft: 4 },
    deleteIcon: {
        width: 24, height: 24, borderRadius: 6,
        backgroundColor: COLORS.redBg,
        alignItems: 'center', justifyContent: 'center',
    },
    readBtn: {
        marginTop: 10, alignSelf: 'flex-start',
        backgroundColor: COLORS.blueBg, borderWidth: 1, borderColor: COLORS.blueBorder,
        borderRadius: 7, paddingHorizontal: 12, paddingVertical: 6,
    },
    readBtnText: { color: COLORS.blue, fontSize: 12, fontWeight: '600' },

    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: {
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    emptyText: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
    emptySub: { fontSize: 13, color: COLORS.textLight },
});