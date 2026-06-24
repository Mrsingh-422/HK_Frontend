'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image' // Added Image import
import { usePathname } from 'next/navigation'
import {
    FaFileMedicalAlt,
    FaHourglassHalf,
    FaUsersCog,
    FaCalendarAlt,
    FaHistory,
    FaMapMarkedAlt,
    FaCog,
    FaHome,
    FaKey
} from "react-icons/fa";

import TopbarPoliceStation from './components/topbarpolicestation';

export default function PoliceStationLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false); // Added for mobile responsiveness
    const pathname = usePathname()

    const menuItems = [
        {
            name: 'Dashboard',
            href: '/policeandfire/policestation/dashboard',
            icon: FaHome
        },
        {
            name: 'Fresh Case',
            href: '/policeandfire/policestation/freshcase',
            icon: FaFileMedicalAlt
        },
        {
            name: 'Pending',
            href: '/policeandfire/policestation/pendingcase',
            icon: FaHourglassHalf
        },
        {
            name: 'Manage Staff',
            href: '/policeandfire/policestation/managestaff',
            icon: FaUsersCog
        },
        {
            name: 'Staff Roster',
            href: '/policeandfire/policestation/staffroster',
            icon: FaCalendarAlt
        },
        {
            name: 'Create Case',
            href: '/policeandfire/policestation/create-case',
            icon: FaCalendarAlt
        },
        {
            name: 'History',
            href: '/policeandfire/policestation/history',
            icon: FaHistory
        },
        
        {
            name: 'Jurisdiction Areas',
            href: '/policeandfire/policestation/jurdictionarea',
            icon: FaMapMarkedAlt
        },
        {
            name: 'Setting',
            href: '/policeandfire/policestation/setting',
            icon: FaCog
        },
        {
            name: 'Change Password',
            href: '/policeandfire/policestation/change-password',
            icon: FaKey
        },
    ];

    return (
        // FIX 1: 'min-h-screen' hata kar 'fixed inset-0 overflow-hidden' lagaya jisse page lock ho jaye.
        <div className="fixed inset-0 bg-[#F9FAFB] flex font-sans overflow-hidden">
            
            {/* --- SIDEBAR --- */}
            {/* FIX 2: 'h-full shrink-0' lagaya taaki sidebar dab ke chhota na ho */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 flex flex-col h-full shrink-0
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:inset-0
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}>

                {/* --- LOGO AREA (MATCHED WITH HEADQUARTER) --- */}
                <div className="p-4 border-b border-gray-50 flex items-center justify-center min-h-[70px]">
                    <Link href="/policeandfire/policestation" className="flex items-center justify-center overflow-hidden">
                        {isCollapsed ? (
                            <Image
                                src="/logo.png"
                                alt="HK Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        ) : (
                            <Image
                                src="/logo.png"
                                alt="Health Kangaroo Logo"
                                width={140}
                                height={50}
                                className="object-contain"
                            />
                        )}
                    </Link>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)} // Close mobile sidebar on click
                                className={`
                                    flex items-center rounded-xl transition-all duration-200 group
                                    ${isCollapsed ? 'justify-center p-3' : 'gap-3.5 px-4 py-3'}
                                    ${isActive
                                        ? 'bg-[#08B36A] text-white shadow-lg shadow-green-100 font-bold'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                    }
                                `}
                            >
                                <item.icon className={`${isCollapsed ? 'text-xl' : 'text-lg'} shrink-0`} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap text-[12px] tracking-[0.05em] uppercase font-bold">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

            </aside>

            {/* --- MAIN CONTENT --- */}
            {/* FIX 3: Right side container ko 'h-full min-h-0 overflow-hidden' diya */}
            <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
                
                {/* FIX 4: Topbar ko shrink-0 me wrap kiya jisse wo upar fixed rahe */}
                <div className="shrink-0">
                    <TopbarPoliceStation
                        isCollapsed={isCollapsed}
                        onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
                        onMobileMenuClick={() => setSidebarOpen(true)} // Pass mobile trigger
                    />
                </div>

                {/* FIX 5: Main section ko 'overflow-y-auto min-h-0' diya taaki SIRF ye scroll ho */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto min-h-0 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
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