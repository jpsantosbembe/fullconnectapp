import { useState } from 'react';
import { LoginCredentials, User } from '../models/User';
import { AuthService } from '../services/AuthService';
import { storage } from '../utils/storage';

export const useLoginViewModel = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const initializeForm = async () => {
        try {
            const savedRememberMe = await storage.getRememberMe();
            setRememberMe(savedRememberMe);

            if (savedRememberMe) {
                const savedEmail = await storage.getSavedEmail();
                if (savedEmail) {
                    setEmail(savedEmail);
                }
            }
        } catch (error) {
            console.error('Erro ao inicializar formulário:', error);
        }
    };

    const login = async () => {
        setLoading(true);
        setError(null);

        try {
            const credentials: LoginCredentials = {
                email,
                password,
                rememberMe
            };

            const response = await AuthService.login(credentials);

            await storage.saveToken(response.token);

            if (rememberMe) {
                await storage.saveEmail(email);
                await storage.saveRememberMe(true);
            } else {
                await storage.saveRememberMe(false);
            }

            setUser(response.user);

            return response;
        } catch (error) {
            setError('Credenciais inválidas. Por favor, tente novamente.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        rememberMe,
        setRememberMe,
        loading,
        error,
        user,
        login,
        initializeForm
    };
};

const LoginViewModelComponent = () => null;

export default LoginViewModelComponent;