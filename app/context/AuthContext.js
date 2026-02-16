"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const registerAsUser = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/auth/user/register`, userData);
            const { token, user } = response.data;
            alert(response.data.token);
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
            const response = await axios.post(`${API_URL}/auth/register/service-provider`, userData);
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
            const response = await axios.post(`${API_URL}/auth/register/hospital`, userData);
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

    const loginAsUser = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/auth/user/login`, userData);
            const { token, user } = response.data;
            localStorage.setItem("token", token)
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


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            logout,
            registerAsUser,
            registerAsDoctorAppointment,
            registerAsServiceProvider,
            registerAsHospital,
            loginAsUser,
            loginAsDoctorAppointment,
            loginAsServiceProvider,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);