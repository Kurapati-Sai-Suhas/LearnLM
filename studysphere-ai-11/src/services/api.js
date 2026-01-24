import axios from "axios";

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// 1. CREATE THE AXIOS INSTANCE (The Engine)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. REQUEST INTERCEPTOR (Attaches Token Automatically)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR (Handles 401 Unauthorized globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out.");
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      // Optional: window.location.href = "/auth"; 
    }
    return Promise.reject(error);
  }
);

// ==================== User API ====================
export const userAPI = {
  getDashboardStats: () => api.get('/dashboard/stats/'),
  getProfile: () => api.get('/user/profile/'),
  updateProfile: (updates) => api.patch('/user/profile/', updates),
  getAchievements: () => api.get('/user/achievements/'),
  getStats: () => api.get('/user/stats/'),
  getNotifications: () => api.get('/user/notifications/'),
  markNotificationRead: (id) => api.patch(`/user/notifications/${id}/read/`),
};

// ==================== Authentication API ====================
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/token/', { username, password });
    if (response.data.access) {
      localStorage.setItem('authToken', response.data.access);
      if (response.data.refresh) localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response.data;
  },
  signup: (username, email, password) => api.post('/register/', { username, email, password }),
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    window.location.href = "/auth";
  },
};

// ==================== Study Groups API ====================
export const groupsAPI = {
  // Axios automatically returns the data inside a .data property, 
  // but your React component expects the response object to read .data from.
  // api.get returns the full response object, which is exactly what we need.
  
  getAll: () => api.get('/groups/'),
  
  create: (groupData) => api.post('/groups/', groupData),
  
  getById: (groupId) => api.get(`/groups/${groupId}/`),
  
  join: (code) => api.post('/groups/join/', { code }),
  
  leave: (groupId) => api.delete(`/groups/${groupId}/leave/`),
  
  update: (groupId, updates) => api.patch(`/groups/${groupId}/`, updates),

  // 📦 FILE UPLOAD
  uploadMaterial: (title, file, groupId) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('study_group', groupId);
    formData.append('file', file);

    // Axios detects FormData and sets 'Content-Type': 'multipart/form-data' automatically
    return api.post('/materials/', formData);
  },

  getMaterials: (groupId) => api.get(`/materials/?search=${groupId}`)
};

// ==================== AI Features API ====================
export const aiAPI = {
  generateFlashcards: (materialId, topic, count = 10) => 
    api.post('/ai/flashcards/', { materialId, topic, count }),

  generateQuiz: (materialId, topic, questionCount = 10, difficulty = 'medium') => 
    api.post('/ai/quiz/', { materialId, topic, questionCount, difficulty }),

  submitQuiz: (quizId, answers) => 
    api.post(`/ai/quiz/${quizId}/submit/`, { answers }),

  askDoubt: (question, context = null, attachments = []) => 
    api.post('/ai/doubt/', { question, context, attachments }),
};

// ==================== Schedule API ====================
export const scheduleAPI = {
  getSchedule: () => api.get('/schedule/'),
  createEvent: (eventData) => api.post('/schedule/', eventData),
  updateEvent: (eventId, updates) => api.patch(`/schedule/${eventId}/`, updates),
  deleteEvent: (eventId) => api.delete(`/schedule/${eventId}/`),
};

// 👇 CRITICAL: DEFAULT EXPORT MUST BE THE AXIOS INSTANCE
// This allows "import api from ..." to work, enabling "api.get()"
export default api;