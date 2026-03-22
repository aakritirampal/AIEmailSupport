import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export const login = (password) => api.post('/auth/login', { password });
export const getStats = () => api.get('/stats');
export const getEmails = (page = 1, filter = 'all') =>
  api.get(`/emails?page=${page}&filter=${filter}&limit=20`);
export const getPollStatus = () => api.get('/poll-status');
export const triggerPoll = () => api.post('/poll-now');
export const getHealth = () => api.get('/health');

export default api;
