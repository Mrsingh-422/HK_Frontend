"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import PrescriptionComponent from "../components/PrescriptionComponent";
import HealthLockerComponent from "../components/HealthLockerComponent";
import EmergencyComponent from "../components/EmergencyComponent";
import InsuranceList from "../components/InsuranceList";
import WorkDetailComponent from "../components/WorkDetailComponent";

// Placeholder Components (Replace these with your actual imported components)
const Prescriptions = ({ user }) => <div className="rounded-xl"><PrescriptionComponent /></div>;
const HealthLocker = ({ user }) => <div className="rounded-xl"><HealthLockerComponent /></div>;
const EmergencyContacts = ({ user }) => <div className="rounded-xl"><EmergencyComponent /></div>;
const HealthInsurance = ({ user }) => <div className="rounded-xl"><InsuranceList /></div>;
const WorkDetails = ({ user }) => <div className="rounded-xl"><WorkDetailComponent /></div>;

export default function ViewUserDetail() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // State to track which view is active
    const [activeTab, setActiveTab] = useState("profile");

    const data = searchParams.get("data");
    const user = data ? JSON.parse(decodeURIComponent(data)) : null;

    if (!user) return <div className="p-10">No user data found.</div>;

    // Logic to render the correct component
    const renderComponent = () => {
        switch (activeTab) {
            case "prescriptions":
                return <Prescriptions user={user} />;
            case "locker":
                return <HealthLocker user={user} />;
            case "emergency":
                return <EmergencyContacts user={user} />;
            case "insurance":
                return <HealthInsurance user={user} />;
            case "work":
                return <WorkDetails user={user} />;
            default:
                return (
                    /* This is your original Main Content (Profile View) */
                    <div className="flex flex-col lg:flex-row gap-10">
                        <div className="w-full lg:w-1/4">
                            <div className="bg-gray-300 h-64 flex items-center justify-center rounded">
                                <span className="text-gray-500 text-6xl">📷</span>
                            </div>
                        </div>
                        <div className="w-full lg:w-3/4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 text-gray-700">
                                <div>
                                    <p className="font-semibold mb-2">Username</p>
                                    <div className="border-b pb-2 text-gray-600">{user.name || "—"}</div>
                                </div>
                                <div>
                                    <p className="font-semibold mb-2">Number</p>
                                    <div className="border-b pb-2 text-gray-600">{user.number}</div>
                                </div>
                                <div>
                                    <p className="font-semibold mb-2">Email</p>
                                    <div className="border-b pb-2 text-gray-600">{user.email}</div>
                                </div>
                                <div>
                                    <p className="font-semibold mb-2">Join Date</p>
                                    <div className="border-b pb-2 text-gray-600">2025-06-24 08:43:12</div>
                                </div>
                                {/* Add more details as needed */}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <DashboardTopNavbar heading={activeTab === 'profile' ? "User Details" : activeTab.toUpperCase()} />

            <div className="bg-white min-h-screen p-6 rounded-xl">

                {/* Top Green Buttons */}
                <div className="flex flex-wrap gap-4 mb-10 justify-center">

                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`${activeTab === "profile" ? "bg-black" : "bg-[#08B36A]"} hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition`}
                    >
                        PROFILE INFO
                    </button>

                    <button
                        onClick={() => setActiveTab("prescriptions")}
                        className={`${activeTab === "prescriptions" ? "bg-black" : "bg-[#08B36A]"} hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition`}
                    >
                        PRESCRIPTIONS
                    </button>

                    <button
                        onClick={() => setActiveTab("locker")}
                        className={`${activeTab === "locker" ? "bg-black" : "bg-[#08B36A]"} hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition`}
                    >
                        HEALTH LOCKER
                    </button>

                    <button
                        onClick={() => setActiveTab("emergency")}
                        className={`${activeTab === "emergency" ? "bg-black" : "bg-[#08B36A]"} hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition`}
                    >
                        EMERGENCY CONTACTS
                    </button>

                    <button
                        onClick={() => setActiveTab("insurance")}
                        className={`${activeTab === "insurance" ? "bg-black" : "bg-[#08B36A]"} hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition`}
                    >
                        MY HEALTH INSURANCE
                    </button>

                    <button
                        onClick={() => setActiveTab("work")}
                        className={`${activeTab === "work" ? "bg-black" : "bg-[#08B36A]"} hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition`}
                    >
                        MY WORK DETAILS
                    </button>

                    <button
                        className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition"
                        onClick={() => router.back()}
                    >
                        GO BACK
                    </button>

                </div>

                {/* Conditional Content Section */}
                <div className="transition-all duration-300">
                    {renderComponent()}
                </div>
            </div>
        </>
    );
}