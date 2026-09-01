"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // --- STATE ---
    const [loading, setLoading] = useState(true);

    // 1. User (Patient)
    const [user, setUser] = useState(null);
    const [userToken, setUserToken] = useState(null);

    // 2. Doctor
    const [doctor, setDoctor] = useState(null);
    const [doctorToken, setDoctorToken] = useState(null);

    // 3. Service Providers (Lab, Nurse, Pharmacy)
    const [provider, setProvider] = useState(null);
    const [providerToken, setProviderToken] = useState(null);
    const [providerCategory, setProviderCategory] = useState(null);
    const [labToken, setLabToken] = useState(null);
    const [nurseToken, setNurseToken] = useState(null);
    const [nursingToken, setNursingToken] = useState(null);
    const [pharmacyToken, setPharmacyToken] = useState(null);

    // 4. Hospital & Admin
    const [hospital, setHospital] = useState(null);
    const [hospitalToken, setHospitalToken] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [adminToken, setAdminToken] = useState(null);

    // Helper for clean base URL without trailing slashes
    const getBaseUrl = () => API_URL?.replace(/\/+$/, "") || "";

    // --- HYDRATION (Load from LocalStorage on mount) ---
    useEffect(() => {
        const hydrateAuth = () => {
            try {
                // User & Admin
                const storedUToken = localStorage.getItem("userToken");
                const storedUser = localStorage.getItem("user");
                const storedAdmin = localStorage.getItem("admin");
                const storedAToken = localStorage.getItem("adminToken") || localStorage.getItem("token");

                if (storedUToken) setUserToken(storedUToken);
                if (storedUser) setUser(JSON.parse(storedUser));
                if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
                if (storedAToken) setAdminToken(storedAToken);

                // Doctor
                const storedDToken = localStorage.getItem("doctorToken") || localStorage.getItem("independentDoctorToken") || localStorage.getItem("hospitalDoctorToken");
                const storedDoctor = localStorage.getItem("doctorUser") || localStorage.getItem("doctor");
                if (storedDToken) setDoctorToken(storedDToken);
                if (storedDoctor) setDoctor(JSON.parse(storedDoctor));

                // Providers (Lab, Nurse, Pharmacy)
                const storedLToken = localStorage.getItem("labToken");
                const storedLProvider = localStorage.getItem("labProvider") || localStorage.getItem("labUser");
                if (storedLToken) setLabToken(storedLToken);

                const storedNToken = localStorage.getItem("nurseToken") || localStorage.getItem("nursingToken");
                const storedNProvider = localStorage.getItem("nursingProvider") || localStorage.getItem("nurseUser");
                if (storedNToken) {
                    setNurseToken(storedNToken);
                    setNursingToken(storedNToken);
                }

                const storedPhToken = localStorage.getItem("pharmacyToken");
                const storedPProvider = localStorage.getItem("pharmacyProvider") || localStorage.getItem("pharmacyUser");
                if (storedPhToken) setPharmacyToken(storedPhToken);

                // Generic Provider Object
                const storedProvider = storedLProvider || storedNProvider || storedPProvider || localStorage.getItem("providerUser");
                if (storedProvider) setProvider(JSON.parse(storedProvider));

                const storedCategory = localStorage.getItem("providerCategory");
                if (storedCategory) setProviderCategory(storedCategory);

                const storedPToken = localStorage.getItem("providerToken") || storedLToken || storedNToken || storedPhToken;
                if (storedPToken) setProviderToken(storedPToken);

                // Hospital
                const storedHToken = localStorage.getItem("hospitalToken");
                const storedHospital = localStorage.getItem("hospitalUser") || localStorage.getItem("hospital");
                if (storedHToken) setHospitalToken(storedHToken);
                if (storedHospital) setHospital(JSON.parse(storedHospital));

            } catch (error) {
                console.error("Failed to hydrate auth state:", error);
            } finally {
                setLoading(false);
            }
        };

        hydrateAuth();
    }, []);

    const getProviderKey = (category) => {
        const cat = category?.toLowerCase();
        if (cat === "nurse" || cat === "nursing") return "nurse";
        if (cat === "pharmacy") return "pharmacy";
        if (cat === "lab") return "lab";
        return "provider";
    };

    // =========================================================================
    // 1. USER (PATIENT) METHODS
    // =========================================================================

    const checkUserExists = async (payload) => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/user/check-exists`, payload);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                console.warn("Pre-check endpoint /api/auth/user/check-exists returned 404. Proceeding to SMS OTP.");
                return { exists: false, success: true };
            }
            const message = error.response?.data?.message || error.message || "Failed to check user availability";
            return Promise.reject(message);
        }
    };

    const registerAsUser = async (userData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/user/register`, userData);
            const { token, user: registeredUser } = response.data;

            if (token) {
                localStorage.setItem("userToken", token);
                setUserToken(token);
            }
            if (registeredUser) {
                localStorage.setItem("user", JSON.stringify(registeredUser));
                setUser(registeredUser);
            }

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Registration failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const loginAsUser = async (userData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/user/login`, userData);
            const { token, user: loggedInUser } = response.data;

            if (token) {
                localStorage.setItem("userToken", token);
                setUserToken(token);
            }
            if (loggedInUser) {
                localStorage.setItem("user", JSON.stringify(loggedInUser));
                setUser(loggedInUser);
            }

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 2. DOCTOR METHODS
    // =========================================================================

    const checkDoctorExists = async (payload) => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/doctor/check-exists`, payload);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                console.warn("Pre-check endpoint /api/auth/doctor/check-exists returned 404. Proceeding to SMS OTP.");
                return { exists: false, success: true };
            }
            const message = error.response?.data?.message || error.message || "Failed to check doctor availability";
            return Promise.reject(message);
        }
    };

    const registerAsDoctor = async (doctorData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/doctor/register`, doctorData);
            const { token, doctorId, profileStatus, data } = response.data;

            if (token) {
                localStorage.setItem("doctorToken", token);
                setDoctorToken(token);
            }
            if (data) {
                localStorage.setItem("doctorUser", JSON.stringify(data));
                setDoctor(data);
            }
            localStorage.setItem("doctorStatus", profileStatus || "Incomplete");

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Doctor registration failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const loginAsDoctor = async (credentials) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/doctor/login`, credentials);
            const { token, data, profileStatus } = response.data;

            if (token) {
                localStorage.setItem("doctorToken", token);
                setDoctorToken(token);
            }
            if (data) {
                localStorage.setItem("doctorUser", JSON.stringify(data));
                setDoctor(data);
            }
            if (profileStatus) {
                localStorage.setItem("doctorStatus", profileStatus);
            }

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Doctor login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const uploadDoctorDocuments = async (formData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const token = localStorage.getItem("doctorToken") || localStorage.getItem("token");
            const response = await axios.put(`${baseUrl}/api/auth/doctor/upload-docs`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Document upload failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 3. SERVICE PROVIDER (LAB, PHARMACY, NURSE) METHODS
    // =========================================================================

    const checkProviderExists = async (payload) => {
        try {
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/provider/check-exists`, payload);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                console.warn("Pre-check endpoint /api/auth/provider/check-exists returned 404. Proceeding to SMS OTP.");
                return { exists: false, success: true };
            }
            const message = error.response?.data?.message || error.message || "Failed to check provider availability";
            return Promise.reject(message);
        }
    };

    const registerAsServiceProvider = async (userData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/provider/register`, userData);
            const { token, providerId, category, profileStatus, data } = response.data;

            const currentCategory = category || userData.category;
            const key = getProviderKey(currentCategory); // 'lab' | 'pharmacy' | 'nurse'
            const providerData = data || { _id: providerId, category: currentCategory, profileStatus };

            if (token) {
                if (key === "lab") {
                    localStorage.setItem("labToken", token);
                    localStorage.setItem("labProvider", JSON.stringify(providerData));
                    localStorage.setItem("labUser", JSON.stringify(providerData));
                    setLabToken(token);
                } else if (key === "pharmacy") {
                    localStorage.setItem("pharmacyToken", token);
                    localStorage.setItem("pharmacyProvider", JSON.stringify(providerData));
                    localStorage.setItem("pharmacyUser", JSON.stringify(providerData));
                    setPharmacyToken(token);
                } else if (key === "nurse") {
                    localStorage.setItem("nurseToken", token);
                    localStorage.setItem("nursingToken", token);
                    localStorage.setItem("nursingProvider", JSON.stringify(providerData));
                    localStorage.setItem("nurseUser", JSON.stringify(providerData));
                    setNurseToken(token);
                    setNursingToken(token);
                }
            }

            localStorage.setItem("providerCategory", currentCategory);
            localStorage.setItem("providerStatus", profileStatus || "Incomplete");

            setProvider(providerData);
            setProviderCategory(currentCategory);

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Provider registration failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const loginAsServiceProvider = async (userData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/provider/login`, userData);
            const { token, data, category, profileStatus } = response.data;

            const currentCategory = category || userData.category || data?.category;
            const key = getProviderKey(currentCategory);

            if (token) {
                if (key === "lab") {
                    localStorage.setItem("labToken", token);
                    if (data) {
                        localStorage.setItem("labProvider", JSON.stringify(data));
                        localStorage.setItem("labUser", JSON.stringify(data));
                    }
                    setLabToken(token);
                } else if (key === "pharmacy") {
                    localStorage.setItem("pharmacyToken", token);
                    if (data) {
                        localStorage.setItem("pharmacyProvider", JSON.stringify(data));
                        localStorage.setItem("pharmacyUser", JSON.stringify(data));
                    }
                    setPharmacyToken(token);
                } else if (key === "nurse") {
                    localStorage.setItem("nurseToken", token);
                    localStorage.setItem("nursingToken", token);
                    if (data) {
                        localStorage.setItem("nursingProvider", JSON.stringify(data));
                        localStorage.setItem("nurseUser", JSON.stringify(data));
                    }
                    setNurseToken(token);
                    setNursingToken(token);
                }
            }

            if (data) {
                setProvider(data);
            }
            if (currentCategory) {
                setProviderCategory(currentCategory);
                localStorage.setItem("providerCategory", currentCategory);
            }
            if (profileStatus) {
                localStorage.setItem("providerStatus", profileStatus);
            }

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Provider login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const uploadLabDocuments = async (formData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const token = localStorage.getItem("labToken") || localStorage.getItem("providerToken");

            const response = await axios.put(`${baseUrl}/api/auth/provider/upload-docs/lab`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Lab document upload failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const uploadPharmacyDocuments = async (formData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const token = localStorage.getItem("pharmacyToken") || localStorage.getItem("providerToken");

            const response = await axios.put(`${baseUrl}/api/auth/provider/upload-docs/pharmacy`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Pharmacy document upload failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const uploadNurseDocuments = async (formData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const token = localStorage.getItem("nurseToken") || localStorage.getItem("nursingToken") || localStorage.getItem("providerToken");

            const response = await axios.put(`${baseUrl}/api/auth/provider/upload-docs/nurse`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Nurse document upload failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 4. HOSPITAL & ADMIN METHODS
    // =========================================================================

    const registerAsHospital = async (hospitalData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/hospital/register`, hospitalData);
            const { token, profileStatus, hospital: regHospital } = response.data;

            if (token) {
                localStorage.setItem("hospitalToken", token);
                setHospitalToken(token);
            }
            if (regHospital) {
                localStorage.setItem("hospitalUser", JSON.stringify(regHospital));
                setHospital(regHospital);
            }
            localStorage.setItem("hospitalStatus", profileStatus || "Incomplete");

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Hospital registration failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const uploadHospitalDocuments = async (formData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const hToken = localStorage.getItem("hospitalToken");
            const response = await axios.put(`${baseUrl}/api/auth/hospital/update`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${hToken}`,
                },
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Hospital upload failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const loginAsAdmin = async (userData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/auth/admin/login`, userData);
            const { token, admin: loggedAdmin } = response.data;

            setAdmin(loggedAdmin);
            setAdminToken(token);
            localStorage.setItem("adminToken", token);
            localStorage.setItem("token", token);
            localStorage.setItem("admin", JSON.stringify(loggedAdmin));

            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Admin login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const loginFireHeadquarter = async (userData) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/fireHQ/auth/login`, userData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Login failed";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 5. UNIVERSAL FORGOT PASSWORD METHODS (Phone & Email)
    // =========================================================================

    /**
     * PRIMARY PHONE FLOW:
     * Step 1: Discover Accounts by Phone Number
     * Payload: { phone: "9876543210" }
     * Returns: { success: true, accounts: [{ role, name, maskedEmail }] }
     */
    const forgotPasswordPhone = async (phone) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/password/forgot-password-phone`, {
                phone: phone.replace(/\s+/g, ""),
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Failed to find accounts for this number.";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * PRIMARY PHONE FLOW:
     * Step 3: Verify Firebase idToken & Get 15-Min SHA-256 Reset Token
     * Payload: { phone, idToken, selectedRole }
     * Returns: { success: true, resetToken, role }
     */
    const verifyFirebaseOtp = async (payload) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/password/verify-firebase-otp`, {
                phone: payload.phone.replace(/\s+/g, ""),
                idToken: payload.idToken,
                selectedRole: payload.selectedRole,
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "OTP verification failed.";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * PRIMARY PHONE FLOW:
     * Step 4: Reset Password with Reset Token
     * Payload: { phone, resetToken, selectedRole, newPassword, confirmPassword }
     * Returns: { success: true, message: "..." }
     */
    const resetPasswordPhone = async (payload) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const response = await axios.post(`${baseUrl}/api/password/reset-password-phone`, {
                phone: payload.phone.replace(/\s+/g, ""),
                resetToken: payload.resetToken,
                selectedRole: payload.selectedRole,
                newPassword: payload.newPassword,
                confirmPassword: payload.confirmPassword,
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Password reset failed.";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * SECONDARY EMAIL FLOW:
     * Step 1: Send 6-Digit OTP to Email (Universal across all 13 models)
     * Payload: { email: "user@example.com" }
     */
    const forgotPassword = async (email) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const res = await axios.post(`${baseUrl}/api/password/forgot-password`, {
                email: email.trim().toLowerCase(),
            });
            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Failed to send email OTP.";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * SECONDARY EMAIL FLOW:
     * Step 2: Verify 6-Digit Email OTP
     * Payload: { email, otp }
     */
    const verifyOtp = async (email, otp) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const res = await axios.post(`${baseUrl}/api/password/verify-otp`, {
                email: email.trim().toLowerCase(),
                otp: otp.trim(),
            });
            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Invalid or expired OTP.";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * SECONDARY EMAIL FLOW:
     * Step 3: Reset Password via Email
     * Payload: { email, newPassword, confirmPassword }
     */
    const resetPassword = async (payload) => {
        try {
            setLoading(true);
            const baseUrl = getBaseUrl();
            const body = typeof payload === "object" 
                ? {
                    email: payload.email?.trim().toLowerCase(),
                    newPassword: payload.newPassword,
                    confirmPassword: payload.confirmPassword,
                }
                : {
                    email: arguments[0]?.trim().toLowerCase(),
                    newPassword: arguments[1],
                    confirmPassword: arguments[2],
                };

            const res = await axios.post(`${baseUrl}/api/password/reset-password`, body);
            return res.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Password reset failed.";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 6. LOGOUT
    // =========================================================================

    const logout = (role = "all") => {
        if (role === "user" || role === "all") {
            localStorage.removeItem("userToken");
            localStorage.removeItem("user");
            setUser(null);
            setUserToken(null);
        }
        if (role === "doctor" || role === "all") {
            localStorage.removeItem("doctorToken");
            localStorage.removeItem("doctorUser");
            localStorage.removeItem("doctorStatus");
            setDoctor(null);
            setDoctorToken(null);
        }
        if (role === "provider" || role === "all") {
            localStorage.removeItem("providerToken");
            localStorage.removeItem("providerUser");
            localStorage.removeItem("providerCategory");
            localStorage.removeItem("providerStatus");
            localStorage.removeItem("labToken");
            localStorage.removeItem("labProvider");
            localStorage.removeItem("nurseToken");
            localStorage.removeItem("nursingToken");
            localStorage.removeItem("nursingProvider");
            localStorage.removeItem("pharmacyToken");
            localStorage.removeItem("pharmacyProvider");
            setProvider(null);
            setProviderToken(null);
            setProviderCategory(null);
            setLabToken(null);
            setNurseToken(null);
            setNursingToken(null);
            setPharmacyToken(null);
        }
        if (role === "hospital" || role === "all") {
            localStorage.removeItem("hospitalToken");
            localStorage.removeItem("hospitalUser");
            localStorage.removeItem("hospitalStatus");
            setHospital(null);
            setHospitalToken(null);
        }
        if (role === "admin" || role === "all") {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("admin");
            localStorage.removeItem("token");
            setAdmin(null);
            setAdminToken(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                loading,
                // User & Patient
                user,
                userToken,
                setUser,
                checkUserExists,
                registerAsUser,
                loginAsUser,
                // Doctor
                doctor,
                doctorToken,
                setDoctor,
                checkDoctorExists,
                registerAsDoctor,
                loginAsDoctor,
                uploadDoctorDocuments,
                // Service Providers (Lab, Nurse, Pharmacy)
                provider,
                providerToken,
                providerCategory,
                labToken,
                nurseToken,
                nursingToken,
                pharmacyToken,
                setProvider,
                checkProviderExists,
                registerAsServiceProvider,
                loginAsServiceProvider,
                uploadLabDocuments,
                uploadPharmacyDocuments,
                uploadNurseDocuments,
                // Hospital & Admin
                hospital,
                hospitalToken,
                registerAsHospital,
                uploadHospitalDocuments,
                admin,
                adminToken,
                loginAsAdmin,
                loginFireHeadquarter,
                // Universal Forgot Password (Phone Flow)
                forgotPasswordPhone,
                verifyFirebaseOtp,
                resetPasswordPhone,
                // Universal Forgot Password (Email Flow)
                forgotPassword,
                verifyOtp,
                resetPassword,
                // Aliases for Email flow
                forgotPasswordEmail: forgotPassword,
                verifyEmailOtp: verifyOtp,
                resetPasswordEmail: resetPassword,
                // Logout
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);