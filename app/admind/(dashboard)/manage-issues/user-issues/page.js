'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    FaSearch, FaArrowLeft, FaExclamationCircle,
    FaChevronLeft, FaChevronRight, FaRegEnvelope, FaPhoneAlt, FaUserCircle,
    FaTimes, FaCheckCircle, FaHistory, FaUserShield
} from 'react-icons/fa'
import { MdOutlineErrorOutline, MdOutlineFactCheck } from "react-icons/md";

export default function ManageUserIssues() {
    const router = useRouter();

    // ==========================================
    // 🌟 STATES
    // ==========================================
    const [userIssues, setUserIssues] = useState([
        { id: 1, username: null, issue: "Booking Hospital bed issue.", details: "User unable to select specific ward during the final payment step. Browser console shows 404 on ward-api.", email: "foqakiku.q.ab.47.0@gmail.com", phone: null, status: "Critical", date: "2023-10-24 10:30 AM", solvedBy: null },
        { id: 2, username: "Khanday", issue: "Locker Sync Error", details: "Health locker not updating after upload. Files appear in list but won't open.", email: "khanday@provider.com", phone: "+91 9876543210", status: "Pending", date: "2023-10-25 11:15 AM", solvedBy: null },
        { id: 3, username: "Rahul", issue: "Payment Failed", details: "Money deducted via UPI but appointment not confirmed in the app dashboard.", email: "rahul@example.com", phone: "9876543210", status: "Critical", date: "2023-10-26 09:45 AM", solvedBy: null },
        { id: 4, username: "Amit", issue: "App crashing", details: "App crashes on login screen specifically for iOS 17 users using face ID.", email: "amit.kumar@gmail.com", phone: "7894561230", status: "Resolved", date: "2023-10-22 08:20 PM", solvedBy: "Admin_Sarah" },
    ]);

    const [selectedIssue, setSelectedIssue] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // ==========================================
    // 🌟 HANDLERS
    // ==========================================
    const handleResolve = (id) => {
        const adminName = "Super_Admin"; // Usually from Auth Context
        setUserIssues(prev => prev.map(item =>
            item.id === id ? { ...item, status: "Resolved", solvedBy: adminName } : item
        ));
        setSelectedIssue(null); // Close modal
    };

    const filteredIssues = userIssues.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (item.username?.toLowerCase().includes(searchLower)) ||
            (item.issue?.toLowerCase().includes(searchLower)) ||
            (item.email?.toLowerCase().includes(searchLower))
        );
    });

    const totalPages = Math.ceil(filteredIssues.length / entriesPerPage);
    const currentItems = filteredIssues.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 font-sans text-slate-900">

            {/* --- TOP HEADER --- */}
            <div className="max-w-[1400px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-emerald-600">
                        <FaExclamationCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Support Tickets</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">User Support</h1>
                    <p className="text-slate-400 font-medium">Monitoring and resolving user-reported platform bottlenecks.</p>
                </div>

                <button onClick={() => router.back()} className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm active:scale-95">
                    <FaArrowLeft /> Go Back
                </button>
            </div>

            {/* --- MAIN TABLE --- */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50">
                    <div className="relative w-full md:w-[400px]">
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by email, issue or name..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/10 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Total: {filteredIssues.length} Entries</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <th className="px-10 py-6">User Identity</th>
                                <th className="px-10 py-6">Incident Summary</th>
                                <th className="px-10 py-6 text-center">Status</th>
                                <th className="px-10 py-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentItems.map((item) => (
                                <tr key={item.id} className="group hover:bg-slate-50/30 transition-all">
                                    <td className="px-10 py-7">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${item.username ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {item.username ? item.username.charAt(0) : <FaUserCircle />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{item.username || 'Anonymous User'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.email || 'No email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7 max-w-xs">
                                        <p className="text-[14px] font-black text-slate-700 leading-snug truncate">{item.issue}</p>
                                        <p className="text-[11px] text-slate-400 mt-1 font-medium italic">{item.date}</p>
                                    </td>
                                    <td className="px-10 py-7 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border 
                                            ${item.status === 'Critical' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-7 text-right">
                                        <button
                                            onClick={() => setSelectedIssue(item)}
                                            className="h-10 px-5 bg-slate-900 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- REVIEW MODAL --- */}
            {selectedIssue && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedIssue(null)}></div>

                    <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Incident Report</span>
                                <h3 className="text-xl font-black tracking-tight mt-1">Ticket #TIC-{selectedIssue.id + 5000}</h3>
                            </div>
                            <button onClick={() => setSelectedIssue(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 text-xl shadow-sm">
                                    <FaUserCircle />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">{selectedIssue.username || 'Anonymous User'}</p>
                                    <p className="text-xs font-medium text-slate-400">{selectedIssue.email}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">Issue Title</label>
                                <p className="text-lg font-black text-slate-800 leading-tight">{selectedIssue.issue}</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">Full Description</label>
                                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl italic text-slate-600 text-sm leading-relaxed">
                                    "{selectedIssue.details}"
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">Reported On</label>
                                    <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><FaHistory /> {selectedIssue.date}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">Contact</label>
                                    <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><FaPhoneAlt /> {selectedIssue.phone || 'N/A'}</p>
                                </div>
                            </div>

                            {selectedIssue.status === "Resolved" && (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                    <FaCheckCircle className="text-emerald-600" />
                                    <div>
                                        <p className="text-xs font-black text-emerald-800 uppercase tracking-tight">Issue Resolved</p>
                                        <p className="text-[11px] font-bold text-emerald-600">Action taken by {selectedIssue.solvedBy}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-slate-50 border-t border-slate-100">
                            {selectedIssue.status !== "Resolved" ? (
                                <button
                                    onClick={() => handleResolve(selectedIssue.id)}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <MdOutlineFactCheck size={18} /> Mark as Resolved
                                </button>
                            ) : (
                                <button
                                    onClick={() => setSelectedIssue(null)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
                                >
                                    Close Record
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}