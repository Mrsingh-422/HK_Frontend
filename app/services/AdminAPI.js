import axios from 'axios';

// 1. Create the Axios Instance
const api = axios.create({
    // baseURL: process.env.NEXT_PUBLIC_API_URL,
    baseURL: "http://192.168.1.22:5002",
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor to automatically add Admin Token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// 3. Define the AdminAPI Service Functions
const AdminAPI = {

    // add single test CSV 
    addSingleTest: async (testData) => {
        const response = await api.post("/admin/add-test", testData);
        return response.data;
    },

    // add package test 
    addTestPackageCSV: async (testData) => {
        const response = await api.post('', testData);
        return response.data
    },

    // Pass 'test' or 'package' as the type argument
    getTestsByType: async (type) => {
        const response = await api.get(`/admin/lab/tests/list/${type}`);
        return response.data;
    },

    // New function to fetch details of a specific test by ID
    getTestById: async (id) => {
        const response = await api.get(`/admin/lab/tests/details/${id}`); // Adjust route to match your backend
        return response.data;
    },
};

export default AdminAPI;