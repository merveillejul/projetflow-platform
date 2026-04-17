import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuth } from '../context/AuthContext';
import API from '../services/api';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import TasksScreen from '../screens/TasksScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ProjectsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="ProjectsList" component={ProjectsScreen} options={{ title: 'Projets' }} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={({ route }) => ({ title: route.params.titre })} />
        </Stack.Navigator>
    );
}

function MainTabs() {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnread = async () => {
        try {
            const res = await API.get('/notifications');
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (err) {}
    };

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#1e293b',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: { paddingBottom: 5, height: 60 },
                headerShown: false
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Accueil', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text> }}
            />
            <Tab.Screen
                name="Projects"
                component={ProjectsStack}
                options={{ title: 'Projets', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📁</Text> }}
            />
            <Tab.Screen
                name="Tasks"
                component={TasksScreen}
                options={{ title: 'Mes tâches', tabBarIcon: () => <Text style={{ fontSize: 20 }}>✅</Text> }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    title: 'Notifications',
                    tabBarIcon: () => (
                        <View style={{ position: 'relative' }}>
                            <Text style={{ fontSize: 20 }}>🔔</Text>
                            {unreadCount > 0 && (
                                <View style={{
                                    position: 'absolute', top: -4, right: -8,
                                    backgroundColor: '#ef4444', borderRadius: 10,
                                    minWidth: 18, height: 18,
                                    justifyContent: 'center', alignItems: 'center',
                                    paddingHorizontal: 3
                                }}>
                                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profil', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
            </Stack.Navigator>
        );
    }

    if (user.first_login === 1 || user.first_login === true) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            </Stack.Navigator>
        );
    }

    return <MainTabs />;
}