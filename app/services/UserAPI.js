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
    getStandardPackageCatalog: async (params = {}) => {
        // params can include { page, limit, search, category }
        const response = await publicApi.get("/user/labs/standard-packages", { params });
        return response.data;
    },
    getLabsList: async (payload) => {
        // payload should be { lat, lng, search, etc. }
        const response = await publicApi.post("/user/labs/list", payload);
        return response.data;
    },
    getLabDetails: async (labId) => {
        const response = await publicApi.get(`/user/labs/details/${labId}`);
        return response.data;
    },
    getLabInventoryTests: async (labId, params) => {
        // params example: { page: 1, limit: 10 }
        const response = await publicApi.get(`/user/labs/${labId}/inventory-tests`, { params });
        return response.data;
    },
    searchLabInventoryTests: async (labId, payload) => {
        // payload example: { query: "Sugar" }
        const response = await publicApi.post(`/user/labs/${labId}/inventory-tests/search`, payload);
        return response.data;
    },
    getLabInventoryPackages: async (labId, params) => {
        // params example: { page: 1, limit: 10 }
        const response = await publicApi.get(`/user/labs/${labId}/inventory-packages`, { params });
        return response.data;
    },
    searchLabInventoryPackages: async (labId, payload) => {
        // payload example: { query: "Full Body" }
        const response = await publicApi.post(`/user/labs/${labId}/inventory-packages/search`, payload);
        return response.data;
    },

    //Medicine apis all 
    

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
    getAllergyList: async () => {
        const response = await authApi.get('/admin/medical-masters/allergies');
        return response.data; // Accessing the array of allergies
    },
    getConditionList: async () => {
        const response = await authApi.get('/admin/medical-masters/conditions');
        return response.data; // Accessing the array of conditions
    },
    getMajorConditions: async () => {
        const response = await authApi.get('/admin/medical-masters/major-conditions');
        return response.data; // Accessing the array of major conditions
    },
    updateConditionsAndAllergies: async (data) => {
        const response = await authApi.put("/api/auth/user/update-medical-conditions", data);
        return response.data;
    },
    verifyLockerPin: async (pin) => {
        const response = await authApi.post("/api/user/locker/verify-pin", { pin });
        return response.data;
    },
    getLockerContent: async (parentId = null) => {
        const url = parentId
            ? `/api/user/locker/content?parentId=${parentId}`
            : "/api/user/locker/content";
        const response = await authApi.get(url);
        return response.data;
    },
    createFolder: async (data) => {
        const response = await authApi.post("/api/user/locker/create-folder", data);
        return response.data;
    },
    uploadLockerFile: async (formData) => {
        // formData contains 'name', 'images', and optional 'parentId'
        const response = await authApi.post("/api/user/locker/upload-file", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    renameLockerItem: async (id, newName) => {
        const response = await authApi.patch(`/api/user/locker/rename/${id}`, { newName });
        return response.data;
    },
    deleteLockerItem: async (id) => {
        const response = await authApi.delete(`/api/user/locker/delete/${id}`);
        return response.data;
    },
    addPagesToRecord: async (id, formData) => {
        const response = await authApi.put(`/api/user/locker/add-pages/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    checkAbhaStatus: async () => {
        const response = await authApi.get(`/api/user/abha/details`);
        return response.data;
    },
    abhaGenerateOtp: async (aadhaarNumber) => {
        const response = await authApi.post(`/api/user/abha/step3-generate-otp`, {
            aadhaarNumber,
            consent: true
        });
        return response.data;
    },
    abhaVerifyOtp: async (otp, txnId) => {
        const response = await authApi.post(`/api/user/abha/step4-verify-otp`, { otp, txnId });
        return response.data;
    },
    abhaFinalize: async (txnId) => {
        const response = await authApi.post(`/api/user/abha/step5-finalize`, { txnId });
        return response.data;
    },
    addEmergencyContact: async (data) => {
        const response = await authApi.post("/api/auth/user/add-emergency", data);
        return response.data;
    },
    getEmergencyContacts: async () => {
        const response = await authApi.get("/api/auth/user/emergency-contacts");
        return response.data;
    },
    deleteEmergencyContact: async (contactId) => {
        const response = await authApi.delete(`/api/auth/user/remove-emergency/${contactId}`);
        return response.data;
    },
    addUserAddress: async (data) => {
        const response = await authApi.post("/api/auth/user/add-address", data);
        return response.data;
    },
    getUserAddresses: async () => {
        const response = await authApi.get("/api/auth/user/addresses");
        return response.data;
    },
    setDefaultAddress: async (addressId) => {
        const response = await authApi.patch(`/api/auth/user/set-default-address/${addressId}`);
        return response.data;
    },
    deleteAddress: async (addressId) => {
        const response = await authApi.delete(`/api/auth/user/remove-address/${addressId}`);
        return response.data;
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