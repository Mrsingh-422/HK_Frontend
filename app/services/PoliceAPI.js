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
        const res = await policeHeadApi.post(`/policeHQ/management/cases/assign/${id}`, data);
        return res.data;
    },
 
    getAllPoliceStations: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/stations');
        return res.data;
    },
   
    getAllCases: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/cases');
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
    // 🔒 POLICE HEAD APIs (Content Management)
    getAboutContent: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/content/about');
        return res.data;
    },
 
    getHelpContent: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/content/help');
        return res.data;
    },
 
    getTermsContent: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/content/terms');
        return res.data;
    },
    // Case Summary Fetcher
    getCaseSummary: async (id) => {
        const res = await policeHeadApi.get(`/policeHQ/management/cases/${id}/summary`);
        return res.data;
    },
    getPendingCases: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/cases/pending');
        return res.data;
    },
    getHeadDashboard: async () => {
        const res = await policeHeadApi.get('/policeHQ/management/dashboard');
        return res.data;
    },
     // Nearby Stations fetch karne ke liye
     getNearbyStations: async (lat, lng) => {
        const res = await policeHeadApi.get(`/policeHQ/management/stations/nearby?lat=${lat}&lng=${lng}`);
        return res.data;
    },
 
    // Case ko dusre station pe bhejney ke liye
    reassignCase: async (id, data) => {
        const res = await policeHeadApi.post(`/policeHQ/management/cases/${id}/reassign`, data);
        return res.data;
    },
 
    // Case status explicitly change karne ke liye (Patch)
    updateCaseStatus: async (id, statusData) => {
        const res = await policeHeadApi.patch(`/policeHQ/management/cases/${id}/status`, statusData);
        return res.data;
    },
    // 🔒 POLICE HEAD APIs (Jurisdiction)
    getStationJurisdiction: async (stationId) => {
        const res = await policeHeadApi.get(`/policeHQ/management/stations/${stationId}/jurisdiction`);
        return res.data;
    },
 
    // Yahan hume FormData bhejna hai kyunki File/PDF upload ho sakti hai
    updateStationJurisdiction: async (stationId, formData) => {
        // Axios config mein Content-Type multipart/form-data denge taaki file handle ho sake
        const res = await policeHeadApi.put(`/policeHQ/management/stations/${stationId}/jurisdiction`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },
    // ---------------------------------Police api ----------------------------------------
    getOwnJurisdiction: async () => {
        const res = await policeStationApi.get('/policeStation/station/jurisdiction');
        return res.data;
    },
    getStationDashboard: async () => {
        const res = await policeStationApi.get('/policeStation/station/dashboard');
        return res.data;
    },
    fetchHistoryData: async () => {
        const res = await policeStationApi.get('/policeStation/station/history');
        return res.data;
    },
    getRosterRequests: async () => {
        const res = await policeStationApi.get('/policeStation/station/roster-requests');
        return res.data;
    },
    manageRosterRequest: async (id, data) => {
        // data mein { status: 'Approved' } ya { status: 'Rejected' } jayega
        const res = await policeStationApi.put(`/policeStation/station/roster-requests/${id}/manage`, data);
        return res.data;
    },
    getRosterHistory: async () => {
        const res = await policeStationApi.get('/policeStation/station/roster-requests/history');
        return res.data;
    },
    createStationCase: async (data) => {
        const res = await policeStationApi.post('/policeStation/station/create-cases', data);
        return res.data;
    },
    // POLICE STATION APIs (Notifications)
    getStationNotifications: async () => {
        const res = await policeStationApi.get('/policeStation/station/notifications');
        return res.data;
    },
 
    deleteStationNotification: async (id) => {
        const res = await policeStationApi.delete(`/policeStation/station/notifications/${id}`);
        return res.data;
    },
    markAllNotificationsRead: async () => {
        const res = await policeStationApi.put('/policeStation/station/notifications/mark-all-read');
        return res.data;
    },
    // ==========================================
    // 🚨 PENDING CASES ACTIONS (STATION)
    // ==========================================
 
    // 1. Update Case Status (Checklist ticks & Remarks)
    updateStationCaseStatus: async (id, data) => {
        // Yahan JSON data jayega { milestoneStatus: '...', remarks: '...' }39
        const res = await policeStationApi.put(`/policeStation/station/cases/${id}/update-status`, data);
        return res.data;
    },
 
    // 2. Add Evidence (File Upload)
    addStationEvidence: async (id, formData) => {
        // Yahan FormData jayega kyunki File upload hogi
        const res = await policeStationApi.post(`/policeStation/station/cases/${id}/evidence`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },
 
    // 3. Close Case (Final Status & Report Upload)
    closeStationCase: async (id, formData) => {
        // Yahan bhi FormData jayega agar report PDF upload karni hai
        const res = await policeStationApi.put(`/policeStation/station/cases/${id}/close-case`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },
    // 🔒 POLICE STATION APIs (Case Details & Operations)
   
    // 1. Get Single Case Detail
    getStationCaseSummary: async (id) => {
        const res = await policeStationApi.get(`/policeStation/station/cases/${id}/summary`);
        return res.data;
    },
 
    // 2. Get Nearby Stations (For Support Request)
    getNearbyStationsForCase: async (id) => {
        const res = await policeStationApi.get(`/policeStation/station/cases/${id}/nearby-stations`);
        return res.data;
    },
 
    // 3. Send Support/Backup Request
    requestSupportingStation: async (id, data) => {
        const res = await policeStationApi.post(`/policeStation/station/cases/${id}/request-support`, data);
        return res.data;
    },
 
    // 4. Transfer / Re-assign Case to another station
    transferCaseStation: async (id, data) => {
        const res = await policeStationApi.post(`/policeStation/station/cases/${id}/transfer`, data);
        return res.data;
    },
// GET APP CONTENT (Help, Privacy, Terms)
getStationContent: async (type) => {
    const res = await policeStationApi.get(`/policeStation/station/content/${type}`);
    return res.data;
},
updateStationContent: async (type, data) => {
    const res = await policeStationApi.put(`/policeStation/station/content/${type}`, data);
    return res.data;
},
changeStationPassword: async (data) => {
    // data will be { oldPassword: "...", newPassword: "..." }
    const res = await policeStationApi.put('/policeStation/station/change-password', data);
    return res.data;
},
};
 
export default PoliceAPI;
 