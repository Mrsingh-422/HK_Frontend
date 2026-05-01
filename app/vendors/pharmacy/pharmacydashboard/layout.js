'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    FaBars, FaUserCircle, FaSignOutAlt, FaChevronDown,
    FaHome, FaBoxOpen, FaMotorcycle, FaClipboardList,
    FaMapMarkedAlt, FaPills, FaBullhorn, FaFileAlt,
    FaMoneyBillWave, FaWallet, FaQuestionCircle,
    FaCalendarAlt, FaMapMarkerAlt 
} from "react-icons/fa";
import { MdMenuOpen, MdMenu } from "react-icons/md";
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

// ==========================================
// 🌟 1. PHARMACY TOPBAR COMPONENT 🌟
// ==========================================
const PharmacyTopBar = ({ onMobileMenuClick, onToggleCollapse, isCollapsed, profile }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [imgError, setImgError] = useState(false); 
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems = [
        { name: 'My Profile', href: '/vendors/pharmacy/pharmacydashboard/profile', icon: FaUserCircle },
    ];

    /**
     * 🌟 FIXED: Constructed URL to fetch from Backend API 🌟
     * It checks if path exists, removes 'public/' and prepends the Backend URL
     */
    const getProfilePic = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        // Removes 'public/' and ensures there is a single slash between URL and path
        const cleanPath = path.replace('public/', '');
        return `${backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
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
                        className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-2xl transition-all text-left border border-transparent hover:border-gray-200"
                    >
                        {/* 🌟 IMPROVED PROFILE PHOTO RENDERING 🌟 */}
                        <div className="h-10 w-10 rounded-full border-2 border-[#08B36A] overflow-hidden bg-emerald-50 flex items-center justify-center shrink-0 shadow-sm">
                            {(profile?.profileImage || profile?.image) && !imgError ? (
                                <img 
                                    src={getProfilePic(profile.profileImage || profile.image)} 
                                    alt="Pharmacy Profile" 
                                    className="h-full w-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <FaUserCircle size={32} className="text-[#08B36A]" />
                            )}
                        </div>

                        <div className="hidden md:block">
                            <p className="text-sm font-black text-gray-800 leading-tight capitalize">
                                {profile?.pharmacyName || profile?.name || "Pharmacy Vendor"}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <FaMapMarkerAlt size={10} className="text-[#08B36A]" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate max-w-[150px]">
                                    {profile?.city ? `${profile.city}, ${profile.state || ''}` : "Location not set"}
                                </p>
                            </div>
                        </div>
                        <FaChevronDown
                            size={12}
                            className={`hidden md:block text-gray-400 transition-transform duration-300 ml-1 ${isDropdownOpen ? "rotate-180 text-[#08B36A]" : ""}`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                            <div className="block md:hidden px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/50">
                                <p className="text-sm font-bold text-gray-800">{profile?.pharmacyName || profile?.name || "Pharmacy"}</p>
                                <p className="text-xs font-medium text-gray-500">{profile?.city || "Vendor"}</p>
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
                                    localStorage.removeItem('pharmacyToken');
                                    window.location.href = '/auth/login';
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
// 🌟 2. MAIN PHARMACY LAYOUT COMPONENT 🌟
// ==========================================
export default function PharmacyVendorLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [profile, setProfile] = useState(null); 
    const pathname = usePathname()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await PharmacyVendorAPI.getPharmacyProfile();
                // Handling both res.success and res.data structures
                if (res?.success) {
                    setProfile(res.data);
                } else if (res?.data) {
                    setProfile(res.data);
                } else {
                    setProfile(res);
                }
            } catch (error) {
                console.error("Layout Profile Fetch Error:", error);
            }
        };
        fetchProfile();
    }, []);

    const menuItems = [
        { name: 'Dashboard', href: '/vendors/pharmacy/pharmacydashboard', icon: FaHome },
        { name: 'Orders', href: '/vendors/pharmacy/pharmacydashboard/orders', icon: FaBoxOpen },
        { name: 'Manage Driver', href: '/vendors/pharmacy/pharmacydashboard/manage-driver', icon: FaMotorcycle },
        { name: 'Assign Driver', href: '/vendors/pharmacy/pharmacydashboard/assign-driver', icon: FaClipboardList },
        { name: 'Track Driver', href: '/vendors/pharmacy/pharmacydashboard/track-driver', icon: FaMapMarkedAlt },
        { name: 'Pharmacy Services', href: '/vendors/pharmacy/pharmacydashboard/pharmacy-service', icon: FaPills },
        { name: 'Schedule', href: '/vendors/pharmacy/pharmacydashboard/schedule', icon: FaCalendarAlt },
        { name: 'Promotion', href: '/vendors/pharmacy/pharmacydashboard/coupon', icon: FaBullhorn },
        { name: 'Manage Documents', href: '/vendors/pharmacy/pharmacydashboard/document', icon: FaFileAlt },
        { name: 'Manage Delivery Charges', href: '/vendors/pharmacy/pharmacydashboard/delivery-charges', icon: FaMoneyBillWave },
        { name: 'Wallet & Earning', href: '/vendors/pharmacy/pharmacydashboard/wallet', icon: FaWallet },
    ];

    return (
        <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col h-full
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
                lg:translate-x-0 lg:static lg:inset-0
                ${isCollapsed ? 'lg:w-20' : 'w-72'} 
            `}>
                <div className="p-4 border-b border-gray-50 flex items-center justify-center min-h-[64px] flex-shrink-0">
                    <Link href="/vendors/pharmacy" className="flex items-center justify-center overflow-hidden">
                        {isCollapsed ? (
                            <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain transition-all duration-300" />
                        ) : (
                            <Image src="/logo.png" alt="Health Kangaroo Logo" width={140} height={50} className="object-contain transition-all duration-300" />
                        )}
                    </Link>
                </div>

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

            {/* Content Container */}
            <div className="flex-1 flex flex-col h-screen min-w-0 transition-all duration-300 bg-gray-50">
                <PharmacyTopBar
                    onMobileMenuClick={() => setSidebarOpen(true)}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    isCollapsed={isCollapsed}
                    profile={profile} 
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}