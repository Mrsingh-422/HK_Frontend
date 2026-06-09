"use client";

import React, { useState, useEffect } from "react";
import DiamondAPI from "@/app/services/DiamondAPI";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaShieldAlt, FaSave, FaCheck, FaListUl, 
  FaInfoCircle, FaFingerprint, FaLayerGroup, FaGripLinesVertical,
  FaChevronRight, FaCrown, FaLock, FaUsers, FaShieldVirus
} from "react-icons/fa";
import Link from "next/link";

export default function RoleManagement() {
    const [tabs, setTabs] = useState([]);
    const [selectedTabIds, setSelectedTabIds] = useState([]);
    const [roleName, setRoleName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [expandedParents, setExpandedParents] = useState([]);

    useEffect(() => { fetchTabs(); }, []);

    const fetchTabs = async () => {
        try {
            const res = await DiamondAPI.getAllTabs();
            if (res.success) setTabs(res.data);
        } catch (err) { toast.error("Failed to fetch permissions"); }
    };

    const buildTree = () => {
        const parents = tabs.filter(t => t.parentId === 0);
        return parents.map(parent => ({
            ...parent,
            children: tabs.filter(t => t.parentId === parent.tabId && t.subParentId === 0).map(child => ({
                ...child,
                subChildren: tabs.filter(t => t.subParentId === child.tabId)
            }))
        }));
    };

    const handleCheckboxChange = (tabId) => {
        setSelectedTabIds(prev => 
            prev.includes(tabId) ? prev.filter(id => id !== tabId) : [...prev, tabId]
        );
    };

    const handleParentToggle = (parentId) => {
        setExpandedParents(prev => 
            prev.includes(parentId) ? prev.filter(id => id !== parentId) : [...prev, parentId]
        );
    };

    const handleSelectAll = (parent) => {
        const allIds = [parent.tabId];
        parent.children.forEach(child => {
            allIds.push(child.tabId);
            child.subChildren.forEach(sub => allIds.push(sub.tabId));
        });

        setSelectedTabIds(prev => {
            const allSelected = allIds.every(id => prev.includes(id));
            if (allSelected) {
                return prev.filter(id => !allIds.includes(id));
            } else {
                return [...new Set([...prev, ...allIds])];
            }
        });
    };

    const getSelectionStats = (parent) => {
        const allIds = [parent.tabId];
        parent.children.forEach(child => {
            allIds.push(child.tabId);
            child.subChildren.forEach(sub => allIds.push(sub.tabId));
        });
        
        const selectedCount = allIds.filter(id => selectedTabIds.includes(id)).length;
        return { selectedCount, total: allIds.length };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roleName) return toast.error("Role name is required");
        if (selectedTabIds.length === 0) return toast.error("Please select at least one permission");
        setLoading(true);
        try {
            const res = await DiamondAPI.createRoleTemplate({ name: roleName, tabIds: selectedTabIds, description });
            if (res.success) {
                toast.success("Role configuration saved successfully!");
                setRoleName(""); setDescription(""); setSelectedTabIds([]);
            }
        } catch (err) { toast.error(err.message || "Error saving configuration"); }
        finally { setLoading(false); }
    };

    const tree = buildTree();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <Toaster 
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        padding: '16px',
                    },
                }}
            />
            
            <div className="max-w-[1440px] mx-auto p-6 lg:p-10">
                
                {/* Enhanced Header Section */}
                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#08B36A]/5 to-blue-500/5 rounded-3xl -m-4 blur-3xl"></div>
                    
                    <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-[#08B36A] animate-pulse"></div>
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Access Control Studio</span>
                                </div>
                                <div className="h-px w-12 bg-gradient-to-r from-slate-300 to-transparent"></div>
                            </div>
                            
                            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
                                Role{" "}
                                <span className="relative">
                                    Configuration
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                                        <path d="M2 5.5C20 2 80 1 198 4" stroke="#08B36A" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg mt-2">Design granular access patterns for your team</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Link 
                                href="/admind/subadmin/viewrolelist" 
                                className="group relative overflow-hidden bg-white hover:bg-slate-900 text-slate-900 hover:text-white px-8 py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-200/50 hover:shadow-slate-900/20 border border-slate-200 hover:border-slate-900"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative flex items-center gap-3">
                                    <span className="text-xs font-black uppercase tracking-[0.15em]">Role Directory</span>
                                    <FaListUl size={14} className="group-hover:rotate-12 transition-transform" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Configuration Panel */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-10 space-y-6">
                            <div className="relative bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/20 overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#08B36A]/10 to-transparent rounded-bl-full"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-2xl"></div>
                                
                                <div className="relative p-8 lg:p-10 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-slate-900 rounded-2xl">
                                            <FaFingerprint size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-sm">Identity Matrix</h3>
                                            <p className="text-xs text-slate-500 font-medium">Define role parameters</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Role Name Input */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                                                <FaLock size={10} />
                                                Role Identifier
                                            </label>
                                            <div className="relative group">
                                                <input 
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none transition-all duration-300 focus:border-[#08B36A] focus:bg-white focus:ring-4 focus:ring-[#08B36A]/5 font-semibold text-slate-800 placeholder:text-slate-300 group-hover:border-slate-200"
                                                    placeholder="e.g., Regional Supervisor"
                                                    value={roleName}
                                                    onChange={(e) => setRoleName(e.target.value)}
                                                />
                                                {roleName && (
                                                    <button 
                                                        onClick={() => setRoleName("")}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description Textarea */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                                                <FaInfoCircle size={10} />
                                                Authority Scope
                                            </label>
                                            <div className="relative">
                                                <textarea 
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none transition-all duration-300 focus:border-[#08B36A] focus:bg-white focus:ring-4 focus:ring-[#08B36A]/5 font-medium text-slate-700 placeholder:text-slate-300 resize-none h-36"
                                                    placeholder="Describe the responsibilities and limitations of this role..."
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                />
                                                <div className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-400">
                                                    {description.length}/500
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Card */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                        <div className="relative flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Modules Selected</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black">{selectedTabIds.length}</span>
                                                    <span className="text-sm text-slate-400 font-medium">permissions</span>
                                                </div>
                                            </div>
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#08B36A] to-emerald-600 flex items-center justify-center shadow-lg shadow-[#08B36A]/30">
                                                <FaShieldVirus size={24} />
                                            </div>
                                        </div>
                                        {selectedTabIds.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-[#08B36A] to-emerald-400 rounded-full transition-all duration-500"
                                                            style={{ width: `${(selectedTabIds.length / tabs.length) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {Math.round((selectedTabIds.length / tabs.length) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="relative w-full overflow-hidden bg-slate-900 text-white py-5 rounded-2xl font-black shadow-2xl shadow-slate-900/20 transition-all duration-300 hover:shadow-slate-900/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#08B36A] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em]">
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Deploying...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave size={16} />
                                                    Deploy Template
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Permission Tree */}
                    <div className="lg:col-span-8">
                        <div className="space-y-6">
                            {tree.length === 0 ? (
                                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-16 text-center">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FaLayerGroup size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">No Permissions Configured</h3>
                                    <p className="text-slate-500">Please add modules to start building your role template</p>
                                </div>
                            ) : (
                                tree.map((parent, pIdx) => {
                                    const stats = getSelectionStats(parent);
                                    const isExpanded = expandedParents.includes(parent.tabId);
                                    const isAllSelected = stats.selectedCount === stats.total;
                                    
                                    return (
                                        <motion.div 
                                            key={parent.tabId}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: pIdx * 0.1, duration: 0.5 }}
                                            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/10 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/20 transition-shadow duration-300"
                                        >
                                            {/* Parent Module Header */}
                                            <div className="relative">
                                                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#08B36A] to-emerald-400 transform origin-left transition-transform duration-300 ${isAllSelected ? 'scale-x-100' : 'scale-x-0'}`}></div>
                                                
                                                <div className="px-8 py-6 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-2xl transition-all duration-300 ${isAllSelected ? 'bg-[#08B36A] text-white shadow-lg shadow-[#08B36A]/20' : 'bg-slate-100 text-slate-500'}`}>
                                                            <FaLayerGroup size={18} />
                                                        </div>
                                                        
                                                        <div>
                                                            <h3 className="font-black text-slate-900 text-sm uppercase tracking-[0.1em]">{parent.name}</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Module Access</span>
                                                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                                                <span className="text-[10px] font-bold text-[#08B36A]">
                                                                    {stats.selectedCount}/{stats.total} selected
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        {/* Select All with Checkbox */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSelectAll(parent);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 hover:bg-[#08B36A]/5 rounded-xl transition-all group"
                                                        >
                                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                                                                isAllSelected 
                                                                    ? 'bg-[#08B36A] border-[#08B36A] shadow-md shadow-[#08B36A]/20' 
                                                                    : 'border-slate-300 group-hover:border-[#08B36A]'
                                                            }`}>
                                                                {isAllSelected && (
                                                                    <FaCheck size={8} className="text-white" />
                                                                )}
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                                                                isAllSelected ? 'text-[#08B36A]' : 'text-slate-400 group-hover:text-[#08B36A]'
                                                            }`}>
                                                                {isAllSelected ? 'Deselect All' : 'Select All'}
                                                            </span>
                                                        </button>
                                                        
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleParentToggle(parent.tabId);
                                                            }}
                                                            className={`p-3 rounded-xl transition-all duration-300 ${isExpanded ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                        >
                                                            <FaChevronRight size={12} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Children Modules */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {parent.children.map((child) => (
                                                                <div key={child.tabId} className="space-y-4">
                                                                    {/* Child Module */}
                                                                    <div 
                                                                        className={`group cursor-pointer p-4 rounded-2xl transition-all duration-300 border-2 ${
                                                                            selectedTabIds.includes(child.tabId) 
                                                                                ? 'bg-[#08B36A]/5 border-[#08B36A]/20 shadow-md shadow-[#08B36A]/5' 
                                                                                : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                                                                        }`}
                                                                        onClick={() => handleCheckboxChange(child.tabId)}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                                                                    selectedTabIds.includes(child.tabId) 
                                                                                        ? 'bg-[#08B36A] border-[#08B36A] shadow-lg shadow-[#08B36A]/20' 
                                                                                        : 'border-slate-300 group-hover:border-slate-400'
                                                                                }`}>
                                                                                    {selectedTabIds.includes(child.tabId) && (
                                                                                        <FaCheck size={10} className="text-white" />
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <span className={`text-sm font-bold transition-colors ${
                                                                                        selectedTabIds.includes(child.tabId) ? 'text-slate-900' : 'text-slate-600'
                                                                                    }`}>
                                                                                        {child.name}
                                                                                    </span>
                                                                                    {child.subChildren.length > 0 && (
                                                                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                                                            {child.subChildren.length} sub-modules
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {child.subChildren.length > 0 && (
                                                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                                                                                    selectedTabIds.includes(child.tabId) 
                                                                                        ? 'bg-[#08B36A] text-white' 
                                                                                        : 'bg-slate-100 text-slate-400'
                                                                                }`}>
                                                                                    <FaChevronRight size={10} />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Sub-children */}
                                                                    {child.subChildren.length > 0 && (
                                                                        <div className="ml-6 space-y-2 border-l-2 border-slate-100 pl-6">
                                                                            {child.subChildren.map((sub, sIdx) => (
                                                                                <motion.div
                                                                                    key={sub.tabId}
                                                                                    initial={{ opacity: 0, x: -20 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    transition={{ delay: sIdx * 0.05 }}
                                                                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                                                                                        selectedTabIds.includes(sub.tabId) 
                                                                                            ? 'bg-[#08B36A]/5 border border-[#08B36A]/20' 
                                                                                            : 'hover:bg-slate-50 border border-transparent'
                                                                                    }`}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleCheckboxChange(sub.tabId);
                                                                                    }}
                                                                                >
                                                                                    <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                                                                                        selectedTabIds.includes(sub.tabId) 
                                                                                            ? 'bg-[#08B36A] border-[#08B36A] shadow-md shadow-[#08B36A]/20' 
                                                                                            : 'border-slate-300 group-hover:border-slate-400'
                                                                                    }`}>
                                                                                        {selectedTabIds.includes(sub.tabId) && (
                                                                                            <FaCheck size={8} className="text-white" />
                                                                                        )}
                                                                                    </div>
                                                                                    <span className={`text-xs font-semibold transition-colors ${
                                                                                        selectedTabIds.includes(sub.tabId) ? 'text-slate-900' : 'text-slate-500'
                                                                                    }`}>
                                                                                        {sub.name}
                                                                                    </span>
                                                                                </motion.div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}