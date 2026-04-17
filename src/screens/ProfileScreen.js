import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function ProfileScreen() {

    const { user, logout } = useAuth();

    const handleLogout = async () => {
        Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Déconnexion',
                style: 'destructive',
                onPress: async () => {
                    try { await API.post('/logout'); } catch (e) {}
                    await logout();
                }
            }
        ]);
    };

    const getRoleLabel = (role) => ({
        admin:  'Administrateur',
        chef:   'Chef de projet',
        membre: 'Membre',
    }[role] ?? role);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.nom?.charAt(0).toUpperCase()}
                    </Text>
                </View>

                <Text style={styles.nom}>{user?.nom}</Text>
                <Text style={styles.username}>@{user?.username}</Text>
                <Text style={styles.role}>{getRoleLabel(user?.role)}</Text>

                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Rôle</Text>
                        <Text style={styles.infoValue}>{getRoleLabel(user?.role)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Statut</Text>
                        <Text style={styles.infoValue}>{user?.statut}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    container: { flex: 1, alignItems: 'center', padding: 24 },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#1e293b', justifyContent: 'center',
        alignItems: 'center', marginTop: 24, marginBottom: 16
    },
    avatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
    nom: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
    username: { fontSize: 14, color: '#94a3b8', marginBottom: 8 },
    role: { fontSize: 14, color: '#3b82f6', fontWeight: '500', marginBottom: 32 },
    infoCard: {
        width: '100%', backgroundColor: 'white',
        borderRadius: 12, padding: 16, marginBottom: 24,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    infoLabel: { fontSize: 14, color: '#64748b' },
    infoValue: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
    logoutBtn: {
        width: '100%', padding: 16, borderWidth: 1,
        borderColor: '#ef4444', borderRadius: 10, alignItems: 'center'
    },
    logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '500' }
});