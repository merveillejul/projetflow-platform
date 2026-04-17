import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TasksScreen() {

    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const projectsRes = await API.get('/projects');
            const allTasks = [];
            for (const project of projectsRes.data) {
                const taskRes = await API.get(`/projects/${project.id}/tasks`);
                const myTasks = taskRes.data.filter(t => t.assigne_a === user?.id);
                allTasks.push(...myTasks.map(t => ({ ...t, projectTitre: project.titre })));
            }
            setTasks(allTasks);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatut = async (taskId, statut) => {
        await API.put(`/tasks/${taskId}`, { statut });
        loadTasks();
    };

    const getStatutColor = (statut) => ({
        a_faire:  '#f59e0b',
        en_cours: '#3b82f6',
        termine:  '#10b981',
    }[statut] ?? '#6b7280');

    const nextStatut = (statut) => ({
        a_faire:  'en_cours',
        en_cours: 'termine',
        termine:  'a_faire',
    }[statut]);

    const statutLabel = (statut) => ({
        a_faire:  'À faire',
        en_cours: 'En cours',
        termine:  'Terminé',
    }[statut] ?? statut);

    if (loading) return (
        <SafeAreaView style={styles.safe}>
            <ActivityIndicator size="large" color="#1e293b" style={{ marginTop: 40 }} />
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <FlatList
                data={tasks}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 16, gap: 12 }}
                ListEmptyComponent={<Text style={styles.empty}>Aucune tâche assignée.</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.project}>{item.projectTitre}</Text>
                        <Text style={styles.titre}>{item.titre}</Text>
                        {item.date_echeance && (
                            <Text style={styles.date}>📅 {item.date_echeance}</Text>
                        )}
                        <TouchableOpacity
                            style={[styles.statusBtn, { backgroundColor: getStatutColor(item.statut) }]}
                            onPress={() => updateStatut(item.id, nextStatut(item.statut))}
                        >
                            <Text style={styles.statusText}>
                                {statutLabel(item.statut)} → {statutLabel(nextStatut(item.statut))}
                            </Text>
                        </TouchableOpacity>
                    </View>
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
    project: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
    titre: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
    date: { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
    statusBtn: { padding: 10, borderRadius: 8, alignItems: 'center' },
    statusText: { color: 'white', fontSize: 13, fontWeight: '500' }
});