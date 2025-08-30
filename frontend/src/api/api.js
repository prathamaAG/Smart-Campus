import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API URL
  withCredentials: true,
});

// Interceptor to add the token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;