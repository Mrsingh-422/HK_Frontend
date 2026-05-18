'use client'
import React, { useState, useEffect } from 'react';
import {
    FaSearch, FaMapMarkerAlt, FaClipboardList, FaTimes, FaSpinner,
    FaBuilding, FaSave, FaFire, FaExclamationCircle, FaCalendarAlt,
    FaCheckCircle, FaCheck, FaUser, FaPhoneAlt, FaAlignLeft
} from 'react-icons/fa';

import FireHeadAPI from '@/app/services/FireHeadAPI';

export default function FreshCasesPage() {
    // --- STATES ---
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All'); 
    const [availableStations, setAvailableStations] = useState([]);

    // --- MODAL STATES ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [isAssigning, setIsAssigning] = useState(false);

    // --- ASSIGNMENT SELECTIONS ---
    const [primaryStationId, setPrimaryStationId] = useState('');
    const [supportingStationIds, setSupportingStationIds] = useState([]); 

    useEffect(() => {
        fetchFreshCases();
        fetchStations();
    }, []);

    const fetchFreshCases = async () => {
        setIsLoading(true);
        try {
            const res = await FireHeadAPI.getCases('Fresh');
            if (res.success) setCases(res.data);
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    const fetchStations = async () => {
        try {
            const res = await FireHeadAPI.getAllFireStations();
            if (res.success) setAvailableStations(res.data || []);
        } catch (error) { console.error(error); }
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    // --- CHECKBOX TOGGLE LOGIC ---
    const toggleBackupStation = (stationId) => {
        setSupportingStationIds((prev) => 
            prev.includes(stationId) 
                ? prev.filter(id => id !== stationId) // Uncheck
                : [...prev, stationId] // Check
        );
    };

    // --- SUBMIT ASSIGNMENT ---
    const handleAssign = async () => {
        if (!selectedCase?._id || !primaryStationId) {
            alert("Please select a Lead Fire Station.");
            return;
        }

        setIsAssigning(true);
        try {
            const payload = {
                caseId: selectedCase._id,
                stationId: primaryStationId,
                supportingStationIds: supportingStationIds,
                status: 'Pending'
            };

            const res = await FireHeadAPI.assignResources(payload);
            if (res.success) {
                alert("Case successfully dispatched!");
                setIsModalOpen(false);
                fetchFreshCases();
            }
        } catch (error) {
            alert("Assignment failed.");
        } finally {
            setIsAssigning(false);
        }
    };

    // --- OPEN MODAL & FIX DROPDOWN PRE-SELECTION ---
    const openAssignModal = (caseItem) => {
        setSelectedCase(caseItem);
        
        // BUG FIX: Handle if stationId is a populated object OR a flat string
        const stId = caseItem.stationId && typeof caseItem.stationId === 'object' 
            ? caseItem.stationId._id 
            : caseItem.stationId || '';
            
        setPrimaryStationId(stId);
        setSupportingStationIds([]); // Reset backups on open
        setIsModalOpen(true);
    };

    // --- FILTER LOGIC ---
    const filteredCases = cases.filter(c => {
        const isCritical = c.severity === 'High' || c.severity === 'Critical';
        const matchesTab = activeTab === 'All' || (activeTab === 'Critical' && isCritical);
        
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            c.caseNo?.toLowerCase().includes(searchLower) || 
            c.address?.toLowerCase().includes(searchLower) ||
            c.callerName?.toLowerCase().includes(searchLower) ||
            c.fireType?.toLowerCase().includes(searchLower);

        return matchesTab && matchesSearch;
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans animate-in fade-in duration-500">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-black text-gray-800">Fresh Emergency Cases</h1>
                <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-200">
                    <button onClick={() => setActiveTab('All')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'All' ? 'bg-[#08B36A] text-white' : 'text-gray-500'}`}>All Cases</button>
                    <button onClick={() => setActiveTab('Critical')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'Critical' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>Critical Only</button>
                </div>
            </div>

            {/* --- SEARCH BAR --- */}
            <div className="relative mb-8">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by Case ID, Location, Caller Name or Fire Type..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-14 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-[#08B36A]" 
                />
            </div>

            {/* --- CASES TABLE (DETAILED & CLICKABLE) --- */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Case Info</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Emergency Details</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Location & Station</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Caller Info</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <FaSpinner className="animate-spin mx-auto text-[#08B36A] text-4xl mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Cases...</p>
                                    </td>
                                </tr>
                            ) : filteredCases.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <p className="font-bold text-gray-500 text-lg">No Fresh Cases Found</p>
                                        <p className="text-sm text-gray-400 mt-1">Check your search criteria or wait for new emergencies.</p>
                                    </td>
                                </tr>
                            ) : filteredCases.map(item => {
                                const isCritical = item.severity === 'High' || item.severity === 'Critical';
                                const stationName = item.stationId?.stationName || 'Pending Assignment';

                                return (
                                    <tr 
                                        key={item._id} 
                                        onClick={() => openAssignModal(item)} // FULL ROW IS CLICKABLE
                                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                    >
                                        {/* 1. Case ID & Date */}
                                        <td className="px-6 py-5 align-top">
                                            <div className="font-bold text-blue-600 text-sm flex items-center gap-2">
                                                <FaClipboardList className="text-blue-400" /> {item.caseNo || 'N/A'}
                                            </div>
                                            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
                                                <FaCalendarAlt className="text-gray-400" /> {formatDate(item.reportedAt)}
                                            </div>
                                        </td>

                                        {/* 2. Incident Type & Desc */}
                                        <td className="px-6 py-5 align-top max-w-[220px]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FaFire className="text-orange-500 shrink-0" />
                                                <span className="font-bold text-gray-800 text-sm truncate">{item.fireType || 'General Fire'}</span>
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ml-1 ${isCritical ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                                    {item.severity}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 truncate flex items-center gap-1.5" title={item.description}>
                                                <FaAlignLeft className="shrink-0 text-gray-400" /> {item.description || 'No description provided'}
                                            </p>
                                        </td>

                                        {/* 3. Location */}
                                        <td className="px-6 py-5 align-top max-w-[200px]">
                                            <div className="text-sm font-semibold text-gray-700 truncate flex items-center gap-1.5" title={item.address}>
                                                <FaMapMarkerAlt className="text-gray-400 shrink-0" /> {item.address || 'Unknown Location'}
                                            </div>
                                            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 truncate" title={stationName}>
                                                <FaBuilding className="text-gray-400 shrink-0" /> {stationName}
                                            </div>
                                        </td>

                                        {/* 4. Caller Details */}
                                        <td className="px-6 py-5 align-top">
                                            <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                                <FaUser className="text-gray-400 text-xs shrink-0" /> {item.callerName || 'Anonymous'}
                                            </div>
                                            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
                                                <FaPhoneAlt className="text-gray-400 text-xs shrink-0" /> {item.callerPhone || 'N/A'}
                                            </div>
                                        </td>

                                        {/* 5. Action */}
                                        <td className="px-6 py-5 align-middle text-right">
                                            <button className="bg-green-50 text-[#08B36A] group-hover:bg-[#08B36A] group-hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm">
                                                Assign Now
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL WITH CHECKBOXES --- */}
            {isModalOpen && selectedCase && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">Dispatch Resources</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm"><FaTimes size={18}/></button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto">

                            {/* Case Summary Card */}
                            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 relative">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{selectedCase.caseNo}</p>
                                <h3 className="text-2xl font-black text-gray-800 mb-2">{selectedCase.fireType}</h3>
                                <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><FaMapMarkerAlt className="text-red-400"/> {selectedCase.address}</p>
                            </div>
                            
                            <div className="space-y-6">
                                {/* 1. Primary Station Dropdown */}
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase mb-3 block tracking-widest flex items-center gap-2">
                                        <FaBuilding className="text-green-600" /> Lead Fire Station (Primary)
                                    </label>
                                    <select 
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-5 font-bold text-gray-800 outline-none focus:border-green-500 transition-all"
                                        value={primaryStationId || ""}
                                        onChange={(e) => {
                                            const newId = e.target.value;
                                            setPrimaryStationId(newId);
                                            // Backup me se nikal do agar pehle se selected tha
                                            setSupportingStationIds(prev => prev.filter(id => id !== newId));
                                        }}
                                    >
                                        <option value="">-- Select Lead Station --</option>
                                        {availableStations.map(st => (
                                            <option key={st._id} value={st._id}>{st.stationName} ({st.operatingZone || 'Main Zone'})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 2. Remaining Stations as Checkboxes (Backup) */}
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 uppercase mb-4 block tracking-widest flex items-center gap-2">
                                        <FaExclamationCircle className="text-orange-500" /> Dispatch Backup (Optional)
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1 scrollbar-hide">
                                        {availableStations
                                            .filter(st => st._id !== primaryStationId) // Jo primary hai wo backup mein nahi dikhega
                                            .map(st => (
                                                <div 
                                                    key={st._id} 
                                                    onClick={() => toggleBackupStation(st._id)}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${supportingStationIds.includes(st._id) ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold ${supportingStationIds.includes(st._id) ? 'text-orange-700' : 'text-gray-700'}`}>{st.stationName}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{st.operatingZone || 'Area Zone'}</span>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${supportingStationIds.includes(st._id) ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}>
                                                        {supportingStationIds.includes(st._id) && <FaCheck className="text-white text-[10px]" />}
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        {availableStations.length <= 1 && (
                                            <p className="text-xs text-gray-400 italic col-span-2">No remaining stations available for backup.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                            <button 
                                onClick={handleAssign}
                                disabled={isAssigning || !primaryStationId}
                                className="bg-[#08B36A] hover:bg-green-700 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-green-100 disabled:opacity-50 transition-all active:scale-95"
                            >
                                {isAssigning ? <FaSpinner className="animate-spin" /> : <FaCheckCircle size={18} />}
                                {isAssigning ? "Processing..." : "Assign & Dispatch Now"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}