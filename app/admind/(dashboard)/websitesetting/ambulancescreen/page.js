"use client";

import React, { useState } from "react";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import AmbulanceAdmin from "./components/AmbulanceAdmin";
import ReferralAmbulanceAdmin from "./components/ReferralAmbulanceAdmin";
import EmergencyFacilityAdmin from "./components/EmergencyFacilityAdmin";
import AccidentalEmergencyAdmin from "./components/AccidentalEmergencyAdmin";
import MedicalEmergencyAdmin from "./components/MedicalEmergencyAdmin";
import SaveReferralAmbulanceAdmin from "./components/SaveReferralAmbulanceAdmin";

function Page() {
    const [activeTab, setActiveTab] = useState("home");

    const tabs = [
        { id: "home", label: "Find Emergency Ambulance" },
        { id: "findconsultant", label: "Find Referral Ambulance" },
        { id: "emergencyfacility", label: "Emergency Facility" },
        { id: "howtosecure", label: "Accidental Emergency" },
        { id: "medicalemergency", label: "Medical Emergency" },
        { id: "savereferalambulance", label: "Referral Ambulance Services" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "home":
                return <AmbulanceAdmin />;
            case "findconsultant":
                return <ReferralAmbulanceAdmin />;
            case "emergencyfacility":
                return <EmergencyFacilityAdmin />;
            case "howtosecure":
                return <AccidentalEmergencyAdmin />;
            case "medicalemergency":
                return <MedicalEmergencyAdmin />;
            case "savereferalambulance":
                return <SaveReferralAmbulanceAdmin />;
            default:
                return null;
        }
    };

    return (
        <>

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