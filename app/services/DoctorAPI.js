import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 1. Create a dedicated Axios instance
const doctorApi = axios.create({
    baseURL: BASE_URL,
});

// Helper to get token
const getDoctorToken = () => typeof window !== 'undefined' ? localStorage.getItem('independentDoctorToken') : null;

// 2. Add Request Interceptor
doctorApi.interceptors.request.use(
    (config) => {
        const token = getDoctorToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const DoctorAPI = {
    // ==========================================
    // AUTHENTICATION & ONBOARDING SECTION
    // ==========================================

    login: async (credentials) => {
        try {
            const response = await doctorApi.post('/api/auth/doctor/login', credentials);
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data?.message || "Login failed");
        }
    },
    register: async (data) => {
        try {
            const response = await doctorApi.post('/api/auth/doctor/register', data);
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data?.message || "Registration failed");
        }
    },

    verifyOtp: async (phone, otp) => {
        const response = await doctorApi.post('/api/auth/doctor/verify-otp', { phone, otp });
        return response.data;
    },

    uploadDocs: async (formData) => {
        const response = await doctorApi.put('/api/auth/doctor/upload-docs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },

    independentLogin: async (credentials) => {
        const response = await doctorApi.post('/api/auth/doctor/login', credentials);
        return response.data;
    },

    // ==========================================
    // DOCTOR VISIT CHARGES (TRAVEL FEE) SECTION
    // ==========================================

    saveVisitCharges: async (data) => {
        const response = await doctorApi.post('/doctor/visit-charges/save', data);
        return response.data;
    },

    getMyVisitCharges: async () => {
        const response = await doctorApi.get('/doctor/visit-charges/my-charges');
        return response.data;
    },


    // ==========================================
    // DOCTOR PROFILE SECTION
    // ==========================================

    updateProfile: async (formData) => {
        const response = await doctorApi.put('/api/auth/doctor/update-profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },

    getProfile: async () => {
        const response = await doctorApi.get('/api/auth/doctor/profile');
        return response.data;
    },

    updateSettings: async (settings) => {
        const response = await doctorApi.put('/doctor/settings/update-settings', settings);
        return response.data;
    },

    // ==========================================
    // DOCTOR AVAILABILITY SECTION
    // ==========================================

    setAvailability: async (data) => {
        const response = await doctorApi.post('/doctor/availability/set', data);
        return response.data;
    },

    getMySlots: async () => {
        const response = await doctorApi.get('/doctor/availability/my-slots');
        return response.data;
    },

    blockSlot: async (time) => {
        const response = await doctorApi.post('/doctor/availability/block', { time });
        return response.data;
    },

    unblockSlot: async (time) => {
        const response = await doctorApi.post('/doctor/availability/unblock', { time });
        return response.data;
    },

    // ==========================================
    // DOCTOR COUPON SECTION
    // ==========================================

    addCoupon: async (data) => {
        const response = await doctorApi.post('/doctor/coupon/add', data);
        return response.data;
    },

    listCoupons: async () => {
        const response = await doctorApi.get('/doctor/coupon/list');
        return response.data;
    },

    toggleCoupon: async (id) => {
        const response = await doctorApi.patch(`/doctor/coupon/toggle/${id}`);
        return response.data;
    },

    updateCoupon: async (id, data) => {
        const response = await doctorApi.put(`/doctor/coupon/update/${id}`, data);
        return response.data;
    },

    deleteCoupon: async (id) => {
        const response = await doctorApi.delete(`/doctor/coupon/delete/${id}`);
        return response.data;
    },

    // ==========================================
    // DOCTOR APPOINTMENT MANAGEMENT
    // ==========================================

    getAppointmentStats: async () => {
        const response = await doctorApi.get('/doctor/appointments/stats');
        return response.data;
    },

    getPatientBookings: async (params = {}) => {
        let url = '/doctor/appointments/patient-bookings';

        // Handles legacy string input and new object queries gracefully
        if (typeof params === 'string') {
            if (params) {
                url += `?status=${encodeURIComponent(params)}`;
            }
        } else if (params && typeof params === 'object') {
            const query = new URLSearchParams();
            if (params.status) {
                query.append('status', params.status);
            }
            if (params.consultationType) {
                query.append('consultationType', params.consultationType);
            }

            const queryString = query.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const response = await doctorApi.get(url);
        return response.data;
    },

    getTodayAppointments: async () => {
        const response = await doctorApi.get('/doctor/appointments/today-appointments');
        return response.data;
    },

    confirmAppointment: async (id) => {
        const response = await doctorApi.patch(`/doctor/appointments/confirm/${id}`);
        return response.data;
    },

    rescheduleAppointment: async (id, data) => {
        const response = await doctorApi.patch(`/doctor/appointments/reschedule/${id}`, data);
        return response.data;
    },

    cancelAppointment: async (id, reason) => {
        const response = await doctorApi.patch(`/doctor/appointments/cancel/${id}`, { reason });
        return response.data;
    },

    startVisit: async (id) => {
        const response = await doctorApi.patch(`/doctor/appointments/start-visit/${id}`);
        return response.data;
    },

    completeAppointment: async (id, data) => {
        const response = await doctorApi.post(`/doctor/appointments/complete/${id}`, data);
        return response.data;
    },

    // ==========================================
    // DOCTOR PRESCRIPTION SECTION
    // ==========================================

    createPrescription: async (data) => {
        const response = await doctorApi.post('/doctor/appointments/create-prescription', data);
        return response.data;
    },

    getAllPrescriptions: async (filter = 'all') => {
        const response = await doctorApi.get(`/doctor/appointments/all-prescription?filter=${filter}`);
        return response.data;
    },

    getPrescriptionDetails: async (id) => {
        const response = await doctorApi.get(`/doctor/appointments/prescription/${id}`);
        return response.data;
    },

    updatePrescription: async (id, data) => {
        const response = await doctorApi.put(`/doctor/appointments/prescription/edit/${id}`, data);
        return response.data;
    },

    resendPrescription: async (id) => {
        const response = await doctorApi.post(`/doctor/appointments/prescription/resend/${id}`);
        return response.data;
    },

    // ==========================================
    // NEW: PATIENT HISTORY SECTION
    // ==========================================

    getPatientHistory: async () => {
        const response = await doctorApi.get('/doctor/appointments/patient-history');
        return response.data;
    },

    getPatientHistoryDetails: async (id) => {
        const response = await doctorApi.get(`/doctor/appointments/patient-history/${id}`);
        return response.data;
    },

    // Fetch qualifications list for dropdown population
    getQualifications: async () => {
        const response = await doctorApi.get('/admin/doctor-data/qualifications');
        return response.data;
    },

    // Fetch specializations list for dropdown population
    getSpecializations: async () => {
        const response = await doctorApi.get('/admin/doctor-data/specializations');
        return response.data;
    },
    getDashboardSummary: async () => {
        try {
            const response = await doctorApi.get('/doctor/appointments/dashboard/summary');
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data?.message || "Failed to fetch dashboard summary");
        }
    },

    initiateVideoCall: async (callData) => {
        try {
            console.log(callData);
            const response = await doctorApi.post('/doctor/video-call/initiate', callData,)
            return response.data; // Success response return karega    } catch (error) {
        }
        catch (error) {
            console.error("API Error in initiateVideoCall:", error);
            return Promise.reject(error.response?.data?.message || "Something went wrong")
        }
    },

    endVideoCall: async (callData) => {
        try {
            const response = await doctorApi.post('/doctor/video-call/end', callData);
            return response.data;
        } catch (error) {
            console.error("API Error in endVideoCall:", error);
            return Promise
        }
    },


    }

    export default DoctorAPI;
