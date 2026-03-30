import axios from 'axios';

const adminAPI = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor handles the token automatically for all functions below
adminAPI.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const AdminService = {
    /**
     * Upload Medicine CSV
     * @param {File} file - The CSV file object from the input field
     */
    addMedicineByAdminCSV: async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        // We use adminAPI instead of axios.post
        // The '/pharmacy/medicine/upload' is appended to the baseURL
        const response = await adminAPI.post('/pharmacy/medicine/upload', formData, {
            headers: {
                // Overwrite Content-Type for this specific request to handle file upload
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },
};

export default adminAPI;