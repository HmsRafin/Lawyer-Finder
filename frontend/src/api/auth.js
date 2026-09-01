import { apiRequest } from './config';

export const authApi = {
  login: async (credentials) => {
    return await apiRequest('/auth/login.php', {
      method: 'POST',
      body: credentials,
    });
  },

  register: async (userData) => {
    return await apiRequest('/auth/register.php', {
      method: 'POST',
      body: userData,
    });
  },

  logout: async () => {
    return await apiRequest('/auth/logout.php', {
      method: 'POST',
    });
  },

  getMe: async () => {
    return await apiRequest('/auth/me.php', {
      method: 'GET',
    });
  }
};
