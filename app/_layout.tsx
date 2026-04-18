import { AuthProvider } from '../src/context/AuthContext';
import AppNavigator from '../src/navigation/AppNavigator';
import { NavigationIndependentTree } from '@react-navigation/native';
import { View } from 'react-native';

export default function RootLayout() {
    return (
        <AuthProvider>
            <NavigationIndependentTree>
                <AppNavigator />
            </NavigationIndependentTree>
        </AuthProvider>
    );
}