import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('collab_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthorized requests
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // If unauthorized, we could auto-logout but let the UI handle specific errors
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// API Service Call wrappers
export const authAPI = {
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, role?: string) => apiClient.post('/auth/register', { name, email, password, role }),
  me: () => apiClient.get('/auth/me'),
  seed: () => apiClient.post('/auth/seed'),
};

export const projectsAPI = {
  getAll: () => apiClient.get('/projects'),
  getById: (id: string) => apiClient.get(`/projects/${id}`),
  create: (projectData: any) => apiClient.post('/projects', projectData),
  update: (id: string, projectData: any) => apiClient.put(`/projects/${id}`, projectData),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
  addMember: (id: string, memberId: string) => apiClient.post(`/projects/${id}/members`, { memberId }),
};

export const tasksAPI = {
  getAll: (filters?: Record<string, string>) => apiClient.get('/tasks', { params: filters }),
  getById: (id: string) => apiClient.get(`/tasks/${id}`),
  create: (taskData: any) => apiClient.post('/tasks', taskData),
  update: (id: string, taskData: any) => apiClient.put(`/tasks/${id}`, taskData),
  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
  addComment: (id: string, text: string) => apiClient.post(`/tasks/${id}/comments`, { text }),
  uploadAttachment: (id: string, formData: FormData) => apiClient.post(`/tasks/${id}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const teamAPI = {
  getAll: () => apiClient.get('/team'),
  create: (memberData: any) => apiClient.post('/team', memberData),
  getWorkload: () => apiClient.get('/team/workload'),
};

export const activitiesAPI = {
  getRecent: (limit?: number) => apiClient.get('/activities', { params: { limit } }),
};

export default apiClient;
