"use client";
import React, { useState } from "react";
import { useGlobalContext } from "@/app/context/GlobalContext";

// Imports
import PoliceStationHead from "./policeStationHead/PoliceStationHead";
import LoginAsPoliceStation from "./policeStation/LoginAsPoliceStation";
import LoginAsFireHead from "./fireStationHead/LoginAsFireHead";
import LoginAsFireStation from "./fireStation/LoginAsFireStation";

function MainLogin() {
  const [activeTab, setActiveTab] = useState("user");

  // ✅ Get modal controls from global context
  const { closeModal } = useGlobalContext();

  const renderContent = () => {
    switch (activeTab) {
      case "user":
        return <PoliceStationHead />;
      case "policeStation":
        return <LoginAsPoliceStation />;
      case "fireHead":
        return <LoginAsFireHead />;
      case "fireStation":
        return <LoginAsFireStation />;
      default:
        return null;
    }
  };

  // Helper for dynamic classes (Matches your reference exactly)
  const getTabClass = (tabName) => {
    const baseClasses =
      "transition-all duration-300 cursor-pointer text-center text-[12px] md:text-sm px-2 py-2.5 rounded-md leading-tight h-full flex items-center justify-center";
    const activeClasses = "bg-white text-black font-medium shadow-sm";
    const inactiveClasses = "bg-white/10 text-white hover:bg-white/20";

    return `${baseClasses} ${
      activeTab === tabName ? activeClasses : inactiveClasses
    }`;
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
          - grid-cols-2: 2 columns on mobile (2x2 layout for 4 items)
          - lg:flex: Back to single line on desktop 
      */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:flex lg:flex-row lg:justify-center bg-[#08b36a] p-3 md:p-5 gap-2 md:gap-4 rounded-t-lg">
        <button
          className={getTabClass("user")}
          onClick={() => setActiveTab("user")}
        >
          Login As Police Station Headquarter
        </button>

        <button
          className={getTabClass("policeStation")}
          onClick={() => setActiveTab("policeStation")}
        >
          Login As Police Station
        </button>

        <button
          className={getTabClass("fireHead")}
          onClick={() => setActiveTab("fireHead")}
        >
          Login As Fire Station Headquarter
        </button>

        <button
          className={getTabClass("fireStation")}
          onClick={() => setActiveTab("fireStation")}
        >
          Login As Fire Station
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