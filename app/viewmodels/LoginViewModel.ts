// fullconnect/app/viewmodels/LoginViewModel.ts
import { useState } from 'react';
import { LoginCredentials, User } from '../models/User';
import { AuthService } from '../services/AuthService';
import { storage } from '../utils/storage';

type UserValidationStatus = 'pending' | 'blocked_admin' | 'no_companies' | 'ok_to_proceed';

export const useLoginViewModel = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [preAuthToken, setPreAuthToken] = useState<string | null>(null);
    const [twoFactorMethods, setTwoFactorMethods] = useState<string[]>([]);
    const [selected2FAMethod, setSelected2FAMethod] = useState<string | null>(null);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [userValidationStatus, setUserValidationStatus] = useState<UserValidationStatus>('pending');


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

    const validateAndSetUser = (userData: User) => {
        setUser(userData); // Set the full user object

        const isAdminOnly = userData.roles.length === 1 && userData.roles[0].name === 'ADMIN';
        const hasNoCompanies = userData.companies.length === 0;

        if (isAdminOnly) {
            setUserValidationStatus('blocked_admin');
            setError('Sua conta possui apenas o papel de Administrador. Acesse o sistema pela versão web.');
        } else if (hasNoCompanies) {
            setUserValidationStatus('no_companies');
            setError('Você não está associado a nenhuma empresa. Por favor, entre em contato com o administrador do sistema.');
        } else {
            setUserValidationStatus('ok_to_proceed');
            setLoginSuccess(true); // Only set loginSuccess if user can proceed
        }
    };

    // New function to load and validate current user, especially on app start
    const loadAndValidateCurrentUser = async () => {
        setLoading(true);
        setError(null);
        setUserValidationStatus('pending'); // Ensure status is pending during this load

        try {
            const currentUser = await AuthService.getCurrentUser();
            validateAndSetUser(currentUser);
        } catch (err: any) {
            setError(err.message || 'Falha ao carregar dados do usuário para validação.');
            setUserValidationStatus('blocked_admin'); // Treat any load error as blocked for safety, or a new 'error_loading_user' status
            // Consider logging out here if it's a token error
        } finally {
            setLoading(false);
        }
    };


    const login = async () => {
        setLoading(true);
        setError(null);
        setLoginSuccess(false);
        setTwoFactorRequired(false);
        setPreAuthToken(null);
        setTwoFactorMethods([]);
        setSelected2FAMethod(null);
        setTwoFactorCode('');
        setCodeSent(false);
        setUserValidationStatus('pending'); // Reset validation status

        try {
            const credentials: LoginCredentials = {
                email,
                // Sanitize password here before sending
                password: password.replace(/\0/g, '').trim(), // Remove null characters and trim whitespace
                rememberMe
            };

            const response = await AuthService.login(credentials);

            if ('status' in response && response.status === '2fa_selection_required') {
                setTwoFactorRequired(true);
                setPreAuthToken(response.preAuthToken);
                setTwoFactorMethods(response.methods);
            } else {
                // Successful login without 2FA, now validate user data
                validateAndSetUser(response.user);
            }

        } catch (error: any) {
            setError(error.message || 'Credenciais inválidas. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handle2FAMethodSelection = async (method: string) => {
        setLoading(true);
        setError(null);
        setSelected2FAMethod(method);

        if (!preAuthToken) {
            setError('Erro: preAuthToken não encontrado para seleção 2FA.');
            setLoading(false);
            return;
        }

        try {
            await AuthService.select2FAMethod(preAuthToken, method);
            setCodeSent(true);
        } catch (error: any) {
            setError(error.message || 'Falha ao enviar código de verificação.');
        } finally {
            setLoading(false);
        }
    };

    const handle2FACompletion = async () => {
        setLoading(true);
        setError(null);

        if (!preAuthToken || !selected2FAMethod || !twoFactorCode) {
            setError('Por favor, preencha todos os campos da verificação em duas etapas.');
            setLoading(false);
            return;
        }

        try {
            const response = await AuthService.complete2FA(preAuthToken, selected2FAMethod, twoFactorCode);
            // After 2FA completion, validate user data
            validateAndSetUser(response.user);
        } catch (error: any) {
            setError(error.message || 'Código de verificação inválido. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (email: string) => {
        setLoading(true);
        setError(null);
        try {
            await AuthService.requestPasswordReset(email);
        } catch (err: any) {
            setError(err.message || 'Erro ao solicitar recuperação de senha.');
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
        loginSuccess,
        twoFactorRequired,
        preAuthToken,
        twoFactorMethods,
        selected2FAMethod,
        twoFactorCode,
        setTwoFactorCode,
        codeSent,
        userValidationStatus,
        login,
        initializeForm,
        handle2FAMethodSelection,
        handle2FACompletion,
        handleForgotPassword,
        loadAndValidateCurrentUser,
    };
};

export default () => null;