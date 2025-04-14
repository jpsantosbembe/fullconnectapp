import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import LoginScreen from '../views/login/LoginScreen';
import SignupScreen from '../views/signup/SignupScreen';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const theme = useTheme();

    const isAuthenticated = false;

    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
            }}
        >
            {isAuthenticated ? (
                <Stack.Screen name="Home" component={() => <></>} />
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen
                        name="Register"
                        component={SignupScreen}
                        options={{
                            headerShown: false,
                            title: 'Cadastro',
                            headerStyle: {
                                backgroundColor: theme.colors.surface,
                            },
                            headerTintColor: theme.colors.primary,
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;