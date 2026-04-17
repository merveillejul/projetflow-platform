import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import API from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            Alert.alert('Erreur', 'Entrez votre adresse email.');
            return;
        }
        setLoading(true);
        try {
            await API.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.icon}>📧</Text>
                <Text style={styles.title}>Email envoyé !</Text>
                <Text style={styles.subtitle}>
                    Si cet email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques instants.
                </Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.buttonText}>Retour à la connexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.brand}>ProjectFlow</Text>
                <Text style={styles.title}>Mot de passe oublié</Text>
                <Text style={styles.subtitle}>
                    Entrez votre email pour recevoir un lien de réinitialisation.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="votre@email.fr"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="white" />
                        : <Text style={styles.buttonText}>Envoyer le lien</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16 }}>
                    <Text style={styles.link}>← Retour à la connexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    container: { flex: 1, justifyContent: 'center', padding: 24 },
    icon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
    brand: { fontSize: 32, fontWeight: 'bold', color: '#7c3aed', textAlign: 'center', marginBottom: 8 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
    input: {
        backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0',
        borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 16
    },
    button: { backgroundColor: '#7c3aed', padding: 16, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    link: { textAlign: 'center', color: '#64748b', fontSize: 14 }
});