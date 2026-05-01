import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token'); // or 'ADMIN_TOKEN' based on your login logic
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const AdminAPI = {
    // 1. Get Lab Categories
    getLabCategories: () => api.get('/admin/lab/tests/lab-categories'),

    // 2. Get Pharmacy Categories
    getPharmacyCategories: () => api.get('/admin/lab/tests/pharmacy-categories'),

    // 3. Update Lab Category Image
    updateLabCategoryImage: (formData) => api.post('/admin/lab/tests/update-test-category-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // 4. Update Pharmacy Category Image
    updatePharmacyCategoryImage: (formData) => api.post('/admin/lab/tests/update-pharmacy-category-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default AdminAPI;