'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
    FaFlask,
    FaVials,
    FaClipboardList,
    FaFileMedical,
    FaCog,
    FaChevronLeft,
    FaChevronRight,
    FaUserMd,
    FaMapMarkedAlt,
    FaBoxOpen,
    FaPlusSquare,
    FaBullhorn,
    FaFolderOpen,
    FaHistory,
    FaWallet,
    FaCalendarCheck,
    FaTruck
} from "react-icons/fa";
import { useAuth } from '@/app/context/AuthContext'; // Ensure this path is correct
import LabTopBar from './components/LabTopBar';

export default function LabVendorLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // --- AUTH & ROUTING ---
    const { labVendor, loading, labToken } = useAuth(); // Adjust names based on your AuthContext
    const pathname = usePathname();
    const router = useRouter();

    // --- PROTECTION & REDIRECT LOGIC ---
    useEffect(() => {
        // 1. Wait until AuthContext finishes checking storage
        if (loading) return;

        // 2. Check localStorage for immediate safety
        const storedToken = localStorage.getItem("labToken");

        if (!storedToken) {
            router.push("/"); // Redirect to login/home
            return;
        }

        // 3. If authenticated but profile isn't approved, force them to the documents page
        if (labVendor) {
            if (labVendor.profileStatus !== 'Approved' && pathname !== '/vendors/labvendor/documents') {
                router.push('/vendors/labvendor/documents');
            }
        }
    }, [labVendor, loading, pathname, router, labToken]);

    const menuItems = [
        { name: 'Dashboard', href: '/vendors/labvendor/labdashboard', icon: FaFlask },
        { name: 'Orders', href: '/vendors/labvendor/labdashboard/laborders', icon: FaClipboardList },
        { name: 'Manage Phlebotomist', href: '/vendors/labvendor/labdashboard/ManagePhlebotomist', icon: FaVials },
        { name: 'Assign Phlebotomist', href: '/vendors/labvendor/labdashboard/assign-phlebotomist', icon: FaUserMd },
        { name: 'Track Phlebotomist', href: '/vendors/labvendor/labdashboard/track-phlebotomist', icon: FaMapMarkedAlt },
        { name: 'My Packages', href: '/vendors/labvendor/labdashboard/packages', icon: FaBoxOpen },
        { name: 'Add Services', href: '/vendors/labvendor/labdashboard/addservices', icon: FaPlusSquare },
        { name: 'Upload Reports', href: '/vendors/labvendor/labdashboard/upload-reports', icon: FaFileMedical },
        { name: 'Manage Documents', href: '/vendors/labvendor/labdashboard/manage-documents', icon: FaFolderOpen },
        { name: 'Promotions', href: '/vendors/labvendor/labdashboard/promotions', icon: FaBullhorn },
        { name: 'Order History', href: '/vendors/labvendor/labdashboard/order-history', icon: FaHistory },
        { name: 'Wallet & Earning', href: '/vendors/labvendor/labdashboard/wallet', icon: FaWallet },
        { name: 'Availability', href: '/vendors/labvendor/labdashboard/availability', icon: FaCalendarCheck },
        { name: 'Delivery Charges', href: '/vendors/labvendor/labdashboard/delivery-charge', icon: FaTruck },
        { name: 'Settings', href: '/vendors/labvendor/labdashboard/settings', icon: FaCog },
    ];

    // --- FULL SCREEN LOADER ---
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-green-100 border-t-[#08B36A] rounded-full animate-spin"></div>
                    <FaFlask className="absolute text-[#08B36A] text-xl" />
                </div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Verifying Lab Access...</p>
            </div>
        );
    }

    // Safety check: Don't render UI if no token exists
    if (!labToken && typeof window !== "undefined" && !localStorage.getItem("labToken")) {
        return null;
    }

    return (
        <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col h-full
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:static lg:inset-0
                ${isCollapsed ? 'w-20' : 'w-64'} 
            `}>
                <div className="p-4 border-b border-gray-50 flex items-center justify-center min-h-[70px] flex-shrink-0">
                    <Link href="/vendors/labvendor" className="flex items-center justify-center overflow-hidden">
                        {isCollapsed ? (
                            <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <Image src="/logo.png" alt="Logo" width={120} height={40} className="object-contain" />
                                <span className="text-[10px] text-green-600 font-bold uppercase tracking-tighter mt-1">
                                    {labVendor?.labName || "Lab Vendor"}
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                title={isCollapsed ? item.name : ""}
                                className={`
                                    flex items-center rounded-xl transition-all duration-200 group
                                    ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'}
                                    ${isActive
                                        ? 'bg-[#08B36A] text-white shadow-md shadow-green-100 font-medium'
                                        : 'text-gray-500 hover:bg-[#08B36A]/10 hover:text-[#08B36A]'
                                    }
                                `}
                            >
                                <item.icon className={`
                                    text-xl flex-shrink-0
                                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#08B36A]'}
                                `} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap text-sm font-medium">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 flex justify-center lg:flex hidden bg-gray-50/50 flex-shrink-0">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-[#08B36A] hover:text-white transition-colors"
                    >
                        {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
                    </button>
                </div>
            </aside>

            {/* --- MAIN SECTION --- */}
            <div className="flex-1 flex flex-col h-screen min-w-0">
                <LabTopBar onMobileMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}