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

    const getAboutUsContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/about-us`);
            return response.data;
        } catch (error) {
            console.error("Error getting about us content:", error);
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
                getAboutUsContent
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);