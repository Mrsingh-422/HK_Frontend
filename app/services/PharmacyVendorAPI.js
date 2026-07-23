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
    // ==========================================
    // PHARMACY DASHBOARD STATS (NEW)
    // ==========================================
    getDashboardStats: async () => {
        try {
            const response = await pharmacyVendorApi.get('/provider/pharmacy/orders/dashboard-stats');
            return response.data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Failed to fetch dashboard stats" };
        }
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
        const response = await pharmacyVendorApi.post('/provider/pharmacy/inventory/request-add', payload);
        return response.data;
    },

    // --- PHARMACY ORDERS MANAGEMENT ---
    listPharmacyOrders: async () => {
        const response = await pharmacyVendorApi.get('/provider/pharmacy/orders/list');
        return response.data;
    },

    updatePharmacyOrderStatus: async (orderId, status) => {
        console.log(`Updating order ${orderId} to status: ${status}`);
        const response = await pharmacyVendorApi.patch(`/provider/pharmacy/orders/status/${orderId}`, { status });
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
      // 4. Reassign Driver (Fallback Recovery)
    reassignDriver: async (orderId, newDriverId) => {
        const response = await pharmacyVendorApi.post('/provider/pharmacy/orders/reassign', {
            orderId,
            newDriverId
        });
        return response.data;
    },

    // 5. Track All Pharmacy Drivers (NEW API ADDED)
    trackPharmacyDrivers: async () => {
        const response = await pharmacyVendorApi.get('/provider/pharmacy/orders/track-drivers');
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
    // Track the status of the submitted profile change request
    getPharmacyProfileUpdateStatus: async () => {
        const response = await pharmacyVendorApi.get('/provider/pharmacy/profile/update-status');
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
    },

    // --- PRESCRIPTION REQUESTS ---
    listPrescriptionRequests: async (status = '') => {
        const response = await pharmacyVendorApi.get('/provider/pharmacy/orders/prescription-request/list', {
            params: status ? { status } : {}
        });
        return response.data;
    },

    getPrescriptionRequestDetails: async (requestId) => {
        const response = await pharmacyVendorApi.get(`/provider/pharmacy/orders/prescription-request/details/${requestId}`);
        return response.data;
    },

    startPrescriptionReview: async (requestId) => {
        const response = await pharmacyVendorApi.post(`/provider/pharmacy/orders/prescription-request/start-review/${requestId}`);
        return response.data;
    },

    submitPrescriptionReview: async (requestId, payload) => {
        const response = await pharmacyVendorApi.post(`/provider/pharmacy/orders/prescription-request/review/${requestId}`, payload);
        return response.data;
    },

    rejectPrescriptionRequest: async (requestId, reason) => {
        const response = await pharmacyVendorApi.post(`/provider/pharmacy/orders/prescription-request/reject/${requestId}`, { reason });
        return response.data;
    },

    // ==========================================
    // --- PHARMACY COMBO OFFERS (BOGO) ---
    // ==========================================
    // Step A.3: Get list of campaigns

    // NEW Method for OTC lists used in Combo Deals
    getMyOtcInventory: async () => {
        const response = await pharmacyVendorApi.get('/provider/pharmacy/inventory/my-otc-list');
        return response.data;
    },

    listComboOffers: async () => {
        const response = await pharmacyVendorApi.get('/provider/pharmacy/combo-offers/my-offers');
        return response.data;
    },

    // Step A.2: Create with multipart file uploads
    createComboOffer: async (formData) => {
        const response = await pharmacyVendorApi.post('/provider/pharmacy/combo-offers', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Step A.4-B: Update Campaign with optional images
    updateComboOffer: async (offerId, formData) => {
        const response = await pharmacyVendorApi.put(`/provider/pharmacy/combo-offers/${offerId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Step A.4-A: Active/Pause Switch Status Toggle
    toggleComboOffer: async (offerId) => {
        const response = await pharmacyVendorApi.patch(`/provider/pharmacy/combo-offers/${offerId}/toggle`);
        return response.data;
    },

    // Step A.4-C: Delete Campaign
    deleteComboOffer: async (offerId) => {
        const response = await pharmacyVendorApi.delete(`/provider/pharmacy/combo-offers/${offerId}`);
        return response.data;
    },
    // ==========================================
    // CENTRALIZED WALLET & PAYOUT APIs (Added)
    // ==========================================

    /**
     * Fetch wallet stats (balances & mapped bank details)
     * GET /provider/wallet/stats
     */
    getWalletStats: async () => {
        try {
            const response = await pharmacyVendorApi.get('/provider/wallet/stats');
            return response.data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Failed to fetch wallet stats" };
        }
    },

    /**
     * Submit withdrawal request
     * POST /provider/wallet/withdraw
     */
    requestWithdrawal: async (amount) => {
        try {
            const response = await pharmacyVendorApi.post('/provider/wallet/withdraw', { amount });
            return response.data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Failed to submit withdrawal request" };
        }
    },

    /**
     * Fetch transaction history ledger logs
     * GET /provider/wallet/transactions
     */
    getWalletTransactions: async () => {
        try {
            const response = await pharmacyVendorApi.get('/provider/wallet/transactions');
            return response.data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Failed to fetch transaction logs" };
        }
    },

    updateBankDetails: async (bankData) => {
        try {
            // FIX: call the local Axios instance 'pharmacyVendorApi' directly instead of 'PharmacyVendorAPI'
            const response = await pharmacyVendorApi.patch('/provider/wallet/bank-details', bankData);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to update bank details"
            };
        }
    },
};

export default PharmacyVendorAPI;

