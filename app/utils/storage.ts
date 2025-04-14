import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@FullConnect:token';
const USER_KEY = '@FullConnect:user';
const REMEMBER_ME_KEY = '@FullConnect:rememberMe';
const SAVED_EMAIL_KEY = '@FullConnect:savedEmail';

export const storage = {
  saveToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  },

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
      const rememberMe = await storage.getRememberMe();
      const keys = [TOKEN_KEY, USER_KEY];

      if (!rememberMe) {
        keys.push(SAVED_EMAIL_KEY, REMEMBER_ME_KEY);
      }

      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
    }
  }
};

export default { storage };