import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@FullConnect:accessToken';
const REFRESH_TOKEN_KEY = '@FullConnect:refreshToken';

export const tokenService = {
    saveAccessToken: async (token: string): Promise<void> => {
        try {
            await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
        } catch (error) {
            console.error('Erro ao salvar access token:', error);
        }
    },

    getAccessToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        } catch (error) {
            console.error('Erro ao obter access token:', error);
            return null;
        }
    },

    saveRefreshToken: async (token: string): Promise<void> => {
        try {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
        } catch (error) {
            console.error('Erro ao salvar refresh token:', error);
        }
    },

    getRefreshToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Erro ao obter refresh token:', error);
            return null;
        }
    },

    setTokens: async ({ accessToken, refreshToken }: { accessToken: string, refreshToken: string }): Promise<void> => {
        await tokenService.saveAccessToken(accessToken);
        await tokenService.saveRefreshToken(refreshToken);
    },

    clearTokens: async (): Promise<void> => {
        try {
            await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
        } catch (error) {
            console.error('Erro ao limpar tokens:', error);
        }
    },

    hasTokens: async (): Promise<boolean> => {
        const accessToken = await tokenService.getAccessToken();
        const refreshToken = await tokenService.getRefreshToken();
        return !!accessToken && !!refreshToken;
    }
};

export default () => null;