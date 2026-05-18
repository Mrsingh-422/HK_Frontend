'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaClipboardList, 
    FaInfoCircle, FaTimes, FaRegClock, FaPauseCircle,
    FaUser, FaPhoneAlt, FaBuilding, FaAlignLeft, FaFire, FaSpinner, FaImage
} from 'react-icons/fa';

import FireHeadAPI from '@/app/services/FireHeadAPI'; // Make sure path is correct

export default function PendingCasesPage() {
    // --- STATES ---
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All'); // 'All' | 'On Hold' | 'Pending'
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);

    // --- FETCH API DATA ---
    const fetchPendingCases = async () => {
        setIsLoading(true);
        try {
            const res = await FireHeadAPI.getCases('Pending'); 
            if (res.success && res.data) {
                setCases(res.data);
            }
        } catch (error) {
            console.error("Error fetching pending cases:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingCases();
    }, []);

    // --- HELPER TO FORMAT DATE ---
    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // --- HELPER TO FORMAT IMAGE URL ---
    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^public\//, ''); 
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        return `${baseUrl}/${cleanPath}`;
    };

    // --- FILTER LOGIC ---
    const filteredCases = cases.filter(c => {
        const matchesTab = activeTab === 'All' || c.status === activeTab;
        
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            (c.caseNo && c.caseNo.toLowerCase().includes(searchLower)) || 
            (c.address && c.address.toLowerCase().includes(searchLower)) ||
            (c.fireType && c.fireType.toLowerCase().includes(searchLower)) ||
            (c.callerName && c.callerName.toLowerCase().includes(searchLower)) ||
            (c.stationId?.stationName && c.stationId.stationName.toLowerCase().includes(searchLower));
            
        return matchesTab && matchesSearch;
    });

    // Handle Open Info Modal
    const openInfoModal = (caseItem) => {
        setSelectedCase(caseItem);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
            
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Pending Cases
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and review pending or on-hold fire emergencies.</p>
                </div>

                <div className="flex bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
                    <button 
                        onClick={() => setActiveTab('All')} 
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'All' ? 'bg-[#08B36A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        All Cases
                    </button>
                    <button 
                        onClick={() => setActiveTab('On Hold')} 
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'On Hold' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FaPauseCircle size={14}/> On Hold
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by Case ID, Station, Caller, or Location..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none shadow-sm transition-all" 
                />
            </div>

            {/* ========================================== */}
            {/* 🌟 CASES TABLE                             */}
            {/* ========================================== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px] relative">
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 absolute inset-0 bg-white/80 z-10 backdrop-blur-sm">
                        <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4"/>
                        <p className="text-xs font-bold uppercase tracking-widest">Loading Pending Cases...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase tracking-[0.1em] font-bold">
                                    <th className="px-6 py-4">Case Info</th>
                                    <th className="px-6 py-4">Emergency Details</th>
                                    <th className="px-6 py-4">Location & Station</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4 text-right">Status & Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCases.map((item) => {
                                    const isPending = item.status === 'Pending';
                                    const stationName = item.stationId?.stationName || 'Station Not Assigned';

                                    return (
                                        <tr 
                                            key={item._id} 
                                            onClick={() => openInfoModal(item)}
                                            className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-sm flex items-center gap-2 ${isPending ? 'text-[#08B36A]' : 'text-orange-600'}`}>
                                                        <FaClipboardList className={isPending ? 'text-green-400' : 'text-orange-400'} />
                                                        {item.caseNo || 'N/A'}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 mt-1 font-medium flex items-center gap-1">
                                                        <FaCalendarAlt className="text-gray-400" /> {formatDate(item.reportedAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-4 max-w-[220px]">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FaFire className="text-orange-500 shrink-0" />
                                                        <span className="font-bold text-gray-800 text-sm truncate">
                                                            {item.fireType || 'General Fire'}
                                                        </span>
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ml-1 bg-red-50 text-red-600 border border-red-100">
                                                            {item.severityStatus || item.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 truncate flex items-center gap-1.5" title={item.description}>
                                                        <FaAlignLeft className="shrink-0 text-gray-400" /> 
                                                        {item.description || 'No description provided'}
                                                    </p>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-4 max-w-[200px]">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-700 truncate flex items-center gap-1.5" title={item.address}>
                                                        <FaMapMarkerAlt className="text-gray-400 shrink-0" /> {item.address || 'Unknown Location'}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 truncate" title={stationName}>
                                                        <FaBuilding className="text-gray-400 shrink-0" /> {stationName}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                                        <FaUser className="text-gray-400 text-xs shrink-0" /> {item.callerName || 'Anonymous'}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
                                                        <FaPhoneAlt className="text-gray-400 text-xs shrink-0" /> {item.callerPhone || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isPending ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                        {item.status}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 font-bold flex items-center gap-1">
                                                        <FaRegClock className="text-gray-400" /> {item.timeAgo || 'Recently'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Fallback Empty State */}
                        {!isLoading && filteredCases.length === 0 && (
                            <div className="py-16 text-center text-gray-500 bg-white">
                                <p className="font-bold text-lg">No Pending Cases Found</p>
                                <p className="text-sm mt-1">There are no cases matching your search or filter criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ========================================== */}
            {/* 🌟 ENHANCED LARGE QUICK INFO MODAL         */}
            {/* ========================================== */}
            {isModalOpen && selectedCase && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 transition-all duration-300">
                    
                    {/* Changed from max-w-lg to max-w-4xl to make it wide */}
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className={`text-xl font-black flex items-center gap-2 ${selectedCase.status === 'Pending' ? 'text-green-600' : 'text-orange-600'}`}>
                                <FaInfoCircle /> Case Full Overview
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable if height exceeds screen, but dual column eliminates scrolling on desktop) */}
                        <div className="p-8 max-h-[85vh] overflow-y-auto flex flex-col gap-6">
                            
                            {/* --- TOP BANNER (Case ID & Primary Status) --- */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                                <div className="flex items-center gap-5">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${selectedCase.status === 'Pending' ? 'bg-green-50 text-green-500 border border-green-100 shadow-sm shadow-green-100' : 'bg-orange-50 text-orange-500 border border-orange-100 shadow-sm shadow-orange-100'}`}>
                                        {selectedCase.status === 'Pending' ? <FaRegClock /> : <FaPauseCircle />}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Incident Case No.</p>
                                        <p className="text-2xl font-black text-gray-800 tracking-tight leading-none">{selectedCase.caseNo}</p>
                                    </div>
                                </div>
                                <div className="text-left md:text-right">
                                    <span className={`inline-block px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest mb-1 shadow-sm ${selectedCase.status === 'Pending' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        Current Status: {selectedCase.status}
                                    </span>
                                    <p className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1 rounded-md inline-flex items-center md:ml-auto">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span> 
                                        {selectedCase.severityStatus || 'Active Hazard'}
                                    </p>
                                </div>
                            </div>

                            {/* --- 2-COLUMN GRID LAYOUT --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* ⬅️ LEFT COLUMN */}
                                <div className="flex flex-col gap-6">
                                    
                                    {/* 4-Box Key Info Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Reported Time</p>
                                            <p className="text-sm font-bold text-gray-800">{formatDate(selectedCase.reportedAt)}</p>
                                        </div>
                                        <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Time Elapsed</p>
                                            <p className="text-sm font-bold text-gray-800">{selectedCase.timeAgo || 'Recently'}</p>
                                        </div>
                                        <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Fire Type</p>
                                            <p className="text-sm font-bold text-gray-800 truncate">{selectedCase.fireType || 'Not Specified'}</p>
                                        </div>
                                        <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Severity Level</p>
                                            <p className="text-sm font-bold text-red-600">{selectedCase.severity}</p>
                                        </div>
                                    </div>

                                    {/* Location & Assigned Station Card */}
                                    <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100 space-y-4">
                                        <div>
                                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <FaMapMarkerAlt /> Incident Exact Location
                                            </p>
                                            <p className="text-[15px] font-bold text-gray-800 leading-snug">
                                                {selectedCase.address}
                                            </p>
                                        </div>
                                        <div className="pt-3 border-t border-blue-100/50">
                                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <FaBuilding /> Responding / Assigned Station
                                            </p>
                                            <p className="text-sm font-bold text-gray-800 bg-white inline-flex px-3 py-1 rounded border border-blue-100 shadow-sm">
                                                {selectedCase.stationId?.stationName || 'Station Not Assigned Yet'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* ➡️ RIGHT COLUMN */}
                                <div className="flex flex-col gap-6">
                                    
                                    {/* Caller Info Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border border-gray-200 p-4 rounded-xl">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FaUser /> Reporter / Caller</p>
                                            <p className="text-[15px] font-bold text-gray-800 truncate">{selectedCase.callerName || 'Anonymous'}</p>
                                        </div>
                                        <div className="border border-gray-200 p-4 rounded-xl">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FaPhoneAlt /> Contact Number</p>
                                            <p className="text-[15px] font-bold text-gray-800">{selectedCase.callerPhone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Detailed Description */}
                                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex-grow">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <FaAlignLeft /> Full Incident Description
                                        </p>
                                        <p className="text-sm font-medium text-gray-700 leading-relaxed">
                                            {selectedCase.description || 'No detailed description provided by the caller.'}
                                        </p>
                                    </div>

                                    {/* Incident Images Gallery */}
                                    {selectedCase.incidentImages && selectedCase.incidentImages.length > 0 && (
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                <FaImage size={14}/> Uploaded Evidence / Images ({selectedCase.incidentImages.length})
                                            </p>
                                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                                {selectedCase.incidentImages.map((imgPath, idx) => (
                                                    <a 
                                                        key={idx} 
                                                        href={getImageUrl(imgPath)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="relative group shrink-0"
                                                    >
                                                        <img 
                                                            src={getImageUrl(imgPath)} 
                                                            alt={`Incident Evidence ${idx + 1}`} 
                                                            className="h-24 w-36 object-cover rounded-xl border border-slate-200 shadow-sm group-hover:shadow-md transition-all group-hover:scale-[1.02]"
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                            <span className="text-white text-xs font-black tracking-widest bg-black/50 px-3 py-1 rounded-md">VIEW</span>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 rounded-b-[2rem]">
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                Close Overview
                            </button>
                            
                            {/* <Link 
                                href={`/fhq/pending-cases/${selectedCase._id}`} 
                                className={`px-8 py-3 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${selectedCase.status === 'Pending' ? 'bg-[#08B36A] hover:bg-green-600 shadow-green-200' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'}`}
                            >
                                Open Detailed Case File <span>→</span>
                            </Link> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}