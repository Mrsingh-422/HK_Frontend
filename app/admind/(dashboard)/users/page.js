"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaEye, FaSearch, FaUserCheck, FaUsers, FaTrash } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import UserDetailModal from "./components/UserDetailModal";
import AdminAPI from "@/app/services/AdminAPI";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedUserDetail, setSelectedUserDetail] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fetchingDetail, setFetchingDetail] = useState(false);

    // --- HELPER: CONSTRUCT FULL IMAGE URL ---
    const getFullImageUrl = (path, name) => {
        if (!path || path === "null" || path === "") {
            // Fallback to stylized initials if no image
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=08B36A&color=fff&bold=true`;
        }
        if (path.startsWith('http')) return path;
        const cleanURL = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanURL}${cleanPath}`;
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            let res = search.trim().length > 0 
                ? await AdminAPI.adminSearchUsers(search) 
                : await AdminAPI.adminGetUsers(currentPage);

            if (res.success) {
                setUsers(res.data);
                setTotalPages(res.pages || 1);
                setTotalUsers(res.total || 0);
            }
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    }, [currentPage, search]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setCurrentPage(1);
            fetchUsers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    useEffect(() => { if (!search) fetchUsers(); }, [currentPage]);

    const toggleStatus = async (id) => {
        try {
            const res = await AdminAPI.adminToggleUserStatus(id);
            if (res.success) fetchUsers();
        } catch (err) { alert("Status update failed"); }
    };

    const handleViewDetail = async (userId) => {
        setFetchingDetail(true);
        try {
            const res = await AdminAPI.adminGetUserDetails(userId);
            if (res.success) {
                setSelectedUserDetail(res.data);
                setIsModalOpen(true);
            }
        } catch (err) { alert("Error loading details"); } 
        finally { setFetchingDetail(false); }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">User Registry</h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase mt-1">Personnel Management Center</p>
                    </div>
                    <div className="flex gap-4">
                        <StatBox icon={<FaUsers />} count={totalUsers} label="Total Users" color="text-blue-600" bg="bg-blue-50" />
                        <StatBox icon={<FaUserCheck />} count={users.filter(u => u.active).length} label="Live Now" color="text-[#08B36A]" bg="bg-green-50" />
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase">
                            {loading ? "Refreshing..." : `Discoveries: ${users.length}`}
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A]" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#08B36A] outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-6">Identity</th>
                                    <th className="px-6 py-6">Contact Details</th>
                                    <th className="px-6 py-6 text-center">Status</th>
                                    <th className="px-6 py-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="py-24 text-center"><AiOutlineLoading3Quarters className="animate-spin text-[#08B36A] mx-auto" size={32} /></td></tr>
                                ) : users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-100 flex-shrink-0">
                                                    <img 
                                                        src={getFullImageUrl(user.profilePic, user.name)} 
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                                        alt={user.name} 
                                                    />
                                                </div>
                                                <p className="font-black text-slate-800 text-sm uppercase tracking-tight truncate max-w-[150px]">{user.name || "N/A"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] text-slate-400 font-bold lowercase">{user.email}</p>
                                            <p className="text-[10px] text-[#08B36A] font-black mt-0.5 tracking-widest">+91 {user.number}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => toggleStatus(user.id)}
                                                className={`w-12 h-6 rounded-full mx-auto relative transition-all duration-500 shadow-inner ${user.active ? "bg-[#08B36A]" : "bg-slate-200"}`}
                                            >
                                                <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-md transition-all duration-500 ${user.active ? "left-7" : "left-1"}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                disabled={fetchingDetail}
                                                onClick={() => handleViewDetail(user.id)}
                                                className="p-3 bg-orange-50 text-orange-500 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-sm active:scale-90"
                                            >
                                                {fetchingDetail ? <AiOutlineLoading3Quarters className="animate-spin" /> : <FaEye size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!search && totalPages > 1 && (
                        <div className="flex justify-between items-center px-8 py-6 bg-slate-50/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} / {totalPages}</p>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50"><IoChevronBack /></button>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50"><IoChevronForward /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <UserDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUserDetail} />
        </div>
    );
}

function StatBox({ icon, count, label, color, bg }) {
    return (
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${bg} ${color}`}>{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-xl font-black text-slate-800 leading-none">{count}</p>
            </div>
        </div>
    );
}