import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function ProfileScreen() {

    const { user, logout } = useAuth();
    const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [pwLoading, setPwLoading] = useState(false);

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

    const handleChangePassword = async () => {
        if (pwForm.password !== pwForm.password_confirmation) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
            return;
        }
        if (pwForm.password.length < 8) {
            Alert.alert('Erreur', 'Mot de passe : 8 caractères minimum.');
            return;
        }
        setPwLoading(true);
        try {
            await API.post('/auth/change-password', pwForm);
            Alert.alert('Succès', 'Mot de passe mis à jour !');
            setPwForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message ?? 'Erreur lors du changement.');
        } finally {
            setPwLoading(false);
        }
    };

    const getRoleLabel = (role) => ({
        admin:  'Administrateur',
        chef:   'Chef de projet',
        membre: 'Membre',
    }[role] ?? role);

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* AVATAR */}
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.nom?.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.nom}>{user?.nom}</Text>
                <Text style={styles.username}>@{user?.username}</Text>
                <Text style={styles.role}>{getRoleLabel(user?.role)}</Text>

                {/* INFOS */}
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

                {/* CHANGEMENT MOT DE PASSE */}
                <View style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
                    <TextInput
                        style={styles.pwInput}
                        placeholder="Mot de passe actuel"
                        value={pwForm.current_password}
                        onChangeText={v => setPwForm({ ...pwForm, current_password: v })}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.pwInput}
                        placeholder="Nouveau mot de passe"
                        value={pwForm.password}
                        onChangeText={v => setPwForm({ ...pwForm, password: v })}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.pwInput}
                        placeholder="Confirmer le nouveau mot de passe"
                        value={pwForm.password_confirmation}
                        onChangeText={v => setPwForm({ ...pwForm, password_confirmation: v })}
                        secureTextEntry
                    />
                    <TouchableOpacity
                        style={styles.pwBtn}
                        onPress={handleChangePassword}
                        disabled={pwLoading}
                    >
                        {pwLoading
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.pwBtnText}>Changer le mot de passe</Text>
                        }
                    </TouchableOpacity>
                </View>

                {/* DÉCONNEXION */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    container: { alignItems: 'center', padding: 24 },
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
        borderRadius: 12, padding: 16, marginBottom: 16,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    infoLabel: { fontSize: 14, color: '#64748b' },
    infoValue: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
    pwInput: {
        backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
        borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 10, width: '100%'
    },
    pwBtn: {
        backgroundColor: '#1e293b', padding: 14,
        borderRadius: 8, alignItems: 'center', marginTop: 4
    },
    pwBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
    logoutBtn: {
        width: '100%', padding: 16, borderWidth: 1,
        borderColor: '#ef4444', borderRadius: 10, alignItems: 'center', marginBottom: 24
    },
    logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '500' }
});