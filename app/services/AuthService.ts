// fullconnect/app/services/AuthService.ts (Modified with more getCurrentUser logs)
import { LoginCredentials, LoginResponse, User } from '../models/User';
import { post, client } from './apiClient'; // Import post and client from apiClient for unauthenticated calls
import { authGet } from './authClient'; // Import authGet for authenticated calls
import { tokenService } from './tokenService'; // Import tokenService
import { storage } from '../utils/storage'; // Assuming storage is still used for email and rememberMe

/**
 * Este serviço agrupa todas as chamadas de API relacionadas à autenticação.
 */
export class AuthService {

    static async login(credentials: LoginCredentials): Promise<LoginResponse | { status: "2fa_selection_required", preAuthToken: string, methods: string[] }> {
        console.log('AuthService: login function called.');
        const endpoint = '/sessions/initiate';
        const body = { email: credentials.email, password: credentials.password };
        console.log('AuthService: Preparing to call apiClient.post for', endpoint, 'with body (email):', body.email);

        try {
            console.log('AuthService: >>> About to execute apiClient.post call for /sessions/initiate <<<');
            const response = await post(endpoint, body);
            console.log('AuthService: <<< Successfully executed apiClient.post call for /sessions/initiate. Response:', response);

            if (response.status === '2fa_selection_required') {
                console.log('AuthService: 2FA required, returning preAuthToken.');
                return {
                    status: '2fa_selection_required',
                    preAuthToken: response.preAuthToken,
                    methods: response.methods,
                };
            } else if (response.status === 'completed' && response.accessToken && response.refreshToken) {
                console.log('AuthService: Login completed, saving tokens.');
                await tokenService.setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });

                if (credentials.rememberMe) {
                    await storage.saveEmail(credentials.email);
                    await storage.saveRememberMe(true);
                } else {
                    await storage.saveRememberMe(false);
                }

                console.log('AuthService: Tokens saved. Now attempting to get current user data...');
                const user: User = await AuthService.getCurrentUser();
                console.log('AuthService: Current user data obtained:', user.email);


                const loginResponse: LoginResponse = {
                    user: user,
                    token: response.accessToken,
                };
                console.log('AuthService: Login successful, returning loginResponse.');
                return loginResponse;
            } else {
                console.error('AuthService: Unexpected login response status:', response.status);
                throw new Error(response.message || 'Unexpected login response.');
            }

        } catch (error: any) {
            console.error('AuthService: Error caught in login function (after apiClient.post call for /sessions/initiate):', error);
            throw new Error(error.message || 'Falha ao realizar login');
        }
    }

    static async select2FAMethod(preAuthToken: string, method: string): Promise<{ status: "code_sent" }> {
        console.log('AuthService: select2FAMethod function called.');
        const endpoint = '/sessions/select-2fa';
        const body = { preAuthToken, method };
        console.log('AuthService: Preparing to call apiClient.post for', endpoint, 'with method:', method);
        try {
            console.log('AuthService: >>> About to execute apiClient.post (select2FAMethod) call <<<');
            const response = await post(endpoint, body);
            console.log('AuthService: <<< Successfully executed apiClient.post (select2FAMethod) call. Response:', response);
            if (response.status === 'code_sent') {
                console.log('AuthService: 2FA code sent.');
                return { status: 'code_sent' };
            } else {
                console.error('AuthService: Unexpected response for 2FA method selection status:', response.status);
                throw new Error(response.message || 'Unexpected response for 2FA method selection.');
            }
        } catch (error: any) {
            console.error('AuthService: Error in select2FAMethod:', error);
            throw new Error(error.message || 'Falha ao selecionar método 2FA');
        }
    }

    static async complete2FA(preAuthToken: string, method: string, twoFactorCode: string): Promise<LoginResponse> {
        console.log('AuthService: complete2FA function called.');
        const endpoint = '/sessions/complete';
        const body = { preAuthToken, method, twoFactorCode };
        console.log('AuthService: Preparing to call apiClient.post for', endpoint, 'with code:', twoFactorCode);
        try {
            console.log('AuthService: >>> About to execute apiClient.post (complete2FA) call <<<');
            const response = await post(endpoint, body);
            console.log('AuthService: <<< Successfully executed apiClient.post (complete2FA) call. Response:', response);

            if (response.status === 'completed' && response.accessToken && response.refreshToken) {
                console.log('AuthService: 2FA completed, saving tokens.');
                await tokenService.setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });

                console.log('AuthService: Tokens saved after 2FA. Now attempting to get current user data...');
                const user: User = await AuthService.getCurrentUser();
                console.log('AuthService: Current user data obtained after 2FA:', user.email);

                const loginResponse: LoginResponse = {
                    user: user,
                    token: response.accessToken,
                };
                console.log('AuthService: 2FA successful, returning loginResponse.');
                return loginResponse;
            } else {
                console.error('AuthService: Unexpected response for 2FA completion status:', response.status);
                throw new Error(response.message || 'Unexpected response for 2FA completion.');
            }
        } catch (error: any) {
            console.error('AuthService: Error caught in complete2FA:', error);
            throw new Error(error.message || 'Falha ao completar autenticação de dois fatores');
        }
    }

    static async getCurrentUser(): Promise<User> {
        console.log('AuthService: getCurrentUser function called to fetch /sessions/me.');
        const endpoint = '/sessions/me'; // Example endpoint for getting current user info
        try {
            console.log('AuthService: >>> About to execute authGet call for /sessions/me <<<');
            const data = await authGet(endpoint); // Use authenticated get
            console.log('AuthService: <<< Successfully executed authGet call for /sessions/me. User data received:', data);
            return data as User; // Cast data to User interface
        } catch (error: any) {
            console.error('AuthService: Error caught in getCurrentUser for /sessions/me:', error);
            throw new Error(error.message || 'Falha ao obter dados do usuário');
        }
    }

    static async signup(userData: { name: string; email: string; password: string }): Promise<{ success: boolean; message?: string }> {
        console.log('AuthService: signup function called.');
        const endpoint = '/signup';
        console.log('AuthService: Preparing to call apiClient.post for', endpoint, 'with email:', userData.email);
        try {
            console.log('AuthService: >>> About to execute apiClient.post (signup) call <<<');
            const response = await post(endpoint, userData);
            console.log('AuthService: <<< Successfully executed apiClient.post (signup) call. Response:', response);
            return {
                success: true,
                message: response.message || 'Cadastro realizado com sucesso!'
            };
        } catch (error: any) {
            if (error.message && (error.message.includes('Email já registrado') || error.message.includes('already exists'))) {
                console.error('AuthService: Signup error: Email already registered.');
                throw new Error('Email já registrado');
            }
            console.error('AuthService: Error caught in signup:', error.message);
            throw new Error(error.message || 'Erro desconhecido no cadastro');
        }
    }

    static async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
        console.log('AuthService: requestPasswordReset function called.');
        const endpoint = '/password/reset-initiate';
        console.log('AuthService: Preparing to call apiClient.post for', endpoint, 'for email:', email);
        try {
            console.log('AuthService: >>> About to execute apiClient.post (requestPasswordReset) call <<<');
            const response = await post(endpoint, { email });
            console.log('AuthService: <<< Successfully executed apiClient.post (requestPasswordReset) call. Response:', response);
            return { success: true, message: response.message || 'Instruções de recuperação enviadas para o seu e-mail.' };
        } catch (error: any) {
            console.error('AuthService: Error caught in requestPasswordReset:', error);
            throw new Error(error.message || 'Não foi possível processar sua solicitação. Tente novamente.');
        }
    }
}

export default () => null;