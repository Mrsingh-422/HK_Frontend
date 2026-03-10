'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    FaThLarge,
    FaBriefcaseMedical,
    FaProcedures,
    FaHistory,
    FaSignOutAlt,
    FaAmbulance,
    FaCog,
    FaBars,
    FaTimes,
    FaHospital
} from "react-icons/fa";
import { useAuth } from '@/app/context/AuthContext';
import HospitalTopBar from './components/HospitalTopBar';

export default function HospitalLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const { logout, hospital, loading, hospitalToken } = useAuth() // Ensure hospitalToken is destructured from useAuth
    const pathname = usePathname()
    const router = useRouter()

    // --- PROTECTION & REDIRECT LOGIC ---
    useEffect(() => {
        // 1. Wait until the AuthContext has finished checking localStorage
        if (loading) return;

        // 2. Check localStorage for immediate safety, but rely on Context for state
        const storedToken = localStorage.getItem("hospitalToken");

        if (!storedToken) {
            router.push("/");
            return;
        }

        // 3. If we have a token but hospital data is loaded, check approval
        if (hospital) {
            if (hospital.profileStatus !== 'Approved' && pathname !== '/hospital/documents') {
                router.push('/hospital/documents');
            }
        }
    }, [hospital, loading, pathname, router, hospitalToken]);

    const menuItems = [
        { name: 'Dashboard', href: '/hospital/dashboard', icon: FaThLarge },
        { name: 'Emergency Case', href: '/hospital/dashboard/emergencycase', icon: FaBriefcaseMedical },
        { name: 'Hospital Admission', href: '/hospital/dashboard/hospitaladmission', icon: FaProcedures },
        { name: 'History', href: '/hospital/dashboard/history', icon: FaHistory },
        { name: 'Emergency Discharge', href: '/hospital/dashboard/emergencydischarge', icon: FaSignOutAlt },
        { name: 'Referral Ambulance', href: '/hospital/dashboard/referralambulance', icon: FaAmbulance },
        { name: 'Settings', href: '/hospital/dashboard/settings', icon: FaCog },
    ];

    // --- FULL SCREEN LOADER ---
    // This prevents the sidebar/content from flashing before auth is confirmed
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="relative flex items-center justify-center">
                    {/* Outer Spinning Ring */}
                    <div className="w-16 h-16 border-4 border-green-100 border-t-[#08B36A] rounded-full animate-spin"></div>
                    {/* Inner Hospital Icon */}
                    <FaHospital className="absolute text-[#08B36A] text-xl" />
                </div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Verifying Access...</p>
            </div>
        );
    }

    // Safety check: if no token exists after loading, don't render anything (useEffect will redirect)
    if (!hospitalToken && typeof window !== "undefined" && !localStorage.getItem("hospitalToken")) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                        <div className="bg-[#08B36A] p-2.5 rounded-xl shadow-md shadow-green-100">
                            <FaHospital className="text-white text-xl" />
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="font-bold text-gray-800 leading-tight truncate">
                                {hospital?.hospitalName || "Hospital Portal"}
                            </h1>
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Medical Center</p>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-[#08B36A] text-white shadow-lg shadow-green-100 font-medium'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`text-lg ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#08B36A]'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            {/* --- MAIN SECTION --- */}
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-0">
                    <HospitalTopBar />
                    <div className="p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}