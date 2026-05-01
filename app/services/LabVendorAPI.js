import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * TOKEN HELPERS
 */
const getLabToken = () => typeof window !== 'undefined' ? localStorage.getItem('labToken') : null;

const getAnyToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('labToken') || 
               localStorage.getItem('pharmacyToken') || 
               localStorage.getItem('nurseToken');
    }
    return null;
};

/**
 * 2. PUBLIC API (No Token Required)
 */
const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * 2. LAB VENDOR API (Strict Lab Token Only)
 */
const labVendorApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * 3. ANYONE API (Lab, Pharmacy, or Nurse Token)
 */
const anyOneApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * INTERCEPTORS
 */

// Strict Lab Token Interceptor
labVendorApi.interceptors.request.use((config) => {
    const token = getLabToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Any Token Interceptor
anyOneApi.interceptors.request.use((config) => {
    const token = getAnyToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const LabVendorAPI = {

    // ==========================================
    // LAB PROFILE SECTION
    // ==========================================
    getLabProfile: async () => {
        const response = await labVendorApi.get('/provider/labs/profile');
        return response.data;
    },

    updateLabProfile: async (formData) => {
        const response = await labVendorApi.put('/provider/labs/profile/update', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // ==========================================
    // DELIVERY CHARGES SECTION
    // ==========================================
    saveDeliveryCharges: async (data) => {
        const response = await anyOneApi.post('/provider/delivery-charges/save', data);
        return response.data;
    },

    getMyDeliveryCharges: async () => {
        const response = await anyOneApi.get('/provider/delivery-charges/my-charges');
        return response.data;
    },

    // ==========================================
    // ANYONE SECTION (Driver / Phlebotomist)
    // ==========================================
    addDriver: async (formData) => {
        const response = await labVendorApi.post('/provider/driver/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getDrivers: async (page = 1) => {
        const response = await labVendorApi.get(`/provider/driver/list?page=${page}`);
        return response.data;
    },

    searchDrivers: async (query) => {
        const response = await labVendorApi.post('/provider/driver/search', { query });
        return response.data;
    },

    getDriverDetails: async (id) => {
        const response = await labVendorApi.get(`/provider/driver/details/${id}`);
        return response.data;
    },

    updateDriver: async (id, formData) => {
        const response = await labVendorApi.put(`/provider/driver/update/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    toggleDriverStatus: async (id, status) => {
        const response = await labVendorApi.patch(`/provider/driver/status/${id}`, { status });
        return response.data;
    },

    deleteDriver: async (id) => {
        const response = await labVendorApi.delete(`/provider/driver/delete/${id}`);
        return response.data;
    },

    // ==========================================
    // LAB VENDOR SECTION (Services & Availability)
    // ==========================================
    setAvailability: async (data) => {
        const response = await labVendorApi.post('/provider/availability/set-slots', data);
        return response.data;
    },

    getMySlots: async () => {
        const response = await labVendorApi.get('/provider/availability/my-slots');
        return response.data;
    },

    blockSlot: async (time) => {
        const response = await labVendorApi.post('/provider/availability/block-slot', { time });
        return response.data;
    },

    unblockSlot: async (time) => {
        const response = await labVendorApi.post('/provider/availability/unblock-slot', { time });
        return response.data;
    },

    saveLabTest: async (data) => {
        const response = await labVendorApi.post('/provider/labs/services/tests/save', data);
        return response.data;
    },

    updateLabTest: async (data) => {
        const response = await labVendorApi.put('/provider/labs/services/update-test', data);
        return response.data;
    },

    getMyTests: async (params = {}) => {
        const response = await labVendorApi.get('/provider/labs/services/tests/my-tests', { params });
        return response.data;
    },

    saveLabPackage: async (data) => {
        const response = await labVendorApi.post('/provider/labs/services/packages/save', data);
        return response.data;
    },

    updateLabPackage: async (data) => {
        const response = await labVendorApi.put('/provider/labs/services/update-package', data);
        return response.data;
    },

    getMyPackages: async (params = {}) => {
        const response = await labVendorApi.get('/provider/labs/services/packages/my-packages', { params });
        return response.data;
    },

    deleteService: async (type, id) => {
        const response = await labVendorApi.delete(`/provider/labs/services/delete/${type}/${id}`);
        return response.data;
    },

    toggleStatus: async (type, id) => {
        const response = await labVendorApi.patch(`/provider/labs/services/status/${type}/${id}`);
        return response.data;
    },

    submitNewMasterRequest: async (data) => {
        const response = await labVendorApi.post('/provider/labs/services/suggest-new', data);
        return response.data;
    },

    // ==========================================
    // COUPON / PROMOTIONS SECTION (NEW)
    // ==========================================
    listCoupons: async () => {
        const response = await labVendorApi.get('/provider/coupons/list');
        return response.data;
    },

    addCoupon: async (data) => {
        const response = await labVendorApi.post('/provider/coupons/add', data);
        return response.data;
    },

    updateCoupon: async (id, data) => {
        const response = await labVendorApi.put(`/provider/coupons/update/${id}`, data);
        return response.data;
    },

    toggleCoupon: async (id) => {
        const response = await labVendorApi.patch(`/provider/coupons/toggle/${id}`);
        return response.data;
    },

    deleteCoupon: async (id) => {
        const response = await labVendorApi.delete(`/provider/coupons/delete/${id}`);
        return response.data;
    },

    // ==========================================
    // INSURANCE SECTION
    // ==========================================
    getInsuranceList: async () => {
        const response = await anyOneApi.get('/admin/user/insurance/insurance-list');
        return response.data;
    },

    // ==========================================
    // CATALOG & BROWSING SECTION
    // ==========================================
    getStandardCatalogTests: async (params = {}) => {
        const response = await labVendorApi.get('/provider/labs/services/tests/standard-catalog', { params });
        return response.data;
    },

    getStandardPackages: async (params = {}) => {
        const response = await labVendorApi.get('/provider/labs/services/packages/standard-catalog', { params });
        return response.data;
    },

    getMasterList: async (params = {}) => {
        const response = await labVendorApi.get('/provider/labs/services/tests/master-tests', { params });
        return response.data;
    },

    getMasterTestDetails: async (masterTestId) => {
        const response = await labVendorApi.get(`/provider/labs/services/tests/master-details/${masterTestId}`);
        return response.data;
    },

    getMasterPackages: async (params = {}) => {
        const response = await labVendorApi.get('/provider/labs/services/packages/master-packages', { params });
        return response.data;
    },

    getMasterPackageDetails: async (id) => {
        const response = await labVendorApi.get(`/provider/labs/services/packages/master-details/${id}`);
        return response.data;
    },

     // ==========================================
    // ORDER MANAGEMENT (NEW)
    // ==========================================
    getOrders: async (status) => {
        const response = await labVendorApi.get('/provider/labs/orders', { 
            params: { status: status === 'Approved' ? 'Confirmed' : status } 
        });
        return response.data;
    },

    orderAction: async (orderId, action, reason) => {
        const response = await labVendorApi.patch(`/provider/labs/order-action/${orderId}`, { 
            action, 
            reason 
        });
        return response.data;
    },

    assignStaff: async (orderId, phlebotomistId) => {
        const response = await labVendorApi.patch(`/provider/labs/assign-staff/${orderId}`, { 
            phlebotomistId 
        });
        return response.data;
    },

    updateProgress: async (orderId, status) => {
        const response = await labVendorApi.patch(`/provider/labs/update-progress/${orderId}`, { 
            status 
        });
        return response.data;
    },
    // ==========================================
    // DASHBOARD & STATS (NEW)
    // ==========================================
    getDashboardStats: async () => {
        const response = await labVendorApi.get('/provider/labs/dashboard');
        return response.data;
    },

    // ==========================================
    // ORDER MANAGEMENT (EXISTING)
    // ==========================================
    getOrders: async (status) => {
        const response = await labVendorApi.get('/provider/labs/orders', { 
            params: { status: status === 'Approved' ? 'Confirmed' : status } 
        });
        return response.data;
    },
    
};

export default LabVendorAPI;