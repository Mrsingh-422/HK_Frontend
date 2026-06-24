'use client'
import React, { useState, useEffect } from 'react';
import {
    FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaClipboardList,
    FaInfoCircle, FaTimes, FaRegClock, FaPauseCircle,
    FaUser, FaPhoneAlt, FaBuilding, FaFire, FaSpinner, FaExchangeAlt
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import FireHeadAPI from '@/app/services/FireHeadAPI';

export default function PendingCasesPage() {
    const [cases, setCases] = useState([]);
    const [stations, setStations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [isReassignMode, setIsReassignMode] = useState(false);
    const [targetStationId, setTargetStationId] = useState('');
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [casesRes, stationsRes] = await Promise.all([
                FireHeadAPI.getCases('Pending'),
                FireHeadAPI.getAllFireStations()
            ]);
            if (casesRes.success) setCases(casesRes.data);
            if (stationsRes.success) setStations(stationsRes.data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleReassignSubmit = async () => {
        if (!targetStationId) return toast.error("Please select a station");
        setIsSubmitLoading(true);
        try {
            const res = await FireHeadAPI.reassignCase({
                caseId: selectedCase._id,
                newStationId: targetStationId
            });
            if (res.success) {
                toast.success("Case reassigned successfully!");
                setIsModalOpen(false);
                setIsReassignMode(false);
                fetchData();
            }
        } catch (error) { toast.error("Failed to reassign"); }
        finally { setIsSubmitLoading(false); }
    };

    const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

    const filteredCases = cases.filter(c => {
        const matchesTab = activeTab === 'All' || c.status === activeTab;
        const search = searchTerm.toLowerCase();
        return matchesTab && (c.caseNo?.toLowerCase().includes(search) || c.address?.toLowerCase().includes(search));
    });

    return (
        <div className="max-w-7xl mx-auto pb-10 animate-in fade-in duration-500">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">PENDING CASES</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Review and manage active deployments</p>
                </div>
                <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
                    {['All', 'On Hold'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#08B36A] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{tab === 'All' ? 'All Cases' : tab}</button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                    placeholder="Search by Case ID or Location..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 ring-emerald-500/5 font-bold text-sm"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* SIMPLE TABLE (Exactly like your first screenshot) */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-slate-100 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                                <th className="px-10 py-6">Case Info</th>
                                <th className="px-10 py-6">Incident Details</th>
                                <th className="px-10 py-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan="3" className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-widest">Loading Records...</td></tr>
                            ) : filteredCases.map((item) => (
                                <tr key={item._id} onClick={() => { setSelectedCase(item); setIsModalOpen(true); setIsReassignMode(false); }} className="hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                    <td className="px-10 py-7">
                                        <p className="font-black text-slate-800 text-sm">{item.caseNo}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{formatDate(item.reportedAt)}</p>
                                    </td>
                                    <td className="px-10 py-7">
                                        <p className="text-sm font-bold text-slate-600 truncate max-w-md uppercase tracking-tight">{item.address}</p>
                                        <p className="text-[10px] font-black text-[#08B36A] mt-1 uppercase flex items-center gap-2"><FaFire /> {item.fireType || 'General Fire'}</p>
                                    </td>
                                    <td className="px-10 py-7 text-right">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'Pending' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{item.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🌟 FULL INFO MODAL WITH REASSIGN ACTION 🌟 */}
            {isModalOpen && selectedCase && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">

                        {/* Header */}
                        <div className="px-10 py-10 bg-slate-900 text-white flex justify-between items-start relative overflow-hidden">
                            <div className="z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-[#08B36A] rounded-2xl shadow-lg"><FaClipboardList size={22} /></div>
                                    <span className="px-4 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Emergency Dossier</span>
                                </div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter">{selectedCase.caseNo}</h3>
                                <p className="text-emerald-400 text-xs font-bold mt-2 uppercase tracking-[0.3em]">Reported: {formatDate(selectedCase.reportedAt)}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><FaTimes /></button>
                            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#08B36A] rounded-full blur-[120px] opacity-20"></div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaMapMarkerAlt /> Incident Location</p>
                                    <p className="text-sm font-black text-slate-800 uppercase leading-relaxed">{selectedCase.address}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Caller Name</p>
                                        <p className="text-sm font-bold text-slate-700 uppercase truncate">{selectedCase.callerName || 'Anonymous'}</p>
                                    </div>
                                    <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedCase.callerPhone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
                                    <FaBuilding className="text-[#08B36A]" />
                                    <div>
                                        <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Currently At</p>
                                        <p className="text-sm font-black text-slate-800 uppercase">{selectedCase.stationId?.stationName || 'Dispatch Center'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 h-full">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Situation Report</p>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed italic">"{selectedCase.description || 'No additional notes provided by dispatch.'}"</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - REASSIGN LOGIC INSTEAD OF CLOSE */}
                        <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
                            {!isReassignMode ? (
                                <div className="flex justify-between items-center w-full">
                                    <button onClick={() => setIsModalOpen(false)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Discard Overview</button>
                                    <button
                                        onClick={() => setIsReassignMode(true)}
                                        className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-[0.2em] flex items-center gap-3"
                                    >
                                        <FaExchangeAlt /> Reassign Case
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-4 animate-in slide-in-from-bottom-4">
                                    <select
                                        value={targetStationId} onChange={(e) => setTargetStationId(e.target.value)}
                                        className="flex-1 p-4 bg-white border-2 border-[#08B36A]/20 rounded-2xl outline-none focus:border-[#08B36A] font-bold text-xs uppercase text-slate-700"
                                    >
                                        <option value="">Choose Target Station...</option>
                                        {stations.filter(s => s._id !== selectedCase.stationId?._id).map(s => <option key={s._id} value={s._id}>{s.stationName}</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                        <button onClick={handleReassignSubmit} disabled={isSubmitLoading} className="px-8 py-4 bg-[#08B36A] text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">{isSubmitLoading ? 'Syncing...' : 'Transfer Unit'}</button>
                                        <button onClick={() => setIsReassignMode(false)} className="px-6 py-4 bg-white border border-slate-200 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
