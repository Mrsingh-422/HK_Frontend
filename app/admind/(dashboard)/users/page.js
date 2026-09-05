"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    FaEye, FaSearch, FaUserCheck, FaUsers, FaUserTimes, 
    FaCheckCircle, FaExclamationCircle, FaSyncAlt 
} from "react-icons/fa";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import UserDetailModal from "./components/UserDetailModal";
import AdminAPI from "@/app/services/AdminAPI";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5002";

export default function UserManagementPage() {
    // --- Table States ---
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // --- Modal States ---
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fetchingDetailId, setFetchingDetailId] = useState(null);

    // --- Toggle & Notification States ---
    const [togglingId, setTogglingId] = useState(null);
    const [alertBanner, setAlertBanner] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlertBanner({ message, type });
        setTimeout(() => setAlertBanner(null), 4500);
    };

    // --- HELPER: IMAGE URL ---
    const getFullImageUrl = (path, name) => {
        if (!path || path === "null" || path === "") {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=08B36A&color=fff&bold=true`;
        }
        if (path.startsWith('http')) return path;
        const cleanURL = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanURL}${cleanPath}`;
    };

    // --- FETCH USERS ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            let res = search.trim().length > 0 
                ? await AdminAPI.adminSearchUsers(search) 
                : await AdminAPI.adminGetUsers(currentPage);

            if (res.data?.success || res.success || res.status === 200) {
                const list = res.data?.users || res.data || [];
                setUsers(list);
                setTotalPages(res.data?.totalPages || res.pages || res.totalPages || 1);
                setTotalUsers(res.data?.totalUsers || res.total || res.totalUsers || list.length);
            }
        } catch (err) { 
            console.error("Error loading users:", err);
            showAlert(err.response?.data?.message || "Failed to load user records", "error");
        } finally { 
            setLoading(false); 
        }
    }, [currentPage, search]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [search, fetchUsers]);

    // --- TOGGLE USER STATUS (ACTIVE ⟷ INACTIVE) ---
    const toggleStatus = async (userId) => {
        if (!userId) return;
        setTogglingId(userId);

        try {
            const res = await AdminAPI.adminToggleUserStatus(userId);
            
            if (res.data?.success || res.success || res.status === 200) {
                const isNowActive = res.data?.isActive ?? res.isActive;
                const message = res.data?.message || res.message || `User status updated to ${isNowActive ? 'Active' : 'Inactive'}.`;
                
                // Optimistic Local State Update
                setUsers(prevUsers => prevUsers.map(u => {
                    const currentId = u._id || u.id;
                    if (currentId === userId) {
                        return { 
                            ...u, 
                            isActive: isNowActive, 
                            active: isNowActive 
                        };
                    }
                    return u;
                }));

                showAlert(message, "success");
            } else {
                showAlert(res.data?.message || res.message || "Failed to update user status", "error");
            }
        } catch (err) {
            console.error("Toggle user status error:", err);
            showAlert(err.response?.data?.message || "Error updating status", "error");
        } finally {
            setTogglingId(null);
        }
    };

    // --- VIEW COMPLETE USER DETAILS MODAL ---
    const handleViewDetail = async (userId) => {
        setFetchingDetailId(userId);
        try {
            const res = await AdminAPI.adminGetUserDetails(userId);
            if (res.data?.success || res.success || res.status === 200) {
                setSelectedUserDetail(res.data?.data || res.data);
                setIsModalOpen(true);
            } else {
                showAlert(res.data?.message || "Could not retrieve user profile", "error");
            }
        } catch (err) { 
            console.error("Error loading user profile:", err);
            showAlert(err.response?.data?.message || "Error loading user details", "error"); 
        } finally { 
            setFetchingDetailId(null); 
        }
    };

    const isUserActive = (user) => {
        if (typeof user.isActive !== 'undefined') return Boolean(user.isActive);
        if (typeof user.active !== 'undefined') return Boolean(user.active);
        return true;
    };

    const activeCount = users.filter(u => isUserActive(u)).length;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 font-sans text-slate-800">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* Alert Notification Toast */}
                {alertBanner && (
                    <div
                        className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md transition-all animate-in fade-in duration-200 ${
                            alertBanner.type === "error"
                                ? "bg-rose-50 border border-rose-200 text-rose-800"
                                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {alertBanner.type === "error" ? <FaExclamationCircle size={16} /> : <FaCheckCircle size={16} />}
                            <span>{alertBanner.message}</span>
                        </div>
                        <button onClick={() => setAlertBanner(null)} className="p-1 hover:opacity-70">
                            <IoClose size={16} />
                        </button>
                    </div>
                )}

                {/* Top Header & Statistics */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">User Registry</h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mt-1">
                            Personnel Management, Access Control & Bookings Inspection
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <StatBox icon={<FaUsers />} count={totalUsers} label="Total Users" color="text-blue-600" bg="bg-blue-50" />
                        <StatBox icon={<FaUserCheck />} count={activeCount} label="Active Now" color="text-[#08B36A]" bg="bg-green-50" />
                        
                        <button 
                            onClick={fetchUsers}
                            disabled={loading}
                            className="p-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl shadow-sm transition disabled:opacity-50"
                            title="Refresh User List"
                        >
                            <FaSyncAlt className={loading ? "animate-spin text-[#08B36A]" : ""} />
                        </button>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            {loading ? "Refreshing records..." : `Showing ${users.length} Users (Page ${currentPage} of ${totalPages})`}
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A]" />
                            <input
                                type="text"
                                placeholder="Search by name, phone, email..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#08B36A] outline-none transition"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[350px]">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-6">Identity</th>
                                    <th className="px-6 py-6">Contact Details</th>
                                    <th className="px-6 py-6 text-center">Active Status</th>
                                    <th className="px-6 py-6 text-center">Inspect Profile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-xs">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AiOutlineLoading3Quarters className="animate-spin text-[#08B36A] mx-auto" size={32} />
                                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading registered users...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-24 text-center text-slate-400 font-bold">
                                            No user accounts found matching your query.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => {
                                        const userId = user._id || user.id;
                                        const active = isUserActive(user);
                                        const isToggling = togglingId === userId;
                                        const isFetchingThisDetail = fetchingDetailId === userId;

                                        return (
                                            <tr key={userId} className="hover:bg-slate-50/80 transition-all duration-300 group">
                                                {/* Identity & Avatar */}
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-100 flex-shrink-0">
                                                            <img 
                                                                src={getFullImageUrl(user.profilePic || user.profilePicture, user.name)} 
                                                                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                                                alt={user.name || "User"} 
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-sm uppercase tracking-tight truncate max-w-[180px]">
                                                                {user.name || "Unnamed User"}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 font-mono">
                                                                ID: {userId}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact Details */}
                                                <td className="px-6 py-4">
                                                    <p className="text-[11px] text-slate-500 font-bold lowercase">{user.email || "No email linked"}</p>
                                                    <p className="text-[11px] text-[#08B36A] font-black mt-0.5 tracking-wider font-mono">
                                                        +91 {user.phone || user.number || "N/A"}
                                                    </p>
                                                </td>

                                                {/* Active Status Toggle Button */}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-1">
                                                        <button 
                                                            disabled={isToggling}
                                                            onClick={() => toggleStatus(userId)}
                                                            className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner flex items-center ${
                                                                active ? "bg-[#08B36A]" : "bg-slate-300"
                                                            } ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                                            title={active ? "Click to Deactivate account" : "Click to Activate account"}
                                                        >
                                                            <div 
                                                                className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-md transition-all duration-300 ${
                                                                    active ? "left-7" : "left-1"
                                                                }`} 
                                                            />
                                                        </button>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                                                            active ? "text-emerald-600" : "text-slate-400"
                                                        }`}>
                                                            {isToggling ? "Updating..." : active ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Inspect Profile Action */}
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        disabled={isFetchingThisDetail}
                                                        onClick={() => handleViewDetail(userId)}
                                                        className="p-3 bg-emerald-50 hover:bg-[#08B36A] text-[#08B36A] hover:text-white rounded-2xl transition-all shadow-sm active:scale-90 inline-flex items-center justify-center"
                                                        title="View Complete Profile & Bookings"
                                                    >
                                                        {isFetchingThisDetail ? (
                                                            <AiOutlineLoading3Quarters className="animate-spin" size={16} />
                                                        ) : (
                                                            <FaEye size={16} />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!search && totalPages > 1 && (
                        <div className="flex justify-between items-center px-8 py-6 bg-slate-50/50 border-t border-slate-50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    disabled={currentPage === 1 || loading} 
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                                    className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition"
                                >
                                    <IoChevronBack size={14} />
                                </button>
                                <button 
                                    disabled={currentPage === totalPages || loading} 
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                                    className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition"
                                >
                                    <IoChevronForward size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Complete User Details & Orders Inspection Modal */}
            <UserDetailModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                user={selectedUserDetail} 
            />
        </div>
    );
}

function StatBox({ icon, count, label, color, bg }) {
    return (
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${bg} ${color}`}>{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-xl font-black text-slate-900 leading-none">{count}</p>
            </div>
        </div>
    );
}