"use client";

import React, { useState } from "react";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import BookYourPrescriptionTestAdmin from "./components/BookYourPrescriptionTestAdmin";
import BestOfBestAdmin from "./components/BestOfBestAdmin";
import ManageRecommendedMed from "./components/ManageRecommendedMed";
import AboutMedicineAdmin from "./components/AboutMedicineAdmin";
import ManageFeaturedProducts from "./components/ManageFeaturedProducts";
import ManagePharmacyPage from "./components/ManagePharmacyPage";
import SectionThree from "./components/SectionThree";

function Page() {
    const [activeTab, setActiveTab] = useState("maintoppage");

    const tabs = [
        { id: "maintoppage", label: "Main Top Page" },
        { id: "sectionthree", label: "Section Three" },
        { id: "bestofbest", label: "Best of Best" },
        { id: "recommendedmedicines", label: "Recommended Medicines" },
        { id: "aboutusmedicines", label: "About Us Medicines" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'maintoppage':
                return <ManagePharmacyPage />;
            case "sectionthree":
                return <SectionThree />;
            case "bestofbest":
                return <BestOfBestAdmin />;
            case "recommendedmedicines":
                return <ManageRecommendedMed />;
            case "aboutusmedicines":
                return <AboutMedicineAdmin />;
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