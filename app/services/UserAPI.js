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
    getAllCoupons: async () => {
        const response = await publicApi.get('/user/homepage/coupons')
        return response.data
    },

    // General Search Suggestions (autocomplete)
    getGlobalSearchSuggestions: async (query, type = "") => {
        const response = await publicApi.get("/user/homepage/suggestions", {
            params: {
                query,
                ...(type && { type }) // optional filter
            }
        });
        return response.data;
    },

    getNonPrescriptionProducts: async (category, page = 1, limit = 10) => {
        const response = await authApi.get("/user/pharmacy/non-prescription-list", {
            params: { category, page, limit }
        }
        );

        return response.data;
    },

    superSavingProducts: async (page = 1, limit = 10) => {
        const response = await authApi.get("/user/pharmacy/highest-discount-medicines", {
            params: { page, limit }
        });
        return response.data;
    },

    getWomensPackages: async () => {
        const response = await publicApi.get("/user/labs/standard-packages/female");
        return response.data;
    },
    getWomensTests: async () => {
        const response = await publicApi.get("/user/labs/standard-tests/female");
        return response.data;
    },

    getStandardTestCatalog: async () => {
        const response = await publicApi.get("/user/labs/standard-tests");
        return response.data;
    },
    getStandardPackageCatalog: async (params = {}) => {
        // params can include { page, limit, search, category }
        const response = await publicApi.get("/user/labs/standard-packages", { params });
        return response.data;
    },
    getSinglePackageDetails: async (packageId, userCoords) => {
        // We use .post because we are sending the userCoords in the request body
        const response = await publicApi.post(`/user/labs/standard-packages/details/${packageId}`, {
            userCoords: userCoords // Sending the lat/lng object here
        });
        return response.data;
    },
    getSingleTestDetails: async (testId, userCoords) => {
        // We use .post because we are sending the userCoords in the request body
        const response = await publicApi.post(`/user/labs/standard-tests/details/${testId}`, {
            userCoords: userCoords // Sending the lat/lng object here
        });
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
    // getFemalePackages: async () => {
    //     const response = await publicApi.get("/user/labs/standard-packages/female");
    //     return response.data;
    // },
    // getFemaleTests: async () => {
    //     const response = await publicApi.get("/user/labs/standard-tests/female");
    //     return response.data;
    // },
    checkoutLab: async (checkoutData) => {
        /**
         * Expected checkoutData object:
         * {
         *   appointmentDate: "YYYY-MM-DD",
         *   appointmentTime: "10:00 AM",
         *   selectedPatientIds: ["id1", "id2"],
         *   collectionType: "Home Collection" | "Visit Lab",
         *   isRapid: boolean,
         *   couponCode: string | null,
         *   address: { ... },
         *   paymentMethod: "COD"
         * }
         */
        const response = await authApi.post("/user/labs/checkout", checkoutData);
        return response.data;
    },
    // 8. Get service/delivery charges (Fixed fee, Express fee, etc.)
    getDeliveryCharges: async () => {
        const response = await authApi.get("/user/labs/delivery-charges");
        return response.data;
    },

    // Add these to your UserAPI object
    getLabsList: async (payload) => {
        // payload: { lat, lng, search, city, state, country }
        const response = await publicApi.post("/user/labs/list", payload);
        return response.data;
    },
    getCitySuggestions: async (query) => {
        const response = await publicApi.get(`/user/labs/suggestions?query=${query}`);
        return response.data;
    },
    getLabNameSuggestions: async (query) => {
        const response = await publicApi.get(`/user/labs/lab-suggestions?query=${query}`);
        return response.data;
    },

    //Lab Prescription Upload 
    scanLabPrescription: async (formData) => {
        const response = await authApi.post("/user/labs/scan-rx", formData, {
            headers: {
                "Content-Type": 'multipart/form-data',
            }
        })
        return response;
    },
    estimateLabPrices: async (formData) => {
        const response = await authApi.post("/user/labs/prescription-request/estimate-prices", formData, {
            headers: {
                "Content-Type": 'multipart/form-data',
            }
        })
        return response;
    },

    submitLabPrescriptionRequest: async (formData) => {
        const response = await authApi.post("/user/labs/prescription-request", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    getLabPrescriptionRequests: async () => {
        const response = await authApi.get("/user/labs/prescription-request/list")
        return response.data
    },
    initializeLabPrescriptionPayment: async (formData) => {
        const response = await authApi.post("/user/labs/prescription-request/pay-confirm", formData)
        return response.data
    },
    verifyLabPrescriptionPayment: async (paymentData) => {
        const response = await authApi.post("/user/labs/prescription-request/verify-payment", paymentData)
        return response.data
    },

    //Pharmacy apis all 
    getAllPharmacies: async (payload) => {
        // payload should be { lat, lng, search, etc. }
        const response = await publicApi.post("/user/pharmacy/list", payload);
        return response.data;
    },
    getPharmacyDetails: async (pharmacyId) => {
        const response = await publicApi.get(`/user/pharmacy/details/${pharmacyId}`);
        return response.data;
    },
    getPharmacyCitySuggestions: async (query) => {
        const response = await publicApi.get(`/user/pharmacy/search-suggestions?query=${query}`);
        return response.data;
    },
    getPharmacyNameSuggestions: async (query) => {
        const response = await publicApi.get(`/user/pharmacy/pharmacy-suggestions?query=${query}`);
        return response.data;
    },
    getPharmacyProductsAll: async (params) => {
        // params example: { page: 1, limit: 10 }
        const response = await publicApi.get(`/user/pharmacy/standard-list`, { params });
        return response.data;
    },

    getFreshNewArrivals: async (params) => {
        // params example: { page: 1, limit: 10 }
        const response = await publicApi.get(`/user/pharmacy/latest-added-medicines`, { params });
        return response.data;
    },
    pharmacyProductDetail: async (productId, params) => {
        // vendorId example: "69df18ad0cf05769b93d6761"
        // params example: { lat: 30.7333, lng: 76.7233 }
        const response = await publicApi.get(`/user/pharmacy/medicine-details/${productId}`, { params });
        return response.data;
    },
    getSinglePharmacyMedicines: async (pharmacyId, params) => {
        // params example: { page: 1, limit: 10 }
        const response = await publicApi.get(`/user/medicine/pharmacies/${pharmacyId}`, { params });
        return response.data;
    },
    getPharmacyCategories: async () => {
        const response = await publicApi.get(`/user/pharmacy/categories`);
        return response.data;
    },
    getPharmacySlots: async (pharmacyId, date) => {
        const response = await authApi.get("/user/pharmacy/slots", {
            params: {
                pharmacyId,
                date // This will be sent as ?pharmacyId=...&date=YYYY-MM-DD
            }
        });
        return response.data;
    },
    // getTrendingMedicines: async (data) => {
    //     const response = await publicApi.post(`/user/pharmacy/trending-medicines`, data);
    //     return response.data;
    // },
    searchMedicineSuggestions: async (data) => {
        const response = await publicApi.post(
            `/user/pharmacy/search-suggestions`,
            data
        );
        return response.data;
    },
    addPharmacyToCart: async (cartData) => {
        // cartData should contain productId, pharmacyId, quantity, etc.
        const response = await authApi.post("/user/cart/pharmacy/add", cartData);
        return response.data;
    },
    updatePharmacyCartQuantity: async (updateData) => {
        // updateData usually contains itemId and new quantity
        const response = await authApi.put("/user/cart/pharmacy/quantity", updateData);
        return response.data;
    },

    getProductsByCategory: async (category) => {
        const response = await authApi.get("/user/pharmacy/category-details", {
            params: { category },
        });
        return response.data;
    },

    //Pharmacy Prescription Upload
    scanPrescription: async (formData) => {
        const response = await authApi.post("/user/pharmacy/scan-rx", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    createPrescriptionRequest: async (formData) => {
        const response = await authApi.post("/user/pharmacy/prescription-request", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
        );
        return response.data;
    },

    getAllPrescriptionRequests: async (page = 1, limit = 10) => {
        const response = await authApi.get("/user/pharmacy/prescription-request/list", {
            params: { page, limit },
        });
        return response.data;
    },

    getAllMedicineCategories: async () => {
        const response = await publicApi.get("/user/pharmacy/categories");
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
        const response = await authApi.put("/api/auth/user/update", profileData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
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
    // --- 1. Security & PIN Management ---

    // GET /api/user/locker/pin-status
    getLockerPinStatus: async () => {
        const response = await authApi.get("/api/user/locker/pin-status");
        return response.data;
    },

    // POST /api/user/locker/setup-pin
    setupLockerPin: async (pin) => {
        const response = await authApi.post("/api/user/locker/setup-pin", { pin });
        return response.data;
    },

    // POST /api/user/locker/verify-pin
    verifyLockerPin: async (pin) => {
        const response = await authApi.post("/api/user/locker/verify-pin", { pin });
        return response.data;
    },

    // PATCH /api/user/locker/change-pin
    changeLockerPin: async (oldPin, newPin) => {
        const response = await authApi.patch("/api/user/locker/change-pin", { oldPin, newPin });
        return response.data;
    },

    // PATCH /api/user/locker/reset-pin
    resetLockerPin: async (password, newPin) => {
        const response = await authApi.patch("/api/user/locker/reset-pin", { password, newPin });
        return response.data;
    },


    // --- 2. Directory & Navigation ---

    // GET /api/user/locker/content
    getLockerContent: async (parentId = null) => {
        const url = parentId
            ? `/api/user/locker/content?parentId=${parentId}`
            : "/api/user/locker/content";
        const response = await authApi.get(url);
        return response.data;
    },

    // GET /api/user/locker/folder-path/:folderId (Breadcrumbs)
    getFolderPath: async (folderId) => {
        const response = await authApi.get(`/api/user/locker/folder-path/${folderId}`);
        return response.data;
    },

    // GET /api/user/locker/details/:id
    getLockerItemDetails: async (id) => {
        const response = await authApi.get(`/api/user/locker/details/${id}`);
        return response.data;
    },


    // --- 3. Write & Upload Actions ---

    // POST /api/user/locker/create-folder
    createFolder: async (data) => {
        const response = await authApi.post("/api/user/locker/create-folder", data);
        return response.data;
    },

    // POST /api/user/locker/upload-file
    uploadLockerFile: async (formData) => {
        // Expects title, parentId, doctorName, notes, date, and images array
        const response = await authApi.post("/api/user/locker/upload-file", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    // --- 4. Modifications & Edits ---
    // PATCH /api/user/locker/rename/:id
    renameLockerItem: async (id, newName) => {
        const response = await authApi.patch(`/api/user/locker/rename/${id}`, { newName });
        return response.data;
    },
    // PATCH /api/user/locker/move
    moveLockerItem: async (itemId, targetParentId) => {
        const response = await authApi.patch("/api/user/locker/move", { itemId, targetParentId });
        return response.data;
    },
    // PUT /api/user/locker/add-pages/:id
    addPagesToRecord: async (id, formData) => {
        const response = await authApi.put(`/api/user/locker/add-pages/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    // PATCH /api/user/locker/delete-page
    deleteLockerPage: async (fileId, imageUrl) => {
        const response = await authApi.patch("/api/user/locker/delete-page", { fileId, imageUrl });
        return response.data;
    },
    // GET /api/user/locker/search?query=...
    searchLocker: async (query) => {
        const response = await authApi.get(`/api/user/locker/search?query=${query}`);
        return response.data;
    },
    // --- 5. Deletion ---
    // DELETE /api/user/locker/delete/:id
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
    getCouponsForCart: async () => {
        const response = await authApi.get(`/user/labs/coupons`);
        return response.data;
    },
    validateCouponCart: async (couponName, labId, totalAmount) => {
        const response = await authApi.post(`/user/labs/validate-coupon`, { couponName, labId, totalAmount });
        return response.data;
    },
    getLabSlots: async (labId, date) => {
        const response = await authApi.get("/user/labs/slots", {
            params: { labId, date }
        });
        return response.data;
    },
    getLabDeliveryCharges: async (params) => {
        const response = await authApi.get("/user/labs/delivery-charges", { params });
        return response.data;
    },


    getPharmacyDeliveryCharges: async (params) => {
        const response = await authApi.get("/user/pharmacy/delivery-charges", { params });
        return response.data;
    },
    getAvailableCoupons: async () => {
        const response = await authApi.get("/user/labs/coupons");
        return response.data;
    },
    getPharmacyCoupons: async () => {
        const response = await authApi.get("/user/pharmacy/available-coupons");
        return response.data;
    },
    validatePharmacyCoupon: async (couponName, pharmacyId, totalAmount) => {
        const response = await authApi.post(`/user/pharmacy/validate-coupon`, { couponName, pharmacyId, totalAmount });
        return response.data;
    },

    getPharmacyOrders: async (page = 1, limit = 10) => {
        const response = await authApi.get("/user/pharmacy/order-history", {
            params: { page, limit }
        });
        return response.data;
    },

    checkoutLabBooking: async (checkoutData) => {
        const response = await authApi.post("/user/labs/checkout", checkoutData);
        return response.data;
    },
    checkoutPharmacyOrder: async (checkoutData) => {
        const response = await authApi.post("/user/pharmacy/checkout", checkoutData);
        return response.data;
    },
    placePharmacyOrder: async (orderData) => {

        const response = await authApi.post("/user/pharmacy/place-order", orderData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
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

    uploadNursePrescription: async (formData) => {
        // formData should contain 'prescriptionImages'
        const response = await authApi.post("/user/nurse/prescription/upload", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    broadcastNurseRequest: async (data) => {
        const response = await authApi.post("/user/nurse/prescription/broadcast", data);
        return response.data;
    },
    getNurseProposals: async () => {
        const response = await authApi.get("/user/nurse/prescription/history");
        return response.data;
    },
    viewNurseProposalDetail: async (id) => {
        const response = await authApi.get(`/user/nurse/prescription/proposals/${id}`);
        return response.data;
    },
    acceptNurseProposal: async (data) => {
        const response = await authApi.post(`/user/nurse/prescription/accept`, data);
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


    updateCartQuantity: async (updateData) => {
        // updateData usually contains itemId and new quantity
        const response = await authApi.put("/user/cart/quantity", updateData);
        return response.data;
    },
    removeCartItem: async (itemId) => {
        const response = await authApi.delete(`/user/cart/item/${itemId}`);
        return response.data;
    },
    removePharmacyItem: async (itemId) => {
        const response = await authApi.delete(`/user/cart/pharmacy/item/${itemId}`);
        return response.data;
    },
    checkoutLabCart: async (checkoutData) => {
        const response = await authApi.post("/user/labs/checkout", checkoutData);
        return response.data;
    },

    getLabBookings: async (page = 1, limit = 10) => {
        const response = await authApi.get("/user/labs/my-bookings", {
            params: { page, limit }
        });
        return response.data;
    },




    // Nurse api 
    getNurseServices: async (coords) => {
        const response = await publicApi.post("/user/nurse/list", coords);
        return response.data;
    },
    nurseServiceDetail: async (id) => {
        const response = await publicApi.get(`/user/nurse/details/${id}`);
        return response.data;
    },
    getNurseSlots: async (nurseId, query) => {
        // query: ?serviceId=..&packageId=..&isPackage=true&type=Hourly
        const response = await publicApi.get(`/user/nurse/availability/${nurseId}?${query}`);
        return response.data;
    },
    createNurseBooking: async (payload) => {
        const response = await authApi.post("/user/nurse/checkout", payload);
        return response.data;
    },
    processBooking: async (payload) => {
        const response = await authApi.post("/user/nurse/book", payload);
        return response.data;
    },
    getNurseCoupon: async (id) => {
        const response = await authApi.get(`user/nurse/coupons/${id}`);
        return response.data;
    },

    validateNurseCoupon: async (data) => {
        // data = { couponCode, nurseId, totalAmount }
        const response = await authApi.post("user/nurse/validate-coupon", data); // Replace with your actual endpoint 
        return response.data;
    },

    nurseDeliveryConfig: async (id) => {
        const response = await authApi.get(`user/nurse/delivery-config/${id}`);
        return response.data
    },

    nurseFinalBooking: async (data) => {
        const response = await authApi.post(`/user/nurse/book`, data);
        return response.data
    },

    getNursingBookings: async () => {
        const response = await authApi.get("/user/nurse/my-appointments");
        return response.data
    },


    //Doctor apis

    getDoctorSpecializations: async () => {
        const response = await publicApi.get("/user/doctors/specializations");
        return response.data;
    },
    getDoctorsList: async (data) => {
        const response = await publicApi.post("/user/doctors/list", data);
        return response.data;
    },
    getDoctorDetail: async (doctorId) => {
        const response = await publicApi.get(`/user/doctors/details/${doctorId}`);
        return response.data;
    },
    getDoctorAvailability: async (doctorId, date) => {
        const response = await authApi.get(`/user/doctors/slots/${doctorId}?date=${date}`);
        return response.data;
    },
    getDoctorCoupons: async (doctorId) => {
        const response = await authApi.get(`/user/doctors/coupons/${doctorId}`);
        return response.data;
    },
    validateDoctorCoupon: async (data) => {
        // data = { couponCode, doctorId, totalAmount }
        const response = await authApi.post("/user/nurse/validate-coupon", data); // Replace with your actual 
        return response.data;
    },
    getDoctorVisitCharges: async (doctorId) => {
        const response = await publicApi.get(`/user/doctors/visit-charges/${doctorId}`
        );
        return response.data;
    },
    doctorCheckoutSummary: async (data) => {
        const response = await authApi.post("/user/doctors/checkout-summary", data);
        return response.data
    },
    getHospitalCheckoutSummary: async (data) => {
        const response = await authApi.post("/user/hospital/checkout-summary", data);
        return response.data
    },

    bookDoctorAppointment: async (data) => {
        const response = await authApi.post("/user/doctors/book", data);
        return response.data
    },

    getMyDoctorAppointments: async () => {
        const response = await authApi.get("/user/doctors/my-appointments");
        return response.data;
    },

    rescheduleDoctorAppointment: async (data) => {
        const response = await authApi.post(`/user/doctors/reschedule/`, data);
        return response.data;
    },

    cancelDoctorAppointment: async (appointmentId, reason) => {
        const response = await authApi.patch(`/user/doctors/cancel/${appointmentId}`, { reason });
        return response.data;
    },

    //Hospital apis
    getHospitalsList: async (data) => {
        const response = await publicApi.post("/user/hospital/list", data);
        return response.data;
    },
    getHospitalDetail: async (hospitalId) => {
        const response = await publicApi.get(`/user/hospital/details/${hospitalId}`);
        return response.data;
    },

    checkBedAvalability: async (data) => {
        const response = await authApi.post("/user/hospital/check-availability", data);
        return response.data;
    },

    getHospitalDoctors: async (hospitalId) => {
        const response = await authApi.get(`/user/hospital/doctors/${hospitalId}`);
        return response.data;
    },
    getHospitalServices: async (hospitalId) => {
        const response = await authApi.get(`/user/hospital/services/${hospitalId}`);
        return response.data;
    },
    getHospitalCoupons: async (hospitalId) => {
        const response = await authApi.get(`/user/hospital/coupons/${hospitalId}`);
        return response.data;
    },
    validateHospitalCoupon: async (data) => {
        // data = { couponCode, hospitalId, subtotal }
        const response = await authApi.post("/user/hospital/validate-coupon", data); // Replace with your actual endpoint 
        return response.data;
    },

    bookHospitalBed: async (data) => {
        const response = await authApi.post("/user/hospital/book", data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getMyHospitalBookings: async () => {
        const response = await authApi.get("/user/hospital/my-bookings");
        return response.data;
    },
    recheduleHospitalBooking: async (data) => {
        const response = await authApi.post(`/user/hospital/reschedule`, data);
        return response.data;
    },

    //Pending to show how many times user can reschedule and cancel
    cancelHospitalBooking: async (appointmentId, reason) => {
        const response = await authApi.patch(`/user/hospital/cancel/${appointmentId}`, reason);
        return response.data;
    },

    //Ambulance api
    getAmbulanceCategories: async () => {
        const response = await publicApi.get("/user/ambulance/get-enums");
        return response.data;
    },
    getNearestAmbulances: async (data) => {
        const response = await publicApi.post("/user/ambulance/nearest-ambulances", data);
        return response.data;
    },

    checkOutAmbulance: async (data) => {
        const response = await authApi.post("/user/ambulance/calculate-fare", data);
        return response.data;
    },

    bookAmbulance: async (data) => {
        const response = await authApi.post("/user/ambulance/confirm-booking", data, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    },

    getAmbulanceDetail: async (ambulanceId) => {
        const response = await publicApi.get(`/user/ambulance/details/${ambulanceId}`
        );
        return response.data;
    },

    getAmbulanceCoupons: async (ambulanceId) => {
        const response = await authApi.get(`/user/ambulance/coupons/${ambulanceId}`);
        return response.data;
    },

    validateAmbulanceCoupon: async (data) => {
        const response = await authApi.post("/user/ambulance/validate-coupon", data);
        return response.data;
    },

    myAmbulanceBooking: async () => {
        const response = await authApi.get("/user/ambulance/my-bookings");
        return response.data;
    },

    // ADD THIS NEW API FUNCTION HERE:
    getBedMonthlySchedule: async (bedId, month, year) => {
        const response = await authApi.get(`/user/hospital/monthly-schedule`, {
            params: { bedId, month, year }
        });
        return response.data;
    },

    getVideoCallAppointmentsUser: async () => {
        const response = await authApi.get("/user/doctors/video-consults");
        return response.data;
    },

    getUserChatHistory: async (appointmentId) => {
        const response = await authApi.get(`/api/chat/user/history/${appointmentId}`);
        return response.data;
    },




    updateFCMtoken: async (fcmToken) => {
        const response = await authApi.patch('/user/doctor/video-call/update-fcm', fcmToken)
        return response.data;
    },

    getVideoCallNotification: async () => {
        const response = await authApi.get('/user/doctor/video-call/active');
        return response.data
    },
    respondToVideoCall: async (data) => {
        const response = await authApi.post('/doctor/video-call/respond', data);
        return response.data;
    },


    //Payment integration
    verifyPaymentDoctor: async (paymentData) => {
        const response = await authApi.post(`/user/doctors/verify-payment`, paymentData);
        return response.data;
    },

    verifyPaymentNurse: async (paymentData) => {
        const response = await authApi.post(`/user/nurse/verify-payment`, paymentData);
        return response.data;
    },

    verifyPaymentPriscription: async (paymentData) => {
        const response = await authApi.post(`/user/nurse/prescription/verify-payment`, paymentData);
        return response.data;
    },

    verifyPaymentLab: async (paymentData) => {
        const response = await authApi.post(`/user/labs/verify-payment`, paymentData);
        return response.data;
    },

    verifyPaymentPharmacy: async (paymentData) => {
        const response = await authApi.post(`/user/pharmacy/verify-payment`, paymentData);
        return response.data;
    },

    verifyPaymentHospital: async (paymentData) => {
        const response = await authApi.post(`user/hospital/verify-payment`, paymentData);
        return response.data;
    },

    initiatePaymentAmbulance: async (id) => {
        const response = await authApi.post(`/user/ambulance/initiate-payment/${id}`);
        return response.data;
    },

    verifyPaymentAmbulance: async (paymentData) => {
        const response = await authApi.post(`/user/ambulance/verify-payment`, paymentData);
        return response.data;;
    },

    payPrescriptionRequest: async (paymentData) => {
        const response = await authApi.post(`/user/pharmacy/prescription-request/pay-confirm`, paymentData);
        return response.data;
    },

    verifyPaymentPrescriptionPharmacy: async (paymentData) => {
        const response = await authApi.post(`/user/pharmacy/prescription-request/verify-payment`, paymentData);
        return response.data;
    },

    //Rating and Reviews 

    getReviewsByOrder: async (orderId) => {
        const response = await authApi.get(`/user/labs/review/by-order/${orderId}`)
        return response.data
    },

    getUniversalReviews: async (targetType, targetId, page = 1) => {
        // targetType must be one of: "Doctor", "Lab", "Pharmacy", "Nurse", "Hospital", "Ambulance", "Driver"
        const response = await authApi.get(`/user/labs/reviews/${targetType}/${targetId}`, {
            params: { page }
        });
        return response.data;
    },

    updateReview: async (orderId, reviewData) => {
        const response = await authApi.put(`/user/labs/review/update-by-order/${orderId}`, reviewData)
        return response.data
    },

    addRatingAndReviewLab: async (reviewData) => {
        const response = await authApi.post('/user/labs/rate', reviewData)
        return response.data;
    },

    addRatingAndReviewPharmacy: async (reviewData) => {
        const response = await authApi.post('/user/pharmacy/rate', reviewData)
        return response.data;
    },

    addRatingAndReviewHospital: async (reviewData) => {
        const response = await authApi.post('/user/hospital/rate', reviewData)
        return response.data;
    },

    addRatingAndReviewAmbulance: async (reviewData) => {
        const response = await authApi.post("/user/ambulance/rate", reviewData)
        return response.data
    },

    addRatingAndReviewNurse: async (reviewData) => {
        const response = await authApi.post("/user/nurse/rate", reviewData)
        return response.data
    },

    addRatingAndReviewDoctor: async (reviewData) => {
        const response = await authApi.post('/user/doctors/rate', reviewData)
        return response.data;
    },

    //Combo Offers Pharmacy 
    getAllComboOffers: async () => {
        const response = await publicApi.get('/user/pharmacy/global-combo-offers')
        return response.data;
    },

    getComboOfferDetail: async (offerId) => {
        const response = await publicApi.get(`/user/pharmacy/combo-offers/details/${offerId}`)
        return response.data;
    },

    // ==========================================
    // SUBSCRIPTION SYSTEM APIS
    // ==========================================

    // 1. Subscription Plan Discovery & Status
    getUserPlanDetail: async () => {
        const response = await authApi.get('/user/subscriptions/my-status');
        return response.data;
    },
    listAvailablePlans: async (type = "") => {
        // type can be "Elder Care" or "Condition Management"
        const response = await publicApi.get('/user/subscriptions/list', {
            params: { type }
        });
        return response.data;
    },

    getMySubscriptionStatus: async () => {
        const response = await authApi.get('/user/subscriptions/my-status');
        return response.data;
    },

    // 2. Purchase Flow
    buySubscriptionPlan: async (planId) => {
        // This initiates the order and returns Razorpay order meta
        const response = await authApi.post('/user/subscriptions/buy', { planId });
        return response.data;
    },

    verifySubscriptionPayment: async (paymentData) => {
        const response = await authApi.post('/user/subscriptions/verify-payment', paymentData);
        return response.data;
    },

    // 3. Specialized Disease Care Booking
    // Use this for Dementia, Cancer, or Dialysis specific flows
    bookSpecializedAppointment: async (diseaseType, bookingData) => {
        // diseaseType: "Dementia" | "Cancer" | "Dialysis"
        const response = await authApi.post(`/user/doctors/book/specialist/${diseaseType}`, bookingData);
        return response.data;
    },

    // 4. Cancellation & Benefit Restores
    // These ensure that if a "Free" booking is cancelled, the benefit count is restored (+1)
    cancelNurseBooking: async (bookingId) => {
        const response = await authApi.patch(`/user/nurse/cancel/${bookingId}`);
        return response.data;
    },
    // Add this to your UserAPI object
    getNurseSearchSuggestions: async (query) => {
        const response = await authApi.get(`/user/nurse/search-suggestions?q=${query}`);
        return response.data;
    },

    cancelLabBooking: async (bookingId) => {
        const response = await authApi.put(`/user/labs/cancel/${bookingId}`);
        return response.data;
    },

    cancelPharmacyOrder: async (orderId) => {
        const response = await authApi.post('/user/pharmacy/cancel-order', { orderId });
        return response.data;
    },

    cancelAmbulanceBooking: async (bookingId) => {
        const response = await authApi.patch(`/user/ambulance/cancel/${bookingId}`);
        return response.data;
    },






};

export default UserAPI;