"use client";

import React, { useState } from "react";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import ManageLabVendorComponent from "./components/ManageLabVendorComponent";
import LabTestReportComponent from "./components/LabTestReportComponent";
import LabTestTypeComponent from "./components/LabTestTypeComponent";
import LabTestPackageComponent from "./components/LabTestPackagComponent";
import ManageLabTestComponent from "./components/ManageLabTestComponent";

/* ================= TAB COMPONENTS ================= */

const ManageLabVendor = () => {
    return (
        <div className="pt-4 pb-4 rounded-2xl shadow-sm">
            <ManageLabVendorComponent />
        </div>
    );
};

const LabTestReport = () => {
    return (
        <div className="pt-4 pb-4 rounded-2xl shadow-sm">
            <LabTestReportComponent />
        </div>
    );
};

const LabTestType = () => {
    return (
        <div className="pt-4 pb-4 rounded-2xl shadow-sm">
            <LabTestTypeComponent />
        </div>
    );
};

const LabTestPackage = () => {
    return (
        <div className="pt-4 pb-4 rounded-2xl shadow-sm">
            <LabTestPackageComponent />
        </div>
    );
};

const ManageLabTest = () => {
    return (
        <div className="pt-4 pb-4 rounded-2xl shadow-sm">
            <ManageLabTestComponent />
        </div>
    );
};

/* ================= MAIN PAGE ================= */

function Page() {
    const [activeTab, setActiveTab] = useState("vendor");

    const renderComponent = () => {
        switch (activeTab) {
            case "vendor":
                return <ManageLabVendor />;
            case "report":
                return <LabTestReport />;
            case "type":
                return <LabTestType />;
            case "package":
                return <LabTestPackage />;
            case "test":
                return <ManageLabTest />;
            default:
                return <ManageLabVendor />;
        }
    };

    const tabs = [
        { id: "vendor", label: "Manage Lab Vendor" },
        { id: "report", label: "Lab Test Report" },
        { id: "type", label: "Lab Test Type" },
        { id: "package", label: "Lab Test Package" },
        { id: "test", label: "Manage Lab Test" },
    ];

    return (
        <>
            <DashboardTopNavbar heading="Lab Vendors" />

            <div className="p-6 bg-gray-50 min-h-screen">

                {/* ================= TABS ================= */}
                <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.id
                                    ? "bg-emerald-500 text-white shadow"
                                    : "bg-white text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ================= TAB CONTENT ================= */}
                {renderComponent()}
            </div>
        </>
    );
}

export default Page;