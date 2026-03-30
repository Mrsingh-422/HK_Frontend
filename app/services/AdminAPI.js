import axios from 'axios';

const api = axios.create({
    baseURL: "http://192.168.1.22:5002",
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const AdminAPI = {
    addSingleTest: async (testData) => {
        const response = await api.post("/admin/add-test", testData);
        return response.data;
    },

    addTestPackageCSV: async (testData) => {
        const response = await api.post('/admin/add-package', testData);
        return response.data;
    },

    // Updated to handle pagination and search
    getTestsByType: async (type, page = 1, limit = 20, search = "") => {
        const response = await api.get(`/admin/lab/tests/list/${type}`, {
            params: { page, limit, search } // Axios converts this to ?page=1&limit=20&search=...
        });
        return response.data;
    },
};

export default AdminAPI;