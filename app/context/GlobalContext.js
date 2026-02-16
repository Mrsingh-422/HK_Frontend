"use client";

import { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [user, setUser] = useState("Mudabir");
    const [loading, setLoading] = useState(true);
    const [globalData, setGlobalData] = useState({});


    return (
        <GlobalContext.Provider value={{ user, setUser, loading, globalData }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Custom hook for easier usage
export const useGlobalContext = () => useContext(GlobalContext);