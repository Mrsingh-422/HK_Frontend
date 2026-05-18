'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaClipboardList, 
    FaBell, FaInfoCircle, FaTimes, FaRegClock, FaSpinner
} from 'react-icons/fa';

import FireHeadAPI from '@/app/services/FireHeadAPI';

export default function FreshCasesPage() {
    const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Fresh' | 'Pending' | 'Closed'
    const [searchTerm, setSearchTerm] = useState('');
    
    // Real Data States
    const [cases, setCases] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);

    // ==========================================
    // 🌟 HELPER FUNCTIONS (DATE & TIME) 🌟
    // ==========================================
    const formatTimeAgo = (dateString) => {
        if(!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just Now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    };

    const formatDate = (dateString) => {
        if(!dateString) return 'N/A';
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    // ==========================================
    // 🌟 FETCH REAL DATA FROM API 🌟
    // ==========================================
    const fetchCasesList = async () => {
        setIsFetching(true);
        try {
            // API Call with dynamic tab status and search term
            const res = await FireHeadAPI.getCases(activeTab, searchTerm);
            if (res.success) {
                setCases(res.data || []);
            }
        } catch (error) {
            console.error("Error fetching cases:", error);
            setCases([]);
        } finally {
            setIsFetching(false);
        }
    };

    // Debouncing Setup for Search Bar & Tab Change
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCasesList();
        }, 500); // Wait for 500ms before calling API

        return () => clearTimeout(delayDebounceFn); // Cleanup previous timeout
    }, [searchTerm, activeTab]);

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
                        Case History 
                        {activeTab === 'Fresh' && (
                            <span className="flex h-3 w-3 relative ml-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Review, search, and assign reported emergencies.</p>
                </div>

                <div className="flex bg-white rounded-full p-1.5 shadow-sm border border-gray-200 overflow-x-auto max-w-full hide-scrollbar">
                    {['All', 'Fresh', 'Pending', 'Closed'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeTab === tab 
                                ? (tab === 'Fresh' ? 'bg-red-500 text-white shadow-md' : 'bg-[#08B36A] text-white shadow-md') 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {tab === 'Fresh' && activeTab === 'Fresh' && <FaBell className="animate-bounce text-xs" />} 
                            {tab} Cases
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search case ID, location..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none shadow-sm transition-all" 
                />
            </div>

            {/* ========================================== */}
            {/* 🌟 CASES TABLE 🌟                          */}
            {/* ========================================== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Case ID</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold">Reported Date</th>
                                <th className="px-6 py-4 font-semibold">Time Elapsed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">

                            {/* Loader Row */}
                            {isFetching && (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center text-gray-500">
                                        <FaSpinner className="animate-spin text-3xl text-[#08B36A] mx-auto mb-3" />
                                        <p className="font-medium">Fetching Cases...</p>
                                    </td>
                                </tr>
                            )}

                            {/* Data Rows */}
                            {!isFetching && cases.map((item) => {
                                const isFresh = item.status === 'Fresh';
                                const isClosed = item.status === 'Closed';
                                // Fixed API key: reportedAt instead of createdAt
                                const timeAgo = formatTimeAgo(item.reportedAt); 
                                
                                return (
                                    <tr 
                                        key={item._id} 
                                        onClick={() => openInfoModal(item)}
                                        className={`hover:bg-blue-50/50 transition-colors cursor-pointer group ${isClosed ? 'opacity-70 hover:opacity-100' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaClipboardList className={`transition-colors ${isFresh ? 'text-red-400 group-hover:text-red-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
                                                <span className="font-bold text-gray-800">{item.caseNo}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider 
                                                ${isFresh ? 'bg-red-50 text-red-600 border border-red-100' : 
                                                  isClosed ? 'bg-gray-100 text-gray-600 border border-gray-200' : 
                                                  'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                
                                                {isFresh && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                                {item.status}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
                                                <span className="text-sm font-semibold text-gray-700 truncate max-w-[200px] md:max-w-xs block">
                                                    {/* Fixed API key: address */}
                                                    {item.address || 'Location Not Available'}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-gray-400" />
                                                {/* Fixed API key: reportedAt */}
                                                <span className="text-sm text-gray-600 font-medium">{formatDate(item.reportedAt)}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <FaRegClock className={timeAgo === 'Just Now' ? 'text-red-400' : 'text-gray-400'} />
                                                <span className={`text-sm font-bold ${timeAgo === 'Just Now' ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                                                    {timeAgo}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {!isFetching && cases.length === 0 && (
                        <div className="py-16 text-center text-gray-500 bg-white">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 mx-auto">
                                <FaClipboardList className="text-3xl text-gray-300" />
                            </div>
                            <p className="font-bold text-lg">No Cases Found</p>
                            <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 QUICK INFO MODAL 🌟                     */}
            {/* ========================================== */}
            {isModalOpen && selectedCase && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FaInfoCircle className={selectedCase.status === 'Fresh' ? 'text-red-500' : 'text-blue-500'}/> 
                                Case Quick Info
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${selectedCase.status === 'Fresh' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-blue-50 text-blue-500 border border-blue-100'}`}>
                                    {selectedCase.status === 'Fresh' ? <FaBell className="animate-bounce"/> : <FaClipboardList />}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Case ID</p>
                                    <p className="text-lg font-bold text-gray-800 leading-tight">{selectedCase.caseNo}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Status</p>
                                    <p className={`text-sm font-bold ${selectedCase.status === 'Fresh' ? 'text-red-600' : selectedCase.status === 'Closed' ? 'text-gray-600' : 'text-blue-600'}`}>
                                        {selectedCase.status}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Time Elapsed</p>
                                    {/* Fixed API key: reportedAt */}
                                    <p className={`text-sm font-bold ${formatTimeAgo(selectedCase.reportedAt) === 'Just Now' ? 'text-red-500' : 'text-gray-800'}`}>
                                        {formatTimeAgo(selectedCase.reportedAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Reported Date & Time</p>
                                <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    {/* Fixed API key: reportedAt */}
                                    <FaCalendarAlt className="text-gray-400" /> {formatDate(selectedCase.reportedAt)}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Incident Location</p>
                                <p className="text-sm font-bold text-gray-800 flex items-start gap-2">
                                    <FaMapMarkerAlt className="text-gray-400 mt-1 shrink-0" /> 
                                    {/* Fixed API key: address */}
                                    {selectedCase.address || 'Location Not Available'}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                            
                            {/* Assign button only shows if status is not closed */}
                            {selectedCase.status !== 'Closed' && (
                                <Link 
                                    href={`/fhq/fresh-cases/${selectedCase._id}`} 
                                    className="px-6 py-2.5 bg-[#08B36A] text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-md shadow-green-200"
                                >
                                    Assign Now
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}