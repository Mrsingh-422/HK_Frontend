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
    getTrendingMedicines: async (data) => {
        const response = await publicApi.post(`/user/pharmacy/trending-medicines`, data);
        return response.data;
    },
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
        const response = await authApi.post("/user/pharmacy/place-order", orderData);
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
        const response = await authApi.post("/user/hospital/book", data);
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
        const response = await authApi.post("/user/ambulance/confirm-booking", data);
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



};

export default UserAPI;