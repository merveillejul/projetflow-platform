import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import API from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser]       = useState(null);
    const [token, setToken]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    // Écoute la déconnexion automatique si token expiré (erreur 401)
    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('unauthorized', () => {
            setUser(null);
            setToken(null);
        });
        return () => sub.remove();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser  = await AsyncStorage.getItem('user');

            if (!storedToken || !storedUser) {
                // Rien en storage → pas connecté
                return;
            }

            // ✅ Vérification du token côté API avant de reconnecter
            const res = await API.get('/user', {
                headers: { Authorization: `Bearer ${storedToken}` },
            });

            // ✅ Token valide → on reconnecte avec les données fraîches
            setToken(storedToken);
            setUser(res.data);

            // ✅ On met à jour le storage avec les données fraîches
            await AsyncStorage.setItem('user', JSON.stringify(res.data));

        } catch (err) {
            // ✅ Token invalide ou expiré → on nettoie tout
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, authToken) => {
        await AsyncStorage.setItem('token', authToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
    };

    const logout = async () => {
        try {
            // ✅ Supprime le token côté serveur aussi
            await API.post('/logout');
        } catch (err) {
            // Même si l'API échoue, on déconnecte localement
        } finally {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);