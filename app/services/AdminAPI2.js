import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
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
    
    // --- ADMIN RETURN POLICY & UNIFIED REFUND QUEUE (PART 4) ---

// 1. Fetch Return Policy Settings (GET /admin/pharmacy/return-policy)
getPharmacyReturnPolicy: () => 
    api.get('/admin/pharmacy/return-policy'),

// 2. Update Return Policy Settings (PUT /admin/pharmacy/return-policy/update)
updatePharmacyReturnPolicy: (data) => 
    api.put('/admin/pharmacy/return-policy/update', data),

// 3. View Unified Refund Queue (GET /api/admin/refunds)
getUnifiedRefundQueue: () => 
    api.get('/api/admin/refunds'),

// 4. Execute Razorpay Payout (POST /api/admin/refunds/process)
processRefundPayout: (bookingId, vendorModel = 'Pharmacy') => 
    api.post('/api/admin/refunds/process', { bookingId, vendorModel }),

};

export default AdminAPI2;
