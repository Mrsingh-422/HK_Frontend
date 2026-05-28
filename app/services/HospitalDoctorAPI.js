import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 1. Create a dedicated Axios instance
const hospitalDoctorApi = axios.create({
    baseURL: BASE_URL,
});

// Helper to get token
const getDoctorToken = () => typeof window !== 'undefined' ? localStorage.getItem('hospitalDoctorToken') : null;

// 2. Add Request Interceptor
hospitalDoctorApi.interceptors.request.use(
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

const HospitalDoctorAPI = {
    login: async (credentials) => {
        try {
            const response = await hospitalDoctorApi.post('/api/hospital/doctors/login', credentials);
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data?.message || "Login failed");
        }
    },
}

export default HospitalDoctorAPI