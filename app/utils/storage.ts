// fullconnect/app/utils/storage.ts (Modified)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenService } from '../services/tokenService'; // Import the new tokenService

const USER_KEY = '@FullConnect:user';
const REMEMBER_ME_KEY = '@FullConnect:rememberMe';
const SAVED_EMAIL_KEY = '@FullConnect:savedEmail';

export const storage = {
  // Removed saveToken and getToken as they are now handled by tokenService
  // Removed saveRefreshToken and getRefreshToken as they are now handled by tokenService

  saveEmail: async (email: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(SAVED_EMAIL_KEY, email);
    } catch (error) {
      console.error('Erro ao salvar email:', error);
    }
  },

  getSavedEmail: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(SAVED_EMAIL_KEY);
    } catch (error) {
      console.error('Erro ao obter email salvo:', error);
      return null;
    }
  },

  saveRememberMe: async (remember: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(REMEMBER_ME_KEY, String(remember));
    } catch (error) {
      console.error('Erro ao salvar preferência de lembrar-me:', error);
    }
  },

  getRememberMe: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Erro ao obter preferência de lembrar-me:', error);
      return false;
    }
  },

  clearAuth: async (): Promise<void> => {
    try {
      // Clear tokens using the new tokenService
      await tokenService.clearTokens();

      const rememberMe = await storage.getRememberMe();
      const keysToClear = [USER_KEY]; // USER_KEY is not managed by tokenService, so keep it for now

      if (!rememberMe) {
        keysToClear.push(SAVED_EMAIL_KEY, REMEMBER_ME_KEY);
      }

      await AsyncStorage.multiRemove(keysToClear);
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
    }
  },
  // Re-adding getToken for AppNavigator initial check, but it will rely on tokenService
  // This is a temporary bridge, ideally AppNavigator would check tokenService directly or have a global auth state.
  // For now, let's make it get access token from tokenService.
  getToken: async (): Promise<string | null> => {
    return tokenService.getAccessToken();
  },
};

export default { storage };