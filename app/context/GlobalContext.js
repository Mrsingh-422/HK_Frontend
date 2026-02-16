"use client";

import { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [user, setUser] = useState("Mudabir");
    const [loading, setLoading] = useState(true);

    // ✅ ADD MODAL STATE
    const [modalType, setModalType] = useState(null);

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
                closeModal
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);