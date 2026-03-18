"use client";

import React, { useState } from "react";
import FindMyDoctor from "./components/FindMyDoctor";
import FindConsultant from "./components/FindConsultant";
import DoctorsPriority from "./components/DoctorsPriority";
import HowToSecure from "./components/HowToSecure";

function Page() {
    const [activeTab, setActiveTab] = useState("home");

    const tabs = [
        { id: "home", label: "Find My Doctor" },
        { id: "findconsultant", label: "Find My Consultant" },
        { id: "doctorpriority", label: "Doctors Priority" },
        { id: "howtosecure", label: "How To Secure" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "home":
                return <FindMyDoctor />;
            case "findconsultant":
                return <FindConsultant />;
            case "doctorpriority":
                return <DoctorsPriority />;
            case "howtosecure":
                return <HowToSecure />;
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