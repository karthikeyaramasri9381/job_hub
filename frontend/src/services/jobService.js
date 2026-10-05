import api from './api';

export const jobService = {
  getPublicJobs: async (params = {}) => {
    const response = await api.get('/jobs/', { params });
    return response.data;
  },

  getPublicJobDetail: async (id) => {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
  },

  saveJob: async (id) => {
    const response = await api.post(`/jobs/${id}/save/`);
    return response.data;
  },

  unsaveJob: async (id) => {
    const response = await api.delete(`/jobs/${id}/save/`);
    return response.data;
  },

  applyForJob: async (id, applicationData) => {
    const response = await api.post(`/jobs/${id}/apply/`, applicationData);
    return response.data;
  },
};
