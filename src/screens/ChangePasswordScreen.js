import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePasswordScreen() {

    const { user, login } = useAuth();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!password || !confirm) {
            Alert.alert('Erreur', 'Remplis tous les champs.');
            return;
        }
        if (password.length < 12) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 12 caractères.');
            return;
        }
        if (password !== confirm) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        try {
            // Première connexion — pas besoin de l'ancien mot de passe
            await API.post('/auth/first-login-password', { password });
            
            // Mettre à jour first_login à 0
            const token = await AsyncStorage.getItem('token');
            const updatedUser = { ...user, first_login: 0 };
            await login(updatedUser, token);
            
            Alert.alert('Succès', 'Mot de passe défini !');
        } catch (err) {
            Alert.alert('Erreur', err.response?.data?.message ?? 'Erreur.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.title}>Première connexion</Text>
                <Text style={styles.subtitle}>
                    Définissez votre mot de passe personnel pour continuer.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nouveau mot de passe (12 min.)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirmer le mot de passe"
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="white" />
                        : <Text style={styles.buttonText}>Valider</Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    container: { flex: 1, justifyContent: 'center', padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#64748b', marginBottom: 32, lineHeight: 22 },
    input: {
        backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0',
        borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 16
    },
    button: { backgroundColor: '#1e293b', padding: 16, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' }
});