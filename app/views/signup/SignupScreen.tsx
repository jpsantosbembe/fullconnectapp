import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { TextInput, Button, Text, HelperText, Snackbar, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useSignupViewModel } from '../../viewmodels/SignupViewModel';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const SignupScreen: React.FC = () => {
    const theme = useTheme();
    const navigation = useNavigation<SignupScreenNavigationProp>();

    const {
        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        loading,
        error,
        success,
        signup,
    } = useSignupViewModel();

    const [nameError, setNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const validateName = (value: string) => {
        if (!value.trim()) {
            setNameError('O nome é obrigatório');
            return false;
        }
        setNameError(null);
        return true;
    };

    const validateEmail = (value: string) => {
        if (!value.trim()) {
            setEmailError('O email é obrigatório');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(value)) {
            setEmailError('Email inválido');
            return false;
        }
        setEmailError(null);
        return true;
    };

    const validatePassword = (value: string) => {
        if (!value) {
            setPasswordError('A senha é obrigatória');
            return false;
        } else if (value.length < 8) {
            setPasswordError('A senha deve ter pelo menos 8 caracteres');
            return false;
        }
        setPasswordError(null);
        return true;
    };

    const validateConfirmPassword = (value: string, passwordToCompare: string) => {
        if (value !== passwordToCompare) {
            setConfirmPasswordError('As senhas não correspondem');
            return false;
        }
        setConfirmPasswordError(null);
        return true;
    };

    const handleNameChange = (text: string) => {
        setName(text);
        validateName(text);
    };

    const handleEmailChange = (text: string) => {
        setEmail(text);
        validateEmail(text);
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        validatePassword(text);
        if (confirmPassword) {
            validateConfirmPassword(confirmPassword, text);
        }
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        validateConfirmPassword(text, password);
    };

    const handleSignup = async () => {
        const isNameValid = validateName(name);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

        if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            return;
        }

        const result = await signup();

        if (result.success) {
            setSnackbarMessage('Cadastro realizado com sucesso! Redirecionando para o login...');
            setSnackbarVisible(true);

            setTimeout(() => {
                navigation.navigate('Login');
            }, 2000);
        }
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
                        <Text style={styles.title}>Criar Conta</Text>
                        <Text style={styles.subtitle}>Preencha os dados abaixo para se cadastrar</Text>

                        <TextInput
                            label="Nome completo"
                            value={name}
                            onChangeText={handleNameChange}
                            mode="outlined"
                            style={styles.input}
                            error={!!nameError}
                            disabled={loading}
                            left={<TextInput.Icon icon="account" />}
                        />
                        {nameError && <HelperText type="error">{nameError}</HelperText>}

                        <TextInput
                            label="E-mail"
                            value={email}
                            onChangeText={handleEmailChange}
                            mode="outlined"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={!!emailError}
                            disabled={loading}
                            left={<TextInput.Icon icon="email" />}
                        />
                        {emailError && <HelperText type="error">{emailError}</HelperText>}

                        <TextInput
                            label="Senha"
                            value={password}
                            onChangeText={handlePasswordChange}
                            mode="outlined"
                            style={styles.input}
                            secureTextEntry
                            error={!!passwordError}
                            disabled={loading}
                            left={<TextInput.Icon icon="lock" />}
                        />
                        {passwordError && <HelperText type="error">{passwordError}</HelperText>}
                        <HelperText type="info">A senha deve ter pelo menos 8 caracteres</HelperText>

                        <TextInput
                            label="Confirmar senha"
                            value={confirmPassword}
                            onChangeText={handleConfirmPasswordChange}
                            mode="outlined"
                            style={styles.input}
                            secureTextEntry
                            error={!!confirmPasswordError}
                            disabled={loading}
                            left={<TextInput.Icon icon="lock-check" />}
                        />
                        {confirmPasswordError && <HelperText type="error">{confirmPasswordError}</HelperText>}

                        {error && (
                            <Text style={styles.errorText}>{error}</Text>
                        )}

                        <Button
                            mode="contained"
                            onPress={handleSignup}
                            style={styles.button}
                            loading={loading}
                            disabled={loading}
                        >
                            Cadastrar
                        </Button>

                        <View style={styles.loginContainer}>
                            <Text>Já tem uma conta?</Text>
                            <Button
                                mode="text"
                                onPress={() => navigation.navigate('Login')}
                                disabled={loading}
                            >
                                Faça login
                            </Button>
                        </View>
                    </View>
                </ScrollView>

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={2000}
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                >
                    <Text style={{ color: theme.colors.onPrimaryContainer }}>{snackbarMessage}</Text>
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
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        color: '#666',
    },
    input: {
        marginBottom: 8,
    },
    button: {
        marginTop: 16,
        marginBottom: 16,
        paddingVertical: 6,
    },
    errorText: {
        color: '#B00020',
        marginBottom: 16,
        textAlign: 'center',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
});

export default SignupScreen;