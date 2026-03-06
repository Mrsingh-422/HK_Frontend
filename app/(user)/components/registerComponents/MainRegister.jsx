"use client";
import React, { useState } from "react";
import { useGlobalContext } from "@/app/context/GlobalContext";

import UserRegister from "./userRegister/UserRegister";
import RegisterAsDoctorAppointment from "./regesterAsDoctorAppointment/RegisterAsDoctorAppointment";
import RegisterAsServiceProvider from "./registerAsServiceProvider/RegisterAsServiceProvider";
import RegisterAsHospital from "./registerAsHospital/RegisterAsHospital";

function MainRegister() {
    const [activeTab, setActiveTab] = useState("user");

    const { closeModal } = useGlobalContext();

    const renderContent = () => {
        switch (activeTab) {
            case "user": return <UserRegister />;
            case "appointment": return <RegisterAsDoctorAppointment />;
            case "provider": return <RegisterAsServiceProvider />;
            case "hospital": return <RegisterAsHospital />;
            default: return null;
        }
    };

    // Helper for dynamic classes (Matches your MainLogin reference)
    const getTabClass = (tabName) => {
        const baseClasses = "transition-all duration-300 cursor-pointer text-center text-[13px] md:text-sm px-2 py-2.5 rounded-md leading-tight h-full flex items-center justify-center";
        const activeClasses = "bg-white text-black font-medium shadow-sm";
        const inactiveClasses = "bg-white/10 text-white hover:bg-white/20";

        return `${baseClasses} ${activeTab === tabName ? activeClasses : inactiveClasses}`;
    };

    return (
        <div className="w-full p-4 md:p-6 font-sans">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <span className="text-[#08b36a] text-xl md:text-2xl font-semibold">
                    Registration Option
                </span>
                <span
                    className="text-[#08b36a] text-2xl cursor-pointer hover:scale-110 transition-transform"
                    onClick={closeModal}
                >
                    ✖
                </span>
            </div>

            {/* TABS CONTAINER */}
            {/* 
          - grid-cols-2: Ensures all 4 tabs fit in 2 rows on mobile (no scrolling)
          - lg:flex: Back to single line on desktop
      */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:flex lg:flex-row lg:justify-center bg-[#08b36a] p-3 md:p-5 gap-2 md:gap-4 rounded-t-lg">
                <button
                    className={getTabClass("user")}
                    onClick={() => setActiveTab("user")}
                >
                    Register as User
                </button>

                <button
                    className={getTabClass("appointment")}
                    onClick={() => setActiveTab("appointment")}
                >
                    Register as Doctor Appointment
                </button>

                <button
                    className={getTabClass("provider")}
                    onClick={() => setActiveTab("provider")}
                >
                    Register a Service Provider
                </button>

                <button
                    className={getTabClass("hospital")}
                    onClick={() => setActiveTab("hospital")}
                >
                    Register as Hospital
                </button>
            </div>

            {/* BODY CONTENT */}
            <div className="bg-white p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10">
                {renderContent()}
            </div>
        </div>
    );
}

export default MainRegister;