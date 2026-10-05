import api from './api';

export const candidateService = {
  getProfile: async () => {
    const response = await api.get('/candidate/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/candidate/profile/', data);
    return response.data;
  },

  getEducation: async () => {
    const response = await api.get('/candidate/education/');
    return response.data;
  },

  addEducation: async (data) => {
    const response = await api.post('/candidate/education/', data);
    return response.data;
  },

  deleteEducation: async (id) => {
    const response = await api.delete(`/candidate/education/${id}/`);
    return response.data;
  },

  getExperience: async () => {
    const response = await api.get('/candidate/experience/');
    return response.data;
  },

  addExperience: async (data) => {
    const response = await api.post('/candidate/experience/', data);
    return response.data;
  },

  deleteExperience: async (id) => {
    const response = await api.delete(`/candidate/experience/${id}/`);
    return response.data;
  },

  getSkills: async () => {
    const response = await api.get('/candidate/skills/');
    return response.data;
  },

  addSkill: async (data) => {
    const response = await api.post('/candidate/skills/', data);
    return response.data;
  },

  deleteSkill: async (id) => {
    const response = await api.delete(`/candidate/skills/${id}/`);
    return response.data;
  },

  getApplications: async () => {
    const response = await api.get('/candidate/applications/');
    return response.data;
  },

  withdrawApplication: async (id) => {
    const response = await api.post(`/candidate/applications/${id}/withdraw/`);
    return response.data;
  },

  getSavedJobs: async () => {
    const response = await api.get('/candidate/saved-jobs/');
    return response.data;
  },

  getInterviews: async () => {
    const response = await api.get('/candidate/interviews/');
    return response.data;
  },
};
