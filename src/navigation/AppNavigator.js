import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';

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
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const ACTIVE   = '#1d4ed8';
const INACTIVE = '#94a3b8';

// ─── Icônes SVG ───────────────────────────────────────────────────────────────

function IconDashboard({ color, size = 22 }) {
    return (
        <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <Rect x="3" y="3" width="7" height="7" rx="1" />
            <Rect x="14" y="3" width="7" height="7" rx="1" />
            <Rect x="14" y="14" width="7" height="7" rx="1" />
            <Rect x="3" y="14" width="7" height="7" rx="1" />
        </Svg>
    );
}

function IconProjects({ color, size = 22 }) {
    return (
        <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <Path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </Svg>
    );
}

function IconTasks({ color, size = 22 }) {
    return (
        <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <Polyline points="9 11 12 14 22 4" />
            <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </Svg>
    );
}

function IconBell({ color, size = 22 }) {
    return (
        <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
    );
}

function IconProfile({ color, size = 22 }) {
    return (
        <Svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <Circle cx="12" cy="7" r="4" />
        </Svg>
    );
}

// ─── Badge notifications ──────────────────────────────────────────────────────

function NotifIcon({ color, count }) {
    return (
        <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
            <IconBell color={color} size={22} />
            {count > 0 && (
                <View style={{
                    position: 'absolute', top: -3, right: -5,
                    backgroundColor: '#ef4444', borderRadius: 10,
                    minWidth: 16, height: 16,
                    justifyContent: 'center', alignItems: 'center',
                    paddingHorizontal: 3,
                    borderWidth: 1.5, borderColor: 'white',
                }}>
                    <Text style={{ color: 'white', fontSize: 9, fontWeight: '700', lineHeight: 12 }}>
                        {count > 9 ? '9+' : count}
                    </Text>
                </View>
            )}
        </View>
    );
}

// ─── Stacks ───────────────────────────────────────────────────────────────────

function ProjectsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProjectsList"  component={ProjectsScreen} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
        </Stack.Navigator>
    );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

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
                tabBarActiveTintColor:   ACTIVE,
                tabBarInactiveTintColor: INACTIVE,
                tabBarStyle: {
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 8,
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    elevation: 0,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: -2 },
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginTop: 2,
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    title: 'Accueil',
                    tabBarIcon: ({ color }) => <IconDashboard color={color} />,
                }}
            />
            <Tab.Screen
                name="Projects"
                component={ProjectsStack}
                options={{
                    title: 'Projets',
                    tabBarIcon: ({ color }) => <IconProjects color={color} />,
                }}
            />
            <Tab.Screen
                name="Tasks"
                component={TasksScreen}
                options={{
                    title: 'Tâches',
                    tabBarIcon: ({ color }) => <IconTasks color={color} />,
                }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    title: 'Notifs',
                    tabBarIcon: ({ color }) => <NotifIcon color={color} count={unreadCount} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color }) => <IconProfile color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

// ─── Navigator principal ──────────────────────────────────────────────────────

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login"          component={LoginScreen} />
                <Stack.Screen name="Register"       component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
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