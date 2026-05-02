import axios from 'axios';
 
const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
    headers: {
        'Content-Type': 'application/json',
    },
});
 
// Interceptor to attach the Token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('fireheadquarterToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});
 
const FireHeadAPI = {
    // Register New Fire Station
    registerFireStation: async (stationData) => {
        const response = await api.post(`/fireHQ/management/create-station`, stationData);
        return response.data;
    },
 
    getAllFireStations: async () => {
        const response = await api.get(`/fireHQ/management/stations`);
        return response.data;
    },
 
     // 3. Update Fire Station (form-data format for optional image upload)
     updateFireStation: async (id, formData) => {
        const response = await api.put(`/fireHQ/management/update-station/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Specially for profileImage
            },
        });
        return response.data;
    },
   
    // 4. Delete Fire Station
    deleteFireStation: async (id) => {
        const response = await api.delete(`/fireHQ/management/delete-station/${id}`);
        return response.data;
    },
 
    getCases: async (status = 'All', search = '') => {
        // Query Params jayenge: ?status=Fresh&search=101
        const response = await api.get(`/fireHQ/management/cases`, {
            params: {
                status: status === 'All' ? '' : status,
                search: search
            }
        });
        return response.data;
    },
 
    getHelpContact: async () => {
        const response = await api.get(`/fireHQ/management/help-contact`);
        return response.data;
    }
};
 
 
export default FireHeadAPI;
 