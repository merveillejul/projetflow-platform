import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import TasksScreen from '../screens/TasksScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
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
                options={{
                    title: 'Accueil',
                    tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>
                }}
            />
            <Tab.Screen
                name="Projects"
                component={ProjectsScreen}
                options={{
                    title: 'Projets',
                    tabBarIcon: () => <Text style={{ fontSize: 20 }}>📁</Text>
                }}
            />
            <Tab.Screen
                name="Tasks"
                component={TasksScreen}
                options={{
                    title: 'Mes tâches',
                    tabBarIcon: () => <Text style={{ fontSize: 20 }}>✅</Text>
                }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    title: 'Notifications',
                    tabBarIcon: () => <Text style={{ fontSize: 20 }}>🔔</Text>
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profil',
                    tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>
                }}
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
            </Stack.Navigator>
        );
    }

    return <MainTabs />;
}