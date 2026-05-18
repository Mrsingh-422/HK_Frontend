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
    // POST: Create New Incident / Case
    createCase: async (caseData) => {
        const response = await api.post('/fireHQ/management/create-case', caseData);
        return response.data;
    },
 
    getHelpContact: async () => {
        const response = await api.get(`/fireHQ/management/help-contact`);
        return response.data;
    },
 
    // --- DASHBOARD METHODS ---
    getDashboardOverview: async () => {
        const response = await api.get(`/fireHQ/management/dashboard`);
        console.log('Dashboard Overview Response:', response.data); // Debug log
        return response.data;
    },
    getAnalyticsChart: async () => {
        const response = await api.get(`/fireHQ/management/analytics/chart`);
        return response.data;
    },
    // --- JURISDICTION METHODS ---
    getHQJurisdiction: async () => {
        const response = await api.get(`/fireHQ/management/jurisdiction-data`);
        console.log('Jurisdiction Data Response:', response.data); // Debug log
        return response.data;
    },
 
    updateHQJurisdiction: async (updateData) => {
        // updateData should contain { jurisdictionStats, primarySectors }
        const response = await api.put(`/fireHQ/management/update-jurisdiction`, updateData);
        console.log('Update Jurisdiction Response:', response.data); // Debug log
        return response.data;
    },
 
    // Resources Assign karne ke liye  
    assignResources: async (payload) => {
        const response = await api.put('/fireHQ/management/assign-resources', payload);
        return response.data;
    },
 
    // Resources fetch karne ke liye (Dropdowns ke liye)  
    getAssignmentResources: async () => {
        const [staff, vehicles, stations] = await Promise.all([
        api.get('/fireHQ/management/staff'),
        api.get('/fireHQ/management/vehicles'),
        api.get('/fireHQ/management/stations')]);
     return { staff: staff.data, vehicles: vehicles.data, stations: stations.data };
    },
 
    // --- PROFILE METHODS ---
    getHQProfile: async () => {
        const response = await api.get(`/fireHQ/auth/profile`);
        return response.data;
    },
   
    updateHQProfile: async (formData) => {
        // Form Data isliye bheja ja raha hai kyunki Image upload ho sakti hai
        const response = await api.put(`/fireHQ/auth/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // For profile image upload
            },
        });
        return response.data;
    },
 
    // --- JURISDICTION UPDATE REQUESTS ---
    getJurisdictionRequests: async () => {
        const response = await api.get(`/fireHQ/management/request-jurisdiction-update`);
        return response.data;
    },
    updateStationJurisdiction: async (stationId, updateData) => {
        const response = await api.put(`/fireHQ/management/station-area-update/${stationId}`, updateData);
        return response.data;
    },
};
 
 
export default FireHeadAPI;
 