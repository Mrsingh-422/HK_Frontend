"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [hospital, setHospital] = useState(null);
    const [hospitalToken, setHospitalToken] = useState(null);
    const [user, setUser] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [admin, setAdmin] = useState(null);

    // New states for specific vendors
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hydrateAuth = () => {
            const storedToken = localStorage.getItem("userToken");
            const storedUser = localStorage.getItem("user");
            const storedAdmin = localStorage.getItem("admin");
            const storedHToken = localStorage.getItem("hospitalToken");
            const storedHospital = localStorage.getItem("hospital");

            // Hydrate Vendor Specific Data
            // We check for all possible provider types
            const providerTypes = ["nursing", "pharmacy", "lab"];
            // let foundProvider = null;

            // providerTypes.forEach(type => {
            //     const pData = localStorage.getItem(`${type}User`);
            //     if (pData) foundProvider = JSON.parse(pData);
            // });

            if (storedToken) setUserToken(storedToken);
            if (storedUser) setUser(JSON.parse(storedUser));
            if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
            if (storedHToken) setHospitalToken(storedHToken);
            if (storedHospital) setHospital(JSON.parse(storedHospital));
            // if (foundProvider) setProvider(foundProvider);

            setLoading(false);
        };

        hydrateAuth();
    }, []);
    // Helper to get the correct storage key prefix
    const getProviderKey = (category) => {
        const cat = category?.toLowerCase();
        if (cat === "nursing") return "nursing";
        if (cat === "pharmacy") return "pharmacy";
        if (cat === "lab") return "lab";
        return "provider"; // fallback
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
            const message =
                error.response?.data?.message || "Login failed";
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
            setUser(user);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || "Registration failed";
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

            setUser(user);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const registerAsHospital = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/hospital/register`, userData);
            const { token, data } = response.data;
            localStorage.setItem("hospitalToken", token);
            setHospitalToken(token);
            localStorage.setItem("hospital", JSON.stringify(data));
            setHospital(data);
            return response.data;
        }
        catch (error) {
            const message =
                error.response?.data?.message || "Registration failed";
            return Promise.reject(message);
        }
        finally {
            setLoading(false);
        }
    }

    // 2. REFINED LOGIN FUNCTION
    const loginAsHospital = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/hospital/login`, userData);

            // The response you shared: { success, fullAccess, profileStatus, message, data, token }
            const { token, data, profileStatus, fullAccess } = response.data;

            // Create a merged object so state always has the latest status
            const hospitalData = { ...data, profileStatus, fullAccess };

            localStorage.setItem("hospitalToken", token);
            localStorage.setItem("hospital", JSON.stringify(hospitalData));

            setHospitalToken(token);
            setHospital(hospitalData);

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const registerAsDoctorAppointment = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/auth/register/doctor-appointment`, userData);
            const { token, user } = response.data;
            setUser(user);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || "Registration failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    }

    const uploadHospitalDocuments = async (userData) => {
        try {
            setLoading(true);

            const hospitalToken = localStorage.getItem("hospitalToken");
            const response = await axios.put(`${API_URL}/api/auth/hospital/update`,
                userData,
                {
                    headers: {
                        'Authorization': `Bearer ${hospitalToken}` // Send token as Bearer token
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

    const loginAsDoctorAppointment = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${API_URL}/auth/login/doctor-appointment`,
                userData
            );
            const { token, user } = response.data;
            setUser(user);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    // ================= REGISTER SERVICE PROVIDER =================
    const registerAsServiceProvider = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/provider/register`, userData);
            const { token, user } = response.data;

            // Determine key (nursingToken, pharmacyToken, or labToken)
            const key = getProviderKey(userData.category);

            // SAVE TO LOCAL STORAGE WITH DYNAMIC KEYS
            localStorage.setItem(`${key}Token`, token);
            localStorage.setItem(`${key}User`, JSON.stringify(user));

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
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/provider/login`, userData);

            // Extracting properties exactly like loginAsHospital
            const { token, data, profileStatus, fullAccess } = response.data;

            // Create a merged object so the state/storage always has the latest status
            const providerData = { ...data, profileStatus, fullAccess };

            // Identify the correct key (nursing, pharmacy, or lab)
            const category = providerData?.category || userData.category;
            const key = getProviderKey(category);

            // SAVE TO LOCAL STORAGE WITH DYNAMIC KEYS (matching your hospital logic)
            localStorage.setItem(`${key}Token`, token);
            localStorage.setItem(`${key}Provider`, JSON.stringify(providerData));

            // Update the state
            setProvider(providerData);

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const uploadLabDocuments = async (userData) => {
        try {
            setLoading(true);

            // Retrieve the specific token for the Lab vendor
            const labToken = localStorage.getItem("labToken");

            const response = await axios.put(`${API_URL}/api/auth/provider/upload-docs/lab`,
                userData,
                {
                    headers: {
                        'Authorization': `Bearer ${labToken}` // Send token as Bearer token
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

    // 1️⃣ SEND OTP
    const forgotPassword = async (email) => {
        const res = await axios.post(
            `${API_URL}/api/password/forgot-password`,
            { email }
        );
        return res.data;
    };

    // 2️⃣ VERIFY OTP
    const verifyOtp = async (email, otp) => {
        const res = await axios.post(
            `${API_URL}/api/password/verify-otp`,
            { email, otp }
        );
        return res.data;
    };

    // 3️⃣ RESET PASSWORD
    const resetPassword = async (email, newPassword, confirmPassword) => {
        alert(email, newPassword, confirmPassword);
        const res = await axios.post(
            `${API_URL}/api/password/reset-password`,
            { email, newPassword, confirmPassword }
        );
        return res.data;
    };


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        localStorage.removeItem("user");
        localStorage.removeItem("hospitalToken");
        localStorage.removeItem("hospital");
        setAdmin(null);
        setUser(null);
        setHospital(null)
    };


    return (
        <AuthContext.Provider value={{
            user,
            admin,
            loading,
            logout,
            hospital,
            hospitalToken,
            registerAsUser,
            registerAsDoctorAppointment,
            registerAsServiceProvider,
            registerAsHospital,
            loginAsUser,
            loginAsDoctorAppointment,
            loginAsServiceProvider,
            uploadLabDocuments,
            loginAsAdmin,
            loginAsHospital,
            forgotPassword,
            verifyOtp,
            resetPassword,
            uploadHospitalDocuments,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);