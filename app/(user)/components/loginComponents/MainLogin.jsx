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
      case "user":
        return <LoginAsUser />;
      case "provider":
        return <LoginAsServiceProvider />;
      case "hospital":
        return <LoginAsHospital />;
      case "doctor":
        return <LoginAsDoctor />;
      case "appointment":
        return <LoginAsDoctorAppointment />;
      default:
        return <LoginAsUser />;
    }
  };

  // Dynamic Tailwind helper for responsive tab states
  const getTabClass = (tabName) => {
    const baseClasses =
      "transition-all duration-200 cursor-pointer text-center text-[13px] md:text-sm px-3 py-2.5 rounded-md leading-tight h-full flex items-center justify-center font-medium";
    const activeClasses = "bg-white text-[#08b36a] shadow-sm font-bold";
    const inactiveClasses = "bg-white/15 text-white hover:bg-white/25";

    return `${baseClasses} ${activeTab === tabName ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="w-full p-2 md:p-6 font-sans">
      {/* MODAL HEADER */}
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-[#08b36a] text-xl md:text-2xl font-bold">
          Login Portal
        </span>
        <span
          className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer transition-colors p-1"
          onClick={closeModal}
        >
          ✖
        </span>
      </div>

      {/* TABS CONTAINER */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row lg:justify-center bg-[#08b36a] p-2.5 md:p-4 gap-2 rounded-t-xl">
        <button
          type="button"
          className={getTabClass("user")}
          onClick={() => setActiveTab("user")}
        >
          Login As User
        </button>

        <button
          type="button"
          className={getTabClass("provider")}
          onClick={() => setActiveTab("provider")}
        >
          Login As Service Provider
        </button>

        <button
          type="button"
          className={getTabClass("hospital")}
          onClick={() => setActiveTab("hospital")}
        >
          Login As Hospital
        </button>

        <button
          type="button"
          className={getTabClass("doctor")}
          onClick={() => setActiveTab("doctor")}
        >
          Login As Hospital Doctor
        </button>

        <button
          type="button"
          className={getTabClass("appointment")}
          onClick={() => setActiveTab("appointment")}
        >
          Login As Doctor Appointment
        </button>
      </div>

      {/* BODY CONTENT CONTAINER */}
      <div className="bg-white p-4 md:p-8 rounded-b-xl border border-t-0 border-gray-100 shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
}

export default MainLogin;