import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 1. Create a dedicated Axios instance
const doctorApi = axios.create({
    baseURL: BASE_URL,
});

// Helper to get token
const getDoctorToken = () => typeof window !== 'undefined' ? localStorage.getItem('doctorToken') : null;

// 2. Add Request Interceptor
// This will run before every request made using 'doctorApi'
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

    // Step 1: Basic Registration
    register: async (data) => {
        const response = await doctorApi.post('/api/auth/doctor/register', data);
        return response.data;
    },

    // Step 2: Phone Verification (OTP)
    verifyOtp: async (phone, otp) => {
        const response = await doctorApi.post('/api/auth/doctor/verify-otp', { phone, otp });
        return response.data;
    },

    // Step 3: Document Upload (Profile Completion)
    uploadDocs: async (formData) => {
        // Interceptor automatically adds the Token here
        const response = await doctorApi.put('/api/auth/doctor/upload-docs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },

    // Step 4: Login
    login: async (credentials) => {
        const response = await doctorApi.post('/api/auth/doctor/login', credentials);
        return response.data;
    },
};

export default DoctorAPI;