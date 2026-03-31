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
            params: { page, limit, search }
        });
        return response.data;
    },

    getAllHospitals: async () => {
        const response = await api.get("/api/admin/approval/hospitals");
        return response.data;
    },

    // Add this to your UserAPI object
    approveHospital: async (hospitalId) => {
        // Matches your route: router.patch('/hospitals/approve/:id', ...)
        const response = await api.patch(`/api/admin/approval/hospitals/approve/${hospitalId}`);
        return response.data;
    },

    rejectHospital: async (hospitalId) => {
        // Matches your route: router.patch('/hospitals/reject/:id', ...)
        const response = await api.patch(`/api/admin/approval/hospitals/reject/${hospitalId}`);
        return response.data;
    },

    getAllPharmacyInAdmin: async () => {
        const response = await api.get("/api/admin/approval/pharmacy");
        return response.data;
    },

    approvePharmacyByAdmin: async (pharmacyId) => {
        const response = await api.patch(`/api/admin/approval/pharmacy/approve/${pharmacyId}`);
        return response.data;
    },

    rejectPharmacyByAdmin: async (pharmacyId, reason) => {
        // Matches: router.patch('/pharmacy/reject/:id', ...)
        const response = await api.patch(`/api/admin/approval/pharmacy/reject/${pharmacyId}`, {
            rejectionReason: reason
        });
        return response.data;
    },
};

export default AdminAPI;