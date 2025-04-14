import { LoginCredentials, LoginResponse, User } from '../models/User';

const API_URL = 'http://10.0.2.2:3000';

export class AuthService {

    static async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                }),
            });

            if (!response.ok) {
                throw new Error('Falha ao realizar login');
            }

            const data = await response.json();

            const loginResponse: LoginResponse = {
                user: {
                    email: credentials.email,
                },
                token: data.token,
            };

            return loginResponse;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    static async getCurrentUser(token: string): Promise<User> {
        try {
            const response = await fetch(`${API_URL}/whoami`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Falha ao obter dados do usuário');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            throw error;
        }
    }

    static async signup(userData: { name: string; email: string; password: string }): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('Email já registrado');
                }
                throw new Error(data.error?.message || 'Falha ao realizar cadastro');
            }

            return {
                success: true,
                message: 'Cadastro realizado com sucesso!'
            };
        } catch (error) {
            if (error instanceof Error) {
                console.error('Erro no cadastro:', error.message);
                throw error;
            }
            throw new Error('Erro desconhecido no cadastro');
        }
    }
}

export default { AuthService };
