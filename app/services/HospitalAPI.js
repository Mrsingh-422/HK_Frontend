import axios from 'axios';
 
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
 
/**
* TOKEN HELPERS
*/
const getHospitalToken = () => typeof window !== 'undefined' ? localStorage.getItem('hospitalToken') : null;
;
 
/**
* 1. PUBLIC API (No Token Required)
*/
const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});
 
/**
* 2. LAB VENDOR API (Strict Lab Token Only)
*/
const hospitalVendorApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});
 
/**
* 3. ANYONE API (Lab, Pharmacy, or Nurse Token)
*/
const anyOneApi = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});
 
/**
* INTERCEPTORS
*/
 
// Strict Lab Token Interceptor
hospitalVendorApi.interceptors.request.use((config) => {
    const token = getHospitalToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
 
// Any Token Interceptor
anyOneApi.interceptors.request.use((config) => {
    const token = getAnyToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
 
const HospitalAPI = {
  getHospitalProfile: async () => {
    const response = await hospitalVendorApi.get('/api/auth/hospital/profile');
    console.log("Hospital Profile API Response:", response.data);
    return response.data;
  },
  updateHospitalProfile: async (formData) => {
    const response = await hospitalVendorApi.put('/api/auth/hospital/profile/update', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
  } ,
 
    // GET: Fetch all coupons
    getCouponsList: async () => {
        const response = await hospitalVendorApi.get('/hospital/panel/coupon/list');
        console.log("Coupons List API Response:", response.data);
        return response.data;
      },
   
      // POST: Generate new coupon
      generateCoupon: async (couponData) => {
        const response = await hospitalVendorApi.post('/hospital/panel/coupon/generate', couponData);
        return response.data;
 
      },
     
  getServicesList: async () => {
    try {
      const response = await hospitalVendorApi.get('/hospital/panel/services');
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
 
 
  addService: async (formData) => {
    try {
      const response = await hospitalVendorApi.post('/hospital/panel/service/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to add service" };
    }
  },
 
 
  updateService: async (id, formData) => {
    try {
      const response = await hospitalVendorApi.put(`/hospital/panel/service/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update service" };
    }
  },
   
// 8. NAYA: Get Beds by Ward ID
getBedsByWard: async (wardId) => {
    try {
      // Adjust prefix according to your backend setup (e.g. /api/auth/...)
      const response = await hospitalVendorApi.get(`/hospital/panel/ward/${wardId}/beds`);
      console.log(`Beds for Ward ${wardId} API Response:`, response.data);
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
 
  // 9. NAYA: Update Ward Capacity (Add/Remove Beds)
  updateWardCapacity: async (data) => {
    try {
      const response = await hospitalVendorApi.put('/hospital/panel/ward/update-beds', data);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update capacity" };
    }
  },
 
  // 10. NAYA: Update Bed Status
  updateBedStatus: async (data) => {
    try {
      const response = await hospitalVendorApi.patch('/hospital/panel/bed/status', data);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update bed status" };
    }
  },
 
    // ==========================================
  // AMBULANCE MANAGEMENT APIs
  // ==========================================
 
  // 1. Add Ambulance (POST - Multipart/FormData)
  addAmbulance: async (formData) => {
    try {
      const response = await hospitalVendorApi.post('/api/hospital/ambulance/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to add ambulance" };
    }
  },
 
  // 2. Get All Hospital Ambulances (GET)
  getMyAmbulances: async () => {
    try {
      const response = await hospitalVendorApi.get('/api/hospital/ambulance/my-ambulances');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch ambulances" };
    }
  },
 
  // 3. Update Ambulance Details (PUT - Multipart/FormData)
  updateAmbulance: async (id, formData) => {
    try {
      const response = await hospitalVendorApi.put(`/api/hospital/ambulance/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update ambulance" };
    }
  },
 
  // 4. Delete Ambulance (DELETE)
  deleteAmbulance: async (id) => {
    try {
      const response = await hospitalVendorApi.delete(`/api/hospital/ambulance/delete/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to delete ambulance" };
    }
  },
  // ==========================================
  // WARD MANAGEMENT APIs
  // ==========================================
 
  // 1. Get All Wards List
  getWardsList: async () => {
    try {
      const response = await hospitalVendorApi.get('/hospital/panel/wards/list');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch wards" };
    }
  },
 
  // 2. Update Ward Info
  updateWard: async (wardId, data) => {
    try {
      const response = await hospitalVendorApi.put(`/hospital/panel/ward/update/${wardId}`, data);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update ward" };
    }
  },
 
  // 3. Delete Ward
  deleteWard: async (wardId) => {
    try {
      const response = await hospitalVendorApi.delete(`/hospital/panel/ward/delete/${wardId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to delete ward" };
    }
  },
   // 1. Create New Ward (With Auto Beds)
   createWard: async (data) => {
    try { const res = await hospitalVendorApi.post('/hospital/panel/ward/create', data); return res.data; }
    catch (err) { return { success: false, message: err.response?.data?.message }; }
  },
 
  // 2. Get Ward Beds (Grid View)
  getWardBeds: async (wardId) => {
    try { const res = await hospitalVendorApi.get(`/hospital/panel/ward/${wardId}/beds`); return res.data; }
    catch (err) { return { success: false, message: err.response?.data?.message }; }
  },
 
  // 3. Bulk Update Ward Capacity (Add/Remove)
  updateWardCapacity: async (data) => {
    try { const res = await hospitalVendorApi.put('/hospital/panel/ward/update-beds', data); return res.data; }
    catch (err) { return { success: false, message: err.response?.data?.message }; }
  },
 
  // 4. Delete Specific Bed
  deleteBed: async (bedId) => {
    try { const res = await hospitalVendorApi.delete(`/hospital/panel/bed/delete/${bedId}`); return res.data; }
    catch (err) { return { success: false, message: err.response?.data?.message }; }
  },
  getEnums: async () => {
    try {
      // Adjusted based on the URL you provided
      const response = await hospitalVendorApi.get('/hospital/panel/get-enums');
      console.log("Get Enums API Response:", response.data);
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  // ==========================================
  // HOSPITAL DOCTOR MANAGEMENT APIs
  // ==========================================
 
  // 1. Add Doctor (POST - Multipart)
  addHospitalDoctor: async (formData) => {
    try {
      const response = await hospitalVendorApi.post('/api/hospital/doctors/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to add doctor" };
    }
  },
 
  // 2. Get All Doctors (GET)
  getHospitalDoctors: async () => {
    try {
      const response = await hospitalVendorApi.get('/api/hospital/doctors/my-doctors');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch doctors" };
    }
  },
 
  // 3. Update Doctor (PUT - Multipart)
  updateHospitalDoctor: async (id, formData) => {
    try {
      const response = await hospitalVendorApi.put(`/api/hospital/doctors/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update doctor" };
    }
  },
 
  // 4. Delete Doctor (DELETE)
  deleteHospitalDoctor: async (id) => {
    try {
      const response = await hospitalVendorApi.delete(`/api/hospital/doctors/delete/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to delete doctor" };
    }
  },
  // ==========================================
  // ADMISSIONS APIs
  // ==========================================
 
  // Fetch All Admissions
  getAdmissions: async () => {
    try {
      const response = await hospitalVendorApi.get('/hospital/panel/admissions/all');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch admissions" };
    }
  },
  // ==========================================
  // AMBULANCE ASSIGNMENT & DISCHARGE APIs
  // ==========================================
 
  // 1. Get Available Drivers (On Duty)
  getAvailableDrivers: async () => {
    try {
      const response = await hospitalVendorApi.get('/api/hospital/panel/available-drivers');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch drivers" };
    }
  },
 
  // 2. Assign Driver to Case
  assignDriver: async (data) => {
    try {
      // data format: { caseId: '...', driverId: '...' }
      const response = await hospitalVendorApi.post('/api/hospital/panel/assign-driver', data);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to assign driver" };
    }
  },
 
  // 3. Finalize Discharge & Billing
  finalizeDischarge: async (data) => {
    try {
      // data format: { appointmentId: '...', billingItems: [{name, price}] }
      const response = await hospitalVendorApi.post('/api/hospital/panel/discharge/finalize', data);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to process discharge" };
    }
  },
 
  // Fetch Emergency Cases
  getEmergencyCases: async () => {
    try {
      const response = await hospitalVendorApi.get('/hospital/panel/emergency-cases');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch emergency cases" };
    }
  },
  // ==========================================
  // DASHBOARD APIs
  // ==========================================
 
  getDashboardStats: async () => {
    try {
      const response = await hospitalVendorApi.get('/hospital/panel/dashboard-stats');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch stats" };
    }
  },
  // ==========================================
  // DOCTORS & ADMISSION APPROVAL APIs
  // ==========================================
 
  // Fetch Hospital's Own Doctors
  getHospitalDoctors: async () => {
    try {
      const response = await hospitalVendorApi.get('/api/hospital/doctors/my-doctors');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch doctors" };
    }
  },
 
  // Assign Doctor (Approve Pending Admission)
  assignDoctorToAdmission: async (data) => {
    try {
      // data format: { appointmentId: '...', doctorId: '...' }
      const response = await hospitalVendorApi.post('/hospital/panel/admissions/assign-doctor', data);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to assign doctor" };
    }
  },
  // ==========================================
  // BED ADMISSION API
  // ==========================================
 
  // Admit Patient to Specific Bed
  admitPatientToBed: async (data) => {
    try {
      // data format: { appointmentId: '...', bedId: '...' }
      // NOTE: User url says /api/hospital/panel/ward/admit-patient
      const response = await hospitalVendorApi.post('/hospital/panel/ward/admit-patient', data);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to admit patient to bed" };
    }
  },
}
export default HospitalAPI;
 