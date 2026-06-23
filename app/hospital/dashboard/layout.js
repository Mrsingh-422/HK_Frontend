'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    FaThLarge,
    FaHeartbeat,
    FaProcedures,
    FaHistory,
    FaSignOutAlt,
    FaAmbulance,
    FaCog,
    FaBars,
    FaTimes,
    FaHospital,
    FaTicketAlt,
    FaStethoscope,
    FaFileInvoice,
    FaChevronDown,
    FaChevronUp,
    FaCogs    
} from "react-icons/fa";
import { useAuth } from '@/app/context/AuthContext';
import HospitalTopBar from './components/HospitalTopBar';

export default function HospitalLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(''); 
    const pathname = usePathname();
    const router = useRouter();
    const [hospital, setHospital] = useState(null);

    // --- PROTECTION & REDIRECT LOGIC ---
    useEffect(() => {
        const storedToken = localStorage.getItem("hospitalToken");
        localStorage.getItem("hospital") && setHospital(JSON.parse(localStorage.getItem("hospital")));
        if( !storedToken) {
            alert("login first");
            router.push("/"); // Redirect to homepage if not authenticated
        }
    }, []);

    const menuItems = [
        { name: 'Dashboard', href: '/hospital/dashboard', icon: FaThLarge },
        { name: 'Emergency Case', href: '/hospital/dashboard/emergencycase', icon: FaHeartbeat },
        { name: 'Hospital Admission', href: '/hospital/dashboard/Admissions', icon: FaProcedures },
        { name: 'History', href: '/hospital/dashboard/history', icon: FaHistory },
        { name: 'Manage Coupons', href: '/hospital/dashboard/coupons', icon: FaTicketAlt },
        { name: 'Manage Service', href: '/hospital/dashboard/manage-service', icon: FaStethoscope },
        { name: ' Discharge', href: '/hospital/dashboard/emergencydischarge', icon: FaFileInvoice },
        { name: 'Referral Ambulance', href: '/hospital/dashboard/referralambulance', icon: FaAmbulance },
         { name: 'Wallet', href: '/hospital/dashboard/wallet', icon: FaAmbulance },
        { 
            name: 'Settings', 
            icon: FaCogs,
            subItems: [
                { name: 'Manage Doctors', href: '/hospital/dashboard/manage-doctor'},
                { name: 'Manage Banking', href: '/hospital/dashboard/ManageBanking'},
                { name: 'Manage Ambulance', href: '/hospital/dashboard/manage-ambulance'},
                { name: 'Manage Wards', href: '/hospital/dashboard/manage-wards' },
                { name: 'Terms & Conditions', href: '/hospital/dashboard/terms-and-conditions' },
            ]
        },
    ];

    // Auto-open dropdown if a child route is currently active
    useEffect(() => {
        const activeParent = menuItems.find(item => item.subItems?.some(sub => sub.href === pathname));
        if (activeParent) {
            setOpenDropdown(activeParent.name);
        }
    }, [pathname]);

    const toggleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? '' : name);
    };

    // --- FULL SCREEN LOADER ---
    // if (loading) {
    //     return (
    //         <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    //             <div className="relative flex items-center justify-center">
    //                 <div className="w-16 h-16 border-4 border-green-100 border-t-[#08B36A] rounded-full animate-spin"></div>
    //                 <FaHospital className="absolute text-[#08B36A] text-xl" />
    //             </div>
    //             <p className="mt-4 text-gray-500 font-medium animate-pulse">Verifying Access...</p>
    //         </div>
    //     );
    // }

    // if (!hospitalToken && typeof window !== "undefined" && !localStorage.getItem("hospitalToken")) {
    //     return null;
    // }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* --- SIDEBAR (Fixed and Non-moving) --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
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
                            const hasSubItems = !!item.subItems;
                            const isActive = pathname === item.href || (hasSubItems && item.subItems.some(sub => sub.href === pathname));
                            const isOpen = openDropdown === item.name;

                            if (hasSubItems) {
                                return (
                                    <div key={item.name} className="flex flex-col space-y-1">
                                        <button
                                            onClick={() => toggleDropdown(item.name)}
                                            className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                                                isActive || isOpen
                                                    ? 'bg-green-50 text-[#08B36A] font-medium'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`text-lg ${isActive || isOpen ? 'text-[#08B36A]' : 'text-gray-400 group-hover:text-[#08B36A]'}`} />
                                                <span>{item.name}</span>
                                            </div>
                                            {isOpen ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
                                        </button>

                                        {isOpen && (
                                            <div className="pl-11 pr-2 py-1 space-y-1">
                                                {item.subItems.map((subItem) => {
                                                    const isSubActive = pathname === subItem.href;
                                                    return (
                                                        <Link
                                                            key={subItem.name}
                                                            href={subItem.href}
                                                            onClick={() => setSidebarOpen(false)}
                                                            className={`block px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                                                                isSubActive
                                                                    ? 'bg-[#08B36A] text-white shadow-md shadow-green-100 font-medium'
                                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                                                            }`}
                                                        >
                                                            {subItem.name}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                                        isActive
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

            {/* --- MAIN SECTION (Adjusted for fixed sidebar) --- */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
                <main className="flex-1 p-0">
                    <HospitalTopBar onMenuClick={() => setSidebarOpen(true)} />
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