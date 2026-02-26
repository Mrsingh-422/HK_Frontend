'use client'

import { createContext, useContext, useState } from "react";
import axios from "axios";

const AdminContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const AdminProvider = ({ children }) => {

    const saveHomePageContent = async (data) => {
        const token = localStorage.getItem("token");
        try { 
            const response = await axios.post(`${API_URL}/api/homepage/main`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving home page content:", error);
            throw error;
        }
    }

    const addDoctorTeam = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/doctorsteam`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error adding doctor team:", error);
            throw error;
        }
    }

    const addIntroductionPageContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/introductionpage`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error adding introduction page content:", error);
            throw error;
        }
    }

    const saveAboutUsContent = async (data) => {
        const token = localStorage.getItem("token");

        try {
            const response = await axios.post(
                `${API_URL}/api/homepage/about-us`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error saving about us content:", error);
            throw error;
        }
    };

    const saveFeaturedProductsContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/featuredproducts`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving featured products content:", error);
            throw error;
        }
    }


    return (
        <AdminContext.Provider value={{
            saveHomePageContent,
            addDoctorTeam,
            addIntroductionPageContent,
            saveAboutUsContent,
            saveFeaturedProductsContent,
        }}>
            {children}
        </AdminContext.Provider>
    )
}

export const useAdminContext = () => {
    return useContext(AdminContext);
}