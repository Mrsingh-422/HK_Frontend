"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        const storedAdmin = localStorage.getItem("admin");

        if (token) {
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            if (storedAdmin) {
                setAdmin(JSON.parse(storedAdmin));
            }
        }

        setLoading(false);
    }, []);


    const registerAsUser = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/user/register`, userData);
            const { token, user } = response.data;

            // SAVE BOTH TO LOCAL STORAGE
            localStorage.setItem("token", token);
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

    const registerAsServiceProvider = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/provider/register`, userData);
            const { token, user } = response.data;
            setUser(user);
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

    const registerAsHospital = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/hospital/register`, userData);
            const { token } = response.data;
            localStorage.setItem("hospitalToken", token);
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


    const loginAsUser = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/user/login`, userData);
            const { token, user } = response.data;

            // SAVE BOTH TO LOCAL STORAGE
            localStorage.setItem("token", token);
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

    const loginAsServiceProvider = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${API_URL}/auth/login/service-provider`,
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


    // 1️⃣ SEND OTP
    const forgotPassword = async (email) => {
        const res = await axios.post(
            `${API_URL}/api/auth/user/forgot-password`,
            { email }
        );
        return res.data;
    };

    // 2️⃣ VERIFY OTP
    const verifyOtp = async (email, otp) => {
        const res = await axios.post(
            `${API_URL}/api/auth/user/verify-otp`,
            { email, otp }
        );
        return res.data;
    };

    // 3️⃣ RESET PASSWORD
    const resetPassword = async (email, newPassword, confirmPassword) => {
        const res = await axios.post(
            `${API_URL}/api/auth/user/reset-password`,
            { email, newPassword, confirmPassword }
        );
        return res.data;
    };


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        localStorage.removeItem("user");
        setAdmin(null);
        setUser(null);
    };


    return (
        <AuthContext.Provider value={{
            user,
            admin,
            loading,
            logout,
            registerAsUser,
            registerAsDoctorAppointment,
            registerAsServiceProvider,
            registerAsHospital,
            loginAsUser,
            loginAsDoctorAppointment,
            loginAsServiceProvider,
            loginAsAdmin,
            forgotPassword,
            verifyOtp,
            resetPassword,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);