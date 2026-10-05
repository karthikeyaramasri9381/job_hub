import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/auth/admin/stats/');
    return response.data;
  },

  getUsers: async (role = '') => {
    const response = await api.get('/auth/admin/users/', {
      params: role ? { role } : {},
    });
    return response.data;
  },

  toggleUserActive: async (userId) => {
    const response = await api.patch(`/auth/admin/users/${userId}/toggle-active/`);
    return response.data;
  },

  getJobs: async () => {
    const response = await api.get('/auth/admin/jobs/');
    return response.data;
  },

  deleteJob: async (jobId) => {
    const response = await api.delete(`/auth/admin/jobs/${jobId}/`);
    return response.data;
  },
};
