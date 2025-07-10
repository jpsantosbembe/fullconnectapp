// fullconnect/app/views/login/LoginScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import {Text, useTheme, Button, ActivityIndicator, HelperText, Snackbar, TextInput} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useLoginViewModel } from '../../viewmodels/LoginViewModel';
import LoginForm from './components/LoginForm';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { AuthService } from '../../services/AuthService'; // Import AuthService

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
        loginSuccess,
        twoFactorRequired,
        preAuthToken,
        twoFactorMethods,
        selected2FAMethod,
        twoFactorCode,
        setTwoFactorCode,
        codeSent,
        login,
        initializeForm,
        handle2FAMethodSelection,
        handle2FACompletion,
        handleForgotPassword,
    } = useLoginViewModel();

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        initializeForm();
    }, []);

    useEffect(() => {
        if (loginSuccess) {
            navigation.navigate('Home');
        }
        if (error) {
            setSnackbarMessage(error);
            setSnackbarVisible(true);
        }
    }, [loginSuccess, error, navigation]);

    const submitForgotPassword = async (email: string) => {
        await handleForgotPassword(email);
    };

    const handleRegister = () => {
        navigation.navigate('Register');
    };

    const renderTwoFactorForm = () => {
        if (!twoFactorRequired) return null;

        return (
            <View style={styles.twoFactorContainer}>
                <Text style={styles.twoFactorTitle}>Verificação em Duas Etapas</Text>
                {!codeSent ? (
                    <>
                        <Text style={styles.twoFactorSubtitle}>Selecione um método para receber o código:</Text>
                        {twoFactorMethods.map((method) => (
                            <Button
                                key={method}
                                mode="outlined"
                                onPress={() => handle2FAMethodSelection(method)}
                                loading={loading && selected2FAMethod === method}
                                disabled={loading}
                                style={styles.twoFactorMethodButton}
                            >
                                {method === 'EMAIL' ? 'Receber código por E-mail' : 'Usar TOTP'}
                            </Button>
                        ))}
                    </>
                ) : (
                    <>
                        <Text style={styles.twoFactorSubtitle}>
                            Um código foi enviado para seu {selected2FAMethod === 'EMAIL' ? 'e-mail' : 'aplicativo TOTP'}. Digite-o abaixo:
                        </Text>
                        <TextInput
                            label="Código de Verificação"
                            value={twoFactorCode}
                            onChangeText={setTwoFactorCode}
                            mode="outlined"
                            style={styles.input}
                            keyboardType="numeric"
                            autoCapitalize="none"
                            disabled={loading}
                            left={<TextInput.Icon icon="shield-check" />}
                        />
                        {error && <HelperText type="error">{error}</HelperText>}
                        <Button
                            mode="contained"
                            onPress={handle2FACompletion}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                        >
                            Verificar Código
                        </Button>
                    </>
                )}
            </View>
        );
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

                        {!twoFactorRequired ? (
                            <LoginForm
                                email={email}
                                password={password}
                                rememberMe={rememberMe}
                                loading={loading}
                                error={error}
                                onEmailChange={setEmail}
                                onPasswordChange={setPassword}
                                onRememberMeChange={setRememberMe}
                                onSubmit={login} // Directly pass 'login' from the ViewModel
                                onForgotPassword={() => setForgotPasswordVisible(true)}
                                onRegister={handleRegister}
                            />
                        ) : (
                            renderTwoFactorForm()
                        )}
                    </View>
                </ScrollView>

                <ForgotPasswordModal
                    visible={forgotPasswordVisible}
                    onDismiss={() => setForgotPasswordVisible(false)}
                    onSubmit={submitForgotPassword}
                    initialEmail={email}
                />
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={{ backgroundColor: theme.colors.errorContainer }}
                >
                    <Text style={{ color: theme.colors.onErrorContainer }}>{snackbarMessage}</Text>
                </Snackbar>
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
    twoFactorContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    twoFactorTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    twoFactorSubtitle: {
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
        color: '#555',
    },
    twoFactorMethodButton: {
        marginBottom: 10,
    },
    input: {
        marginBottom: 8,
    },
    button: {
        marginTop: 16,
        marginBottom: 16,
        paddingVertical: 6,
    },
});

export default LoginScreen;