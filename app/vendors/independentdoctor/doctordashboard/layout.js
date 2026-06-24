"use client";

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
    FaBars, FaUserCircle, FaSignOutAlt, FaChevronDown,
    FaCalendarCheck, FaHistory, FaWallet, FaChartLine,
    FaClock, FaTicketAlt, FaCog, FaUser, FaTag, FaPrescription,
    FaUniversity, FaInfoCircle, FaFileContract
} from "react-icons/fa";
import { MdMenuOpen, MdMenu } from "react-icons/md";
import DoctorAPI from '@/app/services/DoctorAPI';

// ==========================================
// 🌟 1. DOCTOR TOPBAR COMPONENT 🌟
// ==========================================
const DoctorTopBar = ({ onMobileMenuClick, onToggleCollapse, isCollapsed }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const dropdownRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await DoctorAPI.getProfile();
                if (res.success) {
                    setProfile(res.data);
                }
            } catch (error) {
                console.error("Error retrieving profile data:", error);
            }
        };
        fetchProfileData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctorProvider');
        localStorage.removeItem('token');
        setIsDropdownOpen(false);
        router.push('/');
    };

    const profileMenuItems = [
        { name: 'My Profile', href: '/vendors/independentdoctor/doctordashboard/profile', icon: FaUserCircle },
    ];

    // Format Doctor Name gracefully
    const formatDoctorName = (name) => {
        if (!name) return "Doctor";
        const cleanName = name.trim();
        return cleanName.toLowerCase().startsWith("dr") ? cleanName : `Dr. ${cleanName}`;
    };

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-40 transition-all duration-300">

            <div className="flex items-center gap-4">
                <button
                    onClick={onMobileMenuClick}
                    className="lg:hidden p-2 text-gray-500 hover:text-[#08B36A] hover:bg-green-50 rounded-lg transition-colors"
                >
                    <FaBars size={20} />
                </button>

                <button
                    onClick={onToggleCollapse}
                    className="hidden lg:flex p-2 text-gray-500 hover:text-[#08B36A] hover:bg-green-50 rounded-lg transition-colors items-center justify-center"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <MdMenu size={24} /> : <MdMenuOpen size={24} />}
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-2 rounded-xl transition-all text-left border border-transparent hover:border-gray-200"
                    >
                        {/* Dynamic Profile Picture with Fallback Icon */}
                        {profile?.profilePic ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#08B36A]">
                                <img
                                    src={profile.profilePic}
                                    alt="Doctor Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <FaUserCircle size={32} className="text-[#08B36A]" />
                        )}

                        <div className="hidden md:block">
                            <p className="text-sm font-bold text-gray-700 leading-tight">
                                {profile ? formatDoctorName(profile.name) : "Dr. Abhi"}
                            </p>
                            <p className="text-xs font-medium text-gray-500">Independent Doctor</p>
                        </div>
                        <FaChevronDown
                            size={12}
                            className={`hidden md:block text-gray-400 transition-transform duration-300 ml-1 ${isDropdownOpen ? "rotate-180 text-[#08B36A]" : ""
                                }`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                            {profileMenuItems.map((item, index) => (
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
                                onClick={handleLogout}
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
// 🌟 2. MAIN INDEPENDENT DOCTOR LAYOUT 🌟
// ==========================================
export default function IndependentDoctorLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState({}); // Tracking active submenus state
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', href: '/vendors/independentdoctor/doctordashboard', icon: FaChartLine },
        { name: 'Appointments', href: '/vendors/independentdoctor/doctordashboard/appointments', icon: FaCalendarCheck },
        { name: 'Video Appointments', href: '/vendors/independentdoctor/doctordashboard/videocallappointments', icon: FaCalendarCheck },
        { name: 'Availability', href: '/vendors/independentdoctor/doctordashboard/availability', icon: FaClock },
        { name: 'Coupons', href: '/vendors/independentdoctor/doctordashboard/coupons', icon: FaTicketAlt },
        { name: 'Visit Charges', href: '/vendors/independentdoctor/doctordashboard/visitcharges', icon: FaTag },
        { name: 'Prescription', href: '/vendors/independentdoctor/doctordashboard/prescriptions', icon: FaPrescription },
        { name: 'Patient History', href: '/vendors/independentdoctor/doctordashboard/patienthistory', icon: FaHistory },
        { name: 'Wallet & Earnings', href: '/vendors/independentdoctor/doctordashboard/Wallet', icon: FaWallet },
        {
            name: 'Settings',
            icon: FaCog,
            isSubmenu: true,
            submenuItems: [
                { name: 'Profile', href: '/vendors/independentdoctor/doctordashboard/profile', icon: FaUserCircle },
                { name: 'Manage Banking', href: '/vendors/independentdoctor/doctordashboard/managebanking', icon: FaUniversity },
                { name: 'About', href: '/vendors/independentdoctor/doctordashboard/about', icon: FaInfoCircle },
                { name: 'Terms & Conditions', href: '/vendors/independentdoctor/doctordashboard/terms-and-conditions', icon: FaFileContract }
            ]
        }
    ];

    const toggleSubmenu = (name) => {
        setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

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
                    <Link href="/vendors/independentdoctor/doctordashboard" className="flex items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={isCollapsed ? 40 : 140}
                            height={50}
                            className="object-contain transition-all"
                        />
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    {menuItems.map((item) => {
                        // Condition A: If item contains a nested submenu
                        if (item.isSubmenu) {
                            const isSubmenuActive = item.submenuItems.some(sub => pathname === sub.href);
                            const isOpen = !!openSubmenus[item.name] || isSubmenuActive;

                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={() => toggleSubmenu(item.name)}
                                        title={isCollapsed ? item.name : ""}
                                        className={`
                                            w-full flex items-center justify-between rounded-xl transition-all duration-200 group
                                            ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'}
                                            ${isSubmenuActive
                                                ? 'bg-[#08B36A]/10 text-[#08B36A] font-semibold'
                                                : 'text-gray-500 hover:bg-[#08B36A] hover:text-white'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`
                                                text-xl transition-colors duration-200 flex-shrink-0
                                                ${isSubmenuActive ? 'text-[#08B36A]' : 'text-gray-400 group-hover:text-white'}
                                            `} />
                                            {!isCollapsed && (
                                                <span className="whitespace-nowrap text-sm font-medium">{item.name}</span>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <FaChevronDown
                                                size={10}
                                                className={`transition-transform duration-200 text-gray-400 group-hover:text-white ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        )}
                                    </button>

                                    {/* Render Submenu Links */}
                                    {isOpen && !isCollapsed && (
                                        <div className="pl-4 pr-1 py-1 space-y-1 bg-gray-50/50 rounded-xl mt-1">
                                            {item.submenuItems.map((subItem) => {
                                                const isSubActive = pathname === subItem.href;
                                                return (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={`
                                                            flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-150 group
                                                            ${isSubActive
                                                                ? 'bg-[#08B36A] text-white shadow-sm font-semibold'
                                                                : 'text-gray-500 hover:bg-[#08B36A]/10 hover:text-[#08B36A]'
                                                            }
                                                        `}
                                                    >
                                                        <subItem.icon className={`
                                                            text-base transition-colors duration-150 flex-shrink-0
                                                            ${isSubActive ? 'text-white' : 'text-gray-400 group-hover:text-[#08B36A]'}
                                                        `} />
                                                        <span className="whitespace-nowrap text-xs font-medium">{subItem.name}</span>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Condition B: Standard Flat Menu Links
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

                <DoctorTopBar
                    onMobileMenuClick={() => setSidebarOpen(true)}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    isCollapsed={isCollapsed}
                />

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