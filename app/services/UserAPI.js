import axios from 'axios';

const api = axios.create({
    baseURL: "http://192.168.1.22:5002",
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const UserAPI = {
    getProfile: async () => {
        const response = await api.get("/api/auth/user/profile");
        return response.data;
    },

    addProfileData: async (profileData) => {
        const response = await api.put("/api/auth/user/update", profileData);
        return response.data;
    },

    // Add this to your UserAPI object
    updateSubItem: async (type, itemId, data) => {
        // type should be 'address', 'family', or 'emergency' based on your logic
        const response = await api.put(`/api/auth/user/edit-sub-item/${type}/${itemId}`, data);
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put("/api/auth/user/update", profileData);
        return response.data;
    },


};

export default UserAPI;