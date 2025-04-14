import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, TextInput, Text } from 'react-native-paper';

interface ForgotPasswordModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: (email: string) => Promise<void>;
    initialEmail: string;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = (
    {
    visible,
    onDismiss,
    onSubmit,
    initialEmail,
    }) => {
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!email.trim()) {
            setError('Por favor, informe seu e-mail');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSubmit(email);
            setSuccess(true);
        } catch (error) {
            setError('Não foi possível processar sua solicitação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail(initialEmail);
        setSuccess(false);
        setError(null);
        onDismiss();
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
                <Dialog.Title>Esqueci minha senha</Dialog.Title>
                <Dialog.Content>
                    {success ? (
                        <Text>
                            Enviamos instruções para recuperar sua senha para o email {email}.
                            Por favor, verifique sua caixa de entrada.
                        </Text>
                    ) : (
                        <View>
                            <Text style={styles.description}>
                                Digite seu e-mail abaixo para receber as instruções de recuperação de senha.
                            </Text>
                            <TextInput
                                label="E-mail"
                                value={email}
                                onChangeText={setEmail}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                error={!!error}
                                disabled={loading}
                            />
                            {error && <Text style={styles.errorText}>{error}</Text>}
                        </View>
                    )}
                </Dialog.Content>
                <Dialog.Actions>
                    {success ? (
                        <Button onPress={handleClose} mode="contained">Entendi</Button>
                    ) : (
                        <View style={styles.actions}>
                            <Button onPress={handleClose} disabled={loading}>Cancelar</Button>
                            <Button
                                onPress={handleSubmit}
                                mode="contained"
                                loading={loading}
                                disabled={loading}
                            >
                                Enviar
                            </Button>
                        </View>
                    )}
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    dialog: {
        borderRadius: 12,
    },
    description: {
        marginBottom: 16,
    },
    input: {
        marginTop: 8,
        marginBottom: 8,
    },
    errorText: {
        color: '#B00020',
        fontSize: 12,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});

export default ForgotPasswordModal;