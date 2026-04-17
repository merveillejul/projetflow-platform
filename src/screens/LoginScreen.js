import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {

    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Erreur', 'Remplis tous les champs.');
            return;
        }
        setLoading(true);
        try {
            const res = await API.post('/login', { username, password });
            await login(res.data.user, res.data.token);
        } catch (err) {
            Alert.alert('Erreur', 'Nom d\'utilisateur ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ProjectFlow</Text>
            <Text style={styles.subtitle}>Connexion</Text>

            <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading
                    ? <ActivityIndicator color="white" />
                    : <Text style={styles.buttonText}>Se connecter</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={{ marginTop: 12 }}
            >
                <Text style={{ textAlign: 'center', color: '#7c3aed', fontSize: 14 }}>
                    Mot de passe oublié ?
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={{ marginTop: 20 }}
            >
                <Text style={styles.registerLink}>
                    Pas encore de compte ? S'inscrire
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#f8fafc'
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#7c3aed',
        textAlign: 'center',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 18,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 32
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        marginBottom: 16
    },
    button: {
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    registerLink: {
        textAlign: 'center',
        color: '#3b82f6',
        fontSize: 14
    }
});