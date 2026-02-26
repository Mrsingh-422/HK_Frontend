"use client";
import { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

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
                toggleSidebar
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);