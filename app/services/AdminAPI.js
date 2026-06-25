import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const AdminAPI = {

    adminStatDashboard: async () => {
        const response = await api.get("/admin/dashboard/order-stats");
        return response.data;
    },

    adminProviderStats: async () => {
        const response = await api.get("/admin/dashboard/stats");
        return response.data;
    },

    getLiveOrders: async (page = 1, limit = 25, timeRange, vendor, searchQuery) => {
        const response = await api.get("/admin/dashboard/live-feed", {
            params: {
                page,
                limit,
                timeRange, // '6h', '12h', '24h', '7d', '30d'
                vendor,    // 'lab', 'pharmacy', etc.
                search: searchQuery // The search string for Order IDs
            },
        });
        return response.data;
    },

    getOrderDetails: async (orderId) => {
        const response = await api.get(`/admin/dashboard/order-details/${orderId}`);
        return response.data;
    },

    //Add single tests and test packages in Admin
    addSingleTest: async (testData) => {
        const response = await api.post("/admin/add-test", testData);
        return response.data;
    },
    addTestPackageCSV: async (testData) => {
        const response = await api.post('/admin/add-package', testData);
        return response.data;
    },
    getTestsByType: async (type, page = 1, limit = 20, search = "") => {
        const response = await api.get(`/admin/lab/tests/list/${type}`, {
            params: { page, limit, search }
        });
        return response.data;
    },

    //Hospital APIS in Admin
    getAllHospitals: async () => {
        const response = await api.get("/api/admin/approval/hospitals");
        return response.data;
    },
    approveHospital: async (hospitalId) => {
        const response = await api.patch(`/api/admin/approval/hospitals/approve/${hospitalId}`);
        return response.data;
    },
    rejectHospital: async (hospitalId) => {
        const response = await api.patch(`/api/admin/approval/hospitals/reject/${hospitalId}`);
        return response.data;
    },

    //Pharmacy APIS in Admin
    getAllPharmacyInAdmin: async () => {
        const response = await api.get("/api/admin/approval/pharmacy");
        return response.data;
    },
    approvePharmacyByAdmin: async (pharmacyId) => {
        const response = await api.patch(`/api/admin/approval/pharmacy/approve/${pharmacyId}`);
        return response.data;
    },
    rejectPharmacyByAdmin: async (pharmacyId, reason) => {
        const response = await api.patch(`/api/admin/approval/pharmacy/reject/${pharmacyId}`, {
            rejectionReason: reason
        });
        return response.data;
    },

    //Lab APIS in Admin
    getLabsList: async () => {
        const response = await api.get("/api/admin/approval/lab");
        return response.data;
    },
    approveLab: async (labId) => {
        const response = await api.patch(`/api/admin/approval/lab/approve/${labId}`);
        return response.data;
    },
    rejectLab: async (labId, reason) => {
        const response = await api.patch(`/api/admin/approval/lab/reject/${labId}`, {
            rejectionReason: reason
        });
        return response.data;
    },

    //Nurse APIS in Admin
    getAllNursesInAdmin: async () => {
        const response = await api.get("/api/admin/approval/nursing");
        return response.data;
    },
    approveNurseByAdmin: async (nurseId) => {
        const response = await api.patch(`/api/admin/approval/nursing/approve/${nurseId}`);
        return response.data;
    },
    rejectNurseByAdmin: async (nurseId, reason) => {
        const response = await api.patch(`/api/admin/approval/nursing/reject/${nurseId}`, {
            rejectionReason: reason
        });
        return response.data;
    },

    //Doctor APIS in Admin
    getDoctorsList: async () => {
        const response = await api.get("/api/admin/approval/doctors");
        return response.data;
    },
    approveDoctor: async (doctorId) => {
        const response = await api.patch(`/api/admin/approval/doctors/approve/${doctorId}`);
        return response.data;
    },
    rejectDoctor: async (doctorId, reason) => {
        const response = await api.patch(`/api/admin/approval/doctors/reject/${doctorId}`, {
            rejectionReason: reason
        });
        return response.data;
    },

    //Doctor Specialties and Qualifications Management
    viewDoctorSpecialties: async () => {
        const response = await api.get('/admin/doctor-data/specializations');
        return response.data;
    },
    addDoctorSpecialty: async (specialtyData) => {
        const response = await api.post('/admin/doctor-data/add-specialization', specialtyData);
        return response.data;
    },
    updateDoctorSpecialty: async (id, specialtyData) => {
        const response = await api.put(`/admin/doctor-data/update-specialization/${id}`, specialtyData);
        return response.data;
    },
    deleteDoctorSpecialty: async (id) => {
        const response = await api.delete(`/admin/doctor-data/delete-specialization/${id}`);
        return response.data;
    },

    viewDoctorQualifications: async () => {
        const response = await api.get('/admin/doctor-data/qualifications');
        return response.data;
    },
    addDoctorQualification: async (qualificationData) => {
        const response = await api.post('/admin/doctor-data/add-qualification', qualificationData);
        return response.data;
    },
    updateDoctorQualification: async (id, qualificationData) => {
        const response = await api.put(`/admin/doctor-data/update-qualification/${id}`, qualificationData);
        return response.data;
    },
    deleteDoctorQualification: async (id) => {
        const response = await api.delete(`/admin/doctor-data/delete-qualification/${id}`);
        return response.data;
    },

    // --- Insurance Management ---
    addInsuranceType: async (typeData) => {
        const response = await api.post('/admin/user/insurance/add-type', typeData);
        return response.data;
    },
    getInsuranceTypes: async () => {
        const response = await api.get('/admin/user/insurance/insurance-types');
        return response.data; // Accessing the array: ["RGHS", "CGHS", ...]
    },
    addInsurance: async (insuranceData) => {
        const response = await api.post('/admin/user/insurance/add-insurance', insuranceData);
        return response.data;
    },
    getInsuranceList: async (page = 1, limit = 10, search = "") => {
        const response = await api.get('/admin/user/insurance/insurance-list', {
            params: { page, limit, search }
        });
        return response.data; // Returns { data: [...], totalPages: X, etc }
    },
    updateInsurance: async (id, insuranceData) => {
        const response = await api.put(`/admin/user/insurance/update/${id}`, insuranceData);
        return response.data;
    },
    updateInsuranceStatus: async (id, statusData) => {
        const response = await api.patch(`/admin/user/insurance/update-status/${id}`, statusData);
        return response.data;
    },
    deleteInsurance: async (id) => {
        const response = await api.delete(`/admin/user/insurance/delete/${id}`);
        return response.data;
    },

    //Manage Coupons in Admin
    adminGetCouponsList: async () => {
        const response = await api.get("/provider/coupons/admin/list");
        return response.data;
    },
    adminGetVendorTypes: async () => {
        const response = await api.get("/provider/coupons/enum-types");
        return response.data;
    },
    adminAddCoupon: async (couponData) => {
        const response = await api.post("/provider/coupons/admin/add", couponData);
        return response.data;
    },
    adminToggleCouponStatus: async (id) => {
        const response = await api.patch(`/provider/coupons/admin/toggle/${id}`);
        return response.data;
    },
    adminUpdateCoupon: async (id, couponData) => {
        const response = await api.put(`/provider/coupons/admin/update/${id}`, couponData);
        return response.data;
    },
    adminDeleteCoupon: async (id) => {
        const response = await api.delete(`/provider/coupons/admin/delete/${id}`);
        return response.data;
    },

    //Manage Medicines in Admin
    adminUploadMedicinesExcel: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return (await api.post('/admin/pharmacy/medicine/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })).data;
    },
    adminCreateMedicine: async (data) => {
        return (await api.post('/admin/pharmacy/medicine/create', data)).data;
    },
    adminGetMedicinesList: async (page = 1) => {
        return (await api.get(`/admin/pharmacy/medicine/list`, { params: { page } })).data;
    },
    adminGetMedicineDetails: async (id) => {
        return (await api.get(`/admin/pharmacy/medicine/details/${id}`)).data;
    },
    adminSearchMedicines: async (search, page = 1) => {
        return (await api.post('/admin/pharmacy/medicine/search', { search, page })).data;
    },
    adminUpdateMedicine: async (id, data) => {
        return (await api.put(`/admin/pharmacy/medicine/update/${id}`, data)).data;
    },
    adminDeleteMedicine: async (id) => {
        return (await api.delete(`/admin/pharmacy/medicine/delete/${id}`)).data;
    },
    
    getPendingMedicineRequests: async () => {
        const response = await api.get('/admin/pharmacy/medicine/requests/pending');
        return response.data;
    },
    approveMedicineRequest: async (requestId) => {
        const response = await api.put(`/admin/pharmacy/medicine/requests/approve/${requestId}`);
        return response.data;
    },
    rejectMedicineRequest: async (requestId, payload) => {
        const response = await api.put(`/admin/pharmacy/medicine/requests/reject/${requestId}`, payload);
        return response.data;
    },

    //Lab APIS 
    getPaginatedMasterTests: async (page = 1) => {
        const response = await api.get('/admin/lab/tests/list/test', {
            params: { page }
        });
        return response.data;
    },
    getFilteredMasterTests: async ({ mainCategory = '', search = '' } = {}) => {
        const response = await api.get('/admin/lab/tests/master-tests', {
            params: { mainCategory, search }
        });
        return response.data;
    },
    editMasterTest: async (id, testData) => {
        const response = await api.put(`/admin/lab/tests/edit/test/${id}`, testData);
        return response.data;
    },

    deleteMasterTest: async (id) => {
        const response = await api.delete(`/admin/lab/tests/delete/test/${id}`);
        return response.data;
    },



    getPaginatedMasterPackages: async (page = 1) => {
        const response = await api.get('/admin/lab/tests/list/package', {
            params: { page }
        });
        return response.data;
    },
    getFilteredMasterPackages: async ({ category = '', search = '' } = {}) => {
        const response = await api.get('/admin/lab/tests/master-packages', {
            params: { category, search }
        });
        return response.data;
    },
    deleteMasterPackage: async (id) => {
        const response = await api.delete(`/admin/lab/tests/delete/package/${id}`);
        return response.data;
    },
    editMasterPackage: async (id, packageData) => {
        const response = await api.put(`/admin/lab/tests/edit/package/${id}`, packageData);
        return response.data;
    },

    //Lab Requests 
    getPendingLabTestRequests: async () => {
        const response = await api.get('/admin/lab/tests/requests/pending');
        return response.data;
    },
    approveLabTestRequest: async (requestId) => {
        const response = await api.put(`/admin/lab/tests/requests/approve/${requestId}`);
        return response.data;
    },


    //Manage Banners in Admin
    adminCreateBanner: async (formData) => {
        const response = await api.post('/admin/banners/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    adminUpdateBanner: async (id, formData) => {
        const response = await api.put(`/admin/banners/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    adminGetAllBanners: async () => {
        const response = await api.get('/admin/banners/list');
        return response.data;
    },
    adminDeleteBanner: async (id) => {
        const response = await api.delete(`/admin/banners/delete/${id}`);
        return response.data;
    },
    getAppBanners: async () => {
        const response = await api.get('/admin/banners/display');
        return response.data;
    },

    //EMERGENCY CONTACTS ADMIN FUNCTIONS ---
    adminCreateEmergencyContact: async (contactData) => {
        const response = await api.post('/admin/emergency-contacts/add', contactData);
        return response.data;
    },
    adminGetEmergencyContacts: async () => {
        const response = await api.get('/admin/emergency-contacts/list');
        return response.data;
    },
    adminUpdateEmergencyContact: async (id, contactData) => {
        const response = await api.put(`/admin/emergency-contacts/update/${id}`, contactData);
        return response.data;
    },
    adminDeleteEmergencyContact: async (id) => {
        const response = await api.delete(`/admin/emergency-contacts/delete/${id}`);
        return response.data;
    },

    // --- ARTICLES ADMIN FUNCTIONS --
    adminCreateArticle: async (formData) => {
        const response = await api.post('/admin/articles/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    adminGetArticles: async () => {
        const response = await api.get('/admin/articles/list');
        return response.data;
    },
    adminUpdateArticle: async (id, formData) => {
        const response = await api.put(`/admin/articles/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    adminDeleteArticle: async (id) => {
        const response = await api.delete(`/admin/articles/delete/${id}`);
        return response.data;
    },
    getDropdownArticlesSubcategories: async () => {
        const response = await api.get('/admin/articles/enum');
        return response.data;
    },

    // --- AD MANAGER ADMIN FUNCTIONS ---
    adminCreateAd: async (formData) => {
        const response = await api.post('/admin/ads/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    adminGetAllAds: async () => {
        const response = await api.get('/admin/ads/list');
        return response.data;
    },
    adminUpdateAd: async (id, formData) => {
        const response = await api.put(`/admin/ads/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    adminDeleteAd: async (id) => {
        const response = await api.delete(`/admin/ads/delete/${id}`);
        return response.data;
    },
    getAdsByPage: async (pageName) => {
        const response = await api.get(`/admin/ads/display?page=${pageName}`);
        return response.data;
    },

    // --- DRIVER / VENDOR ADMIN FUNCTIONS ---
    adminGetAllDrivers: async () => {
        const response = await api.get('/admin/drivers/vendor/list');
        return response.data;
    },
    adminGetDriverDetails: async (id) => {
        const response = await api.get(`/admin/drivers/vendor/details/${id}`);
        return response.data;
    },
    adminToggleDriverStatus: async (id) => {
        const response = await api.patch(`/admin/drivers/vendor/toggle/${id}`);
        return response.data;
    },
    adminDeleteDriver: async (id) => {
        const response = await api.delete(`/admin/drivers/vendor/delete/${id}`);
        return response.data;
    },

    // --- USER MANAGEMENT ADMIN FUNCTIONS ---
    adminGetUsers: async (page = 1) => {
        const response = await api.get(`/admin/users/list?page=${page}`);
        return response.data;
    },
    adminSearchUsers: async (query) => {
        const response = await api.get(`/admin/users/search?query=${query}`);
        return response.data;
    },
    adminGetUserDetails: async (id) => {
        const response = await api.get(`/admin/users/details/${id}`);
        return response.data;
    },
    adminToggleUserStatus: async (id) => {
        const response = await api.patch(`/admin/users/toggle-status/${id}`);
        return response.data;
    },
    adminDeleteUser: async (id) => {
        const response = await api.delete(`/admin/users/delete/${id}`);
        return response.data;
    },

    // Set a KM limit for a specific vendor or global setting
    adminSetVendorKMLimit: async (data) => {
        // data usually contains { vendorId, kmLimit } or similar
        const response = await api.post('/admin/vendor-km-limit/set-km-limit', data);
        return response.data;
    },
    // Fetch all vendor KM limits
    adminGetVendorKMLimits: async () => {
        const response = await api.get('/admin/vendor-km-limit/get-km-limits');
        return response.data;
    },

    // =============================
    // Hospital Bed Reschedule Limits
    // =============================

    // Get Current Hospital Bed Limit
    adminGetHospitalRescheduleLimit: async () => {
        const response = await api.get('/admin/hospital/reschedule-limit');
        return response.data;
    },

    // Update Hospital Bed Limit
    adminUpdateHospitalRescheduleLimit: async (limit) => {
        const response = await api.patch('/admin/hospital/update-reschedule-limit', { limit });
        return response.data;
    },

    // =============================
    // Doctor Appointment Reschedule Limits
    // =============================
    // Get Current Doctor Reschedule Limit
    adminGetDoctorRescheduleLimit: async () => {
        const response = await api.get('/admin/doctor/reschedule-limit');
        return response.data;
    },
    // Update Doctor Reschedule Limit
    adminUpdateDoctorRescheduleLimit: async (limit) => {
        const response = await api.patch('/admin/doctor/update-reschedule-limit', { limit });
        return response.data;
    },

    //Admin Functions to manage Independent Doctors

    getIndependentDoctorsList: async (page = 1, limit = 20, search = "") => {
        const response = await api.get('/admin/doctor/list', {
            params: { page, limit, search }
        });
        return response.data;
    },
    approveOrRejectIndependentDoctor: async (doctorId, status, reason = "") => {
        const response = await api.patch(`/admin/doctor/approve/${doctorId}`, { status, reason });
        return response.data;
    },

    toggleActiveOrInactiveIndependentDoctor: async (doctorId) => {
        const response = await api.patch(`/admin/doctor/toggle-active/${doctorId}`);
        return response.data;
    },

    //All Get Bookings for Admin Dashboard
    getDoctorAppointments: async (page = 1, limit = 10) => {
        const response = await api.get("/admin/doctor/appointments", {
            params: { page, limit }
        });
        return response.data;
    },

    getHospitalAppointments: async (page = 1, limit = 10) => {
        const response = await api.get("/admin/hospital/appointments", {
            params: { page, limit }
        });
        return response.data;
    },

    getAmbulanceBookings: async (page = 1, limit = 10) => {
        const response = await api.get("/admin/ambulance/bookings", {
            params: { page, limit }
        });
        return response.data;
    },

    getLabBookings: async (page = 1, limit = 10) => {
        const response = await api.get("/admin/lab/bookings", {
            params: { page, limit }
        });
        return response.data;
    },

    getPharmacyBookings: async (page = 1, limit = 10) => {
        const response = await api.get("/admin/pharmacy/bookings", {
            params: { page, limit }
        });
        return response.data;
    },

    getNursingBookings: async (page = 1, limit = 10) => {
        const response = await api.get("/admin/nurse/bookings", {
            params: { page, limit }
        });
        return response.data;
    },

    //Api for manage orders by vendors 
    getAllApprovedLabs: async (page = 1, limit = 25) => {
        const response = await api.get("admin/lab/approved-list", {
            params: { page, limit }
        });
        return response.data;
    },

    getParticularLabOrders: async (labId, page = 1, limit = 25) => {
        const response = await api.get(`/admin/lab/bookings/`, {
            params: { labId, page, limit }
        });
        return response.data;
    },

    getAllPharmaciesInAdmin: async (page = 1, limit = 25) => {
        const response = await api.get("/admin/pharmacy/approved-list", {
            params: { page, limit }
        });
        return response.data;
    },

    getParticularPharmacyOrders: async (pharmacyId, page = 1, limit = 25) => {
        const response = await api.get(`/admin/pharmacy/bookings/`, {
            params: { pharmacyId, page, limit }
        });
        return response.data;
    },

    getNurseProvidersInAdmin: async (page = 1, limit = 25) => {
        const response = await api.get("/admin/nurse/approved-list", {
            params: { page, limit }
        }); return response.data;
    },

    getParticularNurseOrders: async (nurseId, page = 1, limit = 25) => {
        const response = await api.get(`/admin/nurse/bookings/`, {
            params: { nurseId, page, limit }
        });
        return response.data;
    },

    getHospitalsInAdmin: async (page = 1, limit = 25) => {
        const response = await api.get("/admin/hospital/approved-list", {
            params: { page, limit }
        }); return response.data;
    },

    getParticularHospitalOrders: async (hospitalId, page = 1, limit = 25) => {
        const response = await api.get(`/admin/hospital/appointments/`, {
            params: { hospitalId, page, limit }
        });
        return response.data;
    },

    getAmbulancesInAdmin: async (page = 1, limit = 25) => {
        const response = await api.get("/admin/ambulance/approved-list", {
            params: { page, limit }
        }); return response.data;
    },

    getParticularAmbulanceOrders: async (ambulanceId, page = 1, limit = 25) => {
        const response = await api.get(`/admin/ambulance/bookings/`, {
            params: { ambulanceId, page, limit }
        });
        return response.data;
    },

    // Fetch all pending withdrawal requests across the platform
    getPendingWithdrawals: async (page = 1, limit = 25) => {
        const response = await api.get(`/api/admin/wallet/pending-withdrawals`, {
            params: { page, limit }
        });
        return response.data;
    },

    // Approve a withdrawal request with a UTR reference number
    approveWithdrawal: async (requestId, transactionReference) => {
        const response = await api.patch(`/api/admin/wallet/approve-withdrawal/${requestId}`, {
            transactionReference
        });
        return response.data;
    },

    getAdminAmountStats: async () => {
        const response = await api.get(`/api/admin/wallet/dashboard-stats`);
        return response.data;
    },


    // Reject a withdrawal request and provide a reason for reversal
    rejectWithdrawal: async (requestId, reason) => {
        const response = await api.patch(`/api/admin/wallet/reject-withdrawal/${requestId}`, {
            reason
        });
        return response.data;
    },

    // Fetch all unverified bank profiles across the entire platform
    getPendingBanks: async (page = 1, limit = 25) => {
        const response = await api.get(`/api/admin/wallet/pending-banks`, {
            params: { page, limit }
        });
        return response.data;
    },

    // Verify a vendor's bank details using their vendorModel type and ID
    verifyBank: async (vendorModel, vendorId, isVerified = true) => {
        const response = await api.patch(`/api/admin/wallet/verify-bank/${vendorModel}/${vendorId}`, {
            isVerified
        });
        return response.data;
    },
    /**
         * API 1: List All Templates (Table View)
         * Fetches paginated and searchable report templates.
         * @param {Object} queryParams - Object containing page, limit, and search parameters.
         */
    getReportTemplates: async ({ page = 1, limit = 20, search = '' } = {}) => {
        const response = await api.get('/admin/lab/tests/report-templates', {
            params: { page, limit, search }
        });
        return response.data;
    },

    /**
     * API 2: Fetch Single Template Details (For Edit Form)
     * Retrieves the structural parameters of a single template by its database ID.
     * @param {string} id - MongoDB ID of the template.
     */
    getReportTemplateDetails: async (id) => {
        const response = await api.get(`/admin/lab/tests/report-templates/details/${id}`);
        return response.data;
    },

    /**
     * API 7: Bulk Upload Report Templates Via CSV
     * Uploads a CSV file containing multiple report template configurations.
     * @param {File} file - The .csv file instance to be uploaded.
     */
    bulkUploadReportTemplates: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        console.log(formData);

        const response = await api.post('/admin/lab/tests/upload-templates', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * API 8: Manually Create Report Template (Admin Form)
     * Registers a new test template manually.
     * @param {Object} templateData - Payload containing testName and parameters.
     */
    createReportTemplate: async (templateData) => {
        const response = await api.post('/admin/lab/tests/create-template', templateData);
        return response.data;
    },

    /**
     * API 9: Manually Edit Report Template
     * Updates an existing test template with modified structures or parameters.
     * @param {string} id - MongoDB _id of the template.
     * @param {Object} templateData - Object containing updated testName and parameters.
     */
    editReportTemplate: async (id, templateData) => {
        const response = await api.put(`/admin/lab/tests/edit-template/${id}`, templateData);
        return response.data;
    },

    /**
     * API 10: Manually Delete Report Template
     * Removes a template document from the database permanently.
     * @param {string} id - MongoDB _id of the template.
     */
    deleteLabTestTemplate: async (id) => {
        const response = await api.delete(`/admin/lab/tests/delete-template/${id}`);
        return response.data;
    }

};

export default AdminAPI;