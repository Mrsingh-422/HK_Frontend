import axios from 'axios';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the Pharmacy/Vendor Token to every request
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
    getPharmacyDrivers: async (page = 1) => {
        const response = await api.get(`/provider/driver/list?page=${page}`);
        return response.data;
    },
    addPharmacyDriver: async (formData) => {
        const response = await api.post('/provider/driver/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    searchPharmacyDrivers: async (searchCriteria) => {
        const response = await api.post('/provider/driver/search', searchCriteria);
        return response.data;
    },
    // getPharmacyDriverById: async (id) => {
    //     const response = await api.get(`/provider/driver/details/${id}`);
    //     return response.data;
    // },
    updatePharmacyDriver: async (id, formData) => {
        const response = await api.put(`/provider/driver/update/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    deletePharmacyDriver: async (id) => {
        const response = await api.delete(`/provider/driver/delete/${id}`);
        return response.data;
    },
    togglePharmacyDriverStatus: async (id,  status) => {
        const response = await api.patch(`/provider/driver/status/${id}`, { status });
        return response.data;
    }
};

export default PharmacyAPI;