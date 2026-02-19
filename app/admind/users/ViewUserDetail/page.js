"use client";

import { useSearchParams } from "next/navigation";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import { useRouter } from "next/navigation";

export default function ViewUserDetail() {
    const searchParams = useSearchParams();
    const data = searchParams.get("data");
    const router = useRouter()

    const user = data ? JSON.parse(decodeURIComponent(data)) : null;

    if (!user) return <div className="p-10">No user data found.</div>;

    return (
        <>
            <DashboardTopNavbar heading="User Details" />

            <div className="bg-white min-h-screen p-6 rounded-xl">

                {/* Top Green Buttons */}
                <div className="flex flex-wrap gap-4 mb-10 justify-center">

                    <button
                        className="bg-[#08B36A] hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition"
                    >
                        PRESCRIPTIONS
                    </button>

                    <button
                        className="bg-[#08B36A] hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition"
                    >
                        HEALTH LOCKER
                    </button>

                    <button
                        className="bg-[#08B36A] hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition"
                    >
                        EMERGENCY CONTACTS
                    </button>

                    <button
                        className="bg-[#08B36A] hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition"
                    >
                        MY HEALTH INSURANCE
                    </button>

                    <button
                        className="bg-[#08B36A] hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition"
                    >
                        MY WORK DETAILS
                    </button>

                    <button
                        className="bg-[#08B36A] hover:bg-[#08b369d6] cursor-pointer text-white px-6 py-3 rounded-md shadow-md text-xs font-semibold transition"
                        onClick={() => router.back()}
                    >
                        GO BACK
                    </button>

                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Left Image Section */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-gray-300 h-64 flex items-center justify-center rounded">
                            <span className="text-gray-500 text-6xl">📷</span>
                        </div>
                    </div>

                    {/* Right Details Section */}
                    <div className="w-full lg:w-3/4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 text-gray-700">

                            {/* Username */}
                            <div>
                                <p className="font-semibold mb-2">Username</p>
                                <div className="border-b pb-2 text-gray-600">
                                    {user.name || "—"}
                                </div>
                            </div>

                            {/* Number */}
                            <div>
                                <p className="font-semibold mb-2">Number</p>
                                <div className="border-b pb-2 text-gray-600">
                                    {user.number}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <p className="font-semibold mb-2">Email</p>
                                <div className="border-b pb-2 text-gray-600">
                                    {user.email}
                                </div>
                            </div>

                            {/* Weight */}
                            <div>
                                <p className="font-semibold mb-2">Weight</p>
                                <div className="border-b pb-2 text-gray-600">
                                    —
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <p className="font-semibold mb-2">Gender</p>
                                <div className="border-b pb-2 text-gray-600">
                                    Male
                                </div>
                            </div>

                            {/* Height */}
                            <div>
                                <p className="font-semibold mb-2">Height</p>
                                <div className="border-b pb-2 text-gray-600">
                                    —
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <p className="font-semibold mb-2">Date of Birth</p>
                                <div className="border-b pb-2 text-gray-600">
                                    —
                                </div>
                            </div>

                            {/* Join Date */}
                            <div>
                                <p className="font-semibold mb-2">Join Date</p>
                                <div className="border-b pb-2 text-gray-600">
                                    2025-06-24 08:43:12
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
