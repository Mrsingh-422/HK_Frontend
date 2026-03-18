'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image' 
import { usePathname } from 'next/navigation'
import {
    FaFileMedicalAlt, // Fresh Case
    FaClipboardList,   // Pending
    FaHistory,         // History
    FaCog,             // Setting
    FaUserShield,      // Police Headquarters
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";

// Updated import name
import TopbarPoliceHeadquarter from '../components/topbarpoliceheadquater';
 
export default function LabVendorLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);  
    const pathname = usePathname()
 
    const menuItems = [
        { name: 'Fresh Case', href: '/policeandfire/policeheadquater/freshcase', icon: FaFileMedicalAlt },
        { name: 'Pending', href: '/policeandfire/policeheadquater/pendingcase', icon: FaClipboardList },
        { name: 'History', href: '/policeandfire/policeheadquater/history', icon: FaHistory },
        { name: 'Manage Police Station', href: '/policeandfire/policeheadquater/managepolicestation', icon: FaUserShield },
        { name: 'Terms & Conditions', href: '/policeandfire/policeheadquater/termsandconditions', icon: FaCog },
    ];
 
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:inset-0
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}>
                <div className="p-4 border-b border-gray-50 flex items-center justify-center min-h-[70px]">
                    <Link href="/vendors/labvendor" className="flex items-center justify-center overflow-hidden">
                        {isCollapsed ? (
                            <Image src="/logo.png" alt="HK Logo" width={40} height={40} className="object-contain" />
                        ) : (
                            <Image src="/logo.png" alt="Health Kangaroo Logo" width={140} height={50} className="object-contain" />
                        )}
                    </Link>
                </div>
 
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center rounded-xl transition-all duration-200 group
                                    ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'}
                                    ${isActive
                                        ? 'bg-[#08B36A] text-white shadow-md shadow-green-100 font-medium'
                                        : 'text-gray-600 hover:bg-[#08B36A]/10 hover:text-[#08B36A]' 
                                    }
                                `}
                            >
                                <item.icon className={`
                                    text-lg transition-colors duration-200
                                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#08B36A]'}
                                `} />
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap text-[14px] font-semibold">{item.name}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
 
                <div className="p-4 border-t border-gray-100 flex justify-center lg:flex hidden">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-[#08B36A] hover:text-white transition-colors"
                    >
                        {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
                    </button>
                </div>
            </aside>
 
            <div className="flex-1 flex flex-col min-w-0">
                {/* Changed component tag name */}
                <TopbarPoliceHeadquarter 
                    isCollapsed={isCollapsed} 
                    onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
                    onMobileMenuClick={() => setSidebarOpen(true)}
                />
                <main className="flex-1 p-4 md:p-8 overflow-auto bg-[#F9FAFB]">
                    {children}
                </main>
            </div>
 
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    )
}