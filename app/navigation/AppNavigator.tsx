import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from '../views/login/LoginScreen';
import SignupScreen from '../views/signup/SignupScreen';
import HomeScreen from '../views/home/HomeScreen';
import RouterDetailScreen from '../views/router/RouterDetailScreen';
import { storage } from '../utils/storage';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Register: undefined;
    RouterDetail: { routerId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const theme = useTheme();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await storage.getToken();
            setIsAuthenticated(!!token);
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator
            initialRouteName={isAuthenticated ? 'Home' : 'Login'}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
                name="RouterDetail"
                component={RouterDetailScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;