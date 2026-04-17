import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
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
                        <Text style={styles.message}>{item.message}</Text>
                        <Text style={styles.date}>
                            {new Date(item.created_at).toLocaleDateString('fr-FR')}
                        </Text>
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
    message: { fontSize: 14, color: '#1e293b', marginBottom: 6 },
    date: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
    readBtn: { alignSelf: 'flex-start', padding: 6, paddingHorizontal: 12, backgroundColor: '#eff6ff', borderRadius: 6 },
    readBtnText: { color: '#3b82f6', fontSize: 12, fontWeight: '500' }
});