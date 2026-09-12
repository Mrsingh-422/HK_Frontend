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
  // =========================================================================
// --- 👑 HEALTH KANGAROO COMPLETE SUBSCRIPTION & DYNAMIC PLAN APIS ---
// =========================================================================

// --- 1. DYNAMIC CATEGORY MANAGEMENT ---
// 1.1 Create Master Category (POST /admin/subscriptions/categories)
createSubscriptionCategory: (data) => 
    api.post('/admin/subscriptions/categories', data),

// 1.2 Get All Categories (GET /admin/subscriptions/categories)
getSubscriptionCategories: (params = {}) => 
    api.get('/admin/subscriptions/categories', { params }),

// 1.3 Update Category (PUT /admin/subscriptions/categories/:id)
updateSubscriptionCategory: (id, data) => 
    api.put(`/admin/subscriptions/categories/${id}`, data),

// 1.4 Delete Category (DELETE /admin/subscriptions/categories/:id)
deleteSubscriptionCategory: (id) => 
    api.delete(`/admin/subscriptions/categories/${id}`),


// --- 2. DYNAMIC DISEASE / CONDITION MANAGEMENT ---
// 2.1 Add Disease under Category (POST /admin/subscriptions/diseases)
createSubscriptionDisease: (data) => 
    api.post('/admin/subscriptions/diseases', data),

// 2.2 Get Diseases List (GET /admin/subscriptions/diseases)
getSubscriptionDiseases: (params = {}) => 
    api.get('/admin/subscriptions/diseases', { params }),

// 2.3 Update Disease (PUT /admin/subscriptions/diseases/:id)
updateSubscriptionDisease: (id, data) => 
    api.put(`/admin/subscriptions/diseases/${id}`, data),

// 2.4 Delete Disease (DELETE /admin/subscriptions/diseases/:id)
deleteSubscriptionDisease: (id) => 
    api.delete(`/admin/subscriptions/diseases/${id}`),


// --- 3. MASTER SUBSCRIPTION PLANS MANAGEMENT ---
// 3.1 Create Master Plan (POST /admin/subscriptions/plans/create)
createSubscriptionPlan: (data) => 
    api.post('/admin/subscriptions/plans/create', data),

// 3.2 Get All Plans with Active Subscriber Counters (GET /admin/subscriptions/plans)
getMasterSubscriptionPlans: (params = {}) => 
    api.get('/admin/subscriptions/plans', { params }),

// 3.3 Get Single Plan Details by ID (GET /admin/subscriptions/plans/:id)
getSingleSubscriptionPlan: (planId) => 
    api.get(`/admin/subscriptions/plans/${planId}`),

// 3.4 Update Master Plan (PUT /admin/subscriptions/plans/:id)
updateSubscriptionPlan: (planId, data) => 
    api.put(`/admin/subscriptions/plans/${planId}`, data),

// 3.5 Delete Master Plan (DELETE /admin/subscriptions/plans/:id)
deleteSubscriptionPlan: (planId) => 
    api.delete(`/admin/subscriptions/plans/${planId}`),


// --- 4. SUBSCRIBED USERS QUEUE & HISTORY ---
// 4.1 Get Subscribed Users List with KPIs (GET /admin/subscriptions/subscribers)
getSubscribedUsers: (params = {}) => 
    api.get('/admin/subscriptions/subscribers', { params }),

// 4.2 Get Single Subscriber Full Detail (GET /admin/subscriptions/subscribers/:id)
getSingleSubscriber: (subscriptionId) => 
    api.get(`/admin/subscriptions/subscribers/${subscriptionId}`),



 // 4.1 Get All Issues Table (GET /admin/issues)
  getIssuesList: (params = {}) => {
    return api.get('/admin/issues', { params });
  },

  // 4.2 Update Status & Add Resolution Note (PATCH /admin/issues/update-status/:id)
  updateIssueStatus: (issueId, data) => {
    return api.patch(`/admin/issues/update-status/${issueId}`, data);
  },

  // 4.3 Quick Resolve Issue (PATCH /admin/issues/resolve/:id)
  resolveIssue: (issueId) => {
    return api.patch(`/admin/issues/resolve/${issueId}`);
  },

  // 4.4 Delete Issue (DELETE /admin/issues/delete/:id)
  deleteIssue: (issueId) => {
    return api.delete(`/admin/issues/delete/${issueId}`);
  },
// =========================================================================
// --- 👩‍⚕️ NURSE SERVICES & PACKAGES MANAGEMENT APIS ---
// =========================================================================

// 4.1 Get All Nurse Services (Daily Care & Procedures)
getNurseServices: (params = {}) => {
    return api.get('/admin/nurse/services', { params });
},

// 4.2 Approve / Reject Nurse Service
updateNurseServiceStatus: (serviceId, data) => {
    return api.patch(`/admin/nurse/services/status/${serviceId}`, data);
},

// 5.1 Get All Nurse Standalone Packages (Bundles)
getNursePackages: (params = {}) => {
    return api.get('/admin/nurse/packages', { params });
},

// 5.2 Approve / Reject / Toggle Nurse Package Status
updateNursePackageStatus: (packageId, data) => {
    return api.patch(`/admin/nurse/packages/status/${packageId}`, data);
},
// =========================================================================
// --- 🌐 FOOTER & SOCIAL MEDIA LINKS APIS ---
// =========================================================================

// 1. Get Footer Data (GET /api/footer)
getFooterData: () => {
    return api.get('/api/footer');
},

// 2. Save / Update Footer Content & Social Links (POST /api/footer)
updateFooterData: (data) => {
    return api.post('/api/footer', data);
},
// =========================================================================
// --- 🔒 MAINTENANCE MODE APIS ---
// =========================================================================

/// =========================================================================
// --- 🔒 MAINTENANCE MODE APIS ---
// =========================================================================

// 1. Get Public Maintenance Status (Website/App Root Guard)
getMaintenanceStatus: () => {
    return api.get('/api/maintenance/status');
},

// 2. Get Admin Current Maintenance Settings (GET /api/admin/maintenance)
getMaintenanceSettings: () => {
    return api.get('/api/admin/maintenance');
},

// 3. Update Maintenance Settings & Hero Banner (POST /api/admin/maintenance)
updateMaintenanceSettings: (formData) => {
    return api.post('/api/admin/maintenance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
},

// 4. Helper to resolve full banner image URL
getMaintenanceMediaUrl: (path) => {
    const fallback = "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png";
    if (!path) return fallback;
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
},
};

export default AdminAPI2;
