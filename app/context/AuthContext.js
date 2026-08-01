"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // --- STATE ---
    const [loading, setLoading] = useState(true);

    // User & Admin
    const [user, setUser] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [admin, setAdmin] = useState(null);

    // Vendors (Lab, Nursing, Pharmacy)
    const [provider, setProvider] = useState(null);
    const [labToken, setLabToken] = useState(null);
    const [nursingToken, setNursingToken] = useState(null);
    const [pharmacyToken, setPharmacyToken] = useState(null);

    // --- HYDRATION (Load from LocalStorage on mount) ---
    useEffect(() => {
        const hydrateAuth = () => {
            try {
                // User & Admin Hydration
                const storedUToken = localStorage.getItem("userToken");
                const storedUser = localStorage.getItem("user");
                const storedAdmin = localStorage.getItem("admin");
                if (storedUToken) setUserToken(storedUToken);
                if (storedUser) setUser(JSON.parse(storedUser));
                if (storedAdmin) setAdmin(JSON.parse(storedAdmin));

                // Lab Vendor Hydration
                const storedLToken = localStorage.getItem("labToken");
                const storedLProvider = localStorage.getItem("labProvider");
                if (storedLToken) setLabToken(storedLToken);
                if (storedLProvider) setProvider(JSON.parse(storedLProvider));

                // Nursing Vendor Hydration
                const storedNToken = localStorage.getItem("nursingToken");
                const storedNProvider = localStorage.getItem("nursingProvider");
                if (storedNToken) setNursingToken(storedNToken);
                if (storedNProvider) setProvider(JSON.parse(storedNProvider));

                // Pharmacy Vendor Hydration
                const storedPToken = localStorage.getItem("pharmacyToken");
                const storedPProvider = localStorage.getItem("pharmacyProvider");
                if (storedPToken) setPharmacyToken(storedPToken);
                if (storedPProvider) setProvider(JSON.parse(storedPProvider));

            } catch (error) {
                console.error("Failed to hydrate auth state:", error);
            } finally {
                setLoading(false);
            }
        };

        hydrateAuth();
    }, []);

    // Helper to get the correct storage key prefix
    const getProviderKey = (category) => {
        const cat = category?.toLowerCase();
        if (cat === "nurse") return "nurse";
        if (cat === "pharmacy") return "pharmacy";
        if (cat === "lab") return "lab";
        return "provider";
    };

    const loginAsAdmin = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${API_URL}/api/auth/admin/login`,
                userData
            );

            const { token, admin } = response.data;
            setAdmin(admin);
            localStorage.setItem("token", token);
            localStorage.setItem("admin", JSON.stringify(admin));

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const registerAsUser = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/user/register`, userData);
            const { token, user } = response.data;

            // SAVE BOTH TO LOCAL STORAGE
            localStorage.setItem("userToken", token);
            localStorage.setItem("user", JSON.stringify(user));
            
            // UPDATE STATE FOR IMMEDIATE RE-RENDERING
            setUser(user);
            setUserToken(token);
            
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Registration failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const loginAsUser = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/user/login`, userData);
            const { token, user } = response.data;

            // SAVE BOTH TO LOCAL STORAGE
            localStorage.setItem("userToken", token);
            localStorage.setItem("user", JSON.stringify(user));

            // UPDATE STATE FOR IMMEDIATE RE-RENDERING
            setUser(user);
            setUserToken(token);
            
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const uploadHospitalDocuments = async (userData) => {
        try {
            setLoading(true);

            const hospitalToken = localStorage.getItem("hospitalToken");
            const response = await axios.put(`${API_URL}/api/auth/hospital/update`,
                userData,
                {
                    headers: {
                        'Authorization': `Bearer ${hospitalToken}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Upload failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP & Save Token
    const verifyDoctorOtp = async (phone, otp) => {
        const response = await axios.post(`${API_URL}/api/auth/doctor/verify-otp`, { phone, otp });
        if (response.data.token) {
            localStorage.setItem("doctorToken", response.data.token);
            setUser(response.data.user);
        }
        return response.data;
    };

    const uploadDoctorDocuments = async (formData) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.put(`${API_URL}/api/auth/doctor/upload-docs`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data?.message || "Document upload failed");
        } finally {
            setLoading(false);
        }
    };

    // ================= REGISTER SERVICE PROVIDER =================
    const registerAsServiceProvider = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/provider/register`, userData);
            const { token, data } = response.data;

            const key = getProviderKey(userData.category);

            localStorage.setItem(`${key}Token`, token);
            localStorage.setItem(`${key}User`, JSON.stringify(data));

            setProvider(user);
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || "Registration failed";
            return Promise.reject(message);
        }
        finally {
            setLoading(false);
        }
    }

    // ================= LOGIN SERVICE PROVIDER =================
    const loginAsServiceProvider = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/provider/login`, userData);
            return response.data;
        } catch (error) {
            return Promise.reject(error.response?.data?.message || "Login failed");
        }
    };

    const uploadLabDocuments = async (userData) => {
        try {
            setLoading(true);
            const labToken = localStorage.getItem("labToken");

            const response = await axios.put(`${API_URL}/api/auth/provider/upload-docs/lab`,
                userData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        'Authorization': `Bearer ${labToken}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Document upload failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const uploadPharmacyDocuments = async (userData) => {
        try {
            setLoading(true);
            const pharmacyToken = localStorage.getItem("pharmacyToken");

            const response = await axios.put(`${API_URL}/api/auth/provider/upload-docs/pharmacy`,
                userData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        'Authorization': `Bearer ${pharmacyToken}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Document upload failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const uploadNurseDocuments = async (userData) => {
        try {
            setLoading(true);
            const nurseToken = localStorage.getItem("nurseToken");

            const response = await axios.put(`${API_URL}/api/auth/provider/upload-docs/nurse`,
                userData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        'Authorization': `Bearer ${nurseToken}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Document upload failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const loginFireHeadquarter = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${API_URL}/fireHQ/auth/login`,
                userData
            );
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const forgotPassword = async (email) => {
        const res = await axios.post(
            `${API_URL}/api/password/forgot-password`,
            { email }
        );
        return res.data;
    };

    const verifyOtp = async (email, otp) => {
        const res = await axios.post(
            `${API_URL}/api/password/verify-otp`,
            { email, otp }
        );
        return res.data;
    };

    const resetPassword = async (email, newPassword, confirmPassword) => {
        const res = await axios.post(
            `${API_URL}/api/password/reset-password`,
            { email, newPassword, confirmPassword }
        );
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");

        setUser(null);
        setUserToken(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            userToken, // EXPOSED SO NAVBAR CAN REACT TO CHANGES INSTANTLY
            admin,
            loading,
            logout,
            provider,
            labToken,
            nursingToken,
            pharmacyToken,
            registerAsUser,
            registerAsServiceProvider,
            loginAsUser,
            loginAsServiceProvider,
            uploadLabDocuments,
            loginAsAdmin,
            forgotPassword,
            verifyOtp,
            resetPassword,
            uploadHospitalDocuments,
            uploadPharmacyDocuments,
            uploadNurseDocuments,
            loginFireHeadquarter,
            verifyDoctorOtp,
            uploadDoctorDocuments,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);