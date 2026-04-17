import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import API from '../services/api';

export default function NotificationsScreen() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await API.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        await API.post(`/notifications/${id}/read`);
        loadNotifications();
    };

    const markAllRead = async () => {
        await API.post('/notifications/read-all');
        loadNotifications();
    };

    const deleteNotification = async (id) => {
        Alert.alert('Supprimer', 'Supprimer cette notification ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer',
                style: 'destructive',
                onPress: async () => {
                    await API.delete(`/notifications/${id}`);
                    loadNotifications();
                }
            }
        ]);
    };

    const getTypeIcon = (type) => ({
        task_assigned:   '📋',
        task_updated:    '🔄',
        comment_added:   '💬',
        project_updated: '📁',
    }[type] ?? '🔔');

    if (loading) return (
        <SafeAreaView style={styles.safe}>
            <ActivityIndicator size="large" color="#1e293b" style={{ marginTop: 40 }} />
        </SafeAreaView>
    );

    const unread = notifications.filter(n => !n.is_read).length;

    return (
        <SafeAreaView style={styles.safe}>
            {unread > 0 && (
                <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
                    <Text style={styles.markAllText}>Tout marquer lu ({unread})</Text>
                </TouchableOpacity>
            )}
            <FlatList
                data={notifications}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 16, gap: 10 }}
                ListEmptyComponent={<Text style={styles.empty}>Aucune notification.</Text>}
                renderItem={({ item }) => (
                    <View style={[styles.card, !item.is_read && styles.unread]}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.icon}>{getTypeIcon(item.type)}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.message, !item.is_read && { fontWeight: '600', color: '#1e293b' }]}>
                                    {item.message}
                                </Text>
                                <Text style={styles.date}>
                                    {new Date(item.created_at).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => deleteNotification(item.id)} style={styles.deleteBtn}>
                                <Text style={styles.deleteBtnText}>🗑</Text>
                            </TouchableOpacity>
                        </View>
                        {!item.is_read && (
                            <TouchableOpacity style={styles.readBtn} onPress={() => markAsRead(item.id)}>
                                <Text style={styles.readBtnText}>Marquer lu</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
    markAllBtn: { margin: 16, padding: 12, backgroundColor: '#1e293b', borderRadius: 8, alignItems: 'center' },
    markAllText: { color: 'white', fontWeight: '500' },
    card: {
        backgroundColor: 'white', borderRadius: 12, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    unread: { borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    icon: { fontSize: 20, marginTop: 2 },
    message: { fontSize: 14, color: '#64748b', marginBottom: 4, flex: 1 },
    date: { fontSize: 11, color: '#94a3b8' },
    deleteBtn: { padding: 4 },
    deleteBtnText: { fontSize: 16 },
    readBtn: { marginTop: 10, alignSelf: 'flex-start', padding: 6, paddingHorizontal: 12, backgroundColor: '#eff6ff', borderRadius: 6 },
    readBtnText: { color: '#3b82f6', fontSize: 12, fontWeight: '500' }
});