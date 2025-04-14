import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useLoginViewModel } from '../../viewmodels/LoginViewModel';
import LoginForm from './components/LoginForm';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const placeholderLogo = require('../../../assets/images/react-logo.png');

const LoginScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);

    const {
        email,
        setEmail,
        password,
        setPassword,
        rememberMe,
        setRememberMe,
        loading,
        error,
        login,
        initializeForm
    } = useLoginViewModel();

    useEffect(() => {
        // Inicializar o formulário com dados salvos (se "lembrar-me" estiver ativado)
        initializeForm();
    }, []);

    const handleLogin = async () => {
        try {
            await login();
            // Em um app real, você redirecionaria para a tela principal aqui
            console.log('Login realizado com sucesso!');
        } catch (error) {
            // Erro já é tratado no ViewModel
        }
    };

    const handleForgotPassword = async (email: string) => {
        //todo
    };

    const handleRegister = () => {
        navigation.navigate('Register');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="auto" />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        <View style={styles.logoContainer}>
                            <Image source={placeholderLogo} style={styles.logo} />
                            <Text style={[styles.appName, { color: theme.colors.primary }]}>
                                FullConnect
                            </Text>
                        </View>

                        <Text style={styles.welcomeText}>
                            Bem-vindo ao FullConnect
                        </Text>

                        <LoginForm
                            email={email}
                            password={password}
                            rememberMe={rememberMe}
                            loading={loading}
                            error={error}
                            onEmailChange={setEmail}
                            onPasswordChange={setPassword}
                            onRememberMeChange={setRememberMe}
                            onSubmit={handleLogin}
                            onForgotPassword={() => setForgotPasswordVisible(true)}
                            onRegister={handleRegister}
                        />
                    </View>
                </ScrollView>

                <ForgotPasswordModal
                    visible={forgotPasswordVisible}
                    onDismiss={() => setForgotPasswordVisible(false)}
                    onSubmit={handleForgotPassword}
                    initialEmail={email}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
    },
    welcomeText: {
        fontSize: 18,
        marginBottom: 24,
        textAlign: 'center',
    },
});

export default LoginScreen;