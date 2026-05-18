import axios from 'axios';
 
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
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
 
const AdminAPI2 = {
    // --- Existing Methods ---
    getLabCategories: () => api.get('/admin/lab/tests/lab-categories'),
    getPharmacyCategories: () => api.get('/admin/lab/tests/pharmacy-categories'),
    updateLabCategoryImage: (formData) => api.post('/admin/lab/tests/update-test-category-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updatePharmacyCategoryImage: (formData) => api.post('/admin/lab/tests/update-pharmacy-category-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
 
    // --- Fire Station HQ Methods ---
    createFireHQ: (formData) => api.post('/api/admin/fire/create-firehq', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    listFireHQ: () => api.get('/api/admin/fire/list-firehq'),
    
    updateFireHQ: (id, formData) => api.put(`/api/admin/fire/update-firehq/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    toggleFireHQStatus: (id) => api.delete(`/api/admin/fire/status-firehq/${id}`),
};
 
export default AdminAPI2;
 