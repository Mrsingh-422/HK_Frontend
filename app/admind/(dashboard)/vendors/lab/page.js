"use client";

import React, { useState } from "react";
// Assuming these are your component imports
import ManageLabVendorComponent from "./components/ManageLabVendorComponent";
import LabTestReportComponent from "./components/LabTestReportComponent";
import LabTestTypeComponent from "./components/LabTestTypeComponent";
import LabTestPackageComponent from "./components/LabTestPackagComponent";
import ManageLabTestComponent from "./components/ManageLabTestComponent";

/* ================= MAIN PAGE ================= */

function Page() {
    const [activeTab, setActiveTab] = useState("vendor");

    const tabs = [
        { id: "vendor", label: "Manage Lab Vendor", component: <ManageLabVendorComponent /> },
        { id: "report", label: "Lab Test Report", component: <LabTestReportComponent /> },
        { id: "type", label: "Lab Test Type", component: <LabTestTypeComponent /> },
        { id: "package", label: "Lab Test Package", component: <LabTestPackageComponent /> },
        { id: "test", label: "Manage Lab Test", component: <ManageLabTestComponent /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* ================= TABS NAVIGATION ================= */}
                <div className="relative mb-2">
                    {/* Scrollable container for mobile */}
                    <div className="flex items-center overflow-x-auto no-scrollbar bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 w-fit max-w-full">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    relative flex-shrink-0 px-6 py-2.5 text-sm font-semibold transition-all duration-300 rounded-xl cursor-pointer
                    ${isActive
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }
                  `}
                                >
                                    {tab.label}
                                    {/* Subtle active indicator dot for mobile/wide view */}
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full md:hidden"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ================= TAB CONTENT AREA ================= */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 min-h-[500px] transition-all duration-500 ease-in-out">
                    {/* Animation wrapper */}
                    <div
                        key={activeTab}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                        {tabs.find((t) => t.id === activeTab)?.component}
                    </div>
                </div>
            </div>

            {/* Custom CSS for hiding scrollbars but keeping functionality */}
            <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}

export default Page;