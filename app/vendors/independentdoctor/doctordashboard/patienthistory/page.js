'use client';
import React, { useState, useEffect } from 'react';
import { 
    User, MapPin, Phone, Calendar, 
    ClipboardList, Pill, CreditCard, X, 
    Loader2, ChevronRight, Info, Search,
    Activity, ShieldCheck, DollarSign,
    Users, Award, BarChart3, Video, HeartPulse,
    Clock, PhoneCall, FileText
} from 'lucide-react';
import DoctorAPI from '@/app/services/DoctorAPI';
import { toast, Toaster } from 'react-hot-toast';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const PatientHistoryPage = () => {
    // Tab States: 'Medical History' or 'Call Logs'
    const [activeTab, setActiveTab] = useState('Medical History');

    // Medical History States
    const [historyList, setHistoryList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Call History Logs States
    const [callHistory, setCallHistory] = useState([]);
    const [callLoading, setCallLoading] = useState(false);
    const [callSearchQuery, setCallSearchQuery] = useState('');

    useEffect(() => {
        fetchHistory();
        fetchCallLogs();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await DoctorAPI.getPatientHistory();
            if (res && res.success) {
                setHistoryList(res.data || []);
            }
        } catch (error) {
            console.error("Error fetching patient history:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCallLogs = async () => {
        try {
            setCallLoading(true);
            const res = await DoctorAPI.getDoctorCallHistory();
            if (res && res.success) {
                setCallHistory(res.data || []);
            }
        } catch (error) {
            console.error("Error fetching call history logs:", error);
        } finally {
            setCallLoading(false);
        }
    };

    const fetchDetails = async (id) => {
        try {
            setDetailLoading(true);
            setIsModalOpen(true);
            const res = await DoctorAPI.getPatientHistoryDetails(id);
            if (res && res.success) {
                setSelectedDetail(res.data);
            }
        } catch (error) {
            console.error("Error fetching patient medical details:", error);
            setIsModalOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    // Client-side quick filter for Medical History
    const filteredHistoryList = historyList.filter(item => 
        item.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.appointmentId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Client-side quick filter for Call Logs
    const filteredCallHistory = callHistory.filter(item =>
        item.patientName?.toLowerCase().includes(callSearchQuery.toLowerCase()) ||
        item.patientPhone?.toLowerCase().includes(callSearchQuery.toLowerCase()) ||
        item.callId?.toLowerCase().includes(callSearchQuery.toLowerCase())
    );

    // Dynamic Initial pendant colors for avatars
    const getAvatarInitials = (name) => {
        if (!name) return "P";
        const parts = name.split(' ');
        return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
    };

    // Defensive address cleaner
    const formatAddress = (addr) => {
        if (!addr) return "Not Provided";
        const cleaned = addr.replace(/undefined/g, '').replace(/,\s*,/g, ',').trim();
        const baseStripped = cleaned.replace(/^,|,$/g, '').trim();
        if (!baseStripped || baseStripped === "," || baseStripped === ", , ,") {
            return "Not Provided";
        }
        return baseStripped;
    };

    // Helper to format Call duration into readable layout
    const formatCallDuration = (seconds) => {
        if (!seconds || seconds <= 0) return "0 sec";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes === 0) return `${remainingSeconds} sec`;
        return `${minutes} min ${remainingSeconds} sec`;
    };

    // Safely append vital units if not already typed by doctor
    const formatVitalUnit = (val, unit) => {
        if (!val || val === "0" || val === "—") return "—";
        if (typeof val === 'string' && val.toLowerCase().includes(unit.toLowerCase())) return val;
        return `${val} ${unit}`;
    };

    // Concat host domain securely to prevent routing loops
    const getFullPdfUrl = (path) => {
        if (!path) return "#";
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        const cleanBaseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanBaseUrl}${cleanPath}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#f8fafc]/50">
                <div className="relative">
                    <Loader2 className="w-14 h-14 animate-spin text-[#08B36A]" />
                    <div className="absolute inset-0 scale-150 blur-3xl bg-[#08B36A]/20 -z-10 rounded-full"></div>
                </div>
                <p className="mt-4 text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">Synchronizing Patient Directory...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#f8fafc]/40 font-sans text-slate-800">
            <Toaster position="top-right" />
            
            {/* Header Info Block */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <HeartPulse className="text-[#08B36A]" /> Patient History Directory
                    </h1>
                    <p className="text-sm text-slate-500 font-semibold mt-1">Access past consultations, written medical summary folders, and clinic invoices.</p>
                </div>

                {/* Left Aligned search bar with explicit Search Button */}
                <div className="flex gap-2 w-full lg:max-w-md shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={activeTab === 'Medical History' ? "Lookup by name or booking ID..." : "Lookup by patient name or phone..."}
                            value={activeTab === 'Medical History' ? searchQuery : callSearchQuery}
                            onChange={(e) => {
                                if (activeTab === 'Medical History') {
                                    setSearchQuery(e.target.value);
                                } else {
                                    setCallSearchQuery(e.target.value);
                                }
                            }}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-green-50/50 focus:border-[#08B36A] transition-all shadow-sm"
                        />
                        {(activeTab === 'Medical History' ? searchQuery : callSearchQuery) && (
                            <button 
                                onClick={() => {
                                    if (activeTab === 'Medical History') {
                                        setSearchQuery('');
                                    } else {
                                        setCallSearchQuery('');
                                    }
                                }}
                                className="absolute right-4 top-3 text-[9px] bg-slate-100 hover:bg-slate-200 transition-colors px-2 py-1 rounded-md text-slate-500 font-black uppercase tracking-wider"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={() => {
                            toast.success("Filter lookup successfully completed.");
                        }}
                        className="px-6 bg-[#08B36A] hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-sm shadow-slate-100 flex items-center justify-center gap-1.5 shrink-0"
                    >
                        <Search className="w-3.5 h-3.5" /> Search
                    </button>
                </div>
            </div>

            {/* QUICK METRICS PANEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-green-50 border border-green-100 rounded-xl text-[#08B36A]">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Treated Base</span>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{historyList.length} Case File{historyList.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                        <Video className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Total Calling logs</span>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{callHistory.length} Call Entry{callHistory.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Active duty</span>
                        <p className="text-xl font-black text-slate-900 mt-0.5 font-sans">On Duty Verification</p>
                    </div>
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-slate-200 mb-6 gap-6">
                {['Medical History', 'Call Logs'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                            activeTab === tab 
                                ? 'border-[#08B36A] text-[#08B36A]' 
                                : 'border-transparent text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* MEDICAL HISTORY VIEW */}
            {activeTab === 'Medical History' && (
                historyList.length > 0 ? (
                    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in duration-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient Details</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Case Identifiers</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Consultation Format</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Registered Coordinates</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Clinical Folder</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredHistoryList.map((item) => (
                                        <tr 
                                            key={item.appointmentId}
                                            className="hover:bg-slate-50/50 transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-[#08B36A]"
                                            onClick={() => fetchDetails(item.appointmentId)}
                                        >
                                            {/* Column 1: Patient Details */}
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 text-[#08B36A] font-black text-xs uppercase tracking-tight group-hover:scale-105 transition-all">
                                                        {item.profileImage ? (
                                                            <img src={item.profileImage} alt={item.patientName} className="h-full w-full object-cover" />
                                                        ) : (
                                                            getAvatarInitials(item.patientName)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-sm text-slate-900 uppercase group-hover:text-[#08B36A] transition-colors leading-tight">
                                                            {item.patientName}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                            {item.gender && (
                                                                <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                                                                    {item.gender}
                                                                </span>
                                                            )}
                                                            {item.age && (
                                                                <span className="text-[9px] text-slate-400 font-extrabold uppercase">
                                                                    Age: {item.age} Yrs
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Column 2: Case Identifiers */}
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">ID: #{item.appointmentId || "N/A"}</p>
                                                    {item.phone && (
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 leading-none">
                                                            <Phone size={10} className="text-[#08B36A]" /> {item.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Column 3: Consultation Format */}
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                                        item.mode?.toLowerCase().includes('video') || item.consultationType?.toLowerCase().includes('video')
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : 'bg-emerald-50 text-[#08B36A]'
                                                    }`}>
                                                        {item.mode || item.consultationType || "General Care"}
                                                    </span>
                                                    {item.symptoms && (
                                                        <p className="text-[10px] text-slate-500 font-medium italic line-clamp-1 max-w-[150px]">
                                                            "{item.symptoms}"
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            
                                            {/* Column 4: Registered Coordinates */}
                                            <td className="px-8 py-6">
                                                <div className="flex items-center text-xs font-bold text-slate-600 max-w-xs">
                                                    <div className="p-2 bg-slate-50 rounded-xl mr-3 border border-slate-100 shrink-0 group-hover:bg-green-50 group-hover:border-green-100 transition-colors">
                                                        <MapPin size={13} className="text-slate-400 group-hover:text-[#08B36A] transition-colors" />
                                                    </div>
                                                    <span className="truncate">{formatAddress(item.location)}</span>
                                                </div>
                                            </td>

                                            {/* Column 5: Actions */}
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex justify-center">
                                                    <button className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-[#08B36A] bg-green-50 border border-green-100/50 hover:border-[#08B36A] rounded-xl shadow-sm transition-all active:scale-95">
                                                        Open Summary Folder
                                                        <ChevronRight size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-6 max-w-lg mx-auto shadow-sm">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ClipboardList className="text-slate-300 w-10 h-10" />
                        </div>
                        <h3 className="text-slate-800 font-black text-xs uppercase tracking-widest">Directory is empty</h3>
                        <p className="mt-1.5 text-slate-400 text-xs font-bold">You have not finalized or saved any consultation logs yet.</p>
                    </div>
                )
            )}

            {/* CALL HISTORY LOGS VIEW */}
            {activeTab === 'Call Logs' && (
                callHistory.length > 0 ? (
                    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in duration-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient Details</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Call Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Date & Timing</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredCallHistory.map((log) => {
                                        const statusColors = {
                                            completed: "bg-green-50 text-green-600 border border-green-100",
                                            missed: "bg-red-50 text-red-600 border border-red-100",
                                            rejected: "bg-amber-50 text-amber-600 border border-amber-100",
                                            accepted: "bg-blue-50 text-blue-600 border border-blue-100"
                                        };
                                        const currentStatusClass = statusColors[log.status?.toLowerCase()] || "bg-slate-50 text-slate-600 border border-slate-200";

                                        return (
                                            <tr key={log.callId} className="hover:bg-slate-50/50 transition-all border-l-4 border-l-transparent hover:border-l-[#08B36A]">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 text-[#08B36A] font-black text-xs uppercase tracking-tight">
                                                            {log.patientImage ? (
                                                                <img src={log.patientImage} alt={log.patientName} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                                                            ) : (
                                                                getAvatarInitials(log.patientName)
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-sm text-slate-900 uppercase leading-tight">
                                                                {log.patientName}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1 flex items-center gap-1">
                                                                <Phone size={10} /> {log.patientPhone || "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${currentStatusClass}`}>
                                                        {log.status || "—"}
                                                    </span>
                                                </td>

                                                <td className="px-8 py-6">
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-black text-slate-800">{log.timeFormatted || "—"}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{log.startedAt ? new Date(log.startedAt).toLocaleString() : "—"}</p>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-6 text-xs font-black text-slate-600 font-mono">
                                                    {formatCallDuration(log.duration)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-6 max-w-lg mx-auto shadow-sm">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-slate-300 w-10 h-10" />
                        </div>
                        <h3 className="text-slate-800 font-black text-xs uppercase tracking-widest">No call logs found</h3>
                        <p className="mt-1.5 text-slate-400 text-xs font-bold">No calling histories or telehealth tracking entries recorded.</p>
                    </div>
                )
            )}

            {/* Premium Detail Modal Block */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-0 md:p-4 bg-slate-955/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-100">
                    <div className="bg-white rounded-none md:rounded-[2.5rem] w-full max-w-3xl h-full md:h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-20 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#08B36A]/10 border border-green-100 rounded-2xl text-[#08B36A]">
                                    <Activity className="w-5 h-5 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Summary Details Folder</h2>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">EMR Synchronization Log</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {selectedDetail?.pdfUrl && !detailLoading && (
                                    <a 
                                        href={getFullPdfUrl(selectedDetail.pdfUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                                    >
                                        <FileText size={14} /> View Rx PDF
                                    </a>
                                )}
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-slate-100 rounded-full hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Scroll Content container */}
                        <div className="overflow-y-auto flex-1 bg-white p-6 md:p-8 space-y-8 min-h-0 [&::-webkit-scrollbar]:hidden">
                            {detailLoading ? (
                                <div className="py-24 flex flex-col items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-[#08B36A] w-8 h-8" />
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4">Assembling Case Record File...</p>
                                </div>
                            ) : selectedDetail && (
                                <div className="space-y-8 animate-in fade-in duration-200">
                                    
                                    {/* 1. Patient Profile Info card (Blood Group completely hidden) */}
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 bg-[#08B36A] rounded-full"></span>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#08B36A]">Demographic Details</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-100 shadow-inner">
                                            <div>
                                                <p className="text-[9px] uppercase font-black text-slate-400 mb-0.5">Full Name</p>
                                                <p className="text-sm font-black text-slate-900 uppercase">{selectedDetail.patientInfo?.name || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] uppercase font-black text-slate-400 mb-0.5">Age / Gender</p>
                                                <p className="text-xs font-black text-slate-700">{selectedDetail.patientInfo?.age || "N/A"} Yrs • {selectedDetail.patientInfo?.gender || "N/A"}</p>
                                            </div>
                                            
                                            <div className="col-span-full border-t border-slate-200/50 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-bold">
                                                    <Phone size={13} className="text-[#08B36A]" />
                                                    {selectedDetail.patientInfo?.phone || "N/A"}
                                                </div>
                                                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-bold">
                                                    <MapPin size={13} className="text-[#08B36A] shrink-0" />
                                                    <span className="truncate">{formatAddress(selectedDetail.patientInfo?.address)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 2. Captured Patient Vitals Parameters Panel */}
                                    {selectedDetail.consultationSummary?.vitals && (
                                        <section className="space-y-3 animate-in fade-in duration-200">
                                            <div className="flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 bg-[#08B36A] rounded-full"></span>
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#08B36A]">Captured Vitals Metrics</h3>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 border border-slate-100 p-4 rounded-[2rem] shadow-sm">
                                                <div className="text-center p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Blood Pressure</span>
                                                    <span className="text-xs font-black text-slate-800">{selectedDetail.consultationSummary.vitals.bp || "—"}</span>
                                                </div>
                                                <div className="text-center p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pulse Rate</span>
                                                    <span className="text-xs font-black text-slate-800">{formatVitalUnit(selectedDetail.consultationSummary.vitals.pulse, 'bpm')}</span>
                                                </div>
                                                <div className="text-center p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Temperature</span>
                                                    <span className="text-xs font-black text-slate-800">{formatVitalUnit(selectedDetail.consultationSummary.vitals.temp, '°F')}</span>
                                                </div>
                                                <div className="text-center p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Oxygen Sat.</span>
                                                    <span className="text-xs font-black text-slate-800">{formatVitalUnit(selectedDetail.consultationSummary.vitals.spo2, '%')}</span>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {/* 3. Diagnosis and Summary Notes */}
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 bg-orange-500 rounded-full"></span>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-600">Consultation Summary</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedDetail.consultationSummary?.diagnosis && Array.isArray(selectedDetail.consultationSummary.diagnosis) ? (
                                                    selectedDetail.consultationSummary.diagnosis.map((d, i) => (
                                                        <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-extrabold border border-orange-100 uppercase tracking-tight shadow-sm shadow-orange-50">
                                                            {d}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-extrabold border border-orange-100 uppercase tracking-tight shadow-sm shadow-orange-50">
                                                        {selectedDetail.consultationSummary?.diagnosis || "General Consultation"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                                                    <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Symptoms Reported</p>
                                                    <p className="text-xs text-slate-700 leading-relaxed font-bold">{selectedDetail.consultationSummary?.symptoms || "—"}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                                                    <p className="text-[9px] font-black text-[#08B36A] uppercase tracking-widest">Duration & Mode</p>
                                                    <p className="text-xs text-slate-700 leading-relaxed font-bold">
                                                        {selectedDetail.consultationSummary?.mode} • {selectedDetail.consultationSummary?.duration}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-[#08B36A]/5 p-4 rounded-2xl border border-[#08B36A]/10 relative overflow-hidden space-y-1">
                                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                                    <ShieldCheck size={40} className="text-[#08B36A]" />
                                                </div>
                                                <p className="text-[9px] font-black text-[#08B36A] uppercase tracking-widest">Doctor's Observation</p>
                                                <p className="text-xs text-slate-800 italic font-semibold leading-relaxed">
                                                    "{selectedDetail.consultationSummary?.doctorNotes || "No clinical observations saved."}"
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 4. Signed Prescription Document Section */}
                                    {selectedDetail.pdfUrl && (
                                        <section className="space-y-3 animate-in fade-in duration-200">
                                            <div className="flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 bg-[#08B36A] rounded-full"></span>
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#08B36A]">Signed Prescription Document</h3>
                                            </div>
                                            <div className="bg-[#08B36A]/5 border border-green-100/50 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs text-[#08B36A]">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">digital-rx-{selectedDetail.prescriptionId || "summary"}.pdf</p>
                                                        <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">Authorized Telehealth Prescription Slip</p>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={getFullPdfUrl(selectedDetail.pdfUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full sm:w-auto text-center px-5 py-3.5 bg-[#08B36A] hover:bg-green-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                                                >
                                                    Download / View Document
                                                </a>
                                            </div>
                                        </section>
                                    )}

                                    {/* 5. Prescription list details */}
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 bg-[#08B36A] rounded-full"></span>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#08B36A]">Active Prescriptions</h3>
                                        </div>
                                        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                            <table className="w-full text-xs text-left border-collapse font-sans">
                                                <thead className="bg-slate-50/70 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicine formulation</th>
                                                        <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Dosage pattern</th>
                                                        <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Duration</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {selectedDetail.prescription && selectedDetail.prescription.map((med, index) => (
                                                        <tr key={index} className="hover:bg-slate-50/20 transition-colors">
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="p-1.5 bg-[#08B36A]/10 rounded-lg text-[#08B36A]">
                                                                        <Pill size={13} />
                                                                    </div>
                                                                    <span className="font-extrabold text-slate-800 uppercase tracking-tight">{med.medicineName}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4 text-center">
                                                                <span className="px-3 py-1 bg-green-50 text-[#08B36A] rounded-lg text-[10px] font-black uppercase border border-green-100 shadow-sm shadow-green-50">
                                                                    {med.dosage || "As Directed"}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4 text-center font-black text-slate-500 uppercase tracking-wider">{med.duration || "—"}</td>
                                                        </tr>
                                                    ))}
                                                    {(!selectedDetail.prescription || selectedDetail.prescription.length === 0) && (
                                                        <tr>
                                                            <td colSpan={3} className="p-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                                                                No medicines written for this session
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    {/* 6. Invoice Account Sheet */}
                                    <section className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
                                        <div className="absolute top-[-30%] right-[-10%] w-72 h-72 bg-[#08B36A] rounded-full blur-[110px] opacity-15"></div>
                                        
                                        <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-5">
                                            <div>
                                                <h3 className="text-base font-black uppercase tracking-tight">Payment Receipt</h3>
                                                <p className="text-slate-400 text-[9px] mt-1 font-bold uppercase tracking-widest">Electronic Account Summary</p>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                <span className="px-3 py-1 bg-[#08B36A]/20 text-[#08B36A] text-[9px] rounded-full font-black border border-[#08B36A]/30 uppercase tracking-widest">
                                                    Paid via {selectedDetail.paymentDetails?.paymentMode || "UPI"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3.5 relative z-10">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-slate-400">Consultation Base Fee</span>
                                                <span className="font-mono font-bold">₹{selectedDetail.paymentDetails?.consultationFee ? selectedDetail.paymentDetails.consultationFee.toLocaleString() : "0"}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-slate-400">Platform Convenience Charges</span>
                                                <span className="font-mono font-bold">₹{selectedDetail.paymentDetails?.platformFee ? selectedDetail.paymentDetails.platformFee.toLocaleString() : "0"}</span>
                                            </div>
                                            <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Total Amount Collected</p>
                                                    <p className="text-2xl font-black text-white tracking-tight mt-0.5">
                                                        ₹{selectedDetail.paymentDetails?.totalPaid ? selectedDetail.paymentDetails.totalPaid.toLocaleString() : "0"}
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[#08B36A]">
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                    
                                </div>
                            )}
                        </div>
                        
                        {/* Footer Overlay close actions */}
                        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50 shrink-0">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
                            >
                                Close Records
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientHistoryPage;