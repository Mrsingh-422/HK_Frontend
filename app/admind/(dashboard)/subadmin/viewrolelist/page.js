"use client";
import React, { useState, useEffect } from "react";
import DiamondAPI from "@/app/services/DiamondAPI";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaArrowLeft, FaShieldAlt, FaUsers, FaEdit, FaTimes,
    FaLayerGroup, FaSave, FaCheckSquare, FaSquare,
    FaInfoCircle, FaCalendarAlt, FaIdBadge, FaCheck
} from "react-icons/fa";
import Link from "next/link";
 
export default function RoleListPage() {
    const [roles, setRoles] = useState([]);
    const [allTabs, setAllTabs] = useState([]);
    const [loading, setLoading] = useState(true);
   
    // Modals visibility state
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   
    // Data state for modals
    const [activeRole, setActiveRole] = useState(null);
    const [editTabIds, setEditTabIds] = useState([]);
    const [updating, setUpdating] = useState(false);
 
    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesRes, tabsRes] = await Promise.all([
                DiamondAPI.getRolesList(),
                DiamondAPI.getAllTabs()
            ]);
            if (rolesRes.success) setRoles(rolesRes.data);
            if (tabsRes.success) setAllTabs(tabsRes.data);
        } catch (err) {
            toast.error("Failed to sync database");
        } finally {
            setLoading(false);
        }
    };
 
    useEffect(() => { fetchData(); }, []);
 
    // --- Row Click for Details ---
    const handleRowClick = (role) => {
        setActiveRole(role);
        setIsDetailModalOpen(true);
    };
 
    // --- Edit Click Logic ---
    const handleEditClick = (e, role) => {
        e.stopPropagation(); // Row click (detail modal) ko rokne ke liye
        setActiveRole(role);
        setEditTabIds(role.tabIds || []);
        setIsEditModalOpen(true);
    };
 
    const togglePermission = (tabId) => {
        setEditTabIds(prev =>
            prev.includes(tabId) ? prev.filter(id => id !== tabId) : [...prev, tabId]
        );
    };
 
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await DiamondAPI.updateRolePermissions({
                roleId: activeRole._id,
                tabIds: editTabIds
            });
            if (res.success) {
                toast.success("Permissions updated!");
                setIsEditModalOpen(false);
                fetchData(); // Refresh list
            }
        } catch (err) { toast.error("Update failed"); }
        finally { setUpdating(false); }
    };
 
    const buildTree = () => {
        const parents = allTabs.filter(t => t.parentId === 0);
        return parents.map(p => ({
            ...p,
            children: allTabs.filter(c => c.parentId === p.tabId)
        }));
    };
 
    return (
        <div className="p-4 md:p-10 bg-[#F8FAFC] min-h-screen">
            <Toaster position="top-right" />
           
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admind/subadmin/managesubadminrole" className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-[#08B36A] transition-all">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Security Roles</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Manage Role Manifests & Capabilities</p>
                    </div>
                </div>
                <Link href="/admind/subadmin/managesubadminrole" className="px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-[11px] uppercase tracking-widest active:scale-95">
                    + Define New Role
                </Link>
            </div>
 
            {/* MAIN TABLE */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-gray-100">
                            <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                                <th className="px-8 py-6">Identity</th>
                                <th className="px-8 py-6">Authorizations</th>
                                <th className="px-8 py-6 text-center">Assigned</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-20 font-bold text-gray-300 animate-pulse uppercase tracking-[0.3em]">Querying Database...</td></tr>
                            ) : roles.map((role) => (
                                <tr key={role._id} onClick={() => handleRowClick(role)} className="hover:bg-emerald-50/20 transition-all group cursor-pointer">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[#08B36A] transition-colors">
                                                <FaShieldAlt size={18} />
                                            </div>
                                            <div>
                                                <span className="font-black text-slate-800 uppercase text-sm tracking-tight block">{role.name}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {role._id.slice(-6)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1.5">
                                            {role.detailedTabs?.slice(0, 3).map(tab => (
                                                <span key={tab.tabId} className="px-2 py-1 bg-white border border-gray-200 text-slate-500 rounded-md text-[9px] font-black uppercase">{tab.name}</span>
                                            ))}
                                            {role.detailedTabs?.length > 3 && (
                                                <span className="text-[10px] font-black text-[#08B36A] bg-[#08B36A]/5 px-2 py-1 rounded">+{role.detailedTabs.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100 uppercase tracking-widest">
                                            {role.adminCount} Active
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end">
                                            {/* Edit Button Permanent / Visible */}
                                            <button
                                                onClick={(e) => handleEditClick(e, role)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-black text-[10px] uppercase tracking-widest"
                                            >
                                                <FaEdit size={12} /> Edit Role
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
 
            {/* 🌟 1. ROLE INFO MODAL 🌟 */}
            <AnimatePresence>
                {isDetailModalOpen && activeRole && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailModalOpen(false)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
                            <div className="px-10 py-10 bg-slate-900 text-white relative">
                                <div className="flex justify-between items-start z-10 relative">
                                    <h3 className="text-3xl font-black uppercase tracking-tighter">{activeRole.name}</h3>
                                    <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all"><FaTimes/></button>
                                </div>
                                <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#08B36A] rounded-full blur-[100px] opacity-20"></div>
                            </div>
                            <div className="p-10">
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Created</p>
                                        <p className="text-xs font-black text-slate-700">{new Date(activeRole.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Modules</p>
                                        <p className="text-xs font-black text-slate-700">{activeRole.detailedTabs?.length} Authorized</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                    {activeRole.detailedTabs?.map(tab => (
                                        <div key={tab.tabId} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between">
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{tab.name}</span>
                                            <span className="text-[9px] font-bold text-slate-300">#{tab.tabId}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
 
            {/* 🌟 2. EDIT PERMISSIONS MODAL 🌟 */}
            <AnimatePresence>
                {isEditModalOpen && activeRole && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden">
                            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight tracking-widest">Update Capabilities</h3>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1">Configuring: {activeRole.name}</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20"><FaTimes/></button>
                            </div>
 
                            <div className="p-10 max-h-[500px] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {buildTree().map(parent => (
                                        <div key={parent.tabId} className="space-y-4">
                                            <div onClick={() => togglePermission(parent.tabId)} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`text-xl transition-all ${editTabIds.includes(parent.tabId) ? 'text-[#08B36A] scale-110' : 'text-slate-200'}`}>
                                                    {editTabIds.includes(parent.tabId) ? <FaCheckSquare /> : <FaSquare />}
                                                </div>
                                                <span className={`font-black uppercase text-xs tracking-widest ${editTabIds.includes(parent.tabId) ? 'text-slate-900' : 'text-slate-400'}`}>{parent.name}</span>
                                            </div>
                                            <div className="ml-6 space-y-3 border-l-2 border-slate-50 pl-6">
                                                {parent.children.map(child => (
                                                    <div key={child.tabId} onClick={() => togglePermission(child.tabId)} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${editTabIds.includes(child.tabId) ? 'bg-[#08B36A] border-[#08B36A]' : 'bg-white border-slate-200'}`}>
                                                            {editTabIds.includes(child.tabId) && <FaCheck size={8} className="text-white" />}
                                                        </div>
                                                        <span className={`text-[11px] font-bold uppercase ${editTabIds.includes(child.tabId) ? 'text-slate-700' : 'text-slate-300'}`}>{child.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
 
                            <div className="p-8 bg-slate-50 border-t flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{editTabIds.length} Nodes Selected</span>
                                <button
                                    onClick={handleUpdateSubmit}
                                    disabled={updating}
                                    className="px-10 py-3.5 bg-[#08B36A] text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:scale-105 active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em] flex items-center gap-3"
                                >
                                    <FaSave /> {updating ? "Synchronizing..." : "Apply Changes"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
 
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            `}</style>
        </div>
    );
}
 