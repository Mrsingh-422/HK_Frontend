'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
    FaUserCircle,
    FaHistory,
    FaWallet,
    FaCalendarCheck,
    FaTruck
} from "react-icons/fa";
import LabTopBar from './components/LabTopBar';

export default function LabVendorLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname()

    // 🌟 Updated Menu Items (Old + New from Image) 🌟
    const menuItems = [
        // Existing Routes
        { name: 'Dashboard', href: '/vendors/labvendor/labdashboard', icon: FaFlask },
        { name: 'Orders', href: '/vendors/labvendor/labdashboard/laborders', icon: FaClipboardList },

        // Phlebotomist Section
        { name: 'Manage Phlebotomist', href: '/vendors/labvendor/labdashboard/ManagePhlebotomist', icon: FaVials },
        { name: 'Assign Phlebotomist', href: '/vendors/labvendor/labdashboard/assign-phlebotomist', icon: FaUserMd },
        { name: 'Track Phlebotomist', href: '/vendors/labvendor/labdashboard/track-phlebotomist', icon: FaMapMarkedAlt },

        // Services & Packages
        { name: 'My Packages', href: '/vendors/labvendor/labdashboard/packages', icon: FaBoxOpen },
        { name: 'Add Services', href: '/vendors/labvendor/labdashboard/addservices', icon: FaPlusSquare },

        // Reports & Documents
        { name: 'Upload Reports', href: '/vendors/labvendor/labdashboard/upload-reports', icon: FaFileMedical },
        { name: 'Manage Documents', href: '/vendors/labvendor/labdashboard/manage-documents', icon: FaFolderOpen },

        // Marketing & Profile
        { name: 'Promotions', href: '/vendors/labvendor/labdashboard/promotions', icon: FaBullhorn },

        // History & Finance
        { name: 'Order History', href: '/vendors/labvendor/labdashboard/order-history', icon: FaHistory },
        { name: 'Wallet & Earning', href: '/vendors/labvendor/labdashboard/wallet', icon: FaWallet },

        // Settings & Delivery
        { name: 'Availability', href: '/vendors/labvendor/labdashboard/availability', icon: FaCalendarCheck },
        { name: 'Delivery Charges', href: '/vendors/labvendor/labdashboard/delivery-charge', icon: FaTruck },
        { name: 'Settings', href: '/vendors/labvendor/labdashboard/settings', icon: FaCog },
    ];

    return (
        // 👇 CHANGED: 'min-h-screen' to 'h-screen w-full overflow-hidden'
        <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col h-full
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:static lg:inset-0
                ${isCollapsed ? 'w-20' : 'w-64'} 
            `}>
                {/* 🌟 LOGO AREA 🌟 */}
                {/* 👇 CHANGED: Added flex-shrink-0 so logo doesn't shrink when scrolling */}
                <div className="p-4 border-b border-gray-50 flex items-center justify-center min-h-[70px] flex-shrink-0">
                    <Link href="/vendors/labvendor" className="flex items-center justify-center overflow-hidden">
                        {isCollapsed ? (
                            <Image
                                src="/logo.png"
                                alt="HK Logo"
                                width={40}
                                height={40}
                                className="object-contain transition-all duration-300"
                            />
                        ) : (
                            <Image
                                src="/logo.png"
                                alt="Health Kangaroo Logo"
                                width={140}
                                height={50}
                                className="object-contain transition-all duration-300"
                            />
                        )}
                    </Link>
                </div>

                {/* Navigation Links */}
                {/* overflow-y-auto ensures that if items are more, it will scroll nicely */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
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
                                        : 'text-gray-500 hover:bg-[#08B36A] hover:text-white'
                                    }
                                `}
                            >
                                <item.icon className={`
                                    text-xl transition-colors duration-200 flex-shrink-0
                                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                                `} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap text-sm font-medium">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Collapse / Expand Toggle Button (< >) */}
                {/* 👇 CHANGED: Added flex-shrink-0 */}
                <div className="p-4 border-t border-gray-100 flex justify-center lg:flex hidden bg-gray-50/50 flex-shrink-0">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-[#08B36A] hover:border-[#08B36A] hover:text-white transition-colors shadow-sm"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
                    </button>
                </div>
            </aside>

            {/* --- MAIN SECTION --- */}
            {/* 👇 CHANGED: Added h-screen so content takes exact height */}
            <div className="flex-1 flex flex-col h-screen min-w-0">
                <LabTopBar onMobileMenuClick={() => setSidebarOpen(true)} />

                {/* 👇 CHANGED: Ensure overflow-y-auto is active so main content scrolls individually */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
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