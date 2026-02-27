"use client";

import React, { useState } from "react";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import HomeComponent from "./components/HomeComonent";
import IntroductionComponent from "./components/IntroductionComponent";
import AboutUsComponent from "./components/AboutUsComponent";
import AmbulanceComponent from "./components/AmbulanceComponent";
import HospitalComponent from "./components/HospitalComponent";
import NursingComponent from "./components/NursingComponent";
import LaboratoryComponent from "./components/LaboratoryComponent";
import MedicineComponent from "./components/MedicineComponent";
import DoctorsTeamComponent from "./components/DoctorsTeamComponent";
import AffilatesComponent from "./components/AffilatesComponent";
import ArticlesComponent from "./components/ArticlesComponent";
import FAQComponent from "./components/FAQComponent";

function Page() {
    const [activeTab, setActiveTab] = useState("home");

    const tabs = [
        { id: "home", label: "Home" },
        { id: "intro", label: "Introduction" },
        { id: "about", label: "About Us" },
        { id: "medicine", label: "Medicine" },
        { id: "laboratory", label: "Laboratory" },
        { id: "doctorsteam", label: "Doctors Team" },
        { id: "nursing", label: "Nursing" },
        { id: "ambulance", label: "Ambulance" },
        { id: "hospital", label: "Hospital" },
        { id: "affilates", label: "Affiliates" },
        { id: "articles", label: "Articles" },
        { id: "faq", label: "FAQ" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "home":
                return <HomeComponent />;
            case "intro":
                return <IntroductionComponent />;
            case "about":
                return <AboutUsComponent />;
            case "medicine":
                return <MedicineComponent />;
            case "laboratory":
                return <LaboratoryComponent />;
            case "doctorsteam":
                return <DoctorsTeamComponent />;
            case "nursing":
                return <NursingComponent />;
            case "ambulance":
                return <AmbulanceComponent />;
            case "hospital":
                return <HospitalComponent />;
            case "affilates":
                return <AffilatesComponent />;
            case "articles":
                return <ArticlesComponent />;
            case "faq":
                return <FAQComponent />;
            default:
                return null;
        }
    };

    return (
        <>
            <DashboardTopNavbar />

            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto">

                    {/* Page Title */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Website Content Management
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage and update all website sections from here
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">

                        {/* Professional Scrollable Tab Bar */}
                        <div className="sticky top-0 z-10 border-b border-gray-200">

                            <div className="flex overflow-x-auto scrollbar-hide">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative px-5 cursor-pointer py-4 text-sm font-medium whitespace-nowrap transition-all duration-300
                      ${activeTab === tab.id
                                                ? "text-[#08B36A]"
                                                : "text-gray-500 hover:text-gray-700"
                                            }
                    `}
                                    >
                                        {tab.label}

                                        {/* Active Indicator */}
                                        {activeTab === tab.id && (
                                            <span className="absolute left-0 bottom-0 w-full h-[3px] rounded-full transition-all duration-300"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className=" transition-all duration-300">
                            {renderTabContent()}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

export default Page;