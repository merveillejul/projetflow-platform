import { AuthProvider } from '../src/context/AuthContext';
import AppNavigator from '../src/navigation/AppNavigator';
import { NavigationIndependentTree } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <NavigationIndependentTree>
                    <AppNavigator />
                </NavigationIndependentTree>
            </AuthProvider>
        </SafeAreaProvider>
    );
}