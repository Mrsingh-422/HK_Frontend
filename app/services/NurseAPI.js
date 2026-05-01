import axios from 'axios';
 
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
 
/**
* TOKEN HELPERS
*/
const getNurseToken = () => typeof window !== 'undefined' ? localStorage.getItem('nursingToken') : null;
 
const getAnyToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('labToken') ||
               localStorage.getItem('pharmacyToken') ||
               localStorage.getItem('nursingToken');
    }
    return null;
};
 
/**
* 1. PUBLIC API (No Token Required)
*/
const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});
 
/**
* 2. NURSE VENDOR API (Strict Nursing Token Only)
*/
const nurseVendorApi = axios.create({
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
nurseVendorApi.interceptors.request.use((config) => {
    const token = getNurseToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
 
anyOneApi.interceptors.request.use((config) => {
    const token = getAnyToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
 
const NurseAPI = {
 
    // ==========================================
    // VISIT / CONVEYANCE CHARGES SECTION
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
    // NURSE TEAM MANAGEMENT
    // ==========================================
    addNurse: async (formData) => {
        const response = await nurseVendorApi.post('/provider/driver/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
 
    getNurse: async () => {
        const response = await nurseVendorApi.get('/provider/driver/list');
        return response.data;
    },
 
    searchDrivers: async (query) => {
        const response = await nurseVendorApi.post('/provider/driver/search', { query });
        return response.data;
    },
 
    getDriverDetails: async (id) => {
        const response = await nurseVendorApi.get(`/provider/driver/details/${id}`);
        return response.data;
    },
 
    updateDriver: async (id, formData) => {
        const response = await nurseVendorApi.put(`/provider/driver/update/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
 
    toggleDriverStatus: async (id, status) => {
        const response = await nurseVendorApi.patch(`/provider/driver/status/${id}`, { status });
        return response.data;
    },
 
    deleteDriver: async (id) => {
        const response = await nurseVendorApi.delete(`/provider/driver/delete/${id}`);
        return response.data;
    },
 
    // ==========================================
    // COUPON / PROMOTIONS SECTION
    // ==========================================
    listCoupons: async () => {
        const response = await nurseVendorApi.get('/provider/coupons/list');
        return response.data;
    },
 
    addCoupon: async (data) => {
        const response = await nurseVendorApi.post('/provider/coupons/add', data);
        return response.data;
    },
 
    updateCoupon: async (id, data) => {
        const response = await nurseVendorApi.put(`/provider/coupons/update/${id}`, data);
        return response.data;
    },
 
    toggleCoupon: async (id) => {
        const response = await nurseVendorApi.patch(`/provider/coupons/toggle/${id}`);
        return response.data;
    },
 
    deleteCoupon: async (id) => {
        const response = await nurseVendorApi.delete(`/provider/coupons/delete/${id}`);
        return response.data;
    },
};
 
export default NurseAPI;