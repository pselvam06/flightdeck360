import axios from 'axios';

// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://flight-ticket-backend-40dr.onrender.com/api';

console.log('🌐 API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      console.log('📋 Error status:', error.response.status);
      console.log('📋 Error data:', error.response.data);
      console.log('📋 Error headers:', error.response.headers);
    } else if (error.request) {
      // Request was made but no response received
      console.log('📋 No response received:', error.request);
      error.message = 'Network error: Unable to connect to server';
    } else {
      // Something else happened
      console.log('📋 Error message:', error.message);
    }
    
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const flightsAPI = {
  getAll: (params) => api.get('/flights', { params }),
  getById: (id) => api.get(`/flights/${id}`),
  create: (flightData) => api.post('/flights', flightData),
  update: (id, flightData) => api.put(`/flights/${id}`, flightData),
  delete: (id) => api.delete(`/flights/${id}`),
};

export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getAll: () => api.get('/bookings'),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

export default api;