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
        const res = await publicApi.post('/policeStation/auth/login', data);

        // Check if the token exists in the response and store it
        if (res.data && res.data.token) {
            localStorage.setItem('policeHeadToken', res.data.token);
        }

        return res.data;
    },

    loginPoliceStation: async (data) => {
        const res = await publicApi.post('/police-station/login', data);
        if(res.data && res.data.token) {
            localStorage.setItem('policeStationToken', res.data.token);
        }
        return res.data;
    },

    // 🔒 POLICE HEAD APIs
    getHeadDashboard: async () => {
        const res = await policeHeadApi.get('/police-head/dashboard');
        return res.data;
    },

    // 🔒 POLICE STATION APIs
    getStationDashboard: async () => {
        const res = await policeStationApi.get('/police-station/dashboard');
        return res.data;
    },

};

export default PoliceAPI;