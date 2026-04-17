import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import API from '../services/api';

export default function RegisterScreen({ navigation }) {

    const [form, setForm] = useState({
        username: '', nom: '', email: '', password: '', password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!form.username || !form.nom || !form.email || !form.password) {
            Alert.alert('Erreur', 'Remplis tous les champs.');
            return;
        }
        if (form.password !== form.password_confirmation) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
            return;
        }
        if (form.password.length < 12) {
            Alert.alert('Erreur', 'Mot de passe : 12 caractères minimum.');
            return;
        }
        setLoading(true);
        try {
            await API.post('/register', {
                username: form.username,
                nom:      form.nom,
                email:    form.email,
                password: form.password,
            });
            setSuccess(true);
        } catch (err) {
            const data = err.response?.data;
            const msg = data?.errors
                ? Object.values(data.errors)[0][0]
                : data?.message ?? "Erreur lors de l'inscription.";
            Alert.alert('Erreur', msg);
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>Demande envoyée !</Text>
                <Text style={styles.successText}>
                    Votre compte est en attente de validation par un administrateur.
                    Vous pourrez vous connecter une fois votre compte validé.
                </Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.buttonText}>Retour à la connexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>ProjectFlow</Text>
                <Text style={styles.subtitle}>Créer un compte</Text>

                <TextInput style={styles.input} placeholder="Nom complet" value={form.nom} onChangeText={v => setForm({ ...form, nom: v })} />
                <TextInput style={styles.input} placeholder="Nom d'utilisateur" value={form.username} onChangeText={v => setForm({ ...form, username: v })} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={v => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Mot de passe (8 caractères min.)" value={form.password} onChangeText={v => setForm({ ...form, password: v })} secureTextEntry />
                <TextInput style={styles.input} placeholder="Confirmer le mot de passe" value={form.password_confirmation} onChangeText={v => setForm({ ...form, password_confirmation: v })} secureTextEntry />

                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        ⚠️ Votre compte sera en attente de validation par un administrateur.
                    </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>Déjà un compte ? Se connecter</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    container: { padding: 24 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginTop: 20, marginBottom: 4 },
    subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 24 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
    warningBox: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 8, padding: 12, marginBottom: 16 },
    warningText: { fontSize: 13, color: '#92400e' },
    button: { backgroundColor: '#1e293b', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    loginLink: { textAlign: 'center', color: '#3b82f6', fontSize: 14 },
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    successIcon: { fontSize: 48, marginBottom: 16 },
    successTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
    successText: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
});