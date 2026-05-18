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
        const token = localStorage.getItem('firestationToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const FireStationAPI = {
    // Register New Fire Station
    LoginFireStation: async (stationData) => {
        const response = await api.post('/fireStation/auth/login', stationData);
        return response.data;
    },

    LoginFireHQ: async (stationData) => {
        const response = await api.post('fireHQ/auth/login', stationData);
        return response.data;
    },


    getProfile: async () => {
        const response = await api.get('/fireStation/auth/profile');
        return response.data;
    },
    getJurisdiction: async () => {
        const response = await api.get('/fireStation/management/jurisdiction');
        return response.data;
    },

    requestJurisdictionUpdate: async () => {
        const response = await api.put('/fireStation/management/request-jurisdiction-update');
        return response.data;
    },

    // 3. Update Profile (raw body  data ke saath)
    UpdateProfile: async (formData) => {
        const response = await api.put('/fireStation/auth/profile/update', formData, {

        });
        return response.data;
    },
    UpdatePassword: async (formData) => {
        const response = await api.put('/fireStation/auth/password/update', formData, {

        });
        return response.data;
    },
    // POST: Create New Incident / Case
    createCase: async (caseData) => {
        const response = await api.post('/fireStation/management/create-case', caseData);
        return response.data;
    },


    GetDashboardStats: async () => {
        const response = await api.get('/fireStation/management/dashboard');
        return response.data;
    },
    // GET: Staff List
    GetStaffList: async () => {
        const response = await api.get('/fireStation/management/staff/list');
        return response.data;
    },

    // POST: Add New Staff
    AddStaff: async (staffData) => {
        const response = await api.post('/fireStation/management/staff/add', staffData);
        return response.data;
    },

    // GET: Fleet List
    GetFleetList: async () => {
        const response = await api.get('/fireStation/management/fleet/list');
        return response.data;
    },

    // POST: Add New Vehicle
    AddVehicle: async (vehicleData) => {
        const response = await api.post('/fireStation/management/fleet/add', vehicleData);
        return response.data;
    },
    // GET: Equipment List
    GetEquipmentList: async () => {
        const response = await api.get('/fireStation/ops/equipment');
        return response.data;
    },

    // POST: Add New Equipment
    AddEquipment: async (equipmentData) => {
        const response = await api.post('/fireStation/ops/equipment', equipmentData);
        return response.data;
    },

    // PUT: Update Equipment Status / Qty
    UpdateEquipment: async (id, updateData) => {
        const response = await api.put(`/fireStation/ops/equipment/${id}`, updateData);
        return response.data;
    },

    GetRoster: async (shiftType) => {
        // 'shift=' ko hatakar 'shiftType=' kar diya gaya hai
        const response = await api.get(`/fireStation/ops/roster?shiftType=${shiftType}`);
        console.log('Roster Response:', response.data); // Debug log
        return response.data;
    },

    // GET: Pending Leaves
    GetPendingLeaves: async () => {
        const response = await api.get('/fireStation/ops/leaves/pending');
        console.log('Pending Leaves Response:', response.data); // Debug log
        return response.data;
    },

    // PUT: Update Leave Status (Approve / Reject)
    UpdateLeaveStatus: async (id, statusData) => {
        const response = await api.put(`/fireStation/ops/leaves/${id}/status`, statusData);
        return response.data;
    },

    // GET: Fresh Incident Cases
    GetFreshCases: async () => {
        const response = await api.get('/fireStation/management/cases/fresh');
        return response.data;
    },

    // PUT: Accept / Dispatch Case
    AcceptCase: async (id) => {
        const response = await api.put(`/fireStation/management/cases/accept/${id}`);
        return response.data;
    },
    // -------------------------------------------------
    // GET: Accepted/Ongoing Cases
    GetOngoingCases: async () => {
        const response = await api.get('/fireStation/management/cases/accepted');
        console.log('Ongoing Cases Response:', response.data); // Debug log
        return response.data;
    },


    // PUT: Update Severity / Status / Remarks
    UpdateCaseSeverity: async (id, updateData) => {
        const response = await api.put(`/fireStation/ops/cases/${id}/severity`, updateData);
        return response.data;
    },

    // POST: Final Incident Report (Multipart/Form-Data)
    SubmitFinalReport: async (id, formData) => {
        const response = await api.post(`/fireStation/ops/cases/${id}/final-report`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    // GET: Fetch Fire/Incident Types for Dropdown
    GetFireTypes: async () => {
        const response = await api.get('/fireStation/ops/fire-types');
        console.log('Fire Types Response:', response.data); // Debug log
        return response.data;
    },


    // GET: Case History
    GetCaseHistory: async () => {
        const response = await api.get('/fireStation/management/cases/history');
        return response.data;
    },
    GetIncidentReport: async (id) => {
        const response = await api.get(`/fireStation/management/report/${id}`);
        return response.data;
    },
    // Add this inside your FireStationAPI object
    getNotifications: async () => {
        const response = await api.get('/fireStation/management/notifications');
        return response.data;
    },

    markAllNotificationsRead: async () => {
        const response = await api.put('/fireStation/management/notifications/mark-read');
        return response.data;
    },
    AssignResourcesToCase: async (payload) => {
        const response = await api.put('/fireStation/management/cases/assign-resources', payload);
        return response.data;
    },

    // -------------------------------------------------------



    // POST: Update Status with Images (Multipart/form-data)
    UpdateCaseStatus: async (id, formData) => {
        const response = await api.put(`/fireStation/management/cases/update-status/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // --- NEW LEAVE APIS ---
    GetStaffDropdown: async () => {
        const response = await api.get('/fireStation/ops/staff-dropdown');
        return response.data;
    },

    GetLeaveEnums: async () => {
        const response = await api.get('/fireStation/ops/leaves/enums');
        return response.data;
    },

    // Multipart/form-data for file upload
    CreateLeaveRequest: async (formData) => {
        const response = await api.post('/fireStation/ops/leaves/post', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
};


export default FireStationAPI;
