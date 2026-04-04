import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('pharmacyToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const PharmacyAPI = {
    pharmacyDrivers: async () => {
        const response = await api.get('/admin/drivers/vendor/list');
        return response.data;
    },
};

export default PharmacyAPI;