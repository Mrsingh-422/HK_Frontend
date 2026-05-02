import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 1. Instance for APIs WITHOUT Token
const publicApi = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Instance for APIs WITH Token
const privateApi = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the Token only to the privateApi instance
privateApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('firestationToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const FireStationAPI = {
    // ------------------- PUBLIC APIS (No Token) -------------------
    
    // Register New Fire Station
    LoginFireStation: async (stationData) => {
        const response = await publicApi.post('/fireStation/auth/login', stationData);
        return response.data;
    },

    LoginFireHQ: async (stationData) => {
        const response = await publicApi.post('fireHQ/auth/login', stationData);
        return response.data;
    },

    // ------------------- PRIVATE APIS (With Token) -------------------

    getProfile: async () => {
        const response = await privateApi.get('/fireStation/auth/profile');
        return response.data;
    },

    // 3. Update Profile (raw body data ke saath)
    UpdateProfile: async (formData) => {
        const response = await privateApi.put('/fireStation/auth/profile/update', formData);
        return response.data;
    },

    UpdatePassword: async (formData) => {
        const response = await privateApi.put('/fireStation/auth/password/update', formData);
        return response.data;
    },

    GetDashboardStats: async () => {
        const response = await privateApi.get('/fireStation/management/dashboard');
        return response.data;
    },

    // GET: Staff List
    GetStaffList: async () => {
        const response = await privateApi.get('/fireStation/management/staff/list');
        return response.data;
    },

    // POST: Add New Staff
    AddStaff: async (staffData) => {
        const response = await privateApi.post('/fireStation/management/staff/add', staffData);
        return response.data;
    },

    // GET: Fleet List
    GetFleetList: async () => {
        const response = await privateApi.get('/fireStation/management/fleet/list');
        return response.data;
    },

    // POST: Add New Vehicle
    AddVehicle: async (vehicleData) => {
        const response = await privateApi.post('/fireStation/management/fleet/add', vehicleData);
        return response.data;
    },

    // GET: Equipment List
    GetEquipmentList: async () => {
        const response = await privateApi.get('/fireStation/ops/equipment');
        return response.data;
    },

    // POST: Add New Equipment
    AddEquipment: async (equipmentData) => {
        const response = await privateApi.post('/fireStation/ops/equipment', equipmentData);
        return response.data;
    },

    // PUT: Update Equipment Status / Qty
    UpdateEquipment: async (id, updateData) => {
        const response = await privateApi.put(`/fireStation/ops/equipment/${id}`, updateData);
        return response.data;
    },

    GetRoster: async (shift = 'Day') => {
        const response = await privateApi.get(`/fireStation/ops/roster?shift=${shift}`);
        console.log('Roster Response:', response.data); // Debug log
        return response.data;
    },

    // GET: Pending Leaves
    GetPendingLeaves: async () => {
        const response = await privateApi.get('/fireStation/ops/leaves/pending');
        console.log('Pending Leaves Response:', response.data); // Debug log
        return response.data;
    },

    // PUT: Update Leave Status (Approve / Reject)
    UpdateLeaveStatus: async (id, statusData) => {
        const response = await privateApi.put(`/fireStation/ops/leaves/${id}/status`, statusData);
        return response.data;
    },

    // GET: Fresh Incident Cases
    GetFreshCases: async () => {
        const response = await privateApi.get('/fireStation/management/cases/fresh');
        return response.data;
    },

    // PUT: Accept / Dispatch Case
    AcceptCase: async (id) => {
        const response = await privateApi.put(`/fireStation/management/cases/accept/${id}`);
        return response.data;
    },

    // GET: Accepted/Ongoing Cases
    GetOngoingCases: async () => {
        const response = await privateApi.get('/fireStation/management/cases/accepted');
        console.log('Ongoing Cases Response:', response.data); // Debug log
        return response.data;
    },

    // PUT: Update Severity / Status / Remarks
    UpdateCaseSeverity: async (id, updateData) => {
        const response = await privateApi.put(`/fireStation/ops/cases/${id}/severity`, updateData);
        return response.data;
    },

    // POST: Final Incident Report (Multipart/Form-Data)
    SubmitFinalReport: async (id, formData) => {
        const response = await privateApi.post(`/fireStation/ops/cases/${id}/final-report`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // GET: Fetch Fire/Incident Types for Dropdown
    GetFireTypes: async () => {
        const response = await privateApi.get('/fireStation/ops/fire-types');
        console.log('Fire Types Response:', response.data); // Debug log
        return response.data;
    },

    // GET: Case History
    GetCaseHistory: async () => {
        const response = await privateApi.get('/fireStation/management/cases/history');
        return response.data;
    },

    GetIncidentReport: async (id) => {
        const response = await privateApi.get(`/fireStation/management/report/${id}`);
        return response.data;
    }
};

export default FireStationAPI;