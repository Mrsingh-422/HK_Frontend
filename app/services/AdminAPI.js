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
    }


};

export default AdminAPI;