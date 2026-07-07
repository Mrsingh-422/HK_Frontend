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

const DiamondAPI = {
    // 1. GET PROFILE (Using the manage-admins endpoint)
    getAdminProfile: async () => {
        try {
            const res = await api.get('/api/auth/admin/manage-admins');
            console.log('Admin Profile Data:', res.data); // Debug log
            return res.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    // 2. UPDATE PROFILE
    updateAdminProfile: async (formData) => {
        try {
            const res = await api.put('/api/auth/admin/update', formData);
            return res.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
    // --- ROLE & TAB MANAGEMENT ---

    // 1. Saare available checkboxes (Tabs) mangwane ke liye
    getAllTabs: async () => {
        const res = await api.get('/admin/roles/tabs');
        return res.data;
    },

    // 2. Naya Role template banane ke liye
    createRoleTemplate: async (data) => {
        const res = await api.post('/admin/roles/create', data);
        return res.data;
    },

    // 3. Pehle se bane roles ki list mangwane ke liye (Dropdown ke liye)
    getRolesList: async () => {
        const res = await api.get('/admin/roles/list');

        return res.data;
    },

    // --- SUB-ADMIN MANAGEMENT ---

    // 4. Naya Sub-Admin create karne ke liye
    createSubAdmin: async (data) => {
        const res = await api.post('/admin/create-subadmin', data);
        return res.data;
    },
    // 2. Role Permissions UPDATE karne ke liye
    updateRolePermissions: async (data) => {
        // Body: { roleId: "...", tabIds: [1, 2, 4] }
        const res = await api.put('/admin/roles/update-role-permissions', data);
        return res.data;
    },
    // Fire Station List Fetch
    getFireStations: async () => {
        const res = await api.get('/api/admin/fire/list-firestation-only');
        return res.data;
    },

    // Fire Staff List Fetch
    getFireStaff: async () => {
        const res = await api.get('/api/admin/fire/staff-list-only');
        return res.data;
    },
    // 🚓 Police Station List
    getPoliceStations: async () => {
        const res = await api.get('/api/admin/police/station-list-only');
        return res.data;
    },

    // 👮 Police Staff List
    getPoliceStaff: async () => {
        const res = await api.get('/api/admin/police/staff-list-only');
        return res.data;
    },
    // 1. Sub-Admin List Fetch karna
    // Endpoint: GET /admin/roles/sub-admins
    getSubAdminList: async () => {
        try {
            const res = await api.get('/admin/roles/sub-admins');
            return res.data;
        } catch (error) { throw error.response.data; }
    },

    // 2. Roles List Fetch karna (Dropdown ke liye)
    // Endpoint: GET /admin/roles/list
    getRolesList: async () => {
        try {
            const res = await api.get('/admin/roles/list');
            return res.data;
        } catch (error) { throw error.response.data; }
    },

    // 3. Role Assign karna
    // Endpoint: POST /admin/roles/assign
    assignRoleToAdmin: async (payload) => {
        try {
            // Payload: { adminId: "...", roleId: "..." }
            const res = await api.post('/admin/roles/assign', payload);
            return res.data;
        } catch (error) { throw error.response.data; }
    },
    // ==========================================
    // 🚓 POLICE HEADQUARTER (ADMIN CRUD)
    // ==========================================

    // 1. Get All Police HQs
    getPoliceHQs: async () => {
        try {
            const res = await api.get('/api/admin/police/list-policehq');
            return res.data;
        } catch (error) { throw error.response ? error.response.data : error; }
    },

    // 2. Create Police HQ (with Image)
    createPoliceHQ: async (formData) => {
        try {
            const res = await api.post('/api/admin/police/create-policehq', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        } catch (error) { throw error.response ? error.response.data : error; }
    },

    // 3. Update Police HQ (with Image)
    updatePoliceHQ: async (id, formData) => {
        try {
            const res = await api.put(`/api/admin/police/update-policehq/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        } catch (error) { throw error.response ? error.response.data : error; }
    },

    // 4. Toggle Police HQ Status
    togglePoliceHQStatus: async (id) => {
        try {
            const res = await api.delete(`/api/admin/police/status-policehq/${id}`);
            return res.data;
        } catch (error) { throw error.response ? error.response.data : error; }
    },

}

export default DiamondAPI;
