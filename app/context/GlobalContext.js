"use client";
import { createContext, useContext, useState } from "react";
import axios from "axios";

const GlobalContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const GlobalProvider = ({ children }) => {
    const [user, setUser] = useState("Mudabir");
    const [loading, setLoading] = useState(true);
    const [modalType, setModalType] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    const openModal = (type) => {
        setModalType(type);
    };
    const closeModal = () => {
        setModalType(null);
    };

    const getHomePageContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/main`);
            return response.data;
        } catch (error) {
            console.error("Error getting home page content:", error);
            throw error;
        }
    }

    const getAboutUsContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/about-us`);
            return response.data;
        } catch (error) {
            console.error("Error getting about us content:", error);
            throw error;
        }
    }


    const getFeaturedProductsContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/featuredproducts`);
            return response.data;
        } catch (error) {
            console.error("Error getting featured products content:", error);
            throw error;
        }
    }

    const getIntroductionPageContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/introductionpage`);
            return response.data;
        } catch (error) {
            console.error("Error getting introduction page content:", error);
            throw error;
        }
    }

    const getDoctorTeamContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/doctorsteam`);
            return response.data;
        } catch (error) {
            console.error("Error getting doctor team content:", error);
            throw error;
        }
    }

    return (
        <GlobalContext.Provider
            value={{
                user,
                setUser,
                loading,
                modalType,
                openModal,
                closeModal,
                sidebarOpen,
                toggleSidebar,
                getAboutUsContent,
                getFeaturedProductsContent,
                getHomePageContent,
                getIntroductionPageContent,
                getDoctorTeamContent
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);