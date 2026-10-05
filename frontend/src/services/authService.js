import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  googleLogin: async (idToken, role = 'CANDIDATE') => {
    const response = await api.post('/auth/google/', {
      id_token: idToken,
      role,
    });
    return response.data;
  },

  logout: async (refreshToken) => {
    try {
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.clear();
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },
};
