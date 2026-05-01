'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    FaBars, FaUserCircle, FaSignOutAlt, FaChevronDown, 
    FaCalendarCheck, FaHistory, FaWallet, FaChartLine, 
    FaClock, FaTicketAlt, FaFileAlt, FaComments,
    // Naye icons add kiye gaye hain niche diye gaye 5 items ke liye
    FaAmbulance, FaHospital, FaNotesMedical, FaMedkit, FaBriefcaseMedical
} from "react-icons/fa";
import { MdMenuOpen, MdMenu } from "react-icons/md";

// ==========================================
// 🌟 1. DOCTOR TOPBAR COMPONENT 🌟
// ==========================================
const DoctorTopBar = ({ onMobileMenuClick, onToggleCollapse, isCollapsed }) => {
    const[isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    },[]);

    const menuItems =[
        { name: 'My Profile', href: '/vendors/doctor/profile', icon: FaUserCircle },
    ];

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-40 transition-all duration-300">
            
            {/* Left Side: Menu Buttons */}
            <div className="flex items-center gap-4">
                {/* Mobile Hamburger Button */}
                <button 
                    onClick={onMobileMenuClick} 
                    className="lg:hidden p-2 text-gray-500 hover:text-[#08B36A] hover:bg-green-50 rounded-lg transition-colors"
                >
                    <FaBars size={20} />
                </button>

                {/* Desktop Minimize/Expand Button */}
                <button 
                    onClick={onToggleCollapse} 
                    className="hidden lg:flex p-2 text-gray-500 hover:text-[#08B36A] hover:bg-green-50 rounded-lg transition-colors items-center justify-center"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <MdMenu size={24} /> : <MdMenuOpen size={24} />}
                </button>
            </div>

            {/* Right Side: Profile Area */}
            <div className="flex items-center gap-4">
                {/* Profile Dropdown Area */}
                <div className="relative" ref={dropdownRef}>
                    {/* Profile Trigger Button */}
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-2 rounded-xl transition-all text-left border border-transparent hover:border-gray-200"
                    >
                        <FaUserCircle size={32} className="text-[#08B36A]" />
                        <div className="hidden md:block">
                            <p className="text-sm font-bold text-gray-700 leading-tight">Dr. abhi</p>
                            <p className="text-xs font-medium text-gray-500">Senior Doctor</p>
                        </div>
                        <FaChevronDown 
                            size={12} 
                            className={`hidden md:block text-gray-400 transition-transform duration-300 ml-1 ${
                                isDropdownOpen ? "rotate-180 text-[#08B36A]" : ""
                            }`} 
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                            <div className="block md:hidden px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/50">
                                <p className="text-sm font-bold text-gray-800">Dr. abhi</p>
                                <p className="text-xs font-medium text-gray-500">Senior Doctor</p>
                            </div>

                            {menuItems.map((item, index) => (
                                <Link 
                                    key={index}
                                    href={item.href}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#08B36A] hover:bg-green-50 transition-colors"
                                >
                                    <item.icon className="text-lg opacity-80" />
                                    {item.name}
                                </Link>
                            ))}

                            <div className="my-1 border-t border-gray-100"></div>

                            <button 
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    alert("Logged out successfully!");
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <FaSignOutAlt className="text-lg opacity-80" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

// ==========================================
// 🌟 2. MAIN DOCTOR LAYOUT COMPONENT 🌟
// ==========================================
export default function DoctorVendorLayout({ children }) {
    const[isSidebarOpen, setSidebarOpen] = useState(false); 
    const[isCollapsed, setIsCollapsed] = useState(false);   
    const pathname = usePathname()

    // 🌟 Sidebar Menu Items (Naye 5 items ko end me add kar diya gaya hai) 🌟
    const menuItems =[
        { name: 'Dashboard', href: '/vendors/doctor', icon: FaChartLine },
        { name: 'Appointments', href: '/vendors/doctor/appointments', icon: FaCalendarCheck },
        { name: 'Availability', href: '/vendors/doctor/availability', icon: FaClock },          
        { name: 'Coupons', href: '/vendors/doctor/coupons', icon: FaTicketAlt },                
        { name: 'Consultation History', href: '/vendors/doctor/consultation-history', icon: FaHistory },
        { name: 'Wallet & Earnings', href: '/vendors/doctor/wallet', icon: FaWallet },
        { name: 'Documents', href: '/vendors/doctor/documents', icon: FaFileAlt },              
        { name: 'Chats', href: '/vendors/doctor/chats', icon: FaComments }, 
        
        // ---- Ye Naye 5 items hain image ke mutabik ----
        { name: 'Emergency Case', href: '/vendors/doctor/emergency-case', icon: FaAmbulance },
        { name: 'Admission Case', href: '/vendors/doctor/admission-case', icon: FaHospital },
        { name: 'History', href: '/vendors/doctor/history', icon: FaNotesMedical },
        { name: 'Emergency Request', href: '/vendors/doctor/emergency-request', icon: FaMedkit },
        { name: 'Hospital Request', href: '/vendors/doctor/hospital-request', icon: FaBriefcaseMedical },
    ];

    return (
        <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
            
            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col h-full
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
                lg:translate-x-0 lg:static lg:inset-0
                ${isCollapsed ? 'lg:w-20' : 'w-64'} 
            `}>
                {/* LOGO AREA */}
                <div className="p-4 border-b border-gray-50 flex items-center justify-center min-h-[64px] flex-shrink-0">
                    <Link href="/vendors/doctor" className="flex items-center justify-center overflow-hidden">
                        {isCollapsed ? (
                            <Image 
                                src="/logo.png" 
                                alt="Logo" 
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
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
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
            </aside>

            {/* --- MAIN CONTENT SECTION --- */}
            <div className="flex-1 flex flex-col h-screen min-w-0 transition-all duration-300 bg-gray-50">
                
                {/* 🌟 TopBar integrated here 🌟 */}
                <DoctorTopBar 
                    onMobileMenuClick={() => setSidebarOpen(true)} 
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    isCollapsed={isCollapsed}
                />

                {/* Page Content Rendered Here */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>

            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}