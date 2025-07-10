// fullconnect/app/services/authClient.ts (Modified for refresh token handling)
import { client, post } from './apiClient';
import { tokenService } from './tokenService';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export async function authClient(endpoint: string, { body, ...customConfig }: { body?: any, method?: string, headers?: HeadersInit } = {}) {
    const accessToken = await tokenService.getAccessToken();
    const authHeaders: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

    const config: RequestInit = {
        body: body ? JSON.stringify(body) : undefined,
        ...customConfig,
        headers: {
            ...authHeaders,
            ...customConfig.headers,
        },
    };

    try {
        if (!config.method) {
            config.method = body ? 'POST' : 'GET';
        }
        return await client(endpoint, config);
    } catch (error: any) {
        // Verifica se é um erro 401 e se não é a própria rota de refresh token
        // A API de refresh token também pode retornar 401 se o refresh_token for inválido,
        // mas não queremos entrar em um loop de refresh para ela mesma.
        if (error.status !== 401 || endpoint.includes('/sessions/refresh')) {
            return Promise.reject(error);
        }

        // Se um refresh já está em andamento, enfileira a requisição atual
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token: string | null) => {
                if (!token) {
                    throw new Error("Failed to refresh token, no token received.");
                }
                (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
                return client(endpoint, config);
            });
        }

        isRefreshing = true;
        const refreshToken = await tokenService.getRefreshToken();

        if (!refreshToken) {
            isRefreshing = false;
            await tokenService.clearTokens(); // Limpa todos os tokens se não houver refresh token
            // Em uma aplicação real, você redirecionaria para o login aqui.
            return Promise.reject(new Error("Sessão expirada. Por favor, faça login novamente."));
        }

        try {
            // Usa o 'post' do apiClient (não autenticado) para a rota de refresh token
            // A rota de refresh token recebe { refreshToken: "..." } e retorna { accessToken: "..." }
            const refreshResponse = await post('/sessions/refresh', { refreshToken });

            if (refreshResponse && refreshResponse.accessToken) {
                // Apenas salva o novo access token. O refresh token existente é mantido.
                await tokenService.saveAccessToken(refreshResponse.accessToken);

                processQueue(null, refreshResponse.accessToken); // Processa requisições enfileiradas com o novo access token

                // Tenta novamente a requisição original com o novo access token
                (config.headers as Record<string, string>).Authorization = `Bearer ${refreshResponse.accessToken}`;
                return client(endpoint, config);
            } else {
                throw new Error("Access token inválido recebido durante o refresh.");
            }
        } catch (refreshError: any) {
            processQueue(refreshError, null); // Rejeita as requisições enfileiradas
            await tokenService.clearTokens(); // Limpa todos os tokens em caso de falha no refresh
            // Em uma aplicação real, você redirecionaria para o login aqui.
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
}

// Funções auxiliares para métodos HTTP autenticados
export const authGet = (endpoint: string, customConfig: { method?: string, headers?: HeadersInit } = {}) => authClient(endpoint, { ...customConfig, method: 'GET' });
export const authPost = (endpoint: string, body: any, customConfig: { method?: string, headers?: HeadersInit } = {}) => authClient(endpoint, { body, ...customConfig, method: 'POST' });
export const authPut = (endpoint: string, body: any, customConfig: { method?: string, headers?: HeadersInit } = {}) => authClient(endpoint, { body, ...customConfig, method: 'PUT' });
export const authDel = (endpoint: string, customConfig: { method?: string, headers?: HeadersInit } = {}) => authClient(endpoint, { ...customConfig, method: 'DELETE' });

export default () => null;