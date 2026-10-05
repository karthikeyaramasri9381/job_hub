import api from './api';

export const recruiterService = {
  getCompany: async () => {
    const response = await api.get('/recruiter/company/');
    return response.data;
  },

  createCompany: async (data) => {
    const response = await api.post('/recruiter/company/', data);
    return response.data;
  },

  updateCompany: async (data) => {
    const response = await api.put('/recruiter/company/', data);
    return response.data;
  },

  getJobs: async () => {
    const response = await api.get('/recruiter/jobs/');
    return response.data;
  },

  getJobDetail: async (id) => {
    const response = await api.get(`/recruiter/jobs/${id}/`);
    return response.data;
  },

  createJob: async (data) => {
    const response = await api.post('/recruiter/jobs/', data);
    return response.data;
  },

  updateJob: async (id, data) => {
    const response = await api.put(`/recruiter/jobs/${id}/`, data);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/recruiter/jobs/${id}/`);
    return response.data;
  },

  publishJob: async (id) => {
    const response = await api.post(`/recruiter/jobs/${id}/publish/`);
    return response.data;
  },

  closeJob: async (id) => {
    const response = await api.post(`/recruiter/jobs/${id}/close/`);
    return response.data;
  },

  getJobApplicants: async (jobId) => {
    const response = await api.get(`/recruiter/jobs/${jobId}/applications/`);
    return response.data;
  },

  updateApplicantStatus: async (appId, status) => {
    const response = await api.patch(`/recruiter/applications/${appId}/status/`, { status });
    return response.data;
  },

  scheduleInterview: async (appId, data) => {
    const response = await api.post(`/recruiter/applications/${appId}/interview/`, data);
    return response.data;
  },

  getInterviews: async () => {
    const response = await api.get('/recruiter/interviews/');
    return response.data;
  },
};
