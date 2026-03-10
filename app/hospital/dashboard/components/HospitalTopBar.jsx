'use client'
import { useAuth } from '@/app/context/AuthContext';
import React, { useState, useRef, useEffect } from 'react'
import { FaBars, FaHospital, FaBell, FaUser, FaCog, FaSignOutAlt, FaChevronDown } from "react-icons/fa"
import Link from 'next/link';

function HospitalTopBar() {
    const { hospital, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 h-20 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">
                <button
                    className="p-2.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 lg:hidden transition"
                    aria-label="Toggle Sidebar"
                >
                    <FaBars size={18} />
                </button>

                <div className="flex items-center gap-3">
                    <div className="bg-green-50 border border-green-100 p-2.5 rounded-xl">
                        <FaHospital className="text-[#08B36A]" size={18} />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <h1 className="font-semibold text-gray-800 text-sm md:text-base lg:text-lg truncate max-w-[180px] md:max-w-[320px]">
                            {hospital?.hospitalName || "Hospital Dashboard"}
                        </h1>
                        <span className="text-xs text-gray-400 hidden md:block">Management Portal</span>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3 md:gap-6">

                {/* Status Indicator */}
                <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                </div>

                {/* Notifications */}
                <button className="relative p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 transition">
                    <FaBell size={18} />
                    <span className="absolute top-2 right-2 bg-red-500 w-2 h-2 rounded-full border-2 border-white"></span>
                </button>

                {/* PROFILE SECTION */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                    >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#08B36A] to-emerald-700 flex items-center justify-center text-white font-bold shadow-sm">
                            {hospital?.hospitalName?.charAt(0) || "H"}
                        </div>

                        <div className="hidden lg:block text-left leading-tight pr-2">
                            <p className="text-sm font-semibold text-gray-700">
                                {hospital?.hospitalName || "Hospital"}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                Admin Panel
                            </p>
                        </div>
                        <FaChevronDown size={10} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* DROPDOWN MENU */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-150">

                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Signed in as</p>
                                <p className="text-sm font-bold text-gray-800 truncate">{hospital?.email || "Admin User"}</p>
                            </div>

                            <Link href="/hospital/dashboard/hospitalprofile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-[#08B36A] transition">
                                <FaUser className="opacity-70" />
                                My Profile
                            </Link>

                            <Link href="/hospital/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-[#08B36A] transition">
                                <FaCog className="opacity-70" />
                                Account Settings
                            </Link>

                            <div className="h-px bg-gray-50 my-1"></div>

                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition font-medium"
                            >
                                <FaSignOutAlt />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default HospitalTopBar