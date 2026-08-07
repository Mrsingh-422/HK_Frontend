import axios from 'axios';
 
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
 
/**
* TOKEN HELPERS
*/
const getLabToken = () => localStorage.getItem('labToken');
 
const getAnyToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('labToken') 
               ;
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

    // Track the status of submitted staged lab profile changes
    getLabProfileUpdateStatus: async () => {
        const response = await labVendorApi.get('/provider/labs/profile/update-status');
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
    // ORDER MANAGEMENT (UPDATED WITH PRIORITY FILTER)
    // ==========================================

      getOrderHistory: async (page = 1) => {
        const response = await labVendorApi.get('/provider/labs/order-history', {
            params: { page }
        });
        return response.data;
    },

    getOrders: async (status, isPriority = null) => {
        const params = { status: status === 'Approved' ? 'Confirmed' : status };
        
        // Append priority flags to order filtering queries
        if (isPriority !== null) {
            params.isPriority = String(isPriority);
        }
 
        const response = await labVendorApi.get('/provider/labs/orders', { params });
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
    // CENTRALIZED WALLET & PAYOUT APIs (Added)
    // ==========================================
    
    /**
     * Fetch wallet balances & dynamic registered bank settings
     * GET /provider/wallet/stats
     */
    getWalletStats: async () => {
        const response = await labVendorApi.get('/provider/wallet/stats');
        return response.data;
    },
 
    /**
     * Submit manual payout ticket request
     * POST /provider/wallet/withdraw
     */
    requestWithdrawal: async (amount) => {
        const response = await labVendorApi.post('/provider/wallet/withdraw', { amount });
        return response.data;
    },
 
    /**
     * Fetch transaction history logs
     * GET /provider/wallet/transactions
     */
    getWalletTransactions: async () => {
        const response = await labVendorApi.get('/provider/wallet/transactions');
        return response.data;
    },
     // NEW METHOD: UPDATE HOSPITAL BANK SETTLEMENT DETAILS (JSON PAYLOAD)
  updateBankDetails: async (bankData) => {
    try {
      const response = await labVendorApi.patch('/provider/wallet/bank-details', bankData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update bank details"
      };
    }
  },
  // ==========================================
    // SMART LIMS REPORT & TEMPLATE API (UPDATED)
    // ==========================================
    getDropdownTemplates: async (search = '') => {
        const response = await labVendorApi.get('/provider/labs/report-templates/dropdown', {
            params: search ? { search } : {}
        });
        return response.data;
    },

    getTemplateParameters: async (testNames) => {
        const response = await labVendorApi.get('/provider/labs/report-templates', {
            params: { testNames }
        });
        return response.data;
    },

    getBookingTemplates: async (orderId) => {
        const response = await labVendorApi.get(`/provider/labs/report-templates/booking/${orderId}`);
        return response.data;
    },

    saveDraftReport: async (orderId, patientId, testValues) => {
        const response = await labVendorApi.post(`/provider/labs/save-draft/${orderId}`, { 
            patientId, 
            testValues 
        });
        return response.data;
    },

    getDraftReport: async (orderId, patientId) => {
        const response = await labVendorApi.get(`/provider/labs/get-draft/${orderId}`, {
            params: { patientId }
        });
        return response.data;
    },

    getReportData: async (orderId, patientId) => {
        const response = await labVendorApi.get(`/provider/labs/get-report-data/${orderId}`, {
            params: { patientId }
        });
        return response.data;
    },

    uploadClientPdf: async (orderId, formData) => {
        const response = await labVendorApi.post(`/provider/labs/upload-client-pdf/${orderId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    generateBrandedReport: async (orderId, patientId, testValues) => {
        const response = await labVendorApi.post(`/provider/labs/generate-report/${orderId}`, { 
            patientId, 
            testValues 
        });
        return response.data;
    },
    // ==========================================
    // PHLEBOTOMIST (DRIVER) TRACKING SECTION
    // ==========================================
    
    /**
     * Fetch available/online phlebotomists list for staff assignment
     * GET /provider/labs/available-phlebotomists
     */
    getAvailablePhlebotomists: async () => {
        const response = await labVendorApi.get('/provider/labs/available-phlebotomists');
        return response.data;
    },

    /**
     * Reassign an active booking to a different phlebotomist
     * PATCH /provider/labs/reassign-staff/:orderId
     */
    reassignPhlebotomist: async (orderId, newPhlebotomistId) => {
        const response = await labVendorApi.patch(`/provider/labs/reassign-staff/${orderId}`, {
            newPhlebotomistId
        });
        return response.data;
    },

    /**
     * Retrieve visual timeline progress, phlebotomist location, and patient details
     * GET /provider/labs/booking-tracking/:orderId
     */
    getBookingTrackingDetails: async (orderId) => {
        const response = await labVendorApi.get(`/provider/labs/booking-tracking/${orderId}`);
        return response.data;
    },
    
    /**
     * Retrieve active booking/timeline status and profile of a phlebotomist
     * GET /provider/labs/phlebotomist-detail/:phlebotomistId
     */
    getPhlebotomistDetails: async (phlebotomistId) => {
        const response = await labVendorApi.get(`/provider/labs/phlebotomist-detail/${phlebotomistId}`);
        return response.data;
    },
      // ==========================================
    // SECTION B: LAB PROVIDER ENDPOINTS (NEW)
    // ==========================================
    getIncomingRequestsList: async (status = '') => {
        const response = await labVendorApi.get('/provider/labs/prescription-request/list', {
            params: status ? { status } : {}
        });
        return response.data;
    },

    getProviderRequestDetails: async (requestId) => {
        const response = await labVendorApi.get(`/provider/labs/prescription-request/details/${requestId}`);
        return response.data;
    },

    startPrescriptionReview: async (requestId) => {
        const response = await labVendorApi.post(`/provider/labs/prescription-request/start-review/${requestId}`);
        return response.data;
    },

    submitReviewAndBill: async (requestId, billingData) => {
        const response = await labVendorApi.post(`/provider/labs/prescription-request/review/${requestId}`, billingData);
        return response.data;
    },

    rejectPrescriptionRequest: async (requestId, reason) => {
        const response = await labVendorApi.post(`/provider/labs/prescription-request/reject/${requestId}`, { reason });
        return response.data;
    },
  /**
     * Traditional Change Password (Logged in session required)
     */
   changePassword: async ({ oldPassword, newPassword }) => {
    try {
        const response = await labVendorApi.patch('/provider/labs/profile/change-password', {
            oldPassword,
            newPassword,
        });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
},

    /**
     * Email-Based OTP Reset Flow - Step 1: Send OTP to Email
     * Route: POST /api/password/forgot-password
     */
    forgotPassword: async (email) => {
        try {
            const response = await labVendorApi.post('/api/password/forgot-password', {
                email,
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    /**
     * Email-Based OTP Reset Flow - Step 2: Verify Email OTP Code
     * Route: POST /api/password/verify-otp
     */
    verifyOtp: async (email, otp) => {
        try {
            const response = await labVendorApi.post('/api/password/verify-otp', {
                email,
                otp,
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    /**
     * Email-Based OTP Reset Flow - Step 3: Set New Password
     * Route: POST /api/password/reset-password
     */
    resetPassword: async ({ email, newPassword, confirmPassword }) => {
        try {
            const response = await labVendorApi.post('/api/password/reset-password', {
                email,
                newPassword,
                confirmPassword,
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    /**
     * Mobile SMS (Firebase OTP) Reset Flow - Step 1: Verify Phone Number Exists
     * Route: POST /api/password/forgot-password-phone
     */
    verifyForgotPasswordPhone: async (phone) => {
        try {
            const response = await labVendorApi.post('/api/password/forgot-password-phone', {
                phone,
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // In LabVendorAPI.js - update verifyFirebaseOtp
verifyFirebaseOtp: async ({ phone, idToken, selectedRole }) => {
    try {
        const response = await labVendorApi.post('/api/password/verify-firebase-otp', {
            phone,
            idToken,
            selectedRole, // ✅ Add this
        });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
},

// Update resetPasswordPhone
resetPasswordPhone: async ({ phone, resetToken, selectedRole, newPassword, confirmPassword }) => {
    try {
        const response = await labVendorApi.post('/api/password/reset-password-phone', {
            phone,
            resetToken,
            selectedRole, // ✅ Add this
            newPassword,
            confirmPassword,
        });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
},
};
 
export default LabVendorAPI;
 