import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const AdminAPI = {
    //Add single tests and test packages in Admin
    addSingleTest: async (testData) => {
        const response = await api.post("/admin/add-test", testData);
        return response.data;
    },
    addTestPackageCSV: async (testData) => {
        const response = await api.post('/admin/add-package', testData);
        return response.data;
    },
    getTestsByType: async (type, page = 1, limit = 20, search = "") => {
        const response = await api.get(`/admin/lab/tests/list/${type}`, {
            params: { page, limit, search }
        });
        return response.data;
    },

    //Hospital APIS in Admin
    getAllHospitals: async () => {
        const response = await api.get("/api/admin/approval/hospitals");
        return response.data;
    },
    approveHospital: async (hospitalId) => {
        const response = await api.patch(`/api/admin/approval/hospitals/approve/${hospitalId}`);
        return response.data;
    },
    rejectHospital: async (hospitalId) => {
        const response = await api.patch(`/api/admin/approval/hospitals/reject/${hospitalId}`);
        return response.data;
    },

    //Pharmacy APIS in Admin
    getAllPharmacyInAdmin: async () => {
        const response = await api.get("/api/admin/approval/pharmacy");
        return response.data;
    },
    approvePharmacyByAdmin: async (pharmacyId) => {
        const response = await api.patch(`/api/admin/approval/pharmacy/approve/${pharmacyId}`);
        return response.data;
    },
    rejectPharmacyByAdmin: async (pharmacyId, reason) => {
        const response = await api.patch(`/api/admin/approval/pharmacy/reject/${pharmacyId}`, {
            rejectionReason: reason
        });
        return response.data;
    },

    //Lab APIS in Admin
    getLabsList: async () => {
        const response = await api.get("/api/admin/approval/lab");
        return response.data;
    },
    approveLab: async (labId) => {
        const response = await api.patch(`/api/admin/approval/lab/approve/${labId}`);
        return response.data;
    },
    rejectLab: async (labId, reason) => {
        const response = await api.patch(`/api/admin/approval/lab/reject/${labId}`, {
            rejectionReason: reason
        });
        return response.data;
    },

    //Doctor APIS in Admin
    getDoctorsList: async () => {
        const response = await api.get("/api/admin/approval/doctors");
        return response.data;
    },
    approveDoctor: async (doctorId) => {
        const response = await api.patch(`/api/admin/approval/doctors/approve/${doctorId}`);
        return response.data;
    },
    rejectDoctor: async (doctorId, reason) => {
        const response = await api.patch(`/api/admin/approval/doctors/reject/${doctorId}`, {
            rejectionReason: reason
        });
        return response.data;
    },

    //Doctor Specialties and Qualifications Management
    viewDoctorSpecialties: async () => {
        const response = await api.get('/admin/doctor-data/specializations');
        return response.data;
    },
    addDoctorSpecialty: async (specialtyData) => {
        const response = await api.post('/admin/doctor-data/add-specialization', specialtyData);
        return response.data;
    },
    updateDoctorSpecialty: async (id, specialtyData) => {
        const response = await api.put(`/admin/doctor-data/update-specialization/${id}`, specialtyData);
        return response.data;
    },
    deleteDoctorSpecialty: async (id) => {
        const response = await api.delete(`/admin/doctor-data/delete-specialization/${id}`);
        return response.data;
    },

    viewDoctorQualifications: async () => {
        const response = await api.get('/admin/doctor-data/qualifications');
        return response.data;
    },
    addDoctorQualification: async (qualificationData) => {
        const response = await api.post('/admin/doctor-data/add-qualification', qualificationData);
        return response.data;
    },
    updateDoctorQualification: async (id, qualificationData) => {
        const response = await api.put(`/admin/doctor-data/update-qualification/${id}`, qualificationData);
        return response.data;
    },
    deleteDoctorQualification: async (id) => {
        const response = await api.delete(`/admin/doctor-data/delete-qualification/${id}`);
        return response.data;
    },

    

};

export default AdminAPI;