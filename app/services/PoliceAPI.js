import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ===============================
// 1. PUBLIC API (NO TOKEN)
// ===============================
const publicApi = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ===============================
// 2. POLICE HEAD API
// ===============================
const policeHeadApi = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

policeHeadApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('policeHeadToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => Promise.reject(error));

// ===============================
// 3. POLICE STATION API
// ===============================
const policeStationApi = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

policeStationApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('policeStationToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => Promise.reject(error));

// ===============================
// 4. POLICE STAFF API
// ===============================
const policeStaffApi = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

policeStaffApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('policeStaffToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => Promise.reject(error));


// ===============================
// API METHODS
// ===============================
const PoliceAPI = {

    // 🔓 PUBLIC APIs
    loginPoliceHead: async (data) => {
        const res = await publicApi.post('/policeHQ/auth/login', data);
        return res.data;
    },

    loginPoliceStation: async (data) => {
        const res = await publicApi.post('/policeStation/auth/login', data);
        return res.data;
    },

    // 🔒 POLICE HEAD APIs
    getHeadDashboard: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/dashboard');
        return res.data;
    },

    getHeadProfile: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/profile');
        return res.data;
    },

    updateHeadProfile: async (data) => {
        const res = await policeHeadApi.put('/policeHQ/management/profile', data);
        return res.data;
    },

    getAllCases: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/cases');
        return res.data;
    },

    addPoliceStation: async (data) => {
        const res = await policeHeadApi.post('/policeHQ/management/stations', data);
        return res.data;
    },

    updatePoliceStation: async (id, data) => {
        const res = await policeHeadApi.put(`/policeHQ/management/stations/${id}`, data);
        return res.data;
    },

    deletePoliceStation: async (id) => {
        const res = await policeHeadApi.delete(`/policeHQ/management/stations/${id}`);
        return res.data;
    },

    createCase: async (data) => {
        const res = await policeHeadApi.post('/policeHQ/management/cases', data);
        return res.data;
    },

    assignCaseToPoliceStataion: async (id, data) => {
        const res = await policeHeadApi.put(`/policeHQ/management/cases/${id}`, data);
        return res.data;
    },

    getAllPoliceStations: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/stations');
        return res.data;
    },

    // 🔒 POLICE STATION APIs
    getStationDashboard: async () => {
        const res = await policeStationApi.get('/policeStation/station/dashboard');
        return res.data;
    },

    getPoliceStationProfile: async () => {
        const res = await policeStationApi.get('/policeStation/station/profile');
        return res.data;
    },

    updatePoliceProfile: async (data) => {
        const res = await policeStationApi.put('/policeStation/station/profile', data);
        return res.data;
    },
    
    getStationCases: async () => {
        const res = await policeStationApi.get('/policeStation/station/cases');
        return res.data;
    },

    getPoliceStationCases: async () => {
        const res = await policeStationApi.get('/policeStation/station/cases');
        return res.data;
    },

    getStaffLeaves: async () => {
        const res = await policeStationApi.get('/policeStation/station/leave');
        return res.data;
    },

    updateLeaveStatus: async (id, data) => {
        const res = await policeStationApi.put(`/policeStation/station/leave/manage/${id}`, data);
        return res.data;
    },

    getAllStaff: async () => {
        const res = await policeStationApi.get('/policeStation/station/staff');
        return res.data;
    },

    createStaff: async (data) => {
        const res = await policeStationApi.post('/policeStation/station/staff', data);
        return res.data;
    },

    acceptCase: async (id) => {
        const res = await policeStationApi.put(`/policeStation/station/cases/accept/${id}`);
        return res.data;
    },

    disptchStaffToCase: async (id, data) => {
        const res = await policeStationApi.post(`/policeStation/station/cases/assign-staff`, data);
        return res.data;
    },

    updateStaff: async (id, data) => {
        const res = await policeStationApi.put(`/policeStation/station/staff/${id}`, data);
        return res.data;
    },

    deleteStaff: async (id) => {
        const res = await policeStationApi.delete(`/policeStation/station/staff/${id}`);
        return res.data;
    },

};

export default PoliceAPI;