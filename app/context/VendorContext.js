"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const VendorContext = createContext();

export const VendorProvider = ({ children }) => {
    const [vendor, setVendor] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // Start as true during hydration
    const [error, setError] = useState(null);

    useEffect(() => {
        const hydrateAuth = () => {
            const storedToken = localStorage.getItem("vendorToken");
            const storedVendor = localStorage.getItem("vendorData");

            if (storedToken && storedVendor) {
                setToken(storedToken);
                setVendor(JSON.parse(storedVendor));
            }
            setLoading(false);
        };
        hydrateAuth();
    }, []);

    const login = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/admin/login`, userData);
            const { token, admin } = response.data;

            // Save to Local Storage
            localStorage.setItem("vendorToken", token);
            localStorage.setItem("vendorData", JSON.stringify(admin));

            // Save to State
            setVendor(admin);
            setToken(token);

            setLoading(false);
            return { success: true };
        } catch (error) {
            setLoading(false);
            return {
                success: false,
                message: error.response?.data?.message || "Login failed",
            };
        }
    };

    const logout = () => {
        localStorage.removeItem("vendorToken");
        localStorage.removeItem("vendorData");
        setVendor(null);
        setToken(null);
    };

    const value = {
        vendor,
        token,
        login,
        logout,
        loading,
        error
    };

    return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
};

// Custom hook for easier usage
export const useVendor = () => useContext(VendorContext);