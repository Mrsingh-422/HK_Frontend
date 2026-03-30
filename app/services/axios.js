import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to automatically add Admin Token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken'); // Or use cookies
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;