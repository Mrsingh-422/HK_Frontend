'use client'
import React, { useState, useRef, useEffect } from 'react';
import { FaBars, FaBell, FaUser, FaCog, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HospitalAPI from '@/app/services/HospitalAPI';

function HospitalTopBar() {
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [hospitalData, setHospitalData] = useState(null); 
    const dropdownRef = useRef(null);

    // Dropdown close logic
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Hospital Profile API Fetch logic
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await HospitalAPI.getHospitalProfile();
                if (response && response.success) {
                    setHospitalData(response.data.hospital);
                }
            } catch (error) {
                console.error("Error fetching hospital profile", error);
            }
        };
        fetchProfile();
    }, []);

    // Safely log out ONLY the hospital token
    const handleLogout = () => {
        setIsProfileOpen(false);
        
        // Only remove the hospitalToken to keep other active sessions logged in
        localStorage.removeItem('hospitalToken');
        
        // Redirect cleanly to login
        router.push('/');
    };

    // Variables
    const hospitalName = hospitalData?.name || "Hospital Dashboard";
    const hospitalEmail = hospitalData?.email || "Admin User";
    
    // Image URL construction
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || ""; 
    const imagePath = hospitalData?.hospitalImage?.[0];
    const imageUrl = imagePath ? `${backendUrl}${imagePath}` : null;

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
            </div>

            {/* CENTER SIDE (Hospital Name Only) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center w-max">
                <h1 className="font-semibold text-gray-800 text-base md:text-lg lg:text-xl truncate max-w-[200px] md:max-w-[400px] capitalize">
                    {hospitalName}
                </h1>
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
                        {imageUrl ? (
                             <img 
                                src={imageUrl} 
                                alt="Profile" 
                                className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#08B36A] to-emerald-700 flex items-center justify-center text-white font-bold shadow-sm">
                                {hospitalName.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div className="hidden lg:block text-left leading-tight pr-2">
                            <p className="text-sm font-semibold text-gray-700 capitalize truncate max-w-[120px]">
                                {hospitalName}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                Admin Panel
                            </p>
                        </div>
                        <FaChevronDown size={10} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* DROPDOWN MENU */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">

                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Signed in as</p>
                                <p className="text-sm font-bold text-gray-800 truncate">{hospitalEmail}</p>
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
                                onClick={handleLogout}
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
    );
}

export default HospitalTopBar;