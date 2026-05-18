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
    // PROFILE SECTION
    // ==========================================
    getNurseProfile: async () => {
        const response = await nurseVendorApi.get('/api/auth/provider/profile');
        return response.data;
    },
 
    updateNurseProfile: async (formData) => {
        const response = await nurseVendorApi.put('/provider/nurse/dash/profile/update', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
 
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
 
    // ==========================================
    // SERVICE & CSV MANAGEMENT
    // ==========================================
    getNurseCsvCategories: async () => {
        const response = await publicApi.get('/admin/nurse-csv/categories');
        return response.data;
    },
 
    getNurseCsvSubCategories: async (category) => {
        const response = await publicApi.get(`/admin/nurse-csv/sub-categories?category=${category}`);
        return response.data;
    },
 
    getNurseCsvServiceDetails: async (category, subCategory) => {
        const response = await publicApi.get(`/admin/nurse-csv/details?category=${category}&subCategory=${subCategory}`);
        return response.data;
    },
 
    manageNurseService: async (payload) => {
        const response = await nurseVendorApi.post('/provider/nurse/dash/service/manage', payload);
        return response.data;
    },
 
    updateNurseService: async (id, formData) => {
        const response = await nurseVendorApi.put(`/provider/nurse/dash/service/manage/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
 
    getMyServicesList: async (status = 'Approved') => {
        const response = await nurseVendorApi.get(`/provider/nurse/dash/service/list?status=${status}`);
        return response.data;
    },
 
    // ==========================================
    // AVAILABILITY & SLOTS MANAGEMENT
    // ==========================================
    getMySlots: async () => {
        const response = await nurseVendorApi.get('/provider/availability/my-slots');
        return response.data;
    },
 
    setNurseSlots: async (data) => {
        const response = await nurseVendorApi.post('/provider/availability/set-nurse-slots', data);
        return response.data;
    },
 
    toggleNurseSlot: async (data) => {
        const response = await nurseVendorApi.post('/provider/availability/toggle-nurse-slot', data);
        return response.data;
    },
 
    // ==========================================
    // NURSE PACKAGE MANAGEMENT
    // ==========================================
    createPackage: async (formData) => {
        const response = await nurseVendorApi.post('/provider/nurse/package/manage', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
 
    getMyPackages: async () => {
        const response = await nurseVendorApi.get('/provider/nurse/package/my-packages');
        return response.data;
    },
 
    getNurseServicesForPackage: async () => {
        const response = await nurseVendorApi.get('/provider/nurse/package/nurse-services');
        return response.data;
    },
 
    // ==========================================
    // DASHBOARD SECTION
    // ==========================================
    getDashboardStats: async () => {
        const response = await nurseVendorApi.get('/provider/nurse/dash/dashboard-stats');
        return response.data;
    },
 
    // ==========================================
    // BOOKING & STAFF MANAGEMENT
    // ==========================================
    getStaffByStatus: async (status) => {
        const response = await nurseVendorApi.get(`/provider/nurse/dash/staff/status?status=${status}`);
        return response.data;
    },
 
    getBookings: async (status = 'Pending') => {
        const response = await nurseVendorApi.get(`/provider/nurse/dash/bookings?status=${status}`);
        return response.data;
    },
 
    handleBookingAction: async (payload) => {
        const response = await nurseVendorApi.post('/provider/nurse/dash/booking/action', payload);
        return response.data;
    },
 
    getAvailableStaff: async () => {
        const response = await nurseVendorApi.get('/provider/nurse/dash/staff/available');
        return response.data;
    },
 
    assignStaffToBooking: async (payload) => {
        const response = await nurseVendorApi.post('/provider/nurse/dash/staff/assign', payload);
        return response.data;
    },
 
    // ADDED NEW API HERE
    getOrderHistory: async () => {
        const response = await nurseVendorApi.get('/provider/nurse/dash/orders/history');
        return response.data;
    },
 
    // ==========================================
    // CONSUMABLES SECTION
    // ==========================================
    searchConsumables: async (searchTerm) => {
        const response = await nurseVendorApi.get(`/provider/nurse/dash/consumables/search?search=${searchTerm}`);
        return response.data;
    },
 
};
 
export default NurseAPI;
 