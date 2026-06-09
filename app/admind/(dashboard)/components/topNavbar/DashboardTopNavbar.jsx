"use client";
 
import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import DiamondAPI from "@/app/services/DiamondAPI";
import { Toaster } from "react-hot-toast";
 
const DashboardTopNavbar = ({ heading }) => {
    const [openProfile, setOpenProfile] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();
    const { toggleSidebar } = useGlobalContext();
    const profileRef = useRef(null);
    const themeColor = "#08B36A";
 
    // --- 🌟 FETCH PROFILE LOGIC (FIXED) 🌟 ---
    const fetchProfile = async () => {
        try {
            // 1. LocalStorage se login user ki info nikaalo
            const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
            const loginId = storedAdmin.id || storedAdmin._id;
 
            if (!loginId) return;
 
            const res = await DiamondAPI.getAdminProfile();
            if (res.success && res.data.length > 0) {
               
                // 2. CRITICAL FIX: Puri list mein se login waale bande ko dhoondo
                // Sirf res.data[0] mat lo, kyunki Superadmin ko sabki list milti hai
                const currentUser = res.data.find(user => user._id === loginId);
               
                if (currentUser) {
                    setAdminData(currentUser);
                } else {
                    // Fallback: Agar filter na mile toh pehla wala hi sahi (subadmin ke liye)
                    setAdminData(res.data[0]);
                }
            }
        } catch (err) {
            console.error("Navbar Sync Error", err);
        }
    };
 
    // Jab bhi page badle, data re-fetch karo
    useEffect(() => {
        fetchProfile();
    }, [pathname]);
 
    const handleLogout = () => {
        setAdminData(null);
        logout();
        router.replace('/admin/login');
    };
 
    return (
        <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <Toaster position="top-right" />
           
            <div className="flex items-center justify-between relative">
               
                {/* LEFT */}
                <div className="flex items-center gap-4 min-w-[200px]">
                    <button onClick={toggleSidebar} className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-gray-500 border border-gray-100">
                        <HiMenuAlt2 size={22} />
                    </button>
                    <div className="hidden lg:block">
                        <h2 className="text-lg font-black text-gray-800 leading-none">{heading}</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">System / {heading}</p>
                    </div>
                </div>
 
                {/* CENTER: Identity based on filtered data */}
                <div className="absolute left-1/2 -translate-x-1/2 text-center flex flex-col items-center">
                    <h3 className="text-base font-black text-gray-800 tracking-tight leading-none uppercase">
                        {adminData?.name || "Syncing Profile..."}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }}></span>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: themeColor }}>
                            {/* Role logic */}
                            {adminData?.role === 'superadmin' ? 'Super Admin' : (adminData?.roleType?.name || 'Sub Admin')}
                        </p>
                    </div>
                </div>
 
                {/* RIGHT */}
                <div className="flex items-center gap-4 min-w-[200px] justify-end" ref={profileRef}>
                    <div className="relative">
                        <button
                            onClick={() => setOpenProfile(!openProfile)}
                            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 text-white shadow-lg hover:scale-105 transition-all"
                        >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: themeColor }}>
                                {adminData?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">Account</span>
                        </button>
 
                        {openProfile && (
                            <div className="absolute right-0 mt-4 w-64 bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 py-3 animate-in fade-in zoom-in duration-200">
                                <div className="px-6 py-3 border-b border-gray-50 mb-2">
                                    <p className="text-xs font-black text-gray-800 truncate">{adminData?.email}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Role: {adminData?.role}</p>
                                </div>
                                <Link href="/admind/profile" onClick={() => setOpenProfile(false)} className="w-full flex items-center gap-3 px-6 py-3 text-[11px] text-gray-600 hover:bg-gray-50 font-black uppercase tracking-widest transition-all">
                                    <FaUserEdit className="text-[#08B36A] text-sm" /> Edit My Profile
                                </Link>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-[11px] text-red-500 hover:bg-red-50 font-black uppercase tracking-widest transition-all">
                                    <FaSignOutAlt className="text-sm" /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
 
export default DashboardTopNavbar;
 