import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {

    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        API.get('/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(err => console.log(err));
    }, []);

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container}>
                <Text style={styles.welcome}>Bonjour, {user?.nom} 👋</Text>
                <Text style={styles.role}>{user?.role}</Text>

                {stats && (
                    <View style={styles.cardsRow}>
                        <View style={[styles.card, { borderLeftColor: '#3b82f6' }]}>
                            <Text style={styles.cardNum}>{stats.projects ?? 0}</Text>
                            <Text style={styles.cardLabel}>Projets</Text>
                        </View>
                        <View style={[styles.card, { borderLeftColor: '#f59e0b' }]}>
                            <Text style={styles.cardNum}>{stats.todo ?? 0}</Text>
                            <Text style={styles.cardLabel}>À faire</Text>
                        </View>
                        <View style={[styles.card, { borderLeftColor: '#3b82f6' }]}>
                            <Text style={styles.cardNum}>{stats.progress ?? 0}</Text>
                            <Text style={styles.cardLabel}>En cours</Text>
                        </View>
                        <View style={[styles.card, { borderLeftColor: '#10b981' }]}>
                            <Text style={styles.cardNum}>{stats.done ?? 0}</Text>
                            <Text style={styles.cardLabel}>Terminées</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    container: { flex: 1, padding: 20 },
    welcome: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 16 },
    role: { fontSize: 14, color: '#64748b', marginBottom: 24, textTransform: 'capitalize' },
    cardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: {
        backgroundColor: 'white', borderRadius: 12, padding: 16,
        borderLeftWidth: 4, width: '47%',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    cardNum: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
    cardLabel: { fontSize: 13, color: '#64748b', marginTop: 4 }
});