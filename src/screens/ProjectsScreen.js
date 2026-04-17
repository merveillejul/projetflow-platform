import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectsScreen({ navigation }) {

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        API.get('/projects')
            .then(res => setProjects(res.data))
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    const getStatutColor = (statut) => ({
        en_attente: '#f59e0b',
        en_cours:   '#3b82f6',
        termine:    '#10b981',
        suspendu:   '#ef4444',
    }[statut] ?? '#6b7280');

    if (loading) return (
        <SafeAreaView style={styles.safe}>
            <ActivityIndicator size="large" color="#1e293b" style={{ marginTop: 40 }} />
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <FlatList
                data={projects}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 16, gap: 12 }}
                ListEmptyComponent={<Text style={styles.empty}>Aucun projet.</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('ProjectDetail', {
                            projectId: item.id,
                            titre: item.titre
                        })}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.titre}>{item.titre}</Text>
                            <View style={[styles.badge, { backgroundColor: getStatutColor(item.statut) }]}>
                                <Text style={styles.badgeText}>{item.statut?.replace('_', ' ')}</Text>
                            </View>
                        </View>
                        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                        <Text style={styles.dates}>📅 {item.date_debut} → {item.date_fin}</Text>
                        {item.members && item.members.length > 0 && (
                            <Text style={styles.members}>
                                👥 {item.members.length} membre(s)
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
    card: {
        backgroundColor: 'white', borderRadius: 12, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    titre: { fontSize: 16, fontWeight: '600', color: '#1e293b', flex: 1, marginRight: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    badgeText: { color: 'white', fontSize: 11, fontWeight: '500' },
    desc: { fontSize: 14, color: '#64748b', marginBottom: 8 },
    dates: { fontSize: 12, color: '#94a3b8' },
    members: { fontSize: 12, color: '#94a3b8', marginTop: 4 }
});