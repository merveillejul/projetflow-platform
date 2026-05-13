import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const API = axios.create({
    baseURL: 'https://projetflow-platform-production.up.railway.app/api'
});

API.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    response => response,
    async error => {
        const isLoginRequest = error.config?.url?.includes('/login');
        if (error.response?.status === 401 && !isLoginRequest) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            DeviceEventEmitter.emit('unauthorized');
        }
        return Promise.reject(error);
    }
);

export default API;