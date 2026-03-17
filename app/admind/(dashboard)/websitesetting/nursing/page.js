"use client";

import React, { useState } from "react";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import NursePrescriptionAdmin from "./components/NursePrescriptionAdmin";
import NursingStepsAdmin from "./components/NursingStepsAdmin";
import OurNursingServicesAdmin from "./components/OurNursingServicesAdmin";
import ExperiencedNursesAdmin from "./components/ExperiencedNursesAdmin";
import OnlyTheBestCareAdmin from "./components/OnlyTheBestCareAdmin";
import FindMyNurse from "./components/FindMyNurse";

function Page() {
    const [activeTab, setActiveTab] = useState("findmynurse");

    const tabs = [
        { id: "findmynurse", label: "Find My Nurse" },
        { id: "nursingprescription", label: "Nursing Prescription Services" },
        { id: "nursinghowitworks", label: "How It Works" },
        { id: "nursingourservices", label: "Our Services" },
        { id: "experiencednurses", label: "We Have Experienced Nurses" },
        { id: "getapersonalisedcareplan", label: "Get a Personalised Care Plan" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "findmynurse":
                return <FindMyNurse />;
            case "nursingprescription":
                return <NursePrescriptionAdmin />;
            case "nursinghowitworks":
                return <NursingStepsAdmin />;
            case "nursingourservices":
                return <OurNursingServicesAdmin />;
            case "experiencednurses":
                return <ExperiencedNursesAdmin />;
            case "getapersonalisedcareplan":
                return <OnlyTheBestCareAdmin />;
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