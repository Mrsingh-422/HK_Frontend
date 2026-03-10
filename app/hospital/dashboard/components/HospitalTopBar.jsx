'use client'
import { useAuth } from '@/app/context/AuthContext';
import React from 'react'
import { FaBars, FaHospital, FaBell } from "react-icons/fa"

function HospitalTopBar() {
    const { hospital } = useAuth();

    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 h-20 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">

                {/* Sidebar Toggle */}
                <button
                    className="p-2.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 lg:hidden transition"
                    aria-label="Toggle Sidebar"
                >
                    <FaBars size={18} />
                </button>

                {/* Hospital Branding */}
                <div className="flex items-center gap-3">

                    <div className="bg-green-50 border border-green-100 p-2.5 rounded-xl">
                        <FaHospital className="text-[#08B36A]" size={18} />
                    </div>

                    <div className="flex flex-col leading-tight">
                        <h1 className="font-semibold text-gray-800 text-sm md:text-base lg:text-lg truncate max-w-[180px] md:max-w-[320px]">
                            {hospital?.hospitalName || "Hospital Dashboard"}
                        </h1>

                        <span className="text-xs text-gray-400 hidden md:block">
                            Management Portal
                        </span>
                    </div>

                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">

                {/* Status */}
                <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live Portal
                </div>

                {/* Notification */}
                <button className="relative p-2.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition">
                    <FaBell size={16} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-[1px] rounded-full">
                        3
                    </span>
                </button>

                {/* Avatar */}
                <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold shadow">
                        {hospital?.hospitalName?.charAt(0) || "H"}
                    </div>

                    <div className="hidden lg:block text-left leading-tight">
                        <p className="text-sm font-medium text-gray-700">
                            {hospital?.hospitalName || "Hospital"}
                        </p>
                        <p className="text-xs text-gray-400">
                            Admin Panel
                        </p>
                    </div>

                </div>

            </div>
        </header>
    )
}

export default HospitalTopBar