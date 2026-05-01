import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const getPharmacyToken = () => typeof window !== 'undefined' ? localStorage.getItem('pharmacyToken') : null;

const pharmacyVendorApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Attach Token
pharmacyVendorApi.interceptors.request.use((config) => {
    const token = getPharmacyToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor to handle 401 Unauthorized globally
pharmacyVendorApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('pharmacyToken');
            localStorage.removeItem('pharmacyProvider');
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

const PharmacyVendorAPI = {
    // --- MASTER DATABASE ---
    searchMasterMedicines: async (query, page = 1) => {
        const response = await pharmacyVendorApi.get(`/provider/pharmacy/inventory/getMaster`, {
            params: { query, page }
        });
        return response.data;
    },

    getMasterDetails: async (id) => {
        const response = await pharmacyVendorApi.get(`/provider/pharmacy/inventory/getMaster/details/${id}`);
        return response.data;
    },

    // --- MY INVENTORY MANAGEMENT ---
    getMyInventory: async () => {
        const response = await pharmacyVendorApi.get('/provider/pharmacy/inventory/my-list');
        return response.data;
    },

    addToInventory: async (data) => {
        const response = await pharmacyVendorApi.post('/provider/pharmacy/inventory/add', data);
        return response.data;
    },

    updateInventory: async (id, data) => {
        const response = await pharmacyVendorApi.put(`/provider/pharmacy/inventory/update/${id}`, data);
        return response.data;
    },

    deleteInventory: async (id) => {
        const response = await pharmacyVendorApi.delete(`/provider/pharmacy/inventory/delete/${id}`);
        return response.data;
    },

    submitNewMasterRequest: async (payload) => {
        const response = await pharmacyVendorApi.post('/provider/pharmacy/inventory/add-request', payload);
        return response.data;
    },

    // --- PHARMACY ORDERS MANAGEMENT ---
    listPharmacyOrders: async () => {
        const response = await pharmacyVendorApi.get('/provider/pharmacy/orders/list');
        return response.data;
    },

    updatePharmacyOrderStatus: async (orderId, status, reason = '', driverId = null) => {
        const response = await pharmacyVendorApi.patch(`/provider/pharmacy/orders/status/${orderId}`, { 
            status, 
            reason,
            driverId 
        });
        return response.data;
    },

    // 3. Assign Driver Manually
    assignManualDriver: async (orderId, driverId) => {
        const response = await pharmacyVendorApi.post('/provider/pharmacy/orders/assign-manual', { 
            orderId, 
            driverId 
        });
        return response.data;
    },

    // 4. Reassign Driver
    reassignDriver: async (orderId, newDriverId) => {
        const response = await pharmacyVendorApi.post('/provider/pharmacy/orders/reassign', { 
            orderId, 
            newDriverId 
        });
        return response.data;
    },

    listAvailableDrivers: async () => {
        const response = await pharmacyVendorApi.get('/provider/pharmacy/orders/available-drivers');
        return response.data;
    },

    // --- COUPONS ---
    listCoupons: async () => {
        const response = await pharmacyVendorApi.get('/provider/coupons/list');
        return response.data;
    },
    addCoupon: async (data) => {
        const response = await pharmacyVendorApi.post('/provider/coupons/add', data);
        return response.data;
    },
    updateCoupon: async (id, data) => {
        const response = await pharmacyVendorApi.put(`/provider/coupons/update/${id}`, data);
        return response.data;
    },
    toggleCoupon: async (id) => {
        const response = await pharmacyVendorApi.patch(`/provider/coupons/toggle/${id}`);
        return response.data;
    },
    deleteCoupon: async (id) => {
        const response = await pharmacyVendorApi.delete(`/provider/coupons/delete/${id}`);
        return response.data;
    },

    // --- DELIVERY ---
    saveDeliveryCharges: async (data) => {
        const response = await pharmacyVendorApi.post('/provider/delivery-charges/save', data);
        return response.data;
    },
    getMyDeliveryCharges: async () => {
        const response = await pharmacyVendorApi.get('/provider/delivery-charges/my-charges');
        return response.data;
    },

    // --- DRIVERS ---
    addDriver: async (formData) => {
        const response = await pharmacyVendorApi.post('/provider/driver/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getDrivers: async (page = 1) => {
        const response = await pharmacyVendorApi.get(`/provider/driver/list?page=${page}`);
        return response.data;
    },
    searchDrivers: async (query) => {
        const response = await pharmacyVendorApi.post('/provider/driver/search', { query });
        return response.data;
    },
    getDriverDetails: async (id) => {
        const response = await pharmacyVendorApi.get(`/provider/driver/details/${id}`);
        return response.data;
    },
    updateDriver: async (id, formData) => {
        const response = await pharmacyVendorApi.put(`/provider/driver/update/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    updateDriverStatus: async (id, status) => {
        const response = await pharmacyVendorApi.patch(`/provider/driver/status/${id}`, { status });
        return response.data;
    },
    deleteDriver: async (id) => {
        const response = await pharmacyVendorApi.delete(`/provider/driver/delete/${id}`);
        return response.data;
    },

    // --- PROFILE ---
    getPharmacyProfile: async () => {
        const response = await pharmacyVendorApi.get('/provider/pharmacy/profile');
        return response.data;
    },
    updatePharmacyProfile: async (formData) => {
        const response = await pharmacyVendorApi.put('/provider/pharmacy/profile/update', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // --- SCHEDULE / AVAILABILITY ---
    getAvailability: async () => {
        const response = await pharmacyVendorApi.get('/provider/availability/my-slots');
        return response.data;
    },
    saveAvailability: async (data) => {
        const response = await pharmacyVendorApi.post('/provider/availability/set-slots', data);
        return response.data;
    },
    blockSlot: async (slotTime) => {
        const response = await pharmacyVendorApi.patch('/provider/availability/block-slot', { slotTime });
        return response.data;
    },
    unblockSlot: async (slotTime) => {
        const response = await pharmacyVendorApi.patch('/provider/availability/unblock-slot', { slotTime });
        return response.data;
    }
};

export default PharmacyVendorAPI;