import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 1. Public Instance: For data accessible without login
const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Private (Authenticated) Instance: For user-specific/protected actions
const authApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach token to all private requests
authApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const UserAPI = {
    // ==========================================
    // PUBLIC METHODS (No Token Needed)
    // ==========================================

    getStandardTestCatalog: async () => {
        const response = await publicApi.get("/user/labs/standard-tests");
        return response.data;
    },
    getStandardPackageCatalog: async () => {
        const response = await publicApi.get("/user/labs/standard-packages");
        return response.data;
    },
    getLabsList: async (params) => {
        // params could include search, lat, long, etc.
        const response = await publicApi.get("/user/labs/list", { params });
        return response.data;
    },
    getLabDetails: async (labId) => {
        const response = await publicApi.get(`/user/labs/details/${labId}`);
        return response.data;
    },

    // ==========================================
    // PRIVATE METHODS (Token Required)
    // ==========================================

    // --- Profile ---
    getProfile: async () => {
        const response = await authApi.get("/api/auth/user/profile");
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await authApi.put("/api/auth/user/update", profileData);
        return response.data;
    },
    //Family Members of user 
    addFamilyMember: async (familyData) => {
        console.log(familyData.profilePic);
        const response = await authApi.post("/api/auth/user/add-family", familyData);
        return response.data;
    },
    getFamilyMembers: async () => {
        const response = await authApi.get("/api/auth/user/family-members");
        return response.data;
    },
    editFamilyMember: async (itemId, updateData) => {
        console.log(updateData.profilePic);
        const response = await authApi.put(`/api/auth/user/edit-family-member/${itemId}`, updateData);
        return response.data;
    },
    removeFamilyMember: async (itemId) => {
        const response = await authApi.delete(`/api/auth/user/remove-family-member/${itemId}`);
        return response.data;
    },
    getUserHealthInsuranses: async () => {
        const response = await authApi.get("/admin/user/insurance/insurance-list");
        return response.data;
    },
    updateInsurnceUser: async (insuranceData) => {
        const response = await authApi.put("/api/auth/user/update-insurance", insuranceData);
        return response.data;
    },
    updateWorkDetailsUser: async (workData) => {
        const response = await authApi.put("/api/auth/user/update-work", workData);
        return response.data;
    },
    getInsuranceTypes: async () => {
        const response = await authApi.get('/admin/user/insurance/insurance-types');
        return response.data; // Accessing the array: ["RGHS", "CGHS", ...]
    },


    // --- Master Details & Comparison ---
    getMasterTestDetails: async (id) => {
        const response = await authApi.get(`/user/labs/master-test/${id}`);
        return response.data;
    },
    getMasterPackageDetails: async (id) => {
        const response = await authApi.get(`/user/labs/master-package/${id}`);
        return response.data;
    },
    getLabsByMasterTest: async (masterTestId) => {
        const response = await authApi.get(`/user/labs/comparison/test/${masterTestId}`);
        return response.data;
    },
    getLabsByMasterPackage: async (masterPackageId) => {
        const response = await authApi.get(`/user/labs/comparison/package/${masterPackageId}`);
        return response.data;
    },
    getLabSlots: async (params) => {
        const response = await authApi.get("/user/labs/slots", { params });
        return response.data;
    },
    getLabDeliveryCharges: async (params) => {
        const response = await authApi.get("/user/labs/delivery-charges", { params });
        return response.data;
    },
    getAvailableCoupons: async () => {
        const response = await authApi.get("/user/labs/coupons");
        return response.data;
    },
    checkoutLabBooking: async (checkoutData) => {
        const response = await authApi.post("/user/labs/checkout", checkoutData);
        return response.data;
    },
    bookLabTest: async (bookingData) => {
        const response = await authApi.post("/user/labs/book", bookingData);
        return response.data;
    },
    uploadPrescription: async (formData) => {
        // formData should contain 'prescriptionImages'
        const response = await authApi.post("/user/labs/upload-prescription", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    confirmPrescriptionBooking: async (data) => {
        const response = await authApi.post("/user/labs/confirm-prescription", data);
        return response.data;
    },

    // --- Tracking & History ---
    getMyBookings: async () => {
        const response = await authApi.get("/user/labs/my-bookings");
        return response.data;
    },
    getBookingTrackingDetails: async (id) => {
        const response = await authApi.get(`/user/labs/details/${id}/track`);
        return response.data;
    },
    cancelBooking: async (id, reason) => {
        const response = await authApi.put(`/user/labs/cancel/${id}`, { reason });
        return response.data;
    },
    rateLabOrder: async (ratingData) => {
        const response = await authApi.post("/user/labs/rate", ratingData);
        return response.data;
    },

    // --- Cart Management ---
    getMyCart: async () => {
        const response = await authApi.get("/user/cart");
        return response.data;
    },

    addToCart: async (cartData) => {
        // cartData should contain testId/packageId, labId, etc.
        const response = await authApi.post("/user/cart/lab/add", cartData);
        return response.data;
    },

    clearCart: async () => {
        const response = await authApi.post("/user/cart/lab/clear");
        return response.data;
    },

    removeCartItem: async (itemId) => {
        const response = await authApi.delete(`/user/cart/item/${itemId}`);
        return response.data;
    },

    updateCartQuantity: async (updateData) => {
        // updateData usually contains itemId and new quantity
        const response = await authApi.put("/user/cart/quantity", updateData);
        return response.data;
    },




};

export default UserAPI;