import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Button, Checkbox, Text, HelperText } from 'react-native-paper';

interface LoginFormProps {
    email: string;
    password: string;
    rememberMe: boolean;
    loading: boolean;
    error: string | null;
    onEmailChange: (email: string) => void;
    onPasswordChange: (password: string) => void;
    onRememberMeChange: (value: boolean) => void;
    onSubmit: () => void;
    onForgotPassword: () => void;
    onRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = (
    {
        email,
        password,
        rememberMe,
        loading,
        error,
        onEmailChange,
        onPasswordChange,
        onRememberMeChange,
        onSubmit,
        onForgotPassword,
        onRegister,
    }) => {
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const validateForm = (): boolean => {
        let isValid = true;

        if (!email.trim()) {
            setEmailError('O e-mail é obrigatório');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Digite um e-mail válido');
            isValid = false;
        } else {
            setEmailError(null);
        }

        if (!password) {
            setPasswordError('A senha é obrigatória');
            isValid = false;
        } else {
            setPasswordError(null);
        }

        return isValid;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <TextInput
                    label="E-mail"
                    value={email}
                    onChangeText={onEmailChange}
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
                    onChangeText={onPasswordChange}
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry={secureTextEntry}
                    error={!!passwordError}
                    disabled={loading}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                        <TextInput.Icon
                            icon={secureTextEntry ? 'eye' : 'eye-off'}
                            onPress={() => setSecureTextEntry(!secureTextEntry)}
                        />
                    }
                />
                {passwordError && <HelperText type="error">{passwordError}</HelperText>}

                <View style={styles.rememberContainer}>
                    <Checkbox.Item
                        label="Lembrar-me"
                        status={rememberMe ? 'checked' : 'unchecked'}
                        onPress={() => onRememberMeChange(!rememberMe)}
                        position="leading"
                        style={styles.checkbox}
                        disabled={loading}
                    />
                    <Text
                        style={styles.forgotPassword}
                        onPress={onForgotPassword}
                    >
                        Esqueceu a senha?
                    </Text>
                </View>

                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.loginButton}
                    loading={loading}
                    disabled={loading}
                >
                    Entrar
                </Button>

                <View style={styles.registerContainer}>
                    <Text>Não tem uma conta?</Text>
                    <Button
                        mode="text"
                        onPress={onRegister}
                        disabled={loading}
                    >
                        Cadastre-se
                    </Button>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    formContainer: {
        width: '100%',
    },
    input: {
        marginBottom: 12,
    },
    rememberContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkbox: {
        padding: 0,
    },
    forgotPassword: {
        textAlign: 'right',
        textDecorationLine: 'underline',
    },
    errorText: {
        color: '#B00020',
        marginBottom: 16,
        textAlign: 'center',
    },
    loginButton: {
        marginTop: 8,
        marginBottom: 16,
        paddingVertical: 6,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LoginForm;