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

 // =========================================================================
    // --- ADMIN CONTROL CENTER: AMBULANCE BREAKDOWNS & FLEET MANAGEMENT ---
    // =========================================================================

    // 1. Live Fleet Command Map (GET /admin/ambulance/live-fleet)
    getAmbulanceLiveFleet: () => 
        api.get('/admin/ambulance/live-fleet'),

    // 2. Force Re-Assign Ambulance for Breakdowns (PATCH /admin/ambulance/reassign-booking/:bookingId)
    reassignAmbulanceBooking: (bookingId, data) => 
        api.patch(`/admin/ambulance/reassign-booking/${bookingId}`, data),

    // 3. 108 Emergency Call Manual Dispatch (POST /admin/ambulance/dispatch-call)
    dispatchEmergencyCall: (data) => 
        api.post('/admin/ambulance/dispatch-call', data),
 // --- BANNED USERS & UNBAN REQUESTS (NEW) ---
    // 1. Fetch Banned Users
    getBannedUsers: (page = 1, limit = 10) => 
        api.get(`/admin/users/banned-users?page=${page}&limit=${limit}`),

    // 2. Direct Unban User
    unbanUser: (userId, data = {}) => 
        api.patch(`/admin/users/unban/${userId}`, data),

    // 3. Fetch Unban Requests (Pending / Approved / Rejected)
    getUnbanRequests: (status = 'Pending', page = 1, limit = 10) => 
        api.get(`/admin/users/unban-requests?status=${status}&page=${page}&limit=${limit}`),

    // 4. Approve / Reject Unban Request
    reviewUnbanRequest: (requestId, data) => 
        api.patch(`/admin/users/unban-requests/${requestId}`, data),
// =========================================================================
    // --- ADMIN COMMISSION & WALLET REVENUE MANAGEMENT ---
    // =========================================================================

    // 1. Commission Cutoffs
    getCommissionConfigs: () => 
        api.get('/api/admin/commission-config'),

    updateCommissionConfig: (data) => 
        api.post('/api/admin/commission-config/update', data),

    // 2. Cancellation Policy
    updateCancellationPolicy: (data) => 
        api.post('/api/admin/policy-config/cancellation', data),

    // 3. Admin Global Wallet & Revenue Dashboard Stats
    getWalletDashboardStats: () => 
        api.get('/api/admin/wallet/dashboard-stats'),

    // 4. Payout Approvals & Rejections
    approveWithdrawal: (requestId, data) => 
        api.patch(`/api/admin/wallet/approve-withdrawal/${requestId}`, data),

    rejectWithdrawal: (requestId, data) => 
        api.patch(`/api/admin/wallet/reject-withdrawal/${requestId}`, data),

    // 5. Vendor Bank Account Verification
    verifyVendorBankAccount: (vendorModel, vendorId, data) => 
        api.patch(`/api/admin/wallet/verify-bank/${vendorModel}/${vendorId}`, data),

   // =========================================================================
    // --- OTP RATE LIMITS & SECURITY GOVERNANCE ---
    // =========================================================================
    
    // 1. Live Blocked Numbers & Emails List
    getBlockedOtpList: (params = {}) => {
        const { page = 1, limit = 20, search = '', otpType = 'All' } = params;
        return api.get(`/api/admin/otp-limits/blocked-list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&otpType=${encodeURIComponent(otpType)}`);
    },

    // 2. Dynamic OTP Limit Configs & 24h Stats
    getOtpLimitsAndStats: () => 
        api.get('/api/admin/otp-limits'),

    // 3. 1-Click Unblock / Reset Identifier
    resetOtpIdentifier: (identifier, otpType = 'All') => 
        api.post('/api/admin/otp-limits/reset-identifier', { identifier, otpType }),

    // 4. Update Dynamic OTP Limit Rule
    updateOtpLimit: (data) => 
        api.post('/api/admin/otp-limits/update', data),

     // =========================================================================
    // --- VENDOR WITHDRAWALS & BANK VERIFICATION APIS ---
    // =========================================================================

    // API 1: Get All Pending Withdrawal Requests
    getPendingWithdrawals: () => 
        api.get('/api/admin/wallet/pending-withdrawals'),

    // API 2: Approve Withdrawal (With Bank UTR Reference)
    approveWithdrawal: (requestId, data) => 
        api.patch(`/api/admin/wallet/approve-withdrawal/${requestId}`, data),

    // API 3: Reject Withdrawal (With Auto-Refund to Vendor Wallet)
    rejectWithdrawal: (requestId, data) => 
        api.patch(`/api/admin/wallet/reject-withdrawal/${requestId}`, data),

    // API 4: Get All Pending Bank Account Verifications
    getPendingBanks: () => 
        api.get('/api/admin/wallet/pending-banks'),

    // API 5: Verify / Unverify Vendor Bank Account
    verifyVendorBankAccount: (vendorModel, vendorId, data) => 
        api.patch(`/api/admin/wallet/verify-bank/${vendorModel}/${vendorId}`, data),

    // API 6: Global Platform Financial Monitor & Liability Stats
    getWalletDashboardStats: () => 
        api.get('/api/admin/wallet/dashboard-stats'),
};

export default AdminAPI2;
