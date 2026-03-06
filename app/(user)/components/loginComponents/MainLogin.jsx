"use client";
import React, { useState } from "react";
import { useGlobalContext } from "@/app/context/GlobalContext";

import LoginAsUser from "./loginAsUser/LoginAsUser";
import LoginAsServiceProvider from "./loginAsServiceProvider/LoginAsServiceProvider";
import LoginAsHospital from "./loginAsHospital/LoginAsHospital";
import LoginAsDoctor from "./loginAsDoctor/LoginAsDoctor";
import LoginAsDoctorAppointment from "./loginAsDoctorAppointment/LoginAsDoctorAppointment";

function MainLogin() {
  const [activeTab, setActiveTab] = useState("user");

  const { closeModal } = useGlobalContext();

  const renderContent = () => {
    switch (activeTab) {
      case "user": return <LoginAsUser />;
      case "hospital": return <LoginAsHospital />;
      case "doctor": return <LoginAsDoctor />;
      case "provider": return <LoginAsServiceProvider />;
      case "appointment": return <LoginAsDoctorAppointment />;
      default: return null;
    }
  };

  // Helper for dynamic classes
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
          Login As
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
          - grid-cols-2: 2 columns on tiny phones 
          - sm:grid-cols-3: 3 columns on small tablets 
          - lg:flex: Back to single line on desktop
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row lg:justify-center bg-[#08b36a] p-3 md:p-5 gap-2 md:gap-4 rounded-t-lg">
        <button
          className={getTabClass("user")}
          onClick={() => setActiveTab("user")}
        >
          Login As User
        </button>

        <button
          className={getTabClass("provider")}
          onClick={() => setActiveTab("provider")}
        >
          Login As Service Provider
        </button>

        <button
          className={getTabClass("hospital")}
          onClick={() => setActiveTab("hospital")}
        >
          Login As Hospital
        </button>

        <button
          className={getTabClass("doctor")}
          onClick={() => setActiveTab("doctor")}
        >
          Login As Hospital Doctor
        </button>

        <button
          className={getTabClass("appointment")}
          onClick={() => setActiveTab("appointment")}
        >
          Login As Doctor Appointment
        </button>
      </div>

      {/* BODY CONTENT */}
      <div className="bg-white p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10">
        {renderContent()}
      </div>
    </div>
  );
}

export default MainLogin;