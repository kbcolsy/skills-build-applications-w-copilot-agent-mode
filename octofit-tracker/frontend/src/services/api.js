import axios from 'axios';

// Simple and reliable API URL for Codespace
const API_BASE_URL = 'https://fluffy-giggle-q55pr6p7j4rfvp-8000.app.github.dev/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication
export const auth = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/profile/'),
};

// Exercise types
export const exercises = {
  getAll: () => api.get('/exercises/'),
};

// Workout events
export const workouts = {
  getAll: () => api.get('/workouts/'),
  create: (data) => api.post('/workouts/', data),
  update: (id, data) => api.put(`/workouts/${id}/`, data),
  delete: (id) => api.delete(`/workouts/${id}/`),
};

// Dashboard stats
export const dashboard = {
  getStats: () => api.get('/dashboard/'),
};

// Admin endpoints
export const admin = {
  getStats: () => api.get('/admin/stats/'),
  getStudents: () => api.get('/admin/students/'),
  archiveUser: (userId) => api.post(`/admin/archive/${userId}/`),
};

export default api;